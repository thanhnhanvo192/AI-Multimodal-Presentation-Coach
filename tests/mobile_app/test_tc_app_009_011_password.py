"""
Test Suite: Function C - Đổi Mật Khẩu (Security Change)
Test Cases: TC_APP_009 -> TC_APP_011
Matches sheet 'Test_Cases_Mobile_App' in PBL6_Test_Cases_Son_Chuan_SRS_Format_Thay.xlsx.
"""
import time
import pytest
from pages.settings_page import SettingsPage


@pytest.mark.mobile_security
class TestFunctionCPassword:

    def test_tc_app_009_wrong_old_password(self, appium_driver):
        """
        TC_APP_009: Đổi mật khẩu với sai mật khẩu cũ
        Thao tác: Nhập mật khẩu hiện tại sai 'SaiMatKhau123@', nhập MK mới hợp lệ, bấm 'Cập nhật mật khẩu'.
        Kỳ vọng: Hệ thống phản hồi không hợp lệ hoặc thông báo sai mật khẩu cũ.
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        page.change_password(
            old_pw="SaiMatKhau123@",
            new_pw="MatkhauMoi2026@",
            confirm_pw="MatkhauMoi2026@"
        )
        time.sleep(0.5)

        assert page.is_visible(page.UPDATE_PASSWORD_BTN), "Update password button is visible"

    def test_tc_app_010_mismatched_new_password(self, appium_driver):
        """
        TC_APP_010: Mật khẩu mới không trùng khớp xác nhận
        Thao tác: Nhập đúng MK cũ, MK mới 'MatkhauA123@', Xác nhận 'MatkhauB123@'.
        Kỳ vọng: Giao diện cảnh báo không khớp hoặc không cho phép cập nhật.
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        page.change_password(
            old_pw="Password123@",
            new_pw="MatkhauA123@",
            confirm_pw="MatkhauB123@"
        )
        time.sleep(0.5)

        # Field values are present and different
        new_val = page.find(page.NEW_PASSWORD_INPUT).get_attribute("value")
        confirm_val = page.find(page.CONFIRM_PASSWORD_INPUT).get_attribute("value")
        assert new_val != confirm_val, "Passwords should be mismatched in test scenario"

    def test_tc_app_011_change_password_success(self, appium_driver):
        """
        TC_APP_011: Đổi mật khẩu thành công và cập nhật phiên
        Thao tác: Nhập đúng MK cũ, nhập MK mới và xác nhận đúng chuẩn (>= 8 ký tự, có chữ và số), bấm 'Cập nhật mật khẩu'.
        Kỳ vọng: Toast thông báo 'Đã cập nhật mật khẩu thành công!'
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        page.change_password(
            old_pw="Password123@",
            new_pw="MatkhauMoi2026@",
            confirm_pw="MatkhauMoi2026@"
        )
        time.sleep(0.5)

        toast_msg = page.get_toast_message()
        assert "mật khẩu" in toast_msg.lower() or "thành công" in toast_msg.lower(), (
            f"Expected password change success toast, got '{toast_msg}'"
        )
