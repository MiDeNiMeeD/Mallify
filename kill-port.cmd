@echo off
if "%1"=="" (
    echo Usage: kill-port.cmd PORT_NUMBER
    echo Example: kill-port.cmd 4000
    echo.
    echo Common ports:
    echo   4000 - User Service
    echo   5174 - Home Frontend
    echo   3333 - Manager Dashboard
    echo   3000 - Store Frontend
    pause
    exit /b
)

set PORT=%1

echo ========================================
echo Killing process on port %PORT%
echo ========================================
echo.

REM Find process using the port
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    echo Found process ID: %%a
    taskkill /F /PID %%a 2>nul
    if %errorlevel% equ 0 (
        echo Successfully killed process on port %PORT%
    ) else (
        echo Failed to kill process or insufficient permissions
    )
)

echo.
echo Port %PORT% should now be free.
echo.
pause
