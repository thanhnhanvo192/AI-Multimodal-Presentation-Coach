import { useState } from "react";
import Sidebar, { UserRole } from "./Sidebar";
import { getStoredSessions } from "./mocks/mockHistory";
import { Button, Card, Badge } from "./components/common";

function MiniBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 bg-[#DCE5DF] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-[#276749]"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

interface HistoryPageProps {
  onNav: (view: string) => void;
  onViewReport: (id: string | number) => void;
  userRole: UserRole;
}

export default function HistoryPage({
  onNav,
  onViewReport,
  userRole,
}: HistoryPageProps) {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const sessions = getStoredSessions();

  const filters = [
    "Tất cả",
    "Bảo vệ đề án",
    "Phỏng vấn việc làm",
    "Thuyết trình lớp học",
    "Hội thảo",
    "Luyện tập tự do",
  ];

  const filtered =
    activeFilter === "Tất cả"
      ? sessions
      : sessions.filter((s) => s.context === activeFilter);

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole={userRole} activeItem="history" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-[#DCE5DF] px-6 sm:px-8 py-5 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[18px] font-bold text-[#24312B] tracking-tight leading-tight">
                  Lịch sử luyện tập
                </h1>
                <Badge variant="neutral">Tổng số: {sessions.length} phiên</Badge>
              </div>
              <p className="text-[12px] text-[#69766F] mt-0.5">
                Rà soát và truy cập báo cáo đánh giá chi tiết theo từng phiên thuyết trình
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNav("studio")}
              leftIcon={<span className="text-base font-bold leading-none">+</span>}
            >
              Phiên mới
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* ── Session List & Filters ─────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-[14px] font-semibold text-[#24312B]">
                Danh sách các phiên luyện tập
              </h2>
              <span className="text-[12px] text-[#69766F]">
                Đang hiển thị {filtered.length}/{sessions.length} phiên
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                    activeFilter === f
                      ? "bg-[#276749] text-white border-[#276749]"
                      : "bg-white text-[#69766F] border-[#DCE5DF] hover:bg-[#F5F7F6] hover:text-[#24312B]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Empty State if no sessions match filter */}
            {filtered.length === 0 ? (
              <Card className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E8F1EB] text-[#276749] flex items-center justify-center mx-auto text-xl">
                  📁
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-semibold text-[#24312B]">
                    Chưa có phiên luyện tập nào trong mục này
                  </p>
                  <p className="text-[12px] text-[#69766F] max-w-sm mx-auto">
                    Bạn có thể bắt đầu phiên luyện tập mới ngay bây giờ để nhận phân tích chi tiết từ AI Coach.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNav("studio")}
                  className="mt-2"
                >
                  Bắt đầu phiên luyện tập
                </Button>
              </Card>
            ) : (
              /* Session Rows */
              <div className="space-y-3">
                {filtered.map((s) => {
                  const expanded = expandedId === s.id;
                  return (
                    <Card
                      key={s.id}
                      className="overflow-hidden transition-all p-0"
                    >
                      {/* Main Row */}
                      <div
                        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 cursor-pointer hover:bg-[#F5F7F6]/50 transition-colors"
                        onClick={() => setExpandedId(expanded ? null : s.id)}
                      >
                        {/* Score Badge */}
                        <div className="w-10 h-10 rounded-xl bg-[#E8F1EB] border border-[#D4E5D9] flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-[14px] font-bold text-[#276749] leading-none">
                            {s.score}
                          </span>
                        </div>

                        {/* Title + Context */}
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

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewReport(s.id);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                          <button
                            type="button"
                            aria-label="Mở rộng chi tiết phiên"
                            className="p-1 rounded-md text-[#69766F] hover:text-[#24312B]"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              className={`transition-transform duration-200 ${
                                expanded ? "rotate-180" : ""
                              }`}
                            >
                              <path
                                d="M3 5l4 4 4-4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Detail Panel */}
                      {expanded && (
                        <div className="border-t border-[#DCE5DF] px-4 sm:px-5 py-4 bg-[#F5F7F6]/40 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              {
                                label: "Giao tiếp mắt",
                                value: s.eyeContact,
                                unit: "%",
                                bar: true,
                              },
                              {
                                label: "Tốc độ nói",
                                value: s.wpm,
                                unit: " WPM",
                                bar: false,
                              },
                              {
                                label: "Từ đệm phát hiện",
                                value: s.fillerWords,
                                unit: " từ",
                                bar: false,
                              },
                            ].map(({ label, value, unit, bar }) => (
                              <div
                                key={label}
                                className="bg-white rounded-xl border border-[#DCE5DF] p-3 space-y-1"
                              >
                                <p className="text-[11.5px] text-[#69766F] font-medium">
                                  {label}
                                </p>
                                <p className="text-[16px] font-bold text-[#24312B] leading-none">
                                  {value}
                                  <span className="text-[11.5px] font-medium text-[#69766F] ml-0.5">
                                    {unit}
                                  </span>
                                </p>
                                {bar && <MiniBar value={value as number} />}
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end pt-1">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onViewReport(s.id)}
                            >
                              Mở báo cáo đầy đủ →
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
