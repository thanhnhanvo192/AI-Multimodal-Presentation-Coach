from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union

class ActivityDataPoint(BaseModel):
    label: str
    sessions: int

class TopicDistribution(BaseModel):
    context: str
    count: int
    percentage: int

class RecentPracticeActivity(BaseModel):
    id: Union[int, str]
    title: str
    context: str
    userName: str
    duration: str
    score: float
    date: str

class AdminKPIsResponse(BaseModel):
    totalStudents: int
    activeStudents: int
    totalSessions: int
    avgScore: float
    completionRate: float
    # Snake_case compatibility
    total_users: Optional[int] = None
    active_users_today: Optional[int] = None
    total_sessions: Optional[int] = None
    avg_system_score: Optional[float] = None
    completion_rate: Optional[float] = None
    
    activity_chart_7d: List[ActivityDataPoint] = []
    activity_chart_14d: List[ActivityDataPoint] = []
    topic_distribution: List[TopicDistribution] = []
    recent_activities: List[RecentPracticeActivity] = []

class AdminUserItem(BaseModel):
    id: str
    name: str
    email: str
    role: str = "student"
    sessions_count: int = 0
    status: str = "active"  # "active" | "banned"
    created_at: datetime

class AdminUsersListResponse(BaseModel):
    total: int
    items: List[AdminUserItem]

class AdminUserStatusUpdate(BaseModel):
    status: str  # "active" | "banned"

class AIWeights(BaseModel):
    eye_contact: float = 0.25
    speech_rate: float = 0.25
    body_language: float = 0.20
    pitch: float = 0.15
    content: float = 0.15

class AdminSystemConfig(BaseModel):
    min_eye_contact_pct: int = 70
    ideal_wpm_min: int = 130
    ideal_wpm_max: int = 160
    max_filler_words_allowed: int = 4
    max_uploads_per_window: int = 5
    rate_limit_window_minutes: int = 10
    max_file_size_mb: int = 200
    weights: AIWeights = Field(default_factory=AIWeights)

class AdminLogItem(BaseModel):
    id: str
    timestamp: str
    level: str  # "INFO" | "WARNING" | "ERROR" | "DEBUG"
    service: str
    message: str
    statusCode: Optional[int] = None
    requestId: Optional[str] = None
    endpoint: Optional[str] = None
    ip: Optional[str] = None
    userId: Optional[str] = None
    duration: Optional[str] = None
    details: Optional[str] = None
    stackTrace: Optional[str] = None

class AdminLogsResponse(BaseModel):
    total: int
    items: List[AdminLogItem]
