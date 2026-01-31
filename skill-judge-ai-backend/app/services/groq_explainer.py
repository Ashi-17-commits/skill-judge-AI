import json
from typing import Any, Dict

from groq import Groq

from app.core.config import settings
from app.models.resume_response import AtsFacts, Explanation


SYSTEM_PROMPT = (
    "You are an impartial technical recruiter assistant. "
    "You receive deterministic ATS-style evaluation facts about a resume. "
    "Your job is to restate these facts in clear, concise professional language "
    "without adding motivational fluff or speculation. "
    "Do not use emojis. "
    "Respond with STRICT JSON only, with keys: "
    "verdict (string), summary (string), strengths (array of strings), "
    "skill_gaps (array of strings), next_actions (array of strings)."
)


def _build_user_prompt(ats_facts: AtsFacts) -> str:
    """
    Construct a compact, deterministic description of the ATS facts
    for the LLM to explain.
    """

    return (
        "Here are the evaluation facts for a candidate's resume:\n"
        f"- Overall ATS score (0-100): {ats_facts.ats_score}\n"
        f"- Skills found: {', '.join(ats_facts.skills_found) or 'none'}\n"
        f"- Missing skills (target set): {', '.join(ats_facts.missing_skills) or 'none'}\n"
        f"- Impact score (0-1, higher means more quantified impact): {ats_facts.impact_score}\n"
        f"- Estimated years of experience: {ats_facts.experience_years}\n\n"
        "Based strictly on these facts, write a short evaluation for a hiring "
        "manager. Do not quote the bullet list verbatim; instead, synthesize it "
        "into a concise, concrete assessment."
    )


def _safe_json_loads(raw: str) -> Dict[str, Any]:
    """
    Safely parse JSON, attempting to recover from minor formatting issues.
    """

    raw = raw.strip()
    if "```" in raw:
        raw = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(raw)


def explain_role_analysis(
    readiness_score: float,
    verdict: str,
    strengths: list,
    skill_gaps: list,
    experience_gap: str,
    target_role: str,
) -> str:
    """
    Use Groq to convert role analysis facts into one clean explanation string.
    Does not change scores or gaps; on failure caller uses rule-based explanation.
    """
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not configured.")
    client = Groq(api_key=settings.GROQ_API_KEY)
    prompt = (
        "Turn this role-readiness analysis into one short, professional paragraph. "
        "Do not add scores or invent gaps. No emojis. Return STRICT JSON with key: explanation (string).\n"
        f"Role: {target_role}. Verdict: {verdict}. Readiness: {readiness_score}/100. "
        f"Strengths: {strengths}. Skill gaps: {skill_gaps}. Experience: {experience_gap}"
    )
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        temperature=settings.GROQ_TEMPERATURE,
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}],
    )
    content = response.choices[0].message.content or "{}"
    data = _safe_json_loads(content)
    return str(data.get("explanation", "")).strip() or experience_gap


def rewrite_verdict_summary(verdict: str, summary: str) -> tuple[str, str]:
    """
    Use Groq to rewrite only verdict and summary in better language.
    Does not change scores or reasons. On failure, caller should keep original.
    """
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not configured.")
    client = Groq(api_key=settings.GROQ_API_KEY)
    prompt = (
        "Rewrite the following ATS verdict and summary in one short sentence each, "
        "professional and direct. No emojis. Return STRICT JSON with keys: verdict (string), summary (string).\n"
        f"Current verdict: {verdict}\nCurrent summary: {summary}"
    )
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        temperature=settings.GROQ_TEMPERATURE,
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}],
    )
    content = response.choices[0].message.content or "{}"
    data = _safe_json_loads(content)
    new_verdict = str(data.get("verdict", verdict)).strip() or verdict
    new_summary = str(data.get("summary", summary)).strip() or summary
    return (new_verdict, new_summary)


def explain_with_groq(ats_facts: AtsFacts) -> Explanation:
    """
    Call Groq's LLaMA-3 model to generate a structured explanation.

    This function is intentionally narrow in scope: it never influences
    deterministic scoring and only transforms facts into human language.
    """

    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not configured.")

    client = Groq(api_key=settings.GROQ_API_KEY)

    user_prompt = _build_user_prompt(ats_facts)

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        temperature=settings.GROQ_TEMPERATURE,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )

    content = response.choices[0].message.content or "{}"

    try:
        data = _safe_json_loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Failed to parse Groq JSON response: {exc}") from exc

    return Explanation(
        verdict=str(data.get("verdict", "")).strip() or "Evaluation unavailable",
        summary=str(data.get("summary", "")).strip()
        or "The explanation model did not return a summary.",
        strengths=[str(item).strip() for item in data.get("strengths", []) if str(item).strip()],
        skill_gaps=[str(item).strip() for item in data.get("skill_gaps", []) if str(item).strip()],
        next_actions=[str(item).strip() for item in data.get("next_actions", []) if str(item).strip()],
    )
