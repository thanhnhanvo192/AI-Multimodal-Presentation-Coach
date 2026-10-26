import { useState, useRef, useCallback } from "react";
import Sidebar, { UserRole } from "./Sidebar";
import { Button, Card, Badge } from "./components/common";

type UploadState = "idle" | "selected" | "uploading" | "done";

interface FileInfo {
  name: string;
  size: string;
  duration?: string;
}

const MOCK_FILE: FileInfo = {
  name: "bai_thuyet_trinh_pbl6.mp4",
  size: "45 MB",
  duration: "04:32",
};

const UPLOAD_TIPS = [
  "Quay trong không gian đủ sáng, hướng mặt vào camera để phân tích giao tiếp mắt tốt nhất.",
  "Dùng phòng yên tĩnh để cải thiện độ chính xác khi phân tích âm lượng và từ đệm.",
  "Nói với tốc độ tự nhiên — AI sẽ đưa ra khuyến nghị nếu tốc độ vượt quá 160 WPM.",
  "Nền phía sau đơn giản giúp MediaPipe theo dõi cử chỉ ngôn ngữ cơ thể chính xác hơn.",
];

interface UploadPageProps {
  onNav: (view: string) => void;
  onAnalyze: () => void;
  userRole: UserRole;
}

export default function UploadPage({ onNav, onAnalyze, userRole }: UploadPageProps) {
  const [state, setState] = useState<UploadState>("selected");
  const [dragging, setDragging] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [file, setFile] = useState<FileInfo>(MOCK_FILE);
  const [context, setContext] = useState("Bảo vệ đề án");
  const inputRef = useRef<HTMLInputElement>(null);

  /* Drag handlers */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile({ name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB` });
      setState("selected");
    }
  }, []);

  /* Simulate upload */
  function handleSend() {
    setState("uploading");
    setUploadPct(0);
    let pct = 0;
    const id = setInterval(() => {
      pct += Math.floor(Math.random() * 8 + 4);
      if (pct >= 100) {
        pct = 100;
        clearInterval(id);
        setState("done");
        setTimeout(() => onAnalyze(), 800);
      }
      setUploadPct(pct);
    }, 180);
  }

  function handleRemove() {
    setState("idle");
    setUploadPct(0);
  }

  const isUploading = state === "uploading";
  const isDone = state === "done";

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole={userRole} activeItem="upload" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-[#DCE5DF] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-[17px] font-bold text-[#24312B] tracking-tight leading-tight">
              Tải lên video thuyết trình
            </h1>
            <p className="text-[12px] text-[#69766F]">
              Tải video đã quay để hệ thống AI phân tích đa phương thức
            </p>
          </div>

          {/* Clean Step Indicator */}
          <div className="hidden sm:flex items-center gap-2.5">
            {[
              { n: 1, label: "Tải lên", done: state !== "idle" },
              { n: 2, label: "Phân tích", done: isDone },
              { n: 3, label: "Báo cáo", done: false },
            ].map(({ n, label, done }, i) => (
              <div key={n} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                      done
                        ? "bg-[#276749] text-white"
                        : "bg-[#F5F7F6] text-[#69766F] border border-[#DCE5DF]"
                    }`}
                  >
                    {done ? "✓" : n}
                  </div>
                  <span
                    className={`text-[12px] font-medium ${
                      done ? "text-[#24312B]" : "text-[#69766F]"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && <div className="w-5 h-px bg-[#DCE5DF]" />}
              </div>
            ))}
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 flex items-start justify-center p-6 sm:p-8">
          <div className="w-full max-w-2xl space-y-4">
            {/* Context Selector Card */}
            <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#E8F1EB] border border-[#D4E5D9] flex items-center justify-center flex-shrink-0 text-[#276749]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <label className="block text-[11.5px] font-semibold text-[#69766F] uppercase tracking-wider mb-1">
                  Ngữ cảnh thuyết trình
                </label>
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full h-10 bg-[#F5F7F6] border border-[#DCE5DF] text-[#24312B] text-[13.5px] font-medium rounded-lg px-3 outline-none focus:border-[#276749] focus:ring-1 focus:ring-[#276749] transition-colors cursor-pointer"
                >
                  <option>Bảo vệ đề án</option>
                  <option>Phỏng vấn việc làm</option>
                  <option>Hội thảo</option>
                  <option>Thuyết trình lớp học</option>
                  <option>Thuyết phục khách hàng</option>
                </select>
              </div>

              <p className="text-[11.5px] text-[#69766F] max-w-[190px] leading-relaxed hidden sm:block">
                AI sẽ căn chỉnh bộ tiêu chí đánh giá phù hợp với bối cảnh này.
              </p>
            </Card>

            {/* Hidden File Input */}
            <input
              ref={inputRef}
              type="file"
              accept=".mp4,.webm"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile({
                    name: f.name,
                    size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
                  });
                  setState("selected");
                }
              }}
            />

            {/* Drop Zone Area */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => state === "idle" && inputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                dragging
                  ? "border-[#276749] bg-[#E8F1EB]/50"
                  : state !== "idle"
                  ? "border-[#DCE5DF] bg-white"
                  : "border-[#DCE5DF] bg-[#F5F7F6]/60 hover:bg-[#F5F7F6] hover:border-[#69766F] cursor-pointer"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E8F1EB] border border-[#D4E5D9] flex items-center justify-center text-[#276749]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="space-y-1">
                  <p className="text-[14px] font-semibold text-[#24312B]">
                    {dragging
                      ? "Thả tệp video vào đây"
                      : "Kéo thả video vào đây, hoặc "}
                    {!dragging && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          inputRef.current?.click();
                        }}
                        className="text-[#276749] font-semibold hover:underline"
                      >
                        chọn tệp từ máy
                      </button>
                    )}
                  </p>
                  <p className="text-[12px] text-[#69766F]">
                    Định dạng hỗ trợ: MP4, WebM · Tối đa 100 MB
                  </p>
                </div>
              </div>
            </div>

            {/* File Selected Card */}
            {(state === "selected" || isUploading || isDone) && (
              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#E8F1EB] text-[#276749] flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="2"
                        y="4"
                        width="15"
                        height="16"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M17 9.5l5-3v11l-5-3v-5z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#24312B] truncate font-mono">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-[12px] text-[#69766F] mt-0.5">
                      <span>{file.size}</span>
                      {file.duration && (
                        <>
                          <span>·</span>
                          <span>{file.duration}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {state === "selected" && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="p-1.5 rounded-lg text-[#69766F] hover:text-[#C24141] hover:bg-[#F5F7F6] transition-colors"
                      title="Gỡ bỏ tệp"
                      aria-label="Gỡ bỏ tệp"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Upload Progress Bar */}
                {(isUploading || isDone) && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[12px] font-medium">
                      <span
                        className={
                          isDone
                            ? "text-[#276749] font-semibold"
                            : "text-[#24312B]"
                        }
                      >
                        {isDone
                          ? "Tải lên hoàn tất!"
                          : `Đang tải lên... ${uploadPct}%`}
                      </span>
                      <span className="text-[#69766F] font-mono">{uploadPct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#DCE5DF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#276749] rounded-full transition-all duration-200"
                        style={{ width: `${uploadPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Action Button */}
            {state === "selected" && (
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                onClick={handleSend}
              >
                Gửi để phân tích
              </Button>
            )}

            {isDone && (
              <div className="flex items-center gap-2.5 bg-[#E8F1EB] border border-[#D4E5D9] rounded-xl p-3.5 text-[12.5px] text-[#276749] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#276749] animate-pulse" />
                Đang chuyển đến phân tích AI đa phương thức...
              </div>
            )}

            {/* Video Recording & Upload Tips Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {UPLOAD_TIPS.map((tip, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-[#DCE5DF] p-3.5 flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-md bg-[#E8F1EB] text-[#276749] flex items-center justify-center flex-shrink-0 text-[11px] font-bold mt-0.5">
                    ✓
                  </div>
                  <p className="text-[12px] text-[#69766F] leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
