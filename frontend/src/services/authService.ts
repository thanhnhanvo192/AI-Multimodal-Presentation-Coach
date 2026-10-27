import { apiClient } from "./apiClient";
import { AuthUser, UserRole, UserStatus } from "../types";

export interface BackendUserResponse {
  id: number | string;
  email: string;
  full_name?: string | null;
  role: UserRole;
  avatar_text?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface BackendTokenResponse {
  access_token: string;
  token_type: string;
  user?: BackendUserResponse;
}

export const authService = {
  /**
   * Đăng nhập người dùng bằng email và mật khẩu
   */
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const data = await apiClient.post<BackendTokenResponse>("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });

    // Lưu token
    if (data.access_token) {
      localStorage.setItem("auth_token", data.access_token);
    }

    // Nếu backend trả về user trực tiếp
    if (data.user) {
      const authUser: AuthUser = {
        id: String(data.user.id),
        name: data.user.full_name || data.user.email.split("@")[0],
        email: data.user.email,
        role: data.user.role || "student",
        status: data.user.is_active ? "active" : "banned",
        avatarText: data.user.avatar_text || (data.user.full_name ? data.user.full_name.slice(0, 2).toUpperCase() : "US"),
      };
      return { token: data.access_token, user: authUser };
    }

    // Nếu không có user trong payload login, gọi tiếp /auth/me
    const me = await this.getMe();
    return { token: data.access_token, user: me };
  },

  /**
   * Đăng ký tài khoản người dùng mới
   */
  async register(
    email: string,
    password: string,
    fullName?: string,
    role: UserRole = "student"
  ): Promise<AuthUser> {
    const data = await apiClient.post<BackendUserResponse>("/auth/register", {
      email: email.trim().toLowerCase(),
      password,
      full_name: fullName,
      role,
    });

    return {
      id: String(data.id),
      name: data.full_name || data.email.split("@")[0],
      email: data.email,
      role: data.role || "student",
      status: data.is_active ? "active" : "banned",
      avatarText: data.avatar_text || (data.full_name ? data.full_name.slice(0, 2).toUpperCase() : "US"),
    };
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ Token
   */
  async getMe(): Promise<AuthUser> {
    const data = await apiClient.get<BackendUserResponse>("/auth/me");
    return {
      id: String(data.id),
      name: data.full_name || data.email.split("@")[0],
      email: data.email,
      role: data.role || "student",
      status: data.is_active ? "active" : "banned",
      avatarText: data.avatar_text || (data.full_name ? data.full_name.slice(0, 2).toUpperCase() : "US"),
    };
  },

  /**
   * Đăng xuất và xóa sạch session
   */
  logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("is_auth");
    localStorage.removeItem("user_role");
  },
};
