from pathlib import Path
from typing import Literal

import pdfplumber
from docx import Document


SupportedExtension = Literal[".pdf", ".docx"]


def detect_extension(file_path: Path) -> SupportedExtension:
    """
    Validate and normalize a file extension for supported resume types.
    """

    ext = file_path.suffix.lower()
    if ext not in {".pdf", ".docx"}:
        raise ValueError("Unsupported file type. Only PDF and DOCX are allowed.")
    return ext  # type: ignore[return-value]


def extract_text_from_pdf(file_path: Path) -> str:
    """
    Extract plain text from a PDF using pdfplumber.

    The function concatenates text from all pages and strips trailing
    whitespace while preserving basic line breaks for downstream parsing.
    """

    text_parts: list[str] = []
    with pdfplumber.open(str(file_path)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts).strip()


def extract_text_from_docx(file_path: Path) -> str:
    """
    Extract plain text from a DOCX file using python-docx.
    """

    doc = Document(str(file_path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs).strip()


def extract_text(file_path: Path) -> str:
    """
    Dispatch to the correct extraction routine based on file extension.
    """

    ext = detect_extension(file_path)
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    if ext == ".docx":
        return extract_text_from_docx(file_path)
    # The extension check above guarantees this line is not reachable in
    # normal operation but is left here as a defensive guard.
    raise ValueError(f"Unsupported file extension: {ext}")
