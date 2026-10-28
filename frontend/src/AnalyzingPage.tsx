import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar, { UserRole } from "./Sidebar";
import { Button, Card, Badge } from "./components/common";
import { createMockSession } from "./mocks/mockHistory";
import { presentationService } from "./services";

/* ── Circular Progress (Standardized Deep Forest Green) ───────── */
function CircularProgress({ pct }: { pct: number }) {
  const R = 75;
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
        <span className="text-[28px] font-bold text-[#24312B] leading-none tracking-tight">
          {pct}%
        </span>
        <span className="text-[10px] font-semibold text-[#69766F] uppercase tracking-wider mt-1.5">
          {pct >= 100 ? "Hoàn thành" : "Đang xử lý"}
        </span>
      </div>
    </div>
  );
}

const STEP_DEFINITIONS = [
  { label: "Đang tải video lên hệ thống", doneAt: 10 },
  { label: "Trích xuất luồng âm thanh", doneAt: 25 },
  { label: "Phát hiện điểm mốc khuôn mặt (Face Landmarks)", doneAt: 45 },
  { label: "Đo lường tỉ lệ giao tiếp mắt", doneAt: 60 },
  { label: "Phân tích nhịp độ và tốc độ nói (WPM)", doneAt: 75 },
  { label: "Phát hiện và thống kê từ đệm", doneAt: 90 },
  { label: "Tổng hợp báo cáo và khuyến nghị từ AI", doneAt: 100 },
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
      // Chế độ mô phỏng fallback
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

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole={userRole} activeItem="analyzing" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 overflow-y-auto">
        <div className="flex flex-col items-center gap-5 max-w-lg w-full">
          {/* Progress & Session Info Card */}
          <Card className="w-full p-6 flex flex-col items-center text-center space-y-4">
            <CircularProgress pct={progress} />

            <div className="space-y-1">
              <h1 className="text-[18px] font-bold text-[#24312B] tracking-tight">
                {isCompleted ? "Phân tích hoàn tất!" : "Đang phân tích bài thuyết trình"}
              </h1>
              <p className="text-[12.5px] text-[#69766F] leading-relaxed">
                {isCompleted
                  ? "Báo cáo chi tiết đã sẵn sàng. Bạn có thể xem kết quả ngay."
                  : "Mô hình AI đa kênh đang phân tích cử chỉ, ánh mắt và bóc băng âm thanh."}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px] flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}
          </Card>

          {/* Analysis Workflow Steps Card */}
          <Card className="w-full divide-y divide-[#DCE5DF] overflow-hidden p-0">
            {STEP_DEFINITIONS.map(({ label, doneAt }, i) => {
              const prevDoneAt = i > 0 ? STEP_DEFINITIONS[i - 1].doneAt : 0;
              const isDone = progress >= doneAt;
              const isActive = progress >= prevDoneAt && progress < doneAt;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 text-[12.5px] transition-colors ${
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

                  {isDone && <Badge variant="success">Hoàn thành</Badge>}
                  {isActive && (
                    <Badge variant="primary" withDot>
                      Đang xử lý
                    </Badge>
                  )}
                </div>
              );
            })}
          </Card>

          {/* Coaching Tip Box */}
          <Card className="w-full p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E8F1EB] text-[#276749] flex items-center justify-center flex-shrink-0 text-sm font-semibold">
              💡
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[11px] font-semibold text-[#69766F] uppercase tracking-wider">
                Mẹo luyện tập
              </p>
              <p className="text-[12px] text-[#24312B] leading-relaxed">
                {TIPS[tipIdx]}
              </p>
            </div>
          </Card>

          {/* Quick Action Button */}
          {onDone && (
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center"
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
              Xem báo cáo phân tích
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
