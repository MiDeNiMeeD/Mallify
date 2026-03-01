@echo off
echo =====================================
echo Mallify Docker Setup Quick Test
echo =====================================
echo.

echo [1] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Docker is installed
    docker --version
) else (
    echo [ERROR] Docker not found
    exit /b 1
)
echo.

echo [2] Validating docker-compose.yml...
docker-compose config --quiet >nul 2>&1
if %errorlevel% ==0 (
    echo [OK] Configuration is valid
) else (
    echo [ERROR] Configuration has errors
    docker-compose config
    exit /b 1
)
echo.

echo [3] Checking .env file...
if exist .env (
    echo [OK] .env file exists
) else (
    echo [WARNING] .env file not found
)
echo.

echo [4] Checking Dockerfiles...
set count=0
for %%s in (api-gateway user-service product-service boutique-service order-service payment-service delivery-service driver-service notification-service chat-service review-service promotion-service wishlist-service analytics-service audit-service dispute-service) do (
    if exist %%s\Dockerfile (
        set /a count+=1
    )
)
echo [OK] Found %count%/16 Dockerfiles
echo.

echo [5] Checking running containers...
docker ps --format "{{.Names}}" | findstr /C:"mallify" >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Some Mallify containers are running:
    docker ps --filter "name=mallify" --format "  - {{.Names}} ({{.Status}})"
) else (
    echo [INFO] No Mallify containers running
    echo   Run: docker-compose up -d
)
echo.

echo =====================================
echo Test Complete
echo =====================================
echo.
echo Next steps:
echo   1. docker-compose up -d mongodb redis rabbitmq
echo   2. docker-compose build
echo   3. docker-compose up -d
echo.
