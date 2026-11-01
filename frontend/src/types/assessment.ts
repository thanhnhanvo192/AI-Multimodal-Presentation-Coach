export interface RubricScores {
  eye_contact_score: number;
  head_posture_score: number;
  facial_expression_score: number;
  speech_rate_score: number;
  filler_control_score: number;
}

export interface ShapItem {
  feature: string;
  description: string;
  impact: number;
  measured_value: number;
}

export interface ShapExplanation {
  base_score_phi0: number;
  top_penalties: ShapItem[];
  top_strengths: ShapItem[];
}

export interface HeadPose {
  yaw: number;
  pitch: number;
  roll: number;
}

export interface TelemetryPoint {
  timestamp_sec: number;
  head_pose: HeadPose;
  eye_contact: boolean;
  smile_intensity: number;
  pitch_f0_hz: number;
  wpm_instant: number;
  is_violation: boolean;
  violation_type?: string;
}

export interface ActionPlanItem {
  day: string;
  exercise: string;
}

export interface ViolationCluster {
  id: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  startPct: number;
  endPct: number;
  widthPct: number;
  count: number;
  primaryType: string;
  severity: "Cần lưu ý" | "Nhẹ";
  color: string;
  symbol: string;
  timeRangeFormatted: string;
  samples: Array<{
    timestampSec: number;
    violationType: string;
    headPose: HeadPose;
  }>;
}

export interface XAIReport {
  ai_coach_persona: string;
  summary_feedback: string;
  strengths: string[];
  weaknesses: string[];
  action_plan: ActionPlanItem[];
}

export interface PerformanceMetrics {
  total_latency_sec: number;
  real_time_factor: number;
  features_analyzed: number;
}

export interface FullAssessmentData {
  presentation_id: string;
  filename: string;
  context_type: string;
  duration_sec: number;
  status: string;
  overall_score: number;
  rubric_scores: RubricScores;
  shap_explanation: ShapExplanation;
  telemetry_timeseries: TelemetryPoint[];
  xai_report: XAIReport;
  performance_metrics: PerformanceMetrics;
}

