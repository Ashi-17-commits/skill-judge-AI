"""
Role definition engine for Skill Judge AI.

Each role is stored as structured data (dict). Skills use lowercase keys
so they match resume_parser output. ALL role lookups MUST go through
normalize_role_key. No fallback to other roles; strict validation only.
"""

from typing import Any, Dict, List, Optional

# Role key (normalized slug) -> definition. Same schema for every role:
# required_skills, optional_skills, non_negotiable_skills, min_experience_years.
ROLE_DEFINITIONS: Dict[str, Dict[str, Any]] = {
    "senior_software_engineer": {
        "display_name": "Senior Software Engineer",
        "required_skills": [
            "python",
            "javascript",
            "sql",
            "git",
            "docker",
            "aws",
            "react",
            "node.js",
        ],
        "optional_skills": [
            "typescript",
            "kubernetes",
            "postgresql",
            "fastapi",
            "django",
            "flask",
            "linux",
            "machine learning",
        ],
        "non_negotiable_skills": ["python", "sql", "docker", "aws"],
        "min_experience_years": 5.0,
    },
    "product_manager": {
        "display_name": "Product Manager",
        "required_skills": [
            "sql",
            "data analysis",
            "aws",
            "javascript",
        ],
        "optional_skills": [
            "python",
            "machine learning",
            "react",
            "postgresql",
            "docker",
        ],
        "non_negotiable_skills": ["sql", "data analysis"],
        "min_experience_years": 4.0,
    },
    "data_scientist": {
        "display_name": "Data Scientist",
        "required_skills": [
            "python",
            "sql",
            "machine learning",
            "data analysis",
        ],
        "optional_skills": [
            "javascript",
            "aws",
            "docker",
            "postgresql",
            "mongodb",
            "linux",
        ],
        "non_negotiable_skills": ["python", "machine learning", "data analysis"],
        "min_experience_years": 3.0,
    },
    "ux_designer": {
        "display_name": "UX Designer",
        "required_skills": [
            "javascript",
            "react",
            "data analysis",
        ],
        "optional_skills": [
            "python",
            "sql",
            "aws",
            "docker",
        ],
        "non_negotiable_skills": ["javascript", "react", "data analysis"],
        "min_experience_years": 3.0,
    },
    "engineering_manager": {
        "display_name": "Engineering Manager",
        "required_skills": [
            "python",
            "javascript",
            "sql",
            "docker",
            "aws",
            "git",
        ],
        "optional_skills": [
            "kubernetes",
            "react",
            "node.js",
            "postgresql",
            "linux",
            "machine learning",
        ],
        "non_negotiable_skills": ["python", "docker", "aws", "git"],
        "min_experience_years": 6.0,
    },
    "devops_engineer": {
        "display_name": "DevOps Engineer",
        "required_skills": [
            "docker",
            "kubernetes",
            "aws",
            "linux",
            "git",
            "python",
        ],
        "optional_skills": [
            "javascript",
            "postgresql",
            "mongodb",
            "azure",
            "gcp",
            "react",
        ],
        "non_negotiable_skills": ["docker", "kubernetes", "aws", "linux"],
        "min_experience_years": 4.0,
    },
}


def normalize_role_key(target_role: str) -> str:
    """
    Normalize role name for lookup: lowercase, strip spaces, snake_case.
    Example: "UX Designer" -> "ux_designer", "Senior Software Engineer" -> "senior_software_engineer".
    ALL role lookups MUST use this function.
    """
    if not target_role or not isinstance(target_role, str):
        return ""
    s = target_role.strip().lower()
    s = s.replace(" ", "_").replace("-", "_")
    while "__" in s:
        s = s.replace("__", "_")
    return s.strip("_")


def get_role_definition(target_role: str) -> Optional[Dict[str, Any]]:
    """
    Return the role definition for the given role string.
    Lookup is STRICT: only by normalized key. Returns None if not found.
    No fallback to display_name or any other role.
    """
    key = normalize_role_key(target_role)
    if not key or key not in ROLE_DEFINITIONS:
        return None
    return ROLE_DEFINITIONS[key].copy()


def get_role_definition_or_raise(target_role: str) -> Dict[str, Any]:
    """
    Return the role definition or raise ValueError if role is unknown.
    Caller should map ValueError to HTTP 400.
    """
    key = normalize_role_key(target_role)
    if not key:
        raise ValueError("Role name is empty or invalid.")
    if key not in ROLE_DEFINITIONS:
        raise ValueError(f"Unknown role: '{target_role}'. Valid roles: {list(ROLE_DEFINITIONS.keys())}.")
    return ROLE_DEFINITIONS[key].copy()


def list_roles() -> List[Dict[str, Any]]:
    """Return list of roles for UI (display_name and slug)."""
    return [
        {"key": slug, "display_name": defn["display_name"]}
        for slug, defn in ROLE_DEFINITIONS.items()
    ]
