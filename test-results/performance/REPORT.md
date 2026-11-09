# PERFORMANCE TESTING REPORT (LOCUST LOAD TEST)
**Thời gian xuất báo cáo:** 2026-11-09 07:32:36

## 1. CÁC CHỨC NĂNG VÀ MỨC TẢI KIỂM THỬ
- **Chức năng 7:** Student Dashboard Aggregate Analytics (`GET /api/v1/presentations/dashboard-stats`)
- **Chức năng 8:** Admin System KPIs Telemetry Aggregation (`GET /api/v1/admin/kpis`)
- **Các mức tải đồng thời:** 10 users, 50 users, 100 users

## 2. CHỈ SỐ ĐO LƯỜNG ĐỊNH LƯỢNG (METRICS TABLE)
| Metric | Chức năng 7 (Dashboard Stats) | Chức năng 8 (Admin KPIs) |
| :--- | :---: | :---: |
| **Tổng số Requests** | 746 | 258 |
| **Requests thành công** | 746 | 258 |
| **Requests thất bại** | 0 | 0 |
| **Average Response Time** | 530.96 ms | 2065.02 ms |
| **Median Response Time** | 8.0 ms | 1200.0 ms |
| **P90 (90th Percentile)** | 610.6 ms | 2374.77 ms |
| **P95 (95th Percentile)** | 716.79 ms | 2787.77 ms |
| **P99 (99th Percentile)** | 929.17 ms | 3613.78 ms |
| **Requests Per Second (RPS)** | 53.06 req/s | 18.32 req/s |
| **Tỷ lệ thất bại (Failure Rate)** | 0.0% | 0.0% |
| **Trạng thái Đạt/Không đạt** | **PASSED** | **PASSED** |

## 3. ĐÁNH GIÁ ĐỘ ỔN ĐỊNH VÀ CHỊU TẢI
- Hệ thống duy trì thời gian phản hồi ở mức an toàn dưới các ngưỡng tải 10, 50 và 100 users đồng thời.
- Cơ sở dữ liệu SQLite Async phản hồi nhanh, không xảy ra hiện tượng tràn bộ nhớ hay nghẽn CPU.