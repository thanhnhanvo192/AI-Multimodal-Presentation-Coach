# HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH BỘ KIỂM THỬ TỰ ĐỘNG (TESTING SETUP & EXECUTION GUIDE)
## DỰ ÁN: NỀN TẢNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG (AI COACH)

Tài liệu này hướng dẫn chi tiết cách thức chuẩn bị môi trường, cài đặt các thư viện phụ thuộc và thực thi toàn bộ 4 loại kiểm thử tự động phục vụ công tác nghiệm thu dự án.

---

## 1. YÊU CẦU HỆ THỐNG (SYSTEM PREREQUISITES)

- **Hệ điều hành:** Windows 10/11 hoặc Linux (Ubuntu 22.04+), macOS.
- **Python:** Phiên bản 3.10 trở lên (khuyến nghị Python 3.11 - 3.13).
- **Node.js:** Phiên bản 18 trở lên (khuyến nghị Node 20 LTS - 24 LTS) cùng `npm`.
- **Cơ sở dữ liệu:** Không cần cài đặt Postgres cục bộ khi chạy test; hệ thống tự động khởi tạo cơ sở dữ liệu biệt lập `pbl6_test.db` (Async SQLite) để bảo toàn dữ liệu gốc.

---

## 2. CÀI ĐẶT MÔI TRƯỜNG VÀ DEPENDENCIES

### 2.1. Cài đặt cho Backend (Python Testing Tools)
Mở terminal tại thư mục gốc của dự án (`d:/Semester7/PBL6/source`):

```bash
# Cài đặt các gói phụ thuộc cho kiểm thử
pip install pytest pytest-asyncio pytest-cov httpx locust aiosqlite bcrypt passlib numpy fastapi uvicorn pydantic
```

### 2.2. Cài đặt cho Frontend (Playwright E2E Tools)
Di chuyển vào thư mục `frontend`:

```bash
cd frontend
npm install
npm install -D @playwright/test
npx playwright install chromium
cd ..
```

---

## 3. THỰC THI KIỂM THỬ NHANH (QUICK RUNNERS - 1 CLICK)

Tất cả các script thực thi đã được cấu hình tự động: tự khởi động server giả lập nếu chưa bật, tự cô lập cơ sở dữ liệu, chạy kiểm thử, sinh báo cáo Markdown và JUnit XML, và tự giải phóng tài nguyên hệ thống.

### 3.1. Chạy Tất Cả 4 Loại Kiểm Thử (Full Test Suite)
- **Trên Windows:**
  ```cmd
  scripts\run_all_tests.bat
  ```
- **Trên Linux / macOS:**
  ```bash
  chmod +x scripts/*.sh
  ./scripts/run_all_tests.sh
  ```

---

## 4. THỰC THI CHI TIẾT TỪNG NHÓM KIỂM THỬ

Nếu muốn trình chiếu hoặc đánh giá từng loại kiểm thử độc lập:

### 4.1. Unit Testing (22 Test Cases - Bcrypt & AI Scoring)
- **Script Windows:**
  ```cmd
  scripts\run_unit_tests.bat
  ```
- **Lệnh trực tiếp:**
  ```bash
  pytest backend/tests/unit -v --junitxml=test-results/unit/junit.xml
  ```
- **Báo cáo kết quả:** Xem tại `test-results/unit/REPORT.md`.

### 4.2. API Testing (10 Test Cases - Admin Config & User Status)
- **Script Windows:**
  ```cmd
  scripts\run_api_tests.bat
  ```
- **Lệnh trực tiếp:**
  ```bash
  pytest backend/tests/api -v --junitxml=test-results/api/junit.xml
  ```
- **Báo cáo kết quả:** Xem tại `test-results/api/REPORT.md`.

### 4.3. Web Testing E2E (9 Test Cases - Registration & Login RBAC)
- **Script Windows:**
  ```cmd
  scripts\run_web_tests.bat
  ```
- **Lệnh trực tiếp:**
  ```bash
  python scripts/run_web_runner.py
  ```
- **Báo cáo kết quả:**
  - Báo cáo Markdown: `test-results/web/REPORT.md`
  - Báo cáo HTML trực quan: Mở file `test-results/web/html-report/index.html` trên trình duyệt.

### 4.4. Performance Testing (Tải đồng thời 50 Users - Dashboard & KPIs)
- **Script Windows:**
  ```cmd
  scripts\run_performance_tests.bat
  ```
- **Lệnh trực tiếp:**
  ```bash
  python scripts/run_performance_runner.py
  ```
- **Báo cáo kết quả:**
  - Báo cáo chi tiết: `test-results/performance/REPORT.md`
  - Bảng thống kê CSV: `test-results/performance/*.csv`

---

## 5. TỰ ĐỘNG TỔNG HỢP BÁO CÁO (REPORT GENERATOR)

Sau khi chạy xong các test suite, có thể gọi bộ tổng hợp báo cáo bằng lệnh:
```bash
python scripts/generate_reports.py
```
Kết quả tổng quan toàn dự án sẽ được xuất tại file:
`test-results/summary/TEST_SUMMARY.md`

---

## 6. CẤU TRÚC THƯ MỤC CỦA TESTING FRAMEWORK

```
d:/Semester7/PBL6/source/
├── backend/
│   ├── performance/              # Kịch bản kiểm thử tải (Locust)
│   │   ├── locust_admin_kpis.py
│   │   └── locust_dashboard_stats.py
│   └── tests/
│       ├── conftest.py           # Cô lập SQLite Async và fixtures
│       ├── unit/                 # Unit test scripts
│       └── api/                  # API test scripts
├── frontend/
│   ├── e2e/                      # Playwright E2E test specs
│   └── playwright.config.ts      # Cấu hình Playwright
├── docs/testing/
│   ├── TEST_FUNCTION_MATRIX.md   # Ma trận 8 chức năng không trùng lặp
│   ├── TEST_ENVIRONMENT.md       # Kiến trúc cô lập dữ liệu test
│   ├── TEST_CASES.md             # Đặc tả 41 test cases
│   └── TESTING_SETUP.md          # Hướng dẫn cài đặt & vận hành (file này)
├── scripts/
│   ├── run_all_tests.bat (.sh)
│   ├── run_unit_tests.bat (.sh)
│   ├── run_api_tests.bat (.sh)
│   ├── run_web_tests.bat (.sh)
│   ├── run_performance_tests.bat (.sh)
│   ├── run_web_runner.py
│   ├── run_performance_runner.py
│   └── generate_reports.py
└── test-results/                 # Kết quả và báo cáo tự động sinh
    ├── unit/
    ├── api/
    ├── web/
    ├── performance/
    └── summary/
```

