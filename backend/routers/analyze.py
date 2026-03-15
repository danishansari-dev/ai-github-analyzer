from fastapi import APIRouter, HTTPException, Response, Query
from fastapi.responses import JSONResponse
from typing import Dict, Any
import asyncio
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

        # 3. Call github_service.get_user_repos(username)
        repos = await asyncio.to_thread(github_svc.get_user_repos, username)
        print(f"[analyze] Repos fetched: {len(repos)} repos")

        # 4. Call github_service.get_top_repos_with_readme(username)
        repos_with_readmes = await asyncio.to_thread(github_svc.get_top_repos_with_readme, username)
        print(f"[analyze] READMEs fetched for top repos")

        # 5. Call github_service.get_language_breakdown(username)
        language_breakdown = await asyncio.to_thread(github_svc.get_language_breakdown, username)
        print(f"[analyze] Language breakdown complete")

        # 5b. Fetch GitHub achievement badges
        badges = await asyncio.to_thread(github_svc.get_user_badges, username)
        print(f"[analyze] Badges fetched: {len(badges)} unlocked")

        # 5c. Fetch README skills
        readme_skills = await asyncio.to_thread(github_svc.get_readme_skills, username)
        print(f"[analyze] README skills fetched: {len(readme_skills)} found")

        # 5d. Fetch social links from GitHub profile
        # Use g.get_user(username) to get the PyGithub user object required by get_social_links
        github_user_obj = await asyncio.to_thread(github_svc.g.get_user, username)
        social_links = await asyncio.to_thread(github_svc.get_social_links, github_user_obj)
        
        # 5e. Extract all social links and contact info from public README
        readme_contact = await asyncio.to_thread(github_svc.get_readme_contact_info, username)
        
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
        top_repos = []
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
        if readme_skills:
            current_stack = llm_result.get('stack', {})
            primary_stack = current_stack.get('primary_stack', [])
            
            # Deduplicate and merge
            for skill in readme_skills:
                if skill not in primary_stack:
                    primary_stack.append(skill)
            
            current_stack['primary_stack'] = primary_stack
            llm_result['stack'] = current_stack

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

        raise HTTPException(status_code=500, detail=str(e))
