# PROJECT CONTEXT — AI MULTIMODAL PRESENTATION COACH

## 1. Mục Tiêu Dự Án
* **Đề tài:** Nghiên cứu và Xây dựng Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động Dựa trên Phân tích Thị giác và Nội dung Lời nói (PBL6).
* **Mục tiêu cốt lõi:** Xây dựng hệ thống web hoạt động như một "Huấn luyện viên thuyết trình ảo (AI Presentation Coach)". 
  * Hỗ trợ người dùng quay video trực tiếp từ webcam hoặc tải lên video có sẵn.
  * Phân tích đa phương thức (Multimodal): ánh mắt (eye contact), biểu cảm khuôn mặt (facial emotions), ngôn ngữ cơ thể (body gestures), tốc độ nói (WPM), âm lượng và phát hiện từ đệm (filler words).
  * Trả về bảng điểm chi tiết, biểu đồ mạng nhện (Radar Chart) và các khuyến nghị cải thiện.

## 2. Phân Công Trách Nhiệm (Team Members)
1. **Nguyễn Đỗ Thắng** — Trưởng nhóm (AI Lead: Computer Vision & Machine Learning).
2. **Võ Thành Nhân** — Thành viên (Backend Lead & Quản trị mạng / DevOps).
3. **Đặng Quang Sơn** — Thành viên (Frontend Lead & Kiểm thử phần mềm / QA).

## 3. Kiến Trúc Kỹ Thuật Ổn Định (Frontend)
* **Framework:** React 19 (`react: ^19.0.0`, `react-dom: ^19.0.0`).
* **Build Tooling:** Vite v8 (`vite: ^8.0.5`), TypeScript 5.7.
* **Styling:** Tailwind CSS v4 (`@tailwindcss/vite: ^4.0.0`), Google Fonts (Inter, Instrument Serif).
* **Package Manager:** `npm` (đã chuẩn hóa qua `package-lock.json`, loại bỏ phụ thuộc `pnpm-lock.yaml`).
* **Routing:** `react-router-dom` (v7), kiến trúc Single Page Application với các đường dẫn URL độc lập:
  * **Public / Guest:** `/` (LandingPage), `/login` (LoginPage), `/signup` (SignUpPage).
  * **Student Protected:** `/dashboard` (Tổng quan & KPI), `/studio` (Ghi hình), `/upload` (Tải video), `/analyzing` (Trạng thái AI), `/report/:sessionId` (Báo cáo phiên), `/history` (Lịch sử luyện tập), `/settings` (Cài đặt tài khoản).
  * **Admin Protected:** `/admin/dashboard` (KPI & phân tích hệ thống), `/admin/users` (Quản lý sinh viên), `/admin/config` (Cấu hình hệ số AI), `/admin/logs` (Nhật ký máy chủ), `/admin/settings` (Cài đặt quản trị).
* **State & Authentication (Phương án A - Demo Frontend Auth):**
  * `AuthContext` quản lý `currentUser: AuthUser | null`, suy ra `isAuthenticated` và `userRole` từ `currentUser`.
  * Cơ chế xác thực tài khoản demo tập trung qua `src/mocks/mockAuth.ts` (kiểm tra email không phân biệt hoa thường, so sánh mật khẩu chính xác, kiểm tra trạng thái active/banned).
  * Lưu trữ phiên qua khóa `auth_user` trong `localStorage` (chỉ lưu: id, name, email, role, status, avatarText; tuyệt đối không lưu password).
  * Route Guards độc lập: `StudentRoute`, `AdminRoute`, `GuestRoute` với cơ chế điều hướng đối ứng, tránh vòng lặp chuyển hướng.
  * *Nguyên tắc bảo mật:* Route Guards ở Frontend chỉ phục vụ điều hướng trải nghiệm (UX). Việc xác thực quyền hạn thực sự bắt buộc do Backend quản lý qua JWT / Bearer Token.
* **Thương hiệu & Logo:**
  * Logo vector chuẩn tỉ lệ 250:64 lưu tại `public/logo.svg` và favicon trình duyệt.
  * Component hiển thị dùng chung `src/components/common/BrandLogo.tsx`.
* **Cấu trúc thư mục chuẩn hóa:**
  * `src/components/common/`: Các component nền tảng dùng chung (Button, Card, Badge, BrandLogo, PageHeader, FormControls).
  * `src/components/icons/`: Tập trung toàn bộ Icon SVG dùng chung.
  * `src/context/`: Quản lý context ứng dụng (AuthContext).
  * `src/mocks/`: Chứa toàn bộ dữ liệu tĩnh (mockUsers, mockHistory, mockAdmin, mockLogs, mockAuth).
  * `src/pages/`: Chứa các trang giao diện riêng biệt.
  * `src/services/`: Tầng giao tiếp mạng (apiClient với fetch/Bearer token).
  * `src/types/`: Định nghĩa kiểu dữ liệu TypeScript (user, admin, presentation, report).

## 4. Quyết Định Kỹ Thuật Đã Thống Nhất
* **Bảo toàn 100% UI Figma ban đầu:** Không tự tiện đổi màu, đổi layout hay đập đi xây lại giao diện.
* **Tách Data khỏi UI:** Tuyệt đối không nhúng các mảng dữ liệu cứng trong thân component để sẵn sàng kết nối API thật.
* **Phân định rõ Dashboard - History - Report:** `/dashboard` tập trung tổng quan & KPI, `/history` tập trung danh sách & bộ lọc, `/report/:sessionId` hiển thị chi tiết theo ID phiên cụ thể.
* **Xác thực demo có kiểm tra mật khẩu:** Loại bỏ nút đăng nhập tắt; người dùng phải nhập đúng tài khoản demo hoặc dùng chip điền nhanh để thử nghiệm các ca thành công/thất bại/tài khoản bị khóa.
