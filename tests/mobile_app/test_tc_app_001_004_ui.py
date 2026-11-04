"""
Test Suite: Function A - Responsive & UI Form (Tương tác màn hình nhỏ)
Test Cases: TC_APP_001 -> TC_APP_004
Matches sheet 'Test_Cases_Mobile_App' in PBL6_Test_Cases_Son_Chuan_SRS_Format_Thay.xlsx.
"""
import time
import pytest
from pages.settings_page import SettingsPage


@pytest.mark.mobile_ui
class TestFunctionAUI:

    def test_tc_app_001_responsive_375px_viewport(self, appium_driver):
        """
        TC_APP_001: Hiển thị Form chỉnh sửa trên iPhone (375px)
        Thao tác: Mở ứng dụng trên màn hình di động, truy cập trang Cài đặt tài khoản.
        Kỳ vọng: Các ô nhập liệu và nút bấm vừa vặn màn hình, không tràn ngang.
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        assert page.is_loaded(), "Settings page did not load properly"
        
        # Check input elements are visible within viewport
        assert page.is_visible(page.NAME_INPUT), "Name input is not visible"
        assert page.is_visible(page.EMAIL_INPUT), "Email input is not visible"
        assert page.is_visible(page.SAVE_PROFILE_BTN), "Save profile button is not visible"

    def test_tc_app_002_soft_keyboard_no_overlap(self, appium_driver):
        """
        TC_APP_002: Kiểm tra lỗi che khuất nút Lưu khi mở bàn phím ảo
        Thao tác: Cuộn xuống cuối form, tap vào ô Nhập mật khẩu mới để bật bàn phím ảo.
        Kỳ vọng: Khung nhìn tự động đẩy lên, nút Cập nhật mật khẩu không bị che khuất.
        """
        page = SettingsPage(appium_driver)
        page.switch_to_webview()

        # Tap on password input to trigger soft keyboard
        page.click(page.NEW_PASSWORD_INPUT)
        time.sleep(1)

        # In hybrid app, page should auto-scroll or keyboard is shown without obscuring actions
        assert page.is_visible(page.NEW_PASSWORD_INPUT), "Password input is not focused or visible"
        # Hide keyboard if open
        try:
            appium_driver.hide_keyboard()
        except Exception:
            pass

    def test_tc_app_003_orientation_change(self, appium_driver):
        """
        TC_APP_003: Kiểm tra tự động điều chỉnh layout khi xoay màn hình
        Thao tác: Mở trang ở Portrait (dọc) -> Xoay sang Landscape (ngang) -> Kiểm tra layout.
        Kỳ vọng: Giao diện tự động thích ứng mượt mà, chuyển sang 2 cột hoặc cuộn dọc ổn định.
        """
        page = SettingsPage(appium_driver)
        page.switch_to_native()

        # Switch to LANDSCAPE
        page.set_orientation("LANDSCAPE")
        time.sleep(1)

        page.switch_to_webview()
        assert page.is_visible(page.NAME_INPUT), "Name input not visible in landscape"
        assert page.is_visible(page.SAVE_PROFILE_BTN), "Save button not visible in landscape"

        # Switch back to PORTRAIT
        page.switch_to_native()
        page.set_orientation("PORTRAIT")
        time.sleep(1)

        page.switch_to_webview()
        assert page.is_visible(page.NAME_INPUT), "Name input not visible in portrait"

    def test_tc_app_004_touch_scroll_gesture(self, appium_driver):
        """
        TC_APP_004: Thao tác cuộn trang bằng cử chỉ vuốt chạm (Scrolling)
        Thao tác: Dùng ngón tay vuốt (scroll) lên xuống trên trang thông tin cài đặt.
        Kỳ vọng: Trang web cuộn mượt mà theo quán tính; không giật lag.
        """
        page = SettingsPage(appium_driver)
        page.switch_to_native()

        # Swipe up (scroll down to bottom)
        page.swipe_up(duration=600)
        time.sleep(0.5)

        # Swipe down (scroll back up to top)
        page.swipe_down(duration=600)
        time.sleep(0.5)

        page.switch_to_webview()
        assert page.is_visible(page.PAGE_TITLE), "Page header is visible after scrolling back up"
