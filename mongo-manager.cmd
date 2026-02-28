@echo off
:menu
cls
echo ========================================
echo     MongoDB Manager - Mallify
echo ========================================
echo.
echo Container: mallify-mongodb
echo Port: 27017
echo.
echo [1] Start MongoDB
echo [2] Stop MongoDB
echo [3] Restart MongoDB
echo [4] Show MongoDB Status
echo [5] Show Container Logs
echo [6] Show Databases
echo [7] Connect to MongoDB Shell
echo [8] Remove MongoDB Container
echo [9] View MongoDB Stats
echo [C] MongoDB Compass Connection
echo [0] Exit
echo.
set /p choice="Select option: "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto databases
if "%choice%"=="7" goto shell
if "%choice%"=="8" goto remove
if "%choice%"=="9" goto stats
if /i "%choice%"=="c" goto compass
if "%choice%"=="0" exit
goto menu

:start
echo.
echo Starting MongoDB...
docker start mallify-mongodb
if %errorlevel% neq 0 (
    echo MongoDB container not found. Creating new one...
    docker run --name mallify-mongodb -p 27017:27017 -d mongo:latest
)
echo.
pause
goto menu

:stop
echo.
echo Stopping MongoDB...
docker stop mallify-mongodb
echo.
pause
goto menu

:restart
echo.
echo Restarting MongoDB...
docker restart mallify-mongodb
echo.
pause
goto menu

:status
echo.
echo MongoDB Status:
echo ==================
docker ps -a --filter "name=mallify-mongodb" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.
pause
goto menu

:logs
echo.
echo MongoDB Logs (last 50 lines):
echo ========================================
docker logs --tail 50 mallify-mongodb
echo.
pause
goto menu

:databases
echo.
echo Databases in MongoDB:
echo ========================================
docker exec mallify-mongodb mongosh --quiet --eval "db.adminCommand('listDatabases').databases.forEach(d => print(d.name + ' - ' + (d.sizeOnDisk/1024/1024).toFixed(2) + ' MB'))"
echo.
pause
goto menu

:shell
echo.
echo Connecting to MongoDB Shell...
echo Type 'exit' to return to menu
echo ========================================
docker exec -it mallify-mongodb mongosh
goto menu

:remove
echo.
set /p confirm="Are you sure you want to remove the MongoDB container? (y/n): "
if /i "%confirm%"=="y" (
    echo Stopping and removing MongoDB...
    docker stop mallify-mongodb
    docker rm mallify-mongodb
    echo MongoDB container removed!
) else (
    echo Operation cancelled.
)
echo.
pause
goto menu

:stats
echo.
echo MongoDB Statistics:
echo ========================================
docker exec mallify-mongodb mongosh --quiet --eval "db.serverStatus().connections"
echo.
echo Memory Usage:
docker stats mallify-mongodb --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo.
pause
goto menu

:compass
cls
echo ========================================
echo   MongoDB Compass Connection String
echo ========================================
echo.
echo Connection String:
echo mongodb://localhost:27017
echo.
echo ========================================
echo Instructions:
echo ========================================
echo 1. Open MongoDB Compass
echo 2. Click "New Connection"
echo 3. Paste the connection string above
echo 4. Click "Connect"
echo.
echo Available Databases:
echo - mallify_users
echo - mallify_boutiques
echo - mallify_products
echo - mallify_orders
echo - mallify_payments
echo - mallify_deliveries
echo - mallify_drivers
echo - mallify_notifications
echo - mallify_chats
echo - mallify_reviews
echo - mallify_wishlists
echo - mallify_analytics
echo - mallify_audits
echo - mallify_disputes
echo - mallify_promotions
echo.
pause
goto menu
