import { useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import { Button, Card } from "./components/common";
import { DEMO_SERVER_LOGS } from "./mocks/mockLogs";
import { ServerLogItem, LogLevel } from "./types";

const PAGE_SIZE = 15;

/* ── Log Level Badge Helper ───────────────────────────────────────── */
function LogLevelBadge({ level }: { level: LogLevel }) {
  switch (level) {
    case "ERROR":
      return (
        <span className="font-semibold text-[11.5px] text-[#C24141]">
          ERROR
        </span>
      );
    case "WARNING":
      return (
        <span className="font-semibold text-[11.5px] text-[#B7791F]">
          WARN
        </span>
      );
    case "INFO":
      return (
        <span className="font-semibold text-[11.5px] text-[#276749]">
          INFO
        </span>
      );
    case "DEBUG":
      return (
        <span className="font-semibold text-[11.5px] text-[#69766F]">
          DEBUG
        </span>
      );
    default:
      return (
        <span className="font-semibold text-[11.5px] text-[#69766F]">
          {level}
        </span>
      );
  }
}

/* ── Log Detail Modal ─────────────────────────────────────────────── */
function LogDetailModal({
  log,
  onClose,
}: {
  log: ServerLogItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#24312B]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <Card className="relative bg-white w-full max-w-2xl max-h-[85vh] flex flex-col p-0 z-10 border-[#DCE5DF] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#DCE5DF] flex items-center justify-between bg-[#F5F7F6]/50">
          <div className="flex items-center gap-2.5">
            <LogLevelBadge level={log.level} />
            <span className="font-mono text-[12px] text-[#69766F]">
              ID: {log.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết"
            className="p-1 rounded-lg text-[#69766F] hover:text-[#24312B] hover:bg-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-[13px]">
          <div>
            <label className="block text-[11px] font-semibold text-[#69766F] uppercase tracking-wider mb-1">
              Nội dung thông điệp (Message)
            </label>
            <p className="font-semibold text-[#24312B] bg-[#F5F7F6] p-3 rounded-lg border border-[#DCE5DF]">
              {log.message}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-2.5 rounded-lg border border-[#DCE5DF] bg-white">
              <span className="text-[10.5px] font-medium text-[#69766F] block">
                Dịch vụ (Service)
              </span>
              <span className="font-semibold text-[#24312B] text-[12.5px]">
                {log.service}
              </span>
            </div>
            <div className="p-2.5 rounded-lg border border-[#DCE5DF] bg-white">
              <span className="text-[10.5px] font-medium text-[#69766F] block">
                Thời gian (Timestamp)
              </span>
              <span className="font-mono text-[11.5px] text-[#24312B]">
                {new Date(log.timestamp).toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="p-2.5 rounded-lg border border-[#DCE5DF] bg-white">
              <span className="text-[10.5px] font-medium text-[#69766F] block">
                Mã trạng thái HTTP
              </span>
              <span className="font-mono font-semibold text-[#24312B] text-[12.5px]">
                {log.statusCode || "—"}
              </span>
            </div>

            {log.requestId && (
              <div className="p-2.5 rounded-lg border border-[#DCE5DF] bg-white">
                <span className="text-[10.5px] font-medium text-[#69766F] block">
                  Request ID
                </span>
                <span className="font-mono text-[11.5px] text-[#276749]">
                  {log.requestId}
                </span>
              </div>
            )}
            {log.endpoint && (
              <div className="p-2.5 rounded-lg border border-[#DCE5DF] bg-white">
                <span className="text-[10.5px] font-medium text-[#69766F] block">
                  Endpoint API
                </span>
                <span className="font-mono text-[11.5px] text-[#24312B]">
                  {log.endpoint}
                </span>
              </div>
            )}
            {log.duration && (
              <div className="p-2.5 rounded-lg border border-[#DCE5DF] bg-white">
                <span className="text-[10.5px] font-medium text-[#69766F] block">
                  Thời gian xử lý
                </span>
                <span className="font-mono text-[11.5px] text-[#24312B]">
                  {log.duration}
                </span>
              </div>
            )}
            {log.ip && (
              <div className="p-2.5 rounded-lg border border-[#DCE5DF] bg-white">
                <span className="text-[10.5px] font-medium text-[#69766F] block">
                  Địa chỉ IP nguồn
                </span>
                <span className="font-mono text-[11.5px] text-[#69766F]">
                  {log.ip}
                </span>
              </div>
            )}
            {log.userId && (
              <div className="p-2.5 rounded-lg border border-[#DCE5DF] bg-white">
                <span className="text-[10.5px] font-medium text-[#69766F] block">
                  User ID liên quan
                </span>
                <span className="font-mono text-[11.5px] text-[#24312B]">
                  {log.userId}
                </span>
              </div>
            )}
          </div>

          {/* Details if present */}
          {log.details && (
            <div>
              <label className="block text-[11px] font-semibold text-[#69766F] uppercase tracking-wider mb-1">
                Chi tiết bổ sung (Context / Parameters)
              </label>
              <div className="font-mono text-[11.5px] text-[#24312B] bg-[#F5F7F6] p-3 rounded-lg border border-[#DCE5DF] leading-relaxed whitespace-pre-wrap">
                {log.details}
              </div>
            </div>
          )}

          {/* Stack Trace if present */}
          {log.stackTrace && (
            <div>
              <label className="block text-[11px] font-semibold text-[#C24141] uppercase tracking-wider mb-1">
                Lược vết lỗi (Stack Trace)
              </label>
              <pre className="font-mono text-[11px] text-[#FEE2E2] bg-[#1A231F] p-3.5 rounded-lg border border-[#C24141]/30 leading-relaxed overflow-x-auto">
                {log.stackTrace}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#DCE5DF] flex justify-end bg-white">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ── Main Admin Logs Component ────────────────────────────────────── */
interface AdminLogsPageProps {
  onNav: (view: string) => void;
}

export default function AdminLogsPage({ onNav }: AdminLogsPageProps) {
  const [logs, setLogs] = useState<ServerLogItem[]>(DEMO_SERVER_LOGS);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | "ALL">("ALL");
  const [selectedService, setSelectedService] = useState<string>("ALL");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<ServerLogItem | null>(null);

  // Danh sách các service có trong log
  const services = useMemo(() => {
    const list = Array.from(new Set(DEMO_SERVER_LOGS.map((l) => l.service)));
    return ["ALL", ...list];
  }, []);

  // Tính số lượng bản ghi theo level
  const countsByLevel = useMemo(() => {
    return {
      ALL: logs.length,
      INFO: logs.filter((l) => l.level === "INFO").length,
      WARNING: logs.filter((l) => l.level === "WARNING").length,
      ERROR: logs.filter((l) => l.level === "ERROR").length,
      DEBUG: logs.filter((l) => l.level === "DEBUG").length,
    };
  }, [logs]);

  // Bộ lọc dữ liệu đa chiều
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter((l) => {
      // 1. Lọc theo Level
      if (selectedLevel !== "ALL" && l.level !== selectedLevel) return false;

      // 2. Lọc theo Service
      if (selectedService !== "ALL" && l.service !== selectedService) return false;

      // 3. Lọc theo thời gian
      if (selectedTimeRange !== "ALL") {
        const logTime = new Date(l.timestamp).getTime();
        const diffHours = (now - logTime) / (3600 * 1000);
        if (selectedTimeRange === "1h" && diffHours > 1) return false;
        if (selectedTimeRange === "24h" && diffHours > 24) return false;
        if (selectedTimeRange === "7d" && diffHours > 24 * 7) return false;
      }

      // 4. Tìm kiếm từ khóa (Message, Request ID, Endpoint)
      if (search.trim()) {
        const q = search.toLowerCase();
        const inMessage = l.message.toLowerCase().includes(q);
        const inReq = l.requestId ? l.requestId.toLowerCase().includes(q) : false;
        const inEndpoint = l.endpoint ? l.endpoint.toLowerCase().includes(q) : false;
        if (!inMessage && !inReq && !inEndpoint) return false;
      }

      return true;
    });
  }, [logs, selectedLevel, selectedService, selectedTimeRange, search]);

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  // Reset bộ lọc
  function handleResetFilters() {
    setSearch("");
    setSelectedLevel("ALL");
    setSelectedService("ALL");
    setSelectedTimeRange("ALL");
    setPage(1);
  }

  // Xuất file CSV từ dữ liệu đã lọc
  function handleExportCSV() {
    const headers = ["Timestamp", "Level", "Service", "StatusCode", "Message", "Endpoint", "Duration"];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.level}"`,
      `"${l.service}"`,
      `"${l.statusCode || ""}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      `"${l.endpoint || ""}"`,
      `"${l.duration || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `server_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const isFilterActive =
    search !== "" ||
    selectedLevel !== "ALL" ||
    selectedService !== "ALL" ||
    selectedTimeRange !== "ALL";

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole="admin" activeItem="logs" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-[#DCE5DF] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-[17px] font-bold text-[#24312B] tracking-tight leading-tight">
              Nhật ký máy chủ (Server Logs)
            </h1>
            <p className="text-[12px] text-[#69766F]">
              Giám sát sự kiện, kiểm tra lỗi runtime và theo dõi các dịch vụ AI Coach
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setLogs([...DEMO_SERVER_LOGS]);
                setPage(1);
              }}
              title="Làm mới danh sách log demo"
            >
              Làm mới
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3v12M7 10l5 5 5-5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              Xuất CSV
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-4">
          {/* ── Filters & Controls Card ───────────────────── */}
          <Card className="p-4 sm:p-5 space-y-4">
            {/* Row 1: Search & Dropdowns */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#69766F]"
                  width="14"
                  height="14"
                  viewBox="0 0 15 15"
                  fill="none"
                >
                  <circle
                    cx="6.5"
                    cy="6.5"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M10.5 10.5l3 3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm theo thông điệp, Request ID hoặc Endpoint..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 h-9 text-[12.5px] rounded-lg border border-[#DCE5DF] bg-[#F5F7F6] focus:bg-white focus:border-[#276749] focus:ring-1 focus:ring-[#276749] outline-none transition-all placeholder:text-[#69766F]/60"
                />
              </div>

              {/* Service Select */}
              <div className="w-full sm:w-52">
                <select
                  value={selectedService}
                  onChange={(e) => {
                    setSelectedService(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 text-[12.5px] rounded-lg border border-[#DCE5DF] bg-[#F5F7F6] px-3 font-medium text-[#24312B] focus:border-[#276749] focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value="ALL">Tất cả dịch vụ</option>
                  {services
                    .filter((s) => s !== "ALL")
                    .map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
              </div>

              {/* Time Range Select */}
              <div className="w-full sm:w-44">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => {
                    setSelectedTimeRange(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 text-[12.5px] rounded-lg border border-[#DCE5DF] bg-[#F5F7F6] px-3 font-medium text-[#24312B] focus:border-[#276749] focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value="ALL">Mọi thời gian</option>
                  <option value="1h">1 giờ qua</option>
                  <option value="24h">24 giờ qua</option>
                  <option value="7d">7 ngày qua</option>
                </select>
              </div>

              {/* Reset Filter Button */}
              {isFilterActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-[#C24141] font-semibold hover:bg-[#FEE2E2]"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            {/* Row 2: Level Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#DCE5DF]">
              <span className="text-[11.5px] font-semibold text-[#69766F] uppercase tracking-wider mr-1">
                Mức độ (Level):
              </span>
              {(["ALL", "INFO", "WARNING", "ERROR", "DEBUG"] as const).map(
                (lvl) => {
                  const active = selectedLevel === lvl;
                  const count = countsByLevel[lvl];
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setSelectedLevel(lvl);
                        setPage(1);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium border transition-all ${
                        active
                          ? "bg-[#276749] text-white border-[#276749] font-semibold"
                          : "bg-white text-[#69766F] border-[#DCE5DF] hover:bg-[#F5F7F6] hover:text-[#24312B]"
                      }`}
                    >
                      <span>{lvl === "ALL" ? "Tất cả" : lvl}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          active
                            ? "bg-white/25 text-white"
                            : "bg-[#F5F7F6] text-[#69766F]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </Card>

          {/* ── Table Card ─────────────────────────────────── */}
          <Card className="overflow-hidden p-0">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#F5F7F6] border border-[#DCE5DF] text-[#69766F] flex items-center justify-center mx-auto text-xl">
                  🔍
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-semibold text-[#24312B]">
                    Không tìm thấy bản ghi log nào phù hợp
                  </p>
                  <p className="text-[12px] text-[#69766F] max-w-sm mx-auto">
                    Không có sự kiện nào khớp với từ khóa tìm kiếm hoặc các tiêu chí lọc đang chọn.
                  </p>
                </div>
                {isFilterActive && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleResetFilters}
                    className="mt-2"
                  >
                    Đặt lại bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="bg-[#F5F7F6] border-b border-[#DCE5DF] text-[#69766F] uppercase tracking-wider font-semibold text-[11px]">
                      <th className="px-5 py-3">Thời gian</th>
                      <th className="px-4 py-3">Mức độ</th>
                      <th className="px-4 py-3">Dịch vụ</th>
                      <th className="px-3 py-3">Mã HTTP</th>
                      <th className="px-5 py-3">Nội dung sự kiện (Message)</th>
                      <th className="px-4 py-3 text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5DF]">
                    {paginatedLogs.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-[#F5F7F6]/60 transition-colors cursor-pointer"
                      >
                        {/* Timestamp */}
                        <td className="px-5 py-3 font-mono text-[11.5px] text-[#69766F] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>

                        {/* Level */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <LogLevelBadge level={log.level} />
                        </td>

                        {/* Service */}
                        <td className="px-4 py-3 font-medium text-[#24312B] whitespace-nowrap">
                          {log.service}
                        </td>

                        {/* HTTP Status Code */}
                        <td className="px-3 py-3 font-mono text-[12px]">
                          {log.statusCode ? (
                            <span
                              className={`font-semibold ${
                                log.statusCode >= 500
                                  ? "text-[#C24141]"
                                  : log.statusCode >= 400
                                  ? "text-[#B7791F]"
                                  : "text-[#276749]"
                              }`}
                            >
                              {log.statusCode}
                            </span>
                          ) : (
                            <span className="text-[#69766F]/60">—</span>
                          )}
                        </td>

                        {/* Message */}
                        <td className="px-5 py-3 max-w-md">
                          <p className="text-[#24312B] truncate font-medium">
                            {log.message}
                          </p>
                          {log.endpoint && (
                            <span className="font-mono text-[11px] text-[#69766F] block truncate mt-0.5">
                              {log.endpoint}
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#276749]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {filteredLogs.length > 0 && (
              <div className="px-5 sm:px-6 py-3.5 border-t border-[#DCE5DF] bg-[#F5F7F6]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[12px] text-[#69766F]">
                  Hiển thị{" "}
                  <b>
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filteredLogs.length)}
                  </b>{" "}
                  trên tổng <b>{filteredLogs.length}</b> bản ghi
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ← Trước
                  </Button>
                  <span className="text-[12px] font-semibold text-[#24312B] px-2">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Sau →
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Modal View Detail if a log is selected */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
