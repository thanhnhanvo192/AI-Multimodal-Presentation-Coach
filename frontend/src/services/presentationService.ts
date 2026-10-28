import { apiClient, API_BASE_URL, ApiError } from "./apiClient";

export type PresentationScenario = "ACADEMIC" | "PITCHING" | "INTERVIEW";
export type PresentationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface PresentationUploadResponse {
  id: number;
  title: string;
  scenario: PresentationScenario;
  status: PresentationStatus;
  progress_percentage: number;
  created_at: string;
}

export interface PresentationStatusResponse {
  id: number;
  status: PresentationStatus;
  progress_percentage: number;
  error_message?: string | null;
}

export interface RadarScores {
  eye_contact: number;
  body_language: number;
  speech_rate: number;
  pitch: number;
  content: number;
}

export interface TimelineErrorItem {
  timestamp: number;
  type: string;
  message: string;
}

export interface AudioMetrics {
  wpm: number;
  pause_count: number;
  filler_words_count: number;
  pitch_variation: string;
}

export interface AIFeedback {
  strengths: string[];
  weaknesses: string[];
  action_items: string[];
}

export interface AnalysisReportResponse {
  presentation_id: number;
  title: string;
  video_url: string;
  total_score: number;
  badge_title: string;
  radar_scores: RadarScores;
  timeline_errors: TimelineErrorItem[];
  audio_metrics: AudioMetrics;
  transcript: {
    full_text?: string;
    words_count?: number;
    [key: string]: unknown;
  };
  ai_feedback: AIFeedback;
  created_at: string;
}

export const presentationService = {
  /**
   * Tải video lên hệ thống kèm thanh tiến trình upload mạng thực tế
   */
  async uploadVideo(
    file: File | Blob,
    title: string = "Bài thuyết trình chưa đặt tên",
    scenario: PresentationScenario = "ACADEMIC",
    onProgress?: (pct: number) => void
  ): Promise<PresentationUploadResponse> {
    const formData = new FormData();
    const filename = file instanceof File ? file.name : "presentation_recording.webm";
    formData.append("file", file, filename);
    formData.append("title", title);
    formData.append("scenario", scenario);

    const token = localStorage.getItem("auth_token");
    const uploadUrl = `${API_BASE_URL}/presentations/upload`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            onProgress(pct);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data: PresentationUploadResponse = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error("Không thể phân tích phản hồi JSON từ máy chủ."));
          }
        } else {
          let msg = `Tải lên thất bại với mã lỗi ${xhr.status}`;
          try {
            const err = JSON.parse(xhr.responseText);
            if (err?.detail) {
              msg = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
            }
          } catch {
            // ignore
          }
          reject(new ApiError(msg, xhr.status));
        }
      };

      xhr.onerror = () => {
        reject(new ApiError("Lỗi kết nối mạng khi tải video lên máy chủ.", 0));
      };

      xhr.send(formData);
    });
  },

  /**
   * Tra cứu trạng thái và tiến độ xử lý video ngầm
   */
  async getStatus(presentationId: number | string): Promise<PresentationStatusResponse> {
    return apiClient.get<PresentationStatusResponse>(`/presentations/${presentationId}/status`);
  },

  /**
   * Lấy báo cáo phân tích đa phương thức hoàn chỉnh
   */
  async getReport(presentationId: number | string): Promise<AnalysisReportResponse> {
    return apiClient.get<AnalysisReportResponse>(`/presentations/${presentationId}/report`);
  },

  /**
   * Tạo đường dẫn URL đầy đủ để phát video từ backend
   */
  resolveVideoUrl(videoPathOrUrl: string): string {
    if (!videoPathOrUrl) return "";
    if (videoPathOrUrl.startsWith("http://") || videoPathOrUrl.startsWith("https://")) {
      return videoPathOrUrl;
    }
    // Lấy host từ API_BASE_URL (ví dụ http://localhost:8000)
    const baseHost = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
    const cleanPath = videoPathOrUrl.startsWith("/") ? videoPathOrUrl : `/${videoPathOrUrl}`;
    return `${baseHost}${cleanPath}`;
  },
};
