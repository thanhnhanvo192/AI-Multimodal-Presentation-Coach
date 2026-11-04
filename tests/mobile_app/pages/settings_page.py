"""
Page Object for Settings & Profile Screen (Màn hình Cài đặt hồ sơ & Tài khoản di động).
Directly matches the React components in frontend/src/SettingsPage.tsx.
"""
from selenium.webdriver.common.by import By
from .base_page import BasePage


class SettingsPage(BasePage):
    # Locators
    PAGE_TITLE = (By.XPATH, "//*[contains(text(), 'Cài đặt tài khoản')]")
    
    # Profile Info Section
    NAME_INPUT = (By.XPATH, "//label[contains(text(), 'Họ và tên')]/following-sibling::div//input")
    EMAIL_INPUT = (By.XPATH, "//input[@type='email']")
    WPM_INPUT = (By.XPATH, "//input[@type='number']")
    SAVE_PROFILE_BTN = (By.XPATH, "//button[contains(., 'Lưu thay đổi')]")

    # Security & Password Section
    CURRENT_PASSWORD_INPUT = (By.XPATH, "//input[@placeholder='Nhập mật khẩu hiện tại']")
    NEW_PASSWORD_INPUT = (By.XPATH, "//input[@placeholder='Tối thiểu 8 ký tự']")
    CONFIRM_PASSWORD_INPUT = (By.XPATH, "//input[@placeholder='Nhập lại mật khẩu mới']")
    UPDATE_PASSWORD_BTN = (By.XPATH, "//button[contains(., 'Cập nhật mật khẩu')]")
    PASSWORD_STRENGTH_LABEL = (By.XPATH, "//span[contains(@class, 'text-[#276749]') and (text()='Yếu' or text()='Trung bình' or text()='Khá' or text()='Mạnh')]")

    # Avatar Section
    AVATAR_UPLOAD_BTN = (By.XPATH, "//button[contains(., 'Tải ảnh lên')]")
    AVATAR_FILE_INPUT = (By.XPATH, "//input[@type='file' and @accept='image/*']")
    AVATAR_PREVIEW_IMG = (By.XPATH, "//img[@alt='avatar']")

    # Toast Notifications
    TOAST_MESSAGE = (By.XPATH, "//div[contains(@class, 'animate-fade-in')]//span[last()]")

    def is_loaded(self):
        """Check if Settings Page is loaded."""
        return self.is_visible(self.PAGE_TITLE, timeout=10)

    def update_profile(self, name=None, wpm=None):
        """Update profile fields and click Save."""
        if name is not None:
            self.input_text(self.NAME_INPUT, name)
        if wpm is not None:
            self.input_text(self.WPM_INPUT, str(wpm))
        self.click(self.SAVE_PROFILE_BTN)

    def get_toast_message(self):
        """Get the text of toast notification."""
        return self.get_text(self.TOAST_MESSAGE)

    def change_password(self, old_pw, new_pw, confirm_pw):
        """Perform password change action."""
        self.input_text(self.CURRENT_PASSWORD_INPUT, old_pw)
        self.input_text(self.NEW_PASSWORD_INPUT, new_pw)
        self.input_text(self.CONFIRM_PASSWORD_INPUT, confirm_pw)
        self.click(self.UPDATE_PASSWORD_BTN)

    def upload_avatar(self, file_path):
        """Upload avatar image."""
        file_input = self.driver.find_element(*self.AVATAR_FILE_INPUT)
        file_input.send_keys(file_path)
