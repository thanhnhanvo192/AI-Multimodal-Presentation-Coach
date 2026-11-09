# API TESTING (FASTAPI TESTCLIENT & HTTPX) REPORT
**Thời gian xuất báo cáo:** 2026-11-09 07:32:36

## 1. CÁC CHỨC NĂNG NGHIỆP VỤ ĐƯỢC KIỂM THỬ
- **Admin System Configuration Management (GET / PUT /api/v1/admin/config)**
- **Admin Student Account Status Management (PATCH /api/v1/admin/users/{user_id}/status)**

## 2. KẾT QUẢ TỔNG QUAN
- **Tổng số ca kiểm thử:** 10
- **Passed (Thành công):** 10
- **Failed (Thất bại):** 0
- **Skipped (Bỏ qua):** 0
- **Thời gian thực thi:** 15.14 giây
- **Trạng thái:** **PASSED**

## 3. CHI TIẾT CÁC TEST CASES
| STT | Tên Test Case | Module / File | Thời gian (s) | Trạng thái |
| :---: | :--- | :--- | :---: | :---: |
| 1 | `test_get_config_unauthorized_without_token` | `tests.api.test_admin_config.TestAdminSystemConfigAPI` | 0.09 | ✅ PASSED |
| 2 | `test_get_config_forbidden_for_student_role` | `tests.api.test_admin_config.TestAdminSystemConfigAPI` | 1.06 | ✅ PASSED |
| 3 | `test_get_config_success_for_admin` | `tests.api.test_admin_config.TestAdminSystemConfigAPI` | 1.03 | ✅ PASSED |
| 4 | `test_put_update_config_valid_payload` | `tests.api.test_admin_config.TestAdminSystemConfigAPI` | 1.05 | ✅ PASSED |
| 5 | `test_put_update_config_boundary_values` | `tests.api.test_admin_config.TestAdminSystemConfigAPI` | 1.11 | ✅ PASSED |
| 6 | `test_put_update_config_invalid_data_types` | `tests.api.test_admin_config.TestAdminSystemConfigAPI` | 1.13 | ✅ PASSED |
| 7 | `test_user_status_unauthorized_and_forbidden` | `tests.api.test_admin_user_status.TestAdminUserStatusAPI` | 2.25 | ✅ PASSED |
| 8 | `test_ban_and_unban_student_lifecycle` | `tests.api.test_admin_user_status.TestAdminUserStatusAPI` | 2.83 | ✅ PASSED |
| 9 | `test_admin_cannot_ban_themselves` | `tests.api.test_admin_user_status.TestAdminUserStatusAPI` | 1.70 | ✅ PASSED |
| 10 | `test_update_non_existent_user_returns_404` | `tests.api.test_admin_user_status.TestAdminUserStatusAPI` | 1.78 | ✅ PASSED |