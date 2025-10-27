# 启动所有演示项目的脚本

Write-Host "🎬 启动所有 Cropper 演示项目" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$rootPath = $PSScriptRoot

Write-Host "`n选择要启动的演示项目:" -ForegroundColor Yellow
Write-Host "1. Vanilla JS Demo (端口 5173)" -ForegroundColor Green
Write-Host "2. Vue 3 Demo (端口 5174)" -ForegroundColor Green
Write-Host "3. React Demo (端口 5175)" -ForegroundColor Green
Write-Host "4. Lit Demo (端口 5176)" -ForegroundColor Green
Write-Host "5. 全部启动 (并行)" -ForegroundColor Cyan

$choice = Read-Host "`n请输入选择 (1-5)"

function Start-Demo {
    param($name, $path, $port)
    
    Write-Host "`n🚀 启动 $name Demo..." -ForegroundColor Yellow
    $demoPath = Join-Path $rootPath $path
    
    if (!(Test-Path $demoPath)) {
        Write-Host "❌ Demo 目录不存在: $demoPath" -ForegroundColor Red
        return
    }
    
    Set-Location $demoPath
    
    # 检查是否已安装依赖
    if (!(Test-Path "node_modules")) {
        Write-Host "📦 安装依赖..." -ForegroundColor Gray
        pnpm install
    }
    
    Write-Host "✅ 启动开发服务器 (端口: $port)..." -ForegroundColor Green
    Write-Host "   浏览器打开: http://localhost:$port" -ForegroundColor Cyan
    pnpm run dev
}

switch ($choice) {
    "1" {
        Start-Demo "Vanilla JS" "packages\vanilla\demo" 5173
    }
    "2" {
        Start-Demo "Vue 3" "packages\vue\demo" 5174
    }
    "3" {
        Start-Demo "React" "packages\react\demo" 5175
    }
    "4" {
        Start-Demo "Lit" "packages\lit\demo" 5176
    }
    "5" {
        Write-Host "`n🎯 并行启动所有演示项目..." -ForegroundColor Cyan
        Write-Host "请分别打开新的终端窗口并运行以下命令：" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "终端 1: cd packages\vanilla\demo && pnpm install && pnpm run dev" -ForegroundColor Gray
        Write-Host "终端 2: cd packages\vue\demo && pnpm install && pnpm run dev" -ForegroundColor Gray
        Write-Host "终端 3: cd packages\react\demo && pnpm install && pnpm run dev" -ForegroundColor Gray
        Write-Host "终端 4: cd packages\lit\demo && pnpm install && pnpm run dev" -ForegroundColor Gray
        Write-Host ""
        Write-Host "或使用以下 PowerShell 命令并行启动：" -ForegroundColor Yellow
        
        # 并行启动
        $jobs = @()
        
        $jobs += Start-Job -ScriptBlock {
            Set-Location "E:\ldesign\ldesign\libraries\cropper\packages\vanilla\demo"
            pnpm install
            pnpm run dev
        }
        
        $jobs += Start-Job -ScriptBlock {
            Set-Location "E:\ldesign\ldesign\libraries\cropper\packages\vue\demo"
            pnpm install
            pnpm run dev
        }
        
        $jobs += Start-Job -ScriptBlock {
            Set-Location "E:\ldesign\ldesign\libraries\cropper\packages\react\demo"
            pnpm install
            pnpm run dev
        }
        
        $jobs += Start-Job -ScriptBlock {
            Set-Location "E:\ldesign\ldesign\libraries\cropper\packages\lit\demo"
            pnpm install
            pnpm run dev
        }
        
        Write-Host "✅ 所有演示项目已在后台启动" -ForegroundColor Green
        Write-Host "   Vanilla: http://localhost:5173" -ForegroundColor Cyan
        Write-Host "   Vue:     http://localhost:5174" -ForegroundColor Cyan
        Write-Host "   React:   http://localhost:5175" -ForegroundColor Cyan
        Write-Host "   Lit:     http://localhost:5176" -ForegroundColor Cyan
        
        Write-Host "`n按任意键停止所有演示..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        
        Write-Host "⏹️  停止所有演示项目..." -ForegroundColor Yellow
        $jobs | Stop-Job
        $jobs | Remove-Job
    }
    default {
        Write-Host "❌ 无效选择" -ForegroundColor Red
    }
}

Set-Location $rootPath

