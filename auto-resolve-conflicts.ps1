# Automatically resolve Git conflict markers by keeping the "ours" (HEAD) version
$files = @(
    "packages\core\src\core\BatchProcessor.ts",
    "packages\core\src\core\Cropper.ts",
    "packages\core\src\core\InteractionManager.ts",
    "packages\core\src\filters\FilterEngine.ts",
    "packages\core\src\types\index.ts",
    "packages\core\src\utils\math.ts"
)

Write-Host "Auto-resolving Git conflicts (keeping HEAD version)..." -ForegroundColor Cyan
Write-Host ""

$totalFixed = 0

foreach ($file in $files) {
    if (!(Test-Path $file)) {
        Write-Host "File not found: $file" -ForegroundColor Red
        continue
    }
    
    Write-Host "Processing: $file" -ForegroundColor Yellow
    
    $lines = Get-Content $file
    $output = @()
    $inConflict = $false
    $conflictMode = ""  # "ours" or "theirs"
    $conflictsInFile = 0
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Skip orphaned conflict markers (without matching <<<<<<< or =======)
        if ($line -match '^=======$' -or $line -match '^>>>>>>> ') {
            $conflictsInFile++
            continue
        }
        
        if ($line -match '^<<<<<<< ') {
            # Start of conflict - we want to keep this section
            $inConflict = $true
            $conflictMode = "ours"
            $conflictsInFile++
            continue
        }
        
        # Only add lines if we're not in conflict or if we're in the "ours" section
        if (!$inConflict -or $conflictMode -eq "ours") {
            $output += $line
        }
    }
    
    if ($conflictsInFile -gt 0) {
        # Write the cleaned content back
        $output | Set-Content -Path $file -Encoding UTF8
        Write-Host "  Fixed $conflictsInFile conflict(s)" -ForegroundColor Green
        $totalFixed += $conflictsInFile
    } else {
        Write-Host "  No conflicts found" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Done! Fixed $totalFixed conflicts across $($files.Count) files." -ForegroundColor Cyan
