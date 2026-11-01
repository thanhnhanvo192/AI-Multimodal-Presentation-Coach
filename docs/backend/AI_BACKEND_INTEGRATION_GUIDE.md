# TÀI LIỆU HƯỚNG DẪN GHÉP NỐI BỘ NÃO AI VÀO BACKEND
### Học phần: PBL6 — Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động Đa phương thức & Đa bối cảnh
> **Nhóm thực hiện:** Nguyễn Đỗ Thắng (AI Lead) | Võ Thành Nhân (Backend Lead) | Đặng Quang Sơn (Frontend Lead)  
> **Ngày hoàn thành:** 01/11/2026

---

## 1. TỔNG QUAN KIẾN TRÚC GHÉP NỐI (ARCHITECTURE OVERVIEW)

Hệ thống đã loại bỏ hoàn toàn dữ liệu giả lập (mock data) và ghép nối thành công **Bộ não AI 4 tầng (123 chiều đặc trưng)** vào **FastAPI Backend**:

```text
[ Người dùng / Giao diện ]
       │
       ▼ (1) Upload Video (MP4 / WebM từ Webcam hoặc Tải file)
[ POST /api/v1/presentations/upload ]
       │
       ├─► Lưu file video vào: /app/uploads/{uuid}.mp4
       ├─► Tạo bản ghi CSDL: Presentation(status=PENDING, progress=0%)
       │
       ▼ (2) Kích hoạt BackgroundTask Non-blocking (asyncio.to_thread)
[ app.services.video_processor.process_video_background ]
       │
       ├─► (3) Gọi Singleton: MultimodalAIAssessmentEngine (Nạp sẵn 1 lần duy nhất)
       │         │
       │         ├─► [15%] Tách âm thanh PCM 16kHz Mono (FFmpeg)
       │         ├─► [55%] Trích xuất 55D Vision (MediaPipe FaceLandmarker + solvePnP + 1-Euro)
       │         ├─► [75%] Trích xuất 65D Audio (Acoustic Prosody + F0 + WPM + Fillers)
       │         ├─► [88%] Tabular 123D + Cụm 6 mô hình CatBoost (.cbm) + SHAP TreeExplainer
       │         └─► [98%] Google Gemini 1.5 Flash (3 Persona) / Smart AI Coach Fallback
       │
       ├─► (4) Callback thời gian thực: run_coroutine_threadsafe -> Cập nhật progress_percentage vào DB
       │         ▲
       │         │ (Frontend AnalyzingPage Polling mỗi 1.5s: GET /presentations/{id}/status)
       │
       ▼ (5) Định dạng chuẩn hóa (app.services.ai_engine_service.format_ai_result_for_db)
       ├─► Lưu vào DB: AnalysisResult (PostgreSQL JSONB)
       ├─► Cập nhật: Presentation(status=COMPLETED, progress=100%)
       │
       ▼ (6) Hiển thị trên Frontend (GET /presentations/{id}/report)
[ ReportPage.tsx ]
       ├─► Video Player đồng bộ Seekbar
       ├─► Các chấm đỏ vi phạm tại giây thực tế (Timeline Errors)
       ├─► Biểu đồ Radar 5 trục: WPM, Mắt, Biểu cảm, Tư thế, Từ đệm
       ├─► Chỉ số âm học & Bóc băng (Audio Metrics & Transcript)
       └─► Lộ trình huấn luyện 7 ngày từ Huấn luyện viên AI (Action Plan)
```

---

## 2. DANH MỤC CÁC FILE ĐÃ TRIỂN KHAI & CẬP NHẬT

### 2.1. Phân hệ Backend (`backend/`)
1. **[`backend/requirements.txt`](file:///d:/Semester7/PBL6/source/backend/requirements.txt)**:
   - Bổ sung các thư viện AI: `mediapipe`, `catboost`, `shap`, `soundfile`, `imageio-ffmpeg`, `opencv-python-headless`, `numpy`, `pandas`.
2. **[`backend/Dockerfile`](file:///d:/Semester7/PBL6/source/backend/Dockerfile)**:
   - Thêm `ffmpeg` vào lệnh cài đặt hệ thống Linux.
3. **[`docker-compose.yml`](file:///d:/Semester7/PBL6/source/docker-compose.yml)**:
   - Mount `./weights:/app/weights:ro` và `./scripts:/app/scripts:ro`.
   - Cấu hình các biến môi trường: `WEIGHTS_DIR`, `SCRIPTS_DIR`, `GEMINI_API_KEY`.
4. **[`backend/app/core/config.py`](file:///d:/Semester7/PBL6/source/backend/app/core/config.py)**:
   - Bổ sung cấu hình đường dẫn động: `WEIGHTS_DIR`, `SCRIPTS_DIR`, `TEMP_EVAL_DIR`, `AI_SAMPLE_FPS`, `GEMINI_API_KEY`.
5. **[`backend/app/services/ai_engine_service.py`](file:///d:/Semester7/PBL6/source/backend/app/services/ai_engine_service.py)** *(Tạo mới)*:
   - Quản lý Singleton `get_ai_engine()` khởi tạo nạp trọng số 1 lần (Warm-up).
   - Ánh xạ `PresentationScenario` $\leftrightarrow$ bối cảnh AI (`do_an`, `pitching`, `hung_bien`).
   - Hàm `format_ai_result_for_db()` chuyển đổi dữ liệu AI sang cấu trúc chuẩn CSDL và API Response.
6. **[`backend/app/services/video_processor.py`](file:///d:/Semester7/PBL6/source/backend/app/services/video_processor.py)**:
   - Thay thế toàn bộ mock data bằng gọi pipeline AI thực tế.
   - Thực thi AI trong Worker Thread qua `asyncio.to_thread` nhằm giải phóng Event Loop, chống nghẽn API.
   - Cơ chế callback `run_coroutine_threadsafe` cập nhật tiến độ liên tục vào CSDL.
7. **[`backend/app/main.py`](file:///d:/Semester7/PBL6/source/backend/app/main.py)**:
   - Bổ sung khởi tạo nền Pre-warm AI Engine trong sự kiện `lifespan` khi khởi động ứng dụng.
8. **[`backend/app/services/video_stream.py`](file:///d:/Semester7/PBL6/source/backend/app/services/video_stream.py)** *(Tạo mới)*:
   - Module chuyên biệt stream video chuẩn **HTTP 206 Partial Content (Range Request)** và CORS.
   - Hỗ trợ đầy đủ MIME type (`video/mp4`, `video/webm`, `video/x-msvideo`, `video/quicktime`).
   - Đảm bảo video phát lại mượt mà trên Chrome, Safari, Edge và hỗ trợ click tua Seekbar đồng bộ mốc lỗi.
9. **[`backend/tests/test_ai_integration.py`](file:///d:/Semester7/PBL6/source/backend/tests/test_ai_integration.py)** *(Tạo mới)*:
   - Kiểm thử toàn diện sự tương thích giữa dữ liệu thực tế của AI Engine và Pydantic Schemas của Backend.

### 2.2. Phân hệ AI Engine (`scripts/`)
1. **[`scripts/ai_assessment_engine.py`](file:///d:/Semester7/PBL6/source/scripts/ai_assessment_engine.py)**:
   - Thêm tham số `weights_dir=None` vào constructor để nhận linh hoạt đường dẫn từ Backend/Docker.
   - Thêm tham số `progress_callback=None` vào `run_assessment()` để gửi thông báo tiến độ từng giai đoạn (10% $\rightarrow$ 25% $\rightarrow$ 60% $\rightarrow$ 78% $\rightarrow$ 88% $\rightarrow$ 98% $\rightarrow$ 100%).
2. **[`scripts/extract_multimodal_features.py`](file:///d:/Semester7/PBL6/source/scripts/extract_multimodal_features.py)**:
   - Nhận biến môi trường `WEIGHTS_DIR` ưu tiên để tìm `face_landmarker.task`.

---

## 3. HƯỚNG DẪN KHỞI CHẠY & VẬN HÀNH

### Cách 1: Chạy trực tiếp qua Docker Compose (Khuyến nghị cho Production)
```bash
# 1. Điền Gemini API Key (tùy chọn) trong file .env nếu muốn gọi LLM Gemini 1.5 Flash
# GEMINI_API_KEY="AIzaSy..."

# 2. Build và khởi động các container
docker compose up -d --build

# 3. Theo dõi log xử lý AI của Backend
docker logs -f pbl6_backend
```

### Cách 2: Chạy trực tiếp trên máy cục bộ (Local Development)
```bash
# 1. Cài đặt các thư viện Backend & AI
cd backend
pip install -r requirements.txt

# 2. Khởi động Backend Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Khởi động Frontend Vite
cd ../frontend
npm run dev
```

---

## 4. QUY TẮC BẢO MẬT & DỰ PHÒNG (FAILSAFE MECHANISM)
1. **Gemini API Key**: Khi không có `GEMINI_API_KEY` hoặc mạng bị gián đoạn, hệ thống **không bao giờ bị crash** mà tự động kích hoạt **Smart AI Coach Fallback** (tạo lời khuyên chuẩn mực dựa trên phân tích SHAP và mốc giây vi phạm).
2. **Đa luồng an toàn**: Các tác vụ AI nặng (MediaPipe, FFT, CatBoost) được cô lập trong Worker Thread, đảm bảo máy chủ API vẫn phản hồi 200 OK mượt mà cho mọi truy vấn khác.

