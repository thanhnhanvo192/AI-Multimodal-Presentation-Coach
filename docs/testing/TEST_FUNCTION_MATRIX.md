# MA TRẬN PHÂN BỔ CHỨC NĂNG KIỂM THỬ (TEST FUNCTION MATRIX)
## DỰ ÁN: NỀN TẢNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG (AI MULTIMODAL COACH)

---

## 1. BẢNG MA TRẬN PHÂN BỔ 8 CHỨC NĂNG (FUNCTION ALLOCATION MATRIX)

Theo yêu cầu nghiêm ngặt từ Đề cương & Kế hoạch QA PBL6, mỗi loại kiểm thử phụ trách chính xác **2 chức năng nghiệp vụ độc lập**, tuyệt đối **không trùng lặp** giữa 4 loại kiểm thử:

| Testing Type | Function 1 | Function 2 |
| :--- | :--- | :--- |
| **Unit Testing** | **Password Hashing & Bcrypt Verification**<br>*(Mã hóa & Xác minh mật khẩu an toàn)* | **AI Scoring, Badge Allocation & Telemetry Formatting**<br>*(Định mức điểm danh hiệu & Quy đổi dữ liệu AI)* |
| **API Testing** | **Admin System Configuration Management**<br>*(Truy xuất & Cập nhật tham số cấu hình hệ thống)* | **Admin Student Account Status Management**<br>*(Khóa & Mở khóa trạng thái tài khoản sinh viên)* |
| **Web Testing (E2E)** | **User Registration Workflow on Web UI**<br>*(Quy trình người dùng Đăng ký tài khoản trên Web)* | **User Login & Role-Based Navigation Workflow**<br>*(Quy trình Đăng nhập & Điều hướng phân quyền giao diện)* |
| **Performance Testing** | **Student Dashboard Aggregate Analytics**<br>*(Tải xử lý truy vấn thống kê Dashboard người dùng)* | **Admin System KPIs Telemetry Aggregation**<br>*(Tải xử lý tổng hợp chỉ số KPI quản trị toàn trường)* |

---

## 2. CHI TIẾT TỪNG CHỨC NĂNG NGHIỆP VỤ ĐƯỢC CHỌN

### 2.1. UNIT TESTING

#### 🟢 Chức năng 1: Password Hashing & Bcrypt Verification (Mã hóa và xác thực mật khẩu an toàn)
* **Module:** `core.security`
* **Source code location:** `backend/app/core/security.py` (`get_password_hash`, `verify_password`)
* **Lý do lựa chọn:**
  * Đây là hàm xử lý mật mã nền tảng và cốt lõi bảo vệ danh tính của toàn bộ người dùng trong hệ sinh thái.
  * Logic nghiệp vụ thuần túy (pure deterministic utility functions), không phụ thuộc I/O mạng hay cơ sở dữ liệu.
  * Cần kiểm tra kỹ cơ chế cắt ngưỡng 72 bytes của chuẩn Bcrypt, cơ chế tự động sinh muối (salt), và khả năng phòng chống sai lệch dữ liệu.
* **Test scope:**
  * Sinh mã băm từ mật khẩu chuẩn, mật khẩu rỗng, mật khẩu dài vượt quá 72 ký tự Unicode/ASCII.
  * Khớp mật khẩu đúng với chuỗi băm (return `True`).
  * Từ chối mật khẩu sai, mật khẩu rỗng, hash không đúng cấu trúc (return `False` an toàn, không văng unhandled exception).
* **Expected results:** Mọi mật khẩu được mã hóa an toàn, phân biệt hoa/thường, không lưu chuỗi plain text, xác thực chính xác.
* **Cách xác minh chức năng:** Thực thi test cases trong Pytest với các assertions toán học và cryptographic primitives.
* **Vì sao không trùng lặp:** Chức năng này chỉ kiểm tra thuật toán mã hóa mật mã cục bộ ở tầng logic đơn vị. Toàn bộ API đăng nhập/đăng ký được chuyển giao cho Web Testing kiểm tra trên trình duyệt, không thực hiện trong Unit Testing.

---

#### 🟢 Chức năng 2: AI Scoring, Badge Allocation & Telemetry Formatting (Định mức danh hiệu & Chuẩn hóa dữ liệu phân tích AI)
* **Module:** `services.ai_engine_service`
* **Source code location:** `backend/app/services/ai_engine_service.py` (`calculate_badge_title`, `format_ai_result_for_db`, `map_scenario_to_context`)
* **Lý do lựa chọn:**
  * Đây là "bộ não" chuyển đổi kết quả thô từ mô hình máy học (CatBoost/MediaPipe/Whisper) thành cấu trúc dữ liệu hiển thị trên Dashboard.
  * Xử lý các phép toán: tính trung bình WPM, tính độ lệch chuẩn F0 (Pitch variation), ánh xạ mốc lỗi vào Seekbar timeline, phân loại danh hiệu theo ngưỡng điểm (90, 80, 70, 55).
* **Test scope:**
  * Ngưỡng phân hạng danh hiệu: >=90 (Xuất sắc), >=80 (Tự tin), >=70 (Triển vọng), >=55 (Chăm chỉ), <55 (Mới bắt đầu).
  * Quy đổi ngữ cảnh thuyết trình: `ACADEMIC` -> `do_an`, `PITCHING` -> `pitching`, `INTERVIEW` -> `hung_bien`.
  * Chuyển đổi dữ liệu telemetry thô có lỗi sang danh sách `timeline_errors` chuẩn hóa, tính WPM trung bình, phân nhóm độ biến thiên cao độ.
* **Expected results:** Cấu trúc dữ liệu JSON đầu ra khớp 100% với schema `AnalysisResult`, không bị lỗi chia cho 0 khi dữ liệu trống.
* **Cách xác minh chức năng:** Unit tests với các mẫu dữ liệu biên (empty telemetry, max errors, boundary scores) dùng Pytest assertions.
* **Vì sao không trùng lặp:** Chỉ kiểm tra thuật toán ánh xạ và xử lý dữ liệu tính toán tại tầng Service. Không gọi API HTTP, không liên quan tới màn hình đăng nhập hay bảng điều khiển người dùng.

---

### 2.2. API TESTING

#### 🟢 Chức năng 3: Admin System Configuration Management (Quản lý cấu hình ngưỡng đánh giá hệ thống)
* **Module:** `api.v1.endpoints.admin`
* **Source code location:** `backend/app/api/v1/endpoints/admin.py` (Endpoints: `GET /api/v1/admin/config` và `PUT /api/v1/admin/config`)
* **Lý do lựa chọn:**
  * Cho phép Quản trị viên điều chỉnh ngưỡng đánh giá AI (WPM lý tưởng, phần trăm eye contact, từ đệm tối đa) và giới hạn tải rate limit.
  * Có quy tắc phân quyền chặt chẽ (RBAC): Chỉ Admin mới được phép đọc/sửa, sinh viên hoặc người dùng nặc danh bị từ chối.
* **Test scope:**
  * Kiểm tra RBAC: Anonymous truy cập -> `401 Unauthorized`; Sinh viên truy cập -> `403 Forbidden`.
  * Admin truy cập GET -> `200 OK` với cấu hình hiện hành.
  * Admin gửi PUT cập nhật cấu hình mới hợp lệ -> `200 OK` và dữ liệu được áp dụng.
  * Gửi dữ liệu PUT không hợp lệ (sai kiểu dữ liệu) -> `422 Unprocessable Entity`.
* **Expected results:** Cấu hình hệ thống được cập nhật an toàn, kiểm soát truy cập phân quyền tuyệt đối.
* **Cách xác minh chức năng:** Dùng FastAPI `TestClient` / `HTTPX AsyncClient` gửi HTTP requests và verify status code cùng response schema.
* **Vì sao không trùng lặp:** Chỉ kiểm thử giao thức REST API cấu hình hệ thống admin. Chức năng này không được kiểm tra trong Unit, Web hay Performance.

---

#### 🟢 Chức năng 4: Admin Student Account Status Management (Khóa và Mở khóa tài khoản sinh viên)
* **Module:** `api.v1.endpoints.admin`
* **Source code location:** `backend/app/api/v1/endpoints/admin.py` (Endpoint: `PATCH /api/v1/admin/users/{user_id}/status`)
* **Lý do lựa chọn:**
  * Đây là nghiệp vụ an ninh quan trọng giúp ban quản trị kiểm soát các tài khoản vi phạm quy chế hoặc gian lận.
  * Đòi hỏi kiểm tra tính toàn vẹn: Admin không được tự khóa chính mình; tài khoản bị khóa (`banned`) sẽ bị chặn đăng nhập (`403 Forbidden`).
* **Test scope:**
  * Khóa tài khoản sinh viên: Gửi PATCH với `{"status": "banned"}` -> `200 OK`, `is_active` đổi thành `False`.
  * Sau khi bị khóa, gọi API login với tài khoản đó -> trả về `403 Forbidden`.
  * Mở khóa tài khoản: Gửi PATCH với `{"status": "active"}` -> `200 OK`, đăng nhập lại thành công.
  * Biên an toàn: Admin cố tình gửi lệnh tự khóa tài khoản của mình -> trả về `400 Bad Request`.
  * Gửi id sinh viên không tồn tại -> trả về `404 Not Found`.
* **Expected results:** Trạng thái tài khoản chuyển đổi chính xác và có hiệu lực ngay lập tức đối với hệ thống xác thực.
* **Cách xác minh chức năng:** Kiểm thử luồng tích hợp API gồm chuỗi thao tác (tạo user -> ban -> thử login -> unban -> login lại).
* **Vì sao không trùng lặp:** Đây là chức năng quản trị tài khoản qua API endpoint. Khác hoàn toàn với form đăng ký/đăng nhập của người dùng trên Web UI.

---

### 2.3. WEB TESTING (E2E PLAYWRIGHT)

#### 🟢 Chức năng 5: User Registration Workflow on Web UI (Quy trình Đăng ký tài khoản trên Web)
* **Module:** `frontend/src/SignUpPage.tsx`
* **Source code location:** `frontend/src/SignUpPage.tsx` (Route `/signup`)
* **Lý do lựa chọn:**
  * Là điểm chạm đầu tiên của người dùng mới khi tiếp cận hệ thống.
  * Đầy đủ tương tác người dùng: điền họ tên, email, mật khẩu, xác nhận mật khẩu, chọn vai trò (Sinh viên), xử lý lỗi form validation và thông báo phản hồi.
* **Test scope:**
  * Điều hướng đến trang `/signup`.
  * Nhập form hợp lệ và submit: Kiểm tra điều hướng thành công về `/login` hoặc hiển thị thông báo chào mừng.
  * Kiểm tra validation: Bỏ trống trường bắt buộc, nhập email sai định dạng, mật khẩu xác nhận không khớp -> kiểm tra hiển thị lỗi trên UI.
  * Nhập email đã tồn tại trong hệ thống -> hiển thị thông báo lỗi thân thiện trên giao diện.
* **Expected results:** Giao diện phản hồi trực quan, ngăn chặn submit dữ liệu lỗi, hoàn tất đăng ký khi dữ liệu chuẩn.
* **Cách xác minh chức năng:** Kịch bản Playwright tự động mở Chromium, định vị elements bằng `getByRole`, `getByLabel`, `getByText`, nhập liệu và kiểm tra DOM state.
* **Vì sao không trùng lặp:** Được thực hiện độc quyền trên trình duyệt Web (E2E). API backend không thực hiện kiểm thử đăng ký riêng lẻ nhằm tránh trùng lặp nghiệp vụ.

---

#### 🟢 Chức năng 6: User Authentication & Role-Based Navigation on Web UI (Quy trình Đăng nhập và Phân quyền điều hướng)
* **Module:** `frontend/src/LoginPage.tsx` & `frontend/src/App.tsx`
* **Source code location:** `frontend/src/LoginPage.tsx`, `frontend/src/context/AuthContext.tsx` (Route `/login`)
* **Lý do lựa chọn:**
  * Chức năng xương sống điều phối toàn bộ phiên làm việc của người dùng trên Web.
  * Có logic điều hướng phân nhánh theo Role: Sinh viên sau khi đăng nhập thành công vào `/dashboard`, Quản trị viên vào `/admin/dashboard`.
  * Có tính năng phụ trợ UX: Ẩn/hiện mật khẩu (Eye icon toggle), lưu trữ Token vào LocalStorage.
* **Test scope:**
  * Đăng nhập với tài khoản Sinh viên hợp lệ -> chuyển hướng đến trang `/dashboard` (Dashboard sinh viên).
  * Đăng nhập với tài khoản Quản trị viên hợp lệ -> chuyển hướng đến `/admin/dashboard` (Admin dashboard).
  * Nhập sai thông tin đăng nhập -> hiển thị thông báo lỗi đỏ "Email hoặc mật khẩu không chính xác".
  * Thử nghiệm tương tác nút bấm chuyển đổi hiển thị mật khẩu (Show/Hide password toggle).
* **Expected results:** Quá trình đăng nhập mượt mà, phân quyền điều hướng chính xác 100%, lưu trạng thái xác thực.
* **Cách xác minh chức năng:** Kịch bản Playwright E2E mô phỏng hành vi người dùng thật trên trình duyệt Chromium.
* **Vì sao không trùng lặp:** Chức năng đăng nhập này được kiểm thử toàn trình trên giao diện Web UI, hoàn toàn không lặp lại ở Unit Test, API Test hay Performance Test.

---

### 2.4. PERFORMANCE TESTING (LOCUST)

#### 🟢 Chức năng 7: Student Dashboard Aggregate Analytics (Tải xử lý truy vấn thống kê Dashboard người dùng)
* **Module:** `api.v1.endpoints.presentations`
* **Source code location:** `backend/app/api/v1/endpoints/presentations.py` (Endpoint: `GET /api/v1/presentations/dashboard-stats`)
* **Lý do lựa chọn:**
  * Đây là endpoint có cường độ truy vấn và tính toán tổng hợp nặng nhất dành cho người dùng học tập: quét toàn bộ lịch sử các bài thuyết trình, tính điểm trung bình, xếp hạng kỹ năng mạnh nhất, tính toán xu hướng tiến bộ 4 tuần gần nhất.
  * Khi nhiều sinh viên cùng đăng nhập vào đầu giờ học để xem kết quả, endpoint này sẽ chịu tải đồng thời lớn.
* **Test scope:**
  * Kịch bản mô phỏng đồng thời 10, 50, 100 người dùng liên tục truy xuất dữ liệu Dashboard.
  * Đo lường thời gian phản hồi (Response Time), độ trễ (P95, P99), và thông lượng RPS (Requests Per Second).
* **Expected results:** Hệ thống xử lý ổn định, tỷ lệ lỗi 0%, thời gian phản hồi trung bình < 300ms dưới mức tải 50-100 users.
* **Cách xác minh chức năng:** Chạy Locust headless test script thu thập metrics định lượng xuất ra file CSV và Markdown report.
* **Vì sao không trùng lặp:** Chỉ kiểm thử tải hiệu năng trên endpoint Dashboard Stats. Endpoint này không hề xuất hiện trong Unit Test, API Test hay Web Test.

---

#### 🟢 Chức năng 8: Admin System KPIs Telemetry Aggregation (Tải xử lý tổng hợp chỉ số KPI quản trị toàn trường)
* **Module:** `api.v1.endpoints.admin`
* **Source code location:** `backend/app/api/v1/endpoints/admin.py` (Endpoint: `GET /api/v1/admin/kpis`)
* **Lý do lựa chọn:**
  * Đây là truy vấn phức tạp nhất phía quản trị: thực hiện nhiều lệnh đếm `COUNT`, tính `AVG` trên toàn bộ bảng `users`, `presentations`, và `analysis_results`; tổng hợp biểu đồ chuỗi thời gian 7 ngày & 14 ngày, phân bố ngữ cảnh bài nói.
  * Cần đảm bảo khi cán bộ quản trị hoặc ban giám hiệu truy cập dashboard giám sát thì máy chủ cơ sở dữ liệu không bị nghẽn (bottleneck).
* **Test scope:**
  * Kịch bản tải đồng thời 10, 50, 100 phiên truy cập quản trị viên.
  * Phân tích khả năng chịu tải của cơ sở dữ liệu và async worker.
* **Expected results:** Đáp ứng tốt dưới các mức tải đồng thời, đo đạc chính xác RPS, P90, P95, Failure rate.
* **Cách xác minh chức năng:** Kịch bản Locust chuyên biệt giả lập người dùng quản trị viên với JWT token hợp lệ chạy ở chế độ headless.
* **Vì sao không trùng lặp:** Chức năng tổng hợp KPI quản trị chỉ được đo lường hiệu năng chịu tải, không trùng lặp với bất kỳ chức năng nào trong 7 chức năng còn lại.

---

## 3. BẢNG ĐỐI CHIẾU CHỐNG TRÙNG LẶP (NON-DUPLICATION VERIFICATION TABLE)

| Mã CN | Tên chức năng | Loại kiểm thử | Độc lập nghiệp vụ & Lý do không trùng |
| :---: | :--- | :---: | :--- |
| **FN-01** | Password Hashing (Bcrypt) | **Unit Test** | Thuật toán mã hóa mật mã thuần túy trong `security.py`. Không dùng HTTP, không đụng giao diện. |
| **FN-02** | AI Scoring & Formatting | **Unit Test** | Xử lý logic tính điểm danh hiệu & radar JSON trong `ai_engine_service.py`. Không đụng API hay Web. |
| **FN-03** | Admin System Config | **API Test** | Endpoint REST API `GET/PUT /admin/config`. Không kiểm thử ở Unit hay Web hay Perf. |
| **FN-04** | Admin Ban/Unban User | **API Test** | Endpoint REST API `PATCH /admin/users/{id}/status`. Không kiểm thử ở Unit hay Web hay Perf. |
| **FN-05** | Web User Registration | **Web Test** | Form đăng ký người dùng E2E trên trình duyệt `/signup`. Tuyệt đối không viết API hay Unit test riêng cho đăng ký. |
| **FN-06** | Web User Login & RBAC | **Web Test** | Form đăng nhập & điều hướng E2E trên trình duyệt `/login`. Tuyệt đối không viết API hay Unit test riêng cho đăng nhập. |
| **FN-07** | Dashboard Stats Load | **Perf Test** | Đo lường chịu tải và độ trễ endpoint `GET /presentations/dashboard-stats` với 10, 50, 100 users. |
| **FN-08** | Admin KPIs Load | **Perf Test** | Đo lường chịu tải và độ trễ endpoint `GET /admin/kpis` với 10, 50, 100 users. |

> **KẾT LUẬN XÁC MINH:** Toàn bộ 8 chức năng được phân bổ chính xác 100% vào 4 loại kiểm thử, tuân thủ nguyên tắc không trùng lặp nghiệp vụ, khả thi thực thi và đo lường kết quả thực tế trên môi trường đồ án.

