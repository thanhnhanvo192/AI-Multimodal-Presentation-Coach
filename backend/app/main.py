import os
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
from app.core.seeder import seed_initial_users
from app.api.v1.router import api_router
from app.services.video_stream import stream_video_partial

logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables if they do not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.TEMP_EVAL_DIR, exist_ok=True)

    # Seed initial demo accounts
    await seed_initial_users()

    # Pre-warm AI Engine in worker thread to prevent latency on first request
    if not os.environ.get('TESTING'):
        def _warmup():
            try:
                from app.services.ai_engine_service import get_ai_engine
                get_ai_engine()
            except Exception as ex:
                logger.warning(f"AI Engine warm-up skipped or deferred: {ex}")

        asyncio.create_task(asyncio.to_thread(_warmup))

    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicit Streaming Route for Uploaded Videos with HTTP 206 & CORS
@app.get("/uploads/{filename}")
async def serve_uploaded_video_with_range(filename: str, request: Request):
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File video không tồn tại")
    return stream_video_partial(request, file_path)

# Serve uploaded video static files as fallback
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0"
    }
