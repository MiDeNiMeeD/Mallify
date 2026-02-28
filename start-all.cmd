@echo off
echo ========================================
echo Starting All Services and Frontends
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
echo Launching all services in Windows Terminal...
wt ^
  new-tab --title "MongoDB Manager" --tabColor "#00A86B" --suppressApplicationTitle --startingDirectory "%BASE_DIR%" cmd /k mongo-manager.cmd ^
; new-tab --title "User Service" --tabColor "#4A90E2" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\user-service" cmd /k npm run dev ^
; new-tab --title "API Gateway" --tabColor "#E24A4A" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\api-gateway" cmd /k npm run dev ^
; new-tab --title "Boutique" --tabColor "#9B59B6" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\boutique-service" cmd /k npm run dev ^
; new-tab --title "Product" --tabColor "#F39C12" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\product-service" cmd /k npm run dev ^
; new-tab --title "Order" --tabColor "#1ABC9C" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\order-service" cmd /k npm run dev ^
; new-tab --title "Payment" --tabColor "#16A085" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\payment-service" cmd /k npm run dev ^
; new-tab --title "Delivery" --tabColor "#27AE60" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\delivery-service" cmd /k npm run dev ^
; new-tab --title "Driver" --tabColor "#2ECC71" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\driver-service" cmd /k npm run dev ^
; new-tab --title "Notification" --tabColor "#F1C40F" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\notification-service" cmd /k npm run dev ^
; new-tab --title "Chat" --tabColor "#F39C12" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\chat-service" cmd /k npm run dev ^
; new-tab --title "Review" --tabColor "#E91E63" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\review-service" cmd /k npm run dev ^
; new-tab --title "Wishlist" --tabColor "#FF6B9D" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\wishlist-service" cmd /k npm run dev ^
; new-tab --title "Analytics" --tabColor "#34495E" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\analytics-service" cmd /k npm run dev ^
; new-tab --title "Audit" --tabColor "#5D6D7E" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\audit-service" cmd /k npm run dev ^
; new-tab --title "Dispute" --tabColor "#E74C3C" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\dispute-service" cmd /k npm run dev ^
; new-tab --title "Promotion" --tabColor "#8E44AD" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\services\promotion-service" cmd /k npm run dev ^
; new-tab --title "Home Frontend" --tabColor "#27AE60" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\web\home" cmd /k npm run dev ^
; new-tab --title "Manager Dashboard" --tabColor "#8E44AD" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\web\manager\store" cmd /k npm start ^
; new-tab --title "Store Frontend" --tabColor "#3498DB" --suppressApplicationTitle --startingDirectory "%BASE_DIR%\web\store" cmd /k npm start

echo.
echo ========================================
echo All Services Started!
echo ========================================
echo.
echo Running in Windows Terminal with colored tabs
echo.
echo Services (16):
echo - User Service: http://localhost:3001
echo - API Gateway: http://localhost:4000
echo - Boutique: 3003 ^| Product: 3002 ^| Order: 3004
echo - Payment: 3005 ^| Delivery: 3006 ^| Driver: 3007
echo - Notification: 3008 ^| Chat: 3009
echo - Review: 3010 ^| Wishlist: 3012
echo - Analytics: 3013 ^| Audit: 3014
echo - Dispute: 3015 ^| Promotion: 3011
echo.
echo Frontends (3):
echo - Home: http://localhost:5174
echo - Manager: http://localhost:3333
echo - Store: http://localhost:3000
echo.
pause
