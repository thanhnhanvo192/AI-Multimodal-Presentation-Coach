#!/usr/bin/env bash

echo "==============================================================================="
echo "[PBL6 QA AUTOMATION] EXECUTING COMPLETE AUTOMATED TESTING SUITE (4 TEST TYPES)"
echo "1. Unit Testing        : 2 Functions (Password Hashing, AI Scoring)"
echo "2. API Testing         : 2 Functions (Admin Config, Admin User Status)"
echo "3. Web Testing (E2E)   : 2 Functions (Web Registration, Web Login RBAC)"
echo "4. Performance Testing : 2 Functions (Dashboard Stats Load, Admin KPIs Load)"
echo "==============================================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
    echo "[ERROR] Python is not installed or not in PATH!"
    exit 1
fi
PYTHON_BIN=$(command -v python3 || command -v python)

OVERALL_FAILED=0

echo ""
echo "==============================================================================="
echo "[STAGE 1/4] EXECUTING UNIT TESTS..."
echo "==============================================================================="
bash scripts/run_unit_tests.sh || OVERALL_FAILED=1

echo ""
echo "==============================================================================="
echo "[STAGE 2/4] EXECUTING API TESTS..."
echo "==============================================================================="
bash scripts/run_api_tests.sh || OVERALL_FAILED=1

echo ""
echo "==============================================================================="
echo "[STAGE 3/4] EXECUTING WEB E2E TESTS (PLAYWRIGHT)..."
echo "==============================================================================="
bash scripts/run_web_tests.sh || OVERALL_FAILED=1

echo ""
echo "==============================================================================="
echo "[STAGE 4/4] EXECUTING PERFORMANCE LOAD TESTS (LOCUST)..."
echo "==============================================================================="
bash scripts/run_performance_tests.sh || OVERALL_FAILED=1

echo ""
echo "==============================================================================="
echo "[SUMMARY REPORT GENERATION]"
echo "==============================================================================="
$PYTHON_BIN scripts/generate_reports.py

echo ""
echo "==============================================================================="
if [ $OVERALL_FAILED -eq 0 ]; then
    echo "[FINAL RESULT] ALL 4 TEST SUITES PASSED SUCCESSFULLY!"
    echo "Master Report: test-results/summary/TEST_SUMMARY.md"
    echo "==============================================================================="
    exit 0
else
    echo "[FINAL RESULT] ONE OR MORE TEST SUITES FAILED! CHECK REPORTS FOR DETAILS."
    echo "Master Report: test-results/summary/TEST_SUMMARY.md"
    echo "==============================================================================="
    exit 1
fi

