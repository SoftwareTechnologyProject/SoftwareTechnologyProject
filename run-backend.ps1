# Script chạy Backend Spring Boot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BOOKSTORE - BACKEND SERVER" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra file WAR
$warFile = ".\backend\target\bookstore.war"
if (-Not (Test-Path $warFile)) {
    Write-Host "[ERROR] File bookstore.war không tồn tại!" -ForegroundColor Red
    Write-Host "[INFO] Đang build project..." -ForegroundColor Yellow
    Set-Location -Path ".\backend"
    mvn clean install -DskipTests
    Set-Location -Path ".."
}

# Chạy backend
Write-Host "[INFO] Starting Backend Server..." -ForegroundColor Green
Write-Host "[INFO] Backend sẽ chạy tại: http://localhost:8081" -ForegroundColor Green
Write-Host "[INFO] Swagger UI: http://localhost:8081/swagger-ui/index.html" -ForegroundColor Green
Write-Host ""
Write-Host "Nhấn Ctrl+C để dừng server" -ForegroundColor Yellow
Write-Host ""

Set-Location -Path ".\backend"
java -jar .\target\bookstore.war
