from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import analyze

# Load environment variables from .env file
load_dotenv()

# This file exists to act as the primary ASGI entry point for our server,
# tying together our routers, middlewares, and global configurations.
app = FastAPI(
    title="AI GitHub Analyzer API",
    version="1.0.0"
)

# Setup CORS middleware to allow our frontend to communicate with the API
allowed_origins = [
    "https://ai-github-analyzer.vercel.app",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Mount the analysis endpoints under the /api namespace
app.include_router(analyze.router, prefix="/api")

@app.get("/")
def root():
    """
    Root endpoint to confirm the API is online and point developers to the Swagger UI.
    @returns A basic status dictionary
    """
    return {
        "message": "AI GitHub Analyzer API",
        "docs": "/docs"
    }

@app.get("/og/{username}", response_class=HTMLResponse)
async def get_og_tags(username: str):
    """
    Open Graph dynamic endpoint for social sharing.
    Generates an HTML page with meta tags that redirects to the real frontend result page.
    """
    from routers.analyze import cache_service
    
    # Try to fetch cached analysis data (defaulting to normal professional mode)
    data = cache_service.get(username)
    
    # Default fallback values
    name = username
    top_role_label = "Developer"
    score = 100
    
    if data:
        # data is typically a FullAnalysisResponse Pydantic model
        name = getattr(data, "name", username) or username
        role_fit = getattr(data, "role_fit", None)
        
        if role_fit:
            if isinstance(role_fit, dict):
                top_role_label = role_fit.get("top_role_label", "Developer")
                top_role_key = role_fit.get("top_role", "")
                scores = role_fit.get("scores", {})
            else:
                top_role_label = getattr(role_fit, "top_role_label", "Developer")
                top_role_key = getattr(role_fit, "top_role", "")
                scores = getattr(role_fit, "scores", {})
            
            if isinstance(scores, dict):
                score = scores.get(top_role_key, 100)
            else:
                score = getattr(scores, top_role_key, 100)

    html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta property="og:title" content="{name}'s GitHub Analysis" />
    <meta property="og:description" content="Top role: {top_role_label} — {score}%. Analyzed by AI GitHub Analyzer" />
    <meta property="og:image" content="https://opengraph.githubassets.com/1/{username}" />
    <meta property="og:url" content="https://ai-github-analyzer.vercel.app/results/{username}" />
    <meta name="twitter:card" content="summary_large_image">
    
    <!-- Redirect users to the actual frontend page -->
    <meta http-equiv="refresh" content="0; url=https://ai-github-analyzer.vercel.app/results/{username}" />
</head>
<body style="background: #0a0a0f; color: white; text-align: center; font-family: sans-serif; padding-top: 50px;">
    <p>Redirecting to analysis...</p>
    <script>
        window.location.href = "https://ai-github-analyzer.vercel.app/results/{username}";
    </script>
</body>
</html>'''

    return HTMLResponse(content=html_content)
