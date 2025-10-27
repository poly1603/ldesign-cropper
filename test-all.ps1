# Cropper Package Test Script

Write-Host "Cropper Package Test Script" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

$rootPath = $PSScriptRoot
$packagesPath = Join-Path $rootPath "packages"

# Test Core
Write-Host "`nTesting Core package..." -ForegroundColor Yellow
Set-Location (Join-Path $packagesPath "core")
if (Test-Path ".ldesign/builder.config.ts") {
    Write-Host "[OK] Config file found" -ForegroundColor Green
}
if (Test-Path "src/index.ts") {
    Write-Host "[OK] Source code exists" -ForegroundColor Green
}

# Test Vanilla
Write-Host "`nTesting Vanilla package..." -ForegroundColor Yellow
Set-Location (Join-Path $packagesPath "vanilla")
if (Test-Path ".ldesign/builder.config.ts") {
    Write-Host "[OK] Vanilla config found" -ForegroundColor Green
}
if (Test-Path "demo") {
    Write-Host "[OK] Vanilla demo exists" -ForegroundColor Green
}

# Test Vue
Write-Host "`nTesting Vue package..." -ForegroundColor Yellow
Set-Location (Join-Path $packagesPath "vue")
if (Test-Path ".ldesign/builder.config.ts") {
    Write-Host "[OK] Vue config found" -ForegroundColor Green
}
if (Test-Path "demo") {
    Write-Host "[OK] Vue demo exists" -ForegroundColor Green
}

# Test React
Write-Host "`nTesting React package..." -ForegroundColor Yellow
Set-Location (Join-Path $packagesPath "react")
if (Test-Path ".ldesign/builder.config.ts") {
    Write-Host "[OK] React config found" -ForegroundColor Green
}
if (Test-Path "demo") {
    Write-Host "[OK] React demo exists" -ForegroundColor Green
}

# Test Lit
Write-Host "`nTesting Lit package..." -ForegroundColor Yellow
Set-Location (Join-Path $packagesPath "lit")
if (Test-Path ".ldesign/builder.config.ts") {
    Write-Host "[OK] Lit config found" -ForegroundColor Green
}
if (Test-Path "demo") {
    Write-Host "[OK] Lit demo exists" -ForegroundColor Green
}

Write-Host "`n" -NoNewline
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "Configuration verification complete!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Build packages: cd packages/core && ldesign-builder" -ForegroundColor Gray
Write-Host "2. Start demos: .\start-demos.ps1" -ForegroundColor Gray
Write-Host "3. Test in browser" -ForegroundColor Gray

Set-Location $rootPath
