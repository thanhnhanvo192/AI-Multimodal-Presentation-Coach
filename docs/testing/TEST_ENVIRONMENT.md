# TÀI LIỆU MÔI TRƯỜNG KIỂM THỬ (TEST ENVIRONMENT SPECIFICATION)
## DỰ ÁN: NỀN TẢNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG (PBL6 AI COACH)

---

## 1. TỔNG QUAN KIẾN TRÚC MÔI TRƯỜNG (ENVIRONMENT ARCHITECTURE)

Hệ thống kiểm thử tự động được thiết kế cô lập, độc lập hoàn toàn với dữ liệu vận hành thực tế.
Môi trường gồm 2 tầng chính:

1. **Backend & Test Database Layer (Python FastAPI + SQLite Async):**
   - Môi trường kiểm thử tự động sử dụng driver `sqlite+aiosqlite:///./pbl6_test.db` hoặc in-memory async SQLite engine.
   - Toàn bộ bảng dữ liệu (`users`, `presentations`, `analysis_results`) được tạo tự động thông qua `Base.metadata.create_all` trước khi chạy và tự động dọn dẹp (cleanup/teardown) sau khi hoàn thành.
   - Không can thiệp vào CSDL chính (`pbl6_local.db` hoặc PostgreSQL production).

2. **Frontend & Browser Testing Layer (Vite + React 19 + Playwright):**
   - Frontend chạy trên cổng cục bộ (mặc định: `http://localhost:5173`).
   - Kết nối tới Backend API tại `http://localhost:8000/api/v1`.
   - Playwright khởi chạy trình duyệt Chromium không đầu (headless) hoặc có đầu (headed) để thực thi các kịch bản kiểm thử giao diện người dùng.

---

## 2. BIẾN MÔI TRƯỜNG KIỂM THỬ (REQUIRED ENVIRONMENT VARIABLES)

Tạo hoặc chỉ định tệp `.env.test` hoặc nạp trực tiếp qua shell:

```env
# Server & Security
PROJECT_NAME="PBL6 AI Presentation Coach (Test Suite)"
API_V1_STR="/api/v1"
SECRET_KEY="test-secret-key-for-automated-testing-pbl6-2026"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database (Isolated Test DB)
DATABASE_URL="sqlite+aiosqlite:///./pbl6_test.db"

# Storage
UPLOAD_DIR="./uploads_test"
MAX_FILE_SIZE_MB=100

# AI Core Weights & Scripts
WEIGHTS_DIR="../weights"
SCRIPTS_DIR="../scripts"
AI_SAMPLE_FPS=1.5
```

---

## 3. CẤU HÌNH CƠ SỞ DỮ LIỆU KIỂM THỬ (TEST DATABASE CONFIGURATION)

* **Engine:** `aiosqlite` (Async SQLite 3)
* **URL:** `sqlite+aiosqlite:///./pbl6_test.db`
* **Cơ chế tái tạo dữ liệu (Seeding & Cleanup):**
  * Mỗi phiên chạy test tạo mới các bảng thông qua SQLAlchemy metadata.
  * Tự động khởi tạo tài khoản quản trị viên và sinh viên mẫu phục vụ kiểm thử:
    * **Admin Test Account:** `admin_test@system.edu.vn` / `AdminPass123!` (Role: `admin`)
    * **Student Test Account:** `student_test@student.edu.vn` / `StudentPass123!` (Role: `student`)
  * Kết thúc phiên kiểm thử, file `pbl6_test.db` và thư mục `uploads_test` có thể được dọn sạch tự động mà không để lại dữ liệu rác.

---

## 4. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (SETUP & STARTUP INSTRUCTIONS)

### 4.1. Cài đặt Dependencies Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m pip install pytest pytest-asyncio pytest-cov httpx locust
```

### 4.2. Cài đặt Dependencies Frontend
```bash
cd frontend
npm install
npm install -D @playwright/test
npx playwright install chromium
```

### 4.3. Khởi chạy Backend Server (Phục vụ Web & Performance Testing)
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 4.4. Khởi chạy Frontend Server (Phục vụ Web Testing)
```bash
cd frontend
npm run dev
```

---

## 5. BẢO ĐẢM AN TOÀN VÀ TÍNH ĐỘC LẬP (SAFETY & ISOLATION GUARANTEES)

1. **Không ghi đè dữ liệu thật:** Mọi test scripts đều chạy trên schema và database tách biệt.
2. **Không rò rỉ thông tin xác thực:** Toàn bộ token và thông tin đăng nhập trong test là dữ liệu sinh ngẫu nhiên theo phiên (UUID v4).
3. **An toàn kiểm thử tải (Performance Safety):**
   - Kịch bản Locust chỉ gửi truy vấn đọc (`GET`) đến các endpoints thống kê tổng hợp (`/dashboard-stats`, `/admin/kpis`).
   - Không thực hiện các hành động ghi đè hàng loạt (destructive bulk operations) làm tràn bộ nhớ server.

