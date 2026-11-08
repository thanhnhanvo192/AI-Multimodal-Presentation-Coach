@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo [PBL6 QA AUTOMATION] EXECUTING API TESTING (2 BUSINESS FUNCTIONS)
echo Function 3: Admin System Config (GET/PUT /api/v1/admin/config)
echo Function 4: Admin Student User Status (PATCH /api/v1/admin/users/{id}/status)
echo ===============================================================================

cd /d "%~dp0\.."

if not exist "test-results\api" mkdir "test-results\api"

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    exit /b 1
)

echo [1/3] Running Pytest API Tests with JUnit XML report generation...
cd backend
python -m pytest tests/api -v --junitxml="../test-results/api/junit.xml"
set TEST_EXIT_CODE=%errorlevel%
cd ..

echo [2/3] Updating Test Reports...
python scripts/generate_reports.py

echo [3/3] API Testing Completed with Exit Code: %TEST_EXIT_CODE%
if %TEST_EXIT_CODE% equ 0 (
    echo [STATUS] API TESTING: PASSED
) else (
    echo [STATUS] API TESTING: FAILED
)
echo Report saved at: test-results\api\REPORT.md
echo ===============================================================================

exit /b %TEST_EXIT_CODE%

