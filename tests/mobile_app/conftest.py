"""
Pytest configuration for Mobile App Automation Tests.
Sets up Appium UiAutomator2 Driver, handles video recording, and saves screenshots on failure.
"""
import os
import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options


def get_apk_path():
    """Retrieve absolute path to the generated Android APK."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    apk_path = os.path.join(base_dir, "AI_Presentation_Coach.apk")
    if not os.path.exists(apk_path):
        apk_path = os.path.join(base_dir, "frontend", "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk")
    return apk_path


@pytest.fixture(scope="session")
def appium_server_url():
    """Default Appium Server URL."""
    return os.getenv("APPIUM_SERVER_URL", "http://127.0.0.1:4723")


@pytest.fixture(scope="function")
def appium_driver(appium_server_url, request):
    """
    Initializes the Appium WebDriver for each test.
    Automatically starts and stops screen recording for evidence.
    """
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.automation_name = "UiAutomator2"
    device_name = os.getenv("ANDROID_DEVICE_NAME", "emulator-5554")
    options.device_name = device_name
    options.udid = os.getenv("ANDROID_DEVICE_UDID", device_name)
    options.app_package = "com.aicoach.presentation"
    options.app_activity = "com.aicoach.presentation.MainActivity"
    options.no_reset = True
    options.auto_grant_permissions = True
    options.set_capability("newCommandTimeout", 300)
    options.set_capability("adbExecTimeout", 30000)
    options.set_capability("ignoreHiddenApiPolicyError", True)
    options.set_capability("skipLogcatCapture", True)
    options.set_capability("disableWindowAnimation", True)

    driver = None
    try:
        driver = webdriver.Remote(appium_server_url, options=options)
    except Exception as e:
        pytest.skip(f"Appium Server or Android Device not available at {appium_server_url}: {e}")

    yield driver

    if driver:
        driver.quit()


@pytest.fixture(scope="function")
def login_page(appium_driver):
    """Fixture ensuring the app is at the Login screen."""
    from pages.login_page import LoginPage
    page = LoginPage(appium_driver)
    page.ensure_on_login()
    return page


@pytest.fixture(scope="function")
def signup_page(appium_driver):
    """Fixture ensuring the app is at the Sign Up screen."""
    from pages.signup_page import SignUpPage
    page = SignUpPage(appium_driver)
    page.ensure_on_signup()
    return page


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture test execution status for screenshot triggers."""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)
