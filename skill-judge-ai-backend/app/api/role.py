from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.models.role_response import RoleReadinessResponse
from app.services.role_definitions import get_role_definition
from app.services.role_engine import evaluate_role_readiness
from app.services.resume_store import get as resume_get


class RoleAnalyzeRequest(BaseModel):
    resume_id: str
    role: str


router = APIRouter(prefix="/role", tags=["Role"])


@router.post("/analyze", response_model=RoleReadinessResponse, status_code=status.HTTP_200_OK)
async def analyze_role(request: RoleAnalyzeRequest):
    """Analyze readiness for a selected role using stored resume signals.

    Expects JSON: { "resume_id": "...", "role": "UX Designer" }.
    Role is validated strictly; unknown role returns 400. No fallback to another role.
    """
    resume_id = (request.resume_id or "").strip()
    original_role = (request.role or "").strip()
    if not resume_id or not original_role:
        raise HTTPException(status_code=400, detail="Missing resume_id or role")

    role_definition = get_role_definition(original_role)
    if role_definition is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown role: '{original_role}'. Valid roles: senior_software_engineer, product_manager, data_scientist, ux_designer, engineering_manager, devops_engineer.",
        )

    signals = resume_get(resume_id)
    if not signals:
        raise HTTPException(status_code=404, detail="Resume not found or expired")

    result = evaluate_role_readiness(signals, role_definition, original_role)
    return result
