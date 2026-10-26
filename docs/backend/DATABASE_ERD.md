# SƠ ĐỒ CƠ SỞ DỮ LIỆU (DATABASE ERD) - PBL6

Tài liệu thiết kế Cơ sở dữ liệu và Sơ đồ thực thể quan hệ (ERD) phục vụ báo cáo **Sprint 2**.

---

## 1. Sơ đồ Thực thể Quan hệ (Mermaid ERD Diagram)

```mermaid
erDiagram
    USERS ||--o{ PRESENTATIONS : "tạo (1 - N)"
    PRESENTATIONS ||--|| ANALYSIS_RESULTS : "có (1 - 1)"

    USERS {
        int id PK "Khóa chính"
        string email UK "Email đăng nhập (Unique)"
        string hashed_password "Mật khẩu đã băm Bcrypt"
        string full_name "Họ và tên"
        boolean is_active "Trạng thái tài khoản"
        datetime created_at "Ngày tạo"
    }

    PRESENTATIONS {
        int id PK "Khóa chính"
        int user_id FK "Khóa ngoại tham chiếu USERS"
        string title "Tên bài thuyết trình"
        string video_path "Đường dẫn file video (.mp4/.webm)"
        enum scenario "Context Type: ACADEMIC | PITCHING | INTERVIEW"
        enum status "Trạng thái: PENDING | PROCESSING | COMPLETED | FAILED"
        int progress_percentage "Tiến độ xử lý AI (0% -> 100%)"
        string error_message "Lỗi nếu xử lý thất bại"
        datetime created_at "Ngày nộp bài"
    }

    ANALYSIS_RESULTS {
        int id PK "Khóa chính"
        int presentation_id FK,UK "Khóa ngoại tham chiếu PRESENTATIONS (Unique)"
        float total_score "Điểm tổng thể (Thang 100)"
        string badge_title "Danh hiệu AI trao"
        json radar_scores "Điểm 5 cạnh (Eye, Body, WPM, Pitch, Content)"
        json timeline_errors "Danh sách mốc giây bị lỗi để tua video"
        json audio_metrics "Chỉ số WPM, khoảng lặng, từ đệm"
        json transcript "Văn bản bóc băng"
        json ai_feedback "Lời khuyên AI (Điểm mạnh, cần sửa)"
        datetime created_at "Thời gian hoàn thành"
    }
```

---

## 2. Chi tiết các Kiểu Dữ liệu Enum (`context_type` & `status`)

### A. Context Type / Scenario (`PresentationScenario` Enum)
Dùng để thiết lập tiêu chuẩn chấm điểm AI phù hợp với mục đích nói của người dùng:
* `ACADEMIC`: Thuyết trình Đồ án / Học thuật (Yêu cầu phong thái đĩnh đạc, tốc độ 130-150 WPM, rõ ràng).
* `PITCHING`: Pitching Khởi nghiệp / Gọi vốn (Yêu cầu năng lượng cao, nụ cười, cử chỉ tay linh hoạt).
* `INTERVIEW`: Phỏng vấn xin việc (Yêu cầu tập trung ánh mắt, điềm tĩnh, không nói lắp).

### B. Status (`PresentationStatus` Enum)
Quản lý vòng đời xử lý video async:
* `PENDING`: Đã upload file video, chờ vào hàng đợi.
* `PROCESSING`: Đang chạy AI ngầm (Cập nhật tiến độ % theo thời gian thực).
* `COMPLETED`: Đã phân tích xong, sẵn sàng xem trang Dashboard.
* `FAILED`: Xử lý thất bại (file hỏng hoặc ồn quá mức).
