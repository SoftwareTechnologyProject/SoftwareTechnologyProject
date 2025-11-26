# Script chạy cả Backend và Frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BOOKSTORE - FULL STACK APPLICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[INFO] Script này sẽ mở 2 terminal riêng biệt:" -ForegroundColor Yellow
Write-Host "  - Terminal 1: Backend (port 8081)" -ForegroundColor Yellow
Write-Host "  - Terminal 2: Frontend (port 5173)" -ForegroundColor Yellow
Write-Host ""

# Chạy Backend trong terminal mới
Write-Host "[INFO] Đang khởi động Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\run-backend.ps1"

# Đợi 3 giây để Backend khởi động
Write-Host "[INFO] Đang đợi Backend khởi động (3 giây)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Chạy Frontend trong terminal mới
Write-Host "[INFO] Đang khởi động Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\run-frontend.ps1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   DỰ ÁN ĐÃ ĐƯỢC KHỞI ĐỘNG!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Truy cập:" -ForegroundColor Cyan
Write-Host "  Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:    http://localhost:8081" -ForegroundColor White  
Write-Host "  Swagger UI: http://localhost:8081/swagger-ui/index.html" -ForegroundColor White
Write-Host ""
Write-Host "Để dừng, đóng 2 terminal PowerShell đã mở" -ForegroundColor Yellow
Write-Host ""

Read-Host "Nhấn Enter để đóng cửa sổ này"
