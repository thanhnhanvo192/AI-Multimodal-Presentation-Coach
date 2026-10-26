import { useState, useEffect, useRef } from "react";
import Sidebar, { UserRole } from "./Sidebar";
import { Button, Card, Badge } from "./components/common";
import { createMockSession } from "./mocks/mockHistory";

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

/* ── Step List ──────────────────────────────────────────── */
const STEPS = [
  { label: "Đang tải video lên hệ thống", done: true, active: false },
  { label: "Trích xuất luồng âm thanh", done: true, active: false },
  { label: "Phát hiện điểm mốc khuôn mặt (Face Landmarks)", done: true, active: false },
  { label: "Đo lường tỉ lệ giao tiếp mắt", done: false, active: true },
  { label: "Phân tích nhịp độ và tốc độ nói (WPM)", done: false, active: false },
  { label: "Phát hiện và thống kê từ đệm", done: false, active: false },
  { label: "Tổng hợp báo cáo và khuyến nghị từ AI", done: false, active: false },
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
  const [progress, setProgress] = useState(42);
  const [tipIdx, setTipIdx] = useState(0);
  const createdSessionRef = useRef<string | number | null>(null);

  useEffect(() => {
    const tInterval = window.setInterval(() => {
      setTipIdx((i) => (i + 1) % TIPS.length);
    }, 4500);
    return () => window.clearInterval(tInterval);
  }, []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (progress >= 100 && onDone && !createdSessionRef.current) {
      // Cơ chế mock tối thiểu: Tạo phiên mới và chuyển tới báo cáo của chính phiên vừa tạo
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
  }, [progress, onDone]);

  const isCompleted = progress >= 100;

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole={userRole} activeItem="analyzing" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 overflow-y-auto">
        <div className="flex flex-col items-center gap-5 max-w-lg w-full">
          {/* Progress & Session Info Card */}
          <Card className="p-6 flex flex-col items-center gap-4 w-full">
            {/* Session Indicator Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="primary" withDot>
                Phiên #47
              </Badge>
              <span className="text-[12px] text-[#69766F]">
                bai_thuyet_trinh_pbl6.mp4 (04:32)
              </span>
            </div>

            <CircularProgress pct={Math.min(progress, 100)} />

            <div className="text-center space-y-1">
              <h1 className="text-[16px] font-bold text-[#24312B] tracking-tight">
                {isCompleted
                  ? "Phân tích đa phương thức hoàn tất!"
                  : "Đang phân tích đa phương thức..."}
              </h1>
              <p className="text-[12px] text-[#69766F] max-w-sm">
                Mô hình AI đang trích xuất giao tiếp mắt, tốc độ nói, ngôn ngữ cơ thể và từ đệm
              </p>
            </div>

            {/* Overall Linear Progress Bar */}
            <div className="w-full space-y-1.5 pt-2 border-t border-[#DCE5DF]">
              <div className="flex justify-between text-[12px] font-medium text-[#69766F]">
                <span>Tiến độ tổng thể</span>
                <span className="font-semibold text-[#24312B]">
                  {Math.min(progress, 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-[#DCE5DF] rounded-full overflow-hidden w-full">
                <div
                  className="h-full bg-[#276749] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Analysis Workflow Steps Card */}
          <Card className="w-full divide-y divide-[#DCE5DF] overflow-hidden p-0">
            {STEPS.map(({ label, done, active }, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 text-[12.5px] transition-colors ${
                  active ? "bg-[#E8F1EB]/50" : "bg-white"
                }`}
              >
                <StepIcon done={done} active={active} />
                <span
                  className={`flex-1 ${
                    done
                      ? "text-[#69766F] line-through opacity-75"
                      : active
                      ? "text-[#24312B] font-semibold"
                      : "text-[#69766F]"
                  }`}
                >
                  {label}
                </span>

                {done && (
                  <Badge variant="success">Hoàn thành</Badge>
                )}
                {active && (
                  <Badge variant="primary" withDot>
                    Đang xử lý
                  </Badge>
                )}
              </div>
            ))}
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
                if (createdSessionRef.current) {
                  onDone(createdSessionRef.current);
                } else {
                  const s = createMockSession({
                    title: "Phiên phân tích vừa ghi",
                    context: "Luyện tập tự do",
                    duration: "04:32",
                  });
                  createdSessionRef.current = s.id;
                  onDone(s.id);
                }
              }}
            >
              Xem báo cáo phân tích →
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
