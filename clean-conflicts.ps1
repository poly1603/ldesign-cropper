# Clean Git conflict markers from source files
$files = @(
    "packages\core\src\core\Cropper.ts",
    "packages\core\src\core\BatchProcessor.ts",
    "packages\core\src\core\InteractionManager.ts",
    "packages\core\src\types\index.ts",
    "packages\core\src\filters\FilterEngine.ts",
    "packages\core\src\utils\math.ts"
)

Write-Host "Cleaning Git conflict markers..." -ForegroundColor Cyan

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        $originalLength = $content.Length
        
        # Remove conflict markers and choose the "ours" version (between <<<<<<< and =======)
        # Pattern explanation:
        # - Find <<<<<<< HEAD (or any branch)
        # - Keep everything until =======
        # - Remove everything from ======= to >>>>>>> 
        
        $cleaned = $content -replace '(?sm)<<<<<<< .*?\r?\n(.*?)\r?\n=======\r?\n.*?\r?\n>>>>>>> .*?\r?\n', '$1'
        
        if ($cleaned.Length -ne $originalLength) {
            Set-Content -Path $file -Value $cleaned -NoNewline
            Write-Host "  Cleaned! Removed $($originalLength - $cleaned.Length) bytes" -ForegroundColor Green
        } else {
            Write-Host "  No conflicts found" -ForegroundColor Gray
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
