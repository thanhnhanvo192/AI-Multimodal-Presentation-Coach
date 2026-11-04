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
        # Alternative build location
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
    apk_path = get_apk_path()
    
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.automation_name = "UiAutomator2"
    options.device_name = os.getenv("ANDROID_DEVICE_NAME", "Android Emulator")
    options.app = apk_path
    options.auto_grant_permissions = True
    options.set_capability("newCommandTimeout", 300)
    options.set_capability("chromedriverAutodownload", True)
    
    driver = None
    try:
        driver = webdriver.Remote(appium_server_url, options=options)
        try:
            driver.start_recording_screen()
        except Exception:
            pass  # Some emulators or devices might have recording disabled
    except Exception as e:
        pytest.skip(f"Appium Server or Android Device not available at {appium_server_url}: {e}")

    yield driver

    if driver:
        # Save screenshot if test failed
        test_failed = hasattr(request.node, "rep_call") and request.node.rep_call.failed
        screenshot_dir = os.path.join(os.path.dirname(__file__), "..", "..", "reports", "screenshots")
        os.makedirs(screenshot_dir, exist_ok=True)
        
        if test_failed:
            screenshot_path = os.path.join(screenshot_dir, f"{request.node.name}_FAILED.png")
            try:
                driver.save_screenshot(screenshot_path)
            except Exception:
                pass
                
        # Stop and save video recording
        try:
            raw_video = driver.stop_recording_screen()
            video_dir = os.path.join(os.path.dirname(__file__), "..", "..", "reports", "videos")
            os.makedirs(video_dir, exist_ok=True)
            import base64
            video_path = os.path.join(video_dir, f"{request.node.name}.mp4")
            with open(video_path, "wb") as f:
                f.write(base64.b64decode(raw_video))
        except Exception:
            pass

        driver.quit()


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture test execution status for screenshot triggers."""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)
