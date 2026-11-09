# UNIT TESTING (PYTEST) REPORT
**Thời gian xuất báo cáo:** 2026-11-09 07:32:36

## 1. CÁC CHỨC NĂNG NGHIỆP VỤ ĐƯỢC KIỂM THỬ
- **Password Hashing & Bcrypt Verification (backend/app/core/security.py)**
- **AI Scoring, Badge Allocation & Telemetry Formatting (backend/app/services/ai_engine_service.py)**

## 2. KẾT QUẢ TỔNG QUAN
- **Tổng số ca kiểm thử:** 22
- **Passed (Thành công):** 22
- **Failed (Thất bại):** 0
- **Skipped (Bỏ qua):** 0
- **Thời gian thực thi:** 13.70 giây
- **Trạng thái:** **PASSED**

## 3. CHI TIẾT CÁC TEST CASES
| STT | Tên Test Case | Module / File | Thời gian (s) | Trạng thái |
| :---: | :--- | :--- | :---: | :---: |
| 1 | `test_calculate_badge_title_thresholds[100.0-Di\u1ec5n gi\u1ea3 Xu\u1ea5t s\u1eafc]` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.07 | ✅ PASSED |
| 2 | `test_calculate_badge_title_thresholds[90.0-Di\u1ec5n gi\u1ea3 Xu\u1ea5t s\u1eafc]` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 3 | `test_calculate_badge_title_thresholds[89.9-Di\u1ec5n gi\u1ea3 T\u1ef1 tin]` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 4 | `test_calculate_badge_title_thresholds[80.0-Di\u1ec5n gi\u1ea3 T\u1ef1 tin]` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 5 | `test_calculate_badge_title_thresholds[79.9-Di\u1ec5n gi\u1ea3 Tri\u1ec3n v\u1ecdng]` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 6 | `test_calculate_badge_title_thresholds[70.0-Di\u1ec5n gi\u1ea3 Tri\u1ec3n v\u1ecdng]` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 7 | `test_calculate_badge_title_thresholds[69.9-Ng\u01b0\u1eddi r\xe8n luy\u1ec7n Ch\u0103m ch\u1ec9]` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 8 | `test_calculate_badge_title_thresholds[55.0-Ng\u01b0\u1eddi r\xe8n luy\u1ec7n Ch\u0103m ch\u1ec9]` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 9 | `test_calculate_badge_title_thresholds[54.9-Ng\u01b0\u1eddi m\u1edbi B\u1eaft \u0111\u1ea7u]` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 10 | `test_calculate_badge_title_thresholds[0.0-Ng\u01b0\u1eddi m\u1edbi B\u1eaft \u0111\u1ea7u]` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 11 | `test_map_scenario_to_context` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 12 | `test_format_ai_result_structure` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 13 | `test_timeline_errors_capping_at_25` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 14 | `test_format_empty_ai_result_fallback` | `tests.unit.test_ai_scoring_formatting.TestAIScoringAndFormatting` | 0.00 | ✅ PASSED |
| 15 | `test_hash_generation_and_successful_verification` | `tests.unit.test_password_hashing.TestPasswordHashingAndVerification` | 1.19 | ✅ PASSED |
| 16 | `test_random_salt_generation` | `tests.unit.test_password_hashing.TestPasswordHashingAndVerification` | 2.39 | ✅ PASSED |
| 17 | `test_wrong_password_rejected` | `tests.unit.test_password_hashing.TestPasswordHashingAndVerification` | 1.80 | ✅ PASSED |
| 18 | `test_case_sensitivity` | `tests.unit.test_password_hashing.TestPasswordHashingAndVerification` | 1.78 | ✅ PASSED |
| 19 | `test_unicode_vietnamese_passwords` | `tests.unit.test_password_hashing.TestPasswordHashingAndVerification` | 1.76 | ✅ PASSED |
| 20 | `test_long_password_boundary_72_bytes` | `tests.unit.test_password_hashing.TestPasswordHashingAndVerification` | 2.34 | ✅ PASSED |
| 21 | `test_empty_password_handling` | `tests.unit.test_password_hashing.TestPasswordHashingAndVerification` | 1.76 | ✅ PASSED |
| 22 | `test_malformed_hash_graceful_handling` | `tests.unit.test_password_hashing.TestPasswordHashingAndVerification` | 0.01 | ✅ PASSED |