# NỀN TẢNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG ĐA PHƯƠNG THỨC & ĐA BỐI CẢNH
### (Multimodal Presentation Assessment & Context-Aware AI Coaching Platform)

> **Học phần:** PBL6 – Dự án Chuyên ngành Công nghệ Thông tin  
> **Khoa:** Công nghệ Thông tin – Trường Đại học Bách Khoa, Đại học Đà Nẵng (DUT)  
> **Giảng viên hướng dẫn:** **TS. Lê Minh Trí**  
> **Nhóm sinh viên thực hiện (Lớp 23T_Nhat1):**
> 1. **Nguyễn Đỗ Thắng** (102230046): **AI & Data Lead, Kiến trúc sư Hệ thống (System Architect)**
> 2. **Võ Thành Nhân** (102230035): **Backend & DevOps Lead** (FastAPI, PostgreSQL, Redis, Celery, Docker)
> 3. **Đặng Quang Sơn** (102230044): **Frontend & QA Lead** (Next.js 14, Radar Charts, Video Seekbar, Testing)

---

## 1. TỔNG QUAN ĐỀ TÀI & Ý NGHĨA KHOA HỌC

Kỹ năng thuyết trình là một trong những chuẩn đầu ra cốt lõi của kỹ sư CNTT (ABET Outcome 3: *Effective Communication*). Tuy nhiên, việc đánh giá thủ công của giảng viên thường mang tính định tính, tốn thời gian và thiếu phản hồi tức thì.

Dự án **PBL6** xây dựng một **Nền tảng Đánh giá & Huấn luyện Thuyết trình Tự động Đa Phương thức** (kết hợp **Thị giác máy tính - Computer Vision**, **Xử lý tiếng nói - Speech Processing** và **Học máy giải thích được - Explainable AI**), thích ứng thông minh theo **3 bối cảnh thực tế**:
1. **Thuyết trình Đồ án (Academic & Capstone Defense):** Đề cao tư thế đĩnh đạc, ánh mắt tập trung, nhịp nói kỹ thuật chuẩn xác (115–130 WPM), triệt tiêu từ đệm ậm ờ.
2. **Hùng biện Công chúng (Public Speaking & Debate):** Đề cao ngôn ngữ cơ thể dứt khoát, nụ cười, biên độ biểu cảm cơ mặt sinh động và ngữ điệu giọng nói (F0 Pitch SD) truyền cảm hứng.
3. **Pitching Gọi vốn Khởi nghiệp (Startup Pitching):** Đề cao năng lượng, nụ cười tự tin (Action Unit AU12), ánh mắt thuyết phục nhà đầu tư và tốc độ dứt khoát quyết đoán (135–155 WPM).

---

## 2. KIẾN TRÚC HỆ THỐNG PHÂN TẦNG (SYSTEM ARCHITECTURE)

Hệ thống được thiết kế theo mô hình **Event-Driven Micro-Architecture** tách biệt hoàn toàn giữa quá trình tiếp nhận video trực tuyến và cụm Worker tính toán AI nặng:

```text
  [ 👤 SINH VIÊN ] 
        | (Upload MP4 / WebRTC Stream)
        v
+-----------------------+     (1) POST /upload      +-----------------------+   (2a) Enqueue Task   +-----------------------+
|  1. GIAO DIỆN CLIENT  | ------------------------> |    2. API GATEWAY     | --------------------> | 3. HÀNG ĐỢI & BUFFER  |
|      (Next.js 14)     |     (HTTPS Multipart)     |    (FastAPI Core)     |                       |    (Redis 7 Queue)    |
|                       |                           |                       |   (2b) Lưu video thô  +-----------------------+
| • Studio Nộp Video    | < - - - - - - - - - - - - | • JWT Auth Security   | --------------------> | 3. LƯU TRỮ TĨNH S3    |
| • Dashboard Radar     |     (6) WSS Push Event    | • Upload Streamer     |     (S3 PutObject)    |   (MinIO Storage)     |
| • Seekbar Mốc Lỗi     |   (Tiến trình 0% -> 100%) | • WebSocket Manager   |                       +-----------------------+
| • AI Coach Action Plan|                           | • Query Reports API   |                                   |
+-----------------------+                           +-----------------------+                                   | (3b) Stream File
        ^                                                       | (SQL Query)                                   v
        | (7) GET /reports/{id}                                 v                                   +-----------------------+
        +-------------------------------------------------------+                                   |  4. BỘ NÃO XỬ LÝ AI   |
                                                    +-----------------------+                       |   (Celery Workers)    |
                                                    |  5. CƠ SỞ DỮ LIỆU     |   (5) Ghi kết quả     |                       |
                                                    |    (PostgreSQL 16)    | <-------------------- | • Vision: MediaPipe   |
                                                    |                       |   JSONB Telemetry     | • Audio: Whisper/Praat|
                                                    | • Users, Presentations|   JSONB XAI Report    | • Vector 123D Fusion  |
                                                    | • JSONB Time-Series   |                       | • CatBoost Regressor  |
                                                    | • JSONB AI Feedback   |                       | • SHAP TreeExplainer  |
                                                    +-----------------------+                       | • Coach Orchestrator  |
                                                                                                    +-----------------------+
                                                                                                                | (4) HTTPS REST
                                                                                                                v
                                                                                                    +-----------------------+
                                                                                                    | 6. LLM CLOUD COACH    |
                                                                                                    | (Google Gemini Flash) |
                                                                                                    | 3 Persona Phản biện   |
                                                                                                    +-----------------------+
```

---

## 3. BỘ NÃO AI 4 TẦNG (AI CORE PIPELINE - 123 CHIỀU ĐẶC TRƯNG)

Bộ não AI được thiết kế khép kín tại `scripts/ai_assessment_engine.py`, tích hợp 4 tầng công nghệ tiên tiến:

1. **Tầng 1 - Thị giác máy tính (55D Vision Sub-Engine):**
   * Sử dụng **MediaPipe FaceLandmarker Tasks API (478 điểm mốc 3D + 52 Blendshapes)** kết hợp thuật toán **`cv2.solvePnP`** và bộ lọc thích ứng **`1-Euro Filter`** để đo góc quay đầu (Yaw, Pitch, Roll) với sai số rung giật cực thấp ($0.13^\circ$).
   * Trích xuất chỉ số tương tác ánh mắt (Eye Contact, Gaze Asymmetry), tần số chớp mắt, tỷ lệ mỉm cười tự nhiên chuẩn **Action Unit AU12** (*Lip Corner Puller*) và năng lượng cơ mặt.
2. **Tầng 2 - Âm học & Ngôn ngữ (65D Audio & Speech Sub-Engine):**
   * Sử dụng **Faster-Whisper INT8 (CTranslate2 Engine)** kết hợp mô hình tinh chỉnh **PhoWhisper LoRA** nhằm bảo toàn 100% từ đệm tiếng Việt (*'ờ', 'à', 'ừm', 'kiểu như'*) và thuật ngữ CNTT/Startup (Code-switching).
   * Phân tích âm học prosody: Cao độ cơ bản F0 (Mean, SD, Range), độ rung thanh quản (Jitter, Shimmer), tỷ lệ hài âm HNR, tốc độ nói (Words Per Minute - WPM), khoảng lặng ngắt nghỉ (Pause Ratio) và tỷ lệ khoảng lặng chết ($> 2.5\text{s}$).
3. **Tầng 3 - Chấm điểm Đa tiêu chí & Giải thích XAI (Tabular ML & SHAP):**
   * Hợp nhất thành **Vector 123 chiều (123D)**: $55\text{D Vision} + 65\text{D Audio} + 3\text{D Context One-Hot}$.
   * Cụm **6 mô hình CatBoost Regressor** (`weights/catboost_scoring/`) dự đoán chính xác 5 đầu điểm Rubric và Điểm tổng kết ($R^2 \ge 0.91 - 0.99$, sai số $\text{MAE} \approx \pm 0.9\text{ điểm}$).
   * Mô hình giải thích **SHAP TreeExplainer** bóc tách các đặc trưng kéo tụt điểm (Feature Attribution) và ánh xạ với chuỗi thời gian để tìm ra chính xác giây vi phạm.
4. **Tầng 4 - Gia sư Ảo Đa Bối cảnh (LLM Coach Orchestrator):**
   * Gọi mô hình **Google Gemini 1.5 Flash** nhập vai 1 trong 3 Persona (Chủ tịch hội đồng bảo vệ đồ án / Huấn luyện viên trưởng hùng biện / Nhà đầu tư Shark Tank) để xuất lộ trình luyện tập cá nhân hóa 7 ngày.

---

## 4. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
f:\DAIHOC\Nam4-ky1\PBL6\
├── data/
│   ├── raw/DUT-PresCorpus/                # 32 video thực tế (8 do_an + 8 hung_bien + 16 pitching)
│   ├── processed/
│   │   ├── audio_16k/                     # 32 file âm thanh PCM 16kHz Mono tách bằng FFmpeg
│   │   ├── telemetry/                     # 32 file Telemetry từng giây (phục vụ thanh tua Seekbar)
│   │   ├── transcripts/                   # 32 file bóc băng & phân tích nhịp điệu bài nói
│   │   ├── xai_reports/                   # 32 file giải thích SHAP XAI bóc tách điểm cộng/trừ
│   │   └── sample_assessment_outputs/     # File JSON mẫu kiểm thử End-to-End
│   ├── features/
│   │   ├── dut_prescorpus_real_123d.csv   # Ma trận 123 chiều của 32 video thực tế
│   │   └── dut_prescorpus_train_123d.csv  # Tập dữ liệu 600 mẫu tăng cường bám sát phân phối thật
│   ├── annotations/
│   │   └── rubric_scores.csv              # Bảng điểm chuẩn 5 tiêu chí Rubric cho 32 video
│   └── metadata.csv                       # Quản lý danh mục, link gốc, bối cảnh từng video
├── scripts/
│   ├── ai_assessment_engine.py            # BỘ NÃO SUY LUẬN AI END-TO-END (Giao tiếp với Backend)
│   ├── extract_multimodal_features.py     # Pipeline trích xuất 123 chiều từ video thực tế
│   ├── train_catboost_scoring.py          # Script huấn luyện 6 mô hình CatBoost & SHAP XAI
│   ├── test_whisper_lora.py               # Script test suy luận bóc băng Whisper LoRA tiếng Việt
│   ├── train_whisper_lora.py              # Script huấn luyện tinh chỉnh Whisper LoRA
│   └── download_sample_dataset.py         # Công cụ tự động tải và cắt video YouTube chuẩn FFmpeg
├── weights/
│   ├── catboost_scoring/                  # 6 file trọng số .cbm + model_metadata_123d.json
│   ├── whisper_lora_vietnamese/           # Trọng số LoRA tiếng Việt adapter_model.safetensors
│   └── face_landmarker.task               # Trọng số MediaPipe FaceLandmarker Tasks API (478 điểm 3D)
├── .gitignore                             # Cấu hình chuẩn bỏ qua file rác khi push Git
└── README.md                              # Tài liệu kỹ thuật tổng quan dự án
```

---

## 5. HƯỚNG DẪN TÍCH HỢP CHO BACKEND & DEVOPS (DÀNH CHO NHÂN)

Nhân không cần dựng server AI riêng. Thắng đã đóng gói toàn bộ quy trình thành 1 Class duy nhất tại `scripts/ai_assessment_engine.py`:

### Bước 1: Khai báo thư viện trong `requirements.txt` của Backend
```text
mediapipe>=0.10.14
catboost>=1.2.5
shap>=0.45.0
soundfile>=0.12.1
imageio-ffmpeg>=0.4.9
opencv-python>=4.9.0
numpy>=1.24.0
pandas>=2.0.0
```

### Bước 2: Gọi AI Engine trong Celery Task (`app/tasks/presentation_tasks.py`)
```python
import os
from scripts.ai_assessment_engine import MultimodalAIAssessmentEngine

# Khởi tạo nạp model 1 lần duy nhất khi Worker khởi động
ai_engine = MultimodalAIAssessmentEngine()

@celery_app.task(bind=True)
def assess_presentation_task(self, video_path: str, context_type: str = "do_an"):
    """
    Nhận đường dẫn file video MP4 trên MinIO và bối cảnh ('do_an' | 'hung_bien' | 'pitching')
    """
    # 1. Gọi trực tiếp bộ não AI đánh giá (Mất ~5 giây cho video 3 phút, RTF = 0.027)
    result = ai_engine.run_assessment(
        video_path=video_path,
        context_type=context_type
    )

    # 2. Nhân lấy các trường lưu vào Database (PostgreSQL 16):
    # - overall_score: result["overall_score"] (float)
    # - rubric_scores: result["rubric_scores"] (dict: eye, posture, smile, speech, filler)
    # - telemetry_timeseries: result["telemetry_timeseries"] (JSONB - mốc giây cho thanh Seekbar)
    # - xai_report: result["xai_report"] (JSONB - lời khuyên của AI Coach)
    # - shap_explanation: result["shap_explanation"] (JSONB - Top điểm cộng/trừ)

    # 3. Bắn sự kiện tiến trình qua Redis Pub/Sub xuống WebSocket cho Sơn (Next.js 14)
    # push_websocket_update(task_id=self.request.id, data=result)

    return result
```

### Bước 3: Xem dữ liệu mẫu Contract JSON
File JSON mẫu thực tế đã chạy trên video thật được lưu tại:  
👉 [`data/processed/sample_assessment_outputs/DA_001_full_assessment.json`](./data/processed/sample_assessment_outputs/DA_001_full_assessment.json)

---

## 6. HƯỚNG DẪN CHẠY THỰC NGHIỆM ĐỘC LẬP (CLI COMMANDS)

### 1. Đánh giá thử nghiệm 1 video bất kỳ:
```powershell
python scripts/ai_assessment_engine.py --video "data/raw/DUT-PresCorpus/do_an/da_001.mp4" --context do_an
```

### 2. Trích xuất đặc trưng 123 chiều từ toàn bộ video trong tập dữ liệu:
```powershell
python scripts/extract_multimodal_features.py --fps 1.5
```

### 3. Huấn luyện lại bộ 6 mô hình CatBoost và sinh báo cáo SHAP XAI:
```powershell
python scripts/train_catboost_scoring.py
```

### 4. Kiểm thử mô hình bóc băng tiếng Việt Whisper LoRA:
```powershell
python scripts/test_whisper_lora.py
```

---
*Bản quyền thuộc về Nhóm Đề tài PBL6 – Khoa Công nghệ Thông tin, Trường Đại học Bách Khoa, Đại học Đà Nẵng (2026).*

