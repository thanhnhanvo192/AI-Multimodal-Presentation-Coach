@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo [PBL6 QA AUTOMATION] EXECUTING WEB E2E TESTING (2 BUSINESS FUNCTIONS)
echo Function 5: User Registration Workflow on Web UI (frontend/src/SignUpPage.tsx)
echo Function 6: User Authentication ^& Role-Based Navigation (frontend/src/LoginPage.tsx)
echo ===============================================================================

cd /d "%~dp0\.."

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    exit /b 1
)

python scripts\run_web_runner.py
set TEST_EXIT_CODE=%errorlevel%

echo ===============================================================================
if %TEST_EXIT_CODE% equ 0 (
    echo [STATUS] WEB TESTING: PASSED
) else (
    echo [STATUS] WEB TESTING: FAILED
)
echo HTML Report saved at: test-results\web\html-report\index.html
echo Markdown Report saved at: test-results\web\REPORT.md
echo ===============================================================================

exit /b %TEST_EXIT_CODE%
