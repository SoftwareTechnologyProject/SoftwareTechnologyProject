@echo off
title Bookstore Backend Server
echo ========================================
echo    BOOKSTORE - BACKEND SERVER
echo ========================================
echo.
echo Starting Backend on port 8081...
echo Swagger UI: http://localhost:8081/swagger-ui/index.html
echo.
cd /d "%~dp0backend"
java -jar .\target\bookstore.war
pause
