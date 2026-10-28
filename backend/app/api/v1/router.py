from fastapi import APIRouter
from app.api.v1.endpoints import auth, presentations, admin

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(presentations.router)
api_router.include_router(admin.router)
