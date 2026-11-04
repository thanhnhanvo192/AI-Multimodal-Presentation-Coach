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
**Thời gian:** Ngày 2  
**Mục tiêu:** Dựng xong hệ thống điều khiển Appium trên máy tính để ra lệnh cho thiết bị di động.

* [ ] **Bước 2.1: Cài đặt Appium Server & Driver**
  * Cài đặt Appium 2.x qua npm toàn cục:
    ```bash
    npm install -g appium
    appium driver install uiautomator2
    ```
* [ ] **Bước 2.2: Chuẩn bị thiết bị thử nghiệm (Device / Emulator)**
  * **Lựa chọn A (Khuyên dùng):** Sử dụng máy ảo Android Studio (AVD) cấu hình: Pixel 5 / Android 12+ (API 31+).
  * **Lựa chọn B:** Cắm điện thoại Android thật vào máy tính, bật tính năng `USB Debugging` (Gỡ lỗi qua USB).
  * Kiểm tra kết nối thiết bị bằng lệnh: `adb devices`.
* [ ] **Bước 2.3: Dựng thư mục Test trong dự án**
  * Tạo cấu trúc thư mục kiểm thử:
    ```
    AI-Multimodal-Presentation-Coach/
    └── tests/
        └── mobile_app/
            ├── conftest.py            # Cấu hình Desired Capabilities Appium
            ├── pages/                 # Mô hình Page Object Model (POM)
            │   ├── profile_page.py
            │   └── settings_page.py
            ├── test_tc_app_001_004_ui.py
            ├── test_tc_app_005_008_validation.py
            ├── test_tc_app_009_011_password.py
            ├── test_tc_app_012_015_avatar.py
            └── requirements-test.txt  # pytest, Appium-Python-Client, allure-pytest
    ```

---

### GIAI ĐOẠN 3: HIỆN THỰC HÓA KỊCH BẢN KIỂM THỬ TỰ ĐỘNG (AUTOMATION SCRIPTING)
**Thời gian:** Ngày 3 – Ngày 4  
**Mục tiêu:** Viết code tự động hóa bao phủ toàn bộ 15 Test Cases trong file Excel.

#### Nhóm 1: Function A - Responsive & Tương tác giao diện màn hình nhỏ (TC_APP_001 $\rightarrow$ TC_APP_004)
* [ ] **TC_APP_001:** Kiểm tra hiển thị Form trên khung nhìn 375px (không bị vỡ khung, không tràn ngang).
* [ ] **TC_APP_002:** Kiểm tra mở bàn phím ảo (Soft Keyboard) không che mất nút "Lưu thay đổi" (giao diện tự cuộn lên).
* [ ] **TC_APP_003:** Kiểm tra xoay màn hình thiết bị từ Dọc (Portrait) sang Ngang (Landscape) layout tự thích ứng.
* [ ] **TC_APP_004:** Kiểm tra thao tác cử chỉ vuốt chạm cuộn trang mượt mà (Swipe up/down gesture).

#### Nhóm 2: Function B - Kiểm tra dữ liệu & Cập nhật hồ sơ (TC_APP_005 $\rightarrow$ TC_APP_008)
* [ ] **TC_APP_005 (Happy Path):** Nhập tên hợp lệ "Đặng Quang Sơn", chọn mục tiêu WPM "140", bấm Lưu $\rightarrow$ Bắt Toast thành công.
* [ ] **TC_APP_006:** Nhập ký tự đặc biệt vô nghĩa (`!@#$$% Sơn`) $\rightarrow$ Kiểm tra hiển thị lỗi validation, không gọi API.
* [ ] **TC_APP_007:** Xóa trắng ô Họ Tên $\rightarrow$ Kiểm tra nút Lưu bị vô hiệu hóa (Disabled) hoặc báo lỗi bắt buộc.
* [ ] **TC_APP_008:** Nhập mục tiêu WPM ngoài ngưỡng (999 WPM) $\rightarrow$ Kiểm tra thông báo giới hạn.

#### Nhóm 3: Function C - Nghiệp vụ Đổi mật khẩu (TC_APP_009 $\rightarrow$ TC_APP_011)
* [ ] **TC_APP_009:** Nhập sai mật khẩu cũ $\rightarrow$ Nhận phản hồi lỗi xác thực từ Backend.
* [ ] **TC_APP_010:** Mật khẩu mới và mật khẩu xác nhận không khớp $\rightarrow$ Báo lỗi tại Client ngay khi nhập.
* [ ] **TC_APP_011:** Đổi mật khẩu thành công với mật khẩu chuẩn $\rightarrow$ Kiểm tra thông báo thành công và cập nhật session.

#### Nhóm 4: Function D - Quyền truy cập & Tải ảnh đại diện (TC_APP_012 $\rightarrow$ TC_APP_015)
* [ ] **TC_APP_012:** Kiểm tra hiển thị hộp thoại xin quyền truy cập Camera/Bộ nhớ thiết bị khi bấm đổi avatar.
* [ ] **TC_APP_013:** Chọn file sai định dạng (file tài liệu `.pdf`) $\rightarrow$ Kiểm tra ứng dụng chặn và báo lỗi file.
* [ ] **TC_APP_014:** Chọn ảnh dung lượng vượt quá giới hạn cho phép (> 5MB) $\rightarrow$ Báo lỗi dung lượng.
* [ ] **TC_APP_015:** Chọn ảnh đại diện hợp lệ (`.jpg`, < 5MB) $\rightarrow$ Xem trước cập nhật ngay lập tức và lưu thành công.

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

