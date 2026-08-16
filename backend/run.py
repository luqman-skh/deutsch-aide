import sys
import uvicorn

if __name__ == "__main__":
    # Ensure UTF-8 output on Windows consoles
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("[INFO] Starting DeutschAide Python Backend Server on http://localhost:8000...")
    print("[INFO] API Documentation available at: http://localhost:8000/docs")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
