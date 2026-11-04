"""
Page Object for Sign Up Screen (Màn hình Đăng ký tài khoản di động).
Uses Native Android UiAutomator selectors for 100% stability.
"""
import time
from selenium.webdriver.common.by import By
from .base_page import BasePage


class SignUpPage(BasePage):
    # Locators
    SIGNUP_TITLE = (By.XPATH, "//*[contains(@text, 'Tạo tài khoản mới')]")
    START_PRACTICE_BTN = (By.XPATH, "//*[contains(@text, 'Bắt đầu luyện tập')]")
    REGISTER_SUBMIT_BTN = (By.XPATH, "//*[@text='Đăng ký tài khoản' or @text='Đăng ký']")
    LOGIN_LINK = (By.XPATH, "//*[contains(@text, 'Đăng nhập ngay')]")
    CHECKBOX_TERMS = (By.XPATH, "//android.widget.CheckBox | //*[contains(@text, 'Tôi đồng ý')]")
    LOGOUT_BTN = (By.XPATH, "//*[@content-desc='Đăng xuất' or @text='Đăng xuất']")
    ERROR_BOX = (By.XPATH, "//*[contains(@text, 'Vui lòng') or contains(@text, 'không khớp') or contains(@text, 'đã được sử dụng') or contains(@text, 'tối thiểu 8') or contains(@text, 'không chính xác')]")
    SUCCESS_BOX = (By.XPATH, "//*[contains(@text, 'thành công') or contains(@text, 'Thành công')]")

    def ensure_on_signup(self):
        """Navigate to SignUp page from whatever state the app is currently in."""
        time.sleep(1)
        # 1. If on Dashboard (logged in), click logout
        logout_btns = self.driver.find_elements(*self.LOGOUT_BTN)
        if logout_btns:
            logout_btns[0].click()
            time.sleep(1.5)

        # 2. Check if already on Sign Up
        titles = self.driver.find_elements(*self.SIGNUP_TITLE)
        if titles:
            self.swipe_down(duration=300)
            return

        # 3. From Landing page, 'Bắt đầu luyện tập ngay' navigates directly to /signup
        practice_btns = self.driver.find_elements(*self.START_PRACTICE_BTN)
        if practice_btns:
            practice_btns[0].click()
            time.sleep(1.5)
            return

        # 4. From Login page, click 'Đăng ký ngay'
        signup_links = self.driver.find_elements(By.XPATH, "//*[contains(@text, 'Đăng ký ngay')]")
        if not signup_links:
            self.swipe_up(duration=300)
            time.sleep(0.5)
            signup_links = self.driver.find_elements(By.XPATH, "//*[contains(@text, 'Đăng ký ngay')]")
        if signup_links:
            signup_links[0].click()
            time.sleep(1)
            return

        self.swipe_down(duration=300)

    def is_signup_page_loaded(self):
        """Check if Sign Up screen is displayed."""
        self.ensure_on_signup()
        return len(self.driver.find_elements(*self.SIGNUP_TITLE)) > 0 or len(self.get_inputs()) >= 3

    def get_inputs(self):
        """Return all EditText elements on screen (Họ tên, Email, Mật khẩu, Xác nhận MK)."""
        return self.driver.find_elements(By.CLASS_NAME, "android.widget.EditText")

    def is_terms_checked(self):
        """Check if Terms & Conditions checkbox is checked."""
        boxes = self.driver.find_elements(*self.CHECKBOX_TERMS)
        if boxes:
            val = boxes[0].get_attribute("checked")
            return val == "true" or val is True
        return False

    def ensure_terms_checked(self):
        """If register button is disabled, click checkbox to re-enable it."""
        btns = self.driver.find_elements(*self.REGISTER_SUBMIT_BTN)
        if btns and btns[-1].get_attribute("enabled") == "false":
            boxes = self.driver.find_elements(*self.CHECKBOX_TERMS)
            if boxes:
                boxes[0].click()
                time.sleep(0.3)

    def fill_registration(self, name=None, email=None, password=None, confirm_password=None, ensure_terms=True):
        """Fill registration input fields."""
        self.ensure_on_signup()
        inputs = self.get_inputs()
        if len(inputs) >= 1 and name is not None:
            inputs[0].clear()
            if name:
                inputs[0].send_keys(name)
        if len(inputs) >= 2 and email is not None:
            inputs[1].clear()
            if email:
                inputs[1].send_keys(email)
        if len(inputs) >= 3 and password is not None:
            inputs[2].clear()
            if password:
                inputs[2].send_keys(password)
        if len(inputs) >= 4 and confirm_password is not None:
            inputs[3].clear()
            if confirm_password:
                inputs[3].send_keys(confirm_password)
        if ensure_terms:
            self.ensure_terms_checked()

    def click_register(self):
        """Click 'Đăng ký tài khoản' button."""
        btns = self.driver.find_elements(*self.REGISTER_SUBMIT_BTN)
        if btns:
            btns[-1].click()
        time.sleep(1.5)

    def click_login_link(self):
        """Click 'Đã có tài khoản? Đăng nhập'."""
        links = self.driver.find_elements(*self.LOGIN_LINK)
        if not links:
            links = self.driver.find_elements(By.XPATH, "//*[@text='Đăng nhập' and @class='android.widget.Button']")
        if links:
            links[-1].click()
            time.sleep(1)

    def toggle_terms_checkbox(self):
        """Toggle agree terms checkbox."""
        boxes = self.driver.find_elements(*self.CHECKBOX_TERMS)
        if boxes:
            boxes[0].click()
            time.sleep(0.3)

    def get_error_message(self, timeout=3):
        """Retrieve error alert text if present directly on screen."""
        start = time.time()
        while time.time() - start < timeout:
            try:
                alerts = self.driver.find_elements(*self.ERROR_BOX)
                if alerts and len(alerts[0].text) > 0:
                    return alerts[0].text
            except Exception:
                pass
            time.sleep(0.4)
        return ""

    def get_success_message(self):
        """Retrieve success alert text if present."""
        try:
            alerts = self.driver.find_elements(*self.SUCCESS_BOX)
            if alerts:
                return alerts[0].text
        except Exception:
            pass
        return ""
