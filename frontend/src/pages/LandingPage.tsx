import { useState } from "react";
import { GeminiIcon } from "../components/icons";
import { Button, Card, Badge, BrandLogo } from "../components/common";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#E8F1EB" />
      <path
        d="M5 8l2 2 4-4"
        stroke="#276749"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProgressBar({
  label,
  value,
  max = 100,
  unit = "%",
}: {
  label: string;
  value: number;
  max?: number;
  unit?: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[11.5px]">
        <span className="font-medium text-[#69766F]">{label}</span>
        <span className="font-semibold text-[#24312B]">
          {value}
          {unit}
        </span>
      </div>
      <div className="h-1.5 bg-[#DCE5DF] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#276749] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const NAV_LINKS = [
  "Tính năng",
  "Quy trình phân tích",
  "Đề án PBL6",
  "Quản trị viên",
];

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
  onAdmin: () => void;
}

export default function LandingPage({
  onLogin,
  onSignUp,
  onAdmin,
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-full bg-[#F5F7F6] overflow-x-hidden font-[Inter,sans-serif] text-[#24312B]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DCE5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <BrandLogo height={36} className="h-9 w-auto max-w-[155px]" />
            </div>

            {/* Center Links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <button
                  key={link}
                  onClick={() => link === "Quản trị viên" && onAdmin()}
                  className="text-[13.5px] font-medium text-[#69766F] hover:text-[#24312B] transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>

            {/* Right CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onLogin}>
                Đăng nhập
              </Button>
              <Button variant="primary" size="sm" onClick={onSignUp}>
                Bắt đầu luyện tập
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-[#69766F] hover:text-[#24312B]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Mở menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#DCE5DF] bg-white px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => {
                  if (link === "Quản trị viên") onAdmin();
                  setMobileMenuOpen(false);
                }}
                className="block text-left w-full text-[13.5px] font-medium text-[#69766F] hover:text-[#24312B]"
              >
                {link}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t border-[#DCE5DF]">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-center"
                onClick={onLogin}
              >
                Đăng nhập
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
                onClick={onSignUp}
              >
                Bắt đầu luyện tập
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headline & Purpose */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              {/* Badge */}
              <Badge variant="primary" withDot>
                Hệ thống hỗ trợ huấn luyện thuyết trình bằng AI
              </Badge>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[50px] font-extrabold text-[#24312B] leading-[1.15] tracking-tight">
                Nâng cao kỹ năng thuyết trình với{" "}
                <span className="text-[#276749]">AI Multimodal Coach</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-[17px] text-[#69766F] leading-relaxed max-w-xl">
                Phân tích video và giọng nói của sinh viên theo thời gian thực.
                Đo lường mức độ giao tiếp mắt, tư thế, tốc độ nói và từ đệm với
                phản hồi khách quan và chi tiết từ AI.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onSignUp}
                  rightIcon={<ArrowRight />}
                >
                  Bắt đầu luyện tập ngay
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onLogin}
                >
                  Xem demo hệ thống
                </Button>
              </div>

              {/* Feature Highlights */}
              <div className="flex flex-wrap items-center gap-5 sm:gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <CheckIcon />
                  <span className="text-[13px] font-medium text-[#24312B]">
                    Ghi hình trực tiếp qua webcam
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon />
                  <span className="text-[13px] font-medium text-[#24312B]">
                    Tải tệp video MP4 &amp; WebM
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon />
                  <span className="text-[13px] font-medium text-[#24312B]">
                    Báo cáo phân tích đa chiều
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Mockup Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <Card className="p-6 space-y-5 bg-white border-[#DCE5DF]">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#DCE5DF]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F1EB] text-[#276749] flex items-center justify-center">
                        <GeminiIcon />
                      </div>
                      <div>
                        <h2 className="text-[14px] font-bold text-[#24312B] leading-none">
                          Báo cáo phân tích phiên mẫu
                        </h2>
                        <span className="text-[11.5px] text-[#69766F]">
                          Bảo vệ đề án PBL6 · 04:32
                        </span>
                      </div>
                    </div>
                    <Badge variant="success">85/100 Điểm</Badge>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F5F7F6] rounded-xl p-3 border border-[#DCE5DF] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#276749]">
                        <EyeIcon />
                        <span className="text-[11px] font-semibold">
                          Giao tiếp mắt
                        </span>
                      </div>
                      <p className="text-[18px] font-bold text-[#24312B]">88%</p>
                      <span className="text-[10.5px] text-[#276749] font-medium">
                        Vượt mức chuẩn 70%
                      </span>
                    </div>

                    <div className="bg-[#F5F7F6] rounded-xl p-3 border border-[#DCE5DF] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#276749]">
                        <MicIcon />
                        <span className="text-[11px] font-semibold">
                          Tốc độ nói
                        </span>
                      </div>
                      <p className="text-[18px] font-bold text-[#24312B]">
                        158 WPM
                      </p>
                      <span className="text-[10.5px] text-[#69766F] font-medium">
                        Khoảng tối ưu
                      </span>
                    </div>
                  </div>

                  {/* Detail Progress bars */}
                  <div className="space-y-2.5 pt-1">
                    <ProgressBar
                      label="Ngôn ngữ cơ thể &amp; Cử chỉ"
                      value={78}
                    />
                    <ProgressBar
                      label="Âm lượng &amp; Biểu cảm giọng nói"
                      value={82}
                    />
                    <ProgressBar
                      label="Hạn chế từ đệm (à, ừm)"
                      value={90}
                    />
                  </div>

                  {/* Constructive AI Feedback */}
                  <div className="bg-[#E8F1EB]/70 rounded-xl p-3.5 border border-[#D4E5D9] flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-[#276749] text-white flex items-center justify-center flex-shrink-0 text-[11px] font-bold mt-0.5">
                      ✓
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[12px] font-bold text-[#24312B]">
                        Đánh giá từ AI Coach
                      </p>
                      <p className="text-[11.5px] text-[#69766F] leading-relaxed">
                        Bạn duy trì giao tiếp mắt rất tốt. Nên giữ khoảng ngắt nhịp
                        1–2 giây khi chuyển đổi luận điểm để hội đồng tiếp thu trọn vẹn hơn.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: 3 Core Pillars */}
      <section className="py-12 border-t border-[#DCE5DF] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 space-y-2 border-[#DCE5DF] bg-[#F5F7F6]/40">
              <span className="text-2xl">📹</span>
              <h3 className="text-[14.5px] font-bold text-[#24312B]">
                Studio Ghi hình Trực tiếp
              </h3>
              <p className="text-[12px] text-[#69766F] leading-relaxed">
                Tích hợp máy nhắc chữ (teleprompter), bộ đếm thời gian và nhận
                diện cử chỉ khuôn mặt qua MediaPipe ngay trên trình duyệt.
              </p>
            </Card>

            <Card className="p-5 space-y-2 border-[#DCE5DF] bg-[#F5F7F6]/40">
              <span className="text-2xl">📤</span>
              <h3 className="text-[14.5px] font-bold text-[#24312B]">
                Tải lên Video có sẵn
              </h3>
              <p className="text-[12px] text-[#69766F] leading-relaxed">
                Hỗ trợ tệp MP4 hoặc WebM đã quay từ trước. Hệ thống tự động phân
                tách luồng hình ảnh và âm thanh để xử lý đa phương thức.
              </p>
            </Card>

            <Card className="p-5 space-y-2 border-[#DCE5DF] bg-[#F5F7F6]/40">
              <span className="text-2xl">📊</span>
              <h3 className="text-[14.5px] font-bold text-[#24312B]">
                Báo cáo &amp; Biểu đồ Radar
              </h3>
              <p className="text-[12px] text-[#69766F] leading-relaxed">
                Cung cấp báo cáo 5 chiều chuyên sâu, đánh dấu vị trí từ đệm trên
                dòng thời gian và đề xuất bài tập cải thiện cho từng sinh viên.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
