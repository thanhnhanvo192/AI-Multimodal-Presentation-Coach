#!/usr/bin/env bash
set -e

echo "==============================================================================="
echo "[PBL6 QA AUTOMATION] EXECUTING UNIT TESTING (2 BUSINESS FUNCTIONS)"
echo "Function 1: Password Hashing & Bcrypt Verification (backend/app/core/security.py)"
echo "Function 2: AI Scoring, Badge Allocation & Telemetry (backend/app/services/ai_engine_service.py)"
echo "==============================================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

mkdir -p "test-results/unit"

if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
    echo "[ERROR] Python is not installed or not in PATH!"
    exit 1
fi
PYTHON_BIN=$(command -v python3 || command -v python)

echo "[1/3] Running Pytest Unit Tests with JUnit XML report generation..."
set +e
cd backend
$PYTHON_BIN -m pytest tests/unit -v --junitxml="../test-results/unit/junit.xml"
TEST_EXIT_CODE=$?
cd "$ROOT_DIR"
set -e

echo "[2/3] Updating Test Reports..."
$PYTHON_BIN scripts/generate_reports.py

echo "[3/3] Unit Testing Completed with Exit Code: $TEST_EXIT_CODE"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "[STATUS] UNIT TESTING: PASSED"
else
    echo "[STATUS] UNIT TESTING: FAILED"
fi
echo "Report saved at: test-results/unit/REPORT.md"
echo "==============================================================================="

exit $TEST_EXIT_CODE

