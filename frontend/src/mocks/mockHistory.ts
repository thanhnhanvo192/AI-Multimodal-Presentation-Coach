import { PresentationSession, WeeklyScoreTrend } from "../types";

export interface DetailedSessionReport {
  sessionId: string | number;
  title: string;
  date: string;
  duration: string;
  context: string;
  overallScore: number;
  trendScore: number;
  grade: string;
  gradeDescription: string;
  radarMetrics: {
    wpmPercent: number;
    eyeContactPercent: number;
    emotionPercent: number;
    bodyLanguagePercent: number;
    volumePercent: number;
  };
  metricBars: {
    eyeContact: number;
    wpmSpeed: number;
    confidence: number;
    fillerWordControl: number;
  };
  rawMetrics: {
    eyeContact: number;
    wpm: number;
    fillerWords: number;
  };
  timelineMarkers: Array<{
    pct: number;
    color: string;
    symbol: string;
    label: string;
    severity: string;
  }>;
  transcript: string;
  strengths: {
    title: string;
    description: string;
  };
  improvements: {
    title: string;
    description: string;
  };
  recommendation: {
    title: string;
    description: string;
  };
}

export const CHART_DATA: WeeklyScoreTrend[] = [
  { label: "Tuần 1", score: 58, sessions: 3, topSkill: "Âm lượng" },
  { label: "Tuần 2", score: 67, sessions: 4, topSkill: "Giao tiếp mắt" },
  { label: "Tuần 3", score: 76, sessions: 5, topSkill: "Giao tiếp mắt" },
  { label: "Tuần 4", score: 85, sessions: 4, topSkill: "Độ tự tin" },
];

export const SESSIONS: PresentationSession[] = [
  {
    id: 1,
    date: "11/09/2026",
    title: "Luyện tập bảo vệ đề án — Tuần 5",
    context: "Bảo vệ đề án",
    duration: "04:32",
    score: 85,
    trend: +4,
    eyeContact: 88,
    wpm: 175,
    fillerWords: 5,
  },
  {
    id: 2,
    date: "10/09/2026",
    title: "Thuyết trình ý tưởng lần 1",
    context: "Phỏng vấn việc làm",
    duration: "02:45",
    score: 82,
    trend: +6,
    eyeContact: 80,
    wpm: 162,
    fillerWords: 7,
  },
  {
    id: 3,
    date: "08/09/2026",
    title: "Thuyết trình lớp — Giới thiệu PBL6",
    context: "Thuyết trình lớp học",
    duration: "06:10",
    score: 76,
    trend: +9,
    eyeContact: 74,
    wpm: 158,
    fillerWords: 9,
  },
  {
    id: 4,
    date: "05/09/2026",
    title: "Phỏng vấn thử vòng 2",
    context: "Phỏng vấn việc làm",
    duration: "03:22",
    score: 70,
    trend: +12,
    eyeContact: 70,
    wpm: 145,
    fillerWords: 11,
  },
  {
    id: 5,
    date: "01/09/2026",
    title: "Thuyết trình mở đầu",
    context: "Thuyết trình lớp học",
    duration: "05:00",
    score: 58,
    trend: 0,
    eyeContact: 60,
    wpm: 130,
    fillerWords: 18,
  },
];

const STORAGE_KEY = "ai_coach_mock_sessions_store";

/**
 * Lấy danh sách các phiên luyện tập từ sessionStorage (hoặc dữ liệu mặc định ban đầu).
 * Hạn chế: Đây là mock lưu trữ trong trình duyệt (client-side mock), chưa đồng bộ với Database backend.
 */
export function getStoredSessions(): PresentationSession[] {
  if (typeof window === "undefined") return SESSIONS;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return SESSIONS;
}

/**
 * Tìm phiên luyện tập theo ID (hỗ trợ cả string và number).
 */
export function getSessionById(id: string | number): PresentationSession | undefined {
  const sessions = getStoredSessions();
  return sessions.find((s) => String(s.id) === String(id));
}

/**
 * Tạo một phiên mock mới (dùng khi Studio hoặc Upload hoàn thành phân tích).
 * Giới hạn: Dữ liệu phân tích là giá trị mẫu hợp lý để kiểm thử luồng UX, không phải kết quả AI thực tế.
 */
export function createMockSession(
  overrides?: Partial<PresentationSession>
): PresentationSession {
  const current = getStoredSessions();
  const nextId = Date.now();
  const newSession: PresentationSession = {
    id: nextId,
    date: new Date().toLocaleDateString("vi-VN"),
    title: overrides?.title || "Phiên luyện tập mới",
    context: overrides?.context || "Luyện tập tự do",
    duration: overrides?.duration || "03:45",
    score: overrides?.score ?? 84,
    trend: overrides?.trend ?? 3,
    eyeContact: overrides?.eyeContact ?? 85,
    wpm: overrides?.wpm ?? 155,
    fillerWords: overrides?.fillerWords ?? 4,
    ...overrides,
  };

  const updated = [newSession, ...current];
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // fallback
    }
  }

  return newSession;
}

/**
 * Lấy báo cáo chi tiết theo Session ID.
 * Trả về null nếu ID không tồn tại để ReportPage hiển thị trạng thái Not Found.
 */
export function getReportBySessionId(
  id: string | number
): DetailedSessionReport | null {
  const session = getSessionById(id);
  if (!session) return null;

  const score = session.score;
  const grade =
    score >= 85 ? "A-" : score >= 80 ? "B+" : score >= 70 ? "B" : "C";
  const gradeDescription =
    score >= 85
      ? "Xuất sắc — Nằm trong top 15% kết quả luyện tập"
      : score >= 80
      ? "Trên trung bình — Nằm trong top 30% kết quả luyện tập"
      : score >= 70
      ? "Đạt chuẩn — Cần cải thiện thêm một số chi tiết"
      : "Cần rèn luyện thêm để đạt độ tự tin cao hơn";

  const wpmPercent = Math.min(
    1,
    Math.max(0.3, Math.round((session.wpm / 220) * 100) / 100)
  );
  const eyeContactPercent = session.eyeContact / 100;
  const emotionPercent = score >= 80 ? 0.78 : 0.65;
  const bodyLanguagePercent = score >= 80 ? 0.72 : 0.6;
  const volumePercent = 0.8;

  const fillerControl = Math.max(30, Math.min(100, 100 - session.fillerWords * 4));
  const confidence = Math.max(40, Math.min(100, score - 3));
  const wpmSpeedRatio = Math.min(100, Math.round((session.wpm / 190) * 100));

  return {
    sessionId: session.id,
    title: session.title,
    date: session.date,
    duration: session.duration,
    context: session.context,
    overallScore: session.score,
    trendScore: session.trend,
    grade,
    gradeDescription,
    radarMetrics: {
      wpmPercent,
      eyeContactPercent,
      emotionPercent,
      bodyLanguagePercent,
      volumePercent,
    },
    metricBars: {
      eyeContact: session.eyeContact,
      wpmSpeed: wpmSpeedRatio,
      confidence,
      fillerWordControl: fillerControl,
    },
    rawMetrics: {
      eyeContact: session.eyeContact,
      wpm: session.wpm,
      fillerWords: session.fillerWords,
    },
    timelineMarkers: [
      {
        pct: 22,
        color: session.fillerWords > 5 ? "#C24141" : "#B7791F",
        symbol: session.fillerWords > 5 ? "⚠️" : "⚡",
        label: `Phát hiện từ đệm — khoảng ${session.fillerWords} lần ('ừm', 'à')`,
        severity: session.fillerWords > 5 ? "Cần lưu ý" : "Nhẹ",
      },
      {
        pct: 47,
        color: session.wpm > 165 ? "#C24141" : "#B7791F",
        symbol: "⚡",
        label: `Tốc độ nói đạt ${session.wpm} WPM`,
        severity: session.wpm > 165 ? "Hơi nhanh" : "Chuẩn",
      },
      {
        pct: 71,
        color: session.eyeContact < 75 ? "#B7791F" : "#276749",
        symbol: session.eyeContact < 75 ? "⚡" : "✓",
        label: `Giao tiếp mắt duy trì ${session.eyeContact}% thời lượng`,
        severity: session.eyeContact >= 75 ? "Tốt" : "Nhẹ",
      },
    ],
    transcript: `Xin chào mọi người, hôm nay tôi xin trình bày về chủ đề ${session.title}. Trong quá trình thuyết trình, tôi tập trung vào việc truyền đạt các luận điểm chính về ${session.context}. Hệ thống AI Coach đã ghi nhận thời lượng ${session.duration} với tốc độ trung bình ${session.wpm} từ/phút và duy trì giao tiếp mắt ${session.eyeContact}%. Cảm ơn mọi người đã chú ý lắng nghe.`,
    strengths: {
      title: `Giao tiếp mắt xuất sắc (${session.eyeContact}% thời lượng)`,
      description: `Bạn duy trì giao tiếp mắt rất tốt với người nghe qua camera trong suốt phiên luyện tập (${session.context}). Cử chỉ tự nhiên và phong thái vững vàng.`,
    },
    improvements: {
      title: `${session.fillerWords} từ đệm phát hiện · Tốc độ nói ${session.wpm} WPM`,
      description:
        session.wpm > 165
          ? `Tốc độ nói trung bình (${session.wpm} WPM) hơi nhanh so với mức chuẩn 130–160 WPM. Chủ động ngắt nhịp sẽ giúp hội đồng tiếp thu tốt hơn.`
          : `Nhịp độ nói ổn định. Tiếp tục duy trì khoảng ngắt nhịp tự nhiên để triệt tiêu hoàn toàn các từ đệm còn lại.`,
    },
    recommendation: {
      title: 'Áp dụng bài tập "Dừng lại 1 nhịp & Hít thở"',
      description:
        "Trước khi chuyển đổi sang luận điểm mới, hãy tạm dừng 1–2 giây thay vì phát âm từ đệm. Thói quen ngắt quãng có chủ đích sẽ giúp bài thuyết trình tăng tính thuyết phục.",
    },
  };
}
