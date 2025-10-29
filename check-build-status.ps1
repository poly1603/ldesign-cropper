# Check build status for all packages
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Cropper Build Status Check" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$packages = @(
    "core", "vanilla", "vue", "react", 
    "angular", "solid", "svelte", "qwik", "lit"
)

$results = @()

foreach ($pkg in $packages) {
    $pkgPath = "packages\$pkg"
    $hasVite = Test-Path "$pkgPath\vite.config.ts"
    $hasTsconfig = Test-Path "$pkgPath\tsconfig.json"
    $hasPackageJson = Test-Path "$pkgPath\package.json"
    $hasSrc = Test-Path "$pkgPath\src"
    $hasEs = Test-Path "$pkgPath\es"
    $hasLib = Test-Path "$pkgPath\lib"
    $hasDist = Test-Path "$pkgPath\dist"
    
    $packageName = ""
    if ($hasPackageJson) {
        $json = Get-Content "$pkgPath\package.json" -Raw | ConvertFrom-Json
        $packageName = $json.name
    }
    
    $results += [PSCustomObject]@{
        Package = $pkg
        Name = $packageName
        Vite = if($hasVite){"YES"}else{"-"}
        Tsconfig = if($hasTsconfig){"YES"}else{"-"}
        'src/' = if($hasSrc){"YES"}else{"-"}
        'es/' = if($hasEs){"YES"}else{"-"}
        'lib/' = if($hasLib){"YES"}else{"-"}
        'dist/' = if($hasDist){"YES"}else{"-"}
        Status = if($hasEs -and $hasLib){"BUILT"}elseif($hasSrc){"NOT_BUILT"}else{"MISSING"}
    }
}

Write-Host "Package Configuration Status:" -ForegroundColor Yellow
$results | Format-Table -AutoSize

Write-Host "`nBuild Status Summary:" -ForegroundColor Yellow
$total = $results.Count
$built = ($results | Where-Object { $_.Status -eq "BUILT" }).Count
$notBuilt = ($results | Where-Object { $_.Status -eq "NOT_BUILT" }).Count
$missing = ($results | Where-Object { $_.Status -eq "MISSING" }).Count

Write-Host "  Total: $total packages" -ForegroundColor White
Write-Host "  Built: $built packages" -ForegroundColor Green
Write-Host "  Not Built: $notBuilt packages" -ForegroundColor Yellow
Write-Host "  Missing Config: $missing packages`n" -ForegroundColor Red

if ($notBuilt -gt 0 -or $missing -gt 0) {
    Write-Host "Packages Need Attention:" -ForegroundColor Yellow
    $results | Where-Object { $_.Status -ne "BUILT" } | ForEach-Object {
        Write-Host "  - $($_.Package) ($($_.Name)) - $($_.Status)" -ForegroundColor $(if($_.Status -eq "MISSING"){"Red"}else{"Yellow"})
    }
}

Write-Host "`n========================================"
