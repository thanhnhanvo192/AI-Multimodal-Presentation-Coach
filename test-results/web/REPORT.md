# WEB TESTING (E2E PLAYWRIGHT) REPORT
**Thời gian xuất báo cáo:** 2026-11-08 16:25:49

## 1. CÁC CHỨC NĂNG NGHIỆP VỤ ĐƯỢC KIỂM THỬ
- **User Registration Workflow on Web UI (frontend/src/SignUpPage.tsx)**
- **User Login & Role-Based Navigation Workflow (frontend/src/LoginPage.tsx & App.tsx)**

## 2. KẾT QUẢ TỔNG QUAN
- **Tổng số ca kiểm thử:** 9
- **Passed (Thành công):** 9
- **Failed (Thất bại):** 0
- **Skipped (Bỏ qua):** 0
- **Thời gian thực thi:** 17.45 giây
- **Trạng thái:** **PASSED**

## 3. CHI TIẾT CÁC TEST CASES
| STT | Tên Test Case | Module / File | Thời gian (s) | Trạng thái |
| :---: | :--- | :--- | :---: | :---: |
| 1 | `1. Hiển thị giao diện đăng nhập, nút điền nhanh demo và các trường thông tin` | `user_login_rbac.spec.ts` | 6.15 | ✅ PASSED |
| 2 | `2. Kiểm tra tính năng ẩn / hiện mật khẩu (Show/Hide Password Toggle)` | `user_login_rbac.spec.ts` | 1.57 | ✅ PASSED |
| 3 | `3. Kiểm tra thông báo lỗi khi đăng nhập sai mật khẩu` | `user_login_rbac.spec.ts` | 1.14 | ✅ PASSED |
| 4 | `4. Đăng nhập thành công với vai trò Sinh viên và điều hướng chính xác vào /dashboard` | `user_login_rbac.spec.ts` | 2.15 | ✅ PASSED |
| 5 | `5. Đăng nhập thành công với vai trò Quản trị viên và điều hướng chính xác vào /admin/dashboard` | `user_login_rbac.spec.ts` | 1.14 | ✅ PASSED |
| 6 | `1. Hiển thị đầy đủ các trường nhập liệu và nút chức năng trên trang đăng ký` | `user_registration.spec.ts` | 0.99 | ✅ PASSED |
| 7 | `2. Kiểm tra xác thực validation khi mật khẩu xác nhận không khớp` | `user_registration.spec.ts` | 1.22 | ✅ PASSED |
| 8 | `3. Kiểm tra nút đăng ký bị vô hiệu hóa khi người dùng chưa đồng ý điều khoản` | `user_registration.spec.ts` | 1.45 | ✅ PASSED |
| 9 | `4. Đăng ký tài khoản thành công với thông tin hợp lệ và chuyển tiếp đến trang đăng nhập` | `user_registration.spec.ts` | 1.63 | ✅ PASSED |