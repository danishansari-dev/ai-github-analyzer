from fastapi import APIRouter, HTTPException, Response, Query
from fastapi.responses import JSONResponse
from typing import Dict, Any, List
import asyncio
import re
import traceback
from datetime import datetime, timezone

from services.github_service import GitHubService
from services.llm_service import LLMService
from services.cache_service import CacheService
from models.schemas import FullAnalysisResponse, ErrorResponse

# We decouple routes from main.py so the codebase scales cleanly as more domains are added
router = APIRouter()

# Lazy service initialization — avoids crashing the entire server at import time
# if a service has a config issue (e.g. missing GROQ_API_KEY)
github_service = None
llm_service = None
cache_service = CacheService()  # Cache has no external deps, safe to init eagerly

def _get_services():
    """Initialize services on first request, not at import time."""
    global github_service, llm_service
    if github_service is None:
        github_service = GitHubService()
    if llm_service is None:
        llm_service = LLMService()
    return github_service, llm_service

@router.get("/health")
async def health_check():
    """
    Simple health check endpoint to ping the server.
    @returns JSON status indicating 'ok'
    """
    return {"status": "ok"}


@router.get("/debug/github")
async def debug_github():
    """Temporary diagnostic: verify anonymous GitHub API access from this runtime."""
    import os
    import requests as req

    token = os.getenv("GITHUB_TOKEN")
    token_state = "missing" if not token else f"set(len={len(token.strip())})"
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "ai-github-analyzer"}
    if token and token.strip():
        headers["Authorization"] = f"Bearer {token.strip()}"
    try:
        r = req.get("https://api.github.com/users/octocat", headers=headers, timeout=10)
        return {
            "token": token_state,
            "status_code": r.status_code,
            "login": (r.json() or {}).get("login") if r.ok else None,
            "message": None if r.ok else r.text[:200],
            "rate_remaining": r.headers.get("X-RateLimit-Remaining"),
        }
    except Exception as e:
        return {"token": token_state, "error": f"{type(e).__name__}: {e}"}


@router.get("/debug/groq")
async def debug_groq():
    """Temporary diagnostic: verify Groq API key works from this runtime."""
    import os
    from groq import Groq

    raw = os.getenv("GROQ_API_KEY")
    key = raw.strip() if raw else None
    if not key:
        return {"groq": "missing"}
    try:
        client = Groq(api_key=key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Reply with exactly: ok"}],
            max_tokens=5,
        )
        text = completion.choices[0].message.content if completion.choices else ""
        return {"groq": "ok", "reply": (text or "")[:40]}
    except Exception as e:
        safe = re.sub(r"(gsk_|ghp_)[A-Za-z0-9_]+", "[REDACTED]", str(e))
        return {"groq": "error", "error": f"{type(e).__name__}: {safe[:240]}"}

@router.get("/stats")
async def get_stats():
    """
    Returns the total number of profiles analyzed and total visitors.
    Used by the home page to display live counters.
    @returns JSON object with total_analyzed and total_visitors counts
    """
    return {
        "total_analyzed": cache_service.get_count(),
        "total_visitors": cache_service.get_visitor_count()
    }

@router.post("/track-visit")
async def track_visit():
    """
    Increments the unique visitor counter.
    Called once per frontend session from App.jsx.
    """
    cache_service.increment_visitor()
    return {"status": "ok"}

@router.get("/analyze/{username}", response_model=FullAnalysisResponse)
async def analyze_user(username: str, response: Response, mode: str = Query("normal", description="Analysis mode: 'normal' or 'roast'")):
    """
    Analyzes a GitHub user's profile, fetching their repos and returning a comprehensive LLM-powered summary.
    @param username - GitHub handle to analyze
    @param response - FastAPI Response object to mutate headers
    @param mode - 'normal' for professional analysis, 'roast' for comedy roast mode
    @returns FullAnalysisResponse containing LLM analysis
    """
    # Roast mode uses a separate cache key so normal and roast results don't collide
    is_roast = mode == "roast"
    cache_key = f"{username}:roast" if is_roast else username

    # 1. Check cache first
    cached_result = cache_service.get(cache_key)
    if cached_result:
        # We append a custom header so the frontend can display a 'served from cache' indicator
        response.headers["X-Cache"] = "HIT"
        return cached_result

    try:
        github_svc, llm_svc = _get_services()
        print(f"[analyze] Starting analysis for '{username}' (mode={mode})...")

        # 2. Call github_service.get_user_profile(username)
        try:
            profile = await asyncio.to_thread(github_svc.get_user_profile, username)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

        print(f"[analyze] Profile fetched for '{username}'")

        # 3. Fetch repositories, badges, GitHub user object, and profile README in parallel
        # Why it exists: Running these remote network calls concurrently saves about 20-30 seconds of response latency.
        repos, badges, github_user_obj, profile_readme = await asyncio.gather(
            asyncio.to_thread(github_svc.get_user_repos, username),
            asyncio.to_thread(github_svc.get_user_badges, username),
            asyncio.to_thread(github_svc.g.get_user, username),
            asyncio.to_thread(github_svc.get_profile_readme, username)
        )
        print(f"[analyze] Repos, badges, user object, and profile README fetched concurrently")

        # 4. Fetch READMEs for top repos, passing the pre-fetched repos list to prevent duplicate fetch traffic
        repos_with_readmes = await asyncio.to_thread(github_svc.get_top_repos_with_readme, username, repos)
        print(f"[analyze] READMEs fetched for top repos")

        # 5. Extract skills and contact/social links from the pre-fetched profile README.
        # Tricky logic: Since the README is already downloaded in profile_readme, we parse it synchronously in-memory
        # to avoid making another set of HTTP requests.
        readme_skills = github_svc.get_readme_skills(username, profile_readme)
        print(f"[analyze] README skills extracted: {len(readme_skills)} found")

        readme_contact = github_svc.get_readme_contact_info(username, profile_readme)
        
        # 6. Fetch social links from the GitHub API using the pre-fetched user object
        social_links = await asyncio.to_thread(github_svc.get_social_links, github_user_obj)
        
        print(f"[analyze] README contact keys found: {list(readme_contact.keys())}")

        # Merge phone
        if readme_contact.get('phone'):
            import re
            cleaned = re.sub(r'[^+\d]', '', readme_contact['phone'])
            social_links['phone'] = f"https://wa.me/{cleaned}"
            social_links['phone_display'] = readme_contact['phone'].strip()

        # Merge email only if not already present from GitHub profile
        if readme_contact.get('readme_email') and not social_links.get('email'):
            social_links['email'] = f"mailto:{readme_contact['readme_email']}"

        # Merge all other social links found in README
        # These keys map to display labels in the frontend
        readme_social_keys = [
            'linkedin', 'twitter', 'leetcode', 'kaggle',
            'codeforces', 'codechef', 'hackerrank', 'stackoverflow',
            'devto', 'medium', 'hashnode', 'youtube', 'instagram',
            'discord', 'telegram', 'portfolio'
        ]
        for key in readme_social_keys:
            if readme_contact.get(key) and not social_links.get(key):
                social_links[key] = readme_contact[key]

        print(f"[analyze] Social links fetched: {len(social_links)} found (including README contact)")

        # 6. Run LLM call — combined analysis in one prompt
        print(f"[analyze] Starting combined LLM analysis...")

        llm_result = await asyncio.to_thread(
            llm_svc.analyze_all, 
            profile, 
            repos, 
            repos_with_readmes,
            is_roast
        )

        print(f"[analyze] Combined LLM call complete for '{username}'")

        # 7. Build top_repos list (top 5 by stars, already sorted from github_service)
        top_repos: List[Dict[str, Any]] = []
        if isinstance(repos, list):
            for r in repos[:5]:
                top_repos.append({
                    "name": r.get("name", ""),
                    "description": r.get("description"),
                    "language": r.get("language"),
                    "stars": r.get("stargazers_count", 0),
                    "total_commits": r.get("total_commits", 0),
                    "html_url": r.get("html_url", ""),
                })

        # 8. Build FullAnalysisResponse object
        role_fit = llm_result.get('role_fit', {})
        
        # Normalization: Groq often returns scores flattened instead of nested.
        # We ensure they are nested under the 'scores' key to match the Pydantic schema.
        _meta_keys = {"top_role", "top_role_label", "reasoning", "top_3_roles", "summary"}
        if role_fit and "scores" not in role_fit:
            scores = {
                k: v for k, v in role_fit.items()
                if k not in _meta_keys and isinstance(v, (int, float))
            }
            role_fit = {
                "scores": scores,
                "top_role": role_fit.get("top_role", ""),
                "top_role_label": role_fit.get("top_role_label", ""),
                "reasoning": role_fit.get("reasoning", ""),
                "top_3_roles": role_fit.get("top_3_roles", []),
            }

        # 8b. Merge README skills into primary stack
        if readme_skills and isinstance(readme_skills, list):
            current_stack = llm_result.get('stack', {})
            primary_stack = current_stack.get('primary_stack', [])
            
            # Case-insensitive dedup merge
            existing_lower = {str(s).lower() for s in primary_stack}
            for skill in readme_skills:
                if isinstance(skill, str) and skill.lower() not in existing_lower:
                    primary_stack.append(skill)
                    existing_lower.add(skill.lower())
            
            current_stack['primary_stack'] = primary_stack
            llm_result['stack'] = current_stack
            print(f"[analyze] Final primary_stack has {len(primary_stack)} items: {primary_stack}")

        analysis_response = FullAnalysisResponse(
            username=username,
            avatar_url=profile.get('avatar_url', ''),
            name=profile.get('name', username),
            profile_url=profile.get('html_url', ''),
            followers=profile.get('followers', 0),
            following=profile.get('following', 0),
            public_repos=profile.get('public_repos', 0),
            overall_score=llm_result.get('overall_score', 0),
            stack=llm_result.get('stack'),
            role_fit=role_fit,
            resume_bullets=llm_result.get('resume_bullets'),
            top_repos=top_repos,
            badges=badges,
            social_links=social_links,
            analyzed_at=datetime.now(timezone.utc),
            github_user_id=profile.get('github_user_id')
        )

        # 9. Store in cache and increment analysis counter
        cache_service.set(cache_key, analysis_response)
        cache_service.increment_count()

        print(f"[analyze] Analysis complete for '{username}', returning response")

        # 10. Return the response
        return analysis_response

    except HTTPException:
        # Re-raise known HTTP errors (404, etc.) — these already have proper status codes
        raise
    except Exception as e:
        # Full stack trace printed to terminal so the exact crashing line is visible
        traceback.print_exc()
        error_msg = str(e).lower()
        if "rate limit" in error_msg:
            raise HTTPException(status_code=429, detail="API rate limit exceeded. Please try again in 1 hour.")

        # Return exception type for diagnosis (never include raw auth material)
        safe = re.sub(r"(ghp_|gsk_|github_pat_)[A-Za-z0-9_]+", "[REDACTED]", str(e))
        print(f"[analyze] Unexpected error for '{username}': {type(e).__name__}: {safe}")
        raise HTTPException(
            status_code=500,
            detail=f"{type(e).__name__}: {safe[:240]}",
        )
