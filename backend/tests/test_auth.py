import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_user_registration_flow():
    test_email = f"testuser_{uuid.uuid4().hex[:8]}@pbl6.vn"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register user
        register_payload = {
            "email": test_email,
            "password": "securepassword123",
            "full_name": "Nguyen Van A"
        }
        response = await ac.post("/api/v1/auth/register", json=register_payload)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_email
        assert data["full_name"] == "Nguyen Van A"

        # Login user
        login_payload = {
            "username": test_email,
            "password": "securepassword123"
        }
        login_resp = await ac.post("/api/v1/auth/login", data=login_payload)
        assert login_resp.status_code == 200
        token_data = login_resp.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"

        # Get profile with token
        headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        profile_resp = await ac.get("/api/v1/auth/me", headers=headers)
        assert profile_resp.status_code == 200
        profile_data = profile_resp.json()
        assert profile_data["email"] == test_email
