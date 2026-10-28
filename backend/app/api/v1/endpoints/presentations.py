import os
import uuid
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.config import settings
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.presentation import Presentation, PresentationStatus, PresentationScenario, AnalysisResult
from app.schemas.presentation import (
    PresentationUploadResponse,
    PresentationStatusResponse,
    AnalysisReportResponse
)
from app.services.video_processor import process_video_background

router = APIRouter(prefix="/presentations", tags=["Presentations"])

ALLOWED_EXTENSIONS = {".mp4", ".webm", ".avi", ".mov"}

@router.post("/upload", response_model=PresentationUploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_presentation_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form("Bài thuyết trình chưa đặt tên"),
    scenario: PresentationScenario = Form(PresentationScenario.ACADEMIC),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Validate File Extension
    file_ext = os.path.splitext(file.filename or "")[1].lower()
    if not file_ext or file_ext not in ALLOWED_EXTENSIONS:
        if file.content_type and "webm" in file.content_type:
            file_ext = ".webm"
        elif file.content_type and "mp4" in file.content_type:
            file_ext = ".mp4"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Định dạng file không hỗ trợ ({file_ext}). Chỉ chấp nhận: {', '.join(ALLOWED_EXTENSIONS)}"
            )

    # Ensure Upload Directory Exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Generate Unique Filename
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    saved_file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Save Uploaded File Stream
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Kích thước file vượt quá giới hạn tối đa {settings.MAX_FILE_SIZE_MB}MB"
        )

    with open(saved_file_path, "wb") as f:
        f.write(contents)

    # Save Database Record
    new_presentation = Presentation(
        user_id=current_user.id,
        title=title,
        video_path=saved_file_path,
        scenario=scenario,
        status=PresentationStatus.PENDING,
        progress_percentage=0
    )
    db.add(new_presentation)
    await db.commit()
    await db.refresh(new_presentation)

    # Dispatch Background AI Processing Task
    background_tasks.add_task(process_video_background, new_presentation.id)

    return new_presentation

@router.get("/{presentation_id}/status", response_model=PresentationStatusResponse)
async def get_presentation_status(
    presentation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Presentation).where(
            Presentation.id == presentation_id,
            Presentation.user_id == current_user.id
        )
    )
    presentation = result.scalar_one_or_none()
    if not presentation:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài thuyết trình")

    return presentation

@router.get("/{presentation_id}/report", response_model=AnalysisReportResponse)
async def get_presentation_analysis_report(
    presentation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Presentation)
        .options(selectinload(Presentation.analysis_result))
        .where(
            Presentation.id == presentation_id,
            Presentation.user_id == current_user.id
        )
    )
    presentation = result.scalar_one_or_none()
    if not presentation:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài thuyết trình")

    if presentation.status != PresentationStatus.COMPLETED or not presentation.analysis_result:
        raise HTTPException(
            status_code=400,
            detail=f"Bài thuyết trình chưa hoàn thành phân tích. Trạng thái hiện tại: {presentation.status}"
        )

    res = presentation.analysis_result
    video_filename = os.path.basename(presentation.video_path)
    video_url = f"/uploads/{video_filename}"

    return {
        "presentation_id": presentation.id,
        "title": presentation.title,
        "video_url": video_url,
        "total_score": res.total_score,
        "badge_title": res.badge_title,
        "radar_scores": res.radar_scores,
        "timeline_errors": res.timeline_errors,
        "audio_metrics": res.audio_metrics,
        "transcript": res.transcript,
        "ai_feedback": res.ai_feedback,
        "created_at": res.created_at
    }

@router.get("/history", response_model=List[PresentationUploadResponse])
async def get_presentation_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Presentation)
        .where(Presentation.user_id == current_user.id)
        .order_by(Presentation.created_at.desc())
    )
    presentations = result.scalars().all()
    return presentations
