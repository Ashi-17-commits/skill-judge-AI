from pathlib import Path
from typing import Annotated, List

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.models.resume_response import AtsScoreResponse, ScoreBreakdownItemSchema
from app.services.ats_engine import ScoreBreakdownItem, compute_evidence_based_ats
from app.services.groq_explainer import rewrite_verdict_summary
from app.services.resume_parser import parse_resume_signals
from app.services.resume_store import generate_id, put as store_put
from app.services.text_extractor import extract_with_meta


router = APIRouter(prefix="/resume", tags=["Resume"])


def _breakdown_to_schema(items: List[ScoreBreakdownItem]) -> List[ScoreBreakdownItemSchema]:
    return [
        ScoreBreakdownItemSchema(key=i.key, label=i.label, score=i.score, reason=i.reason)
        for i in items
    ]


@router.options("/upload")
async def options_upload() -> JSONResponse:
    """Handle CORS preflight requests for resume upload."""
    return JSONResponse(
        status_code=200,
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    )


@router.post(
    "/upload",
    response_model=AtsScoreResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and evaluate a resume",
)
async def upload_resume(
    file: Annotated[
        UploadFile,
        File(
            description="Resume file to upload (PDF or DOCX).",
        ),
    ],
) -> AtsScoreResponse:
    """
    Evidence-based resume evaluation pipeline:

    - Save the uploaded file locally
    - Extract text and page count (PDF/DOCX)
    - Parse signals (sections, keywords, roles, skills, metrics)
    - Compute category scores and reasons (deterministic, no LLM)
    - Optionally use Groq to rewrite verdict/summary only
    - Return overall_score, verdict, summary, score_breakdown (frontend contract)
    """

    original_filename = file.filename or "resume"
    extension = Path(original_filename).suffix.lower()
    if extension not in {".pdf", ".docx"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Only PDF and DOCX are allowed.",
        )

    upload_dir = settings.UPLOAD_DIR
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = original_filename.replace("/", "_").replace("\\", "_")
    stored_path = upload_dir / safe_name

    file_bytes = await file.read()
    try:
        stored_path.write_bytes(file_bytes)
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store uploaded file: {exc}",
        ) from exc

    try:
        extract_result = extract_with_meta(stored_path)
        raw_text = extract_result.text
        page_count = extract_result.page_count
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract text from resume: {exc}",
        ) from exc

    if not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract any text from the uploaded resume.",
        )

    signals = parse_resume_signals(raw_text, page_count=page_count)
    overall_score, verdict, summary, score_breakdown = compute_evidence_based_ats(signals)

    resume_id = generate_id()
    store_put(resume_id, signals)

    # Optional: LLM rewrites only verdict and summary; scores and reasons unchanged
    if settings.GROQ_API_KEY:
        try:
            verdict, summary = rewrite_verdict_summary(verdict, summary)
        except Exception:
            pass  # keep rule-based verdict and summary

    return AtsScoreResponse(
        overall_score=overall_score,
        verdict=verdict,
        summary=summary,
        score_breakdown=_breakdown_to_schema(score_breakdown),
        resume_id=resume_id,
    )
