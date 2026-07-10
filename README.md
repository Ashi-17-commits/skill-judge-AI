# Skill Judge AI

Skill Judge AI is a two-part project for resume evaluation:
- a React frontend in `/Skilljudgeaiuidesign`
- a FastAPI backend in `/skill-judge-ai-backend`

The backend computes deterministic scoring from extracted resume data, then adds a short LLM-generated explanation.

## Repository layout

```text
skill-judge-AI/
├── Skilljudgeaiuidesign/          # React + Vite frontend
├── skill-judge-ai-backend/        # FastAPI backend
├── BUG_FIX_SUMMARY.md
├── DEPLOYMENT_VERIFICATION.md
├── IMPLEMENTATION_SUMMARY.md
├── PRODUCTION_BUG_FIX.md
├── PRODUCTION_BUG_FIX_VERIFICATION.md
├── PRODUCTION_CONNECTION_FINAL_REPORT.md
├── PRODUCTION_CONNECTION_STATUS.md
├── PRODUCTION_CONNECTION_SUMMARY.md
└── RENDER_ENV_SETUP.md
```

## Prerequisites

- Node.js 18+
- pnpm
- Python 3.9+
- pip
- Groq API key (for explanation generation)

## Run the frontend

```bash
cd Skilljudgeaiuidesign
pnpm install
pnpm dev
```

Default URL: `http://localhost:5173`

## Run the backend

```bash
cd skill-judge-ai-backend
pip install -r requirements.txt
```

Create `skill-judge-ai-backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
CORS_ORIGINS=http://localhost:5173
PROJECT_NAME=Skill Judge AI
HOST=0.0.0.0
PORT=8000
```

Start the API:

```bash
cd skill-judge-ai-backend
python -m app.main
```

Default URL: `http://localhost:8000`

## API docs

When the backend is running:
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Main endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/resume/upload` | Upload and parse a PDF or DOCX resume |
| `POST` | `/api/role/evaluate` | Score resume against role requirements |

## Testing scripts (backend)

These scripts are in `skill-judge-ai-backend/`:

```bash
python create_test_resume.py
python send_test_upload.py
python test_role_api.py
```

## Deployment notes

Render-related setup and production status docs are at the repository root:
- `RENDER_ENV_SETUP.md`
- `DEPLOYMENT_VERIFICATION.md`
- `PRODUCTION_CONNECTION_FINAL_REPORT.md`

## License

No license file is currently included.
