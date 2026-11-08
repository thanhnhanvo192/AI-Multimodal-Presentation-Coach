@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo [PBL6 QA AUTOMATION] EXECUTING PERFORMANCE LOAD TESTING (2 BUSINESS FUNCTIONS)
echo Function 7: Student Dashboard Aggregate Analytics (GET /api/v1/presentations/dashboard-stats)
echo Function 8: Admin System KPIs Telemetry Aggregation (GET /api/v1/admin/kpis)
echo Scenarios: 10, 50, 100 Concurrent Users (Locust Headless)
echo ===============================================================================

cd /d "%~dp0\.."

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    exit /b 1
)

python scripts\run_performance_runner.py
set TEST_EXIT_CODE=%errorlevel%

echo ===============================================================================
if %TEST_EXIT_CODE% equ 0 (
    echo [STATUS] PERFORMANCE TESTING: PASSED
) else (
    echo [STATUS] PERFORMANCE TESTING: FAILED
)
echo CSV Metrics saved at: test-results\performance\
echo Markdown Report saved at: test-results\performance\REPORT.md
echo ===============================================================================

exit /b %TEST_EXIT_CODE%

