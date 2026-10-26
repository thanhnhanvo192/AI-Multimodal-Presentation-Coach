export interface PresentationSession {
  id: number | string;
  date: string;
  title: string;
  context: string;
  duration: string;
  score: number;
  trend: number;
  eyeContact: number;
  wpm: number;
  fillerWords: number;
}

export interface WeeklyScoreTrend {
  label: string;
  score: number;
  sessions: number;
  topSkill: string;
}
