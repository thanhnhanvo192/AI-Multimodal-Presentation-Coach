#!/usr/bin/env bash
set -e

echo "==============================================================================="
echo "[PBL6 QA AUTOMATION] EXECUTING PERFORMANCE LOAD TESTING (2 BUSINESS FUNCTIONS)"
echo "Function 7: Student Dashboard Aggregate Analytics (GET /api/v1/presentations/dashboard-stats)"
echo "Function 8: Admin System KPIs Telemetry Aggregation (GET /api/v1/admin/kpis)"
echo "Scenarios: 10, 50, 100 Concurrent Users (Locust Headless)"
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
$PYTHON_BIN scripts/run_performance_runner.py
TEST_EXIT_CODE=$?
set -e

echo "==============================================================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "[STATUS] PERFORMANCE TESTING: PASSED"
else
    echo "[STATUS] PERFORMANCE TESTING: FAILED"
fi
echo "CSV Metrics saved at: test-results/performance/"
echo "Markdown Report saved at: test-results/performance/REPORT.md"
echo "==============================================================================="

exit $TEST_EXIT_CODE

