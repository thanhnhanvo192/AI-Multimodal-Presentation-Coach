import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar, { UserRole } from "./Sidebar";
import { Button, Card, Badge } from "./components/common";
import { createMockSession } from "./mocks/mockHistory";
import { presentationService } from "./services";

/* ── Circular Progress (Standardized Deep Forest Green) ───────── */
function CircularProgress({ pct }: { pct: number }) {
  const R = 68;
  const stroke = 7;
  const norm = R - stroke / 2;
  const circ = 2 * Math.PI * norm;
  const dash = (pct / 100) * circ;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: R * 2 + stroke, height: R * 2 + stroke }}
    >
      <svg
        width={R * 2 + stroke}
        height={R * 2 + stroke}
        viewBox={`0 0 ${R * 2 + stroke} ${R * 2 + stroke}`}
        className="-rotate-90 block"
      >
        {/* Track */}
        <circle
          cx={R + stroke / 2}
          cy={R + stroke / 2}
          r={norm}
          fill="none"
          stroke="#DCE5DF"
          strokeWidth={stroke}
        />
        {/* Main Arc */}
        <circle
          cx={R + stroke / 2}
          cy={R + stroke / 2}
          r={norm}
          fill="none"
          stroke="#276749"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.35s ease" }}
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-bold text-[#24312B] leading-none tracking-tight">
          {pct}%
        </span>
        <span className="text-[9.5px] font-semibold text-[#69766F] uppercase tracking-wider mt-1.5">
          {pct >= 100 ? "Hoàn thành" : "Đang xử lý"}
        </span>
      </div>
    </div>
  );
}

const STEP_DEFINITIONS = [
  { label: "Đang tải video lên hệ thống", doneAt: 10 },
  { label: "Trích xuất luồng âm thanh 16kHz", doneAt: 25 },
  { label: "Quét 478 điểm mốc khuôn mặt & góc đầu (MediaPipe)", doneAt: 45 },
  { label: "Đo lường tương tác ánh mắt & nụ cười AU12", doneAt: 60 },
  { label: "Phân tích nhịp độ nói (WPM) & cao độ F0", doneAt: 75 },
  { label: "Phát hiện và thống kê từ đệm tiếng Việt", doneAt: 88 },
  { label: "Tổng hợp bảng điểm Rubric 123D & AI Coach", doneAt: 100 },
];

function StepIcon({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <div className="w-5 h-5 rounded-full bg-[#276749] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
        ✓
      </div>
    );
  }
  if (active) {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-[#276749] bg-white flex items-center justify-center flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#276749] animate-pulse" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border border-[#DCE5DF] bg-[#F5F7F6] flex-shrink-0" />
  );
}

const TIPS = [
  "Duy trì giao tiếp mắt ít nhất 70% thời lượng giúp người nghe cảm thấy được kết nối.",
  "Khoảng tốc độ nói lý tưởng trong thuyết trình là từ 130 đến 160 từ/phút (WPM).",
  "Tạm dừng 1-2 giây trước khi chuyển ý giúp giảm thiểu hoàn toàn các từ đệm như 'ừm', 'à'.",
  "Thả lỏng hai vai và cử chỉ tay mở giúp bài nói tự nhiên và thuyết phục hơn.",
];

interface AnalyzingPageProps {
  onNav: (view: string) => void;
  onDone?: (newSessionId: string | number) => void;
  userRole: UserRole;
}

export default function AnalyzingPage({ onNav, onDone, userRole }: AnalyzingPageProps) {
  const [searchParams] = useSearchParams();
  const presentationId = searchParams.get("id");

  const [progress, setProgress] = useState(presentationId ? 15 : 42);
  const [tipIdx, setTipIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createdSessionRef = useRef<string | number | null>(null);

  // Đường dẫn video streaming từ backend để phát trực tiếp trong khi AI đang phân tích
  const videoStreamUrl = presentationId
    ? presentationService.resolveVideoUrl(`/presentations/${presentationId}/video`)
    : "";

  // Xoay vòng các mẹo luyện tập
  useEffect(() => {
    const tInterval = window.setInterval(() => {
      setTipIdx((i) => (i + 1) % TIPS.length);
    }, 4500);
    return () => window.clearInterval(tInterval);
  }, []);

  // Polling tiến độ thực tế từ Backend nếu có presentationId
  useEffect(() => {
    if (!presentationId) {
      // Chế độ mô phỏng fallback khi không có ID
      const pInterval = window.setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            window.clearInterval(pInterval);
            return 100;
          }
          return p + Math.floor(Math.random() * 6 + 2);
        });
      }, 350);
      return () => window.clearInterval(pInterval);
    }

    let isSubscribed = true;
    const pollInterval = window.setInterval(async () => {
      try {
        const data = await presentationService.getStatus(presentationId);
        if (!isSubscribed) return;

        if (data.status === "PROCESSING") {
          setProgress(Math.max(data.progress_percentage, 15));
        } else if (data.status === "COMPLETED") {
          setProgress(100);
          window.clearInterval(pollInterval);
          if (onDone && !createdSessionRef.current) {
            createdSessionRef.current = presentationId;
            setTimeout(() => onDone(presentationId), 700);
          }
        } else if (data.status === "FAILED") {
          window.clearInterval(pollInterval);
          setErrorMessage(data.error_message || "Quá trình phân tích bài thuyết trình thất bại.");
        }
      } catch (err) {
        console.warn("[AnalyzingPage] Polling failed, switching to local increment:", err);
        setProgress((p) => Math.min(p + 5, 95));
      }
    }, 1500);

    return () => {
      isSubscribed = false;
      window.clearInterval(pollInterval);
    };
  }, [presentationId, onDone]);

  // Fallback khi hoàn thành cho chế độ mock không có ID
  useEffect(() => {
    if (!presentationId && progress >= 100 && onDone && !createdSessionRef.current) {
      const newSession = createMockSession({
        title: "Phiên phân tích vừa ghi",
        context: "Luyện tập tự do",
        duration: "04:32",
        score: 83,
        trend: 3,
        eyeContact: 84,
        wpm: 156,
        fillerWords: 5,
      });
      createdSessionRef.current = newSession.id;
      const id = window.setTimeout(() => {
        onDone(newSession.id);
      }, 900);
      return () => window.clearTimeout(id);
    }
  }, [progress, presentationId, onDone]);

  const isCompleted = progress >= 100;

  // Xác định thông điệp phân tích theo thời gian thực
  const getScanningStageText = () => {
    if (progress < 25) return "Đang tách luồng âm thanh PCM 16kHz Mono...";
    if (progress < 50) return "MediaPipe FaceLandmarker: Đang quét 478 điểm mốc 3D khuôn mặt...";
    if (progress < 70) return "Đo lường góc quay đầu (Yaw/Pitch/Roll) và tỉ lệ nhìn thẳng camera...";
    if (progress < 85) return "Phân tích âm học Prosody: Đo WPM, khoảng lặng chết và đếm từ đệm...";
    if (progress < 98) return "Mô hình CatBoost 123D: Dự đoán 5 đầu điểm Rubric & SHAP XAI...";
    return "Huấn luyện viên AI đang lập lộ trình cải thiện cá nhân hóa...";
  };

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole={userRole} activeItem="analyzing" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col p-5 sm:p-7 overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#DCE5DF] pb-4 mb-6">
          <div>
            <h1 className="text-[18px] font-bold text-[#24312B] tracking-tight">
              {isCompleted ? "Phân tích hoàn tất!" : "Tiến trình phân tích AI đa phương thức"}
            </h1>
            <p className="text-[12.5px] text-[#69766F] mt-0.5">
              {presentationId ? `Mã phiên thuyết trình: #${presentationId}` : "Chế độ kiểm thử trực tiếp"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isCompleted ? "success" : "primary"} withDot>
              {isCompleted ? "Đã sẵn sàng báo cáo" : "AI đang tính toán"}
            </Badge>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl w-full mx-auto items-start">
          {/* CỘT TRÁI: Khung Video AI Scanning Viewport (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3.5">
            <Card className="p-0 overflow-hidden border border-[#DCE5DF] bg-[#1A231F] shadow-sm relative group">
              <div className="relative w-full aspect-video min-h-[260px] max-h-[480px] overflow-hidden bg-black">
                {videoStreamUrl ? (
                  <video
                    src={videoStreamUrl}
                    crossOrigin="anonymous"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A231F] text-white/70 relative">
                    <img
                      src="https://images.unsplash.com/photo-1758876020207-67890de8aa73?w=900&h=506&fit=crop&auto=format"
                      alt="Analyzing presentation preview"
                      className="w-full h-full object-cover opacity-60 absolute inset-0"
                    />
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                      <span className="text-xs text-white/80 font-medium">Video đang được AI trích xuất</span>
                    </div>
                  </div>
                )}

                {/* AI Laser Scanner Overlay Effect */}
                {!isCompleted && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#2DD4A0] to-transparent shadow-[0_0_12px_#2DD4A0] animate-bounce opacity-80" />
                  </div>
                )}

                {/* Top Badge Overlay */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className="bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/15 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#2DD4A0] animate-pulse" />
                    {isCompleted ? "Đã trích xuất 123 chiều đặc trưng" : "AI đang quét video trực tiếp"}
                  </span>
                </div>

                {/* Bottom Real-time Scanning Stage Subtitle */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 text-white">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-white/95">
                    <span className="text-[#2DD4A0] font-mono font-bold">[{progress}%]</span>
                    <span className="truncate">{getScanningStageText()}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Coaching Tip Box */}
            <Card className="p-4 flex items-start gap-3 bg-white border border-[#DCE5DF]">
              <div className="w-8 h-8 rounded-lg bg-[#E8F1EB] text-[#276749] flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                💡
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11px] font-semibold text-[#69766F] uppercase tracking-wider">
                  Mẹo luyện tập hữu ích
                </p>
                <p className="text-[12.5px] text-[#24312B] leading-relaxed">
                  {TIPS[tipIdx]}
                </p>
              </div>
            </Card>
          </div>

          {/* CỘT PHẢI: Tiến độ Circular Progress & 7 Bước AI (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Progress Card */}
            <Card className="p-5 flex flex-col items-center text-center space-y-3.5 border border-[#DCE5DF]">
              <CircularProgress pct={progress} />

              <div className="space-y-1">
                <h2 className="text-[16px] font-bold text-[#24312B] tracking-tight">
                  {isCompleted ? "Phân tích hoàn tất 100%!" : "Đang tổng hợp dữ liệu"}
                </h2>
                <p className="text-[12px] text-[#69766F] leading-relaxed">
                  {isCompleted
                    ? "Báo cáo chi tiết biểu đồ Radar và lỗi Seekbar đã sẵn sàng."
                    : "Hệ thống đang kết hợp Thị giác (MediaPipe) và Âm học (FFT/WPM)."}
                </p>
              </div>

              {errorMessage && (
                <div className="w-full p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[12.5px] flex items-center gap-2 text-left">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Button xem báo cáo */}
              {onDone && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-[13.5px] font-semibold mt-2"
                  onClick={() => {
                    const targetId = presentationId || createdSessionRef.current;
                    if (targetId) {
                      onDone(targetId);
                    } else {
                      onNav("history");
                    }
                  }}
                  disabled={!isCompleted}
                >
                  {isCompleted ? "Xem báo cáo phân tích ngay ➔" : "Đang xử lý dữ liệu..."}
                </Button>
              )}
            </Card>

            {/* Analysis Workflow Steps Card */}
            <Card className="divide-y divide-[#DCE5DF] overflow-hidden p-0 border border-[#DCE5DF]">
              <div className="px-4 py-2.5 bg-[#F5F7F6] border-b border-[#DCE5DF]">
                <p className="text-[11.5px] font-bold text-[#69766F] uppercase tracking-wider">
                  Quy trình phân tích 4 tầng AI
                </p>
              </div>

              {STEP_DEFINITIONS.map(({ label, doneAt }, i) => {
                const prevDoneAt = i > 0 ? STEP_DEFINITIONS[i - 1].doneAt : 0;
                const isDone = progress >= doneAt;
                const isActive = progress >= prevDoneAt && progress < doneAt;

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-2.5 text-[12px] transition-colors ${
                      isActive ? "bg-[#E8F1EB]/50" : "bg-white"
                    }`}
                  >
                    <StepIcon done={isDone} active={isActive} />
                    <span
                      className={`flex-1 ${
                        isDone
                          ? "text-[#69766F] line-through opacity-75"
                          : isActive
                          ? "text-[#24312B] font-semibold"
                          : "text-[#69766F]"
                      }`}
                    >
                      {label}
                    </span>

                    {isDone && <Badge variant="success">Xong</Badge>}
                    {isActive && (
                      <Badge variant="primary" withDot>
                        Đang chạy
                      </Badge>
                    )}
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
