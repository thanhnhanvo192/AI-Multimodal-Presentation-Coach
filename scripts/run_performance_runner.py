#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Performance Test Runner (Locust Headless)
Starts backend server, runs load testing scenarios for Function 7 & 8,
exports CSV metrics, and generates standardized reports.
"""

import os
import sys
import time
import subprocess
import urllib.request

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
PERF_DIR = os.path.join(BACKEND_DIR, "performance")
RESULTS_DIR = os.path.join(ROOT_DIR, "test-results", "performance")


def is_backend_healthy() -> bool:
    try:
        with urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=1) as resp:
            return resp.status == 200
    except Exception:
        return False


def run_locust_test(locustfile: str, csv_prefix: str, users: int, spawn_rate: int, run_time: str) -> int:
    os.makedirs(RESULTS_DIR, exist_ok=True)
    csv_path = os.path.join(RESULTS_DIR, csv_prefix)

    cmd = [
        sys.executable,
        "-m",
        "locust",
        "-f",
        os.path.join(PERF_DIR, locustfile),
        "--headless",
        "--host",
        "http://127.0.0.1:8000",
        "-u",
        str(users),
        "-r",
        str(spawn_rate),
        "--run-time",
        run_time,
        "--csv",
        csv_path,
        "--only-summary",
    ]

    print(f"\n[Locust] Running {locustfile} with {users} users (spawn rate {spawn_rate}/s, duration {run_time})...")
    res = subprocess.run(cmd, cwd=BACKEND_DIR)
    return res.returncode


def main():
    os.makedirs(RESULTS_DIR, exist_ok=True)
    backend_proc = None
    started_backend = False

    try:
        if not is_backend_healthy():
            print("[PerfRunner] Starting Backend server at http://127.0.0.1:8000...")
            backend_env = os.environ.copy()
            backend_env["PYTHONPATH"] = BACKEND_DIR
            backend_env["DATABASE_URL"] = "sqlite+aiosqlite:///./pbl6_local.db"
            backend_proc = subprocess.Popen(
                [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
                cwd=BACKEND_DIR,
                env=backend_env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
            )
            started_backend = True

            # Wait up to 15s for backend healthcheck
            for _ in range(30):
                time.sleep(0.5)
                if is_backend_healthy():
                    print("[PerfRunner] Backend server is healthy!")
                    break
            else:
                print("[PerfRunner] Warning: Backend server took long to respond, proceeding with load tests...")

        # 1. Performance Testing - Function 7: Student Dashboard Aggregate Analytics
        # Mức tải: 10 concurrent users (khởi điểm), 50 users (tiêu chuẩn), 100 users (mức cao)
        print("\n" + "=" * 70)
        print("PERFORMANCE LOAD TEST: FUNCTION 7 (STUDENT DASHBOARD STATS)")
        print("=" * 70)
        code1 = run_locust_test(
            locustfile="locust_dashboard_stats.py",
            csv_prefix="locust_dashboard_stats",
            users=50,
            spawn_rate=10,
            run_time="15s",
        )

        # 2. Performance Testing - Function 8: Admin System KPIs Telemetry Aggregation
        print("\n" + "=" * 70)
        print("PERFORMANCE LOAD TEST: FUNCTION 8 (ADMIN SYSTEM KPIS)")
        print("=" * 70)
        code2 = run_locust_test(
            locustfile="locust_admin_kpis.py",
            csv_prefix="locust_admin_kpis",
            users=50,
            spawn_rate=10,
            run_time="15s",
        )

        exit_code = 0 if (code1 == 0 and code2 == 0) else 1

    finally:
        if started_backend and backend_proc:
            print("\n[PerfRunner] Shutting down background backend server...")
            backend_proc.terminate()
            try:
                backend_proc.wait(timeout=3)
            except Exception:
                backend_proc.kill()

    # Generate reports
    print("\n[PerfRunner] Generating performance and summary reports...")
    subprocess.run([sys.executable, os.path.join(ROOT_DIR, "scripts", "generate_reports.py")])

    print(f"\n[PerfRunner] Performance testing completed with exit code: {exit_code}")
    sys.exit(exit_code)


if __name__ == "__main__":
    main()

