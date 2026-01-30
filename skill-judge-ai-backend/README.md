## Skill Judge AI - Backend

Skill Judge AI is a hackathon-ready backend that performs **deterministic resume evaluation** and uses Groq's LLaMA‑3 model **only for human‑readable explanations**.

The core idea is:

- **Deterministic engine**: All scoring logic (skills, experience, metrics) is rule‑based and reproducible.
- **LLM explainer**: Groq transforms the raw facts into a concise explanation for humans.

### Features

- **Resume upload API** (`PDF` or `DOCX`)
- **Text extraction** with `pdfplumber` and `python-docx`
- **Rule-based parsing** of skills, experience and impact metrics
- **ATS-style scoring** without any LLM involvement
- **Groq LLaMA‑3** explanation that returns strict JSON (no free‑form prose)
- **FastAPI** with fully typed response models so Swagger shows complete schemas

---

## Project structure

```text
skill-judge-ai-backend/
├── app/
│   ├── main.py                 # FastAPI app factory and wiring
│   │
│   ├── core/
│   │   ├── config.py           # Settings, env loading, upload dir
│   │   └── database.py         # Mongo-ready placeholder client
│   │
│   ├── api/
│   │   └── resume.py           # /api/resume/upload endpoint
│   │
│   ├── models/
│   │   └── resume_response.py  # Pydantic response models
│   │
│   ├── services/
│   │   ├── text_extractor.py   # PDF/DOCX text extraction
│   │   ├── resume_parser.py    # Skill & experience parsing
│   │   ├── ats_engine.py       # Deterministic ATS scoring
│   │   └── groq_explainer.py   # Groq LLaMA‑3 explanation
│   │
│   └── uploads/                # Local storage for uploaded resumes
│
├── .env                        # Environment variables (GROQ API key)
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

---

## Setup

### 1. Create and activate a virtual environment

```bash
cd skill-judge-ai-backend

python -m venv .venv

# Windows (PowerShell)
.venv\\Scripts\\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure Groq API key

Create a `.env` file in the project root (or edit the generated one) with:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

The app uses `python-dotenv` to load this file automatically on startup.  
If `GROQ_API_KEY` is missing, the backend will still evaluate resumes but will fall back to a deterministic explanation instead of calling Groq.

---

## Running the backend

From the project root (`skill-judge-ai-backend`):

```bash
uvicorn app.main:app --reload
```

The API will be available at:

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## API: Resume upload and evaluation

### Endpoint

- **Method**: `POST`
- **Path**: `/api/resume/upload`
- **Content type**: `multipart/form-data`
- **Field**: `file` (the uploaded resume)
- **Supported formats**: `.pdf`, `.docx`

### Example request (cURL)

```bash
curl -X POST "http://localhost:8000/api/resume/upload" ^
  -H "accept: application/json" ^
  -H "Content-Type: multipart/form-data" ^
  -F "file=@your_resume.pdf;type=application/pdf"
```

Or use the Swagger UI file upload widget.

### Response shape

The response is fully typed using Pydantic so Swagger shows the complete schema.  
At a high level, the JSON looks like:

- **file_name**: Original uploaded filename.
- **content_type**: MIME type detected by FastAPI.
- **ats_facts**:
  - **ats_score**: `0-100` ATS-style score based on deterministic rules.
  - **skills_found**: List of canonical skills detected in the resume.
  - **missing_skills**: Target skills that were not found.
  - **impact_score**: `0-1` normalized score for quantified impact.
  - **experience_years**: Estimated years of experience.
- **explanation** (from Groq or deterministic fallback):
  - **verdict**: Overall qualitative verdict.
  - **summary**: Short summary of alignment with typical roles.
  - **strengths**: Array of strength statements.
  - **skill_gaps**: Array of gap statements.
  - **next_actions**: Array of concrete next steps.
- **raw_text_preview**: Optional first lines of extracted text for debugging/demo.

---

## How the evaluation works

### 1. Text extraction (`text_extractor.py`)

- For **PDF** files, the app uses `pdfplumber` to read all pages and concatenate text.
- For **DOCX** files, the app uses `python-docx` to read paragraph text.
- Only the extracted text is passed to the deterministic parser.

### 2. Deterministic parsing (`resume_parser.py`)

- Normalizes whitespace and tokenizes the text.
- Looks for a fixed set of canonical technical skills using case-insensitive matching.
- Estimates years of experience by:
  - Matching phrases like `"3+ years of experience"` or `"5 yrs"`.
  - Detecting year ranges such as `"2018-2022"` or `"2019–present"`.
- Flags sentences that contain likely metrics (keywords such as `"improved"`, `"reduced"`, `"%"`, `"latency"`, etc.).

### 3. ATS scoring (`ats_engine.py`)

- Uses **only deterministic rules** (no LLM calls).
- Computes:
  - A skills coverage score (how many target skills are present).
  - An experience score that saturates around 10 years.
  - An impact score based on how many metric sentences were found.
- Aggregates these into a single `ats_score` with simple weights:
  - `40%` skills, `40%` experience, `20%` impact.

### 4. LLM explanation (`groq_explainer.py`)

- Takes the `ats_facts` object (fully deterministic data).
- Calls Groq's **LLaMA‑3 `llama3-8b-8192`** model with:
  - `temperature = 0.3` for stable, focused output.
  - A system prompt that requires strict JSON with keys:
    - `verdict`
    - `summary`
    - `strengths` (array)
    - `skill_gaps` (array)
    - `next_actions` (array)
- Parses the JSON response using `json.loads` with a small helper that strips accidental Markdown fences if present.
- If the Groq call fails or returns invalid JSON, the service raises and the API layer builds a **rule-based fallback explanation** directly from `ats_facts`.

### 5. API layer (`api/resume.py`)

- Validates the uploaded file type (`.pdf` or `.docx`).
- Saves it under `app/uploads/` with a safe filename.
- Runs extraction → parsing → ATS scoring → Groq explanation.
- Returns a `ResumeEvaluationResponse` object so the OpenAPI schema is fully specified.
- If Groq is unavailable, the fallback explanation is clearly indicated in the `summary` field while still being structured.

---

## Notes for production hardening

For a hackathon MVP, this backend is intentionally lightweight. For a production deployment, consider:

- Replacing the `database.py` placeholder with a real MongoDB client (e.g. `motor`).
- Adding authentication/authorization around the resume upload endpoint.
- Adding rate limiting and input size limits for very large resumes.
- Persisting evaluations for analytics and comparison across candidates.
- Extending the `CANONICAL_SKILLS` set and metric detection rules to match your domain.

