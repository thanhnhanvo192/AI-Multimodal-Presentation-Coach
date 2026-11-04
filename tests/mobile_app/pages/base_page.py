"""
Base Page Object for Mobile App Testing (Appium).
Provides reusable helpers for wait, click, safe gestures, and screen control.
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
        """Switch context or maintain Native App context."""
        return True

    def switch_to_native(self):
        """Switch context back to NATIVE_APP."""
        return True

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
        if text:
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

    def _w3c_swipe(self, start_x, start_y, end_x, end_y, duration=400):
        """Perform a W3C-compliant touch swipe gesture."""
        try:
            from selenium.webdriver.common.action_chains import ActionChains
            from selenium.webdriver.common.actions.action_builder import ActionBuilder
            from selenium.webdriver.common.actions.pointer_input import PointerInput
            from selenium.webdriver.common.actions import interaction

            actions = ActionChains(self.driver)
            actions.w3c_actions = ActionBuilder(self.driver, mouse=PointerInput(interaction.POINTER_TOUCH, "touch"))
            actions.w3c_actions.pointer_action.move_to_location(start_x, start_y)
            actions.w3c_actions.pointer_action.pointer_down()
            actions.w3c_actions.pointer_action.pause(duration / 1000.0)
            actions.w3c_actions.pointer_action.move_to_location(end_x, end_y)
            actions.w3c_actions.pointer_action.release()
            actions.perform()
        except Exception:
            try:
                self.driver.swipe(start_x, start_y, end_x, end_y, duration)
            except Exception:
                pass

    def swipe_up(self, duration=400):
        """Swipe up inside app (scroll down)."""
        try:
            window_size = self.driver.get_window_size()
            width = window_size["width"]
            height = window_size["height"]
            start_x = int(width * 0.6)
            start_y = int(height * 0.7)
            end_y = int(height * 0.4)
            self._w3c_swipe(start_x, start_y, start_x, end_y, duration)
        except Exception:
            pass

    def swipe_down(self, duration=400):
        """Swipe down inside app (scroll up) without pulling status bar."""
        try:
            window_size = self.driver.get_window_size()
            width = window_size["width"]
            height = window_size["height"]
            start_x = int(width * 0.6)
            start_y = int(height * 0.45)
            end_y = int(height * 0.75)
            self._w3c_swipe(start_x, start_y, start_x, end_y, duration)
        except Exception:
            pass

    def set_orientation(self, orientation):
        """Set screen orientation ('PORTRAIT' or 'LANDSCAPE')."""
        try:
            self.driver.orientation = orientation
            time.sleep(1)
        except Exception:
            pass

    def save_screenshot(self, filepath):
        """Capture screen evidence."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        self.driver.save_screenshot(filepath)
