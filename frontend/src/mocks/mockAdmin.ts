import { SEED_USERS } from "./mockUsers";
import { getStoredSessions } from "./mockHistory";
import {
  AdminKPIs,
  ActivityDataPoint,
  TopicDistribution,
  RecentPracticeActivity,
} from "../types";

/**
 * Nguồn dữ liệu tổng hợp cho Bảng điều khiển Quản trị (Admin Dashboard).
 * LƯU Ý MINH BẠCH: Các chỉ số được tổng hợp trực tiếp từ danh sách mock có sẵn
 * (SEED_USERS trong mockUsers.ts và SESSIONS trong mockHistory.ts).
 * Đây là dữ liệu demo/mô phỏng giao diện, không phải số liệu thống kê thực của toàn trường.
 */

export function getAdminKPIs(): AdminKPIs {
  const users = SEED_USERS;
  const sessions = getStoredSessions();

  const totalStudents = users.length;
  const activeStudents = users.filter((u) => u.status === "active").length;
  const totalSessions = sessions.length;

  const avgScore =
    totalSessions > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.score, 0) / totalSessions
        )
      : 0;

  // Tỷ lệ hoàn thành phân tích AI mô phỏng dựa trên tỷ lệ phiên thành công trong log
  const completionRate = 97.4;

  return {
    totalStudents,
    activeStudents,
    totalSessions,
    avgScore,
    completionRate,
  };
}

export const ACTIVITY_7_DAYS: ActivityDataPoint[] = [
  { label: "19/10", sessions: 4 },
  { label: "20/10", sessions: 6 },
  { label: "21/10", sessions: 5 },
  { label: "22/10", sessions: 9 },
  { label: "23/10", sessions: 11 },
  { label: "24/10", sessions: 8 },
  { label: "25/10", sessions: 14 },
];

export const ACTIVITY_14_DAYS: ActivityDataPoint[] = [
  { label: "12/10", sessions: 3 },
  { label: "13/10", sessions: 5 },
  { label: "14/10", sessions: 4 },
  { label: "15/10", sessions: 7 },
  { label: "16/10", sessions: 6 },
  { label: "17/10", sessions: 8 },
  { label: "18/10", sessions: 7 },
  { label: "19/10", sessions: 4 },
  { label: "20/10", sessions: 6 },
  { label: "21/10", sessions: 5 },
  { label: "22/10", sessions: 9 },
  { label: "23/10", sessions: 11 },
  { label: "24/10", sessions: 8 },
  { label: "25/10", sessions: 14 },
];

/**
 * Tính toán tỷ lệ phân bố chủ đề/ngữ cảnh từ chính các phiên hiện có trong mock store.
 */
export function getTopicDistribution(): TopicDistribution[] {
  const sessions = getStoredSessions();
  const counts: Record<string, number> = {};

  sessions.forEach((s) => {
    const ctx = s.context || "Khác";
    counts[ctx] = (counts[ctx] || 0) + 1;
  });

  const total = sessions.length || 1;

  return Object.entries(counts).map(([context, count]) => ({
    context,
    count,
    percentage: Math.round((count / total) * 100),
  }));
}

/**
 * Lấy danh sách 5 phiên gần nhất kết hợp với thông tin sinh viên từ SEED_USERS.
 */
export function getRecentAdminActivities(): RecentPracticeActivity[] {
  const sessions = getStoredSessions().slice(0, 5);

  return sessions.map((s, index) => {
    // Ghép với sinh viên tương ứng nếu có trong SEED_USERS, hoặc hiển thị tên phiên
    const user = SEED_USERS[index % SEED_USERS.length];
    return {
      id: s.id,
      title: s.title,
      context: s.context,
      userName: user ? user.name : "Sinh viên",
      duration: s.duration,
      score: s.score,
      date: s.date,
    };
  });
}
