"""
API Testing - Function 4: Admin Student Account Status Management
Module: app.api.v1.endpoints.admin
Endpoint Tested:
  - PATCH /api/v1/admin/users/{user_id}/status
Scope:
  - RBAC verification (401 Unauthorized, 403 Forbidden for students)
  - Admin locks student account (status="banned") -> 200 OK
  - Banned student account login attempt blocked with 403 Forbidden
  - Admin unlocks student account (status="active") -> 200 OK
  - Unlocked student can login successfully -> 200 OK
  - Admin self-ban prevention constraint -> 400 Bad Request
  - Non-existent user identification handling -> 404 Not Found
"""

import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
class TestAdminUserStatusAPI:
    """Kiểm thử API Quản lý Trạng thái Tài khoản Sinh viên."""

    async def _setup_admin_and_student(self, ac: AsyncClient):
        # 1. Admin
        adm_id = uuid.uuid4().hex[:8]
        adm_email = f"adm_{adm_id}@admin.vn"
        adm_pass = "AdminSecured123!"
        await ac.post(
            "/api/v1/auth/register",
            json={"email": adm_email, "password": adm_pass, "full_name": "Admin Tester", "role": "admin"},
        )
        adm_login = await ac.post("/api/v1/auth/login", json={"email": adm_email, "password": adm_pass})
        adm_token = adm_login.json()["access_token"]
        adm_headers = {"Authorization": f"Bearer {adm_token}"}
        adm_user_id = adm_login.json()["user"]["id"]

        # 2. Student
        stu_id = uuid.uuid4().hex[:8]
        stu_email = f"stu_{stu_id}@student.vn"
        stu_pass = "StudentPass123!"
        stu_reg = await ac.post(
            "/api/v1/auth/register",
            json={"email": stu_email, "password": stu_pass, "full_name": "Nguyen Van SinhVien", "role": "student"},
        )
        stu_data = stu_reg.json()
        stu_user_id = stu_data["id"]

        return {
            "adm_headers": adm_headers,
            "adm_user_id": adm_user_id,
            "stu_email": stu_email,
            "stu_pass": stu_pass,
            "stu_user_id": stu_user_id,
        }

    async def test_user_status_unauthorized_and_forbidden(self):
        """1. Kiểm tra 401 khi không có token và 403 khi là sinh viên thông thường."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            env = await self._setup_admin_and_student(ac)

            # a. Không có token -> 401
            res_no_auth = await ac.patch(f"/api/v1/admin/users/{env['stu_user_id']}/status", json={"status": "banned"})
            assert res_no_auth.status_code == 401

            # b. Token của sinh viên -> 403
            stu_login = await ac.post("/api/v1/auth/login", json={"email": env["stu_email"], "password": env["stu_pass"]})
            stu_token = stu_login.json()["access_token"]
            stu_headers = {"Authorization": f"Bearer {stu_token}"}

            res_stu_forbidden = await ac.patch(
                f"/api/v1/admin/users/{env['stu_user_id']}/status",
                headers=stu_headers,
                json={"status": "banned"},
            )
            assert res_stu_forbidden.status_code == 403

    async def test_ban_and_unban_student_lifecycle(self):
        """2. Kiểm tra chu trình khóa tài khoản sinh viên và mở khóa thành công."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            env = await self._setup_admin_and_student(ac)
            adm_headers = env["adm_headers"]
            stu_user_id = env["stu_user_id"]
            stu_email = env["stu_email"]
            stu_pass = env["stu_pass"]

            # Bước A: Khóa tài khoản sinh viên (status -> "banned")
            ban_res = await ac.patch(
                f"/api/v1/admin/users/{stu_user_id}/status",
                headers=adm_headers,
                json={"status": "banned"},
            )
            assert ban_res.status_code == 200
            assert ban_res.json()["status"] == "banned"

            # Bước B: Sinh viên bị khóa cố gắng đăng nhập -> phải bị 403 Forbidden
            blocked_login = await ac.post("/api/v1/auth/login", json={"email": stu_email, "password": stu_pass})
            assert blocked_login.status_code == 403
            assert "khóa" in blocked_login.json()["detail"].lower()

            # Bước C: Quản trị viên mở khóa tài khoản (status -> "active")
            unban_res = await ac.patch(
                f"/api/v1/admin/users/{stu_user_id}/status",
                headers=adm_headers,
                json={"status": "active"},
            )
            assert unban_res.status_code == 200
            assert unban_res.json()["status"] == "active"

            # Bước D: Sinh viên đăng nhập lại thành công
            allowed_login = await ac.post("/api/v1/auth/login", json={"email": stu_email, "password": stu_pass})
            assert allowed_login.status_code == 200
            assert "access_token" in allowed_login.json()

    async def test_admin_cannot_ban_themselves(self):
        """3. Kiểm tra ràng buộc an toàn: Quản trị viên không thể tự khóa tài khoản của mình."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            env = await self._setup_admin_and_student(ac)
            adm_headers = env["adm_headers"]
            adm_id = env["adm_user_id"]

            res = await ac.patch(
                f"/api/v1/admin/users/{adm_id}/status",
                headers=adm_headers,
                json={"status": "banned"},
            )
            assert res.status_code == 400
            assert "không thể tự khóa" in res.json()["detail"].lower()

    async def test_update_non_existent_user_returns_404(self):
        """4. Kiểm tra xử lý lỗi khi mã người dùng không tồn tại -> trả về 404 Not Found."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            env = await self._setup_admin_and_student(ac)
            adm_headers = env["adm_headers"]

            res = await ac.patch(
                "/api/v1/admin/users/999999/status",
                headers=adm_headers,
                json={"status": "banned"},
            )
            assert res.status_code == 404
            assert "không tìm thấy" in res.json()["detail"].lower()

