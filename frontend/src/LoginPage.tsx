import { useState } from "react";
import { Button, Card, Badge, BrandLogo } from "./components/common";
import { useAuth } from "./context/AuthContext";
import { UserRole } from "./types";

function EyeOpenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="1"
        y1="1"
        x2="23"
        y2="23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LoginPageProps {
  onBack: () => void;
  onSignUp?: () => void;
  onLoginSuccess?: (role: UserRole) => void;
}

const DEMO_PRESETS = [
  {
    label: "Student (Sơn)",
    email: "son.dang@student.edu.vn",
    pass: "Student@123",
    roleBadge: "Sinh viên",
    variant: "default",
  },
  {
    label: "Student (Thắng)",
    email: "thang.nguyen@student.edu.vn",
    pass: "Student@123",
    roleBadge: "Sinh viên",
    variant: "default",
  },
  {
    label: "Admin",
    email: "admin@system.edu.vn",
    pass: "Admin@123",
    roleBadge: "Quản trị",
    variant: "admin",
  },
  {
    label: "Tài khoản khóa",
    email: "nhan.vo@student.edu.vn",
    pass: "Student@123",
    roleBadge: "Bị khóa",
    variant: "banned",
  },
];

export default function LoginPage({
  onBack,
  onSignUp,
  onLoginSuccess,
}: LoginPageProps) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("son.dang@student.edu.vn");
  const [password, setPassword] = useState("Student@123");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = login(email, password);
    setIsSubmitting(false);

    if (result.success && result.user) {
      if (onLoginSuccess) {
        onLoginSuccess(result.user.role);
      }
    } else {
      // Clear password field, keep email
      setPassword("");
      setErrorMessage(result.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  const fillPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F5F7F6] font-[Inter,sans-serif] text-[#24312B]">
      {/* LEFT COLUMN — Brand Presentation */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white border-r border-[#DCE5DF] flex-col items-center justify-center p-12 overflow-hidden">
        <div className="relative z-10 max-w-[420px] w-full flex flex-col gap-8">
          {/* Logo */}
          <button
            onClick={onBack}
            className="inline-flex items-center group self-start transition-opacity hover:opacity-85"
            aria-label="Về trang chủ"
          >
            <BrandLogo height={38} className="h-[38px] w-auto max-w-[160px]" />
          </button>

          {/* Value Prop */}
          <div className="space-y-3">
            <h2 className="text-[34px] font-bold leading-[1.2] tracking-tight text-[#24312B]">
              Tự tin bảo vệ{" "}
              <span className="text-[#276749]">đề án thuyết trình</span>
            </h2>
            <p className="text-[14.5px] text-[#69766F] leading-relaxed">
              Nền tảng ứng dụng AI đa phương thức giúp sinh viên phân tích ánh
              mắt, nhịp độ nói, từ đệm và ngôn ngữ cơ thể theo thời gian thực.
            </p>
          </div>

          {/* Clean Metric Feature Card */}
          <Card className="p-4 flex items-start gap-3.5 border-[#DCE5DF] bg-[#F5F7F6]/50">
            <div className="w-9 h-9 rounded-xl bg-[#E8F1EB] text-[#276749] flex items-center justify-center flex-shrink-0 font-bold text-sm">
              ✓
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#276749] uppercase tracking-wider">
                  Phiên mẫu gần nhất
                </span>
                <Badge variant="success">Tối ưu</Badge>
              </div>
              <p className="text-[13.5px] font-semibold text-[#24312B]">
                Tốc độ nói: 145 WPM · Giao tiếp mắt: 88%
              </p>
              <p className="text-[11.5px] text-[#69766F]">
                Đạt chuẩn thuyết trình bảo vệ đề tài tốt nghiệp PBL6
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* RIGHT COLUMN — Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
        <div className="w-full max-w-[420px] space-y-6">
          {/* Logo for mobile */}
          <button
            onClick={onBack}
            className="lg:hidden inline-flex items-center self-start"
            aria-label="Về trang chủ"
          >
            <BrandLogo height={34} className="h-[34px] w-auto max-w-[145px]" />
          </button>

          {/* Headline */}
          <div className="space-y-1">
            <h1 className="text-[28px] font-bold text-[#24312B] tracking-tight">
              Chào mừng trở lại
            </h1>
            <p className="text-[13.5px] text-[#69766F]">
              Đăng nhập bằng tài khoản được cấp để tiếp tục phiên làm việc.
            </p>
          </div>

          {/* Demo account quick fill */}
          <div className="p-3.5 rounded-xl bg-white border border-[#DCE5DF] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#69766F] uppercase tracking-wider">
                Điền nhanh tài khoản Demo
              </span>
              <span className="text-[10.5px] text-[#69766F]">Nhấn để điền mẫu</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_PRESETS.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => fillPreset(p.email, p.pass)}
                  className={`text-left px-2.5 py-1.5 rounded-lg border text-[12px] font-medium transition-all ${
                    email.toLowerCase() === p.email.toLowerCase()
                      ? "border-[#276749] bg-[#E8F1EB] text-[#276749] font-semibold"
                      : "border-[#DCE5DF] bg-[#F5F7F6] text-[#24312B] hover:border-[#69766F]"
                  }`}
                >
                  <div className="truncate">{p.label}</div>
                  <div className="text-[10px] text-[#69766F] truncate">{p.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px] flex items-start gap-2.5 animate-fade-in"
            >
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field with Visible Label */}
            <div className="space-y-1.5">
              <label
                className="block text-[12px] font-semibold text-[#24312B]"
                htmlFor="email"
              >
                Địa chỉ Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  required
                  placeholder="name@student.edu.vn"
                  className="w-full h-11 px-3.5 text-[13.5px] font-medium text-[#24312B] bg-white rounded-xl border border-[#DCE5DF] outline-none focus:border-[#276749] focus:ring-1 focus:ring-[#276749] transition-all"
                />
              </div>
            </div>

            {/* Password Field with Visible Label */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="block text-[12px] font-semibold text-[#24312B]"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <span className="text-[12px] text-[#69766F] select-none">
                  Demo Auth
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  required
                  className="w-full h-11 px-3.5 pr-11 text-[13.5px] font-medium text-[#24312B] bg-white rounded-xl border border-[#DCE5DF] outline-none focus:border-[#276749] focus:ring-1 focus:ring-[#276749] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 text-[#69766F] hover:text-[#24312B] transition-colors"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            {/* Single Login Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full justify-center"
              >
                {isSubmitting ? "Đang xác thực..." : "Đăng nhập"}
              </Button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-[13px] text-[#69766F] pt-2">
            Chưa có tài khoản?{" "}
            <button
              onClick={onSignUp}
              className="font-semibold text-[#276749] hover:underline"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
