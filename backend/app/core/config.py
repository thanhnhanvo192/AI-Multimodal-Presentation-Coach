import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.dirname(APP_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

def _find_dir(*candidates: str) -> str:
    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)
    return os.path.abspath(candidates[0])

DEFAULT_WEIGHTS_DIR = _find_dir(
    os.path.join(PROJECT_ROOT, "weights"),
    os.path.join(BACKEND_DIR, "weights"),
    "/app/weights"
)

DEFAULT_SCRIPTS_DIR = _find_dir(
    os.path.join(PROJECT_ROOT, "scripts"),
    os.path.join(BACKEND_DIR, "scripts"),
    "/app/scripts"
)

DEFAULT_TEMP_DIR = os.path.join(PROJECT_ROOT, "data", "processed", "temp_eval")

class Settings(BaseSettings):
    PROJECT_NAME: str = "PBL6 AI Presentation Coach"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-key-change-in-production-pbl6-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./pbl6_local.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage
    UPLOAD_DIR: str = os.path.join(BACKEND_DIR, "uploads")
    MAX_FILE_SIZE_MB: int = 100

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

    # AI Multimodal Configuration
    WEIGHTS_DIR: str = DEFAULT_WEIGHTS_DIR
    SCRIPTS_DIR: str = DEFAULT_SCRIPTS_DIR
    TEMP_EVAL_DIR: str = DEFAULT_TEMP_DIR
    AI_SAMPLE_FPS: float = 1.5
    GEMINI_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def model_post_init(self, __context):
        if self.UPLOAD_DIR.startswith("/app") and not os.path.exists("/app"):
            self.UPLOAD_DIR = os.path.join(BACKEND_DIR, "uploads")
        if self.WEIGHTS_DIR.startswith("/app") and not os.path.exists("/app"):
            self.WEIGHTS_DIR = DEFAULT_WEIGHTS_DIR
        if self.SCRIPTS_DIR.startswith("/app") and not os.path.exists("/app"):
            self.SCRIPTS_DIR = DEFAULT_SCRIPTS_DIR
        # Fallback to local sqlite if postgresql host 'db' is unreachable in non-docker dev/test
        if "postgresql" in self.DATABASE_URL and "@db:" in self.DATABASE_URL:
            self.DATABASE_URL = "sqlite+aiosqlite:///./pbl6_local.db"

settings = Settings()
