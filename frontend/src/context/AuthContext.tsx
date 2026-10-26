import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, LoginResult, UserRole } from "../types";
import { authenticateDemoUser } from "../mocks/mockAuth";

const AUTH_STORAGE_KEY = "auth_user";

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  userRole: null,
  login: () => ({ success: false, error: "INVALID_CREDENTIALS", message: "Chưa khởi tạo AuthContext" }),
  logout: () => {},
});

function parseStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      // Clean up legacy keys if auth_user doesn't exist
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
      // Corrupt or invalid status/role
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("is_auth");
      localStorage.removeItem("user_role");
      return null;
    }

    // Ensure password is NEVER retained in storage
    const sanitizedUser: AuthUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      avatarText: data.avatarText || data.name.slice(0, 2).toUpperCase(),
    };
    return sanitizedUser;
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

  const login = (email: string, password: string): LoginResult => {
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

    // 2. Authenticate against centralized demo accounts
    const result = authenticateDemoUser(email, password);
    if (!result.success || !result.user) {
      return result;
    }

    // 3. Ensure role and active status
    if (result.user.status !== "active") {
      return {
        success: false,
        error: "ACCOUNT_BANNED",
        message: "Tài khoản của bạn đã bị khóa hoặc tạm dừng hoạt động. Vui lòng liên hệ quản trị viên.",
      };
    }

    // 4. Create session without password
    const sessionUser: AuthUser = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      status: result.user.status,
      avatarText: result.user.avatarText,
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
      // Clean up legacy keys
      localStorage.removeItem("is_auth");
      localStorage.removeItem("user_role");
    } catch {
      // In case localStorage quota exceeded
    }

    setCurrentUser(sessionUser);
    return {
      success: true,
      user: sessionUser,
    };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("is_auth");
      localStorage.removeItem("user_role");
    } catch {
      // Storage access error handling
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
