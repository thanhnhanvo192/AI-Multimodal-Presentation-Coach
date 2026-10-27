import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, LoginResult, UserRole } from "../types";
import { authenticateDemoUser } from "../mocks/mockAuth";
import { authService } from "../services/authService";
import { ApiError } from "../services/apiClient";

const AUTH_STORAGE_KEY = "auth_user";

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  userRole: null,
  login: async () => ({ success: false, error: "NOT_INITIALIZED", message: "Chưa khởi tạo AuthContext" }),
  register: async () => ({ success: false, message: "Chưa khởi tạo AuthContext" }),
  logout: () => {},
});

function parseStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      localStorage.removeItem("is_auth");
      localStorage.removeItem("user_role");
      return null;
    }
    const data = JSON.parse(raw);

    // Validate required fields
    if (
      !data ||
      typeof data.id !== "string" ||
      typeof data.name !== "string" ||
      typeof data.email !== "string" ||
      (data.role !== "student" && data.role !== "admin") ||
      data.status !== "active"
    ) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("is_auth");
      localStorage.removeItem("user_role");
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      avatarText: data.avatarText || data.name.slice(0, 2).toUpperCase(),
    };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("is_auth");
    localStorage.removeItem("user_role");
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => parseStoredUser());

  // Derive auth state consistently from currentUser
  const isAuthenticated = currentUser !== null;
  const userRole = currentUser?.role || null;

  // Sync / refresh profile on app load if token exists
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token && currentUser) {
      authService
        .getMe()
        .then((updatedUser) => {
          setCurrentUser(updatedUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
        })
        .catch(() => {
          // Keep existing stored user if backend is unreachable
        });
    }
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    // 1. Mandatory field checks
    if (!email || !email.trim()) {
      return {
        success: false,
        error: "EMPTY_EMAIL",
        message: "Vui lòng nhập địa chỉ email.",
      };
    }
    if (!password) {
      return {
        success: false,
        error: "EMPTY_PASSWORD",
        message: "Vui lòng nhập mật khẩu.",
      };
    }

    // 2. Thử xác thực trực tiếp qua Backend API
    try {
      const { user } = await authService.login(email, password);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setCurrentUser(user);
      return {
        success: true,
        user,
      };
    } catch (err: unknown) {
      // Nếu Backend trả về lỗi logic nghiệp vụ cụ thể (401, 403, 400)
      if (err instanceof ApiError) {
        if (err.status === 403) {
          return {
            success: false,
            error: "ACCOUNT_BANNED",
            message: err.message || "Tài khoản của bạn đã bị khóa hoặc tạm dừng hoạt động.",
          };
        }
        if (err.status === 401 || err.status === 400) {
          return {
            success: false,
            error: "INVALID_CREDENTIALS",
            message: err.message || "Email hoặc mật khẩu không chính xác.",
          };
        }
      }

      // 3. Graceful Fallback: Nếu Backend offline (Failed to fetch / Network Error),
      // fallback về bộ xác thực demo mockAuth để việc phát triển & demo không bị gián đoạn
      console.warn("[AuthContext] Backend không khả dụng hoặc lỗi mạng. Kích hoạt fallback demo auth:", err);
      const demoResult = authenticateDemoUser(email, password);
      if (!demoResult.success || !demoResult.user) {
        return demoResult;
      }

      if (demoResult.user.status !== "active") {
        return {
          success: false,
          error: "ACCOUNT_BANNED",
          message: "Tài khoản của bạn đã bị khóa hoặc tạm dừng hoạt động. Vui lòng liên hệ quản trị viên.",
        };
      }

      const sessionUser: AuthUser = {
        id: demoResult.user.id,
        name: demoResult.user.name,
        email: demoResult.user.email,
        role: demoResult.user.role,
        status: demoResult.user.status,
        avatarText: demoResult.user.avatarText,
      };

      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
      } catch {
        // LocalStorage quota
      }

      setCurrentUser(sessionUser);
      return {
        success: true,
        user: sessionUser,
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await authService.register(email, password, fullName, "student");
      return { success: true };
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        return { success: false, message: err.message };
      }
      return {
        success: false,
        message: "Không thể kết nối đến máy chủ Backend để đăng ký. Vui lòng kiểm tra lại dịch vụ.",
      };
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        userRole,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
