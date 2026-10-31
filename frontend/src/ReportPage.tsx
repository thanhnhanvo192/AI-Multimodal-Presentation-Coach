import { useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar, { UserRole } from "./Sidebar";
import { Button, Card, Badge } from "./components/common";
import { getReportBySessionId, DetailedSessionReport } from "./mocks/mockHistory";

/* ── Dynamic Radar Chart ─────────────────────────────────────── */
function RadarChart({
  metrics,
  rubricScores,
}: {
  metrics: DetailedSessionReport["radarMetrics"];
  rubricScores?: DetailedSessionReport["rubricScores"];
}) {
  const cx = 110,
    cy = 110,
    r = 74;

  const isAIStandard = Boolean(rubricScores || metrics.headPosturePercent !== undefined);

  const axes = isAIStandard
    ? [
        {
          label: "Tốc độ nói",
          angle: -90,
          value: rubricScores
            ? rubricScores.speech_rate_score / 100
            : metrics.speechRatePercent ?? metrics.wpmPercent,
        },
        {
          label: "Ánh mắt",
          angle: -18,
          value: rubricScores
            ? rubricScores.eye_contact_score / 100
            : metrics.eyeContactPercent,
        },
        {
          label: "Biểu cảm",
          angle: 54,
          value: rubricScores
            ? rubricScores.facial_expression_score / 100
            : metrics.facialExpressionPercent ?? metrics.emotionPercent,
        },
        {
          label: "Tư thế đầu",
          angle: 126,
          value: rubricScores
            ? rubricScores.head_posture_score / 100
            : metrics.headPosturePercent ?? metrics.bodyLanguagePercent,
        },
        {
          label: "Từ đệm",
          angle: 198,
          value: rubricScores
            ? rubricScores.filler_control_score / 100
            : metrics.fillerControlPercent ?? metrics.volumePercent,
        },
      ]
    : [
        { label: "Tốc độ (WPM)", angle: -90, value: metrics.wpmPercent },
        { label: "Giao tiếp mắt", angle: -18, value: metrics.eyeContactPercent },
        { label: "Cảm xúc", angle: 54, value: metrics.emotionPercent },
        { label: "Ngôn ngữ cơ thể", angle: 126, value: metrics.bodyLanguagePercent },
        { label: "Âm lượng giọng", angle: 198, value: metrics.volumePercent },
      ];

  const toXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  });

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = axes.map((a) => toXY(a.angle, r * a.value));
  const dataPath =
    dataPoints
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`
      )
      .join(" ") + " Z";

  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[210px]">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#276749" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#276749" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* Grid rings */}
      {rings.map((s) => {
        const pts = axes.map((a) => toXY(a.angle, r * s));
        const d =
          pts
            .map(
              (p, i) =>
                `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`
            )
            .join(" ") + " Z";
        return (
          <path
            key={s}
            d={d}
            fill="none"
            stroke="#DCE5DF"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis spokes */}
      {axes.map((a) => {
        const end = toXY(a.angle, r);
        return (
          <line
            key={a.label}
            x1={cx}
            y1={cy}
            x2={end.x.toFixed(1)}
            y2={end.y.toFixed(1)}
            stroke="#DCE5DF"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <path
        d={dataPath}
        fill="url(#radarFill)"
        stroke="#276749"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3.5"
          fill="#276749"
          stroke="white"
          strokeWidth="1.5"
        />
      ))}

      {/* Labels */}
      {axes.map((a) => {
        const pos = toXY(a.angle, r + 15);
        return (
          <text
            key={a.label}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontWeight="500"
            fill="#69766F"
            fontFamily="Inter, sans-serif"
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}

/* ── Score ring (Deep Forest Green) ─────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const R = 44,
    sw = 6.5;
  const circ = 2 * Math.PI * (R - sw / 2);
  const dash = (score / 100) * circ;
  return (
    <svg
      width={R * 2}
      height={R * 2}
      viewBox={`0 0 ${R * 2} ${R * 2}`}
      className="-rotate-90"
    >
      <circle
        cx={R}
        cy={R}
        r={R - sw / 2}
        fill="none"
        stroke="#DCE5DF"
        strokeWidth={sw}
      />
      <circle
        cx={R}
        cy={R}
        r={R - sw / 2}
        fill="none"
        stroke="#276749"
        strokeWidth={sw}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Unified Metric Bar ─────────────────────────────────── */
function MetricBar({
  label,
  value,
  max = 100,
  unit = "%",
}: {
  label: string;
  value: number;
  max?: number;
  unit?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[12px]">
        <span className="font-medium text-[#69766F]">{label}</span>
        <span className="font-semibold text-[#24312B]">
          {value}
          {unit}
        </span>
      </div>
      <div className="h-1.5 bg-[#DCE5DF] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#276749] transition-all"
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}

/* ── Main Report Page ─────────────────────────────────────── */
interface ReportPageProps {
  onNav: (view: string) => void;
  userRole: UserRole;
}

export default function ReportPage({ onNav, userRole }: ReportPageProps) {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [hoverMarker, setHoverMarker] = useState<number | null>(null);
  const [playhead, setPlayhead] = useState(34);

  const report = sessionId ? getReportBySessionId(sessionId) : null;

  const durationSec = report?.durationSec || 200.02;
  const currentSec = (playhead / 100) * durationSec;
  const currentMin = Math.floor(currentSec / 60);
  const currentSecRemain = Math.floor(currentSec % 60);
  const currentTimeStr = `${String(currentMin).padStart(2, "0")}:${String(
    currentSecRemain
  ).padStart(2, "0")}`;

  /* Trạng thái khi không tìm thấy phiên hoặc ID không hợp lệ */
  if (!report) {
    return (
      <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
        <Sidebar userRole={userRole} activeItem="history" onNav={onNav} />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FEE2E2] text-[#C24141] flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <div className="space-y-1">
              <h2 className="text-[16px] font-bold text-[#24312B]">
                Không tìm thấy phiên luyện tập
              </h2>
              <p className="text-[12px] text-[#69766F] leading-relaxed">
                Phiên luyện tập với mã nhận diện "{sessionId || "chưa xác định"}" không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => onNav("history")}
                className="w-full justify-center"
              >
                Quay lại danh sách lịch sử
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole={userRole} activeItem="history" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-[#DCE5DF] flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNav("history")}
              className="p-1.5 rounded-lg text-[#69766F] hover:text-[#24312B] hover:bg-[#F5F7F6] transition-colors"
              title="Quay lại lịch sử"
              aria-label="Quay lại lịch sử"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15.5px] font-bold text-[#24312B] leading-tight">
                  {report.title}
                </h1>
                <Badge variant="primary">Báo cáo hoàn chỉnh</Badge>
              </div>
              <p className="text-[12px] text-[#69766F] mt-0.5">
                Ngày ghi: {report.date} · Thời lượng: {report.duration} · Ngữ cảnh: {report.context}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
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
            Xuất PDF
          </Button>
        </header>

        {/* Body Layout: 60 / 40 Split */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* ── LEFT: Video, Timeline & Transcript (60%) ───── */}
          <div className="flex-1 lg:flex-[6] min-w-0 flex flex-col overflow-y-auto p-5 space-y-4 border-r border-[#DCE5DF]">
            {/* Video Player Box */}
            <div
              className="rounded-xl overflow-hidden bg-[#1A231F] border border-[#DCE5DF] relative"
              style={{ aspectRatio: "16/9" }}
            >
              <img
                src="https://images.unsplash.com/photo-1758876020207-67890de8aa73?w=900&h=506&fit=crop&auto=format"
                alt="Recorded presentation session"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

              {/* Top Session Info Pill */}
              <div className="absolute top-3 left-3">
                <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-md border border-white/10">
                  Phiên #{report.sessionId} — Video đã lưu
                </span>
              </div>

              {/* Top-right Duration Pill */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11.5px] font-mono font-medium px-2.5 py-1 rounded-md border border-white/10">
                {report.duration}
              </div>

              {/* Bottom Playback Controls */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex flex-col gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={playhead}
                  onChange={(e) => setPlayhead(Number(e.target.value))}
                  className="w-full h-1 accent-[#276749] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[12px] text-white">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      className="w-7 h-7 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      aria-label="Phát video"
                    >
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M3 2l7 4-7 4V2z" fill="white" />
                      </svg>
                    </button>
                    <span className="font-mono text-white/90 text-[12px]">
                      {currentTimeStr} / {report.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11.5px] text-white/80">
                    <button
                      type="button"
                      className="hover:text-white px-1.5 py-0.5 rounded"
                    >
                      0.5×
                    </button>
                    <button
                      type="button"
                      className="text-white font-semibold bg-white/20 px-1.5 py-0.5 rounded"
                    >
                      1×
                    </button>
                    <button
                      type="button"
                      className="hover:text-white px-1.5 py-0.5 rounded"
                    >
                      1.5×
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Timeline & Warnings */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-[#69766F] uppercase tracking-wider">
                    Dòng thời gian sự kiện &amp; Mốc lỗi
                  </p>
                  <p className="text-[11px] text-[#69766F]">
                    Nhấp vào mốc hoặc sự kiện bên dưới để tua video đến thời điểm vi phạm
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11.5px] text-[#69766F]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C24141]" />
                    <span>⚠️ Cần lưu ý</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
                    <span>⚡ Nhẹ</span>
                  </span>
                </div>
              </div>

              {/* Timeline Track with Markers */}
              <div className="relative h-7 flex items-center">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#DCE5DF] rounded-full" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#E8F1EB] rounded-full"
                  style={{ width: `${playhead}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#276749] border-2 border-white z-20 shadow-sm"
                  style={{ left: `calc(${playhead}% - 7px)` }}
                />

                {report.timelineMarkers.map((m, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2 z-10 cursor-pointer group"
                    style={{ left: `calc(${m.pct}% - 6px)` }}
                    onMouseEnter={() => setHoverMarker(i)}
                    onMouseLeave={() => setHoverMarker(null)}
                    onClick={() => setPlayhead(m.pct)}
                    title={`Tua đến ${m.timeFormatted || `${m.pct}%`}: ${m.label}`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-white transition-transform group-hover:scale-125 shadow-sm"
                      style={{ background: m.color }}
                    />
                    {hoverMarker === i && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#24312B] text-white text-[11px] font-medium px-2.5 py-1 rounded-md whitespace-nowrap z-30 pointer-events-none shadow-md">
                        {m.timeFormatted ? `[${m.timeFormatted}] ` : ""}{m.symbol} {m.severity}: {m.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Marker Legend Detailed List */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#DCE5DF] max-h-56 overflow-y-auto pr-1">
                {report.timelineMarkers.map((m, i) => (
                  <div
                    key={i}
                    onClick={() => setPlayhead(m.pct)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F7F6] cursor-pointer transition-colors text-[12px] group border border-transparent hover:border-[#DCE5DF]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[12px]">{m.symbol}</span>
                      {m.timeFormatted && (
                        <span className="font-mono text-[11px] font-semibold text-[#276749] bg-[#E8F1EB] px-1.5 py-0.5 rounded">
                          {m.timeFormatted}
                        </span>
                      )}
                      <span
                        className={`font-semibold flex-shrink-0 ${
                          m.severity === "Cần lưu ý"
                            ? "text-[#C24141]"
                            : "text-[#B7791F]"
                        }`}
                      >
                        {m.severity}:
                      </span>
                      <span className="text-[#24312B] truncate">{m.label}</span>
                    </div>
                    <span className="text-[11px] text-[#69766F] group-hover:text-[#276749] font-medium whitespace-nowrap pl-2">
                      Tua đến &rarr;
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Speech Transcript */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[#69766F] uppercase tracking-wider">
                  Bản ghi lời nói (Transcript)
                </p>
                <Badge variant={report.rawMetrics.fillerWords > 6 ? "warning" : "success"}>
                  Phát hiện {report.rawMetrics.fillerWords} từ đệm
                </Badge>
              </div>
              <p className="text-[13px] text-[#24312B] leading-relaxed">
                {report.transcript}
              </p>
            </Card>
          </div>

          {/* ── RIGHT: Prioritized Evaluation & Analysis (40%) ─── */}
          <div className="flex-1 lg:flex-[4] min-w-0 flex flex-col gap-4 overflow-y-auto p-5">
            {/* AI COACH PERSONA BADGE (Nếu có từ AI Core) */}
            {report.aiCoachPersona && (
              <div className="bg-[#E8F1EB] border border-[#C2DEC9] rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#276749] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                  AI
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#276749] block">
                    AI Coach Persona Phản Biện
                  </span>
                  <p className="text-[12.5px] font-semibold text-[#24312B] truncate">
                    {report.aiCoachPersona}
                  </p>
                </div>
              </div>
            )}

            {/* 1. TỔNG QUAN & ĐIỂM SỐ CHÍNH */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[#69766F] uppercase tracking-wider">
                  1. Tổng quan &amp; Điểm số chính
                </p>
                <Badge variant={report.overallScore >= 80 ? "success" : "neutral"}>
                  {report.overallScore >= 80 ? "Đạt yêu cầu" : "Cần rèn luyện"}
                </Badge>
              </div>

              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <ScoreRing score={report.overallScore} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[24px] font-bold text-[#24312B] leading-none">
                      {report.overallScore}
                    </span>
                    <span className="text-[10px] font-semibold text-[#69766F] uppercase tracking-wide">
                      / 100
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <MetricBar label="Giao tiếp mắt" value={report.metricBars.eyeContact} />
                  <MetricBar label="Tốc độ nói" value={report.metricBars.wpmSpeed} />
                  <MetricBar label="Độ tự tin" value={report.metricBars.confidence} />
                  <MetricBar label="Hạn chế từ đệm" value={report.metricBars.fillerWordControl} />
                </div>
              </div>

              {/* Grade Banner */}
              <div className="flex items-center gap-3 bg-[#F5F7F6] border border-[#DCE5DF] rounded-xl p-3 text-[12px]">
                <div className="w-9 h-9 rounded-lg bg-[#E8F1EB] border border-[#D4E5D9] font-bold text-[#276749] text-base flex items-center justify-center flex-shrink-0">
                  {report.grade}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#24312B]">{report.gradeDescription}</p>
                  <p className="text-[#69766F] text-[11px] truncate">
                    Xếp hạng theo thang đo AI Coach
                  </p>
                </div>
                {report.trendScore !== null && (
                  <div className="ml-auto font-medium text-[#276749] text-right whitespace-nowrap">
                    {report.trendScore >= 0 ? "+" : ""}{report.trendScore} điểm
                  </div>
                )}
              </div>
            </Card>

            {/* 2. NHỮNG ĐIỂM LÀM TỐT */}
            <Card className="p-4 space-y-2 border-l-4 border-l-[#276749]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#24312B] uppercase tracking-wider">
                    2. Những điểm làm tốt
                  </span>
                </div>
                <Badge variant="success">Điểm mạnh</Badge>
              </div>

              <p className="text-[12.5px] font-semibold text-[#24312B]">
                {report.strengths.title}
              </p>

              {report.detailedStrengths && report.detailedStrengths.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {report.detailedStrengths.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[12px] text-[#24312B]">
                      <span className="text-[#276749] font-bold mt-0.5">✓</span>
                      <span className="leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#69766F] leading-relaxed">
                  {report.strengths.description}
                </p>
              )}
            </Card>

            {/* 3. NHỮNG ĐIỂM CẦN CẢI THIỆN */}
            <Card className="p-4 space-y-2 border-l-4 border-l-[#B7791F]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#24312B] uppercase tracking-wider">
                    3. Những điểm cần cải thiện
                  </span>
                </div>
                <Badge variant="warning">Cần tối ưu</Badge>
              </div>

              <p className="text-[12.5px] font-semibold text-[#24312B]">
                {report.improvements.title}
              </p>

              {report.detailedWeaknesses && report.detailedWeaknesses.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {report.detailedWeaknesses.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[12px] text-[#24312B]">
                      <span className="text-[#B7791F] font-bold mt-0.5">⚠️</span>
                      <span className="leading-relaxed">{w}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#69766F] leading-relaxed">
                  {report.improvements.description}
                </p>
              )}
            </Card>

            {/* 4. CÁC CHỈ SỐ CHI TIẾT & BIỂU ĐỒ (RADAR) */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[#69766F] uppercase tracking-wider">
                  4. Phân tích đa chiều (Biểu đồ Radar)
                </p>
                <span className="text-[11px] text-[#276749] font-medium bg-[#E8F1EB] px-2 py-0.5 rounded">
                  Rubric AI Core
                </span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <RadarChart
                  metrics={report.radarMetrics}
                  rubricScores={report.rubricScores}
                />
                <div className="grid grid-cols-5 gap-1.5 w-full pt-2 border-t border-[#DCE5DF] text-center">
                  {report.rubricScores
                    ? [
                        {
                          label: "Tốc độ",
                          value: `${Math.round(report.rubricScores.speech_rate_score)}%`,
                        },
                        {
                          label: "Ánh mắt",
                          value: `${Math.round(report.rubricScores.eye_contact_score)}%`,
                        },
                        {
                          label: "Biểu cảm",
                          value: `${Math.round(report.rubricScores.facial_expression_score)}%`,
                        },
                        {
                          label: "Tư thế đầu",
                          value: `${Math.round(report.rubricScores.head_posture_score)}%`,
                        },
                        {
                          label: "Từ đệm",
                          value: `${Math.round(report.rubricScores.filler_control_score)}%`,
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <span className="text-[12px] font-bold text-[#24312B] block">
                            {value}
                          </span>
                          <span className="text-[10px] text-[#69766F] font-medium">
                            {label}
                          </span>
                        </div>
                      ))
                    : [
                        {
                          label: "WPM",
                          value: `${Math.round(report.radarMetrics.wpmPercent * 100)}%`,
                        },
                        {
                          label: "Mắt",
                          value: `${Math.round(report.radarMetrics.eyeContactPercent * 100)}%`,
                        },
                        {
                          label: "Cảm xúc",
                          value: `${Math.round(report.radarMetrics.emotionPercent * 100)}%`,
                        },
                        {
                          label: "Cơ thể",
                          value: `${Math.round(report.radarMetrics.bodyLanguagePercent * 100)}%`,
                        },
                        {
                          label: "Âm lượng",
                          value: `${Math.round(report.radarMetrics.volumePercent * 100)}%`,
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <span className="text-[12px] font-bold text-[#24312B] block">
                            {value}
                          </span>
                          <span className="text-[10px] text-[#69766F] font-medium">
                            {label}
                          </span>
                        </div>
                      ))}
                </div>
              </div>
            </Card>

            {/* 5. KHUYẾN NGHỊ LUYỆN TẬP TIẾP THEO (ACTION PLAN) */}
            <Card className="p-4 space-y-3 border-l-4 border-l-[#276749]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#24312B] uppercase tracking-wider">
                    5. Lộ trình rèn luyện AI Coach chỉ định
                  </span>
                </div>
                <Badge variant="primary">Lộ trình 7 ngày</Badge>
              </div>

              <p className="text-[12.5px] font-semibold text-[#24312B]">
                {report.recommendation.title}
              </p>

              {report.actionPlan && report.actionPlan.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {report.actionPlan.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#F5F7F6] border border-[#DCE5DF] flex items-start gap-2.5 text-[12px]"
                    >
                      <span className="font-bold text-[#276749] bg-white border border-[#DCE5DF] px-2 py-0.5 rounded text-[11px] whitespace-nowrap shadow-xs">
                        {step.day}
                      </span>
                      <span className="text-[#24312B] leading-relaxed">
                        {step.exercise}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#69766F] leading-relaxed">
                  {report.recommendation.description}
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
