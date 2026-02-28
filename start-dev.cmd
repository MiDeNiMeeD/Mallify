@echo off
echo ========================================
echo Starting Development Environment
echo ========================================
echo.

REM Kill all Node.js processes first
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul
echo All processes stopped.
echo.

REM Set base directory as environment variable
set "BASE_DIR=%~dp0"
set "BASE_DIR=%BASE_DIR:~0,-1%"

REM Start MongoDB
echo Starting MongoDB...
start "MongoDB" cmd /k "docker start mallify-mongodb || docker run --name mallify-mongodb -p 27017:27017 -d mongo:latest"
timeout /t 3 /nobreak >nul
echo MongoDB started.
echo.

REM Start all services and frontends in Windows Terminal with tabs
echo Launching services in Windows Terminal...
wt ^
  new-tab --title "MongoDB Manager" --tabColor "#00A86B" --suppressApplicationTitle --startingDirectory "%BASE_DIR%" cmd /k mongo-manager.cmd ^
; new-tab --title "API Gateway" --tabColor "#E24A4A" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\api-gateway" cmd /k npm run dev ^
; new-tab --title "User Service" --tabColor "#4A90E2" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\user-service" cmd /k npm run dev ^
; new-tab --title "Boutique Service" --tabColor "#9B59B6" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\boutique-service" cmd /k npm run dev ^
; new-tab --title "Product Service" --tabColor "#F39C12" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\product-service" cmd /k npm run dev ^
; new-tab --title "Order Service" --tabColor "#1ABC9C" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\order-service" cmd /k npm run dev ^
; new-tab --title "Payment Service" --tabColor "#E67E22" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\payment-service" cmd /k npm run dev ^
; new-tab --title "Delivery Service" --tabColor "#16A085" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\delivery-service" cmd /k npm run dev ^
; new-tab --title "Driver Service" --tabColor "#3498DB" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\driver-service" cmd /k npm run dev ^
; new-tab --title "Review Service" --tabColor "#F1C40F" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\review-service" cmd /k npm run dev ^
; new-tab --title "Wishlist Service" --tabColor "#E91E63" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\wishlist-service" cmd /k npm run dev ^
; new-tab --title "Chat Service" --tabColor "#00BCD4" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\chat-service" cmd /k npm run dev ^
; new-tab --title "Notification Service" --tabColor "#9C27B0" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\notification-service" cmd /k npm run dev ^
; new-tab --title "Analytics Service" --tabColor "#607D8B" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\analytics-service" cmd /k npm run dev ^
; new-tab --title "Promotion Service" --tabColor "#FF5722" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\promotion-service" cmd /k npm run dev ^
; new-tab --title "Dispute Service" --tabColor "#795548" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\dispute-service" cmd /k npm run dev ^
; new-tab --title "Audit Service" --tabColor "#9E9E9E" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\audit-service" cmd /k npm run dev ^
; new-tab --title "Home Frontend" --tabColor "#27AE60" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\web\home" cmd /k npm run dev ^
; new-tab --title "Manager Boutique" --tabColor "#8E44AD" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\web\manager\store" cmd /k npm start ^
; new-tab --title "Manager Order" --tabColor "#FF6B6B" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\web\manager\order" cmd /k npm start ^
; new-tab --title "Store Owner" --tabColor "#6be1ff" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\web\store" cmd /k npm start ^
; new-tab --title "Admin Panel" --tabColor "#34495E" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\web\admin" cmd /k npm start ^

echo.
echo ========================================
echo Development Environment Ready!
echo ========================================
echo.
echo All services running in Windows Terminal tabs
echo.
echo === Backend Services ===
echo - API Gateway:          http://localhost:4000
echo - User Service:         http://localhost:3001
echo - Boutique Service:     http://localhost:3002
echo - Product Service:      http://localhost:3003
echo - Order Service:        http://localhost:3004
echo - Payment Service:      http://localhost:3005
echo - Delivery Service:     http://localhost:3006
echo - Driver Service:       http://localhost:3007
echo - Review Service:       http://localhost:3008
echo - Wishlist Service:     http://localhost:3009
echo - Chat Service:         http://localhost:3010
echo - Notification Service: http://localhost:3011
echo - Analytics Service:    http://localhost:3012
echo - Promotion Service:    http://localhost:3013
echo - Dispute Service:      http://localhost:3014
echo - Audit Service:        http://localhost:3015
echo.
echo === Frontend Apps ===
echo - Home:                 http://localhost:5174
echo - Manager Store:        http://localhost:3333
echo - Manager Order:        http://localhost:3334
echo - Store Owner:          http://localhost:3000
echo.
echo === Database ===
echo - MongoDB:              mongodb://localhost:27017
echo.
pause
