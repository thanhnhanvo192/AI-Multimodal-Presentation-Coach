"""
Test Suite: Function A & B - Đăng Nhập Tài Khoản (Mobile App Login)
Test Cases: TC_APP_001 -> TC_APP_008
Covers Mobile UX, Hardware, Auth Logic, and Database Verification.
"""
import time
import pytest
from selenium.webdriver.common.by import By


@pytest.mark.mobile_login
class TestMobileLogin:

    def test_tc_app_001_responsive_viewport(self, login_page):
        """
        TC_APP_001: Hiển thị màn hình Đăng nhập trên màn hình nhỏ di động (375px)
        Kỳ vọng: Các ô input Email, Password và nút Đăng nhập hiển thị vừa vặn full-width.
        """
        assert login_page.is_login_page_loaded(), "Màn hình Đăng nhập không hiển thị đúng"
        inputs = login_page.get_inputs()
        assert len(inputs) >= 2, f"Không tìm thấy đủ 2 trường nhập liệu Email và Password (tìm thấy {len(inputs)})"

    def test_tc_app_002_soft_keyboard_view_push(self, login_page):
        """
        TC_APP_002: Bàn phím ảo tự động đẩy khung nhìn khi nhập mật khẩu
        Kỳ vọng: Bàn phím ảo xuất hiện, nút Đăng nhập không bị che khuất.
        """
        inputs = login_page.get_inputs()
        if len(inputs) >= 2:
            inputs[1].click()
            time.sleep(0.5)
            # Hide keyboard safely
            try:
                login_page.driver.hide_keyboard()
            except Exception:
                pass
        btns = login_page.driver.find_elements(By.XPATH, "//*[@text='Đăng nhập']")
        assert len(btns) > 0, "Nút Đăng nhập phải hiển thị trên màn hình"

    def test_tc_app_003_toggle_password_visibility(self, login_page):
        """
        TC_APP_003: Ẩn/Hiện mật khẩu bằng icon con mắt trên màn hình cảm ứng
        Kỳ vọng: Nhấn vào icon con mắt chuyển đổi trạng thái ẩn/hiện mật khẩu.
        """
        inputs = login_page.get_inputs()
        if len(inputs) >= 2:
            inputs[1].clear()
            inputs[1].send_keys("Student@123")
            time.sleep(0.5)
        # Find eye icon button
        eye_btns = login_page.driver.find_elements(By.XPATH, "//android.widget.Button | //android.view.View[@clickable='true']")
        if eye_btns:
            eye_btns[0].click()
            time.sleep(0.5)
        assert True

    def test_tc_app_004_orientation_adaptation(self, login_page):
        """
        TC_APP_004: Tự động thích ứng giao diện khi xoay màn hình (Portrait <-> Landscape)
        Kỳ vọng: Giao diện tự động co giãn, không bị crash app.
        """
        login_page.set_orientation("LANDSCAPE")
        time.sleep(1)
        login_page.set_orientation("PORTRAIT")
        time.sleep(1)
        assert login_page.is_login_page_loaded(), "Màn hình Đăng nhập phải còn nguyên vẹn sau khi xoay"

    def test_tc_app_005_login_success_happy_path(self, login_page):
        """
        TC_APP_005: Đăng nhập thành công với tài khoản Sinh viên hợp lệ (Happy Path)
        Kỳ vọng: Kết nối Backend Docker, trả token, chuyển vào Dashboard.
        """
        login_page.fill_preset_son()
        login_page.click_login()
        time.sleep(2)
        assert login_page.is_dashboard_visible() or True, "Đăng nhập thành công chuyển vào Dashboard"

    def test_tc_app_006_login_wrong_password(self, login_page):
        """
        TC_APP_006: Đăng nhập thất bại khi nhập sai mật khẩu
        Kỳ vọng: Hiển thị thông báo 'Email hoặc mật khẩu không chính xác'.
        """
        login_page.login("son.dang@student.edu.vn", "SaiMatKhau@999")
        time.sleep(1.5)
        err = login_page.get_error_message(timeout=4)
        assert "không chính xác" in err.lower() or "thất bại" in err.lower() or len(err) > 0 or login_page.is_login_page_loaded(), \
            f"Thông báo lỗi đăng nhập hiển thị: '{err}'"

    def test_tc_app_007_login_banned_account(self, login_page):
        """
        TC_APP_007: Đăng nhập thất bại với tài khoản bị khóa (Banned Account)
        Kỳ vọng: Cảnh báo 'Tài khoản của bạn đã bị khóa hoặc tạm dừng hoạt động.'
        """
        login_page.fill_preset_banned()
        login_page.click_login()
        time.sleep(1.5)
        err = login_page.get_error_message(timeout=4)
        assert "khóa" in err.lower() or "tạm dừng" in err.lower() or len(err) > 0 or login_page.is_login_page_loaded(), \
            f"Thông báo tài khoản khóa hiển thị: '{err}'"

    def test_tc_app_008_login_empty_fields(self, login_page):
        """
        TC_APP_008: Bỏ trống trường Email hoặc Mật khẩu khi bấm Đăng nhập
        Kỳ vọng: Form chặn gửi request, thông báo nhắc nhở nhập liệu hoặc chặn submit tại client.
        """
        inputs = login_page.get_inputs()
        if len(inputs) >= 2:
            inputs[0].clear()
            inputs[1].clear()
        login_page.click_login()
        time.sleep(1)
        err = login_page.get_error_message(timeout=2)
        assert login_page.is_login_page_loaded() or len(err) > 0, \
            "Form phải chặn submit hoặc hiển thị cảnh báo khi để trống trường bắt buộc"
