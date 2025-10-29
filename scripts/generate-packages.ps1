# Script to generate framework adapter packages
$frameworks = @(
    @{ Name = "angular"; Version = "^17.0.0"; PeerDep = "@angular/core" },
    @{ Name = "solid"; Version = "^1.8.0"; PeerDep = "solid-js" },
    @{ Name = "svelte"; Version = "^4.0.0"; PeerDep = "svelte" },
    @{ Name = "qwik"; Version = "^1.0.0"; PeerDep = "@builder.io/qwik" },
    @{ Name = "preact"; Version = "^10.0.0"; PeerDep = "preact" }
)

$rootDir = "D:\WorkBench\ldesign\libraries\cropper\packages"

foreach ($framework in $frameworks) {
    $packageDir = Join-Path $rootDir $framework.Name
    $srcDir = Join-Path $packageDir "src"
    $ldesignDir = Join-Path $packageDir ".ldesign"
    $testDir = Join-Path $packageDir "__tests__"
    
    # Create directories
    New-Item -ItemType Directory -Path $srcDir -Force | Out-Null
    New-Item -ItemType Directory -Path $ldesignDir -Force | Out-Null
    New-Item -ItemType Directory -Path $testDir -Force | Out-Null
    
    Write-Output "Created package structure for $($framework.Name)"
}

Write-Output "`nAll framework packages created successfully!"
