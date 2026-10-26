export type UserStatus = "active" | "banned";
export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  sessions: number;
  status: UserStatus;
  role?: UserRole;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarText?: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  message?: string;
  user?: AuthUser;
}
