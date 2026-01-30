import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    load_dotenv()


class Settings:
    """
    Central application settings.

    Loaded from environment variables so the same code can run in
    local, staging and production with different configuration.
    """

    PROJECT_NAME: str = "Skill Judge AI - Backend"
    API_V1_PREFIX: str = "/api"
    UPLOAD_DIR: Path = BASE_DIR / "app" / "uploads"

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


settings = get_settings()
