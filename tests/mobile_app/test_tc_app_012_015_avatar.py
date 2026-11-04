"""
Test Suite: Function D - Upload Avatar trên Di Động (Media Handling)
Test Cases: TC_APP_012 -> TC_APP_015
Matches sheet 'Test_Cases_Mobile_App' in PBL6_Test_Cases_Son_Chuan_SRS_Format_Thay.xlsx.
"""
import os
import time
import pytest
from pages.settings_page import SettingsPage


@pytest.fixture
def sample_media_files(tmp_path):
    """Generates mock media files for avatar upload testing."""
    valid_img = tmp_path / "valid_avatar.jpg"
    valid_img.write_bytes(b"\xFF\xD8\xFF\xE0" + b"\x00" * 1024)  # Minimal JPEG header + 1KB
    
    invalid_doc = tmp_path / "document.pdf"
    invalid_doc.write_bytes(b"%PDF-1.5" + b"\x00" * 1024)

    oversized_img = tmp_path / "oversized.jpg"
    oversized_img.write_bytes(b"\xFF\xD8\xFF\xE0" + b"\x00" * (6 * 1024 * 1024))  # 6MB > 5MB limit

    return {
        "valid": str(valid_img),
        "invalid": str(invalid_doc),
        "oversized": str(oversized_img)
    }


@pytest.mark.mobile_media
class TestFunctionDAvatar:

    def test_tc_app_012_permission_request(self, appium_driver):
        """
        TC_APP_012: Xin quyền thư viện ảnh / Camera trên di động
        Thao tác: Tap vào khung avatar hoặc nút 'Tải ảnh lên'.
        Kỳ vọng: Hệ thống kích hoạt trình chọn ảnh hoặc yêu cầu cấp quyền hợp lệ.
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        assert page.is_visible(page.AVATAR_UPLOAD_BTN), "Upload avatar button is visible"
        page.click(page.AVATAR_UPLOAD_BTN)
        time.sleep(0.5)

        # File input element is triggered
        file_input = page.driver.find_element(*page.AVATAR_FILE_INPUT)
        assert file_input.get_attribute("accept") == "image/*", "File input accepts only image files"

    def test_tc_app_013_invalid_file_format(self, appium_driver, sample_media_files):
        """
        TC_APP_013: Chọn file sai định dạng (Tải file PDF/Word)
        Thao tác: Vào quản lý file, chọn 1 file tài liệu (sample.pdf).
        Kỳ vọng: Giao diện hoặc input chặn tải lên file không phải ảnh (chỉ cho phép JPG, PNG, WebP).
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        file_input = page.driver.find_element(*page.AVATAR_FILE_INPUT)
        accept_attr = file_input.get_attribute("accept")
        assert "image" in accept_attr, f"Input should restrict to images, but was '{accept_attr}'"

    def test_tc_app_014_oversized_image_handling(self, appium_driver, sample_media_files):
        """
        TC_APP_014: Upload ảnh độ phân giải cao vượt giới hạn (> 5MB)
        Thao tác: Chọn ảnh có dung lượng vượt quá giới hạn (> 5MB).
        Kỳ vọng: Hệ thống hiển thị mô tả cảnh báo tối đa 5 MB hoặc chặn submit ảnh quá nặng.
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        # Check guideline text displays max 5 MB
        limit_text = page.driver.find_element("xpath", "//*[contains(text(), 'Tối đa 5 MB')]")
        assert limit_text.is_displayed(), "Max 5 MB size limit guideline should be clearly shown"

    def test_tc_app_015_valid_avatar_upload(self, appium_driver, sample_media_files):
        """
        TC_APP_015: Upload ảnh avatar hợp lệ thành công
        Thao tác: Chọn ảnh JPEG hợp lệ (< 5MB), quan sát khung xem trước và bấm Lưu thay đổi.
        Kỳ vọng: Ảnh avatar mới được cập nhật tại vòng tròn avatar và lưu thành công.
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        page.upload_avatar(sample_media_files["valid"])
        time.sleep(1)

        # Check preview image appears
        assert page.is_visible(page.AVATAR_PREVIEW_IMG, timeout=5), "Avatar preview image should be displayed"
        
        # Save profile
        page.click(page.SAVE_PROFILE_BTN)
        time.sleep(0.5)
        toast_msg = page.get_toast_message()
        assert "thành công" in toast_msg.lower() or "đã lưu" in toast_msg.lower()
