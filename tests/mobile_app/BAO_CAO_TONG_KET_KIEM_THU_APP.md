# BÁO CÁO TỔNG KẾT QUÁ TRÌNH KIỂM THỬ ỨNG DỤNG DI ĐỘNG (MOBILE APP TESTING)
**Dự án:** AI Multimodal Presentation Coach  
**Học phần:** Đồ án Chuyên ngành / Kiểm thử Phần mềm (PBL6)  
**Phân hệ phụ trách:** Kiểm thử Ứng dụng Di động (Mobile App) — 2 Chức năng: **Đăng nhập & Đăng ký**  
**Người thực hiện:** Đặng Quang Sơn  
**Ngày hoàn thành:** 05/11/2026  
**Trạng thái kiểm thử:** **16/16 Test Cases PASSED (100%)** — Thời gian chạy: **3 phút 47 giây**

---

## I. TỔNG QUAN VÀ MỤC TIÊU DỰ ÁN

Trong phạm vi đồ án PBL6, nhóm phát triển hệ thống huấn luyện thuyết trình đa phương thức (AI Coach) bao gồm giao diện Web và ứng dụng di động Android (đóng gói bằng Capacitor/Android Studio). Phân hệ kiểm thử được phân công tập trung vào **2 chức năng cốt lõi**:
1. **Chức năng Đăng nhập (Login):** Đảm bảo sinh viên, giảng viên và quản trị viên có thể xác thực an toàn, xử lý phân quyền tài khoản, tương thích phần cứng và trải nghiệm di động.
2. **Chức năng Đăng ký (Register):** Đảm bảo người dùng mới có thể tạo tài khoản sinh viên, dữ liệu được ghi nhận vào cơ sở dữ liệu Backend thật, kiểm soát chặt chẽ các ràng buộc toàn vẹn dữ liệu và điều khoản sử dụng.

Toàn bộ quá trình kiểm thử được triển khai theo mô hình **End-to-End Automation Testing** thực tế 100%, kết nối trực tiếp giữa **Android Emulator (API 37)** và **Cụm 4 Container Docker Backend & Database**.

---

## II. THIẾT LẬP MÔI TRƯỜNG VÀ CÁC THÁCH THỨC KỸ THUẬT ĐÃ GIẢI QUYẾT

### 1. Cụm Docker Backend & Database
- `pbl6_backend`: FastAPI (Uvicorn) chạy tại cổng `8000`.
- `pbl6_postgres`: PostgreSQL 15 Alpine chạy tại cổng `5432`, database `pbl6_db`, user `pbl6_user`.
- `pbl6_redis`: Redis 7 Alpine chạy tại cổng `6379`.
- `pbl6_nginx`: Reverse Proxy cổng `80`.

### 2. Sửa lỗi kết nối Backend trên môi trường Android (Capacitor)
- **Vấn đề:** Ban đầu khi người dùng đăng ký tài khoản trên app di động, hệ thống báo lỗi *"Không thể kết nối đến máy chủ Backend"*.
- **Nguyên nhân:** Mã nguồn Frontend gọi API tới `http://localhost:8000/api/v1`. Khi chạy trong môi trường WebView trên máy ảo Android, `localhost` trỏ về chính chiếc điện thoại chứ không trỏ về máy tính chủ chứa Docker.
- **Giải pháp:** Cập nhật file `frontend/src/services/apiClient.ts`:
  ```typescript
  import { Capacitor } from '@capacitor/core';
  // Tự động nhận diện nếu chạy trên Android Native thì trỏ về Gateway máy chủ máy ảo 10.0.2.2:8000
  export const API_BASE_URL = Capacitor.isNativePlatform()
    ? 'http://10.0.2.2:8000/api/v1'
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1');
  ```
  Sau đó thực hiện `npm run build`, đồng bộ `npx cap copy android`, biên dịch debug APK bằng Gradle và cài đặt lại vào máy ảo Android.

### 3. Tương thích Android 17 (API 37) & Appium v3.9
- **Vấn đề:** Máy ảo Android 17 mới nhất (`Medium_Phone_API_37.0` / `Pixel 7`) áp dụng cơ chế bảo mật nghiêm ngặt đối với Hidden API Policy và Notification Listener.
- **Giải pháp:** Bổ sung cấu hình tối ưu vào `conftest.py`:
  - `options.set_capability("ignoreHiddenApiPolicyError", True)`
  - Sử dụng Android SDK chính xác tại `AppData\Local\Android\Sdk` (ADB version 37.0.1) thay vì SDK cũ.
  - Loại bỏ các lệnh command statusbar treo trên Android 17.

### 4. Dọn dẹp mã nguồn theo yêu cầu của nhóm
- Xóa bỏ 15 ca kiểm thử cũ của trang Cài đặt / Hồ sơ cá nhân (`test_tc_app_001_004_ui.py`, `test_tc_app_005_008_validation.py`, `test_tc_app_009_011_password.py`, `test_tc_app_012_015_avatar.py`, `pages/settings_page.py`) để tái cấu trúc bộ test tinh gọn, tập trung hoàn toàn vào 2 chức năng Đăng nhập và Đăng ký.

---

## III. KIẾN TRÚC MÃ NGUỒN KIỂM THỬ TỰ ĐỘNG (PAGE OBJECT MODEL)

Bộ mã kiểm thử được thiết kế theo chuẩn công nghiệp **Page Object Model (POM)**:

```
tests/mobile_app/
├── pages/
│   ├── __init__.py
│   ├── base_page.py            # Chứa các phương thức W3C Actions cảm ứng, scroll, wait
│   ├── login_page.py           # Định vị phần tử & hành động màn hình Đăng nhập
│   └── signup_page.py          # Định vị phần tử & hành động màn hình Đăng ký
├── conftest.py                 # Pytest Fixtures, quản lý Appium WebDriver lifecycle
├── pytest.ini                  # Cấu hình markers, xuất báo cáo HTML
├── requirements-test.txt       # Danh sách thư viện phụ thuộc (Appium-Python-Client, pytest, pytest-html)
├── test_login_app_001_008.py   # 8 ca kiểm thử chức năng Đăng nhập
├── test_register_app_009_016.py# 8 ca kiểm thử chức năng Đăng ký
└── BAO_CAO_TONG_KET_KIEM_THU_APP.md # Tài liệu tổng kết này
```

---

## IV. BẢNG CHI TIẾT 16 TEST CASES ĐÃ THỰC THI (CHUẨN 15 CỘT EXCEL)

| Test Case ID | Chức năng / Module | Mô tả ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu đầu vào | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái | Mức độ | Loại kiểm thử | Môi trường | Người thực hiện | Ngày thực hiện | Ghi chú / Bằng chứng |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| **TC_APP_001** | App Mobile - Đăng nhập | Hiển thị màn hình Đăng nhập trên màn hình nhỏ di động (375px) | Ứng dụng đã cài đặt trên Android Emulator | 1. Mở ứng dụng<br>2. Vào màn hình Đăng nhập<br>3. Kiểm tra độ vừa vặn form | Màn hình 375x812 viewport | Các trường Email, Mật khẩu và nút Đăng nhập hiển thị đầy đủ, không tràn viền | Form hiển thị vừa vặn full-width 375px, tìm thấy đủ 2 trường input | **Passed** | Moderate | Mobile UX | Android Emulator API 37 | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_002** | App Mobile - Đăng nhập | Bàn phím ảo tự động đẩy khung nhìn khi nhập mật khẩu | Đang ở màn hình Đăng nhập | 1. Chạm ô nhập Mật khẩu<br>2. Quan sát bàn phím ảo<br>3. Kiểm tra nút Đăng nhập | Input focus: Password | Bàn phím ảo hiển thị, form đẩy lên không che khuất nút Đăng nhập | Bàn phím xuất hiện và nút Đăng nhập vẫn hiển thị trong tầm mắt | **Passed** | Major | Mobile UX | Android Emulator API 37 | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_003** | App Mobile - Đăng nhập | Ẩn/Hiện mật khẩu bằng icon con mắt trên màn hình cảm ứng | Đã nhập mật khẩu vào ô Password | 1. Nhập mật khẩu<br>2. Chạm icon con mắt<br>3. Kiểm tra hiển thị | Password: `Student@123` | Nhấn icon con mắt chuyển đổi giữa dấu chấm tròn (`password`) và ký tự (`text`) | Chạm icon con mắt phản hồi ngay lập tức, mật khẩu chuyển đổi mượt | **Passed** | Low | Mobile UX | Android Emulator API 37 | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_004** | App Mobile - Đăng nhập | Tự động thích ứng giao diện khi xoay màn hình (Portrait <-> Landscape) | Đang ở màn hình Đăng nhập | 1. Xoay thiết bị sang ngang<br>2. Kiểm tra layout<br>3. Xoay dọc lại | Xoay màn hình 90 độ | Giao diện tự động co giãn theo chiều ngang/dọc, không bị crash ứng dụng | Giao diện thích ứng tốt, form đăng nhập hiển thị đầy đủ sau khi xoay | **Passed** | Moderate | Mobile UX | Android Emulator API 37 | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_005** | App Mobile - Đăng nhập | Đăng nhập thành công với tài khoản Sinh viên hợp lệ (Happy Path) | Backend Docker và DB Postgres đang chạy | 1. Chọn tài khoản Student (Sơn)<br>2. Bấm "Đăng nhập"<br>3. Kiểm tra điều hướng | Email: `son.dang@student.edu.vn`<br>Pass: `Student@123` | Backend Docker trả về JWT token, ứng dụng chuyển hướng vào Dashboard | Đăng nhập thành công, token được lưu và app chuyển sang Dashboard | **Passed** | Critical | Functional / Auth | Android Emulator API 37, Docker Backend | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_006** | App Mobile - Đăng nhập | Đăng nhập thất bại khi nhập sai mật khẩu | Backend Docker đang chạy | 1. Nhập email hợp lệ<br>2. Nhập mật khẩu sai<br>3. Bấm "Đăng nhập" | Email: `son.dang@student.edu.vn`<br>Pass: `SaiMatKhau@999` | Ứng dụng hiển thị thông báo lỗi "Email hoặc mật khẩu không chính xác" | Hiển thị cảnh báo lỗi đăng nhập thất bại chính xác, không cho vào Dashboard | **Passed** | Critical | Security / Auth | Android Emulator API 37, Docker Backend | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_007** | App Mobile - Đăng nhập | Đăng nhập thất bại với tài khoản bị khóa (Banned Account) | Tài khoản đã bị khóa trong PostgreSQL (`is_active=False`) | 1. Chọn preset tài khoản khóa<br>2. Bấm "Đăng nhập"<br>3. Quan sát thông báo | Email: `nhan.vo@student.edu.vn`<br>Pass: `Student@123` | Cảnh báo: "Tài khoản của bạn đã bị khóa hoặc tạm dừng hoạt động." | Backend trả về mã lỗi 403, app hiển thị cảnh báo tài khoản bị khóa | **Passed** | High | Security / Auth | Android Emulator API 37, Docker Backend | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_008** | App Mobile - Đăng nhập | Bỏ trống trường Email hoặc Mật khẩu khi bấm Đăng nhập | Đang ở màn hình Đăng nhập | 1. Để trống Email và Password<br>2. Bấm nút "Đăng nhập"<br>3. Quan sát phản hồi | Email: `""`<br>Password: `""` | Form chặn gửi request lên server, hiển thị nhắc nhở nhập liệu bắt buộc | Form client-side chặn submit, không điều hướng, giữ nguyên màn hình đăng nhập | **Passed** | Major | Validation | Android Emulator API 37 | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_009** | App Mobile - Đăng ký | Chuyển hướng linh hoạt giữa màn hình Đăng nhập và Đăng ký | Đang ở màn hình Đăng ký | 1. Bấm "Đăng nhập"<br>2. Kiểm tra màn hình Login<br>3. Bấm "Đăng ký ngay" để quay lại | Hành động chạm liên kết điều hướng | Chuyển đổi giữa 2 màn hình mượt mà, form hiển thị đầy đủ | Điều hướng qua lại giữa Login và Register hoàn hảo, form tải đúng | **Passed** | Moderate | Mobile UX | Android Emulator API 37 | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_010** | App Mobile - Đăng ký | Thao tác vuốt cuộn màn hình (Touch Scroll) xem trọn vẹn Form Đăng ký | Đang ở màn hình Đăng ký | 1. Dùng ngón tay vuốt lên (cuộn xuống cuối form)<br>2. Vuốt xuống (cuộn lên đầu form) | Thao tác vuốt cảm ứng (W3C Swipe) | Form cuộn mượt mà, không bị khựng hoặc kéo nhầm thanh thông báo Android | Thao tác cuộn cảm ứng W3C mượt mà cả 2 chiều, các trường hiển thị rõ | **Passed** | Low | Mobile UX | Android Emulator API 37 | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_011** | App Mobile - Đăng ký | Bàn phím ảo không che khuất nút "Đăng ký tài khoản" khi nhập Xác nhận MK | Đang ở màn hình Đăng ký | 1. Chạm ô Xác nhận mật khẩu<br>2. Quan sát bàn phím ảo<br>3. Kiểm tra nút Đăng ký | Focus: Confirm Password | Nút "Đăng ký tài khoản" tự động cuộn lên trên bàn phím ảo | Bàn phím ảo xuất hiện và nút Đăng ký tài khoản vẫn hiển thị bấm được | **Passed** | Major | Mobile UX | Android Emulator API 37 | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_012** | App Mobile - Đăng ký | Tương tác bật/tắt Checkbox "Đồng ý Điều khoản" bằng cảm ứng | Đang ở màn hình Đăng ký | 1. Nhập đủ thông tin<br>2. Chạm Checkbox để bỏ chọn<br>3. Kiểm tra trạng thái nút Đăng ký | Checkbox: `unchecked` | Nút "Đăng ký tài khoản" bị vô hiệu hóa (disabled) hoặc báo lỗi yêu cầu đồng ý | Checkbox bỏ chọn thành công, nút Đăng ký tài khoản bị mờ và disabled | **Passed** | Major | Functional / Validation | Android Emulator API 37 | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_013** | App Mobile - Đăng ký | Đăng ký thành công tài khoản Sinh viên mới (Lưu vào Database) | Backend Docker & Postgres đang chạy | 1. Nhập họ tên, email mới, mật khẩu<br>2. Tích đồng ý điều khoản<br>3. Bấm "Đăng ký tài khoản" | Email: `student_timestamp@student.edu.vn`<br>Pass: `Sinhvien@2026` | Backend tạo tài khoản mới trong bảng `users` với role `student`, hiển thị thành công | Gửi request thành công lên Backend, dữ liệu hợp lệ và app xác nhận | **Passed** | Critical | Functional / Database | Android Emulator API 37, Docker Backend | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_014** | App Mobile - Đăng ký | Đăng ký thất bại khi Email đã tồn tại trong Database | Email đã có sẵn trong bảng `users` Postgres | 1. Nhập email đã tồn tại (`son.dang@student.edu.vn`)<br>2. Nhập mật khẩu hợp lệ<br>3. Bấm "Đăng ký tài khoản" | Email: `son.dang@student.edu.vn`<br>Pass: `Student@123` | Backend trả về lỗi 400 và app hiển thị cảnh báo "Email này đã được sử dụng" | Form nhận mã lỗi từ server và hiển thị banner cảnh báo email đã được sử dụng | **Passed** | High | Validation / Database | Android Emulator API 37, Docker Backend | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_015** | App Mobile - Đăng ký | Đăng ký thất bại khi Mật khẩu xác nhận không khớp | Đang ở màn hình Đăng ký | 1. Nhập thông tin đầy đủ<br>2. Nhập Mật khẩu A, Xác nhận mật khẩu B khác nhau<br>3. Bấm Đăng ký | Pass: `MatkhauA@123`<br>Confirm: `MatkhauB@456` | Hiển thị thông báo: "Mật khẩu xác nhận không khớp." và chặn gửi request | Form hiển thị banner màu đỏ "Mật khẩu xác nhận không khớp." ngay giữa màn hình | **Passed** | Major | Validation | Android Emulator API 37 | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |
| **TC_APP_016** | App Mobile - Đăng ký | Ràng buộc độ dài Mật khẩu tối thiểu (< 8 ký tự) hoặc bỏ trống Họ tên | Đang ở màn hình Đăng ký | 1. Bỏ trống Họ tên<br>2. Nhập mật khẩu ngắn 3 ký tự<br>3. Bấm "Đăng ký tài khoản" | Họ tên: `""`<br>Pass: `123` | Form hiển thị cảnh báo yêu cầu nhập họ tên hoặc mật khẩu tối thiểu 8 ký tự | Form client-side ngăn chặn submit, giữ nguyên dữ liệu trên màn hình đăng ký | **Passed** | Major | Validation | Android Emulator API 37 | Đặng Quang Sơn | 05/11/2026 | `reports/mobile_test_report.html` |

---

## V. NHẬN XÉT ĐÁNH GIÁ VÀ BÀI HỌC KINH NGHIỆM

1. **Về tính độc lập giữa các ca kiểm thử (Test Independence):**
   - Trong quá trình kiểm thử mobile với `no_reset = True`, nếu một test case thay đổi trạng thái của UI (ví dụ bỏ tích Checkbox điều khoản ở `TC_APP_012`), trạng thái đó sẽ lưu lại trong RAM của WebView và ảnh hưởng đến các ca sau. Do đó, kịch bản phải luôn có bước khôi phục trạng thái (`cleanup` / `teardown`) ngay sau khi hoàn thành assertion.
2. **Về độ vừa vặn của Form trên màn hình di động:**
   - Trên các màn hình điện thoại tỷ lệ 20:9 (độ phân giải 1080x2400 như máy ảo Medium Phone / Pixel 7), form đăng ký nằm vừa vặn trọn vẹn trong màn hình. Việc thực hiện các thao tác vuốt cuộn không cần thiết sẽ làm khung nhìn bị rung lắc hoặc trượt khỏi vị trí của thông báo lỗi. Khi loại bỏ thao tác cuộn thừa, tốc độ chạy test đã tăng gấp đôi và độ tin cậy đạt 100%.
3. **Về kết nối mạng Android Emulator:**
   - Ứng dụng Hybrid (Capacitor/Cordova) khi chạy trong WebView cần cơ chế nhận diện tự động (`Capacitor.isNativePlatform()`) để trỏ đến `10.0.2.2:8000` thay vì `localhost:8000`, giúp đồng bộ mượt mà với Backend Docker.

---

## VI. HƯỚNG DẪN TÁI HIỆN VÀ CHẠY KIỂM THỬ

Để chạy lại bộ kiểm thử tự động bất kỳ lúc nào:

```powershell
# 1. Đảm bảo 4 Docker container đang chạy
docker ps

# 2. Bật máy ảo Android (Pixel 7 hoặc Medium Phone API 37) từ Android Studio

# 3. Kích hoạt Appium Server
$env:ANDROID_HOME = "C:\Users\Admin\AppData\Local\Android\Sdk"
appium --address 127.0.0.1 --port 4723 --allow-cors

# 4. Thực thi bộ kiểm thử và xuất báo cáo HTML
cd AI-Multimodal-Presentation-Coach
pytest tests/mobile_app/test_login_app_001_008.py tests/mobile_app/test_register_app_009_016.py -v --html=reports/mobile_test_report.html --self-contained-html
```
File báo cáo sẽ được cập nhật trực tiếp tại: `reports/mobile_test_report.html`.
