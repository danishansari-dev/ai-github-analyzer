from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# These schemas exist to enforce a strict type contract between our backend 
# and frontend. By serializing Claude's dynamic JSON outputs into these models, 
# we prevent hallucinated keys or missing fields from breaking the React UI.

class RepoInfo(BaseModel):
    name: str
    description: Optional[str] = None
    language: Optional[str] = None
    stars: int
    url: str

class StackAnalysis(BaseModel):
    primary_stack: List[str]
    domains: List[str]
    profile_summary: str
    strengths: List[str]
    gaps: List[str]

class RoleScores(BaseModel):
    # Tricky logic: These fields mirror the exact keys expected by the LLM prompt.
    # Currently, they are hardcoded, but if we change the prompt options, 
    # we must change these fields simultaneously or Pydantic validation will fail.
    # TODO: Refactor to allow dynamic role ingestion based on user selection.
    ml_engineer: int
    backend_developer: int
    frontend_developer: int
    mlops_engineer: int
    full_stack_developer: int

class RoleFitAnalysis(BaseModel):
    scores: RoleScores
    top_role: str
    top_role_label: str
    reasoning: str

class ResumeBulletProject(BaseModel):
    project_name: str
    repo_url: str
    bullets: List[str]

class FullAnalysisResponse(BaseModel):
    # This acts as the aggregate payload payload for the analysis.
    # It exists so the front-end can perform a single HTTP GET request
    # and receive the fully populated dashboard state simultaneously.
    username: str
    avatar_url: str
    name: Optional[str] = None
    profile_url: str
    stack: StackAnalysis
    role_fit: RoleFitAnalysis
    resume_bullets: List[ResumeBulletProject]
    analyzed_at: datetime

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
