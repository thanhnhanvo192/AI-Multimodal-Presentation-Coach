import { useState, useEffect, useRef } from "react";
import Sidebar, { UserRole } from "./Sidebar";
import { Button, Card, Badge } from "./components/common";

/* ── Inline Icons for Studio ─────────────────────────────── */

function IconStop() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="5" width="14" height="14" rx="2.5" />
    </svg>
  );
}

function IconRecord() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="7" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMic() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
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

function IconEye() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
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

function IconPace() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 12h-4l-3 9L9 3l-3 9H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTextSize() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7V4h16v3M9 20h6M12 4v16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconScroll() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M19 12l-7 7-7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
function useTimer(running: boolean) {
  const [seconds, setSeconds] = useState(75);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return fmt(seconds);
}

const TELEPROMPTER_TEXT = `Kính chào thầy cô và các bạn.

Hôm nay, nhóm chúng em xin trình bày đề án PBL6 — một nền tảng huấn luyện thuyết trình bằng AI được thiết kế để giúp sinh viên cải thiện kỹ năng nói trước công chúng thông qua phản hồi thời gian thực và khách quan.

Vấn đề chúng em nhận thấy rất rõ ràng: phần lớn sinh viên không nhận được phản hồi cụ thể về cách họ thuyết trình. Thầy cô thì bận, và tự đánh giá bản thân rất khó nếu không có dữ liệu có cấu trúc.

Giải pháp của chúng em sử dụng MediaPipe để theo dõi khuôn mặt và cử chỉ cơ thể, cùng với Google Gemini để tạo ra phản hồi ngôn ngữ tự nhiên. Kết hợp lại, chúng cung cấp các chỉ số về giao tiếp mắt, tốc độ nói, từ đệm và độ tự tin tổng thể.

Chúng em tin rằng với việc luyện tập nhất quán và dựa trên dữ liệu, mỗi sinh viên đều có thể bước vào buổi bảo vệ tiếp theo với sự chuẩn bị và tự tin hoàn toàn. Kính mời thầy cô xem demo.`;

interface StudioPageProps {
  onNav: (view: string) => void;
  onAnalyze?: () => void;
  userRole: UserRole;
}

export default function StudioPage({ onNav, onAnalyze, userRole }: StudioPageProps) {
  const [recording, setRecording] = useState(true);
  const [textSize, setTextSize] = useState(14);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [context, setContext] = useState("Bảo vệ đề án");
  const timer = useTimer(recording);
  const teleRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole={userRole} activeItem="studio" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-[#DCE5DF] flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-[17px] font-bold text-[#24312B] tracking-tight">
              Studio Ghi hình Trực tiếp
            </h1>
            {recording ? (
              <Badge variant="danger" withDot>
                Đang ghi hình
              </Badge>
            ) : (
              <Badge variant="neutral">Tạm dừng</Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#69766F] font-medium">Phiên #47</span>
            <div className="w-px h-3.5 bg-[#DCE5DF]" />
            <span className="text-[12px] text-[#69766F]">
              {new Date().toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Studio Workspace: Camera (70%) + Teleprompter Panel (30%) */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-5 min-h-0 overflow-y-auto lg:overflow-hidden">
          {/* ── LEFT: Camera & Controls ──────────────────────── */}
          <div className="flex-1 lg:flex-[7] min-w-0 flex flex-col gap-3.5">
            {/* Camera Viewport Container */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-[#1A231F] border border-[#DCE5DF] min-h-[360px] flex flex-col">
              {/* Webcam Video / Live Preview Feed */}
              <img
                src="https://images.unsplash.com/photo-1758876020207-67890de8aa73?w=1200&h=900&fit=crop&auto=format"
                alt="Live webcam preview — presenter"
                className="w-full h-full object-cover"
              />

              {/* Subtle top & bottom vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

              {/* AI Face & Posture Tracking Bounding Box */}
              <div className="absolute top-[14%] left-[38%] w-[24%] h-[50%] pointer-events-none">
                <div className="absolute inset-0 border border-[#276749]/80 rounded-lg">
                  <div className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#276749] rounded-tl" />
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#276749] rounded-tr" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#276749] rounded-bl" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#276749] rounded-br" />
                </div>
                <div className="absolute -top-5 left-0 bg-[#276749]/90 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                  AI Tracking
                </div>
              </div>

              {/* HUD: Top Status Indicators */}
              <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium px-3 py-1 rounded-full">
                    <IconMic />
                    <span>Micro: Bật</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-[#276749]/40 text-[#E8F1EB] text-[11px] font-medium px-3 py-1 rounded-full">
                    <IconEye />
                    <span>Ánh mắt: Chuẩn</span>
                  </div>
                  <div className="hidden sm:inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/15 text-white/90 text-[11px] font-medium px-3 py-1 rounded-full">
                    <IconPace />
                    <span>Nhịp độ: Ổn định</span>
                  </div>
                </div>

                {/* HUD: Timer */}
                <div className="flex items-center gap-2 bg-black/55 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      recording ? "bg-[#C24141] animate-pulse" : "bg-neutral-400"
                    }`}
                  />
                  <span className="text-white font-mono text-[14px] font-bold tracking-wider">
                    {timer}
                  </span>
                  <span className="text-white/40 font-mono text-[12px]">/ 03:00</span>
                </div>
              </div>

              {/* Audio Waveform Visualization Strip */}
              <div className="absolute bottom-16 left-0 right-0 h-7 flex items-center justify-center gap-0.5 px-8 pointer-events-none opacity-80">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#276749]/80 rounded-full transition-all duration-150"
                    style={{
                      height: `${4 + Math.abs(Math.sin(i * 0.5 + Date.now() * 0.001)) * 16}px`,
                    }}
                  />
                ))}
              </div>

              {/* Bottom Control Bar */}
              <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                {/* Record / Stop Button */}
                <button
                  type="button"
                  onClick={() => setRecording(!recording)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[13px] text-white transition-all active:scale-[0.98] ${
                    recording
                      ? "bg-[#C24141] hover:bg-[#a53232]"
                      : "bg-[#276749] hover:bg-[#1F553C]"
                  }`}
                >
                  {recording ? <IconStop /> : <IconRecord />}
                  <span>{recording ? "Dừng ghi hình" : "Bắt đầu ghi hình"}</span>
                </button>

                {/* Send for Analysis Button */}
                <button
                  type="button"
                  onClick={onAnalyze}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-[13px] bg-white text-[#24312B] hover:bg-[#F5F7F6] border border-[#DCE5DF] transition-all active:scale-[0.98]"
                >
                  <IconSend />
                  <span>Gửi phân tích</span>
                </button>
              </div>
            </div>

            {/* Realtime Metrics Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Giao tiếp mắt", value: "85%", status: "Tốt", variant: "success" },
                { label: "Tốc độ nói", value: "158", unit: "WPM", status: "Hơi nhanh", variant: "warning" },
                { label: "Độ tự tin", value: "72%", status: "Ổn định", variant: "neutral" },
                { label: "Từ đệm", value: "3", unit: "từ", status: "Thấp", variant: "success" },
              ].map(({ label, value, unit, status, variant }) => (
                <div
                  key={label}
                  className="bg-white border border-[#DCE5DF] rounded-xl px-4 py-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-medium text-[#69766F]">{label}</span>
                    <Badge variant={variant as "success" | "warning" | "neutral"}>{status}</Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[22px] font-bold text-[#24312B] tracking-tight">
                      {value}
                    </span>
                    {unit && (
                      <span className="text-[11.5px] font-medium text-[#69766F]">{unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Teleprompter & Context (30%) ─────────── */}
          <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-3.5">
            {/* Context Selector Card */}
            <Card className="p-4 space-y-2">
              <label className="block text-[11.5px] font-semibold text-[#69766F] uppercase tracking-wider">
                Ngữ cảnh thuyết trình
              </label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full h-10 bg-[#F5F7F6] border border-[#DCE5DF] text-[#24312B] text-[13.5px] font-medium rounded-lg px-3 outline-none focus:border-[#276749] focus:ring-1 focus:ring-[#276749] transition-all cursor-pointer"
              >
                <option>Bảo vệ đề án</option>
                <option>Phỏng vấn việc làm</option>
                <option>Hội thảo</option>
                <option>Thuyết trình lớp học</option>
                <option>Thuyết phục khách hàng</option>
              </select>
              <p className="text-[11px] text-[#69766F] pt-0.5">
                AI sẽ căn chỉnh bộ tiêu chí đánh giá phù hợp với bối cảnh này.
              </p>
            </Card>

            {/* Teleprompter Card */}
            <Card className="p-4 flex flex-col flex-1 min-h-[380px] gap-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#DCE5DF]">
                <span className="text-[12px] font-semibold text-[#24312B] uppercase tracking-wider">
                  Máy nhắc chữ
                </span>
                <Badge variant="primary" withDot>
                  Đang cuộn
                </Badge>
              </div>

              {/* Text Area with subtle focus frame */}
              <div className="flex-1 relative min-h-[200px] rounded-lg bg-[#1A231F] overflow-hidden border border-[#DCE5DF]">
                {/* Top fade */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#1A231F] to-transparent z-10 pointer-events-none" />
                {/* Center reading line */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-8 bg-white/5 border-y border-white/10 z-10 pointer-events-none" />
                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#1A231F] to-transparent z-10 pointer-events-none" />

                <textarea
                  ref={teleRef}
                  defaultValue={TELEPROMPTER_TEXT}
                  className="absolute inset-0 w-full h-full bg-transparent text-slate-100 resize-none outline-none px-4 py-5 leading-relaxed overflow-y-auto"
                  style={{ fontSize: textSize, lineHeight: 1.75 }}
                  spellCheck={false}
                />
              </div>

              {/* Teleprompter Controls */}
              <div className="space-y-3 pt-2 border-t border-[#DCE5DF]">
                {/* Text Size Control */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0 text-[#69766F]">
                    <IconTextSize />
                    <span className="text-[12px] font-medium text-[#24312B]">Cỡ chữ</span>
                  </div>
                  <input
                    type="range"
                    min={11}
                    max={22}
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="flex-1 accent-[#276749] h-1.5 bg-[#DCE5DF] rounded-lg cursor-pointer"
                  />
                  <span className="text-[11.5px] font-mono font-medium text-[#276749] w-8 text-right">
                    {textSize}px
                  </span>
                </div>

                {/* Scroll Speed Control */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 w-24 flex-shrink-0 text-[#69766F]">
                    <IconScroll />
                    <span className="text-[12px] font-medium text-[#24312B]">Tốc độ cuộn</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(Number(e.target.value))}
                    className="flex-1 accent-[#276749] h-1.5 bg-[#DCE5DF] rounded-lg cursor-pointer"
                  />
                  <span className="text-[11.5px] font-mono font-medium text-[#276749] w-8 text-right">
                    {scrollSpeed}x
                  </span>
                </div>

                {/* Quick Speed Labels */}
                <div className="flex justify-between text-[10px] text-[#69766F] px-1">
                  <span>Chậm</span>
                  <span>Vừa phải</span>
                  <span>Nhanh</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
