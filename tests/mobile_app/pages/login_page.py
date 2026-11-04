"""
Page Object for Login Screen (Màn hình Đăng nhập di động).
Uses Native Android UiAutomator selectors for 100% stability.
"""
import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class LoginPage(BasePage):
    # Locators
    LOGIN_TITLE = (By.XPATH, "//*[contains(@text, 'Chào mừng trở lại') or contains(@text, 'Đăng nhập bằng tài khoản')]")
    DEMO_NAV_BTN = (By.XPATH, "//*[contains(@text, 'Xem demo hệ thống')]")
    MENU_BTN = (By.XPATH, "//*[contains(@content-desc, 'menu') or contains(@text, 'menu') or contains(@content-desc, 'Mở menu')]")
    MENU_LOGIN_BTN = (By.XPATH, "//*[@text='Đăng nhập']")
    SUBMIT_LOGIN_BTN = (By.XPATH, "//*[@text='Đăng nhập' and @class='android.widget.Button' or @text='Đăng nhập']")
    SIGNUP_LINK = (By.XPATH, "//*[contains(@text, 'Đăng ký ngay')]")
    PRESET_SON_BTN = (By.XPATH, "//*[contains(@text, 'Student (Sơn)') or contains(@text, 'Student')]")
    PRESET_BANNED_BTN = (By.XPATH, "//*[contains(@text, 'Tài khoản khóa') or contains(@text, 'banned')]")
    LOGOUT_BTN = (By.XPATH, "//*[@content-desc='Đăng xuất' or @text='Đăng xuất']")
    ERROR_BOX = (By.XPATH, "//*[contains(@text, 'không chính xác') or contains(@text, 'khóa') or contains(@text, 'Vui lòng') or contains(@text, 'thất bại')]")
    SUCCESS_DASHBOARD = (By.XPATH, "//*[contains(@text, 'Đặng Quang Sơn') or contains(@text, 'Tổng quan') or contains(@text, 'Phiên luyện tập') or contains(@text, 'Bảng điều khiển')]")

    def ensure_on_login(self):
        """Navigate to Login page from whatever state the app is currently in."""
        time.sleep(1)
        # 1. If on Dashboard (logged in), click logout
        logout_btns = self.driver.find_elements(*self.LOGOUT_BTN)
        if logout_btns:
            logout_btns[0].click()
            time.sleep(1.5)

        # 2. Check if already on Login page
        titles = self.driver.find_elements(*self.LOGIN_TITLE)
        inputs = self.get_inputs()
        if titles and len(inputs) >= 2:
            self.swipe_down(duration=300)
            return

        # 3. If on SignUp page, click 'Đăng nhập ngay'
        back_to_login = self.driver.find_elements(By.XPATH, "//*[contains(@text, 'Đăng nhập ngay')]")
        if back_to_login:
            back_to_login[0].click()
            time.sleep(1)
            return

        # 4. If on Landing page, 'Xem demo hệ thống' navigates directly to /login
        demo_btns = self.driver.find_elements(*self.DEMO_NAV_BTN)
        if demo_btns:
            demo_btns[0].click()
            time.sleep(1.5)
            return

        # 5. Or try hamburger menu
        menu_btns = self.driver.find_elements(*self.MENU_BTN)
        if menu_btns:
            menu_btns[0].click()
            time.sleep(0.5)
            login_menu = self.driver.find_elements(*self.MENU_LOGIN_BTN)
            if login_menu:
                login_menu[0].click()
                time.sleep(1)
                return

        self.swipe_down(duration=300)

    def is_login_page_loaded(self):
        """Check if login screen is displayed."""
        self.ensure_on_login()
        inputs = self.get_inputs()
        titles = self.driver.find_elements(*self.LOGIN_TITLE)
        return len(inputs) >= 2 or len(titles) > 0

    def get_inputs(self):
        """Return all EditText elements on screen."""
        return self.driver.find_elements(By.CLASS_NAME, "android.widget.EditText")

    def input_credentials(self, email, password):
        """Fill in email and password."""
        self.ensure_on_login()
        inputs = self.get_inputs()
        if len(inputs) >= 2:
            inputs[0].clear()
            if email:
                inputs[0].send_keys(email)
            inputs[1].clear()
            if password:
                inputs[1].send_keys(password)

    def click_login(self):
        """Click the submit Đăng nhập button."""
        btns = self.driver.find_elements(By.XPATH, "//*[@text='Đăng nhập']")
        if btns:
            btns[-1].click()
        time.sleep(2)

    def login(self, email, password):
        """Perform full login procedure."""
        self.input_credentials(email, password)
        self.click_login()

    def click_signup_link(self):
        """Click 'Chưa có tài khoản? Đăng ký ngay'."""
        self.ensure_on_login()
        self.swipe_up(duration=300)
        time.sleep(0.3)
        links = self.driver.find_elements(*self.SIGNUP_LINK)
        if links:
            links[0].click()
            time.sleep(1)

    def fill_preset_son(self):
        """Click preset button for Student Son."""
        self.ensure_on_login()
        presets = self.driver.find_elements(*self.PRESET_SON_BTN)
        if presets:
            presets[0].click()
            time.sleep(0.5)

    def fill_preset_banned(self):
        """Click preset button for Banned Account."""
        self.ensure_on_login()
        presets = self.driver.find_elements(*self.PRESET_BANNED_BTN)
        if presets:
            presets[0].click()
            time.sleep(0.5)

    def get_error_message(self, timeout=4):
        """Retrieve error alert text if present, waiting up to timeout seconds."""
        start = time.time()
        while time.time() - start < timeout:
            for text_pattern in ["không chính xác", "khóa", "Vui lòng", "thất bại", "tạm dừng", "lỗi"]:
                alerts = self.driver.find_elements(By.XPATH, f"//*[contains(@text, '{text_pattern}')]")
                if alerts:
                    return alerts[0].text
            time.sleep(0.5)
        return ""

    def is_dashboard_visible(self):
        """Check if user entered the Dashboard."""
        time.sleep(2)
        matches = self.driver.find_elements(*self.SUCCESS_DASHBOARD)
        return len(matches) > 0
