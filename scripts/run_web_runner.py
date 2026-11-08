#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Web E2E Test Runner
Starts backend server, runs Playwright tests, ensures cleanup, and produces reports.
"""

import os
import sys
import time
import subprocess
import urllib.request

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")


def is_backend_healthy() -> bool:
    try:
        with urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=1) as resp:
            return resp.status == 200
    except Exception:
        return False


def main():
    backend_proc = None
    started_backend = False

    try:
        if not is_backend_healthy():
            print("[WebRunner] Starting Backend server at http://127.0.0.1:8000...")
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
                    print("[WebRunner] Backend server is healthy!")
                    break
            else:
                print("[WebRunner] Warning: Backend server took long to respond, proceeding with tests...")

        print("[WebRunner] Running Playwright E2E Web Tests...")
        os.makedirs(os.path.join(ROOT_DIR, "test-results", "web"), exist_ok=True)

        npx_cmd = "npx.cmd" if sys.platform == "win32" else "npx"
        res = subprocess.run(
            [npx_cmd, "playwright", "test"],
            cwd=FRONTEND_DIR,
            shell=(sys.platform == "win32"),
        )
        test_exit_code = res.returncode

    finally:
        if started_backend and backend_proc:
            print("[WebRunner] Shutting down background backend server...")
            backend_proc.terminate()
            try:
                backend_proc.wait(timeout=3)
            except Exception:
                backend_proc.kill()

    # Generate reports
    print("[WebRunner] Generating reports...")
    subprocess.run([sys.executable, os.path.join(ROOT_DIR, "scripts", "generate_reports.py")])

    print(f"[WebRunner] Playwright execution completed with exit code: {test_exit_code}")
    sys.exit(test_exit_code)


if __name__ == "__main__":
    main()

