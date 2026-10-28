import io
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.video_processor import process_video_background

@pytest.mark.asyncio
async def test_end_to_end_presentation_coach_system():
    """
    KIỂM THỬ TỔNG THỂ TOÀN DIỆN (END-TO-END PIPELINE):
    1. Đăng ký & Đăng nhập Student
    2. Kiểm tra giới hạn kích thước file (Validation & Error 413)
    3. Tải lên video hợp lệ (Upload -> 202 Accepted)
    4. Giám sát tiến độ xử lý nền (Polling Status)
    5. Xử lý video AI (MediaPipe + Audio Metrics)
    6. Truy xuất Báo cáo Đánh giá (Detailed Report)
    7. Cập nhật Lịch sử & Dashboard Sinh viên
    8. Quản trị viên (Admin KPIs, Quản lý Users, Khóa/Mở khóa, Cấu hình, Logs)
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # ─────────────────────────────────────────────────────────────
        # GIAI ĐOẠN 1: SINH VIÊN ĐĂNG KÝ VÀ ĐĂNG NHẬP
        # ─────────────────────────────────────────────────────────────
        student_email = f"e2e_student_{uuid.uuid4().hex[:8]}@student.edu.vn"
        student_password = "StudentPassword@2026"
        student_name = "Hoàng Nhật Minh"

        # Đăng ký tài khoản
        reg_res = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": student_email,
                "password": student_password,
                "full_name": student_name,
                "role": "student"
            }
        )
        assert reg_res.status_code == 201
        reg_data = reg_res.json()
        assert reg_data["email"] == student_email
        assert reg_data["role"] == "student"

        # Đăng nhập lấy Bearer token
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": student_email, "password": student_password}
        )
        assert login_res.status_code == 200
        student_token = login_res.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}

        # Tra cứu hồ sơ cá nhân
        me_res = await ac.get("/api/v1/auth/me", headers=student_headers)
        assert me_res.status_code == 200
        assert me_res.json()["full_name"] == student_name

        # ─────────────────────────────────────────────────────────────
        # GIAI ĐOẠN 2: KIỂM THỬ XỬ LÝ NGOẠI LỆ & GIỚI HẠN FILE UPLOAD
        # ─────────────────────────────────────────────────────────────
        # a. Thử upload file sai định dạng (ví dụ .txt)
        bad_ext_file = {"file": ("malicious.txt", io.BytesIO(b"fake text"), "text/plain")}
        bad_ext_res = await ac.post(
            "/api/v1/presentations/upload",
            headers=student_headers,
            files=bad_ext_file,
            data={"title": "Test Bad Extension", "scenario": "ACADEMIC"}
        )
        assert bad_ext_res.status_code == 400

        # b. Thử upload file vượt quá giới hạn 100MB (> 100 * 1024 * 1024 bytes)
        # Mô phỏng kiểm tra dung lượng thông qua payload vượt ngưỡng
        oversized_bytes = b"0" * (101 * 1024 * 1024)
        oversized_file = {"file": ("huge_video.mp4", io.BytesIO(oversized_bytes), "video/mp4")}
        oversized_res = await ac.post(
            "/api/v1/presentations/upload",
            headers=student_headers,
            files=oversized_file,
            data={"title": "Video quá cỡ", "scenario": "ACADEMIC"}
        )
        assert oversized_res.status_code == 413
        assert "vượt quá giới hạn tối đa" in oversized_res.json()["detail"]

        # ─────────────────────────────────────────────────────────────
        # GIAI ĐOẠN 3: TẢI LÊN VIDEO HỢP LỆ & THEO DÕI TIẾN TRÌNH
        # ─────────────────────────────────────────────────────────────
        valid_video_bytes = b"valid-mp4-video-data-content"
        valid_file = {"file": ("e2e_pitching.mp4", io.BytesIO(valid_video_bytes), "video/mp4")}
        upload_res = await ac.post(
            "/api/v1/presentations/upload",
            headers=student_headers,
            files=valid_file,
            data={"title": "Pitching Khởi nghiệp PBL6 E2E", "scenario": "PITCHING"}
        )
        assert upload_res.status_code == 202
        upload_data = upload_res.json()
        pres_id = upload_data["id"]
        assert upload_data["scenario"] == "PITCHING"
        assert upload_data["status"] == "PENDING"

        # Tra cứu trạng thái ban đầu qua Polling API
        status_res = await ac.get(f"/api/v1/presentations/{pres_id}/status", headers=student_headers)
        assert status_res.status_code == 200
        assert status_res.json()["id"] == pres_id

        # ─────────────────────────────────────────────────────────────
        # GIAI ĐOẠN 4: TIẾN TRÌNH XỬ LÝ AI NGẦM (BACKGROUND PROCESSOR)
        # ─────────────────────────────────────────────────────────────
        await process_video_background(pres_id)

        # Kiểm tra trạng thái đã hoàn tất 100%
        completed_status_res = await ac.get(f"/api/v1/presentations/{pres_id}/status", headers=student_headers)
        assert completed_status_res.status_code == 200
        assert completed_status_res.json()["status"] == "COMPLETED"
        assert completed_status_res.json()["progress_percentage"] == 100

        # ─────────────────────────────────────────────────────────────
        # GIAI ĐOẠN 5: TRUY XUẤT BÁO CÁO KẾT QUẢ ĐẦY ĐỦ (REPORT)
        # ─────────────────────────────────────────────────────────────
        report_res = await ac.get(f"/api/v1/presentations/{pres_id}/report", headers=student_headers)
        assert report_res.status_code == 200
        report = report_res.json()
        assert report["presentation_id"] == pres_id
        assert report["total_score"] >= 0
        assert "radar_scores" in report
        assert "eye_contact" in report["radar_scores"]
        assert "body_language" in report["radar_scores"]
        assert "speech_rate" in report["radar_scores"]
        assert "audio_metrics" in report
        assert "wpm" in report["audio_metrics"]
        assert "ai_feedback" in report
        assert len(report["ai_feedback"]["strengths"]) >= 1

        # ─────────────────────────────────────────────────────────────
        # GIAI ĐOẠN 6: LỊCH SỬ & THỐNG KÊ SINH VIÊN (DASHBOARD)
        # ─────────────────────────────────────────────────────────────
        history_res = await ac.get("/api/v1/presentations/history", headers=student_headers)
        assert history_res.status_code == 200
        history_items = history_res.json()
        matched = next((item for item in history_items if item["id"] == pres_id), None)
        assert matched is not None
        assert matched["total_score"] is not None

        stats_res = await ac.get("/api/v1/presentations/dashboard-stats", headers=student_headers)
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert stats["total_sessions"] >= 1
        assert len(stats["weekly_trends"]) == 4

        # ─────────────────────────────────────────────────────────────
        # GIAI ĐOẠN 7: MODULE QUẢN TRỊ VIÊN (ADMIN E2E)
        # ─────────────────────────────────────────────────────────────
        admin_email = f"e2e_admin_{uuid.uuid4().hex[:8]}@system.edu.vn"
        admin_pass = "AdminSecured@123"
        await ac.post(
            "/api/v1/auth/register",
            json={"email": admin_email, "password": admin_pass, "full_name": "E2E Administrator", "role": "admin"}
        )
        admin_login = await ac.post("/api/v1/auth/login", json={"email": admin_email, "password": admin_pass})
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # Lấy KPIs hệ thống
        kpis_res = await ac.get("/api/v1/admin/kpis", headers=admin_headers)
        assert kpis_res.status_code == 200
        assert kpis_res.json()["totalStudents"] >= 1

        # Tìm kiếm sinh viên vừa tạo
        search_users_res = await ac.get(f"/api/v1/admin/users?search={student_email}", headers=admin_headers)
        assert search_users_res.status_code == 200
        found_users = search_users_res.json()["items"]
        assert len(found_users) == 1
        created_user_id = found_users[0]["id"]

        # Admin khóa tài khoản sinh viên
        ban_res = await ac.patch(
            f"/api/v1/admin/users/{created_user_id}/status",
            headers=admin_headers,
            json={"status": "banned"}
        )
        assert ban_res.status_code == 200
        assert ban_res.json()["status"] == "banned"

        # Sinh viên bị khóa thử đăng nhập -> bị chặn 403
        banned_login = await ac.post("/api/v1/auth/login", json={"email": student_email, "password": student_password})
        assert banned_login.status_code == 403

        # Admin mở khóa tài khoản
        unban_res = await ac.patch(
            f"/api/v1/admin/users/{created_user_id}/status",
            headers=admin_headers,
            json={"status": "active"}
        )
        assert unban_res.status_code == 200
        assert unban_res.json()["status"] == "active"

        # Sinh viên đăng nhập lại thành công
        restored_login = await ac.post("/api/v1/auth/login", json={"email": student_email, "password": student_password})
        assert restored_login.status_code == 200

        # Kiểm tra Cấu hình hệ thống (Config) & Logs
        config_res = await ac.get("/api/v1/admin/config", headers=admin_headers)
        assert config_res.status_code == 200

        logs_res = await ac.get("/api/v1/admin/logs?limit=5", headers=admin_headers)
        assert logs_res.status_code == 200
        assert len(logs_res.json()["items"]) >= 1
