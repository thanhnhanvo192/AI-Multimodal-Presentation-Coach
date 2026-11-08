"""
Unit Testing - Function 1: Password Hashing & Bcrypt Verification
Module: app.core.security
Tested Functions: get_password_hash, verify_password
Scope:
  - Valid password hashing with distinct salt generation
  - Correct password verification
  - Incorrect password rejection
  - Case-sensitivity verification
  - Long password boundary (> 72 bytes) truncation and verification
  - Unicode character support (Vietnamese accented characters)
  - Malformed / corrupted hash graceful handling
  - Empty string edge cases
"""

import pytest
from app.core.security import get_password_hash, verify_password


class TestPasswordHashingAndVerification:
    """Bộ kiểm thử đơn vị cho thuật toán mã hóa mật khẩu Bcrypt."""

    def test_hash_generation_and_successful_verification(self):
        """Kiểm thử sinh mã băm thành công và xác thực mật khẩu chuẩn xác."""
        plain_password = "SecurePassword@2026"
        hashed = get_password_hash(plain_password)

        assert hashed != plain_password
        assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
        assert verify_password(plain_password, hashed) is True

    def test_random_salt_generation(self):
        """Kiểm thử hai lần băm cùng một mật khẩu phải sinh ra hai hash khác nhau (nhờ salt ngẫu nhiên)."""
        password = "IdenticalPassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        assert hash1 != hash2
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

    def test_wrong_password_rejected(self):
        """Kiểm thử nhập sai mật khẩu sẽ bị từ chối xác thực."""
        password = "CorrectSecretPassword"
        hashed = get_password_hash(password)

        assert verify_password("WrongPassword123", hashed) is False
        assert verify_password("correctsecretpassword", hashed) is False  # Phân biệt chữ hoa/thường

    def test_case_sensitivity(self):
        """Kiểm thử phân biệt chữ hoa và chữ thường trong mật khẩu."""
        pwd_upper = "ADMIN_PASS_123"
        pwd_lower = "admin_pass_123"

        hash_upper = get_password_hash(pwd_upper)
        assert verify_password(pwd_upper, hash_upper) is True
        assert verify_password(pwd_lower, hash_upper) is False

    def test_unicode_vietnamese_passwords(self):
        """Kiểm thử hỗ trợ mật khẩu có dấu tiếng Việt Unicode đầy đủ."""
        vn_password = "MậtKhẩuBảoMậtĐồÁn_PBL6_TS_Hoàng"
        hashed = get_password_hash(vn_password)

        assert verify_password(vn_password, hashed) is True
        assert verify_password("MatKhauBaoMatDoAn_PBL6_TS_Hoang", hashed) is False

    def test_long_password_boundary_72_bytes(self):
        """
        Kiểm thử giới hạn 72 bytes của chuẩn Bcrypt.
        Hàm get_password_hash cắt ở [:72], kiểm tra verify_password cắt tương ứng.
        """
        # Mật khẩu 100 ký tự
        long_pwd = "A" * 72 + "EXTRA_CHARS_BEYOND_72"
        hashed = get_password_hash(long_pwd)

        assert verify_password(long_pwd, hashed) is True
        # Tiền tố 72 ký tự đầu khớp
        assert verify_password("A" * 72 + "DIFFERENT_EXTRA", hashed) is True
        # Nếu thay đổi ngay trong 72 ký tự đầu -> False
        assert verify_password("B" + "A" * 71 + "EXTRA_CHARS_BEYOND_72", hashed) is False

    def test_empty_password_handling(self):
        """Kiểm thử xử lý chuỗi mật khẩu rỗng."""
        empty_pwd = ""
        hashed = get_password_hash(empty_pwd)

        assert verify_password(empty_pwd, hashed) is True
        assert verify_password("non_empty", hashed) is False

    def test_malformed_hash_graceful_handling(self):
        """Kiểm thử chuỗi hash bị hỏng/không hợp lệ không gây sập chương trình (unhandled exception)."""
        malformed_hashes = [
            "not_a_valid_bcrypt_hash",
            "$2b$12$invalid_too_short",
            "",
            "1234567890",
            "$2b$99$invalid_cost_factor_exceeded",
        ]

        for bad_hash in malformed_hashes:
            result = verify_password("SomePassword123", bad_hash)
            assert result is False, f"Expected False for malformed hash: {bad_hash}"

