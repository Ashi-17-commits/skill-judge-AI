# Skill Judge AI

Skill Judge AI is a full-stack resume assessment platform.
It combines deterministic scoring with AI-assisted language polishing to produce clear, structured candidate evaluations.

## Repository Structure

- `/home/runner/work/skill-judge-AI/skill-judge-AI/Skilljudgeaiuidesign` — React + Vite frontend
- `/home/runner/work/skill-judge-AI/skill-judge-AI/skill-judge-ai-backend` — FastAPI backend

## Core Capabilities

- Upload and parse resumes in PDF or DOCX format
- Evidence-based ATS scoring with deterministic rules
- Role-readiness analysis for predefined job roles
- Structured API responses for frontend integration
- Optional Groq-based rewrite for verdict and summary tone

## Tech Stack

### Frontend
- React 18 + Vite
- Material UI + Radix UI
- Tailwind CSS

### Backend
- FastAPI + Uvicorn
- Pydantic
- pdfplumber + python-docx
- Groq API (optional enhancement layer)

## Prerequisites

- Node.js 18+
- pnpm
- Python 3.9+
- pip

## Local Development

### 1) Start Backend

```bash
cd /home/runner/work/skill-judge-AI/skill-judge-AI/skill-judge-ai-backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
python -m app.main
```

Backend runs on `http://localhost:8000` by default.

### 2) Start Frontend

```bash
cd /home/runner/work/skill-judge-AI/skill-judge-AI/Skilljudgeaiuidesign
pnpm install
pnpm dev
```

Frontend runs on `http://localhost:5173` by default.

## Backend Environment Variables

Create `/home/runner/work/skill-judge-AI/skill-judge-AI/skill-judge-ai-backend/.env` as needed:

```env
GROQ_API_KEY=your_groq_api_key
CORS_ORIGINS=http://localhost:5173
HOST=0.0.0.0
PORT=8000
```

Notes:
- `GROQ_API_KEY` is optional. Without it, deterministic evaluation still works.
- `CORS_ORIGINS` accepts comma-separated values.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Service health check |
| `GET` | `/docs` | Swagger UI |
| `POST` | `/api/resume/upload` | Upload and evaluate a resume |
| `POST` | `/api/role/analyze` | Analyze role readiness using `resume_id` |

## Quick Validation

Backend test scripts:

```bash
cd /home/runner/work/skill-judge-AI/skill-judge-AI/skill-judge-ai-backend
python create_test_resume.py
python send_test_upload.py
python test_role_api.py
```

Frontend production build:

```bash
cd /home/runner/work/skill-judge-AI/skill-judge-AI/Skilljudgeaiuidesign
pnpm build
```

## Deployment Notes

For deployment setup and production diagnostics, refer to:

- `/home/runner/work/skill-judge-AI/skill-judge-AI/DEPLOYMENT_VERIFICATION.md`
- `/home/runner/work/skill-judge-AI/skill-judge-AI/RENDER_ENV_SETUP.md`
- `/home/runner/work/skill-judge-AI/skill-judge-AI/PRODUCTION_CONNECTION_FINAL_REPORT.md`

## Contributing

1. Create a feature branch
2. Keep changes focused and reviewable
3. Open a pull request with clear testing notes
