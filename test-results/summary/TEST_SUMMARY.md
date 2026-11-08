# BÁO CÁO TỔNG HỢP KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUMMARY REPORT)
## ĐỀ TÀI: NỀN TẢNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG (AI MULTIMODAL COACH)
**Ngày nghiệm thu:** 08/11/2026 16:25:49
**Nhóm thực hiện:** Đặng Quang Sơn (QA Lead), Võ Thành Nhân (Backend), Nguyễn Đỗ Thắng (AI Lead)
**Giảng viên hướng dẫn:** TS. Võ Đức Hoàng

---

## 1. THÔNG TIN DỰ ÁN VÀ MÔI TRƯỜNG KIỂM THỬ
- **Hệ thống Frontend:** React 19 + TypeScript + Vite 8 (Chạy tại `http://localhost:5173`)
- **Hệ thống Backend:** Python FastAPI + Pydantic v2 + SQLite Async / PostgreSQL (`http://localhost:8000`)
- **Môi trường Database:** SQLite Async độc lập (`pbl6_test.db`)
- **Công cụ kiểm thử:** Pytest 9.2, Playwright 1.58 (Chromium), Locust 2.47

---

## 2. MA TRẬN 8 CHỨC NĂNG NGHIỆP VỤ ĐỘC LẬP (FUNCTION ALLOCATION MATRIX)
| Loại kiểm thử | Chức năng 1 | Chức năng 2 | Trạng thái |
| :--- | :--- | :--- | :---: |
| **1. Unit Testing** | Password Hashing (Bcrypt) | AI Scoring & Formatting | **PASSED** |
| **2. API Testing** | Admin System Configuration | Admin Ban/Unban User Status | **PASSED** |
| **3. Web Testing (E2E)** | Web User Registration Workflow | Web User Login & RBAC Workflow | **PASSED** |
| **4. Performance Testing** | Student Dashboard Stats Load | Admin KPIs Aggregation Load | **PASSED** |

> **Chứng minh không trùng lặp:** Mỗi chức năng chỉ xuất hiện duy nhất ở 1 loại kiểm thử, đảm bảo bao phủ 8 nghiệp vụ hoàn chỉnh.

---

## 3. KẾT QUẢ CHI TIẾT TỪNG NHÓM KIỂM THỬ

### 3.1. Unit Testing (Pytest)
- Chức năng kiểm thử: *Password Hashing* & *AI Scoring, Badge Allocation*
- Tổng số ca kiểm thử: **22**
- Passed: **22** | Failed: **0** | Skipped: **0**
- Thời gian thực thi: **4.64s**
- Trạng thái: **PASSED**

### 3.2. API Testing (FastAPI TestClient & HTTPX)
- Chức năng kiểm thử: *Admin System Config* & *Admin User Status Management*
- Tổng số ca kiểm thử: **10**
- Passed: **10** | Failed: **0** | Skipped: **0**
- Thời gian thực thi: **5.67s**
- Trạng thái: **PASSED**

### 3.3. Web Testing E2E (Playwright Chromium)
- Chức năng kiểm thử: *User Registration Workflow* & *User Login and RBAC Navigation*
- Tổng số ca kiểm thử: **9**
- Passed: **9** | Failed: **0** | Skipped: **0**
- Thời gian thực thi: **17.45s**
- Trạng thái: **PASSED**

### 3.4. Performance Testing (Locust Load Test)
- Chức năng 7 (Dashboard Stats): **746 requests**, Avg: **530.96ms**, RPS: **53.06**, Failure Rate: **0.0%**
- Chức năng 8 (Admin KPIs): **258 requests**, Avg: **2065.02ms**, RPS: **18.32**, Failure Rate: **0.0%**
- Trạng thái kiểm thử tải: **PASSED**

---

## 4. TỔNG KẾT VÀ ĐÁNH GIÁ CHUNG
- **Tổng số ca kiểm thử (Functional & E2E):** **41**
- **Tổng Passed:** **41** (100.0%)
- **Tổng Failed:** **0**
- **Tổng Skipped:** **0**
- **Tổng Requests tải kiểm thử:** **1004 requests**
- **TÌNH TRẠNG NGHIỆM THU TỔNG THỂ:** **PASSED (ĐẠT CHUẨN NGHIỆM THU)**

---

## 5. CÁC LỖI ĐÃ PHÁT HIỆN & ĐÃ XỬ LÝ (DETECTED & RESOLVED DEFECTS)
1. **Đường dẫn UPLOAD_DIR cứng trong `.env`:** Cấu hình `/app/uploads` gây lỗi phân quyền trên Windows ngoài Docker -> Đã bổ sung logic tự động fallback sang thư mục cục bộ `backend/uploads`.
2. **Cơ chế tải trước AI Engine (Warm-up) gây trễ khởi động test:** Quá trình tải mô hình lớn làm nghẽn luồng kiểm thử đơn vị -> Đã thiết lập cờ `TESTING=true` bỏ qua warm-up trong môi trường automated test.
3. **Ràng buộc an toàn Admin tự khóa tài khoản:** Xác thực logic nghiệp vụ ngăn chặn Admin tự tước quyền quản trị của chính mình.

## 6. KHUYẾN NGHỊ CHO HỘI ĐỒNG BẢO VỆ ĐỒ ÁN
- Toàn bộ kịch bản kiểm thử sẵn sàng thực thi trực tiếp bằng 1 cú nhấp chuột thông qua các script `scripts/run_*.bat`.
- Kết quả kiểm thử thực tế được lưu vết tự động trong thư mục `test-results/` phục vụ trích xuất slide và báo cáo Word.