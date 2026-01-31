from typing import Any, Dict, List, Set

from app.services.resume_parser import ResumeSignals
from app.services.role_analysis import compute_role_readiness


def _resume_skills_set(signals: ResumeSignals) -> Set[str]:
    """Extract normalized skill set from resume signals. Defensive: never None."""
    parsed = getattr(signals, "parsed", None)
    if not parsed:
        return set()
    skills = getattr(parsed, "unique_skills", None) or getattr(parsed, "skills", None)
    if not skills:
        return set()
    return {s.lower().strip() for s in skills if s and isinstance(s, str)}


def _resume_experience_years(signals: ResumeSignals) -> float:
    """Extract experience years from resume. Defensive: never crash."""
    parsed = getattr(signals, "parsed", None)
    if not parsed:
        return 0.0
    years = getattr(parsed, "estimated_years_experience", 0.0)
    try:
        return max(0.0, float(years))
    except (TypeError, ValueError):
        return 0.0


def evaluate_role_readiness(
    signals: ResumeSignals,
    role_definition: Dict[str, Any],
    original_role: str,
) -> Dict[str, Any]:
    """
    Deterministic readiness evaluation for a given role.
    Uses role_definitions + role_analysis. No fallback; role_definition must be valid.
    Returns a dict with target_role (original string), readiness_score, and
    null-safe lists: strengths, gaps, non_negotiable, priority_skills.
    """
    resume_skills = _resume_skills_set(signals)
    resume_years = _resume_experience_years(signals)

    result = compute_role_readiness(resume_skills, resume_years, role_definition)

    # Build non_negotiable list: each role non_negotiable_skill -> {skill, status, reason}
    nn_skills = list(role_definition.get("non_negotiable_skills") or [])
    resume_set = {s.lower().strip() for s in resume_skills}
    non_negotiable_items: List[Dict[str, str]] = []
    for skill in nn_skills:
        sk = (skill or "").strip()
        if not sk:
            continue
        status = "good" if sk.lower() in resume_set else "missing"
        non_negotiable_items.append({
            "skill": sk,
            "status": status,
            "reason": "Required for role",
        })

    # Null-safe: never return null for any list
    strengths = list(result.strengths) if result.strengths is not None else []
    skill_gaps = list(result.skill_gaps) if result.skill_gaps is not None else []
    priority_skills = list(result.priority_skills) if result.priority_skills is not None else []

    return {
        "target_role": original_role,
        "readiness_score": int(round(max(0, min(100, result.readiness_score)))),
        "strengths": strengths,
        "gaps": skill_gaps,
        "non_negotiable": non_negotiable_items,
        "priority_skills": priority_skills,
        "verdict": result.verdict or "",
        "experience_gap": result.experience_gap or "",
        "explanation": result.explanation or "",
    }
