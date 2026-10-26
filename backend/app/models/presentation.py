import enum
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

class PresentationStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class PresentationScenario(str, enum.Enum):
    ACADEMIC = "ACADEMIC"        # Thuyết trình Đồ án / Học thuật
    PITCHING = "PITCHING"        # Pitching Khởi nghiệp / Gọi vốn
    INTERVIEW = "INTERVIEW"      # Phỏng vấn xin việc

class Presentation(Base):
    __tablename__ = "presentations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="Bài thuyết trình chưa đặt tên")
    video_path: Mapped[str] = mapped_column(String(512), nullable=False)
    scenario: Mapped[PresentationScenario] = mapped_column(Enum(PresentationScenario), default=PresentationScenario.ACADEMIC)
    status: Mapped[PresentationStatus] = mapped_column(Enum(PresentationStatus), default=PresentationStatus.PENDING)
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="presentations")
    analysis_result: Mapped["AnalysisResult"] = relationship("AnalysisResult", back_populates="presentation", uselist=False, cascade="all, delete-orphan")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    presentation_id: Mapped[int] = mapped_column(ForeignKey("presentations.id"), unique=True, nullable=False)
    total_score: Mapped[float] = mapped_column(Float, default=0.0)
    badge_title: Mapped[str] = mapped_column(String(255), default="Diễn giả Mới")
    
    # Store complex JSON structures
    radar_scores: Mapped[dict] = mapped_column(JSON, default=dict)       # {eye_contact, body_language, speech_rate, pitch, content}
    timeline_errors: Mapped[list] = mapped_column(JSON, default=list)    # [{timestamp, type, message}]
    audio_metrics: Mapped[dict] = mapped_column(JSON, default=dict)      # {wpm, pause_count, filler_words_count, pitch_variation}
    transcript: Mapped[dict] = mapped_column(JSON, default=dict)         # {full_text, words: [{word, start, end, is_filler}]}
    ai_feedback: Mapped[dict] = mapped_column(JSON, default=dict)        # {strengths: [], weaknesses: [], action_items: []}

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    presentation: Mapped["Presentation"] = relationship("Presentation", back_populates="analysis_result")
