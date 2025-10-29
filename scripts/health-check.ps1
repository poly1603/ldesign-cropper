# Cropper 项目健康检查脚本
# 用于验证项目结构和配置的完整性

Write-Host "🔍 Cropper 项目健康检查" -ForegroundColor Cyan
Write-Host "=" * 50

$errors = @()
$warnings = @()
$success = @()

# 1. 检查包结构
Write-Host "`n📦 检查包结构..." -ForegroundColor Yellow

$packages = @(
    "core",
    "vanilla", 
    "vue",
    "react",
    "angular",
    "solid",
    "svelte",
    "qwik",
    "lit"
)

foreach ($pkg in $packages) {
    $pkgPath = "packages\$pkg"
    
    if (Test-Path $pkgPath) {
        $success += "✅ 包 $pkg 存在"
        
        # 检查必需文件
        $requiredFiles = @(
            "package.json",
            "src\index.ts",
            "tsconfig.json"
        )
        
        foreach ($file in $requiredFiles) {
            $filePath = Join-Path $pkgPath $file
            if (Test-Path $filePath) {
                $success += "  ✅ $file"
            }
            else {
                $errors += "  ❌ 缺少文件: $pkg/$file"
            }
        }
        
        # 检查 builder 配置
        $builderConfig = Join-Path $pkgPath ".ldesign\builder.config.ts"
        if (Test-Path $builderConfig) {
            $success += "  ✅ builder.config.ts"
        }
        else {
            $warnings += "  ⚠️  缺少: $pkg/.ldesign/builder.config.ts"
        }
    }
    else {
        $errors += "❌ 包 $pkg 不存在"
    }
}

# 2. 检查根配置文件
Write-Host "`n⚙️  检查根配置文件..." -ForegroundColor Yellow

$rootFiles = @(
    "package.json",
    "pnpm-workspace.yaml",
    "tsconfig.json",
    "eslint.config.js",
    "README.md"
)

foreach ($file in $rootFiles) {
    if (Test-Path $file) {
        $success += "✅ $file"
    }
    else {
        $errors += "❌ 缺少: $file"
    }
}

# 3. 检查文档文件
Write-Host "`n📚 检查文档文件..." -ForegroundColor Yellow

$docFiles = @(
    "README.md",
    "ARCHITECTURE.md",
    "FEATURES.md",
    "QUICK_START_GUIDE.md",
    "CONTRIBUTING.md",
    "ROADMAP.md",
    "FINAL_STATUS.md",
    "REFACTORING_COMPLETE.md",
    "PROJECT_OVERVIEW.md"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        $success += "✅ $file"
    }
    else {
        $warnings += "⚠️  缺少文档: $file"
    }
}

# 4. 检查包的 README
Write-Host "`n📖 检查包 README..." -ForegroundColor Yellow

$packagesWithReadme = @("angular", "solid", "svelte", "qwik")
foreach ($pkg in $packagesWithReadme) {
    $readme = "packages\$pkg\README.md"
    if (Test-Path $readme) {
        $success += "✅ $pkg/README.md"
    }
    else {
        $warnings += "⚠️  缺少: $pkg/README.md"
    }
}

# 5. 检查 node_modules
Write-Host "`n📦 检查依赖..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    $success += "✅ node_modules 存在"
}
else {
    $warnings += "⚠️  node_modules 不存在,需要运行: pnpm install"
}

# 6. 检查构建产物
Write-Host "`n🔨 检查构建产物..." -ForegroundColor Yellow

$builtPackages = 0
foreach ($pkg in $packages) {
    $esDir = "packages\$pkg\es"
    $libDir = "packages\$pkg\lib"
    
    if ((Test-Path $esDir) -and (Test-Path $libDir)) {
        $builtPackages++
    }
}

if ($builtPackages -eq $packages.Count) {
    $success += "✅ 所有包已构建 ($builtPackages/$($packages.Count))"
}
elseif ($builtPackages -gt 0) {
    $warnings += "⚠️  部分包已构建 ($builtPackages/$($packages.Count))"
}
else {
    $warnings += "⚠️  没有包已构建,需要运行: pnpm build"
}

# 7. 统计结果
Write-Host "`n" + ("=" * 50)
Write-Host "📊 检查结果统计" -ForegroundColor Cyan
Write-Host "=" * 50

Write-Host "`n✅ 成功: $($success.Count)" -ForegroundColor Green
Write-Host "⚠️  警告: $($warnings.Count)" -ForegroundColor Yellow
Write-Host "❌ 错误: $($errors.Count)" -ForegroundColor Red

# 显示详细信息
if ($errors.Count -gt 0) {
    Write-Host "`n❌ 错误详情:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host $error -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  警告详情:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host $warning -ForegroundColor Yellow
    }
}

# 8. 给出建议
Write-Host "`n💡 建议的后续步骤:" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "  1. 安装依赖: pnpm install"
}

if ($builtPackages -eq 0) {
    Write-Host "  2. 构建所有包: pnpm build"
}

Write-Host "  3. 运行测试: pnpm test"
Write-Host "  4. 代码检查: pnpm lint"
Write-Host "  5. 类型检查: pnpm typecheck"

# 9. 项目信息
Write-Host "`n📊 项目信息:" -ForegroundColor Cyan
Write-Host "  包数量: $($packages.Count)"
Write-Host "  文档数量: $($docFiles.Count)"
Write-Host "  已构建: $builtPackages/$($packages.Count)"

# 10. 退出码
Write-Host "`n" + ("=" * 50)
if ($errors.Count -gt 0) {
    Write-Host "❌ 健康检查失败" -ForegroundColor Red
    exit 1
}
elseif ($warnings.Count -gt 0) {
    Write-Host "⚠️  健康检查通过(有警告)" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "✅ 健康检查完全通过!" -ForegroundColor Green
    exit 0
}
