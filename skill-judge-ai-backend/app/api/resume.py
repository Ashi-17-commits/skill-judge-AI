from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.models.resume_response import AtsFacts, Explanation, ResumeEvaluationResponse
from app.services.ats_engine import AtsResult, calculate_ats
from app.services.groq_explainer import explain_with_groq
from app.services.resume_parser import ParsedResume, parse_resume, summarize_skills
from app.services.text_extractor import extract_text


router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post(
    "/upload",
    response_model=ResumeEvaluationResponse,
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
) -> ResumeEvaluationResponse:
    """
    Full resume evaluation pipeline:

    - Save the uploaded file locally
    - Extract raw text (PDF or DOCX)
    - Deterministically parse skills, experience and impact
    - Compute an ATS-style score with rule-based logic only
    - Use Groq's LLaMA-3 model to generate a human-readable explanation
    - Return a structured JSON payload with no static strings
    """

    original_filename = file.filename or "resume"
    content_type = file.content_type or "application/octet-stream"

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
        raw_text = extract_text(stored_path)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract text from resume: {exc}",
        ) from exc

    if not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract any text from the uploaded resume.",
        )

    parsed: ParsedResume = parse_resume(raw_text)
    ats_result: AtsResult = calculate_ats(parsed)

    ats_facts = AtsFacts(
        ats_score=ats_result.ats_score,
        skills_found=ats_result.skills_found,
        missing_skills=ats_result.missing_skills,
        impact_score=ats_result.impact_score,
        experience_years=ats_result.experience_years,
    )

    try:
        explanation: Explanation = explain_with_groq(ats_facts)
    except Exception:
        strengths = []
        if ats_facts.skills_found:
            strengths.append(
                f"The resume demonstrates {len(ats_facts.skills_found)} relevant skills, "
                f"including {', '.join(ats_facts.skills_found[:5])}."
            )

        skill_gaps = []
        if ats_facts.missing_skills:
            skill_gaps.append(
                "The resume does not clearly mention several target skills such as "
                + ", ".join(ats_facts.missing_skills[:5])
            )

        next_actions = []
        if ats_facts.missing_skills:
            next_actions.append(
                "Update the skills section to explicitly list the core technologies you use, "
                "focusing on the missing skills that are actually relevant to your background."
            )
        if ats_facts.impact_score < 0.5:
            next_actions.append(
                "Rewrite experience bullets so that they include measurable outcomes such as "
                "percent improvements, cost savings or performance gains."
            )
        if ats_facts.experience_years < 2:
            next_actions.append(
                "Consider adding academic or project work that shows hands-on experience "
                "with the same tools used in industry roles."
            )

        verdict_parts = []
        if ats_facts.ats_score >= 80:
            verdict_parts.append("Strong match based on the deterministic score.")
        elif ats_facts.ats_score >= 50:
            verdict_parts.append("Moderate match with room for improvement.")
        else:
            verdict_parts.append("Limited match for typical technical roles.")

        if ats_facts.missing_skills:
            verdict_parts.append("Several expected skills are not clearly represented.")

        explanation = Explanation(
            verdict=" ".join(verdict_parts),
            summary=(
                "This fallback explanation is generated by deterministic rules because "
                "the explanation model was unavailable."
            ),
            strengths=strengths,
            skill_gaps=skill_gaps,
            next_actions=next_actions,
        )

    preview = raw_text.strip().splitlines()
    raw_text_preview = "\n".join(preview[:15]) if preview else None

    return ResumeEvaluationResponse(
        file_name=original_filename,
        content_type=content_type,
        ats_facts=ats_facts,
        explanation=explanation,
        raw_text_preview=raw_text_preview,
    )

