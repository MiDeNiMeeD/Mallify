@echo off
echo ========================================
echo   Creating Sample Users in MongoDB
echo ========================================
echo.
echo Connecting to MongoDB and creating users...
echo.

REM Execute the MongoDB script using mongosh
docker exec -i mallify-mongodb mongosh --quiet < "%~dp0CREATE_USERS.js"

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo You can now login with these credentials:
echo.
echo Admin:              admin@mallify.com / admin123
echo Client:             client@mallify.com / client123
echo Boutique Owner:     boutique@mallify.com / boutique123
echo Delivery Manager:   delivery.manager@mallify.com / delivery123
echo Delivery Person:    driver@mallify.com / driver123
echo Boutiques Manager:  boutiques.manager@mallify.com / manager123
echo.
echo Test at: http://localhost:3333
echo.
pause
