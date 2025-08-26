@echo off
color 0A
cls
echo ============================================
echo   DORIKO PSC Dashboard Complete Setup
echo   Maritime Safety Management System
echo ============================================
echo.

:: Set working directory
cd /d "%~dp0"
echo Working Directory: %CD%
echo.

:: Step 1: Data Synchronization
echo [1/4] Synchronizing Dashboard Data...
echo --------------------------------------------
node sync-dashboard-data.js
if %errorlevel% neq 0 (
    echo [ERROR] Data synchronization failed!
    echo Please check sync-dashboard-data.js
    pause
    exit /b 1
)
echo [OK] Data synchronized successfully!
echo.

:: Step 2: Validate Data
echo [2/4] Validating Data Integrity...
echo --------------------------------------------
if exist "psc-dashboard\src\assets\data\dashboard_data.json" (
    echo [OK] Dashboard data file created
) else (
    echo [ERROR] Dashboard data file not found!
    pause
    exit /b 1
)
echo.

:: Step 3: Check System Requirements
echo [3/4] Checking System Requirements...
echo --------------------------------------------
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python is installed
    set SERVER_CMD=python -m http.server 8000
) else (
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo [OK] Node.js is installed
        set SERVER_CMD=npx http-server -p 8000
    ) else (
        echo [ERROR] Neither Python nor Node.js found!
        echo Please install Python or Node.js to run the dashboard.
        pause
        exit /b 1
    )
)
echo.

:: Step 4: Launch Dashboard
echo [4/4] Launching PSC Dashboard...
echo --------------------------------------------
echo.
echo ============================================
echo   Dashboard Ready!
echo --------------------------------------------
echo   Main Dashboard: http://localhost:8000
echo   Direct Access:  http://localhost:8000/open-dashboard.html
echo --------------------------------------------
echo   Press Ctrl+C to stop the server
echo ============================================
echo.

:: Open browser
timeout /t 2 >nul
start http://localhost:8000/open-dashboard.html

:: Start server
cd psc-dashboard
%SERVER_CMD%
