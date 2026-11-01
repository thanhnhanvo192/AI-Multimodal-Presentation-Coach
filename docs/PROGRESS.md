# TIẾN ĐỘ DỰ ÁN (PROJECT PROGRESS)

## 1. Trạng Thái Hiện Tại Của Từng Phân Hệ (Cập nhật 25/10/2026)

| Phân hệ / Module | Người phụ trách | Trạng thái | Ghi chú & Bằng chứng xác minh |
| :--- | :--- | :--- | :--- |
| **Frontend Base & Architecture** | Đặng Quang Sơn | **Hoàn thành (Đã kiểm thử)** | Vite 8 + React 19 + TypeScript 5.7, build sạch 0 lỗi (`npm run build`). |
| **Tách biệt Dashboard, History & Report** | Đặng Quang Sơn | **Hoàn thành (Đã kiểm thử)** | `/dashboard` (KPI + biểu đồ xu hướng), `/history` (danh sách + bộ lọc), `/report/:sessionId` (báo cáo động theo ID). |
| **Admin Dashboard & Server Logs** | Đặng Quang Sơn | **Hoàn thành (Đã kiểm thử)** | Hoàn thiện `/admin/dashboard` và `/admin/logs` với đầy đủ KPI, charts, logs filter, download log. |
| **Frontend Demo Auth & Route Guards** | Đặng Quang Sơn | **Hoàn thành (Đã kiểm thử)** | Xác thực email/password demo, loại bỏ bypass role, 4 tài khoản demo, route protection 2 chiều, vượt qua 20 test cases. |
| **Hệ Thống Logo & Thương Hiệu** | Đặng Quang Sơn | **Hoàn thành (Đã kiểm thử)** | Tích hợp SVG logo chuẩn 250:64 tại `public/logo.svg`, component `BrandLogo`, cập nhật 4 vị trí thương hiệu & favicon. |
| **Ghi hình Webcam & Audio** | Đặng Quang Sơn | **Một phần (Cần nâng cấp)** | Mở được webcam thật qua `getUserMedia`, cần bổ sung MediaRecorder để xuất file nộp chấm điểm. |
| **Backend API & Database** | Võ Thành Nhân | **Chờ kết nối** | Đang chờ Backend Lead công bố API contract (Swagger/Postman) cho Auth, Sessions, Reports. |
| **AI Processing Pipeline** | Nguyễn Đỗ Thắng | **Chờ tích hợp** | Đang chờ hoàn thiện mô hình Computer Vision (MediaPipe/OpenCV) và Speech-to-Text / Audio NLP. |

## 2. Nhật Ký Tiến Độ Tái Cấu Trúc Frontend (Đặng Quang Sơn)
* [x] **Giai đoạn 0:** Tạo điểm khôi phục Git (Commit baseline `25d1de2`, tạo nhánh `refactor/fe-clean-architecture`).
* [x] **Giai đoạn 1:** Khôi phục môi trường chạy (Gỡ `pnpm-lock.yaml`, chuyển sang `npm install`, tạo `package-lock.json` - commit `c305ccc`).
* [x] **Giai đoạn 2:** Kiểm thử giao diện gốc trên 12 màn hình qua Vite Dev Server (`localhost:8443`).
* [x] **Giai đoạn 3:** Xóa bỏ code chết và gom icon vào `src/components/icons/index.tsx`.
* [x] **Giai đoạn 4:** Chuẩn hóa Routing bằng `react-router-dom`, lưu session bền vững.
* [x] **Giai đoạn 5:** Tách TypeScript Interfaces (`src/types/`), Mock Data (`src/mocks/`), khung Service Client (`src/services/apiClient.ts`).
* [x] **Giai đoạn 6 (25/10/2026):** Cải tổ kiến trúc phân hệ Student:
  * Tách riêng [DashboardPage.tsx](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/DashboardPage.tsx) tại `/dashboard`.
  * Tinh gọn [HistoryPage.tsx](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/HistoryPage.tsx) tại `/history`.
  * Động hóa [ReportPage.tsx](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/ReportPage.tsx) tại `/report/:sessionId` với fallback 404.
* [x] **Giai đoạn 7 (25/10/2026):** Triển khai 2 trang Admin còn thiếu:
  * Xây dựng [AdminDashboardPage.tsx](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/AdminDashboardPage.tsx) (`/admin/dashboard`) với KPI, Activity Chart, Score Distribution.
  * Xây dựng [AdminLogsPage.tsx](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/AdminLogsPage.tsx) (`/admin/logs`) với 25 bản ghi log, bộ lọc level, service, search, download.
* [x] **Giai đoạn 8 (25/10/2026):** Triển khai Phương án A: Frontend Demo Authentication:
  * Module [mockAuth.ts](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/mocks/mockAuth.ts) quản lý 4 tài khoản demo (Student Sơn, Student Thắng, Admin, Banned Nhân).
  * Nâng cấp [AuthContext.tsx](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/context/AuthContext.tsx) quản lý `currentUser`, khôi phục an toàn từ `auth_user` (không lưu password).
  * Nâng cấp [LoginPage.tsx](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/LoginPage.tsx) thành form xác thực 1 nút submit, báo lỗi chi tiết, chip điền nhanh demo.
  * Cập nhật [SignUpPage.tsx](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/SignUpPage.tsx) ngăn bypass session, thông báo tính năng chờ Backend.
  * Bảo vệ route trong [App.tsx](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/App.tsx) với `StudentRoute`, `AdminRoute`, `GuestRoute`.
  * Đồng bộ thông tin người dùng đang đăng nhập lên [Sidebar.tsx](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/Sidebar.tsx), Settings, AdminSettings.
* [x] **Giai đoạn 9 (25/10/2026):** Tích hợp Logo SVG chính thức:
  * Lưu trữ `public/logo.svg` với gradient chuẩn và tỷ lệ 250:64.
  * Tạo component [BrandLogo.tsx](file:///c:/Users/Admin/OneDrive%20-%20The%20University%20of%20Technology/Ki_7/PBL6/code/PBL6-ai-presentation-coach/frontend/src/components/common/BrandLogo.tsx).
  * Cập nhật đồng bộ tại LandingPage, LoginPage, SignUpPage, Sidebar và favicon.
* [x] **Giai đoạn 10 (26/10/2026):** Chuẩn hóa Flat Design và tinh chỉnh giao diện Admin:
  * Loại bỏ hoàn toàn hiệu ứng đổ bóng (`box-shadow`, `shadow-*`) trên toàn bộ hệ sinh thái giao diện (Landing, Auth, Student, Admin).
  * Vô hiệu hóa token shadow tại `@theme` và áp dụng reset `box-shadow: none !important`, bảo tồn viền mảnh `border-[#DCE5DF]`.
  * Tinh chỉnh `/admin/users`: Bỏ box badge trạng thái chuyển sang text thuần, chuẩn hóa kích thước đồng nhất cho 2 nút "Khóa" và "Mở khóa".
  * Tinh chỉnh `/admin/config` và `/admin/logs`: Bỏ box bao quanh chữ trạng thái xử lý và mức độ log (INFO/WARN/ERROR/DEBUG).

## 3. Các Việc Ưu Tiên Tiếp Theo (Next Priority Steps)
1. **Studio MediaRecorder:** Tích hợp bộ thu video webcam qua `MediaRecorder API`, cho phép xuất file nộp thử nghiệm hoặc tải về máy.
2. **Họp đồng bộ với Backend Lead (Võ Thành Nhân):** Chốt danh sách API endpoints chuẩn (Swagger/OpenAPI) cho Auth (login/logout/register), Session (upload/list/detail) và AI Report.
3. **Kết nối API thật với tầng Services:** Chuyển đổi dần các module từ `src/mocks/` sang gọi API thực qua `src/services/apiClient.ts` khi Backend khởi động môi trường local.

