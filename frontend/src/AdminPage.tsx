import { useState } from "react";
import Sidebar, { UserRole } from "./Sidebar";
import { Button, Card, Badge } from "./components/common";

/* ── Shared progress bar ─────────────────────────────────── */
function UtilBar({ label, pct }: { label: string; pct: number }) {
  const isHigh = pct >= 80;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[12px]">
        <span className="font-medium text-[#69766F]">{label}</span>
        <span
          className={`font-semibold ${
            isHigh ? "text-[#B7791F]" : "text-[#24312B]"
          }`}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-[#DCE5DF] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isHigh ? "bg-[#B7791F]" : "bg-[#276749]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Mini sparkline ──────────────────────────────────────── */
function Sparkline({
  data,
  color = "#276749",
}: {
  data: number[];
  color?: string;
}) {
  const max = Math.max(...data),
    min = Math.min(...data);
  const W = 80,
    H = 26;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * H * 0.75 - H * 0.12;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={pts[pts.length - 1].split(",")[0]}
        cy={pts[pts.length - 1].split(",")[1]}
        r="2"
        fill={color}
      />
    </svg>
  );
}

/* ── Inline form input ──────────────────────────────────── */
function ConfigInput({
  label,
  value,
  onChange,
  suffix,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  helper?: string;
}) {
  return (
    <div className="space-y-1.5 flex-1 min-w-[140px]">
      <label className="block text-[11px] font-semibold text-[#69766F] uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center h-10 rounded-lg border border-[#DCE5DF] overflow-hidden bg-[#F5F7F6] focus-within:bg-white focus-within:border-[#276749] focus-within:ring-1 focus-within:ring-[#276749] transition-all">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-[13.5px] font-semibold text-[#24312B] bg-transparent outline-none"
        />
        {suffix && (
          <span className="pr-3 text-[12px] font-medium text-[#69766F] select-none">
            {suffix}
          </span>
        )}
      </div>
      {helper && <p className="text-[11px] text-[#69766F]">{helper}</p>}
    </div>
  );
}

/* ── Donut mini-chart ────────────────────────────────────── */
function Donut({ pct, size = 38 }: { pct: number; size?: number }) {
  const r = size / 2 - 4,
    circ = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90 flex-shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#DCE5DF"
        strokeWidth="4"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#276749"
        strokeWidth="4"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Log table row data ─────────────────────────────────── */
const LOG_ROWS = [
  {
    ts: "14:32:01",
    user: "usr_102230046",
    action: "Tải lên video",
    status: "Thành công",
    variant: "success" as const,
    size: "48 MB",
    duration: "2.1s",
  },
  {
    ts: "14:28:15",
    user: "usr_99887711",
    action: "Phân tích AI",
    status: "Đang xử lý",
    variant: "primary" as const,
    size: "—",
    duration: "đang chạy",
  },
  {
    ts: "14:21:44",
    user: "usr_77340021",
    action: "Xuất PDF",
    status: "Thành công",
    variant: "success" as const,
    size: "1.2 MB",
    duration: "0.4s",
  },
  {
    ts: "14:17:09",
    user: "usr_44512983",
    action: "Tải lên video",
    status: "Thất bại",
    variant: "danger" as const,
    size: "120 MB",
    duration: "—",
  },
];

interface AdminPageProps {
  onNav: (view: string) => void;
  userRole: UserRole;
}

export default function AdminPage({ onNav, userRole }: AdminPageProps) {
  const [maxUploads, setMaxUploads] = useState("5");
  const [timeWindow, setTimeWindow] = useState("10");
  const [saved, setSaved] = useState(false);
  const [logFilter, setLogFilter] = useState("Tất cả");

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const filteredLogs =
    logFilter === "Tất cả"
      ? LOG_ROWS
      : LOG_ROWS.filter((r) => r.status === logFilter);

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole={userRole} activeItem="config" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-[#DCE5DF] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-[17px] font-bold text-[#24312B] tracking-tight leading-tight">
                Cấu hình hệ thống
              </h1>
              <p className="text-[12px] text-[#69766F]">
                AI Presentation Coach · Bảng cấu hình giới hạn tốc độ và giám sát tài nguyên máy chủ
              </p>
            </div>
            <Badge variant="success" withDot>
              Hệ thống ổn định
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-[12px] text-[#69766F]">
            <span className="font-mono hidden sm:inline">Cập nhật: 14:32:01</span>
            <Button variant="secondary" size="sm">
              Làm mới
            </Button>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* ── TOP ROW: Health Cards ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Worker Queue */}
            <Card className="lg:col-span-2 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F1EB] border border-[#D4E5D9] flex items-center justify-center text-[#276749]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect
                        x="1"
                        y="4"
                        width="14"
                        height="3"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                      <rect
                        x="1"
                        y="9"
                        width="14"
                        height="3"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                      <circle cx="3" cy="5.5" r="0.8" fill="currentColor" />
                      <circle cx="3" cy="10.5" r="0.8" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#24312B]">
                      Hàng đợi AI Worker
                    </p>
                    <p className="text-[11.5px] text-[#69766F]">Redis · Trực tiếp</p>
                  </div>
                </div>

                <Badge variant="success" withDot>
                  Đang hoạt động
                </Badge>
              </div>

              {/* Standard Stat Trio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "Tác vụ chờ", value: 12, spark: [3, 5, 8, 12, 10, 12] },
                  { label: "Worker đang chạy", value: 4, spark: [4, 4, 3, 4, 4, 4] },
                  { label: "Tác vụ lỗi", value: 0, spark: [1, 0, 1, 0, 0, 0] },
                ].map(({ label, value, spark }) => (
                  <div
                    key={label}
                    className="bg-[#F5F7F6]/60 border border-[#DCE5DF] rounded-xl p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[12px] font-medium text-[#69766F] leading-tight">
                          {label}
                        </p>
                        <p className="text-[22px] font-bold text-[#24312B] leading-none mt-1.5">
                          {value}
                        </p>
                      </div>
                      <Donut pct={value === 0 ? 0 : value === 4 ? 40 : 60} />
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#DCE5DF]/60">
                      <Sparkline data={spark} color="#276749" />
                      <span className="text-[10px] text-[#69766F] font-mono">24h</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Queue Utilization Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[12px] font-medium text-[#69766F]">
                  <span>Mức sử dụng hàng đợi</span>
                  <span className="font-semibold text-[#24312B]">
                    12 / 50 tối đa (24%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#DCE5DF] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#276749] transition-all"
                    style={{ width: "24%" }}
                  />
                </div>
              </div>
            </Card>

            {/* Card 2: Server Utilization */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F5F7F6] border border-[#DCE5DF] flex items-center justify-center text-[#69766F]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="1"
                      y="1"
                      width="14"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M4 8h3M9 5l3 3-3 3"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#24312B]">
                    Tài nguyên máy chủ
                  </p>
                  <p className="text-[11.5px] text-[#69766F]">
                    Ubuntu 22.04 · 16 nhân
                  </p>
                </div>
              </div>

              {/* Utilization Bars */}
              <div className="space-y-3 pt-1">
                <UtilBar label="Lưu trữ" pct={65} />
                <UtilBar label="Bộ nhớ (RAM)" pct={40} />
                <UtilBar label="Tải CPU" pct={28} />
                <UtilBar label="Mạng I/O" pct={81} />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#DCE5DF]">
                {[
                  { label: "Uptime", value: "99.97%" },
                  { label: "Khu vực", value: "ap-se-1" },
                  { label: "Node.js", value: "v20.11" },
                  { label: "GPU", value: "Không" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10.5px] text-[#69766F] font-medium">
                      {label}
                    </p>
                    <p className="text-[12px] font-semibold text-[#24312B] font-mono">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── MIDDLE: Rate Limit Config ──────────── */}
          <Card className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#E8F1EB] border border-[#D4E5D9] flex items-center justify-center text-[#276749] flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M9 2l1.5 4.5H15l-3.75 2.75 1.5 4.5L9 11 5.25 13.75l1.5-4.5L3 6.5h4.5L9 2z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[14px] font-semibold text-[#24312B]">
                    Cấu hình giới hạn tốc độ Nginx
                  </h2>
                  <p className="text-[12px] text-[#69766F] mt-0.5">
                    Bảo vệ máy chủ khỏi spam và tràn bộ nhớ xử lý video.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {saved && <Badge variant="success">✓ Đã lưu cấu hình</Badge>}
                <Button variant="primary" size="sm" onClick={handleSave}>
                  Lưu cấu hình
                </Button>
              </div>
            </div>

            {/* Config Form Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <ConfigInput
                label="Tải lên tối đa / IP"
                value={maxUploads}
                onChange={setMaxUploads}
                suffix="lần"
                helper="Số file video tối đa một IP có thể tải lên."
              />
              <ConfigInput
                label="Cửa sổ thời gian"
                value={timeWindow}
                onChange={setTimeWindow}
                suffix="phút"
                helper="Thời gian trước khi bộ đếm reset cho một IP."
              />
              <ConfigInput
                label="Dung lượng tối đa"
                value="200"
                onChange={() => {}}
                suffix="MB"
                helper="Giới hạn dung lượng tối đa cho mỗi file video."
              />
            </div>

            <div className="flex items-start gap-2.5 bg-[#F5F7F6] border border-[#DCE5DF] rounded-xl p-3.5 text-[12px] text-[#69766F]">
              <span className="font-semibold text-[#24312B]">Lưu ý:</span>
              <span>
                Thay đổi sẽ tự động nạp lại Nginx và có hiệu lực ngay lập tức. Hãy
                thông báo trước khi áp dụng trong khung giờ cao điểm.
              </span>
            </div>
          </Card>

          {/* ── BOTTOM: Activity Logs ──────────────── */}
          <Card className="overflow-hidden p-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-6 py-4 border-b border-[#DCE5DF] gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-[14px] font-semibold text-[#24312B]">
                  Nhật ký hoạt động tóm tắt
                </h2>
                <Badge variant="neutral">{LOG_ROWS.length} bản ghi</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNav("logs")}
                  className="text-[#276749] text-[12px] hidden sm:inline-flex"
                >
                  Xem toàn bộ nhật ký máy chủ →
                </Button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {["Tất cả", "Thành công", "Đang xử lý", "Thất bại"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLogFilter(f)}
                    className={`text-[12px] font-medium px-3 py-1 rounded-lg border transition-all ${
                      logFilter === f
                        ? "bg-[#276749] text-white border-[#276749]"
                        : "bg-white text-[#69766F] border-[#DCE5DF] hover:bg-[#F5F7F6]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="bg-[#F5F7F6] border-b border-[#DCE5DF] text-[#69766F] uppercase tracking-wider font-semibold text-[11px]">
                    <th className="px-6 py-3">Thời gian</th>
                    <th className="px-6 py-3">User ID</th>
                    <th className="px-6 py-3">Hành động</th>
                    <th className="px-6 py-3">Dung lượng</th>
                    <th className="px-6 py-3">Thời lượng</th>
                    <th className="px-6 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5DF]">
                  {filteredLogs.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#F5F7F6]/50 transition-colors"
                    >
                      <td className="px-6 py-3 font-mono text-[#69766F]">
                        {row.ts}
                      </td>
                      <td className="px-6 py-3 font-mono text-[#24312B]">
                        {row.user}
                      </td>
                      <td className="px-6 py-3 font-medium text-[#24312B]">
                        {row.action}
                      </td>
                      <td className="px-6 py-3 font-mono text-[#69766F]">
                        {row.size}
                      </td>
                      <td className="px-6 py-3 font-mono text-[#69766F]">
                        {row.duration}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`font-medium ${
                            row.variant === "danger"
                              ? "text-[#C24141]"
                              : "text-[#276749]"
                          }`}
                        >
                          {row.status}
                        </span>
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
