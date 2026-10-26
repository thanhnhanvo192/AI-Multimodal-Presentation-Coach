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
