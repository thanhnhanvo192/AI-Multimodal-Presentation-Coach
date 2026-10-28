# KẾ HOẠCH ĐỐI SOÁT, GHÉP NỐI VÀ PHÁT TRIỂN API (FRONTEND — BACKEND)
### HỆ THỐNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG (AI MULTIMODAL PRESENTATION COACH)

---

## 1. TỔNG QUAN & MỤC TIÊU DỰ ÁN

* **Đề tài:** Nghiên cứu và Xây dựng Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động Dựa trên Phân tích Thị giác và Nội dung Lời nói (PBL6).
* **Mục tiêu tài liệu:** 
  1. Đối soát chi tiết giữa giao diện người dùng hiện có tại thư mục `frontend/` và các API dịch vụ hiện có tại thư mục `backend/`.
  2. Xác định các sai khác về cấu trúc dữ liệu (Data Contract Mismatch) và khoảng trống nghiệp vụ (Gaps).
  3. Đặc tả chi tiết các API mới cần thiết kế và xây dựng phía Backend FastAPI.
  4. Lập kế hoạch từng bước (Phased Roadmap) để ghép nối dữ liệu thực tế, tích hợp JWT Authentication, xử lý Background Tasks và video streaming.

---

## 2. HIỆN TRẠNG KIẾN TRÚC KỸ THUẬT

### 2.1. Phân hệ Backend (FastAPI / Python 3.10)
* **Framework:** FastAPI bất đồng bộ (`async`/`await`), tự động sinh Swagger UI tại `/docs`.
* **Cơ sở dữ liệu:** PostgreSQL 15 (Docker) / SQLite (`pbl6_local.db`) với Async SQLAlchemy 2.0 ORM.
* **Xác thực:** JWT (JSON Web Token) Bearer Token (`python-jose`), mã hóa mật khẩu `passlib[bcrypt]`.
* **Xử lý nền:** `BackgroundTasks` mô phỏng/chạy tiến trình phân tích AI đa kênh (`video_processor.py`).
* **Lưu trữ tĩnh:** Mount thư mục `uploads/` thành Static Files (`/uploads/{filename}`).
* **CORS:** Đã cho phép mọi origin (`BACKEND_CORS_ORIGINS = ["*"]`).
* **Đầu cuối API hiện có:**
  * `POST /api/v1/auth/register` (Tạo tài khoản)
  * `POST /api/v1/auth/login` (Xác thực lấy token)
  * `GET /api/v1/auth/me` (Thông tin tài khoản hiện tại)
  * `POST /api/v1/presentations/upload` (Upload video kèm tiêu đề, ngữ cảnh)
  * `GET /api/v1/presentations/{id}/status` (Tra cứu tiến độ xử lý video 0% - 100%)
  * `GET /api/v1/presentations/{id}/report` (Báo cáo đánh giá chi tiết Radar, Lỗi dòng thời gian, Phản hồi AI)
  * `GET /api/v1/presentations/history` (Danh sách bài thuyết trình thô)

### 2.2. Phân hệ Frontend (React 19 / TypeScript 5.7 / Vite 8)
* **Framework:** React 19, TypeScript, React Router DOM v7.
* **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), phong cách Flat UI tối giản theo [AI_Coach_Frontend_Design_Rules.md](file:///d:/Semester7/PBL6/source/frontend/AI_Coach_Frontend_Design_Rules.md).
* **Quản trị trạng thái:** Context API (`AuthContext`), hiện đang dùng dữ liệu mô phỏng (`src/mocks/mockAuth.ts`).
* **Cổng chạy mặc định:** Cổng `8443` (hoặc biến môi trường `PORT`), máy chủ cấu hình tại [vite.config.ts](file:///d:/Semester7/PBL6/source/frontend/vite.config.ts).
* **Các trang hiện có:**
  * Khách: `/` (LandingPage), `/login` (LoginPage), `/signup` (SignUpPage).
  * Sinh viên: `/dashboard`, `/studio`, `/upload`, `/analyzing`, `/report/:sessionId`, `/history`, `/settings`.
  * Quản trị viên: `/admin/dashboard`, `/admin/users`, `/admin/config`, `/admin/logs`, `/admin/settings`.

---

## 3. BẢNG ĐỐI SOÁT CHI TIẾT (GAP ANALYSIS MATRIX)

| Màn hình Frontend | API Backend hiện có | Tình trạng & Vấn đề tồn đọng | Giải pháp xử lý |
| :--- | :--- | :--- | :--- |
| **Đăng ký (`/signup`)** | `POST /api/v1/auth/register` | Frontend đang hiển thị thông báo "Chức năng chưa khả dụng ở bản Demo", chưa gửi dữ liệu lên Backend. | Ghép nối form đăng ký gọi `POST /api/v1/auth/register`. Sau khi thành công, tự động đăng nhập hoặc chuyển hướng đến `/login`. |
| **Đăng nhập (`/login`)** | `POST /api/v1/auth/login` | 1. Backend dùng `OAuth2PasswordRequestForm` (yêu cầu form-data `username`, `password`).<br>2. Model `User` ở Backend **chưa có trường `role`** (`student` / `admin`).<br>3. Chưa có Seed Data tài khoản mẫu trong CSDL. | 1. Bổ sung cột `role` vào model `User` Backend.<br>2. Hỗ trợ nhận login bằng JSON `{email, password}` hoặc Form-data.<br>3. Thêm Seeder tạo sẵn các tài khoản demo (Sơn, Thắng, Admin).<br>4. Lưu JWT token vào `localStorage` ở Frontend. |
| **Thông tin cá nhân (`/auth/me`)** | `GET /api/v1/auth/me` | `UserResponse` hiện chỉ trả về `id`, `email`, `full_name`, `is_active`, thiếu `role`. | Cập nhật `UserResponse` schema thêm `role: str = "student"` để Frontend phân quyền Route Guards. |
| **Tải video (`/upload`)** | `POST /api/v1/presentations/upload` | Frontend đang dùng `setInterval` đếm phần trăm giả lập, chưa gửi file video thật. | Tạo `FormData` gửi `file`, `title`, `scenario` lên Backend. Nhận về `presentation.id` và chuyển sang trang `/analyzing?id=...`. |
| **Phòng thu (`/studio`)** | `POST /api/v1/presentations/upload` | Frontend chỉ có giao diện camera và kịch bản tĩnh, chưa ghi video thực tế. | Tích hợp `MediaRecorder` API thu luồng Webcam/Mic thành video Blob (`video/webm`), gửi lên endpoint upload khi bấm "Gửi phân tích". |
| **Tiến trình xử lý (`/analyzing`)** | `GET /api/v1/presentations/{id}/status` | Frontend đang đếm random giả lập từ 42% lên 100% rồi tạo mock session mới. | Nhận `presentationId`, thiết lập cơ chế **Polling (mỗi 1.5s)** gọi `GET /api/v1/presentations/{id}/status`. Khi `status === 'COMPLETED'`, điều hướng đến `/report/{id}`. |
| **Báo cáo kết quả (`/report/:id`)** | `GET /api/v1/presentations/{id}/report` | Cấu trúc dữ liệu `DetailedSessionReport` trong Frontend khác với `AnalysisReportResponse` của Backend; chưa phát video thật. | 1. Viết Adapter chuyển đổi schema Backend sang các props biểu đồ.<br>2. Gán `video_url` (`http://localhost:8000/uploads/...`) vào thẻ HTML5 `<video>` để phát video và đồng bộ timeline seek. |
| **Lịch sử (`/history`)** | `GET /api/v1/presentations/history` | Backend chỉ trả về danh sách `Presentation` cơ bản, thiếu điểm số (`total_score`), tốc độ nói (`wpm`), giao tiếp mắt (`eye_contact`). | Nâng cấp endpoint `history` phía Backend: Eager-load bảng `analysis_result` để trả về điểm tổng hợp cho từng bài thuyết trình. |
| **Tổng quan SV (`/dashboard`)** | ❌ **Chưa có** | Backend chưa có endpoint tổng hợp dữ liệu KPI và biểu đồ tiến độ tuần cho sinh viên. | **Viết mới:** `GET /api/v1/presentations/dashboard-stats` (tổng số bài, điểm TB, tổng giờ, chuỗi điểm 4 tuần gần nhất). |
| **Admin KPIs (`/admin/dashboard`)** | ❌ **Chưa có** | Backend chưa có API thống kê hệ thống phục vụ Admin. | **Viết mới:** `GET /api/v1/admin/kpis` (tổng người dùng, tổng phiên, tỉ lệ hoàn thành, biểu đồ hoạt động 7/14 ngày). |
| **Quản lý Users (`/admin/users`)** | ❌ **Chưa có** | Chưa có API xem danh sách sinh viên và thao tác Khóa/Mở khóa. | **Viết mới:**<br>1. `GET /api/v1/admin/users` (hỗ trợ phân trang, tìm kiếm).<br>2. `PATCH /api/v1/admin/users/{user_id}/status` (chuyển đổi `active` / `banned`). |
| **Cấu hình AI (`/admin/config`)** | ❌ **Chưa có** | Chưa có API lấy và cập nhật ngưỡng đánh giá của mô hình AI. | **Viết mới:** `GET` và `PUT /api/v1/admin/config` (ngưỡng mắt, dải WPM lý tưởng, trọng số điểm). |
| **Nhật ký hệ thống (`/admin/logs`)** | ❌ **Chưa có** | Chưa có API xuất nhật ký hoạt động hệ thống. | **Viết mới:** `GET /api/v1/admin/logs` (lấy danh sách system logs, mức độ ERROR/WARN/INFO). |

---

## 4. THIẾT KẾ & ĐẶC TẢ CHI TIẾT CÁC API MỚI (BACKEND)

### 4.1. Nâng cấp Phân hệ Xác thực & Người dùng (Auth & Users)

#### Cập nhật Model & Schema:
* **Model `User` ([backend/app/models/user.py](file:///d:/Semester7/PBL6/source/backend/app/models/user.py)):**
  ```python
  role: Mapped[str] = mapped_column(String(50), default="student", nullable=False) # "student" | "admin"
  avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
  ```
* **Schema `UserResponse` ([backend/app/schemas/auth.py](file:///d:/Semester7/PBL6/source/backend/app/schemas/auth.py)):**
  ```python
  class UserResponse(BaseModel):
      id: int
      email: EmailStr
      full_name: Optional[str] = None
      role: str = "student"
      is_active: bool
      created_at: datetime
  ```

#### Cơ chế Tự động Khởi tạo Dữ liệu (Database Seeder):
Tại sự kiện `lifespan` trong [main.py](file:///d:/Semester7/PBL6/source/backend/app/main.py), nếu bảng `users` trống, tự động nạp các tài khoản:
1. `admin@system.edu.vn` (`Admin@123`, role: `admin`)
2. `son.dang@student.edu.vn` (`Student@123`, role: `student`)
3. `thang.nguyen@student.edu.vn` (`Student@123`, role: `student`)
4. `nhan.vo@student.edu.vn` (`Student@123`, role: `student`, is_active: `False` - tài khoản bị khóa)

---

### 4.2. Nâng cấp & Viết Mới Phân hệ Thuyết trình (Presentations)

#### 1. Nâng cấp `GET /api/v1/presentations/history`
* **Mục đích:** Cung cấp dữ liệu đầy đủ cho [HistoryPage.tsx](file:///d:/Semester7/PBL6/source/frontend/src/HistoryPage.tsx).
* **Chi tiết Response `PresentationHistoryItem`:**
  ```json
  [
    {
      "id": 1,
      "title": "Bảo vệ đồ án tốt nghiệp PBL6",
      "scenario": "ACADEMIC",
      "status": "COMPLETED",
      "duration": "04:32",
      "created_at": "2026-10-25T14:30:00Z",
      "total_score": 87.5,
      "eye_contact_score": 88.0,
      "wpm": 142,
      "filler_words_count": 2
    }
  ]
  ```

#### 2. Viết mới `GET /api/v1/presentations/dashboard-stats`
* **Mục đích:** Cung cấp dữ liệu tổng quan cho [DashboardPage.tsx](file:///d:/Semester7/PBL6/source/frontend/src/DashboardPage.tsx).
* **Xác thực:** Yêu cầu Bearer Token (`current_user`).
* **Chi tiết Response:**
  ```json
  {
    "total_sessions": 12,
    "average_score": 82.4,
    "total_practice_minutes": 54,
    "top_skill": "Giao tiếp mắt",
    "weekly_trends": [
      { "label": "Tuần 1", "score": 68, "sessions": 2 },
      { "label": "Tuần 2", "score": 74, "sessions": 3 },
      { "label": "Tuần 3", "score": 79, "sessions": 4 },
      { "label": "Tuần 4", "score": 85, "sessions": 3 }
    ],
    "recent_sessions": [
      {
        "id": 12,
        "title": "Thuyết trình Đồ án PBL6",
        "date": "24 Th10, 2026",
        "score": 88,
        "eye_contact": 85,
        "wpm": 142
      }
    ]
  }
  ```

---

### 4.3. Thiết kế Mới Module Quản trị viên (Admin API Module)
Tạo file mới: `backend/app/api/v1/endpoints/admin.py`, bảo vệ bằng dependency `require_admin_role`.

#### 1. `GET /api/v1/admin/kpis`
* **Mục đích:** Phục vụ màn hình [AdminDashboardPage.tsx](file:///d:/Semester7/PBL6/source/frontend/src/AdminDashboardPage.tsx).
* **Response:**
  ```json
  {
    "total_users": 150,
    "active_users_today": 34,
    "total_sessions": 528,
    "avg_system_score": 78.6,
    "completion_rate": 96.2,
    "activity_chart": [
      { "date": "19/10", "sessions": 18 },
      { "date": "20/10", "sessions": 24 },
      { "date": "21/10", "sessions": 31 }
    ],
    "scenario_distribution": {
      "ACADEMIC": 60,
      "PITCHING": 25,
      "INTERVIEW": 15
    }
  }
  ```

#### 2. `GET /api/v1/admin/users`
* **Query Params:** `skip: int = 0`, `limit: int = 10`, `search: Optional[str] = None`, `status_filter: Optional[str] = None`.
* **Response:**
  ```json
  {
    "total": 150,
    "items": [
      {
        "id": "usr_102230046",
        "name": "Đặng Quang Sơn",
        "email": "son.dang@student.edu.vn",
        "role": "student",
        "sessions_count": 5,
        "status": "active",
        "created_at": "2026-10-01T08:00:00Z"
      }
    ]
  }
  ```

#### 3. `PATCH /api/v1/admin/users/{user_id}/status`
* **Body:** `{"status": "active" | "banned"}`
* **Thực hiện:** Cập nhật trường `is_active` tương ứng (`True` / `False`) trong bảng `users`.

#### 4. `GET /api/v1/admin/config` & `PUT /api/v1/admin/config`
* **Mục đích:** Quản lý ngưỡng và tham số chấm điểm AI trên [AdminPage.tsx](file:///d:/Semester7/PBL6/source/frontend/src/AdminPage.tsx).
* **Payload cấu hình:**
  ```json
  {
    "min_eye_contact_pct": 70,
    "ideal_wpm_min": 130,
    "ideal_wpm_max": 160,
    "max_filler_words_allowed": 4,
    "weights": {
      "eye_contact": 0.25,
      "speech_rate": 0.25,
      "body_language": 0.20,
      "pitch": 0.15,
      "content": 0.15
    }
  }
  ```

#### 5. `GET /api/v1/admin/logs`
* **Query Params:** `level: Optional[str] = None`, `limit: int = 20`.
* **Mục đích:** Phục vụ [AdminLogsPage.tsx](file:///d:/Semester7/PBL6/source/frontend/src/AdminLogsPage.tsx), trả về danh sách sự kiện xử lý video và lỗi runtime.

---

## 5. KẾ HOẠCH NÂNG CẤP & TÍCH HỢP PHÍA FRONTEND

### 5.1. Chuẩn hóa Base URL & Tầng Dịch Vụ (`src/services/`)
1. Cập nhật `VITE_API_BASE_URL` trong [apiClient.ts](file:///d:/Semester7/PBL6/source/frontend/src/services/apiClient.ts):
   ```typescript
   export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
   ```
2. Phân rã và tạo mới các service file chuyên biệt:
   * `authService.ts`: `login()`, `register()`, `getProfile()`, `logout()`.
   * `presentationService.ts`: `uploadVideo()`, `getStatus()`, `getReport()`, `getHistory()`, `getDashboardStats()`.
   * `adminService.ts`: `getKPIs()`, `getUsers()`, `updateUserStatus()`, `getConfig()`, `updateConfig()`, `getLogs()`.

### 5.2. Nâng cấp `AuthContext.tsx`
* Chuyển các hàm xác thực sang cơ chế `async/await`.
* Khi gọi `login(email, password)`:
  * Gửi yêu cầu đến `POST /api/v1/auth/login`.
  * Nhận `access_token`, lưu vào `localStorage.setItem("auth_token", token)`.
  * Gọi tiếp `GET /api/v1/auth/me` để lấy thông tin chi tiết và `role`.
  * **Cơ chế Graceful Fallback:** Nếu Backend gặp sự cố không kết nối được (Network Error), tự động fallback xác thực qua `mockAuth.ts` để luôn đảm bảo môi trường demo và phát triển giao diện không bị gián đoạn.

### 5.3. Ghép nối luồng Nghiệp vụ Sinh viên
1. **[UploadPage.tsx](file:///d:/Semester7/PBL6/source/frontend/src/UploadPage.tsx):** 
   * Đọc file thực tế từ `inputRef` hoặc kéo thả qua `onDrop`.
   * Tạo `FormData` và gọi `presentationService.uploadVideo(file, title, scenario)`.
   * Nhận `presentation.id`, dùng `navigate(`/analyzing?id=${res.id}`)`.
2. **[StudioPage.tsx](file:///d:/Semester7/PBL6/source/frontend/src/StudioPage.tsx):**
   * Sử dụng Web API `navigator.mediaDevices.getUserMedia({ video: true, audio: true })`.
   * Quản lý trạng thái ghi hình qua `MediaRecorder`.
   * Khi người dùng nhấn *"Dừng & Gửi phân tích"*: Đóng gói các data chunks thành `Blob` (type: `video/webm`), đóng gói thành `File` và gọi API upload.
3. **[AnalyzingPage.tsx](file:///d:/Semester7/PBL6/source/frontend/src/AnalyzingPage.tsx):**
   * Lấy `id` từ URL query parameter (`searchParams.get("id")`).
   * Sử dụng `setInterval` (chu kỳ 1.5s) gọi `presentationService.getStatus(id)`.
   * Đồng bộ giá trị `progress_percentage` của Backend với thanh tiến trình tròn `CircularProgress`.
   * Khi trạng thái chuyển thành `COMPLETED`, tự động điều hướng sang `/report/${id}`.
4. **[ReportPage.tsx](file:///d:/Semester7/PBL6/source/frontend/src/ReportPage.tsx):**
   * Gọi `presentationService.getReport(sessionId)`.
   * Thay thế container video mô phỏng bằng thẻ HTML5:
     ```html
     <video src={`http://localhost:8000${report.video_url}`} controls ... />
     ```
   * Khi người dùng click vào một mốc cảnh báo trên dòng thời gian (Timeline Marker), thực hiện nhảy thời gian phát video:
     ```typescript
     videoRef.current.currentTime = marker.timestamp;
     videoRef.current.play();
     ```
5. **[HistoryPage.tsx](file:///d:/Semester7/PBL6/source/frontend/src/HistoryPage.tsx) & [DashboardPage.tsx](file:///d:/Semester7/PBL6/source/frontend/src/DashboardPage.tsx):**
   * Tải danh sách lịch sử và các chỉ số KPI thật từ Backend, thay thế các biến import tĩnh từ `mockHistory.ts`.

---

## 6. LỘ TRÌNH TRIỂN KHAI THEO GIAI ĐOẠN (SPRINT ROADMAP)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SPRINT 1: Nền tảng Xác thực & Chuẩn hóa Kết nối (ĐÃ HOÀN THÀNH - MERGED)    │
│ • Backend: Bổ sung role vào User Model & Schema; tạo Seeder tài khoản mẫu.  │
│ • Frontend: Chuẩn hóa Base URL; viết authService; nâng cấp AuthContext.     │
│ • Tích hợp & Kiểm thử: Đăng ký (/signup) và Đăng nhập (/login).             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SPRINT 2: Luồng Xử lý Video Cốt lõi (ĐÃ HOÀN THÀNH - READY TO MERGE)        │
│ • DevOps: 4 Containers Docker Compose (DB, Redis, Backend, Nginx Reverse).   │
│ • Backend: API Upload, Background Polling, Report, Pytest test suite.       │
│ • Frontend: UploadPage (FormData thật), StudioPage (Webcam + MediaRecorder).│
│ • Frontend: AnalyzingPage (Polling % AI ngầm), ReportPage (Video Player Sync)│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SPRINT 3: Lịch sử & Thống kê Sinh viên (ĐÃ HOÀN THÀNH - READY TO MERGE)     │
│ • Backend: Nâng cấp GET /presentations/history và viết /dashboard-stats.    │
│ • Frontend: Nối API hiển thị danh sách bài nói tại HistoryPage.             │
│ • Frontend: Nối API biểu đồ xu hướng tuần tại DashboardPage.                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SPRINT 4: Module Quản trị viên (Admin Management) (2 - 3 ngày)              │
│ • Backend: Xây dựng endpoints/admin.py (KPIs, Users, Config, Logs).         │
│ • Frontend: Viết adminService.ts.                                           │
│ • Ghép nối AdminDashboardPage, UsersPage (Ban/Unban), AdminPage, LogsPage.  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SPRINT 5: Kiểm thử Toàn diện & Tối ưu Hóa (1 - 2 ngày)                      │
│ • Chạy kiểm thử End-to-End từ Studio/Upload -> Analyzing -> Report.         │
│ • Xử lý ngoại lệ mạng, file dung lượng lớn và hoàn thiện tài liệu nghiệm thu│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. RỦI RO KỸ THUẬT & GIẢI PHÁP DỰ PHÒNG

| Rủi ro kỹ thuật | Mức độ | Biện pháp phòng ngừa & Xử lý |
| :--- | :---: | :--- |
| **Xung đột CORS giữa Port 8443 (Vite) và Port 8000 (FastAPI)** | Trung bình | File `main.py` của Backend đã cấu hình `allow_origins=["*"]`. Nếu chạy qua Nginx, mọi request từ frontend sẽ đi qua Reverse Proxy thống nhất ở Port 80. |
| **File video dung lượng lớn gây quá tải hoặc đứt kết nối giữa chừng** | Cao | 1. Phía Frontend: Kiểm tra kích thước file trước khi upload (`max 100MB`).<br>2. Phía Backend: Cấu hình `client_max_body_size 100M` trên Nginx và kiểm tra stream size trong `presentations.py`. |
| **Trình duyệt không cấp quyền Webcam / Microphone trên `StudioPage`** | Trung bình | Bắt ngoại lệ `NotAllowedError`, hiển thị banner hướng dẫn người dùng cấp quyền trên thanh địa chỉ trình duyệt, cung cấp nút chuyển hướng sang `UploadPage` như giải pháp thay thế. |
| **Backend hoặc CSDL chưa bật khi kiểm thử giao diện** | Thấp | Toàn bộ các service phía Frontend được thiết kế theo mô hình **Graceful Degradation**: nếu API trả về mã lỗi kết nối mạng (Network Error / 5xx), hệ thống sẽ kích hoạt fallback dữ liệu từ thư mục `mocks/` để không làm gián đoạn trải nghiệm người dùng. |
