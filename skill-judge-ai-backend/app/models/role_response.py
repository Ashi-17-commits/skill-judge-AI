from typing import List

from pydantic import BaseModel, Field


class NonNegotiableItem(BaseModel):
    skill: str
    status: str
    reason: str


class RoleReadinessResponse(BaseModel):
    """Response for role analysis. All list fields are never null; use [] if empty."""

    target_role: str = ""
    readiness_score: int = Field(..., ge=0, le=100)
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    non_negotiable: List[NonNegotiableItem] = Field(default_factory=list)
    priority_skills: List[str] = Field(default_factory=list)
    verdict: str = ""
    experience_gap: str = ""
    explanation: str = ""
