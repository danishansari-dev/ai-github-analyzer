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

        # 2b. Star gating — require the user to star our repo before analysis
        has_starred = await asyncio.to_thread(
            github_svc.has_starred_repo, username,
            "danishansari-dev", "ai-github-analyzer"
        )
        if not has_starred:
            return JSONResponse(
                status_code=403,
                content={
                    "error": "star_required",
                    "message": "Please star the repo to unlock your analysis"
                }
            )

        # 3. Call github_service.get_user_repos(username)
        repos = await asyncio.to_thread(github_svc.get_user_repos, username)
        print(f"[analyze] Repos fetched: {len(repos)} repos")

        # 4. Call github_service.get_top_repos_with_readme(username)
        repos_with_readmes = await asyncio.to_thread(github_svc.get_top_repos_with_readme, username)
        print(f"[analyze] READMEs fetched for top repos")

        # 5. Call github_service.get_language_breakdown(username)
        language_breakdown = await asyncio.to_thread(github_svc.get_language_breakdown, username)
        print(f"[analyze] Language breakdown complete")

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
        if role_fit and "scores" not in role_fit:
            role_fit = {
                "scores": {
                    "ml_engineer": role_fit.get("ml_engineer", 0),
                    "backend_developer": role_fit.get("backend_developer", 0),
                    "frontend_developer": role_fit.get("frontend_developer", 0),
                    "mlops_engineer": role_fit.get("mlops_engineer", 0),
                    "full_stack_developer": role_fit.get("full_stack_developer", 0),
                },
                "top_role": role_fit.get("top_role", ""),
                "top_role_label": role_fit.get("top_role_label", ""),
                "reasoning": role_fit.get("reasoning", "")
            }

        analysis_response = FullAnalysisResponse(
            username=username,
            avatar_url=profile.get('avatar_url', ''),
            name=profile.get('name', username),
            profile_url=profile.get('html_url', ''),
            overall_score=llm_result.get('overall_score', 0),
            stack=llm_result.get('stack'),
            role_fit=role_fit,
            resume_bullets=llm_result.get('resume_bullets'),
            top_repos=top_repos,
            analyzed_at=datetime.now(timezone.utc)
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
