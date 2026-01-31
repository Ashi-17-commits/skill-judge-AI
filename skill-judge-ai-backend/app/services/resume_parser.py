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


# Section headers that indicate Experience or Skills (case-insensitive).
EXPERIENCE_HEADERS = {
    "experience", "work experience", "employment", "professional experience",
    "work history", "career", "positions", "relevant experience",
}
SKILLS_HEADERS = {
    "skills", "technical skills", "core competencies", "technologies",
    "key skills", "expertise", "competencies", "summary of qualifications",
}


@dataclass
class ParsedResume:
    """
    Parsed representation of the resume used by deterministic scoring logic.
    """

    skills: List[str]
    unique_skills: Set[str]
    estimated_years_experience: float
    metric_sentences: List[str]


@dataclass
class ResumeSignals:
    """
    Evidence-based signals extracted from the resume for category scoring.
    Used only for deterministic, explainable ATS scoring.
    """

    # Format & Structure
    has_experience_section: bool
    has_skills_section: bool
    uses_tables_or_columns: bool
    page_count: int
    avg_bullet_length: float

    # Keyword Optimization (jd_keywords is mock for now)
    jd_keywords: Set[str]
    resume_keywords: Set[str]
    keyword_match_ratio: float

    # Experience Clarity
    number_of_roles: int
    roles_with_dates: int
    avg_bullets_per_role: float

    # Skills Presentation
    skills_count: int
    skills_grouped: bool
    duplicate_skills_present: bool

    # Achievement Metrics
    total_bullets: int
    bullets_with_numbers: int
    metrics_ratio: float

    # Keep parsed resume for backward compatibility and extra context
    parsed: ParsedResume


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


def _has_section(text: str, headers: Set[str]) -> bool:
    """True if the text contains a line that looks like a section header."""
    lines = [ln.strip().lower() for ln in text.splitlines() if ln.strip()]
    for line in lines:
        # Header is often a short line (few words) matching a known header
        if len(line) < 60 and any(h in line for h in headers):
            return True
    return False


def _detect_bullet_lines(text: str) -> List[str]:
    """Return lines that look like bullet points (leading •, -, *, or digit.)."""
    bullets: list[str] = []
    bullet_start = re.compile(r"^[\s]*([\u2022\u2023\u25E6\u2043\*\-\u2013\u2014]|\d+[.\)])\s+", re.MULTILINE)
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if bullet_start.match(line) or line.startswith("- ") or line.startswith("* "):
            bullets.append(line)
    return bullets


def _avg_bullet_length(bullets: List[str]) -> float:
    """Average word count per bullet line."""
    if not bullets:
        return 0.0
    total = sum(len(b.split()) for b in bullets)
    return total / len(bullets)


def _uses_tables_or_columns_heuristic(text: str) -> bool:
    """
    Heuristic: many short lines with similar length or tab-separated content
    suggests table/column layout. Also multiple spaces in a line can indicate columns.
    """
    lines = [ln for ln in text.splitlines() if ln.strip()]
    if len(lines) < 5:
        return False
    tab_lines = sum(1 for ln in lines if "\t" in ln)
    if tab_lines >= max(2, len(lines) // 5):
        return True
    lengths = [len(ln) for ln in lines if 10 < len(ln) < 80]
    if len(lengths) >= 5:
        avg_len = sum(lengths) / len(lengths)
        # Low variance in line length can indicate structured layout
        variance = sum((x - avg_len) ** 2 for x in lengths) / len(lengths)
        if variance < 200:
            return True
    return False


def _count_roles_with_dates(text: str) -> int:
    """Count distinct role indicators: date ranges (YYYY–YYYY or YYYY–Present)."""
    ranges_found: set[tuple[str, str]] = set()
    for match in DATE_RANGE_PATTERN.finditer(text):
        start_year_raw = match.group("start_year")
        end_year_raw = match.group("end_year")
        ranges_found.add((start_year_raw, end_year_raw.lower()))
    return len(ranges_found)


def _skills_appear_grouped(text: str, skills: Set[str]) -> bool:
    """
    True if skills appear in a block (e.g. same paragraph or consecutive lines)
    rather than scattered. Heuristic: find a line/paragraph with 3+ skills.
    """
    lowered = text.lower()
    lines = lowered.splitlines()
    for line in lines:
        if len(line) < 300:  # single line
            count = sum(1 for s in skills if s in line)
            if count >= 3:
                return True
    # Check sliding window of 3 lines
    for i in range(len(lines) - 2):
        block = " ".join(lines[i : i + 3])
        count = sum(1 for s in skills if s in block)
        if count >= 3:
            return True
    return False


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


def parse_resume_signals(text: str, page_count: int = 1) -> ResumeSignals:
    """
    Extract all signals needed for evidence-based category scoring.
    Deterministic and LLM-free.
    """

    parsed = parse_resume(text)
    normalized = _normalize_text(text)

    # Format & Structure
    has_experience_section = _has_section(text, EXPERIENCE_HEADERS)
    has_skills_section = _has_section(text, SKILLS_HEADERS)
    uses_tables_or_columns = _uses_tables_or_columns_heuristic(text)
    bullets = _detect_bullet_lines(text)
    avg_bullet_length = _avg_bullet_length(bullets)

    # Keyword Optimization: mock JD = canonical skills; resume = found skills
    jd_keywords = CANONICAL_SKILLS.copy()
    resume_keywords = parsed.unique_skills
    keyword_match_ratio = (
        len(resume_keywords & jd_keywords) / len(jd_keywords)
        if jd_keywords else 0.0
    )

    # Experience Clarity
    number_of_roles = _count_roles_with_dates(text)
    roles_with_dates = number_of_roles
    total_bullets = len(bullets)
    avg_bullets_per_role = total_bullets / max(1, number_of_roles)

    # Skills Presentation
    skills_count = len(parsed.unique_skills)
    skills_grouped = _skills_appear_grouped(text, parsed.unique_skills)
    duplicate_skills_present = len(parsed.skills) != len(parsed.unique_skills)

    # Achievement Metrics
    bullets_with_numbers = sum(
        1 for b in bullets
        if any(kw in b.lower() for kw in METRIC_KEYWORDS)
        or re.search(r"\d+%|\$\d+|\d+x", b)
    )
    metrics_ratio = bullets_with_numbers / max(1, total_bullets)

    return ResumeSignals(
        has_experience_section=has_experience_section,
        has_skills_section=has_skills_section,
        uses_tables_or_columns=uses_tables_or_columns,
        page_count=page_count,
        avg_bullet_length=avg_bullet_length,
        jd_keywords=jd_keywords,
        resume_keywords=resume_keywords,
        keyword_match_ratio=keyword_match_ratio,
        number_of_roles=number_of_roles,
        roles_with_dates=roles_with_dates,
        avg_bullets_per_role=avg_bullets_per_role,
        skills_count=skills_count,
        skills_grouped=skills_grouped,
        duplicate_skills_present=duplicate_skills_present,
        total_bullets=total_bullets,
        bullets_with_numbers=bullets_with_numbers,
        metrics_ratio=metrics_ratio,
        parsed=parsed,
    )
