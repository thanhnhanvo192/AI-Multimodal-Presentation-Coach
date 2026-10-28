import io
import uuid
import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_presentation_upload_and_status_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Đăng ký tài khoản để test upload
        email = f"presenter_{uuid.uuid4().hex[:8]}@student.edu.vn"
        password = "Password123!"
        await ac.post(
            "/api/v1/auth/register",
            json={"email": email, "password": password, "full_name": "Nguyen Presentation"}
        )

        # 2. Đăng nhập lấy Bearer token
        login_resp = await ac.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password}
        )
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Tạo file video giả lập (.mp4)
        dummy_video_content = b"fake-video-content-for-testing"
        files = {
            "file": ("test_presentation.mp4", io.BytesIO(dummy_video_content), "video/mp4")
        }
        data = {
            "title": "Báo cáo thử nghiệm Sprint 2",
            "scenario": "ACADEMIC"
        }

        # 4. Gửi request Upload Video
        upload_resp = await ac.post(
            "/api/v1/presentations/upload",
            headers=headers,
            data=data,
            files=files
        )
        assert upload_resp.status_code == 202
        upload_data = upload_resp.json()
        assert "id" in upload_data
        pres_id = upload_data["id"]
        assert upload_data["title"] == "Báo cáo thử nghiệm Sprint 2"
        assert upload_data["scenario"] == "ACADEMIC"

        # 5. Kiểm tra Polling Status
        status_resp = await ac.get(
            f"/api/v1/presentations/{pres_id}/status",
            headers=headers
        )
        assert status_resp.status_code == 200
        status_data = status_resp.json()
        assert status_data["id"] == pres_id
        assert "status" in status_data
        assert "progress_percentage" in status_data

        # 6. Kiểm tra Danh sách Lịch sử
        history_resp = await ac.get(
            "/api/v1/presentations/history",
            headers=headers
        )
        assert history_resp.status_code == 200
        history_items = history_resp.json()
        assert len(history_items) >= 1
        assert any(item["id"] == pres_id for item in history_items)

        # 7. Kiểm tra Lấy Báo cáo Đầy đủ (Report)
        from app.services.video_processor import process_video_background
        await process_video_background(pres_id)

        report_resp = await ac.get(
            f"/api/v1/presentations/{pres_id}/report",
            headers=headers
        )
        assert report_resp.status_code == 200
        report_data = report_resp.json()
        assert report_data["presentation_id"] == pres_id
        assert "video_url" in report_data
        assert "total_score" in report_data
        assert "radar_scores" in report_data
        assert "timeline_errors" in report_data
        assert "ai_feedback" in report_data

