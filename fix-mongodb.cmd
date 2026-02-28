@echo off
echo ========================================
echo Fixing MongoDB Connection Strings
echo (Removing authentication for local dev)
echo ========================================
echo.

REM Stop all running services first
echo Stopping all Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1

REM Remove existing MongoDB container
echo Removing old MongoDB container...
docker rm -f mallify-mongodb >nul 2>&1

REM Start MongoDB without authentication
echo Starting MongoDB without authentication...
docker run --name mallify-mongodb -p 27017:27017 -d mongo:latest

echo.
echo Waiting for MongoDB to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo MongoDB is ready!
echo ========================================
echo.
echo Connection string: mongodb://localhost:27017
echo.
echo Now updating .env files...
echo.

REM Update all .env files using PowerShell
powershell -Command ^
  "$files = Get-ChildItem -Path 'services' -Filter '.env' -Recurse; " ^
  "foreach ($file in $files) { " ^
  "  $content = Get-Content $file.FullName; " ^
  "  $newContent = $content -replace 'mongodb://mallify:mallify_password@localhost:27017/([^?]+)\?authSource=admin', 'mongodb://localhost:27017/$1'; " ^
  "  Set-Content -Path $file.FullName -Value $newContent; " ^
  "  Write-Host \"Updated: $($file.FullName)\"; " ^
  "}"

echo.
echo ========================================
echo All fixed! You can now run:
echo   start-dev.cmd
echo ========================================
pause
