"""
In-memory store for parsed resume data keyed by resume_id.

Used so POST /api/role/analyze can look up resume skills and experience
by the resume_id returned from upload. Not persisted across restarts.
"""

import uuid
from typing import Dict, Optional

from app.services.resume_parser import ResumeSignals

_store: Dict[str, ResumeSignals] = {}


def put(resume_id: str, signals: ResumeSignals) -> None:
    """Store parsed resume signals under resume_id."""
    _store[resume_id] = signals


def get(resume_id: str) -> Optional[ResumeSignals]:
    """Return stored signals for resume_id, or None."""
    return _store.get(resume_id)


def generate_id() -> str:
    """Return a new unique resume_id (UUID)."""
    return str(uuid.uuid4())
