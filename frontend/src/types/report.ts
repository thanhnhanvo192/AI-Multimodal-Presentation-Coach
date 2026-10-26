export interface AnalysisReport {
  id?: string;
  sessionId?: string | number;
  overallScore: number;
  wpm: number;
  eyeContactScore: number;
  facialEmotion: string;
  bodyLanguageScore: number;
  volumeScore: number;
  fillerWordCount: number;
  transcript?: string;
  feedbackTips?: string[];
}
