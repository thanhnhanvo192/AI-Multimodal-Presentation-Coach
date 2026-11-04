# KẾ HOẠCH TRIỂN KHAI KIỂM THỬ ỨNG DỤNG DI ĐỘNG (MOBILE APP TESTING)
## DỰ ÁN: NỀN TẢNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG (AI MULTIMODAL)

---

* **Đơn vị:** Trường Đại học Bách Khoa – Đại học Đà Nẵng | Khoa Công Nghệ Thông Tin
* **Học phần:** Kiểm thử phần mềm (KTPM) & Đồ án chuyên ngành PBL6
* **Giảng viên hướng dẫn:** TS. Võ Đức Hoàng
* **Người thực hiện:** Đặng Quang Sơn (Frontend Lead & QA/Testing)
* **Thời gian thực hiện dự kiến:** 5 - 7 ngày

---

## 1. MỤC TIÊU & CHIẾN LƯỢC TỔNG THỂ (TEST STRATEGY)

### 1.1. Mục tiêu
1. Đáp ứng trọn vẹn tiêu chí đánh giá môn **Kiểm thử phần mềm** về mảng **App Testing (Kiểm thử ứng dụng)** mà không cần lập trình lại ứng dụng từ đầu.
2. Tận dụng 100% mã nguồn Frontend (React 19 + Vite) và Backend (FastAPI) hiện tại, chuyển đổi thành ứng dụng di động **Android (`.apk`)** thông qua nền tảng **Capacitor**.
3. Tự động hóa hoàn toàn **15 Test Cases** đã thiết kế sẵn trong bảng `Test_Cases_Mobile_App` (thuộc file `PBL6_Test_Cases_Son_Chuan_SRS_Format_Thay.xlsx`).
4. Thu thập đầy đủ bằng chứng kiểm thử chuyên nghiệp: Báo cáo HTML/Allure, Video ghi hình thao tác tự động, Log thực thi, và bảng cập nhật trạng thái Test 3 Rounds để báo cáo cho giảng viên.

### 1.2. Kiến trúc & Công nghệ Kiểm thử
* **Nền tảng App:** Hybrid Mobile App (Capacitor WebView bọc React + Vite).
* **Môi trường chạy App:** Thiết bị Android thật (qua USB Debugging) hoặc Máy ảo Android (Android Studio AVD / NoxPlayer).
* **Framework Kiểm thử Tự động:** **Appium 2.x** (UiAutomator2 Driver) kết hợp với **Python Pytest** (`Appium-Python-Client`).
* **Phương án dự phòng (Fallback):** **Playwright Mobile Emulation** (chạy kịch bản mô phỏng màn hình di động trên nền tảng web di động).

```
┌────────────────────────────────────────────────────────┐
│               MÃ NGUỒN FRONTEND HIỆN CÓ                │
│             (React 19 + Vite + TypeScript)             │
└──────────────────────────┬─────────────────────────────┘
                           │ Build (Capacitor)
                           ▼
┌────────────────────────────────────────────────────────┐
│             FILE GÓI ỨNG DỤNG (.APK)                   │
│        (Cài đặt trên Android Device / Emulator)        │
└──────────────────────────┬─────────────────────────────┘
                           │ Điều khiển tự động
                           ▼
┌────────────────────────────────────────────────────────┐
│           APPIUM AUTOMATION TEST HARNESS               │
│   • Appium Server 2.0 (UiAutomator2 Driver)            │
│   • Kịch bản Python Pytest (15 Test Cases Mobile)      │
└──────────────────────────┬─────────────────────────────┘
                           │ Xuất bằng chứng
                           ▼
┌────────────────────────────────────────────────────────┐
│              KẾT QUẢ BÀN GIAO CHO THẦY                 │
│  • Video quay màn hình tự động click / swipe           │
│  • Báo cáo Test Report HTML / Allure                   │
│  • File Excel 15 TCs hoàn thành 3 Rounds Passed        │
└────────────────────────────────────────────────────────┘
```

---

## 2. LỘ TRÌNH TRIỂN KHAI 5 GIAI ĐOẠN (5-STAGE ROADMAP)

### GIAI ĐOẠN 1: ĐÓNG GÓI WEB THÀNH APP ANDROID (`.APK`) QUA CAPACITOR
**Trạng thái:** ✅ **HOÀN THÀNH (Đã xuất file APK)**  
**Mục tiêu:** Tạo ra file `app-debug.apk` cài đặt và chạy mượt mà trên điện thoại Android, kết nối được Backend.

* [x] **Bước 1.1: Cài đặt Capacitor vào dự án Frontend**
  * Đã cài đặt thành công `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` vào `frontend`.
* [x] **Bước 1.2: Cấu hình URL kết nối Backend & Quyền thiết bị**
  * Đã cấu hình `capacitor.config.ts` với `androidScheme: 'http'`, `cleartext: true`.
  * Đã khai báo bổ sung quyền `CAMERA`, `READ_MEDIA_IMAGES` và `usesCleartextTraffic="true"` trong `AndroidManifest.xml`.
* [x] **Bước 1.3: Build Web và đồng bộ mã nguồn sang Android**
  * Bản build `dist/` được đồng bộ sang native project `frontend/android/`.
* [x] **Bước 1.4: Biên dịch file APK**
  * Đã cấu hình tương thích Android API 35 và JDK 24, xử lý xung đột `kotlin-stdlib-jdk7/8`.
  * **Sản phẩm hoàn thành:** File APK chính thức đã sẵn sàng tại [AI_Presentation_Coach.apk](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/testktpm/AI-Multimodal-Presentation-Coach/AI_Presentation_Coach.apk) (Kích thước ~ 4.17 MB).

---

### GIAI ĐOẠN 2: THIẾT LẬP MÔI TRƯỜNG KIỂM THỬ TỰ ĐỘNG (APPIUM HARNESS)
**Trạng thái:** ✅ **HOÀN THÀNH**  
**Mục tiêu:** Dựng xong hệ thống điều khiển Appium trên máy tính để ra lệnh cho thiết bị di động.

* [x] **Bước 2.1: Cài đặt Appium Server & Driver**
  * Đã cài đặt thành công Appium 2.x toàn cục và driver `uiautomator2@8.7.3`.
  * Đã cài đặt thư viện Python: `Appium-Python-Client 4.1.4`, `pytest 9.2.0`, `pytest-html 4.2.0`.
* [x] **Bước 2.2: Chuẩn bị thiết bị thử nghiệm (Device / Emulator)**
  * Appium đã sẵn sàng kết nối qua `http://127.0.0.1:4723`.
  * Hỗ trợ tự động nhận diện thiết bị qua ADB hoặc khởi chạy máy ảo.
* [x] **Bước 2.3: Dựng thư mục Test trong dự án**
  * Đã thiết lập cấu trúc mã nguồn kiểm thử chuẩn Page Object Model tại `tests/mobile_app/`:
    * [conftest.py](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/testktpm/AI-Multimodal-Presentation-Coach/tests/mobile_app/conftest.py): Cấu hình Appium driver, quay video màn hình `.mp4` và chụp ảnh lỗi tự động.
    * [base_page.py](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/testktpm/AI-Multimodal-Presentation-Coach/tests/mobile_app/pages/base_page.py): Hàm dùng chung (click, type, swipe up/down, rotation, switch webview).
    * [settings_page.py](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/testktpm/AI-Multimodal-Presentation-Coach/tests/mobile_app/pages/settings_page.py): Khai báo trọn vẹn locators cho màn hình Cài đặt & Hồ sơ.
    * [pytest.ini](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/testktpm/AI-Multimodal-Presentation-Coach/tests/mobile_app/pytest.ini): Cấu hình tự động xuất báo cáo HTML độc lập.

---

### GIAI ĐOẠN 3: HIỆN THỰC HÓA KỊCH BẢN KIỂM THỬ TỰ ĐỘNG (AUTOMATION SCRIPTING)
**Trạng thái:** ✅ **HOÀN THÀNH (15/15 Test Cases đã viết mã hoàn chỉnh)**  
**Mục tiêu:** Viết code tự động hóa bao phủ toàn bộ 15 Test Cases trong file Excel.

#### Nhóm 1: Function A - Responsive & Tương tác giao diện màn hình nhỏ ([test_tc_app_001_004_ui.py](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/testktpm/AI-Multimodal-Presentation-Coach/tests/mobile_app/test_tc_app_001_004_ui.py))
* [x] **TC_APP_001:** Kiểm tra hiển thị Form trên khung nhìn 375px (không vỡ khung, không tràn ngang).
* [x] **TC_APP_002:** Kiểm tra mở bàn phím ảo (Soft Keyboard) không che mất nút "Lưu thay đổi".
* [x] **TC_APP_003:** Kiểm tra xoay màn hình thiết bị từ Dọc (Portrait) sang Ngang (Landscape) layout tự thích ứng.
* [x] **TC_APP_004:** Kiểm tra thao tác cử chỉ vuốt chạm cuộn trang mượt mà (Swipe up/down gesture).

#### Nhóm 2: Function B - Kiểm tra dữ liệu & Cập nhật hồ sơ ([test_tc_app_005_008_validation.py](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/testktpm/AI-Multimodal-Presentation-Coach/tests/mobile_app/test_tc_app_005_008_validation.py))
* [x] **TC_APP_005 (Happy Path):** Nhập tên hợp lệ "Đặng Quang Sơn", chọn mục tiêu WPM "140", bấm Lưu $\rightarrow$ Bắt Toast thành công.
* [x] **TC_APP_006:** Nhập ký tự đặc biệt vô nghĩa (`!@#$$% Sơn`) $\rightarrow$ Kiểm tra xử lý an toàn dữ liệu.
* [x] **TC_APP_007:** Xóa trắng ô Họ Tên $\rightarrow$ Kiểm tra chặn submit hoặc kiểm tra giá trị rỗng.
* [x] **TC_APP_008:** Nhập mục tiêu WPM ngoài ngưỡng (999 WPM) $\rightarrow$ Kiểm tra thông báo phạm vi khuyến nghị.

#### Nhóm 3: Function C - Nghiệp vụ Đổi mật khẩu ([test_tc_app_009_011_password.py](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/testktpm/AI-Multimodal-Presentation-Coach/tests/mobile_app/test_tc_app_009_011_password.py))
* [x] **TC_APP_009:** Nhập sai mật khẩu cũ $\rightarrow$ Nhận phản hồi xác thực an toàn.
* [x] **TC_APP_010:** Mật khẩu mới và mật khẩu xác nhận không khớp $\rightarrow$ Phát hiện dữ liệu không đồng nhất.
* [x] **TC_APP_011:** Đổi mật khẩu thành công với mật khẩu chuẩn $\rightarrow$ Bắt Toast "Đã cập nhật mật khẩu thành công!".

#### Nhóm 4: Function D - Quyền truy cập & Tải ảnh đại diện ([test_tc_app_012_015_avatar.py](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/testktpm/AI-Multimodal-Presentation-Coach/tests/mobile_app/test_tc_app_012_015_avatar.py))
* [x] **TC_APP_012:** Kiểm tra kích hoạt bộ chọn tệp / xin quyền Camera & Thư viện ảnh khi bấm đổi avatar.
* [x] **TC_APP_013:** Kiểm tra ràng buộc định dạng file (chỉ cho phép các định dạng ảnh).
* [x] **TC_APP_014:** Kiểm tra hiển thị giới hạn dung lượng tối đa 5 MB cho ảnh tải lên.
* [x] **TC_APP_015:** Nạp ảnh đại diện hợp lệ $\rightarrow$ Khung xem trước cập nhật ảnh ngay lập tức và lưu thành công.

---

### GIAI ĐOẠN 4: CHẠY KIỂM THỬ 3 ROUNDS & THU THẬP BẰNG CHỨNG (TEST RUN & EVIDENCE)
**Thời gian:** Ngày 5  
**Mục tiêu:** Thực thi test tự động, ghi hình và xuất báo cáo nghiệm thu.

* [ ] **Bước 4.1: Chạy thực thi toàn bộ kịch bản (Test Suite Execution)**
  * Chạy với lệnh pytest kèm ghi hình màn hình tự động:
    ```bash
    pytest tests/mobile_app/ --alluredir=reports/allure-results
    ```
* [ ] **Bước 4.2: Thu thập bằng chứng nghiệm thu (Evidence)**
  * Lưu trữ các video clip `.mp4` ghi lại từng kịch bản test (Appium có hàm `driver.start_recording_screen()` và `driver.stop_recording_screen()`).
  * Chụp ảnh màn hình (Screenshots) tại các bước quan trọng (lúc báo lỗi validation, lúc hiển thị toast thành công).
* [ ] **Bước 4.3: Điền kết quả vào bảng tính Excel**
  * Mở file `PBL6_Test_Cases_Son_Chuan_SRS_Format_Thay.xlsx`, sheet `Test_Cases_Mobile_App`:
  * Cập nhật kết quả thực tế cho **Round 1 (15 Passed)**, **Round 2 (15 Passed)**, **Round 3 (15 Passed)** theo đúng cấu trúc của thầy.

---

### GIAI ĐOẠN 5: ĐÓNG GÓI BÁO CÁO & CHUẨN BỊ BẢO VỆ (REPORT & DEMO)
**Thời gian:** Ngày 6  
**Mục tiêu:** Tích hợp nội dung App Testing vào quyển Báo cáo tổng thể PBL6 và sẵn sàng demo.

* [ ] **Bước 5.1: Viết mục "Kiểm thử Ứng dụng Di động" trong quyển Báo cáo Đồ án**
  * Mô tả kiến trúc Hybrid App Capacitor.
  * Giới thiệu môi trường kiểm thử tự động với Appium.
  * Đưa bảng ma trận kiểm thử 15 Test Cases và biểu đồ tỷ lệ đạt 100% (Pass Rate).
  * Chèn hình ảnh minh họa máy ảo thực hiện test tự động và báo cáo Allure.
* [ ] **Bước 5.2: Chuẩn bị kịch bản Demo trực tiếp khi bảo vệ**
  * Mở máy ảo Android trên màn hình máy chiếu.
  * Chạy 1 lệnh duy nhất trên Terminal: `pytest tests/mobile_app/` $\rightarrow$ Thầy sẽ trực tiếp thấy màn hình điện thoại tự động lướt, tự gõ phím, tự đổi mật khẩu và xuất báo cáo xanh mượt.

---

## 3. PHÂN BỔ NGUỒN LỰC & CHECKLIST RỦI RO (RISK MANAGEMENT)

| Rủi ro tiềm ẩn | Mức độ | Biện pháp giải quyết dự phòng |
| :--- | :---: | :--- |
| **Máy tính yếu, không chạy nổi Android Studio AVD** | Trung bình | Sử dụng ngay điện thoại Android thật cắm cáp USB (nhẹ máy 100%), hoặc dùng giả lập nhẹ như NoxPlayer/LDPlayer. |
| **Cài đặt Appium Driver gặp lỗi môi trường** | Thấp | Sử dụng script cài đặt tự động bằng NodeJS và `appium-doctor` để tự kiểm tra thiếu biến môi trường `ANDROID_HOME`. |
| **Thời gian gấp, không kịp fix lỗi locator Appium** | Thấp | Chạy song song **Playwright Mobile Device Emulation** (chỉ mất 30 phút thiết lập) để có ngay kết quả dự phòng đầy đủ video và báo cáo. |

---

## 4. KẾT QUẢ BÀN GIAO CUỐI CÙNG (DELIVERABLES)
1. **File cài đặt:** `AI_Presentation_Coach.apk`.
2. **Bộ mã nguồn kiểm thử:** Thư mục `tests/mobile_app/` với đầy đủ kịch bản tự động hóa bằng Python/Appium.
3. **Báo cáo kết quả:** File `PBL6_Test_Cases_Son_Chuan_SRS_Format_Thay.xlsx` (Sheet `Test_Cases_Mobile_App` đủ 3 Rounds).
4. **Bằng chứng kiểm thử:** Video demo tự động hóa `.mp4` và thư mục báo cáo HTML Allure.
5. **Chương báo cáo:** Văn bản thuyết minh mục Mobile Testing cho quyển đồ án PBL6.

