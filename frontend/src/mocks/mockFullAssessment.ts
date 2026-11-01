import fullAssessmentJson from "../../../data_return_for_frontend/full_assessment_sample.json";
import { FullAssessmentData, TelemetryPoint, ViolationCluster } from "../types/assessment";
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
 * Thuật toán gom cụm các mốc vi phạm liền kề (Clustering Algorithm)
 * Nhóm các mẫu telemetry vi phạm trong khoảng thời gian <= maxGapSec thành 1 cụm sự kiện cảnh báo.
 */
export function clusterViolations(
  telemetry: TelemetryPoint[],
  totalDuration: number,
  maxGapSec: number = 8
): ViolationCluster[] {
  const violations = telemetry.filter((t) => t.is_violation);
  if (violations.length === 0) return [];

  const clustersRaw: TelemetryPoint[][] = [];
  let currentCluster: TelemetryPoint[] = [violations[0]];

  for (let i = 1; i < violations.length; i++) {
    const prev = currentCluster[currentCluster.length - 1];
    const curr = violations[i];

    if (curr.timestamp_sec - prev.timestamp_sec <= maxGapSec) {
      currentCluster.push(curr);
    } else {
      clustersRaw.push(currentCluster);
      currentCluster = [curr];
    }
  }
  if (currentCluster.length > 0) {
    clustersRaw.push(currentCluster);
  }

  return clustersRaw.map((group, index) => {
    const startSec = group[0].timestamp_sec;
    const endSec = group[group.length - 1].timestamp_sec;
    const durationSec = Math.max(1, Math.round(endSec - startSec));
    const startPct = Math.min(100, Math.max(0, (startSec / totalDuration) * 100));
    const endPct = Math.min(100, Math.max(0, (endSec / totalDuration) * 100));
    const widthPct = Math.max(1.8, endPct - startPct);

    // Xác định mức độ nghiêm trọng
    const hasBoth = group.some(
      (p) =>
        p.violation_type?.includes("Lệch tư thế đầu") &&
        p.violation_type?.includes("Mất tương tác")
    );
    const count = group.length;
    const isCritical = hasBoth || count >= 3;

    // Xác định tên lỗi tiêu biểu
    const hasHead = group.some((p) => p.violation_type?.includes("Lệch tư thế đầu"));
    const hasEye = group.some((p) => p.violation_type?.includes("Mất tương tác ánh mắt"));
    let primaryType = "Vi phạm quy chuẩn";
    if (hasHead && hasEye) {
      primaryType = "Lệch tư thế đầu & Mất tương tác ánh mắt";
    } else if (hasHead) {
      primaryType = "Lệch tư thế đầu (vượt ngưỡng 15°)";
    } else if (hasEye) {
      primaryType = "Mất giao tiếp ánh mắt với camera";
    }

    const timeRangeFormatted =
      startSec === endSec
        ? formatSecondsToTime(startSec)
        : `${formatSecondsToTime(startSec)} – ${formatSecondsToTime(endSec)} (${durationSec}s)`;

    return {
      id: `cluster-${index + 1}`,
      startSec,
      endSec,
      durationSec,
      startPct,
      endPct,
      widthPct,
      count,
      primaryType,
      severity: isCritical ? "Cần lưu ý" : "Nhẹ",
      color: isCritical ? "#C24141" : "#B7791F",
      symbol: isCritical ? "⚠️" : "⚡",
      timeRangeFormatted,
      samples: group.map((p) => ({
        timestampSec: p.timestamp_sec,
        violationType: p.violation_type || "",
        headPose: p.head_pose,
      })),
    };
  });
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
    violationClusters: clusterViolations(aiData.telemetry_timeseries, aiData.duration_sec),
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

