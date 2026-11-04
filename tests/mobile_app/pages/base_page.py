"""
Base Page Object for Mobile App Testing (Appium).
Provides reusable helpers for wait, click, gestures (swipe/scroll), and context switching.
"""
import time
import os
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException


class BasePage:
    def __init__(self, driver, timeout=10):
        self.driver = driver
        self.timeout = timeout
        self.wait = WebDriverWait(self.driver, timeout)

    def switch_to_webview(self):
        """Switch context from NATIVE_APP to WEBVIEW in Capacitor hybrid app."""
        try:
            contexts = self.driver.contexts
            for context in contexts:
                if "WEBVIEW" in context.upper():
                    self.driver.switch_to.context(context)
                    return True
        except Exception:
            pass
        return False

    def switch_to_native(self):
        """Switch context back to NATIVE_APP."""
        try:
            self.driver.switch_to.context("NATIVE_APP")
        except Exception:
            pass

    def find(self, locator):
        """Wait for element to be visible and return it."""
        return self.wait.until(EC.visibility_of_element_located(locator))

    def find_all(self, locator):
        """Find all matching elements."""
        return self.driver.find_elements(*locator)

    def click(self, locator):
        """Wait for element and click."""
        el = self.wait.until(EC.element_to_be_clickable(locator))
        el.click()

    def input_text(self, locator, text, clear_first=True):
        """Input text into field."""
        el = self.find(locator)
        if clear_first:
            el.clear()
        el.send_keys(text)

    def get_text(self, locator):
        """Get element text content."""
        return self.find(locator).text

    def is_visible(self, locator, timeout=5):
        """Check if element is visible within timeout."""
        try:
            WebDriverWait(self.driver, timeout).until(EC.visibility_of_element_located(locator))
            return True
        except TimeoutException:
            return False

    def swipe_up(self, duration=500):
        """Swipe up on mobile screen (scroll down)."""
        window_size = self.driver.get_window_size()
        width = window_size["width"]
        height = window_size["height"]
        start_x = width // 2
        start_y = int(height * 0.8)
        end_y = int(height * 0.2)
        self.driver.swipe(start_x, start_y, start_x, end_y, duration)

    def swipe_down(self, duration=500):
        """Swipe down on mobile screen (scroll up)."""
        window_size = self.driver.get_window_size()
        width = window_size["width"]
        height = window_size["height"]
        start_x = width // 2
        start_y = int(height * 0.2)
        end_y = int(height * 0.8)
        self.driver.swipe(start_x, start_y, start_x, end_y, duration)

    def set_orientation(self, orientation):
        """Set screen orientation ('PORTRAIT' or 'LANDSCAPE')."""
        self.driver.orientation = orientation
        time.sleep(1)

    def save_screenshot(self, filepath):
        """Capture screen evidence."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        self.driver.save_screenshot(filepath)
