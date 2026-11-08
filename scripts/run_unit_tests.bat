@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo [PBL6 QA AUTOMATION] EXECUTING UNIT TESTING (2 BUSINESS FUNCTIONS)
echo Function 1: Password Hashing ^& Bcrypt Verification (backend/app/core/security.py)
echo Function 2: AI Scoring, Badge Allocation ^& Telemetry (backend/app/services/ai_engine_service.py)
echo ===============================================================================

cd /d "%~dp0\.."

if not exist "test-results\unit" mkdir "test-results\unit"

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    exit /b 1
)

echo [1/3] Running Pytest Unit Tests with JUnit XML report generation...
cd backend
python -m pytest tests/unit -v --junitxml="../test-results/unit/junit.xml"
set TEST_EXIT_CODE=%errorlevel%
cd ..

echo [2/3] Updating Test Reports...
python scripts/generate_reports.py

echo [3/3] Unit Testing Completed with Exit Code: %TEST_EXIT_CODE%
if %TEST_EXIT_CODE% equ 0 (
    echo [STATUS] UNIT TESTING: PASSED
) else (
    echo [STATUS] UNIT TESTING: FAILED
)
echo Report saved at: test-results\unit\REPORT.md
echo ===============================================================================

exit /b %TEST_EXIT_CODE%
