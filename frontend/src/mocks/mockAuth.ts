import { AuthUser, LoginResult, UserRole, UserStatus } from "../types";

/**
 * Cấu trúc tài khoản demo phục vụ xác thực phía Frontend (Client-side Demo Auth).
 * LƯU Ý: Đây là dữ liệu mô phỏng phục vụ trình diễn và phân quyền giao diện (UX),
 * KHÔNG PHẢI cơ chế xác thực bảo mật thực tế trên Backend (chưa mã hóa bcrypt/JWT).
 * Tuyệt đối không sử dụng mật khẩu này cho các tài khoản thực tế.
 */
export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  avatarText: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  // 1. Tài khoản Sinh viên chính (Đặng Quang Sơn)
  {
    id: "usr_102230046",
    name: "Đặng Quang Sơn",
    email: "son.dang@student.edu.vn",
    password: "Student@123",
    role: "student",
    status: "active",
    avatarText: "DQ",
  },
  // 2. Tài khoản Sinh viên phụ (Nguyễn Đỗ Thắng)
  {
    id: "usr_99887711",
    name: "Nguyễn Đỗ Thắng",
    email: "thang.nguyen@student.edu.vn",
    password: "Student@123",
    role: "student",
    status: "active",
    avatarText: "NT",
  },
  // 3. Tài khoản Quản trị viên hệ thống (System Administrator)
  {
    id: "usr_admin_01",
    name: "System Administrator",
    email: "admin@system.edu.vn",
    password: "Admin@123",
    role: "admin",
    status: "active",
    avatarText: "SA",
  },
  // 4. Tài khoản Sinh viên bị khóa (Võ Thành Nhân) để kiểm thử xử lý lỗi
  {
    id: "usr_55664433",
    name: "Võ Thành Nhân",
    email: "nhan.vo@student.edu.vn",
    password: "Student@123",
    role: "student",
    status: "banned",
    avatarText: "VN",
  },
];

/**
 * Kiểm tra thông tin đăng nhập từ danh sách tài khoản demo.
 * - So sánh email không phân biệt chữ hoa/thường.
 * - So sánh mật khẩu chính xác tuyệt đối (case-sensitive, không trim mật khẩu).
 * - Kiểm tra trạng thái tài khoản active/banned.
 * - Trả về AuthUser (không chứa trường password).
 */
export function authenticateDemoUser(email: string, password: string): LoginResult {
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

  const normalizedEmail = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  );

  // 1. Không tìm thấy tài khoản theo email
  if (!account) {
    return {
      success: false,
      error: "USER_NOT_FOUND",
      message: "Tài khoản không tồn tại trong hệ thống demo.",
    };
  }

  // 2. Mật khẩu không chính xác (so sánh chính xác tuyệt đối, không trim mật khẩu)
  if (account.password !== password) {
    return {
      success: false,
      error: "INVALID_CREDENTIALS",
      message: "Mật khẩu không chính xác.",
    };
  }

  // 3. Tài khoản bị khóa / tạm dừng
  if (account.status === "banned") {
    return {
      success: false,
      error: "ACCOUNT_BANNED",
      message: "Tài khoản của bạn đã bị khóa hoặc tạm dừng hoạt động. Vui lòng liên hệ quản trị viên.",
    };
  }

  // 4. Xác thực thành công: Trích xuất thông tin người dùng (tuyệt đối không chứa password)
  const authUser: AuthUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    status: account.status,
    avatarText: account.avatarText,
  };

  return {
    success: true,
    user: authUser,
  };
}
