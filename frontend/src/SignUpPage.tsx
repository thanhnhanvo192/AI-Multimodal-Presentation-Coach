import { useState } from "react";
import { Button, Card, Badge, BrandLogo } from "./components/common";

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

function SkillMetricRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span className="text-[#69766F] font-medium w-28 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-[#DCE5DF] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#276749]"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-semibold text-[#276749] w-8 text-right font-mono">
        {score}%
      </span>
    </div>
  );
}

interface SignUpPageProps {
  onBack: () => void;
  onLogin: () => void;
}

export default function SignUpPage({
  onBack,
  onLogin,
}: SignUpPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setDemoNotice(null);

    // Validation
    if (!name.trim()) {
      setFormError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    if (password.length < 8) {
      setFormError("Mật khẩu phải có độ dài tối thiểu 8 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!agreeTerms) {
      setFormError("Vui lòng đồng ý với Điều khoản sử dụng.");
      return;
    }

    // Do NOT automatically grant a session!
    setDemoNotice(
      "Chức năng đăng ký tài khoản mới chưa khả dụng ở bản Demo Frontend (chờ kết nối Backend). Vui lòng quay lại màn hình Đăng nhập để sử dụng các tài khoản demo được cấp sẵn."
    );
  }

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
              Bắt đầu hành trình thuyết trình{" "}
              <span className="text-[#276749]">tự tin &amp; chuyên nghiệp</span>
            </h2>
            <p className="text-[14.5px] text-[#69766F] leading-relaxed">
              Hệ thống huấn luyện thông minh giúp bạn tự động đánh giá từng phiên
              thuyết trình, chỉ ra điểm mạnh và lộ trình cải thiện cá nhân.
            </p>
          </div>

          {/* Clean Radar / Skill Preview Card */}
          <Card className="p-5 space-y-4 border-[#DCE5DF] bg-[#F5F7F6]/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-[#24312B]">
                  Đánh giá 5 kỹ năng thuyết trình cốt lõi
                </p>
                <p className="text-[11px] text-[#69766F] mt-0.5">
                  Tự động cập nhật sau mỗi phiên luyện tập
                </p>
              </div>
              <Badge variant="primary">AI Analysis</Badge>
            </div>
            <div className="space-y-2.5 pt-1 border-t border-[#DCE5DF]">
              <SkillMetricRow label="Giao tiếp mắt" score={85} />
              <SkillMetricRow label="Tốc độ nói" score={72} />
              <SkillMetricRow label="Ngôn ngữ cơ thể" score={68} />
              <SkillMetricRow label="Độ rõ âm sắc" score={90} />
              <SkillMetricRow label="Hạn chế từ đệm" score={75} />
            </div>
          </Card>
        </div>
      </div>

      {/* RIGHT COLUMN — Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
        <div className="w-full max-w-[400px] space-y-6">
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
              Tạo tài khoản mới
            </h1>
            <p className="text-[13.5px] text-[#69766F]">
              Đăng ký để bắt đầu trải nghiệm AI Huấn luyện viên thuyết trình.
            </p>
          </div>

          {/* Demo notice banner */}
          {demoNotice && (
            <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-[13px] space-y-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <svg className="w-5 h-5 flex-shrink-0 text-[#2563EB] mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="leading-relaxed font-medium">{demoNotice}</div>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full justify-center"
                onClick={onLogin}
              >
                Đến trang Đăng nhập Demo
              </Button>
            </div>
          )}

          {/* Form Error */}
          {formError && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px] flex items-start gap-2.5 animate-fade-in">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 font-medium leading-relaxed">{formError}</div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                className="block text-[12px] font-semibold text-[#24312B]"
                htmlFor="name"
              >
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formError) setFormError(null);
                }}
                required
                placeholder="Nguyễn Văn A"
                className="w-full h-11 px-3.5 text-[13.5px] font-medium text-[#24312B] bg-white rounded-xl border border-[#DCE5DF] outline-none focus:border-[#276749] focus:ring-1 focus:ring-[#276749] transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="block text-[12px] font-semibold text-[#24312B]"
                htmlFor="email"
              >
                Địa chỉ Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError(null);
                }}
                required
                placeholder="student@university.edu.vn"
                className="w-full h-11 px-3.5 text-[13.5px] font-medium text-[#24312B] bg-white rounded-xl border border-[#DCE5DF] outline-none focus:border-[#276749] focus:ring-1 focus:ring-[#276749] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                className="block text-[12px] font-semibold text-[#24312B]"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  required
                  placeholder="Tối thiểu 8 ký tự"
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                className="block text-[12px] font-semibold text-[#24312B]"
                htmlFor="confirmPassword"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  required
                  placeholder="Nhập lại mật khẩu"
                  className="w-full h-11 px-3.5 pr-11 text-[13.5px] font-medium text-[#24312B] bg-white rounded-xl border border-[#DCE5DF] outline-none focus:border-[#276749] focus:ring-1 focus:ring-[#276749] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 p-1 text-[#69766F] hover:text-[#24312B] transition-colors"
                  aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirm ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-[#DCE5DF] text-[#276749] focus:ring-[#276749] accent-[#276749]"
              />
              <label htmlFor="terms" className="text-[12px] text-[#69766F]">
                Tôi đồng ý với{" "}
                <a href="#" className="text-[#276749] font-medium hover:underline">
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="#" className="text-[#276749] font-medium hover:underline">
                  Chính sách bảo mật
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center mt-2"
              disabled={!agreeTerms}
            >
              Đăng ký tài khoản
            </Button>
          </form>

          {/* Login Footer */}
          <p className="text-center text-[13px] text-[#69766F] pt-1">
            Đã có tài khoản?{" "}
            <button
              onClick={onLogin}
              className="font-semibold text-[#276749] hover:underline"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
