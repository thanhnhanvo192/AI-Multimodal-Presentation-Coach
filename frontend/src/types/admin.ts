export type LogLevel = "INFO" | "WARNING" | "ERROR" | "DEBUG";

export interface ServerLogItem {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  statusCode?: number;
  requestId?: string;
  endpoint?: string;
  ip?: string;
  userId?: string;
  duration?: string;
  details?: string;
  stackTrace?: string;
}

export interface AdminKPIs {
  totalStudents: number;
  activeStudents: number;
  totalSessions: number;
  avgScore: number;
  completionRate: number;
}

export interface ActivityDataPoint {
  label: string;
  sessions: number;
}

export interface TopicDistribution {
  context: string;
  count: number;
  percentage: number;
}

export interface RecentPracticeActivity {
  id: string | number;
  title: string;
  context: string;
  userName: string;
  duration: string;
  score: number;
  date: string;
}

export interface AdminKPIsResponse extends AdminKPIs {
  activity_chart_7d?: ActivityDataPoint[];
  activity_chart_14d?: ActivityDataPoint[];
  topic_distribution?: TopicDistribution[];
  recent_activities?: RecentPracticeActivity[];
}

export interface AdminSystemConfig {
  min_eye_contact_pct: number;
  ideal_wpm_min: number;
  ideal_wpm_max: number;
  max_filler_words_allowed: number;
  max_uploads_per_window: number;
  rate_limit_window_minutes: number;
  max_file_size_mb: number;
  weights?: {
    eye_contact: number;
    speech_rate: number;
    body_language: number;
    pitch: number;
    content: number;
  };
}

export interface AdminUsersListResponse {
  total: number;
  items: {
    id: string;
    name: string;
    email: string;
    role?: string;
    sessions_count: number;
    status: "active" | "banned";
    created_at?: string;
  }[];
}

export interface AdminLogsResponse {
  total: number;
  items: ServerLogItem[];
}
