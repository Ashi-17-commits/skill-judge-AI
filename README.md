# Skill Judge AI

An AI-powered resume evaluation platform that provides deterministic scoring with LLM-based explanations for job matching and skill assessment.

## 🎯 Overview

Skill Judge AI is a full-stack application designed to evaluate resumes against job role requirements using AI technology. The platform provides:

- **Automated Resume Analysis** - Upload PDF or DOCX resumes for instant evaluation
- **AI-Powered Scoring** - Deterministic scoring system with detailed explanations
- **Role Matching** - Compare candidate skills against specific job requirements
- **Modern UI** - Built with React and Material-UI for an intuitive user experience
- **RESTful API** - FastAPI backend for high-performance processing

## 🏗️ Architecture

The project consists of two main components:

### Frontend (`Skilljudgeaiuidesign/`)
- **Framework**: React 18.3.1 with Vite
- **UI Libraries**: 
  - Material-UI (MUI) v7
  - Radix UI components
  - TailwindCSS v4
- **Key Features**:
  - Drag-and-drop file upload
  - Interactive dashboard
  - Responsive design
  - Dark mode support (next-themes)

### Backend (`skill-judge-ai-backend/`)
- **Framework**: FastAPI 0.115.0
- **AI Integration**: Groq LLM API
- **Document Processing**:
  - PDF parsing (pdfplumber)
  - DOCX parsing (python-docx)
- **Key Features**:
  - Resume upload and parsing
  - Role-based evaluation API
  - CORS-enabled for frontend integration
  - Health check endpoints

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+) and **pnpm** for frontend
- **Python** (v3.9+) and **pip** for backend
- **Groq API Key** for AI functionality

### Frontend Setup

```bash
cd Skilljudgeaiuidesign
pnpm install
pnpm dev
```

The frontend will be available at `http://localhost:5173` (default Vite port)

### Backend Setup

```bash
cd skill-judge-ai-backend
pip install -r requirements.txt

# Set up environment variables
# Create a .env file with:
# GROQ_API_KEY=your_groq_api_key
# CORS_ORIGINS=http://localhost:5173

python -m app.main
```

The backend will be available at `http://localhost:8000`

### API Documentation

Once the backend is running, access the interactive API docs at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 📁 Project Structure

```
skill-judge-AI/
├── Skilljudgeaiuidesign/          # React frontend application
│   ├── src/                       # Source code
│   ├── package.json               # Frontend dependencies
│   └── vite.config.ts             # Vite configuration
│
├── skill-judge-ai-backend/        # FastAPI backend application
│   ├── app/
│   │   ├── main.py               # FastAPI application entry point
│   │   ├── api/                  # API route handlers
│   │   │   ├── resume.py         # Resume upload & evaluation
│   ���   │   └── role.py           # Role management endpoints
│   │   └── core/                 # Core utilities
│   │       ├── config.py         # Configuration management
│   │       └── database.py       # Database client
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # Backend-specific documentation
```

## 🔑 Key Features

### Resume Upload & Processing
```bash
POST /api/resume/upload
```
- Accepts PDF and DOCX files
- Extracts text content
- Returns structured resume data

### Role-Based Evaluation
```bash
POST /api/role/evaluate
```
- Compares resume against job requirements
- Provides scoring breakdown
- Generates AI-powered explanations

### Health Check
```bash
GET /health
```
- Simple endpoint for monitoring and load balancers

## 🛠️ Technology Stack

### Frontend
- **Build Tool**: Vite 6.3.5
- **Language**: TypeScript 5.7.3
- **Styling**: TailwindCSS 4.1.12
- **State Management**: React Hooks
- **Form Handling**: React Hook Form 7.55.0
- **Charts**: Recharts 2.15.2
- **Animations**: Framer Motion 12.23.24

### Backend
- **Web Framework**: FastAPI 0.115.0
- **ASGI Server**: Uvicorn 0.30.6
- **AI/LLM**: Groq 0.11.0
- **Validation**: Pydantic 2.9.2
- **Environment**: python-dotenv 1.0.1

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Root endpoint / frontend SPA |
| `GET` | `/health` | Health check |
| `GET` | `/human` | Human-readable service info |
| `GET` | `/evaluate` | Evaluation page |
| `POST` | `/api/resume/upload` | Upload and parse resume |
| `POST` | `/api/role/evaluate` | Evaluate resume against role |

## 🔐 Environment Variables

### Backend (.env)
```env
GROQ_API_KEY=your_groq_api_key_here
CORS_ORIGINS=http://localhost:5173,https://your-production-domain.com
PROJECT_NAME=Skill Judge AI
HOST=0.0.0.0
PORT=8000
```

## 🚢 Deployment

### Quick Deploy (Render.com)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables (see above)
4. Deploy with build command: `pip install -r skill-judge-ai-backend/requirements.txt`
5. Start command: `cd skill-judge-ai-backend && python -m app.main`

## 🧪 Testing

### Backend Testing
```bash
cd skill-judge-ai-backend
python create_test_resume.py  # Create test resume
python send_test_upload.py    # Test upload endpoint
python test_role_api.py        # Test role evaluation
```

## 📝 License

This project is currently unlicensed. Please add a LICENSE file to specify terms of use.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues & Bug Reports

If you encounter any issues, please open a GitHub issue with reproduction steps and relevant logs.

## 📧 Contact

For questions or support, please open an issue in this repository.

---

**Built with ❤️ for smarter hiring decisions**
