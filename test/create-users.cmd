@echo off
echo ========================================
echo   Creating Sample Users for Mallify
echo ========================================
echo.

cd /d "%~dp0services"

echo Installing bcryptjs if needed...
call npm list bcryptjs >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing bcryptjs...
    call npm install bcryptjs
)

echo.
echo Generating users with hashed passwords...
echo.
node generate-users.js > users-output.txt

echo.
echo Output saved to: services\users-output.txt
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Open MongoDB Compass
echo 2. Connect to: mongodb://localhost:27017
echo 3. Open mongosh shell (bottom left)
echo 4. Copy the commands from users-output.txt
echo 5. Paste into mongosh and press Enter
echo.
echo Or manually run:
echo   1. cd services
echo   2. type users-output.txt
echo   3. Copy the MongoDB commands
echo.
pause

echo.
echo Opening output file...
notepad users-output.txt
