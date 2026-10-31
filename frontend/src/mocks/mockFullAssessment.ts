import fullAssessmentJson from "../../../data_return_for_frontend/full_assessment_sample.json";
import { FullAssessmentData } from "../types/assessment";
import { DetailedSessionReport } from "./mockHistory";

export const FULL_ASSESSMENT_DATA = fullAssessmentJson as FullAssessmentData;

/**
 * Format giây thành chuỗi mm:ss (ví dụ: 125 -> "02:05")
 */
export function formatSecondsToTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Adapter chuyển đổi dữ liệu từ AI Core (FullAssessmentData)
 * sang định dạng tiêu thụ của giao diện báo cáo (DetailedSessionReport).
 */
export function adaptFullAssessmentToReport(
  aiData: FullAssessmentData = FULL_ASSESSMENT_DATA
): DetailedSessionReport {
  const score = Math.round(aiData.overall_score);
  const grade =
    score >= 85 ? "A-" : score >= 80 ? "B+" : score >= 70 ? "B" : "C";
  const gradeDescription =
    score >= 85
      ? "Xuất sắc — Thể hiện phong thái thuyết trình rất tự tin"
      : score >= 80
      ? "Khá tốt — Nắm vững nội dung và làm chủ không gian nói"
      : score >= 70
      ? "Đạt chuẩn đồ án — Cần cải thiện một số lỗi tư thế và giao tiếp mắt"
      : "Cần luyện tập thêm để nâng cao tính thuyết phục";

  // Lọc các điểm vi phạm từ telemetry_timeseries
  const violations = aiData.telemetry_timeseries.filter((t) => t.is_violation);

  // Tạo timelineMarkers từ telemetry vi phạm
  const timelineMarkers = violations.map((v) => {
    const pct = Math.min(
      100,
      Math.max(0, Math.round((v.timestamp_sec / aiData.duration_sec) * 100))
    );
    const isCritical =
      (v.violation_type?.includes("Lệch tư thế đầu") &&
        v.violation_type?.includes("Mất tương tác")) ||
      v.violation_type?.toLowerCase().includes("nghiêm trọng");

    return {
      pct,
      timestampSec: v.timestamp_sec,
      color: isCritical ? "#C24141" : "#B7791F",
      symbol: isCritical ? "⚠️" : "⚡",
      label: v.violation_type || "Vi phạm quy chuẩn thuyết trình",
      severity: isCritical ? "Cần lưu ý" : "Nhẹ",
      timeFormatted: formatSecondsToTime(v.timestamp_sec),
    };
  });

  return {
    sessionId: aiData.presentation_id,
    title: "Bảo vệ Đồ án Tốt nghiệp CNTT — Hội đồng chấm thi",
    date: "Hôm nay",
    duration: formatSecondsToTime(aiData.duration_sec),
    durationSec: aiData.duration_sec,
    context: "Bảo vệ đồ án tốt nghiệp",
    overallScore: score,
    trendScore: +4.2,
    grade,
    gradeDescription,
    // 5 trục Rubric chuẩn xác từ AI Core
    radarMetrics: {
      eyeContactPercent: aiData.rubric_scores.eye_contact_score / 100,
      headPosturePercent: aiData.rubric_scores.head_posture_score / 100,
      facialExpressionPercent: aiData.rubric_scores.facial_expression_score / 100,
      speechRatePercent: aiData.rubric_scores.speech_rate_score / 100,
      fillerControlPercent: aiData.rubric_scores.filler_control_score / 100,
      // Fallback cho logic cũ
      wpmPercent: aiData.rubric_scores.speech_rate_score / 100,
      emotionPercent: aiData.rubric_scores.facial_expression_score / 100,
      bodyLanguagePercent: aiData.rubric_scores.head_posture_score / 100,
      volumePercent: 0.82,
    },
    metricBars: {
      eyeContact: Math.round(aiData.rubric_scores.eye_contact_score),
      wpmSpeed: Math.round(aiData.rubric_scores.speech_rate_score),
      confidence: Math.round(aiData.rubric_scores.facial_expression_score),
      fillerWordControl: Math.round(aiData.rubric_scores.filler_control_score),
    },
    rawMetrics: {
      eyeContact: Math.round(aiData.rubric_scores.eye_contact_score),
      wpm: 75,
      fillerWords: 3,
    },
    timelineMarkers,
    transcript:
      "Kính thưa quý thầy cô trong Hội đồng phản biện, hôm nay nhóm chúng em xin được trình bày về đề tài 'Hệ thống huấn luyện thuyết trình đa phương thức ứng dụng Trí tuệ nhân tạo'. Trong suốt thời gian thực hiện đồ án, nhóm đã áp dụng các mô hình học sâu để phân tích thị giác, cử chỉ và giọng nói nhằm cung cấp phản hồi tức thời...",
    strengths: {
      title: "Kiểm soát từ đệm và biểu cảm tích cực",
      description: aiData.xai_report.strengths[0] || "Phát âm rõ ràng, hạn chế tối đa từ đệm.",
    },
    improvements: {
      title: "Cải thiện giao tiếp mắt và tốc độ nói",
      description:
        aiData.xai_report.weaknesses[0] ||
        "Tốc độ nói cần điều tiết nhịp nhàng và duy trì nhìn thẳng camera.",
    },
    recommendation: {
      title: "Kỹ thuật Tam giác Ánh mắt & Luyện Metronome",
      description:
        aiData.xai_report.action_plan[0]?.exercise ||
        "Luyện tập nhìn thẳng vào ống kính máy quay tối thiểu 70% thời lượng.",
    },
    // Các trường nâng cao từ AI Core
    aiAssessment: aiData,
    aiCoachPersona: aiData.xai_report.ai_coach_persona,
    summaryFeedback: aiData.xai_report.summary_feedback,
    detailedStrengths: aiData.xai_report.strengths,
    detailedWeaknesses: aiData.xai_report.weaknesses,
    actionPlan: aiData.xai_report.action_plan,
    rubricScores: aiData.rubric_scores,
  };
}

