import re
from collections import Counter
from dataclasses import dataclass
from typing import Iterable, List, Set


CANONICAL_SKILLS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "sql",
    "mongodb",
    "postgresql",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "fastapi",
    "django",
    "flask",
    "react",
    "node.js",
    "git",
    "linux",
    "machine learning",
    "data analysis",
}


METRIC_KEYWORDS = {
    "increased",
    "reduced",
    "improved",
    "optimized",
    "boosted",
    "decreased",
    "grew",
    "cut",
    "%",
    "percent",
    "revenue",
    "cost",
    "latency",
    "throughput",
    "performance",
}


YEAR_PATTERNS = [
    re.compile(r"(\d+(?:\.\d+)?)\s*\+?\s*years? of experience", re.IGNORECASE),
    re.compile(r"(\d+(?:\.\d+)?)\s*\+?\s*yrs?", re.IGNORECASE),
]


DATE_RANGE_PATTERN = re.compile(
    r"(?P<start_year>20\d{2}|19\d{2})\s*[-–]\s*(?P<end_year>20\d{2}|19\d{2}|present)",
    re.IGNORECASE,
)


@dataclass
class ParsedResume:
    """
    Parsed representation of the resume used by deterministic scoring logic.
    """

    skills: List[str]
    unique_skills: Set[str]
    estimated_years_experience: float
    metric_sentences: List[str]


def _normalize_text(text: str) -> str:
    """
    Normalize whitespace for easier regex matching.
    """

    return re.sub(r"\s+", " ", text).strip()


def _extract_skills(text: str) -> List[str]:
    """
    Extract a list of canonical skills present in the resume text.

    Matching is case-insensitive and based on simple word/phrase lookup
    against a fixed, deterministic set of skills.
    """

    lowered = text.lower()
    found_skills: list[str] = []
    for skill in CANONICAL_SKILLS:
        if skill in lowered:
            occurrences = lowered.count(skill)
            found_skills.extend([skill] * occurrences)
    return found_skills


def _estimate_years_from_phrases(text: str) -> float:
    """
    Estimate years of experience from explicit textual phrases.
    """

    years: list[float] = []
    for pattern in YEAR_PATTERNS:
        for match in pattern.finditer(text):
            try:
                value = float(match.group(1))
                years.append(value)
            except (ValueError, IndexError):
                continue
    return max(years) if years else 0.0


def _estimate_years_from_date_ranges(text: str) -> float:
    """
    Estimate years of experience based on detected date ranges in work history.
    """

    ranges: list[tuple[int, int]] = []
    for match in DATE_RANGE_PATTERN.finditer(text):
        start_year_raw = match.group("start_year")
        end_year_raw = match.group("end_year")
        try:
            start_year = int(start_year_raw)
        except (TypeError, ValueError):
            continue
        if end_year_raw.lower() == "present":
            from datetime import datetime

            end_year = datetime.utcnow().year
        else:
            try:
                end_year = int(end_year_raw)
            except (TypeError, ValueError):
                continue
        if end_year >= start_year:
            ranges.append((start_year, end_year))

    total_years = 0.0
    for start, end in ranges:
        total_years += float(end - start)
    return total_years


def _extract_metric_sentences(text: str) -> List[str]:
    """
    Identify sentences that appear to contain quantitative impact metrics.
    """

    normalized = _normalize_text(text)
    sentence_candidates = re.split(r"(?<=[.!?])\s+", normalized)
    metric_sentences: list[str] = []
    for sentence in sentence_candidates:
        lowered = sentence.lower()
        if any(keyword in lowered for keyword in METRIC_KEYWORDS):
            metric_sentences.append(sentence.strip())
    return metric_sentences


def parse_resume(text: str) -> ParsedResume:
    """
    Deterministically parse skills, experience and impact indicators.

    This function does not call any LLMs and is purely rules-based so
    that evaluations are stable and reproducible.
    """

    normalized = _normalize_text(text)

    skills = _extract_skills(normalized)
    unique_skills = set(skills)

    years_from_phrases = _estimate_years_from_phrases(normalized)
    years_from_ranges = _estimate_years_from_date_ranges(normalized)

    years_candidates = [v for v in [years_from_phrases, years_from_ranges] if v > 0]
    estimated_years = max(years_candidates) if years_candidates else 0.0

    metric_sentences = _extract_metric_sentences(text)

    return ParsedResume(
        skills=skills,
        unique_skills=unique_skills,
        estimated_years_experience=estimated_years,
        metric_sentences=metric_sentences,
    )


def summarize_skills(skills: Iterable[str]) -> List[str]:
    """
    Helper to produce a stable, frequency-aware ordering of skills.
    """

    counter = Counter(skills)
    ordered = sorted(counter.items(), key=lambda kv: (-kv[1], kv[0]))
    return [skill for skill, _ in ordered]
