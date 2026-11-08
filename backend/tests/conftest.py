import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Testing Mode Flags

os.environ["TESTING"] = "true"
TEST_DB_FILE = os.path.join(backend_dir, "pbl6_test.db")
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{TEST_DB_FILE}"
os.environ["SECRET_KEY"] = "test-secret-key-for-automated-testing-pbl6-2026"
os.environ["UPLOAD_DIR"] = os.path.join(backend_dir, "uploads_test")

import pytest
import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Testing Mode Flags
os.environ["TESTING"] = "true"
TEST_DB_FILE = os.path.join(backend_dir, "pbl6_test.db")
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{TEST_DB_FILE}"
os.environ["SECRET_KEY"] = "test-secret-key-for-automated-testing-pbl6-2026"
os.environ["UPLOAD_DIR"] = os.path.join(backend_dir, "uploads_test")

import pytest
import pytest_asyncio
from app.core.database import engine, Base


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    os.makedirs(os.environ["UPLOAD_DIR"], exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    await engine.dispose()
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass
