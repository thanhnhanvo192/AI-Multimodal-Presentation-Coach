import { useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar, { UserRole } from "./Sidebar";
import { Button, Card, Badge } from "./components/common";
import { getReportBySessionId, DetailedSessionReport } from "./mocks/mockHistory";

/* ── Dynamic Radar Chart ─────────────────────────────────────── */
function RadarChart({
  metrics,
}: {
  metrics: DetailedSessionReport["radarMetrics"];
}) {
  const cx = 110,
    cy = 110,
    r = 76;

  const axes = [
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

import { useEffect, useRef } from "react";
import { presentationService } from "./services";

/* ── Main Report Page ─────────────────────────────────────── */
interface ReportPageProps {
  onNav: (view: string) => void;
  userRole: UserRole;
}

export default function ReportPage({ onNav, userRole }: ReportPageProps) {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [report, setReport] = useState<DetailedSessionReport | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoverMarker, setHoverMarker] = useState<number | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(180);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    setLoading(true);

    presentationService
      .getReport(sessionId)
      .then((data) => {
        if (!isSubscribed) return;
        const durSeconds = 180;
        const mapped: DetailedSessionReport = {
          sessionId: data.presentation_id,
          title: data.title || "Bài thuyết trình",
          date: new Date(data.created_at).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          duration: "03:00",
          context: "Bảo vệ đề án",
          overallScore: Math.round(data.total_score || 80),
          trendScore: 3,
          grade: (data.total_score || 80) >= 85 ? "Xuất sắc" : (data.total_score || 80) >= 70 ? "Tốt" : "Cần cải thiện",
          gradeDescription: data.badge_title || "Diễn giả Tiềm Năng",
          radarMetrics: {
            wpmPercent: Math.min(100, Math.round(data.radar_scores?.speech_rate || 85)) / 100,
            eyeContactPercent: Math.min(100, Math.round(data.radar_scores?.eye_contact || 88)) / 100,
            emotionPercent: Math.min(100, Math.round(data.radar_scores?.pitch || 80)) / 100,
            bodyLanguagePercent: Math.min(100, Math.round(data.radar_scores?.body_language || 82)) / 100,
            volumePercent: Math.min(100, Math.round(data.radar_scores?.content || 90)) / 100,
          },
          metricBars: {
            eyeContact: Math.round(data.radar_scores?.eye_contact || 88),
            wpmSpeed: Math.round(data.radar_scores?.speech_rate || 85),
            confidence: Math.round(data.radar_scores?.body_language || 82),
            fillerWordControl: Math.max(0, 100 - (data.audio_metrics?.filler_words_count || 0) * 10),
          },
          rawMetrics: {
            eyeContact: Math.round(data.radar_scores?.eye_contact || 88),
            wpm: data.audio_metrics?.wpm || 142,
            fillerWords: data.audio_metrics?.filler_words_count || 0,
          },
          timelineMarkers: (data.timeline_errors || []).map((err) => ({
            pct: Math.min(95, Math.max(5, (err.timestamp / durSeconds) * 100)),
            timestamp: err.timestamp,
            color: err.type?.includes("LOST") ? "#C24141" : "#B7791F",
            symbol: err.type?.includes("LOST") ? "⚠️" : "⚡",
            label: err.message,
            severity: err.type?.includes("LOST") ? "Cần lưu ý" : "Nhẹ",
          })),
          transcript:
            typeof data.transcript?.full_text === "string"
              ? data.transcript.full_text
              : "Bản bóc băng lời nói đang được hoàn thiện...",
          strengths: {
            title: "Điểm mạnh",
            description: data.ai_feedback?.strengths?.join(". ") || "Giữ vững giao tiếp mắt tốt và phong thái đĩnh đạc.",
          },
          improvements: {
            title: "Cần cải thiện",
            description: data.ai_feedback?.weaknesses?.join(". ") || "Cần điều tiết nhịp thở và giảm các khoảng dừng ngập ngừng.",
          },
          recommendation: {
            title: "Khuyến nghị từ AI Coach",
            description: data.ai_feedback?.action_items?.join(". ") || "Luyện tập ngẩng cao đầu duy trì ánh mắt ngay cả khi suy nghĩ.",
          },
        };

        setReport(mapped);
        if (data.video_url) {
          setVideoUrl(presentationService.resolveVideoUrl(data.video_url));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("[ReportPage] Lấy báo cáo từ API không thành công, sử dụng dữ liệu mẫu:", err);
        const fallback = getReportBySessionId(sessionId);
        setReport(fallback || null);
        setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [sessionId]);

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSeek = (newPct: number) => {
    setPlayhead(newPct);
    if (videoRef.current && videoDuration > 0) {
      const targetTime = (newPct / 100) * videoDuration;
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleMarkerClick = (marker: { pct: number; timestamp?: number }) => {
    if (videoRef.current) {
      let targetTime = marker.timestamp;
      if (targetTime === undefined) {
        targetTime = (marker.pct / 100) * (videoDuration || 180);
      }
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      setPlayhead(videoDuration > 0 ? (targetTime / videoDuration) * 100 : marker.pct);
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      setPlayhead(marker.pct);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (dur && !isNaN(dur) && isFinite(dur)) {
        setVideoDuration(dur);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || videoDuration || 180;
      setCurrentTime(cur);
      if (dur > 0) {
        setPlayhead((cur / dur) * 100);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch((e) => console.warn("Video playback error:", e));
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
        <Sidebar userRole={userRole} activeItem="history" onNav={onNav} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-3 border-[#276749] border-t-transparent animate-spin" />
            <p className="text-[13.5px] font-medium text-[#69766F]">Đang tải báo cáo phân tích...</p>
          </div>
        </main>
      </div>
    );
  }

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
              className="rounded-xl overflow-hidden bg-[#1A231F] border border-[#DCE5DF] relative group"
              style={{ aspectRatio: "16/9" }}
            >
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A231F] text-white/70 relative">
                  <img
                    src="https://images.unsplash.com/photo-1758876020207-67890de8aa73?w=900&h=506&fit=crop&auto=format"
                    alt="Recorded presentation session"
                    className="w-full h-full object-cover opacity-60 absolute inset-0"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <span className="text-xs text-white/80 font-medium">Video lưu trữ (Mô phỏng dữ liệu)</span>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Top Session Info Pill */}
              <div className="absolute top-3 left-3">
                <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#276749] animate-pulse" />
                  Phiên #{report.sessionId} — {videoUrl ? "Video trực tiếp" : "Video lưu trữ"}
                </span>
              </div>

              {/* Top-right Duration Pill */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11.5px] font-mono font-medium px-2.5 py-1 rounded-md border border-white/10">
                {formatTime(videoDuration)}
              </div>

              {/* Bottom Playback Controls */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex flex-col gap-2 z-20">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={playhead}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full h-1.5 accent-[#276749] bg-white/30 rounded cursor-pointer transition-all"
                  aria-label="Tua video"
                />
                <div className="flex items-center justify-between text-[12px] text-white">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-8 h-8 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                      aria-label={isPlaying ? "Tạm dừng video" : "Phát video"}
                    >
                      {isPlaying ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>
                    <span className="font-mono text-white/90 text-[12px]">
                      {formatTime(currentTime)} / {formatTime(videoDuration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11.5px] text-white/80">
                    {[0.5, 1, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => changeRate(rate)}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          playbackRate === rate
                            ? "text-white font-semibold bg-[#276749]"
                            : "hover:text-white hover:bg-white/20"
                        }`}
                      >
                        {rate}×
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Timeline & Warnings */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[#69766F] uppercase tracking-wider">
                  Dòng thời gian sự kiện
                </p>
                <div className="flex items-center gap-3 text-[11.5px] text-[#69766F]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C24141]" />
                    <span>⚠️ Cần lưu ý</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
                    <span>💬 Từ đệm</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    <span>⚡ Nhịp điệu</span>
                  </span>
                </div>
              </div>

              {/* Timeline Track with Markers */}
              <div className="relative h-7 flex items-center">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#DCE5DF] rounded-full" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#276749] rounded-full transition-all duration-100"
                  style={{ width: `${playhead}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#276749] border-2 border-white shadow z-20 transition-all duration-100"
                  style={{ left: `calc(${playhead}% - 7px)` }}
                />

                {report.timelineMarkers.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleMarkerClick(m)}
                    className="absolute top-1/2 -translate-y-1/2 z-10 cursor-pointer focus:outline-none group/marker"
                    style={{ left: `calc(${m.pct}% - 7px)` }}
                    onMouseEnter={() => setHoverMarker(i)}
                    onMouseLeave={() => setHoverMarker(null)}
                    aria-label={`Chuyển đến mốc: ${m.label}`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-white shadow transition-transform hover:scale-125"
                      style={{ background: m.color }}
                    />
                    {hoverMarker === i && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#24312B] text-white text-[11px] font-medium px-2.5 py-1 rounded-md whitespace-nowrap z-30 pointer-events-none shadow-lg">
                        {m.symbol} {m.severity}: {m.label} ({formatTime(m.timestamp ?? (m.pct / 100) * videoDuration)})
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Marker Legend Detailed List */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#DCE5DF]">
                {report.timelineMarkers.map((m, i) => (
                  <div
                    key={i}
                    onClick={() => handleMarkerClick(m)}
                    className="flex items-center justify-between text-[12px] p-2 rounded-lg hover:bg-[#F5F7F6] cursor-pointer transition-colors group/item"
                    title="Nhấn để tua video đến thời điểm này"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12px]">{m.symbol}</span>
                      <span
                        className={`font-semibold ${
                          m.severity === "Cần lưu ý"
                            ? "text-[#C24141]"
                            : m.severity === "Từ đệm"
                            ? "text-[#B7791F]"
                            : "text-[#3B82F6]"
                        }`}
                      >
                        {m.severity}:
                      </span>
                      <span className="text-[#24312B]">{m.label}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#69766F] group-hover/item:text-[#276749] flex items-center gap-1 font-medium bg-[#E8F1EB]/50 group-hover/item:bg-[#E8F1EB] px-2 py-0.5 rounded">
                      ▶ {formatTime(m.timestamp ?? (m.pct / 100) * videoDuration)}
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
                  <span className="text-sm">🌟</span>
                  <span className="text-[12px] font-bold text-[#24312B] uppercase tracking-wider">
                    2. Những điểm làm tốt
                  </span>
                </div>
                <Badge variant="success">Điểm mạnh</Badge>
              </div>

              <p className="text-[12.5px] font-semibold text-[#24312B]">
                {report.strengths.title}
              </p>
              <p className="text-[12px] text-[#69766F] leading-relaxed">
                {report.strengths.description}
              </p>
            </Card>

            {/* 3. NHỮNG ĐIỂM CẦN CẢI THIỆN */}
            <Card className="p-4 space-y-2 border-l-4 border-l-[#B7791F]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">⚠️</span>
                  <span className="text-[12px] font-bold text-[#24312B] uppercase tracking-wider">
                    3. Những điểm cần cải thiện
                  </span>
                </div>
                <Badge variant="warning">Cần tối ưu</Badge>
              </div>

              <p className="text-[12.5px] font-semibold text-[#24312B]">
                {report.improvements.title}
              </p>
              <p className="text-[12px] text-[#69766F] leading-relaxed">
                {report.improvements.description}
              </p>
            </Card>

            {/* 4. CÁC CHỈ SỐ CHI TIẾT & BIỂU ĐỒ (RADAR) */}
            <Card className="p-5 space-y-3">
              <p className="text-[12px] font-semibold text-[#69766F] uppercase tracking-wider">
                4. Phân tích đa chiều (Biểu đồ Radar)
              </p>
              <div className="flex flex-col items-center gap-3">
                <RadarChart metrics={report.radarMetrics} />
                <div className="grid grid-cols-5 gap-1.5 w-full pt-2 border-t border-[#DCE5DF] text-center">
                  {[
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

            {/* 5. KHUYẾN NGHỊ LUYỆN TẬP TIẾP THEO */}
            <Card className="p-4 space-y-2 border-l-4 border-l-[#276749]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎯</span>
                  <span className="text-[12px] font-bold text-[#24312B] uppercase tracking-wider">
                    5. Khuyến nghị luyện tập tiếp theo
                  </span>
                </div>
                <Badge variant="primary">Kế hoạch rèn luyện</Badge>
              </div>

              <p className="text-[12.5px] font-semibold text-[#24312B]">
                {report.recommendation.title}
              </p>
              <p className="text-[12px] text-[#69766F] leading-relaxed">
                {report.recommendation.description}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
