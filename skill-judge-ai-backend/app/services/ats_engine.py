from dataclasses import dataclass
from typing import List, Set, Tuple

from .resume_parser import (
    CANONICAL_SKILLS,
    ParsedResume,
    ResumeSignals,
    summarize_skills,
)


TARGET_SKILLS: Set[str] = CANONICAL_SKILLS


@dataclass
class AtsResult:
    """
    Deterministic ATS-style evaluation payload (legacy).
    """

    ats_score: float
    skills_found: List[str]
    missing_skills: List[str]
    impact_score: float
    experience_years: float


@dataclass
class ScoreBreakdownItem:
    """Single category in the ATS score breakdown for the frontend."""

    key: str
    label: str
    score: int
    reason: str


# Weights for overall score (must sum to 1.0).
WEIGHT_FORMAT = 0.20
WEIGHT_KEYWORD = 0.25
WEIGHT_EXPERIENCE = 0.20
WEIGHT_SKILLS = 0.15
WEIGHT_ACHIEVEMENT = 0.20


def _score_format_structure(s: ResumeSignals) -> Tuple[int, str]:
    """
    Format & Structure: base score from sections, layout, length.
    - Missing experience or skills section: heavy penalty.
    - Clear sections and reasonable page count: bonus.
    - Bullet length 5–25 words: good; too short or too long: penalty.
    """
    score = 50  # base
    reasons: List[str] = []

    if s.has_experience_section:
        score += 20
        reasons.append("Experience section is present.")
    else:
        score -= 25
        reasons.append("No clear Experience or Work History section detected.")

    if s.has_skills_section:
        score += 15
        reasons.append("Skills section is present.")
    else:
        score -= 15
        reasons.append("No clear Skills or Technical Skills section detected.")

    if 1 <= s.page_count <= 2:
        score += 10
        reasons.append(f"Resume length is {s.page_count} page(s), which is typical.")
    elif s.page_count > 3:
        score -= 10
        reasons.append(f"Resume is {s.page_count} pages; 1–2 pages is preferred.")

    if 5 <= s.avg_bullet_length <= 25:
        score += 5
        reasons.append(f"Bullet points have good detail (avg {s.avg_bullet_length:.0f} words).")
    elif s.avg_bullet_length > 0 and s.avg_bullet_length < 4:
        score -= 10
        reasons.append("Bullet points are very short; add more context.")
    elif s.avg_bullet_length > 40:
        score -= 5
        reasons.append("Some bullets are very long; consider splitting.")

    if s.uses_tables_or_columns:
        score += 5
        reasons.append("Structured layout (tables/columns) detected.")

    score = max(0, min(100, score))
    reason = " ".join(reasons) if reasons else "Format could not be fully assessed."
    return (score, reason)


def _score_keyword_optimization(s: ResumeSignals) -> Tuple[int, str]:
    """
    Keyword Optimization: match between resume and target (mock JD) keywords.
    Proportional score; no LLM.
    """
    ratio = s.keyword_match_ratio
    score = int(ratio * 100)
    score = max(0, min(100, score))
    matched = len(s.resume_keywords & s.jd_keywords)
    total_jd = len(s.jd_keywords)
    reason = (
        f"Resume matches {matched} of {total_jd} target keywords "
        f"({ratio * 100:.0f}% match)."
    )
    return (score, reason)


def _score_experience_clarity(s: ResumeSignals) -> Tuple[int, str]:
    """
    Experience Clarity: number of roles, dates present, bullets per role.
    """
    score = 40  # base
    reasons: List[str] = []

    if s.number_of_roles >= 1:
        score += 25
        reasons.append(f"{s.number_of_roles} role(s) with date ranges detected.")
    else:
        score -= 20
        reasons.append("No clear role dates (e.g. 2019–2022) found.")

    if s.roles_with_dates == s.number_of_roles and s.number_of_roles > 0:
        reasons.append("All roles have dates.")

    if s.avg_bullets_per_role >= 2 and s.avg_bullets_per_role <= 6:
        score += 20
        reasons.append(f"About {s.avg_bullets_per_role:.0f} bullets per role (good detail).")
    elif s.avg_bullets_per_role > 6:
        score += 10
        reasons.append(f"Many bullets per role ({s.avg_bullets_per_role:.0f}); consider trimming.")
    elif s.number_of_roles > 0 and s.avg_bullets_per_role < 1:
        score -= 15
        reasons.append("Few or no bullets per role; add impact statements.")

    score = max(0, min(100, score))
    reason = " ".join(reasons) if reasons else "Experience structure could not be fully assessed."
    return (score, reason)


def _score_skills_presentation(s: ResumeSignals) -> Tuple[int, str]:
    """
    Skills Presentation: count, grouping, no duplicates.
    """
    score = 40
    reasons: List[str] = []

    if s.skills_count >= 5:
        score += 30
        reasons.append(f"Resume lists {s.skills_count} distinct skills.")
    elif s.skills_count >= 2:
        score += 15
        reasons.append(f"Resume lists {s.skills_count} skills; more may help.")
    else:
        reasons.append("Few skills listed; consider adding technologies and tools.")

    if s.skills_grouped:
        score += 15
        reasons.append("Skills appear in a dedicated section (grouped).")
    else:
        reasons.append("Skills are scattered; a dedicated section is easier to scan.")

    if s.duplicate_skills_present:
        score -= 10
        reasons.append("Duplicate skills detected; consolidate for clarity.")

    score = max(0, min(100, score))
    reason = " ".join(reasons) if reasons else "Skills presentation could not be fully assessed."
    return (score, reason)


def _score_achievement_metrics(s: ResumeSignals) -> Tuple[int, str]:
    """
    Achievement Metrics: share of bullets that contain numbers/impact language.
    """
    ratio = s.metrics_ratio
    score = int(ratio * 100)
    score = max(0, min(100, score))
    reason = (
        f"{s.bullets_with_numbers} of {s.total_bullets} bullet(s) include metrics or impact "
        f"({ratio * 100:.0f}%); more quantified results strengthen the resume."
    )
    if s.total_bullets == 0:
        reason = "No bullet points detected; add bullet points with measurable outcomes."
    return (score, reason)


def compute_evidence_based_ats(signals: ResumeSignals) -> Tuple[int, str, str, List[ScoreBreakdownItem]]:
    """
    Compute overall ATS score, verdict, summary, and score_breakdown from signals.
    All logic is deterministic and explainable; no LLM used for scoring.
    """

    fmt_score, fmt_reason = _score_format_structure(signals)
    kw_score, kw_reason = _score_keyword_optimization(signals)
    exp_score, exp_reason = _score_experience_clarity(signals)
    sk_score, sk_reason = _score_skills_presentation(signals)
    ach_score, ach_reason = _score_achievement_metrics(signals)

    overall = (
        WEIGHT_FORMAT * fmt_score
        + WEIGHT_KEYWORD * kw_score
        + WEIGHT_EXPERIENCE * exp_score
        + WEIGHT_SKILLS * sk_score
        + WEIGHT_ACHIEVEMENT * ach_score
    )
    overall_score = int(round(overall))

    if overall_score >= 70:
        verdict = "Strong"
    elif overall_score >= 40:
        verdict = "Moderate"
    else:
        verdict = "Low"

    # One-sentence rule-based summary from category scores
    parts = []
    if fmt_score >= 70:
        parts.append("Format and structure are clear.")
    elif fmt_score < 50:
        parts.append("Format and structure need improvement.")
    if kw_score >= 60:
        parts.append("Keyword alignment is good.")
    elif kw_score < 40:
        parts.append("Keyword alignment is weak.")
    if exp_score >= 60:
        parts.append("Experience is well presented.")
    if sk_score >= 60:
        parts.append("Skills are well presented.")
    if ach_score >= 50:
        parts.append("Achievement metrics are present.")
    else:
        parts.append("Adding more quantified results would help.")
    summary = " ".join(parts) if parts else f"Overall ATS score: {overall_score}/100."

    score_breakdown = [
        ScoreBreakdownItem(key="format_structure", label="Format & Structure", score=fmt_score, reason=fmt_reason),
        ScoreBreakdownItem(key="keyword_optimization", label="Keyword Optimization", score=kw_score, reason=kw_reason),
        ScoreBreakdownItem(key="experience_clarity", label="Experience Clarity", score=exp_score, reason=exp_reason),
        ScoreBreakdownItem(key="skills_presentation", label="Skills Presentation", score=sk_score, reason=sk_reason),
        ScoreBreakdownItem(key="achievement_metrics", label="Achievement Metrics", score=ach_score, reason=ach_reason),
    ]

    return (overall_score, verdict, summary, score_breakdown)


# ----- Legacy: keep calculate_ats for backward compatibility -----


def _score_skills(unique_skills: Set[str]) -> float:
    if not TARGET_SKILLS:
        return 0.0
    covered = len(unique_skills & TARGET_SKILLS)
    coverage_ratio = covered / len(TARGET_SKILLS)
    return min(coverage_ratio * 100.0, 100.0)


def _score_experience(years: float) -> float:
    if years <= 0:
        return 0.0
    if years >= 10:
        return 100.0
    return (years / 10.0) * 100.0


def _score_impact(metric_sentences_count: int) -> float:
    if metric_sentences_count <= 0:
        return 0.0
    if metric_sentences_count >= 5:
        return 1.0
    return metric_sentences_count / 5.0


def calculate_ats(parsed: ParsedResume) -> AtsResult:
    """
    Legacy ATS computation (single score + skills/impact/experience).
    New code should use compute_evidence_based_ats(ResumeSignals) instead.
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
