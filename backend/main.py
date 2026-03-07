from fastapi import FastAPI
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict this in production
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
