import { useState } from "react";
import Sidebar from "./Sidebar";
import { Button, Card, Badge } from "./components/common";
import {
  getAdminKPIs,
  ACTIVITY_7_DAYS,
  ACTIVITY_14_DAYS,
  getTopicDistribution,
  getRecentAdminActivities,
} from "./mocks/mockAdmin";
import { ActivityDataPoint } from "./types";

/* ── Activity Area / Line Chart ─────────────────────────────────── */
function ActivityChart({ data }: { data: ActivityDataPoint[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const W = 700,
    H = 190;
  const padL = 36,
    padR = 20,
    padT = 16,
    padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...data.map((d) => d.sessions), 16);
  const minVal = 0;

  const toX = (i: number) => padL + (i / (data.length - 1)) * chartW;
  const toY = (v: number) =>
    padT + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.sessions) }));
  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    linePath +
    ` L${pts[pts.length - 1].x},${padT + chartH} L${pts[0].x},${padT + chartH} Z`;

  const yTicks = [0, 5, 10, 15];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 210, userSelect: "none" }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="adminAreaGrad" x1="0%" y1="0%" x2="0%" y2="1">
            <stop offset="0%" stopColor="#276749" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#276749" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y Gridlines */}
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
        <path d={areaPath} fill="url(#adminAreaGrad)" />

        {/* Trend line */}
        <path
          d={linePath}
          fill="none"
          stroke="#276749"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* X ticks and markers */}
        {data.map((d, i) => {
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
                onMouseEnter={() => setHoverIdx(i)}
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

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div
          className="absolute top-2 bg-[#24312B] text-white text-[11px] font-medium px-2.5 py-1 rounded-md pointer-events-none"
          style={{
            left: `calc(${(toX(hoverIdx) / W) * 100}% - 35px)`,
          }}
        >
          {data[hoverIdx].label}:{" "}
          <span className="font-bold text-[#E8F1EB]">
            {data[hoverIdx].sessions} phiên
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Main Admin Dashboard Component ─────────────────────────────── */
interface AdminDashboardPageProps {
  onNav: (view: string) => void;
}

export default function AdminDashboardPage({ onNav }: AdminDashboardPageProps) {
  const [timeRange, setTimeRange] = useState<7 | 14>(7);

  const kpis = getAdminKPIs();
  const topics = getTopicDistribution();
  const recentActivities = getRecentAdminActivities();
  const activityData = timeRange === 7 ? ACTIVITY_7_DAYS : ACTIVITY_14_DAYS;

  const totalSessionsInRange = activityData.reduce(
    (acc, cur) => acc + cur.sessions,
    0
  );

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole="admin" activeItem="dashboard" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-[#DCE5DF] px-6 sm:px-8 py-5 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[18px] font-bold text-[#24312B] tracking-tight leading-tight">
                  Bảng điều khiển Quản trị
                </h1>
                <Badge variant="primary">Kỳ 2026</Badge>
              </div>
              <p className="text-[12px] text-[#69766F] mt-0.5">
                Tổng hợp hoạt động rèn luyện thuyết trình của sinh viên và vận hành hệ thống AI Coach
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNav("users")}
              >
                Quản lý người dùng
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNav("config")}
              >
                Cấu hình hệ thống
              </Button>
            </div>
          </div>

          {/* KPI Cards (4 Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: "Tổng số sinh viên",
                value: String(kpis.totalStudents),
                sub: `${kpis.activeStudents} tài khoản đang hoạt động`,
              },
              {
                label: "Tổng số phiên",
                value: String(kpis.totalSessions),
                sub: "Đã phân tích qua AI",
              },
              {
                label: "Điểm trung bình",
                value: `${kpis.avgScore}/100`,
                sub: "Chất lượng bài nói chung",
                highlight: true,
              },
              {
                label: "Tỷ lệ hoàn thành AI",
                value: `${kpis.completionRate}%`,
                sub: "Phiên xử lý thành công",
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
          {/* ── Activity Chart Card ────────────────────────── */}
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold text-[#24312B]">
                  Tần suất phiên luyện tập theo thời gian
                </h2>
                <p className="text-[12px] text-[#69766F] mt-0.5">
                  Số lượng bài nói được sinh viên gửi phân tích qua từng ngày
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#69766F] hidden sm:inline">
                  Tổng: <b>{totalSessionsInRange} phiên</b>
                </span>
                <div className="inline-flex rounded-lg border border-[#DCE5DF] p-0.5 bg-[#F5F7F6]">
                  <button
                    type="button"
                    onClick={() => setTimeRange(7)}
                    className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-all ${
                      timeRange === 7
                        ? "bg-white text-[#24312B] font-semibold"
                        : "text-[#69766F] hover:text-[#24312B]"
                    }`}
                  >
                    7 ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeRange(14)}
                    className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-all ${
                      timeRange === 14
                        ? "bg-white text-[#24312B] font-semibold"
                        : "text-[#69766F] hover:text-[#24312B]"
                    }`}
                  >
                    14 ngày
                  </button>
                </div>
              </div>
            </div>

            <ActivityChart data={activityData} />
          </Card>

          {/* ── Topics & System Status Row (2 Columns) ────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Topic Distribution */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#24312B]">
                    Phân bố theo ngữ cảnh bài nói
                  </h2>
                  <p className="text-[12px] text-[#69766F] mt-0.5">
                    Tỷ lệ các chủ đề luyện tập được chọn nhiều nhất
                  </p>
                </div>
                <Badge variant="neutral">Toàn thời gian</Badge>
              </div>

              <div className="space-y-3 pt-2">
                {topics.map((t) => (
                  <div key={t.context} className="space-y-1.5">
                    <div className="flex justify-between text-[12px]">
                      <span className="font-medium text-[#24312B]">
                        {t.context}
                      </span>
                      <span className="text-[#69766F] font-semibold">
                        {t.count} phiên ({t.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#DCE5DF] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#276749] transition-all"
                        style={{ width: `${t.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Platform Health Snapshot (Demo/Illustration) */}
            <Card className="p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[14px] font-semibold text-[#24312B]">
                      Tình trạng dịch vụ nền tảng
                    </h2>
                    <p className="text-[12px] text-[#69766F] mt-0.5">
                      Giám sát tổng quan các cụm xử lý AI và máy chủ API
                    </p>
                  </div>
                  <Badge variant="success" withDot>
                    Ổn định (Demo)
                  </Badge>
                </div>

                <div className="divide-y divide-[#DCE5DF] pt-2 text-[12.5px]">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#69766F]">API Gateway (Nginx)</span>
                    <span className="font-semibold text-[#276749]">
                      Hoạt động (HTTP 200 · 4ms)
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#69766F]">FastAPI Application Server</span>
                    <span className="font-semibold text-[#276749]">
                      Hoạt động (Uptime 99.97%)
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#69766F]">Hàng đợi Redis Worker</span>
                    <span className="font-semibold text-[#24312B]">
                      12 tác vụ chờ · 4 worker chạy
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-[#69766F]">MediaPipe AI Pipeline</span>
                    <span className="font-semibold text-[#276749]">
                      Sẵn sàng (Face &amp; Pose GPU)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DCE5DF]">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => onNav("config")}
                >
                  Mở bảng cấu hình hệ thống chi tiết →
                </Button>
              </div>
            </Card>
          </div>

          {/* ── Recent Practice Activity Table ────────────── */}
          <Card className="overflow-hidden p-0">
            <div className="px-5 sm:px-6 py-4 border-b border-[#DCE5DF] flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-[#24312B]">
                  Hoạt động luyện tập gần đây
                </h2>
                <p className="text-[12px] text-[#69766F] mt-0.5">
                  Các phiên phân tích vừa được hoàn tất trên toàn hệ thống
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNav("users")}
                className="text-[#276749]"
              >
                Xem danh sách người dùng →
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="bg-[#F5F7F6] border-b border-[#DCE5DF] text-[#69766F] uppercase tracking-wider font-semibold text-[11px]">
                    <th className="px-6 py-3">Sinh viên</th>
                    <th className="px-6 py-3">Bài thuyết trình</th>
                    <th className="px-6 py-3">Ngữ cảnh</th>
                    <th className="px-6 py-3">Thời lượng</th>
                    <th className="px-6 py-3">Điểm</th>
                    <th className="px-6 py-3">Ngày ghi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5DF]">
                  {recentActivities.map((act) => (
                    <tr
                      key={act.id}
                      className="hover:bg-[#F5F7F6]/50 transition-colors"
                    >
                      <td className="px-6 py-3 font-semibold text-[#24312B]">
                        {act.userName}
                      </td>
                      <td className="px-6 py-3 text-[#24312B]">{act.title}</td>
                      <td className="px-6 py-3">
                        <Badge variant="neutral">{act.context}</Badge>
                      </td>
                      <td className="px-6 py-3 font-mono text-[#69766F]">
                        {act.duration}
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-bold text-[#276749] bg-[#E8F1EB] px-2 py-0.5 rounded-md text-[12px]">
                          {act.score}/100
                        </span>
                      </td>
                      <td className="px-6 py-3 text-[#69766F] font-mono text-[11.5px]">
                        {act.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
