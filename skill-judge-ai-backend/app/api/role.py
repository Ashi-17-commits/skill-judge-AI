from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.models.role_response import RoleReadinessResponse
from app.services.role_definitions import get_role_definition
from app.services.role_engine import evaluate_role_readiness
from app.services.resume_store import get as resume_get


class RoleAnalyzeRequest(BaseModel):
    resume_id: str
    role: str


router = APIRouter(prefix="/role", tags=["Role"])


@router.post("/analyze", status_code=status.HTTP_200_OK)
async def analyze_role(request: RoleAnalyzeRequest):
    """Analyze readiness for a selected role using stored resume signals.

    Expects JSON: { "resume_id": "...", "role": "UX Designer" }.
    Role is validated strictly; unknown role returns 400. No fallback to another role.
    """
    try:
        resume_id = (request.resume_id or "").strip()
        original_role = (request.role or "").strip()
        if not resume_id or not original_role:
            raise HTTPException(status_code=400, detail="Missing resume_id or role")

        try:
            role_definition = get_role_definition(original_role)
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to load role definition: {exc}",
            ) from exc

        if role_definition is None:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown role: '{original_role}'. Valid roles: senior_software_engineer, product_manager, data_scientist, ux_designer, engineering_manager, devops_engineer.",
            )

        try:
            signals = resume_get(resume_id)
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to retrieve resume: {exc}",
            ) from exc

        if not signals:
            raise HTTPException(status_code=404, detail="Resume not found or expired")

        try:
            result = evaluate_role_readiness(signals, role_definition, original_role)
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to evaluate role readiness: {exc}",
            ) from exc

        print(f"[ROLE ANALYSIS] Success - role: {original_role}, readiness_score: {result.readiness_score}")
        
        # Explicitly return JSONResponse to ensure proper serialization
        return JSONResponse(
            status_code=200,
            content=result.dict() if hasattr(result, 'dict') else result,
            headers={"Content-Type": "application/json"},
        )

    except HTTPException:
        # Re-raise HTTP exceptions (already have proper error responses)
        raise
    except Exception as exc:
        # Catch any unexpected errors and return valid JSON
        print(f"ERROR in analyze_role: {exc}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error analyzing role: {str(exc)}",
        ) from exc
