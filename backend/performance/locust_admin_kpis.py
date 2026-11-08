"""
Performance Testing - Function 8: Admin System KPIs Telemetry Aggregation
Module: app.api.v1.endpoints.admin
Target Endpoint: GET /api/v1/admin/kpis
Tool: Locust
Scope:
  - Simulate concurrent administrators monitoring institution-wide KPIs
  - Measure multi-table aggregation load (COUNT, AVG, timeseries grouping)
  - Measure response times (avg, median, p90, p95, p99), RPS, and failure rate
  - Verify RBAC under concurrent administrative access
"""

import os
from locust import HttpUser, task, between


class AdminKPIUser(HttpUser):
    """Giả lập Quản trị viên truy cập màn hình giám sát KPIs toàn hệ thống."""

    # Thời gian chờ giữa các lượt request
    wait_time = between(0.1, 0.5)

    def on_start(self):
        """Khởi tạo phiên: Đăng nhập tài khoản Quản trị viên lấy Token."""
        self.email = os.environ.get("TEST_ADMIN_EMAIL", "admin@system.edu.vn")
        self.password = os.environ.get("TEST_ADMIN_PASSWORD", "Admin@123")

        response = self.client.post(
            "/api/v1/auth/login",
            json={"email": self.email, "password": self.password},
            name="Auth: Admin Login"
        )

        if response.status_code == 200:
            token = response.json().get("access_token")
            self.headers = {"Authorization": f"Bearer {token}"}
        else:
            self.headers = {}

    @task(10)
    def get_admin_kpis(self):
        """Truy vấn tổng hợp chỉ số KPI quản trị toàn trường."""
        with self.client.get(
            "/api/v1/admin/kpis",
            headers=self.headers,
            catch_response=True,
            name="GET /api/v1/admin/kpis"
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Xác thực các trường KPI cốt lõi
                    if "totalStudents" in data and "totalSessions" in data and "completionRate" in data:
                        response.success()
                    else:
                        response.failure("Payload thiếu các trường bắt buộc của AdminKPIsResponse")
                except Exception as e:
                    response.failure(f"JSON decode error: {e}")
            elif response.status_code in (401, 403):
                response.failure(f"Lỗi phân quyền {response.status_code}: {response.text}")
            else:
                response.failure(f"HTTP Status {response.status_code}: {response.text}")

