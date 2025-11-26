@echo off
title Bookstore Frontend Server
echo ========================================
echo    BOOKSTORE - FRONTEND SERVER
echo ========================================
echo.
echo Starting Frontend on port 5173...
echo Website: http://localhost:5173
echo.
cd /d "%~dp0frontend"
npm run dev
pause
