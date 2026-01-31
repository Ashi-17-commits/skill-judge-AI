"""
Role readiness and skill gap analysis.

Compares parsed resume (skills, experience) to a role definition.
All scoring and gap detection is deterministic; no LLM used for scores or gaps.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Set, Tuple


@dataclass
class RoleAnalysisResult:
    """Result of comparing resume to a role definition. All list fields are never None."""

    readiness_score: float
    verdict: str
    strengths: List[str]
    skill_gaps: List[str]
    non_negotiable_skills: List[str]  # missing non-negotiable skills (gaps)
    priority_skills: List[str]
    experience_gap: str
    explanation: str


def _skill_match_ratio(resume_skills: Set[str], required_skills: List[str]) -> float:
    """
    Fraction of required skills present in resume.
    Skills compared case-insensitively via normalized sets.
    """
    if not required_skills:
        return 1.0
    req_set = {s.lower().strip() for s in required_skills}
    matched = len(resume_skills & req_set)
    return matched / len(req_set)


def _optional_skill_ratio(resume_skills: Set[str], optional_skills: List[str]) -> float:
    """Fraction of optional skills present in resume."""
    if not optional_skills:
        return 1.0
    opt_set = {s.lower().strip() for s in optional_skills}
    matched = len(resume_skills & opt_set)
    return matched / len(opt_set)


def _experience_match(
    resume_years: float, required_years: float
) -> Tuple[bool, float]:
    """
    Returns (met: bool, score_0_to_1: float).
    Score is 1.0 if met; otherwise proportional shortfall.
    """
    if required_years <= 0:
        return (True, 1.0)
    if resume_years >= required_years:
        return (True, 1.0)
    # Partial credit: e.g. 3 years vs 5 required -> 3/5 = 0.6
    return (False, max(0.0, resume_years / required_years))


def _readiness_score(
    required_ratio: float,
    optional_ratio: float,
    experience_score: float,
) -> float:
    """
    Weighted readiness: 50% required skills, 20% optional skills, 30% experience.
    Clamped 0–100.
    """
    score = (
        0.50 * (required_ratio * 100.0)
        + 0.20 * (optional_ratio * 100.0)
        + 0.30 * (experience_score * 100.0)
    )
    return max(0.0, min(100.0, round(score, 1)))


def _verdict_from_score(readiness_score: float) -> str:
    """Map readiness score to verdict string."""
    if readiness_score >= 80:
        return "Job Ready"
    if readiness_score >= 60:
        return "Partially Ready"
    return "Not Ready"


def _strengths_list(
    resume_skills: Set[str],
    required_skills: List[str],
    optional_skills: List[str],
) -> List[str]:
    """Skills that appear in both resume and role (required or optional)."""
    req_set = {s.lower().strip() for s in required_skills}
    opt_set = {s.lower().strip() for s in optional_skills}
    in_both = (resume_skills & req_set) | (resume_skills & opt_set)
    return sorted(in_both)


def _skill_gaps_list(
    resume_skills: Set[str], required_skills: List[str]
) -> List[str]:
    """Required skills missing from resume. Role-specific: required_skills - resume.skills."""
    if not required_skills:
        return []
    req_set = {s.lower().strip() for s in required_skills}
    missing = req_set - resume_skills
    return sorted(missing)


def _non_negotiable_gaps_list(
    resume_skills: Set[str], non_negotiable_skills: List[str]
) -> List[str]:
    """Non-negotiable skills missing from resume. non_negotiable_skills - resume.skills."""
    if not non_negotiable_skills:
        return []
    nn_set = {s.lower().strip() for s in non_negotiable_skills}
    missing = nn_set - resume_skills
    return sorted(missing)


def _priority_skills_list(
    resume_skills: Set[str], required_skills: List[str]
) -> List[str]:
    """
    Missing required skills as priority list (same as skill_gaps).
    Return sorted for stable order.
    """
    return _skill_gaps_list(resume_skills, required_skills)


def _experience_gap_string(
    resume_years: float, required_years: float, display_name: str
) -> str:
    """Human-readable experience gap for response."""
    if required_years <= 0:
        return "No minimum experience requirement for this role."
    if resume_years >= required_years:
        return f"Meets or exceeds the typical {required_years:.0f}+ years experience for {display_name}."
    shortfall = required_years - resume_years
    return (
        f"About {shortfall:.1f} years short of the typical {required_years:.0f}+ years "
        f"experience for {display_name}. Consider highlighting transferable experience or side projects."
    )


def _rule_based_explanation(
    display_name: str,
    readiness_score: float,
    verdict: str,
    strengths: List[str],
    skill_gaps: List[str],
    experience_gap: str,
) -> str:
    """Build a deterministic explanation string from analysis fields."""
    parts = [
        f"For {display_name}, your readiness score is {readiness_score:.0f}/100 ({verdict})."
    ]
    if strengths:
        parts.append(
            f"Your profile aligns well in: {', '.join(strengths[:8])}{'...' if len(strengths) > 8 else ''}."
        )
    if skill_gaps:
        parts.append(
            f"To strengthen your fit, focus on building or showcasing: {', '.join(skill_gaps[:6])}{'...' if len(skill_gaps) > 6 else ''}."
        )
    parts.append(experience_gap)
    return " ".join(parts)


def compute_role_readiness(
    resume_skills: Set[str],
    resume_experience_years: float,
    role_definition: Dict[str, Any],
) -> RoleAnalysisResult:
    """
    Compare resume to role definition and return readiness, gaps, and explanation.
    All logic is deterministic; no LLM used. Defensive: missing/empty skills
    do not crash; all list fields and experience_gap are never None/empty.
    """
    required = list(role_definition.get("required_skills") or [])
    optional = list(role_definition.get("optional_skills") or [])
    non_negotiable = list(role_definition.get("non_negotiable_skills") or [])
    min_years = float(role_definition.get("min_experience_years") or 0)
    display_name = role_definition.get("display_name") or "this role"

    # Defensive: resume_skills may be None or empty; normalize to set
    resume_set = set()
    if resume_skills:
        resume_set = {s.lower().strip() for s in resume_skills if s and isinstance(s, str)}

    required_ratio = _skill_match_ratio(resume_set, required)
    optional_ratio = _optional_skill_ratio(resume_set, optional)
    _experience_met, experience_score = _experience_match(
        resume_experience_years, min_years
    )

    readiness_score = _readiness_score(
        required_ratio, optional_ratio, experience_score
    )
    verdict = _verdict_from_score(readiness_score)

    strengths = _strengths_list(resume_set, required, optional) or []
    skill_gaps = _skill_gaps_list(resume_set, required) or []
    non_negotiable_gaps = _non_negotiable_gaps_list(resume_set, non_negotiable) or []
    priority_skills = _priority_skills_list(resume_set, required) or []

    experience_gap = _experience_gap_string(
        resume_experience_years, min_years, display_name
    )
    if not experience_gap or not isinstance(experience_gap, str):
        experience_gap = "Experience could not be evaluated for this role."

    explanation = _rule_based_explanation(
        display_name, readiness_score, verdict, strengths, skill_gaps, experience_gap
    )

    return RoleAnalysisResult(
        readiness_score=readiness_score,
        verdict=verdict,
        strengths=strengths,
        skill_gaps=skill_gaps,
        non_negotiable_skills=non_negotiable_gaps,
        priority_skills=priority_skills,
        experience_gap=experience_gap,
        explanation=explanation or "",
    )
