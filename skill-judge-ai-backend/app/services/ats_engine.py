from dataclasses import dataclass
from typing import List, Sequence, Set

from .resume_parser import CANONICAL_SKILLS, ParsedResume, summarize_skills


TARGET_SKILLS: Set[str] = CANONICAL_SKILLS


@dataclass
class AtsResult:
    """
    Deterministic ATS-style evaluation payload.
    """

    ats_score: float
    skills_found: List[str]
    missing_skills: List[str]
    impact_score: float
    experience_years: float


def _score_skills(unique_skills: Set[str]) -> float:
    """
    Score skills based on coverage of the target set.
    """

    if not TARGET_SKILLS:
        return 0.0
    covered = len(unique_skills & TARGET_SKILLS)
    coverage_ratio = covered / len(TARGET_SKILLS)
    return min(coverage_ratio * 100.0, 100.0)


def _score_experience(years: float) -> float:
    """
    Map years of experience to a 0-100 score using a simple saturation curve.
    """

    if years <= 0:
        return 0.0
    if years >= 10:
        return 100.0
    return (years / 10.0) * 100.0


def _score_impact(metric_sentences_count: int) -> float:
    """
    Normalize impact indicators to a 0-1 range.

    The score saturates after a small number of metric-bearing sentences
    to reflect diminishing returns.
    """

    if metric_sentences_count <= 0:
        return 0.0
    if metric_sentences_count >= 5:
        return 1.0
    return metric_sentences_count / 5.0


def calculate_ats(parsed: ParsedResume) -> AtsResult:
    """
    Compute an ATS-style score using only deterministic rules.

    Weighting:
      - 40% skills coverage
      - 40% years of experience
      - 20% impact metrics
    """

    skills_score = _score_skills(parsed.unique_skills)
    experience_score = _score_experience(parsed.estimated_years_experience)
    impact_score_normalized = _score_impact(len(parsed.metric_sentences))
    impact_score_scaled = impact_score_normalized * 100.0

    ats_score = (
        0.4 * skills_score + 0.4 * experience_score + 0.2 * impact_score_scaled
    )

    skills_found = summarize_skills(parsed.skills)
    missing_skills = sorted(TARGET_SKILLS - parsed.unique_skills)

    return AtsResult(
        ats_score=round(ats_score, 2),
        skills_found=skills_found,
        missing_skills=missing_skills,
        impact_score=round(impact_score_normalized, 2),
        experience_years=round(parsed.estimated_years_experience, 1),
    )
