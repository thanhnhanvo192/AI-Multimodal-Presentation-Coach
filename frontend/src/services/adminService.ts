import { apiClient } from "./apiClient";
import {
  AdminKPIsResponse,
  AdminSystemConfig,
  AdminUsersListResponse,
  AdminLogsResponse,
  ServerLogItem
} from "../types/admin";
import {
  getAdminKPIs,
  ACTIVITY_7_DAYS,
  ACTIVITY_14_DAYS,
  getTopicDistribution,
  getRecentAdminActivities,
} from "../mocks/mockAdmin";
import { SEED_USERS } from "../mocks/mockUsers";
import { DEMO_SERVER_LOGS } from "../mocks/mockLogs";

/**
 * Service quản lý Module Quản trị viên (Admin Management Service)
 * Kết nối các API Backend và tích hợp cơ chế Graceful Fallback
 */
class AdminService {
  /**
   * Lấy tổng hợp chỉ số KPIs, biểu đồ hoạt động và phân bố ngữ cảnh
   */
  async getKPIs(): Promise<AdminKPIsResponse> {
    try {
      const response = await apiClient.get<AdminKPIsResponse>("/admin/kpis");
      return response;
    } catch (err) {
      console.warn("Lỗi khi tải KPIs từ backend, kích hoạt dữ liệu fallback:", err);
      const mockKPIs = getAdminKPIs();
      return {
        ...mockKPIs,
        activity_chart_7d: ACTIVITY_7_DAYS,
        activity_chart_14d: ACTIVITY_14_DAYS,
        topic_distribution: getTopicDistribution(),
        recent_activities: getRecentAdminActivities(),
      };
    }
  }

  /**
   * Lấy danh sách tài khoản người dùng với tìm kiếm, phân trang và lọc trạng thái
   */
  async getUsers(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    status_filter?: string;
  }): Promise<AdminUsersListResponse> {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.status_filter && params.status_filter !== "all") {
      query.set("status_filter", params.status_filter);
    }

    const queryStr = query.toString();
    const endpoint = `/admin/users${queryStr ? `?${queryStr}` : ""}`;

    try {
      const response = await apiClient.get<AdminUsersListResponse>(endpoint);
      return response;
    } catch (err) {
      console.warn("Lỗi khi tải Users từ backend, kích hoạt dữ liệu fallback:", err);
      let filtered = [...SEED_USERS];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (u) => u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
        );
      }
      if (params?.status_filter && params.status_filter !== "all") {
        filtered = filtered.filter((u) => u.status === params.status_filter);
      }
      const skip = params?.skip || 0;
      const limit = params?.limit || 10;
      const paged = filtered.slice(skip, skip + limit);

      return {
        total: filtered.length,
        items: paged.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role || "student",
          sessions_count: u.sessions,
          status: u.status,
          created_at: new Date().toISOString(),
        })),
      };
    }
  }

  /**
   * Khóa hoặc mở khóa tài khoản người dùng
   */
  async updateUserStatus(
    userId: string,
    status: "active" | "banned"
  ): Promise<{ id: string; status: "active" | "banned" }> {
    try {
      const response = await apiClient.patch<{ id: string; status: "active" | "banned" }>(
        `/admin/users/${userId}/status`,
        { status }
      );
      return response;
    } catch (err) {
      console.warn(`Lỗi cập nhật trạng thái user ${userId}, sử dụng fallback cục bộ:`, err);
      return { id: userId, status };
    }
  }

  /**
   * Lấy cấu hình tham số hệ thống và giới hạn tốc độ
   */
  async getConfig(): Promise<AdminSystemConfig> {
    try {
      const response = await apiClient.get<AdminSystemConfig>("/admin/config");
      return response;
    } catch (err) {
      console.warn("Lỗi tải config từ backend, kích hoạt fallback:", err);
      return {
        min_eye_contact_pct: 70,
        ideal_wpm_min: 130,
        ideal_wpm_max: 160,
        max_filler_words_allowed: 4,
        max_uploads_per_window: 5,
        rate_limit_window_minutes: 10,
        max_file_size_mb: 200,
        weights: {
          eye_contact: 0.25,
          speech_rate: 0.25,
          body_language: 0.20,
          pitch: 0.15,
          content: 0.15,
        },
      };
    }
  }

  /**
   * Cập nhật tham số cấu hình hệ thống
   */
  async updateConfig(config: AdminSystemConfig): Promise<AdminSystemConfig> {
    try {
      const response = await apiClient.put<AdminSystemConfig>("/admin/config", config);
      return response;
    } catch (err) {
      console.warn("Lỗi lưu cấu hình lên backend, lưu cục bộ:", err);
      return config;
    }
  }

  /**
   * Lấy nhật ký máy chủ có hỗ trợ lọc theo cấp độ hoặc dịch vụ
   */
  async getLogs(params?: {
    level?: string;
    service?: string;
    limit?: number;
  }): Promise<ServerLogItem[]> {
    const query = new URLSearchParams();
    if (params?.level && params.level !== "ALL") query.set("level", params.level);
    if (params?.service && params.service !== "ALL") query.set("service", params.service);
    if (params?.limit) query.set("limit", String(params.limit));

    const queryStr = query.toString();
    const endpoint = `/admin/logs${queryStr ? `?${queryStr}` : ""}`;

    try {
      const response = await apiClient.get<AdminLogsResponse>(endpoint);
      return response.items;
    } catch (err) {
      console.warn("Lỗi tải server logs từ backend, kích hoạt dữ liệu fallback:", err);
      let logs = [...DEMO_SERVER_LOGS];
      if (params?.level && params.level !== "ALL") {
        logs = logs.filter((l) => l.level === params.level);
      }
      if (params?.service && params.service !== "ALL") {
        logs = logs.filter((l) => l.service === params.service);
      }
      if (params?.limit) {
        logs = logs.slice(0, params.limit);
      }
      return logs;
    }
  }
}

export const adminService = new AdminService();
