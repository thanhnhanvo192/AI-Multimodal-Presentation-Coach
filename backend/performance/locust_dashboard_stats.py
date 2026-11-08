"""
Performance Testing - Function 7: Student Dashboard Aggregate Analytics
Module: app.api.v1.endpoints.presentations
Target Endpoint: GET /api/v1/presentations/dashboard-stats
Tool: Locust
Scope:
  - Simulate concurrent student users accessing aggregate analytics
  - Measure response times (avg, median, p90, p95, p99), RPS, and failure rate
  - Validate response payload structure and database aggregation under load
"""

import os
from locust import HttpUser, task, between


class StudentDashboardUser(HttpUser):
    """Giả lập sinh viên truy cập Dashboard tổng hợp chỉ số kỹ năng."""

    # Thời gian chờ giữa các lượt request (mô phỏng tương tác thực tế)
    wait_time = between(0.1, 0.5)

    def on_start(self):
        """Khởi tạo phiên người dùng: Đăng nhập lấy Bearer Token."""
        self.email = os.environ.get("TEST_STUDENT_EMAIL", "son.dang@student.edu.vn")
        self.password = os.environ.get("TEST_STUDENT_PASSWORD", "Student@123")

        response = self.client.post(
            "/api/v1/auth/login",
            json={"email": self.email, "password": self.password},
            name="Auth: Student Login"
        )

        if response.status_code == 200:
            token = response.json().get("access_token")
            self.headers = {"Authorization": f"Bearer {token}"}
        else:
            self.headers = {}

    @task(10)
    def get_dashboard_stats(self):
        """Truy vấn dữ liệu KPI tổng hợp và xu hướng tuần của sinh viên."""
        with self.client.get(
            "/api/v1/presentations/dashboard-stats",
            headers=self.headers,
            catch_response=True,
            name="GET /api/v1/presentations/dashboard-stats"
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Xác thực cấu trúc dữ liệu tổng hợp
                    if "total_sessions" in data and "average_score" in data and "weekly_trends" in data:
                        response.success()
                    else:
                        response.failure("Payload thiếu các trường bắt buộc của DashboardStatsResponse")
                except Exception as e:
                    response.failure(f"JSON decode error: {e}")
            elif response.status_code == 401:
                response.failure("Lỗi xác thực 401 Unauthorized")
            else:
                response.failure(f"HTTP Status {response.status_code}: {response.text}")

