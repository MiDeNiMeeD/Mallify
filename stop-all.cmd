@echo off
echo ========================================
echo Stopping All Services and Frontends
echo ========================================
echo.

echo Killing all Node.js processes...
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 0 (
    echo Node.js processes terminated. Waiting to confirm...
    timeout /t 2 /nobreak >nul
    
    REM Check if any Node processes are still running
    tasklist | findstr /I "node.exe" >nul 2>&1
    if %errorlevel% equ 0 (
        echo Some processes still running, forcing again...
        taskkill /F /IM node.exe /T 2>nul
        timeout /t 2 /nobreak >nul
    )
    echo All Node.js processes stopped successfully!
) else (
    echo No Node.js processes found or already stopped.
)

echo.
echo ========================================
echo All Applications Stopped!
echo ========================================
echo.
echo Note: MongoDB container is still running.
echo To stop MongoDB, run: docker stop mallify-mongodb
echo.
pause
