import { useState } from "react";
import Sidebar, { UserRole } from "./Sidebar";
import { CHART_DATA, getStoredSessions } from "./mocks/mockHistory";
import { Button, Card, Badge } from "./components/common";

/* ── Standardized Clean Trend Line Chart ────────────────────────── */
function LineChart({
  hoverIdx,
  setHoverIdx,
}: {
  hoverIdx: number | null;
  setHoverIdx: (i: number | null) => void;
}) {
  const W = 700,
    H = 190;
  const padL = 40,
    padR = 20,
    padT = 16,
    padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const minScore = 45,
    maxScore = 100;
  const toX = (i: number) => padL + (i / (CHART_DATA.length - 1)) * chartW;
  const toY = (v: number) =>
    padT + chartH - ((v - minScore) / (maxScore - minScore)) * chartH;

  const pts = CHART_DATA.map((d, i) => ({ x: toX(i), y: toY(d.score) }));
  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    linePath +
    ` L${pts[pts.length - 1].x},${padT + chartH} L${pts[0].x},${padT + chartH} Z`;

  const yTicks = [50, 70, 90];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 200, userSelect: "none" }}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <defs>
        <linearGradient id="lineAreaGrad" x1="0%" y1="0%" x2="0%" y2="1">
          <stop offset="0%" stopColor="#276749" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#276749" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Y-axis gridlines */}
      {yTicks.map((v) => {
        const y = toY(v);
        return (
          <g key={v}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="#DCE5DF"
              strokeWidth="1"
            />
            <text
              x={padL - 8}
              y={y + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="#69766F"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              {v}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#lineAreaGrad)" />

      {/* Main trend line */}
      <path
        d={linePath}
        fill="none"
        stroke="#276749"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* X-axis labels + interactive markers */}
      {CHART_DATA.map((d, i) => {
        const x = toX(i);
        const active = hoverIdx === i;
        return (
          <g key={i}>
            {active && (
              <line
                x1={x}
                y1={padT}
                x2={x}
                y2={padT + chartH}
                stroke="#276749"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            )}
            <circle
              cx={x}
              cy={pts[i].y}
              r={active ? 5.5 : 4}
              fill={active ? "#276749" : "white"}
              stroke="#276749"
              strokeWidth="2"
              style={{ cursor: "pointer", transition: "r 0.15s" }}
            />
            <text
              x={x}
              y={H - 6}
              textAnchor="middle"
              fontSize="10"
              fill={active ? "#24312B" : "#69766F"}
              fontWeight={active ? "600" : "500"}
              fontFamily="Inter, sans-serif"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Main Dashboard Component ───────────────────────────────────── */
interface DashboardPageProps {
  onNav: (view: string) => void;
  onViewReport: (id: string | number) => void;
  userRole: UserRole;
}

export default function DashboardPage({
  onNav,
  onViewReport,
  userRole,
}: DashboardPageProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const sessions = getStoredSessions();

  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length)
      : 0;

  const totalMins = sessions.reduce((a, s) => {
    const [m, sec] = s.duration.split(":").map(Number);
    return a + (m || 0) + (sec || 0) / 60;
  }, 0);

  const improvement =
    sessions.length >= 2
      ? sessions[0].score - sessions[sessions.length - 1].score
      : 0;

  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole={userRole} activeItem="dashboard" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-[#DCE5DF] px-6 sm:px-8 py-5 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[18px] font-bold text-[#24312B] tracking-tight leading-tight">
                  Bảng điều khiển sinh viên
                </h1>
                <Badge variant="primary">Kỳ học 2026</Badge>
              </div>
              <p className="text-[12px] text-[#69766F] mt-0.5">
                Chào mừng bạn trở lại! Dưới đây là tổng hợp tiến độ và kỹ năng thuyết trình đa phương thức
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNav("upload")}
                leftIcon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              >
                Tải video lên
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNav("studio")}
                leftIcon={<span className="text-base font-bold leading-none">+</span>}
              >
                Luyện tập Studio
              </Button>
            </div>
          </div>

          {/* Unified Stat Cards (KPIs) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: "Tổng số phiên",
                value: String(sessions.length),
                sub: "Đã hoàn thành",
              },
              {
                label: "Điểm trung bình",
                value: `${avgScore}/100`,
                sub: "Trên tất cả phiên",
              },
              {
                label: "Thời gian luyện",
                value: `${Math.round(totalMins)} phút`,
                sub: "Tổng thời lượng video",
              },
              {
                label: "Mức cải thiện",
                value: `${improvement >= 0 ? "+" : ""}${improvement} điểm`,
                sub: "Kể từ phiên đầu tiên",
                highlight: true,
              },
            ].map(({ label, value, sub, highlight }) => (
              <Card
                key={label}
                className="px-4 py-3 space-y-1 bg-[#F5F7F6]/50 border-[#DCE5DF]"
              >
                <p className="text-[11.5px] font-medium text-[#69766F]">{label}</p>
                <p
                  className={`text-[20px] font-bold tracking-tight ${
                    highlight ? "text-[#276749]" : "text-[#24312B]"
                  }`}
                >
                  {value}
                </p>
                <p className="text-[11px] text-[#69766F]">{sub}</p>
              </Card>
            ))}
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* ── Growth Chart Card ─────────────────── */}
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-[14px] font-semibold text-[#24312B]">
                  Xu hướng điểm số theo tuần
                </h2>
                <p className="text-[12px] text-[#69766F] mt-0.5">
                  Đánh giá tiến bộ tổng hợp qua từng đợt luyện tập thuyết trình
                </p>
              </div>
              <Badge variant="success">+27 điểm trong 4 tuần</Badge>
            </div>

            <LineChart hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} />

            {/* Week Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#DCE5DF]">
              {CHART_DATA.map((d, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-3 transition-colors cursor-pointer border ${
                    hoverIdx === i
                      ? "bg-[#E8F1EB] border-[#D4E5D9]"
                      : "bg-[#F5F7F6]/60 border-[#DCE5DF] hover:bg-[#F5F7F6]"
                  }`}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  <p className="text-[11px] font-medium text-[#69766F]">{d.label}</p>
                  <p className="text-[16px] font-bold text-[#24312B] mt-0.5">
                    {d.score} điểm
                  </p>
                  <p className="text-[11px] text-[#69766F] mt-0.5 truncate">
                    {d.sessions} phiên · {d.topSkill}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Recent Sessions Section ───────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-[#24312B]">
                  Phiên luyện tập gần đây
                </h2>
                <p className="text-[12px] text-[#69766F] mt-0.5">
                  Các bài thuyết trình mới nhất cần rà soát hoặc theo dõi tiến trình
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNav("history")}
                className="text-[#276749] font-medium"
              >
                Xem toàn bộ lịch sử →
              </Button>
            </div>

            {recentSessions.length === 0 ? (
              <Card className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E8F1EB] text-[#276749] flex items-center justify-center mx-auto text-xl">
                  🎙️
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-semibold text-[#24312B]">
                    Bạn chưa có phiên luyện tập nào
                  </p>
                  <p className="text-[12px] text-[#69766F] max-w-sm mx-auto">
                    Hãy bắt đầu ghi hình trong Studio hoặc tải video lên để AI phân tích giao tiếp mắt, tốc độ nói và cử chỉ.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button variant="primary" size="sm" onClick={() => onNav("studio")}>
                    Vào Studio luyện tập
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((s) => (
                  <Card
                    key={s.id}
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:border-[#276749]/40 transition-colors"
                  >
                    {/* Score Badge */}
                    <div className="w-10 h-10 rounded-xl bg-[#E8F1EB] border border-[#D4E5D9] flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[14px] font-bold text-[#276749] leading-none">
                        {s.score}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13.5px] font-semibold text-[#24312B] truncate">
                          {s.title}
                        </p>
                        <Badge variant="neutral">{s.context}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[11.5px] text-[#69766F] mt-1 flex-wrap">
                        <span>{s.date}</span>
                        <span>·</span>
                        <span className="font-mono">{s.duration}</span>
                        {s.trend !== null && s.trend !== 0 && (
                          <>
                            <span>·</span>
                            <span className="text-[#276749] font-medium">
                              +{s.trend} điểm so với trước
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* View Report Button */}
                    <div className="flex-shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewReport(s.id)}
                      >
                        Xem báo cáo
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
