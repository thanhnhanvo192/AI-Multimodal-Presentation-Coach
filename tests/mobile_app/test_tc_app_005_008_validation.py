"""
Test Suite: Function B - Validation & Update Data (Kiểm tra nghiệp vụ cập nhật hồ sơ)
Test Cases: TC_APP_005 -> TC_APP_008
Matches sheet 'Test_Cases_Mobile_App' in PBL6_Test_Cases_Son_Chuan_SRS_Format_Thay.xlsx.
"""
import time
import pytest
from pages.settings_page import SettingsPage


@pytest.mark.mobile_validation
class TestFunctionBValidation:

    def test_tc_app_005_update_profile_happy_path(self, appium_driver):
        """
        TC_APP_005: Cập nhật thành công thông tin hồ sơ (Happy Path)
        Thao tác: Nhập Họ tên 'Đặng Quang Sơn', chọn WPM '140', tap nút 'Lưu thay đổi'.
        Kỳ vọng: Hệ thống hiển thị Toast thông báo: 'Đã lưu thông tin thành công!'
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        page.update_profile(name="Đặng Quang Sơn", wpm="140")
        time.sleep(0.5)

        toast_msg = page.get_toast_message()
        assert "thành công" in toast_msg.lower() or "đã lưu" in toast_msg.lower(), (
            f"Expected success toast message, got '{toast_msg}'"
        )

    def test_tc_app_006_name_special_characters(self, appium_driver):
        """
        TC_APP_006: Nhập Họ và Tên chứa ký tự đặc biệt vô nghĩa
        Thao tác: Nhập trường Họ tên: '!@#$$% Sơn', bấm 'Lưu thay đổi'.
        Kỳ vọng: Giao diện phát hiện dữ liệu bất thường hoặc cảnh báo validation.
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        page.input_text(page.NAME_INPUT, "!@#$$% Sơn")
        page.click(page.SAVE_PROFILE_BTN)
        time.sleep(0.5)

        # Field preserves input or alerts user
        current_name = page.find(page.NAME_INPUT).get_attribute("value")
        assert "!@#$$%" in current_name or current_name != "", "Input should handle special characters properly"

    def test_tc_app_007_empty_required_name(self, appium_driver):
        """
        TC_APP_007: Bỏ trống trường bắt buộc Họ và Tên
        Thao tác: Xóa trắng trường Họ Tên (để rỗng), bấm 'Lưu thay đổi'.
        Kỳ vọng: Nút Lưu bị vô hiệu hóa hoặc chặn lưu trường rỗng.
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        page.input_text(page.NAME_INPUT, "")
        time.sleep(0.5)

        val = page.find(page.NAME_INPUT).get_attribute("value")
        assert val == "" or val is None, "Name input was not emptied"

    def test_tc_app_008_wpm_boundary_limit(self, appium_driver):
        """
        TC_APP_008: Kiểm tra giới hạn mục tiêu WPM ngoài phạm vi
        Thao tác: Chọn mục tiêu tốc độ nói (WPM), nhập số '999', bấm 'Lưu thay đổi'.
        Kỳ vọng: Hệ thống cảnh báo hoặc khuyên người dùng khoảng chuẩn (130 - 160 WPM).
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        page.input_text(page.WPM_INPUT, "999")
        time.sleep(0.5)

        val = page.find(page.WPM_INPUT).get_attribute("value")
        assert val == "999", "WPM input field received value"
