#!/usr/bin/env bash
set -e

echo "==============================================================================="
echo "[PBL6 QA AUTOMATION] EXECUTING API TESTING (2 BUSINESS FUNCTIONS)"
echo "Function 3: Admin System Config (GET/PUT /api/v1/admin/config)"
echo "Function 4: Admin Student User Status (PATCH /api/v1/admin/users/{id}/status)"
echo "==============================================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

mkdir -p "test-results/api"

if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
    echo "[ERROR] Python is not installed or not in PATH!"
    exit 1
fi
PYTHON_BIN=$(command -v python3 || command -v python)

echo "[1/3] Running Pytest API Tests with JUnit XML report generation..."
set +e
cd backend
$PYTHON_BIN -m pytest tests/api -v --junitxml="../test-results/api/junit.xml"
TEST_EXIT_CODE=$?
cd "$ROOT_DIR"
set -e

echo "[2/3] Updating Test Reports..."
$PYTHON_BIN scripts/generate_reports.py

echo "[3/3] API Testing Completed with Exit Code: $TEST_EXIT_CODE"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "[STATUS] API TESTING: PASSED"
else
    echo "[STATUS] API TESTING: FAILED"
fi
echo "Report saved at: test-results/api/REPORT.md"
echo "==============================================================================="

exit $TEST_EXIT_CODE

