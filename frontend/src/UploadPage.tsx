import { useState, useRef, useCallback, useEffect } from "react";
import Sidebar, { UserRole } from "./Sidebar";
import { Button, Card } from "./components/common";
import { presentationService, PresentationScenario } from "./services";

type UploadState = "idle" | "selected" | "uploading" | "done";

interface FileInfo {
  name: string;
  size: string;
  duration?: string;
}

const UPLOAD_TIPS = [
  "Quay trong không gian đủ sáng, hướng mặt vào camera để phân tích giao tiếp mắt tốt nhất.",
  "Dùng phòng yên tĩnh để cải thiện độ chính xác khi phân tích âm lượng và từ đệm.",
  "Nói với tốc độ tự nhiên — AI sẽ đưa ra khuyến nghị nếu tốc độ vượt quá 160 WPM.",
  "Nền phía sau đơn giản giúp MediaPipe theo dõi cử chỉ ngôn ngữ cơ thể chính xác hơn.",
];

function toScenario(ctx: string): PresentationScenario {
  if (ctx.includes("Phỏng vấn")) return "INTERVIEW";
  if (ctx.includes("Hội thảo") || ctx.includes("Thuyết phục") || ctx.includes("Pitching")) return "PITCHING";
  return "ACADEMIC";
}

interface UploadPageProps {
  onNav: (view: string) => void;
  onAnalyze: (id?: number | string) => void;
  userRole: UserRole;
}

export default function UploadPage({ onNav, onAnalyze, userRole }: UploadPageProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [dragging, setDragging] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [file, setFile] = useState<FileInfo>({ name: "", size: "" });
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [context, setContext] = useState("Bảo vệ đề án");
  const inputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Dọn dẹp preview object URL khi unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const selectFile = (f: File) => {
    if (f.size > 100 * 1024 * 1024) {
      setErrorMessage("Dung lượng file vượt quá giới hạn cho phép (tối đa 100MB). Vui lòng chọn hoặc nén video nhỏ hơn.");
      return;
    }
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(f);
    setRawFile(f);
    setPreviewUrl(objectUrl);
    setFile({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
    });
    setState("selected");
    setErrorMessage(null);
  };

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
      selectFile(f);
    }
  }, []);

  /* Upload handler calling backend API */
  async function handleSend() {
    if (!rawFile) {
      setErrorMessage("Vui lòng chọn hoặc kéo thả tệp video từ máy tính của bạn trước khi gửi.");
      return;
    }

    setState("uploading");
    setUploadPct(0);
    setErrorMessage(null);

    const scenario = toScenario(context);
    const title = file.name ? file.name.replace(/\.[^/.]+$/, "") : "Bài thuyết trình";

    try {
      const res = await presentationService.uploadVideo(
        rawFile,
        title,
        scenario,
        (pct) => setUploadPct(pct)
      );
      setState("done");
      setTimeout(() => onAnalyze(res.id), 600);
    } catch (err: any) {
      console.warn("[UploadPage] Lỗi tải lên video:", err);
      setState("selected");
      setErrorMessage(err.message || "Không thể tải lên file video này. Vui lòng thử lại.");
    }
  }

  function handleRemove() {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setRawFile(null);
    setPreviewUrl(null);
    setFile({ name: "", size: "" });
    setState("idle");
    setUploadPct(0);
    setErrorMessage(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
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
          </div>

          {/* Clean Step Indicator */}
          <div className="hidden sm:flex items-center gap-2.5">
            {[
              { n: 1, label: "Tải lên & Xem lại", done: state !== "idle" },
              { n: 2, label: "Phân tích AI", done: isDone },
              { n: 3, label: "Báo cáo chi tiết", done: false },
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
                  <option>Thuyết phục khách hàng (Pitching)</option>
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
              accept=".mp4,.webm,.avi,.mov"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  selectFile(f);
                }
              }}
            />

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px] flex items-center gap-2.5 animate-fade-in">
                <span>⚠️</span>
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Drop Zone Area (khi chưa chọn file) */}
            {state === "idle" && (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                  dragging
                    ? "border-[#276749] bg-[#E8F1EB]/50 scale-[1.01]"
                    : "border-[#DCE5DF] bg-white hover:bg-[#F5F7F6]/80 hover:border-[#276749] cursor-pointer shadow-sm"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#E8F1EB] border border-[#D4E5D9] flex items-center justify-center text-[#276749] shadow-sm">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[15px] font-bold text-[#24312B]">
                      {dragging ? "Thả tệp video vào đây" : "Kéo thả video vào đây, hoặc bấm để duyệt tệp"}
                    </p>
                    <p className="text-[12.5px] text-[#69766F]">
                      Hỗ trợ định dạng MP4, WebM, AVI, MOV · Dung lượng tối đa 100 MB
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        inputRef.current?.click();
                      }}
                      className="px-5 py-2.5 rounded-full bg-[#276749] text-white text-[13px] font-semibold hover:bg-[#1f533a] transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Chọn tệp video từ máy tính
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Preview & File Details Player (Khi đã chọn video) */}
            {(state === "selected" || isUploading || isDone) && (
              <Card className="p-4 sm:p-5 space-y-4 shadow-sm border border-[#DCE5DF]">
                <div className="flex items-center justify-between border-b border-[#DCE5DF] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#276749] animate-pulse" />
                    <span className="text-[13px] font-bold text-[#24312B] uppercase tracking-wider">
                      Xem lại video vừa chọn
                    </span>
                  </div>

                  {state === "selected" && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="text-[12px] font-medium text-[#C24141] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Chọn tệp khác</span>
                    </button>
                  )}
                </div>

                {/* Khung trình chiếu xem lại video thật (16:9) */}
                {previewUrl && (
                  <div
                    className="rounded-xl overflow-hidden bg-black border border-[#DCE5DF] relative group shadow-inner"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <video
                      ref={previewVideoRef}
                      src={previewUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                      onLoadedMetadata={(e) => {
                        const d = e.currentTarget.duration;
                        if (d && !isNaN(d) && isFinite(d)) {
                          const m = Math.floor(d / 60);
                          const s = Math.floor(d % 60);
                          setFile((prev) => ({
                            ...prev,
                            duration: `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
                          }));
                        }
                      }}
                    />
                  </div>
                )}

                {/* File Meta Info */}
                <div className="flex items-center justify-between text-[12.5px] bg-[#F5F7F6] p-3 rounded-lg border border-[#DCE5DF]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-[#24312B] truncate font-mono">
                      {file.name}
                    </span>
                    <span className="text-[#69766F]">({file.size})</span>
                  </div>
                  {file.duration && (
                    <span className="text-[#276749] font-semibold font-mono flex-shrink-0 bg-white px-2 py-0.5 rounded border border-[#DCE5DF]">
                      Thời lượng: {file.duration}
                    </span>
                  )}
                </div>

                {/* Upload Progress Bar */}
                {(isUploading || isDone) && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[12px] font-medium">
                      <span className={isDone ? "text-[#276749] font-semibold" : "text-[#24312B]"}>
                        {isDone ? "Tải lên máy chủ thành công!" : `Đang tải video lên hệ thống... ${uploadPct}%`}
                      </span>
                      <span className="text-[#69766F] font-mono">{uploadPct}%</span>
                    </div>
                    <div className="h-2 bg-[#DCE5DF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#276749] rounded-full transition-all duration-200"
                        style={{ width: `${uploadPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {state === "selected" && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center text-[14px] font-semibold py-3"
                    onClick={handleSend}
                  >
                    Gửi để phân tích AI
                  </Button>
                )}

                {isDone && (
                  <div className="flex items-center justify-center gap-2.5 bg-[#E8F1EB] border border-[#D4E5D9] rounded-xl p-3.5 text-[13px] text-[#276749] font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#276749] animate-pulse" />
                    Đang chuyển hướng sang tiến trình phân tích AI đa phương thức...
                  </div>
                )}
              </Card>
            )}

            {/* Video Recording & Upload Tips Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {UPLOAD_TIPS.map((tip, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-[#DCE5DF] p-3.5 flex items-start gap-2.5 shadow-xs"
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
