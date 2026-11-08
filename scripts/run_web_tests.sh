#!/usr/bin/env bash
set -e

echo "==============================================================================="
echo "[PBL6 QA AUTOMATION] EXECUTING WEB E2E TESTING (2 BUSINESS FUNCTIONS)"
echo "Function 5: User Registration Workflow on Web UI (frontend/src/SignUpPage.tsx)"
echo "Function 6: User Authentication & Role-Based Navigation (frontend/src/LoginPage.tsx)"
echo "==============================================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
    echo "[ERROR] Python is not installed or not in PATH!"
    exit 1
fi
PYTHON_BIN=$(command -v python3 || command -v python)

set +e
$PYTHON_BIN scripts/run_web_runner.py
TEST_EXIT_CODE=$?
set -e

echo "==============================================================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "[STATUS] WEB TESTING: PASSED"
else
    echo "[STATUS] WEB TESTING: FAILED"
fi
echo "HTML Report saved at: test-results/web/html-report/index.html"
echo "Markdown Report saved at: test-results/web/REPORT.md"
echo "==============================================================================="

exit $TEST_EXIT_CODE

