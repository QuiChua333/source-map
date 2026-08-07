Set-Location $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js chua duoc cai dat" -ForegroundColor Red
    Read-Host "Nhan Enter de thoat"
    exit 1
}

if (-not (Test-Path .env)) {
    Write-Host "[ERROR] Chua co file .env - copy tu .env.example roi dien gia tri" -ForegroundColor Red
    Read-Host "Nhan Enter de thoat"
    exit 1
}

if (-not (Test-Path node_modules)) {
    Write-Host "[SETUP] Dang cai dat dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VST Tour Map - Starting server..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
node server.js
