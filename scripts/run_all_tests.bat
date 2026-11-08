@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo [PBL6 QA AUTOMATION] EXECUTING COMPLETE AUTOMATED TESTING SUITE (4 TEST TYPES)
echo 1. Unit Testing        : 2 Functions (Password Hashing, AI Scoring)
echo 2. API Testing         : 2 Functions (Admin Config, Admin User Status)
echo 3. Web Testing (E2E)   : 2 Functions (Web Registration, Web Login RBAC)
echo 4. Performance Testing : 2 Functions (Dashboard Stats Load, Admin KPIs Load)
echo ===============================================================================

cd /d "%~dp0\.."

set OVERALL_FAILED=0

echo.
echo ===============================================================================
echo [STAGE 1/4] EXECUTING UNIT TESTS...
echo ===============================================================================
call scripts\run_unit_tests.bat
if %errorlevel% neq 0 (
    echo [STAGE 1 FAILED] Unit testing failed!
    set OVERALL_FAILED=1
) else (
    echo [STAGE 1 PASSED] Unit testing succeeded!
)

echo.
echo ===============================================================================
echo [STAGE 2/4] EXECUTING API TESTS...
echo ===============================================================================
call scripts\run_api_tests.bat
if %errorlevel% neq 0 (
    echo [STAGE 2 FAILED] API testing failed!
    set OVERALL_FAILED=1
) else (
    echo [STAGE 2 PASSED] API testing succeeded!
)

echo.
echo ===============================================================================
echo [STAGE 3/4] EXECUTING WEB E2E TESTS (PLAYWRIGHT)...
echo ===============================================================================
call scripts\run_web_tests.bat
if %errorlevel% neq 0 (
    echo [STAGE 3 FAILED] Web E2E testing failed!
    set OVERALL_FAILED=1
) else (
    echo [STAGE 3 PASSED] Web E2E testing succeeded!
)

echo.
echo ===============================================================================
echo [STAGE 4/4] EXECUTING PERFORMANCE LOAD TESTS (LOCUST)...
echo ===============================================================================
call scripts\run_performance_tests.bat
if %errorlevel% neq 0 (
    echo [STAGE 4 FAILED] Performance testing failed!
    set OVERALL_FAILED=1
) else (
    echo [STAGE 4 PASSED] Performance testing succeeded!
)

echo.
echo ===============================================================================
echo [SUMMARY REPORT GENERATION]
echo ===============================================================================
python scripts\generate_reports.py

echo.
echo ===============================================================================
if %OVERALL_FAILED% equ 0 (
    echo [FINAL RESULT] ALL 4 TEST SUITES PASSED SUCCESSFULLY!
    echo Master Report: test-results\summary\TEST_SUMMARY.md
    echo ===============================================================================
    exit /b 0
) else (
    echo [FINAL RESULT] ONE OR MORE TEST SUITES FAILED! CHECK REPORTS FOR DETAILS.
    echo Master Report: test-results\summary\TEST_SUMMARY.md
    echo ===============================================================================
    exit /b 1
)

