from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.resume import router as resume_router
from app.api.role import router as role_router
from app.core.config import settings
from app.core.database import db_client


def create_app() -> FastAPI:
    """
    Application factory for the Skill Judge AI backend.
    """

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="0.1.0",
        description=(
            "Hackathon-ready backend for deterministic resume evaluation with "
            "LLM-based explanations."
        ),
    )

    # CORS configuration - Allow only deployed frontend and localhost for development
    allowed_origins = [
        "https://skill-judge-ai-86rg.onrender.com",  # Production frontend
        "http://localhost:5173",  # Local development
        "http://localhost:5174",  # Local development (fallback port)
        "http://localhost:5175",  # Local development (fallback port)
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    # Then include routers
    app.include_router(resume_router, prefix=settings.API_V1_PREFIX)
    app.include_router(role_router, prefix=settings.API_V1_PREFIX)

    # Mount static files (React dist)
    frontend_path = Path(__file__).parent / "frontend"
    if frontend_path.exists():
        app.mount("/assets", StaticFiles(directory=frontend_path / "assets"), name="assets")

    # Request logging middleware for production debugging
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        """Log incoming API requests from frontend."""
        if request.url.path.startswith("/api"):
            origin = request.headers.get("origin", "unknown")
            print(f"[API REQUEST] {request.method} {request.url.path} from {origin}")
        response = await call_next(request)
        return response

    @app.on_event("startup")
    async def on_startup() -> None:
        """
        Initialize shared resources such as the (optional) database client.
        """
        print(f"[STARTUP] Skill Judge AI Backend starting...")
        print(f"[STARTUP] Allowed CORS origins: {allowed_origins}")
        await db_client.connect()

    @app.on_event("shutdown")
    async def on_shutdown() -> None:
        """
        Cleanly release external resources on shutdown.
        """

        await db_client.disconnect()

    @app.get("/", include_in_schema=False)
    async def serve_root() -> FileResponse:
        """
        Serve index.html for the root path (React SPA entry point).
        """
        frontend_path = Path(__file__).parent / "frontend"
        index_file = frontend_path / "index.html"
        
        if index_file.exists():
            return FileResponse(index_file)
        
        return JSONResponse(
            status_code=200,
            content={
                "name": settings.PROJECT_NAME,
                "status": "ok",
            },
        )

    @app.get("/evaluate", include_in_schema=False)
    async def serve_evaluate() -> FileResponse:
        """
        Serve evaluate.html: standalone page that calls POST /api/resume/upload
        and displays overall_score, verdict, summary, score_breakdown.
        Connects frontend UI to backend logic.
        """
        frontend_path = Path(__file__).parent / "frontend"
        evaluate_file = frontend_path / "evaluate.html"
        if evaluate_file.exists():
            return FileResponse(evaluate_file)
        raise HTTPException(status_code=404, detail="Evaluate page not found")

    @app.get("/human", response_class=PlainTextResponse, tags=["Info"])
    async def human_readable(request: Request) -> PlainTextResponse:
        """
        Simple human-readable service information for browser testing and demos.
        """

        api_prefix = settings.API_V1_PREFIX.rstrip("/")
        lines = [
            f"{settings.PROJECT_NAME} - Service is running.",
            "",
            "Endpoints:",
            f"- Health: GET / (or http://localhost:8000/)",
            f"- API docs: http://localhost:8000/docs",
            f"- Upload resume (POST): http://localhost:8000{api_prefix}/resume/upload",
            "",
            "To upload a resume, POST a PDF or DOCX file as form-data 'file'.",
        ]

        return PlainTextResponse("\n".join(lines))

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        """Return human-friendly JSON for HTTPExceptions."""

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "message": str(exc.detail) if exc.detail else "Request error",
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        """Return concise validation errors suitable for display to users."""

        return JSONResponse(
            status_code=422,
            content={
                "message": "Invalid request data.",
                "details": exc.errors(),
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Catch-all handler that returns a user-friendly error message without internals."""

        return JSONResponse(
            status_code=500,
            content={
                "message": "An internal error occurred while processing your request. Please try again later.",
            },
        )

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str) -> FileResponse:
        """
        Serve index.html for any unmatched route (SPA fallback).
        This allows React Router to handle client-side routing.
        Skips API and doc routes.
        """
        # Don't serve SPA for API, docs, or evaluate (has its own route)
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi") or full_path.startswith("redoc") or full_path == "evaluate":
            raise HTTPException(status_code=404, detail="Not found")
        
        frontend_path = Path(__file__).parent / "frontend"
        index_file = frontend_path / "index.html"
        
        if index_file.exists():
            return FileResponse(index_file)
        
        raise HTTPException(status_code=404, detail="Frontend not found")

    return app


app = create_app()

