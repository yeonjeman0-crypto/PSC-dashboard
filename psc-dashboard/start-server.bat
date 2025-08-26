@echo off
echo =====================================
echo PSC Dashboard Server Setup
echo =====================================
echo.
echo Starting local web server for PSC Dashboard...
echo.

cd /d "%~dp0"

echo Checking for Python...
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python found. Starting server...
    echo.
    echo =====================================
    echo Server running at: http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo =====================================
    echo.
    python -m http.server 8000
) else (
    echo Python not found. Checking for Node.js...
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Node.js found. Installing http-server...
        call npm install -g http-server
        echo Starting server...
        echo.
        echo =====================================
        echo Server running at: http://localhost:8000
        echo Press Ctrl+C to stop the server
        echo =====================================
        echo.
        http-server -p 8000
    ) else (
        echo ERROR: Neither Python nor Node.js found!
        echo Please install Python or Node.js to run the dashboard server.
        echo.
        echo Alternative: Open integrated-dashboard.html directly in your browser
        pause
    )
)
