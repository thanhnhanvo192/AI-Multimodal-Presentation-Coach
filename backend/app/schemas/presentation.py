from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.models.presentation import PresentationStatus, PresentationScenario

class PresentationCreate(BaseModel):
    title: Optional[str] = "Bài thuyết trình chưa đặt tên"
    scenario: PresentationScenario = PresentationScenario.ACADEMIC

class PresentationUploadResponse(BaseModel):
    id: int
    title: str
    scenario: PresentationScenario
    status: PresentationStatus
    progress_percentage: int
    created_at: datetime

    class Config:
        from_attributes = True

class PresentationStatusResponse(BaseModel):
    id: int
    status: PresentationStatus
    progress_percentage: int
    error_message: Optional[str] = None

class RadarScores(BaseModel):
    eye_contact: float
    body_language: float
    speech_rate: float
    pitch: float
    content: float

class TimelineErrorItem(BaseModel):
    timestamp: float
    type: str
    message: str

class AudioMetrics(BaseModel):
    wpm: int
    pause_count: int
    filler_words_count: int
    pitch_variation: str

class AIFeedback(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    action_items: List[str]

class AnalysisReportResponse(BaseModel):
    presentation_id: int
    title: str
    video_url: str
    total_score: float
    badge_title: str
    radar_scores: RadarScores
    timeline_errors: List[TimelineErrorItem]
    audio_metrics: AudioMetrics
    transcript: Dict[str, Any]
    ai_feedback: AIFeedback
    created_at: datetime
