# TÀI LIỆU ĐẶC TẢ CHI TIẾT CÁC CA KIỂM THỬ (TEST CASE SPECIFICATIONS)
## DỰ ÁN: NỀN TẢNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG (AI MULTIMODAL PRESENTATION COACH)

---

## 1. TỔNG QUAN HỆ THỐNG KIỂM THỬ

Hệ thống kiểm thử tự động được thiết kế và triển khai với **4 loại kiểm thử độc lập**, tương ứng với **8 chức năng nghiệp vụ không trùng lặp**:

- **Nhóm 1: Unit Testing (22 Test Cases)**
  - Chức năng 1: Mã hóa và Xác thực Mật khẩu Người dùng (`Password Hashing & Bcrypt Verification`)
  - Chức năng 2: Chấm điểm AI, Xếp loại Huy hiệu và Định dạng Telemetry (`AI Scoring, Badge Allocation & Telemetry Formatting`)
- **Nhóm 2: API Testing (10 Test Cases)**
  - Chức năng 3: Quản lý Cấu hình Tham số Hệ thống Admin (`Admin System Configuration API`)
  - Chức năng 4: Quản trị Trạng thái và Khóa/Mở khóa Tài khoản Người dùng (`Admin User Status Management API`)
- **Nhóm 3: Web Testing - E2E (9 Test Cases)**
  - Chức năng 5: Luồng Nghiệp vụ Đăng ký Tài khoản Sinh viên Mới trên Giao diện Web (`Web User Registration Workflow`)
  - Chức năng 6: Luồng Nghiệp vụ Đăng nhập và Phân quyền Điều hướng RBAC trên Giao diện Web (`Web User Login & RBAC Navigation Workflow`)
- **Nhóm 4: Performance Testing (2 Scenarios - 50 Concurrent Users)**
  - Chức năng 7: Kiểm thử Tải Endpoint Thống kê Dashboard Sinh viên (`Student Dashboard Stats Load Test`)
  - Chức năng 8: Kiểm thử Tải Endpoint Tổng hợp Chỉ số KPI Quản trị Admin (`Admin System KPIs Aggregation Load Test`)

---

## 2. CHI TIẾT CÁC CA KIỂM THỬ ĐƠN VỊ (UNIT TESTING - 22 TEST CASES)

### 2.1. Chức năng 1: Password Hashing & Verification Logic
- **File thực thi:** `backend/tests/unit/test_password_hashing.py`
- **Module kiểm thử:** `app.core.security` (`get_password_hash`, `verify_password`)

| Test ID | Tên Ca Kiểm Thử | Dữ liệu Đầu Vào | Điều Kiện Kiểm Tra | Kết Quả Kỳ Vọng | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `UT-SEC-01` | `test_hash_password_produces_bcrypt_hash` | Password chuẩn (`"StrongP@ssw0rd!"`) | Kiểm tra tiền tố và độ dài chuỗi mã hóa | Chuỗi hash bắt đầu bằng `$2b$`, độ dài >= 59 ký tự | **PASS** |
| `UT-SEC-02` | `test_hash_password_different_salts` | Cùng mật khẩu `"MySecret123"` băm 2 lần | So sánh chuỗi hash | Hai chuỗi hash hoàn toàn khác nhau do salt ngẫu nhiên | **PASS** |
| `UT-SEC-03` | `test_verify_password_success` | Mật khẩu đúng (`"ValidPassword99"`) | Xác thực với hash tương ứng | Trả về `True` | **PASS** |
| `UT-SEC-04` | `test_verify_password_wrong_password` | Mật khẩu sai (`"WrongPassword"`) | Xác thực với hash của mật khẩu khác | Trả về `False` | **PASS** |
| `UT-SEC-05` | `test_verify_password_empty_against_valid_hash` | Chuỗi rỗng `""` | Xác thực với hash hợp lệ | Trả về `False` | **PASS** |
| `UT-SEC-06` | `test_hash_password_empty_string` | Chuỗi rỗng `""` | Tạo hash cho chuỗi rỗng | Tạo thành công hash bcrypt hợp lệ | **PASS** |
| `UT-SEC-07` | `test_hash_password_long_string` | Mật khẩu dài 72 ký tự (giới hạn Bcrypt) | Tạo hash và verify | Hash thành công và verify trả về `True` | **PASS** |
| `UT-SEC-08` | `test_hash_password_unicode_characters` | Mật khẩu tiếng Việt (`"ThuyếtTrìnhĐỉnhCao@2026! 🚀"`) | Tạo hash và verify UTF-8 | Hash và verify chính xác `True` | **PASS** |
| `UT-SEC-09` | `test_hash_password_case_sensitivity` | `"Password123"` vs `"password123"` | So khớp chữ hoa - chữ thường | Trả về `False` | **PASS** |
| `UT-SEC-10` | `test_verify_password_malformed_hash` | Hash hỏng (`"not-a-valid-bcrypt-hash"`) | Kiểm tra exception handling | Bắt `ValueError` hoặc trả về `False`, không crash | **PASS** |

### 2.2. Chức năng 2: AI Scoring, Badge Allocation & Telemetry Formatting
- **File thực thi:** `backend/tests/unit/test_ai_scoring_formatting.py`
- **Module kiểm thử:** `app.services.ai_scoring_engine`

| Test ID | Tên Ca Kiểm Thử | Dữ liệu Đầu Vào | Điều Kiện Kiểm Tra | Kết Quả Kỳ Vọng | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `UT-AIS-01` | `test_calculate_overall_score_balanced_weights` | Component scores (80, 85, 90, 75) | Tính điểm trung bình trọng số | Điểm tổng hợp chính xác theo trọng số chuẩn | **PASS** |
| `UT-AIS-02` | `test_calculate_overall_score_clamping_upper` | Điểm vượt trần (> 100) | Kiểm tra cơ chế giới hạn | Điểm tổng hợp bị kẹp tối đa 100.0 | **PASS** |
| `UT-AIS-03` | `test_calculate_overall_score_clamping_lower` | Điểm âm (< 0) | Kiểm tra kẹp biên dưới | Điểm tổng hợp bị kẹp tối thiểu 0.0 | **PASS** |
| `UT-AIS-04` | `test_determine_badge_tier_master` | Điểm >= 90.0 | Phân bổ danh hiệu | Trả về `"Master Speaker"` / `"Xuất sắc"` | **PASS** |
| `UT-AIS-05` | `test_determine_badge_tier_proficient` | Điểm 80.0 - 89.9 | Phân bổ danh hiệu | Trả về `"Proficient Speaker"` / `"Giỏi"` | **PASS** |
| `UT-AIS-06` | `test_determine_badge_tier_developing` | Điểm 65.0 - 79.9 | Phân bổ danh hiệu | Trả về `"Developing Speaker"` / `"Khá"` | **PASS** |
| `UT-AIS-07` | `test_determine_badge_tier_novice` | Điểm < 65.0 | Phân bổ danh hiệu | Trả về `"Novice Speaker"` / `"Cần rèn luyện"` | **PASS** |
| `UT-AIS-08` | `test_badge_tier_boundary_conditions` | Điểm tại biên 89.99, 90.00, 64.99, 65.00 | Xử lý dấu đẳng thức tại biên | Phân chia chính xác bậc xếp loại tại ranh giới | **PASS** |
| `UT-AIS-09` | `test_format_multimodal_telemetry_valid` | Mảng tọa độ và chỉ số âm lượng thô | Chuẩn hóa cấu trúc telemetry JSON | Format đúng schema, làm tròn 2 chữ số thập phân | **PASS** |
| `UT-AIS-10` | `test_format_multimodal_telemetry_empty` | Mảng dữ liệu cảm biến rỗng | Xử lý ngoại lệ đầu vào rỗng | Trả về cấu trúc mặc định an toàn, không throw | **PASS** |
| `UT-AIS-11` | `test_format_multimodal_telemetry_nan_inf` | Chứa giá trị `NaN`, `Inf` | Lọc dữ liệu lỗi toán học | Thay thế bằng 0.0 an toàn | **PASS** |
| `UT-AIS-12` | `test_invalid_component_scores_handling` | Cấu trúc điểm thiếu trường | Kiểm tra kiểm soát kiểu dữ liệu | Phát hiện lỗi và áp dụng điểm fallback hợp lệ | **PASS** |

---

## 3. CHI TIẾT CÁC CA KIỂM THỬ API (API TESTING - 10 TEST CASES)

### 3.1. Chức năng 3: Admin System Configuration API
- **File thực thi:** `backend/tests/api/test_admin_config.py`
- **Endpoints:** `GET /admin/config`, `PUT /admin/config`

| Test ID | Tên Ca Kiểm Thử | Điều Kiện & Headers | Payload | Kết Quả Kỳ Vọng | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `API-CFG-01` | `test_get_admin_config_as_admin` | Token Admin hợp lệ | Không | HTTP 200, trả về danh sách config hệ thống | **PASS** |
| `API-CFG-02` | `test_get_admin_config_unauthorized` | Không truyền Bearer Token | Không | HTTP 401 Unauthorized | **PASS** |
| `API-CFG-03` | `test_get_admin_config_forbidden_for_student` | Token Sinh viên | Không | HTTP 403 Forbidden | **PASS** |
| `API-CFG-04` | `test_update_admin_config_success` | Token Admin | Update keys: `{"max_video_size_mb": 200}` | HTTP 200, giá trị mới được lưu | **PASS** |
| `API-CFG-05` | `test_update_admin_config_invalid_data` | Token Admin | Payload sai cấu trúc schema | HTTP 422 Unprocessable Entity | **PASS** |

### 3.2. Chức năng 4: Admin User Status Management API
- **File thực thi:** `backend/tests/api/test_admin_user_status.py`
- **Endpoint:** `PATCH /admin/users/{user_id}/status`

| Test ID | Tên Ca Kiểm Thử | Điều Kiện & Headers | Payload / URL Params | Kết Quả Kỳ Vọng | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `API-USR-01` | `test_admin_can_deactivate_student` | Token Admin | `user_id = student_id`, `{"is_active": false}` | HTTP 200, user status chuyển sang inactive | **PASS** |
| `API-USR-02` | `test_admin_can_reactivate_student` | Token Admin | `user_id = student_id`, `{"is_active": true}` | HTTP 200, user status trở lại active | **PASS** |
| `API-USR-03` | `test_student_cannot_change_user_status` | Token Sinh viên | Cố gắng gọi PATCH đổi status user khác | HTTP 403 Forbidden | **PASS** |
| `API-USR-04` | `test_cannot_deactivate_nonexistent_user` | Token Admin | `user_id = 999999` (ID không tồn tại) | HTTP 404 Not Found | **PASS** |
| `API-USR-05` | `test_admin_cannot_deactivate_self` | Token Admin | `user_id = admin_own_id`, `{"is_active": false}` | HTTP 400 Bad Request (Ngăn admin tự khóa mình) | **PASS** |

---

## 4. CHI TIẾT CÁC CA KIỂM THỬ WEB E2E (WEB TESTING - 9 TEST CASES)

### 4.1. Chức năng 5: Web User Registration Workflow
- **File thực thi:** `frontend/e2e/user_registration.spec.ts`
- **Route:** `/signup` | **Browser Engine:** Chromium Headless

| Test ID | Tên Ca Kiểm Thử | Thao Tác Giao Diện Người Dùng | Assertions Giao Diện | Trạng Thái |
| :--- | :--- | :--- | :--- | :---: |
| `WEB-REG-01` | `should display registration page elements properly` | Truy cập `/signup` | Hiển thị đầy đủ logo, các trường Họ tên, Email, Mật khẩu, Xác nhận, Checkbox điều khoản | **PASS** |
| `WEB-REG-02` | `should validate required fields and prevent empty submission` | Để trống các ô và nhấn Đăng ký | Nút Đăng ký bị disabled hoặc hiển thị validation message đỏ | **PASS** |
| `WEB-REG-03` | `should show error when passwords do not match` | Nhập pass 1 khác pass 2 | Bắt lỗi mismatch mật khẩu ngay trên form | **PASS** |
| `WEB-REG-04` | `should prevent submission when terms agreement is unchecked` | Điền thông tin nhưng bỏ tick điều khoản | Nút Đăng ký ở trạng thái `disabled`, không thể click gửi | **PASS** |
| `WEB-REG-05` | `should successfully register a new user with valid data` | Nhập email ngẫu nhiên hợp lệ và submit | Hiển thị thông báo thành công / chuyển hướng sang `/login` | **PASS** |

### 4.2. Chức năng 6: Web User Login & RBAC Workflow
- **File thực thi:** `frontend/e2e/user_login_rbac.spec.ts`
- **Route:** `/login` | **Browser Engine:** Chromium Headless

| Test ID | Tên Ca Kiểm Thử | Thao Tác Giao Diện Người Dùng | Assertions Giao Diện | Trạng Thái |
| :--- | :--- | :--- | :--- | :---: |
| `WEB-LOG-01` | `should display login form with all components` | Truy cập `/login` | Hiển thị đầy đủ form đăng nhập, ô email, mật khẩu, nút đăng nhập | **PASS** |
| `WEB-LOG-02` | `should show error on invalid credentials` | Nhập sai mật khẩu (`wrongpass123`) | Toast/Alert lỗi hiển thị "Email hoặc mật khẩu không chính xác" | **PASS** |
| `WEB-LOG-03` | `should authenticate student and navigate to student dashboard` | Đăng nhập tài khoản Sinh viên | Token lưu `localStorage`, URL chuyển `/dashboard`, thấy tên sinh viên | **PASS** |
| `WEB-LOG-04` | `should authenticate admin and navigate to admin portal` | Đăng nhập tài khoản Admin | `auth_user.role === 'admin'`, tiêu đề `Bảng điều khiển Quản trị` | **PASS** |

---

## 5. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ HIỆU NĂNG (PERFORMANCE TESTING - 2 SCENARIOS)

- **File thực thi:** `backend/performance/locust_dashboard_stats.py` & `backend/performance/locust_admin_kpis.py`
- **Công cụ:** Locust 2.47 Headless
- **Tải đồng thời:** 50 Virtual Users | **Spawn Rate:** 5 users/second

| Scenario ID | Endpoint Kiểm Thử | Số Users Đồng Thời | Thời Gian Chạy | Tổng Số Requests | RPS Đạt Được | Tỷ Lệ Lỗi (Failure Rate) | Trạng Thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `PERF-01` | `GET /presentations/dashboard-stats` | 50 Users | 15s | **772 requests** | **54.85 req/s** | **0.0% (0 lỗi)** | **PASS** |
| `PERF-02` | `GET /admin/kpis` | 50 Users | 15s | **305 requests** | **21.71 req/s** | **0.0% (0 lỗi)** | **PASS** |

---

## 6. KẾT LUẬN VÀ MINH CHỨNG NGHIỆM THU
Tất cả **41 ca kiểm thử** và **2 kịch bản tải lớn** đã được chạy tự động trên môi trường thật, độc lập với cơ sở dữ liệu production, và đều vượt qua 100% với mã thoát thành công (Exit Code 0).

