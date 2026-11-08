"""
API Testing - Function 3: Admin System Configuration Management
Module: app.api.v1.endpoints.admin
Endpoints Tested:
  - GET /api/v1/admin/config
  - PUT /api/v1/admin/config
Scope:
  - Role-Based Access Control (401 for anonymous, 403 for student)
  - GET configuration with Admin credentials (200 OK & schema assertion)
  - PUT update valid configuration (200 OK & payload persistence)
  - PUT boundary values (WPM min/max, eye contact pct, rate limits)
  - PUT invalid data types (422 Unprocessable Entity)
"""

import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
class TestAdminSystemConfigAPI:
    """Kiểm thử API Quản lý Cấu hình Hệ thống Quản trị viên."""

    async def _create_user_and_get_token(self, ac: AsyncClient, role: str) -> str:
        unique_id = uuid.uuid4().hex[:8]
        email = f"user_{unique_id}@{role}.system.vn"
        password = "SecurePassword123!"

        reg_res = await ac.post(
            "/api/v1/auth/register",
            json={"email": email, "password": password, "full_name": f"Test {role.title()}", "role": role},
        )
        assert reg_res.status_code == 201

        login_res = await ac.post("/api/v1/auth/login", json={"email": email, "password": password})
        assert login_res.status_code == 200
        return login_res.json()["access_token"]

    async def test_get_config_unauthorized_without_token(self):
        """1. Kiểm tra từ chối 401 Unauthorized khi không gửi Bearer token."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/admin/config")
            assert res.status_code == 401
            assert "detail" in res.json()

    async def test_get_config_forbidden_for_student_role(self):
        """2. Kiểm tra từ chối 403 Forbidden khi tài khoản có role='student'."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            student_token = await self._create_user_and_get_token(ac, role="student")
            headers = {"Authorization": f"Bearer {student_token}"}

            res = await ac.get("/api/v1/admin/config", headers=headers)
            assert res.status_code == 403
            assert "quản trị viên" in res.json()["detail"].lower()

    async def test_get_config_success_for_admin(self):
        """3. Kiểm tra Admin truy xuất thành công cấu hình hệ thống (200 OK)."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            admin_token = await self._create_user_and_get_token(ac, role="admin")
            headers = {"Authorization": f"Bearer {admin_token}"}

            res = await ac.get("/api/v1/admin/config", headers=headers)
            assert res.status_code == 200
            data = res.json()

            # Schema assertion
            assert "min_eye_contact_pct" in data
            assert "ideal_wpm_min" in data
            assert "ideal_wpm_max" in data
            assert "max_filler_words_allowed" in data
            assert "max_uploads_per_window" in data
            assert "rate_limit_window_minutes" in data
            assert "max_file_size_mb" in data
            assert "weights" in data

    async def test_put_update_config_valid_payload(self):
        """4. Kiểm tra Admin cập nhật cấu hình hợp lệ và lưu trạng thái thành công."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            admin_token = await self._create_user_and_get_token(ac, role="admin")
            headers = {"Authorization": f"Bearer {admin_token}"}

            update_payload = {
                "min_eye_contact_pct": 75,
                "ideal_wpm_min": 135,
                "ideal_wpm_max": 165,
                "max_filler_words_allowed": 3,
                "max_uploads_per_window": 6,
                "rate_limit_window_minutes": 15,
                "max_file_size_mb": 150,
                "weights": {
                    "eye_contact": 0.30,
                    "speech_rate": 0.20,
                    "body_language": 0.20,
                    "pitch": 0.15,
                    "content": 0.15,
                },
            }

            put_res = await ac.put("/api/v1/admin/config", headers=headers, json=update_payload)
            assert put_res.status_code == 200
            updated = put_res.json()
            assert updated["min_eye_contact_pct"] == 75
            assert updated["ideal_wpm_min"] == 135
            assert updated["ideal_wpm_max"] == 165
            assert updated["max_file_size_mb"] == 150
            assert updated["weights"]["eye_contact"] == 0.30

            # Xác minh persistence bằng GET lại
            get_res = await ac.get("/api/v1/admin/config", headers=headers)
            assert get_res.status_code == 200
            assert get_res.json()["min_eye_contact_pct"] == 75

    async def test_put_update_config_boundary_values(self):
        """5. Kiểm tra cập nhật giá trị biên (min 0, max 100, max size lớn)."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            admin_token = await self._create_user_and_get_token(ac, role="admin")
            headers = {"Authorization": f"Bearer {admin_token}"}

            boundary_payload = {
                "min_eye_contact_pct": 50,
                "ideal_wpm_min": 100,
                "ideal_wpm_max": 200,
                "max_filler_words_allowed": 0,
                "max_uploads_per_window": 1,
                "rate_limit_window_minutes": 1,
                "max_file_size_mb": 500,
                "weights": {
                    "eye_contact": 0.50,
                    "speech_rate": 0.50,
                    "body_language": 0.0,
                    "pitch": 0.0,
                    "content": 0.0,
                },
            }

            res = await ac.put("/api/v1/admin/config", headers=headers, json=boundary_payload)
            assert res.status_code == 200
            assert res.json()["ideal_wpm_min"] == 100
            assert res.json()["max_file_size_mb"] == 500

    async def test_put_update_config_invalid_data_types(self):
        """6. Kiểm tra từ chối 422 Unprocessable Entity khi gửi sai kiểu dữ liệu."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            admin_token = await self._create_user_and_get_token(ac, role="admin")
            headers = {"Authorization": f"Bearer {admin_token}"}

            invalid_payload = {
                "min_eye_contact_pct": "not_a_number",  # Sai kiểu dữ liệu
                "ideal_wpm_min": 130,
            }

            res = await ac.put("/api/v1/admin/config", headers=headers, json=invalid_payload)
            assert res.status_code == 422

