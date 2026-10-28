import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_admin_module_full_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Tạo 1 tài khoản Student và 1 tài khoản Admin
        student_email = f"student_{uuid.uuid4().hex[:8]}@student.edu.vn"
        student_pass = "StudentPass123!"
        await ac.post(
            "/api/v1/auth/register",
            json={"email": student_email, "password": student_pass, "full_name": "Test Student", "role": "student"}
        )

        admin_email = f"admin_{uuid.uuid4().hex[:8]}@system.edu.vn"
        admin_pass = "AdminPass123!"
        await ac.post(
            "/api/v1/auth/register",
            json={"email": admin_email, "password": admin_pass, "full_name": "Test Admin", "role": "admin"}
        )

        # Đăng nhập lấy Token
        student_login = await ac.post("/api/v1/auth/login", json={"email": student_email, "password": student_pass})
        assert student_login.status_code == 200
        student_token = student_login.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}

        admin_login = await ac.post("/api/v1/auth/login", json={"email": admin_email, "password": admin_pass})
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 2. Kiểm tra Phân quyền (RBAC Route Guard)
        # a. Không có token -> 401
        resp_no_auth = await ac.get("/api/v1/admin/kpis")
        assert resp_no_auth.status_code == 401

        # b. Token của Student -> 403 Forbidden
        resp_student_forbidden = await ac.get("/api/v1/admin/kpis", headers=student_headers)
        assert resp_student_forbidden.status_code == 403

        # 3. Kiểm tra GET /api/v1/admin/kpis với Admin Token
        kpis_resp = await ac.get("/api/v1/admin/kpis", headers=admin_headers)
        assert kpis_resp.status_code == 200
        kpis = kpis_resp.json()
        assert "totalStudents" in kpis
        assert "activeStudents" in kpis
        assert "totalSessions" in kpis
        assert "avgScore" in kpis
        assert "completionRate" in kpis
        assert "activity_chart_7d" in kpis
        assert len(kpis["activity_chart_7d"]) == 7
        assert "topic_distribution" in kpis
        assert len(kpis["topic_distribution"]) >= 1

        # 4. Kiểm tra GET /api/v1/admin/users
        users_resp = await ac.get(f"/api/v1/admin/users?search={student_email}", headers=admin_headers)
        assert users_resp.status_code == 200
        users_data = users_resp.json()
        assert "total" in users_data
        assert "items" in users_data
        assert users_data["total"] >= 1
        # Tìm thấy sinh viên vừa tạo
        target_student = next((u for u in users_data["items"] if u["email"] == student_email), None)
        assert target_student is not None
        assert target_student["status"] == "active"
        student_user_id = target_student["id"]

        # 5. Kiểm tra PATCH /api/v1/admin/users/{user_id}/status: Khóa tài khoản
        ban_resp = await ac.patch(
            f"/api/v1/admin/users/{student_user_id}/status",
            headers=admin_headers,
            json={"status": "banned"}
        )
        assert ban_resp.status_code == 200
        ban_data = ban_resp.json()
        assert ban_data["status"] == "banned"

        # Sinh viên bị khóa không thể đăng nhập
        blocked_login = await ac.post("/api/v1/auth/login", json={"email": student_email, "password": student_pass})
        assert blocked_login.status_code == 403

        # Mở khóa tài khoản lại
        unban_resp = await ac.patch(
            f"/api/v1/admin/users/{student_user_id}/status",
            headers=admin_headers,
            json={"status": "active"}
        )
        assert unban_resp.status_code == 200
        assert unban_resp.json()["status"] == "active"

        # Admin không thể tự khóa mình
        self_ban = await ac.patch(
            f"/api/v1/admin/users/{admin_login.json()['user']['id']}/status",
            headers=admin_headers,
            json={"status": "banned"}
        )
        assert self_ban.status_code == 400

        # 6. Kiểm tra GET & PUT /api/v1/admin/config
        config_get = await ac.get("/api/v1/admin/config", headers=admin_headers)
        assert config_get.status_code == 200
        current_config = config_get.json()
        assert "min_eye_contact_pct" in current_config
        assert "weights" in current_config

        updated_payload = {
            **current_config,
            "min_eye_contact_pct": 75,
            "max_uploads_per_window": 8
        }
        config_put = await ac.put("/api/v1/admin/config", headers=admin_headers, json=updated_payload)
        assert config_put.status_code == 200
        assert config_put.json()["min_eye_contact_pct"] == 75
        assert config_put.json()["max_uploads_per_window"] == 8

        # 7. Kiểm tra GET /api/v1/admin/logs
        logs_resp = await ac.get("/api/v1/admin/logs?limit=10", headers=admin_headers)
        assert logs_resp.status_code == 200
        logs_data = logs_resp.json()
        assert "total" in logs_data
        assert "items" in logs_data
        assert len(logs_data["items"]) >= 1
        assert "message" in logs_data["items"][0]
        assert "level" in logs_data["items"][0]
