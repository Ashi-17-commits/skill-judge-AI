import os
from functools import lru_cache
from pathlib import Path
from typing import List

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    load_dotenv()


def _parse_cors_origins() -> List[str]:
    """Parse CORS_ORIGINS env (comma-separated). No localhost in value for production."""
    raw = os.getenv("CORS_ORIGINS", "").strip()
    if not raw:
        return []
    return [o.strip() for o in raw.split(",") if o.strip()]


class Settings:
    """
    Central application settings.

    Loaded from environment variables so the same code can run in
    local, staging and production with different configuration.
    """

    PROJECT_NAME: str = "Skill Judge AI - Backend"
    API_V1_PREFIX: str = "/api"
    UPLOAD_DIR: Path = BASE_DIR / "app" / "uploads"

    # Render: bind to 0.0.0.0 and use PORT
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = "llama3-8b-8192"
    GROQ_TEMPERATURE: float = 0.3


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings instance so configuration is evaluated once.
    """
    settings = Settings()
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return settings


def get_cors_origins() -> List[str]:
    """CORS allowed origins: from CORS_ORIGINS env, plus dev fallbacks if unset."""
    from_env = _parse_cors_origins()
    if from_env:
        return from_env
    return [
        "https://skill-judge-ai-86rg.onrender.com",
        "https://skill-judge-ai-tm61.onrender.com",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ]


settings = get_settings()
