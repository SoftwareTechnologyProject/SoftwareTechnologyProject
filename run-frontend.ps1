# Script chạy Frontend React

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BOOKSTORE - FRONTEND DEV SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Node.js
try {
    $nodeVersion = node -v
    Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js chưa được cài đặt!" -ForegroundColor Red
    Write-Host "[INFO] Vui lòng cài Node.js từ: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Nhấn Enter để thoát"
    exit 1
}

# Kiểm tra node_modules
if (-Not (Test-Path ".\frontend\node_modules")) {
    Write-Host "[INFO] Chưa cài dependencies. Đang chạy npm install..." -ForegroundColor Yellow
    Set-Location -Path ".\frontend"
    npm install
    Set-Location -Path ".."
}

# Chạy frontend
Write-Host ""
Write-Host "[INFO] Starting Frontend Dev Server..." -ForegroundColor Green
Write-Host "[INFO] Frontend sẽ chạy tại: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Nhấn Ctrl+C để dừng server" -ForegroundColor Yellow
Write-Host ""

Set-Location -Path ".\frontend"
npm run dev
