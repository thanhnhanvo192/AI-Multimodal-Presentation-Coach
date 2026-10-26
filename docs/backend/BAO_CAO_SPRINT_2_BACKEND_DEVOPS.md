# BÁO CÁO KẾT QUẢ THỰC HIỆN SPRINT 2
## DỰ ÁN PBL6: NỀN TẢNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG (AI MULTIMODAL)

---

**Thông tin chung:**
* **Môn học / Đề tài:** Đồ án chuyên ngành PBL6 (Hệ thống AI Đánh giá Thuyết trình)
* **Giảng viên hướng dẫn:** TS. Võ Đức Hoàng
* **Người thực hiện:** Võ Thành Nhân (Backend Lead & Quản trị mạng / DevOps)
* **Thời gian hoàn thành:** Sprint 2 (Tháng 09/2026)

---

## 1. MỤC TIÊU SPRINT 2 & VAI TRÒ ĐẢM NHẬN

Trong giai đoạn Sprint 2, thành viên **Võ Thành Nhân** đảm nhận vai trò **Backend Lead & Quản trị mạng / DevOps** với mục tiêu xây dựng toàn bộ hạ tầng kỹ thuật, đóng gói môi trường Docker Compose, thiết kế Cơ sở dữ liệu và dựng khung hệ thống Web API phục vụ xử lý bất đồng bộ (Async Background Processing).

---

## 2. KẾT QUẢ CÁC CÔNG VIỆC ĐÃ HOÀN THÀNH

### 2.1. Đóng gói Hạ tầng Docker Compose & Cấu hình Nginx (DevOps & Quản trị mạng)
* **Đóng gói hệ thống gồm 4 máy chủ container:**
  * **Database Server (`db`):** Chạy PostgreSQL 15 Alpine với cơ chế lưu trữ dữ liệu bền vững (Persistent Volume).
  * **Cache & Queue Server (`redis`):** Chạy Redis 7 Alpine làm hàng đợi tác vụ xử lý ngầm.
  * **Backend API Server (`backend`):** Ứng dụng FastAPI chạy trên môi trường Python 3.10-slim.
  * **Reverse Proxy Server (`nginx`):** Nginx đón truy cập cổng 80, chuyển tiếp kết quả và bảo mật server.
* **Ứng dụng tiêu chuẩn môn Quản trị mạng trên Nginx:**
  * **Rate Limiting:** Cấu hình giới hạn tối đa 5 lượt upload video trong 10 phút/IP (`rate=5r/m`) nhằm chống lại tấn công từ chối dịch vụ (DoS/Spam upload).
  * **Body Size Limit:** Giới hạn dung lượng tải file tối đa `client_max_body_size 100M` bảo vệ RAM server.

### 2.2. Xây dựng Bộ khung Mã nguồn Backend & API (FastAPI Framework)
* **Xây dựng mã nguồn Backend theo kiến trúc Clean Modular Architecture:**
  * **Authentication APIs (`/api/v1/auth`):** Hoàn thiện các API `/register`, `/login` và `/me`. Mật khẩu được mã hóa băm Bcrypt, xác thực qua chuẩn JWT Access Token (HS256).
  * **Presentation APIs (`/api/v1/presentations`):** Xây dựng các API `/upload` (tiếp nhận file `.mp4`/`.webm`), `/{id}/status` (trả về % tiến độ 0% $\rightarrow$ 100%), `/{id}/report` (trả về JSON biểu đồ Radar & Timeline errors) và `/history`.
  * **Async Background Processing (`video_processor.py`):** Giải phóng HTTP response ngay lập tức trong 0.5s sau khi upload file, đưa tiến trình phân tích AI vào xử lý ngầm mà không làm treo ứng dụng.

### 2.3. Thiết kế Cơ sở dữ liệu ERD & Tích hợp Context Type (Presentation Scenario)
* **Thiết kế thực thể CSDL (Users, Presentations, AnalysisResults) & ORM Models với Async SQLAlchemy.**
* **Tích hợp Enum `context_type` (`PresentationScenario`) với 3 ngữ cảnh thuyết trình thực tế:**
  * `ACADEMIC`: Thuyết trình Đồ án / Học thuật (Tiêu chuẩn phong thái đĩnh đạc, tốc độ 130-150 WPM).
  * `PITCHING`: Pitching Khởi nghiệp / Gọi vốn (Yêu cầu năng lượng cao, cử chỉ tay linh hoạt).
  * `INTERVIEW`: Phỏng vấn xin việc (Yêu cầu tập trung ánh mắt, điềm tĩnh).

### 2.4. Repository GitHub & Unit Tests (Software Testing)
* **Cấu hình `.gitignore`:** Loại bỏ file rác, biến môi trường nhạy cảm và ổ lưu trữ video khỏi Git Repository.
* **Unit Testing (`pytest`):** Viết bộ kiểm thử tự động `test_health.py` và `test_auth.py` kiểm tra độ chính xác của các đường dẫn API.

---

## 3. TỔNG KẾT VÀ KẾ HẠCH SPRINT 3

Tất cả các mục tiêu của Sprint 2 đã được hoàn thành đúng tiến độ và kiểm thử chạy ổn định. Trong Sprint 3 tiếp theo, phân hệ Backend sẽ tiến hành phối hợp với thành viên **Nguyễn Đỗ Thắng** (AI Lead) để nhúng pipeline mô hình AI (MediaPipe, Librosa, Whisper, ONNX Model) vào Background Worker, đồng thời phối hợp với thành viên **Đặng Quang Sơn** (Frontend Lead) để hoàn thiện kết nối toàn trình (End-to-End).
