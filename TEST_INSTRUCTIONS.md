# 🧪 Cropper 测试说明

## 📋 测试前准备

### 1. 确保 @ldesign/builder 可用

```bash
cd E:\ldesign\ldesign\tools\builder
pnpm install
pnpm run build
```

### 2. 确保 builder 命令在 PATH 中

检查：
```powershell
ldesign-builder --version
```

如果找不到命令，使用完整路径：
```powershell
node E:\ldesign\ldesign\tools\builder\bin\ldesign-builder.js
```

## 🔨 构建所有包

### 方式 A: 使用测试脚本

```powershell
cd E:\ldesign\ldesign\libraries\cropper
.\test-all.ps1
```

### 方式 B: 手动构建每个包

```powershell
# 1. Core 包
cd E:\ldesign\ldesign\libraries\cropper\packages\core
ldesign-builder

# 验证输出
ls es, lib, dist

# 2. Vanilla 包
cd ..\vanilla
ldesign-builder
ls es, lib, dist

# 3. Vue 包
cd ..\vue
ldesign-builder
ls es, lib, dist

# 4. React 包
cd ..\react
ldesign-builder
ls es, lib, dist

# 5. Lit 包
cd ..\lit
ldesign-builder
ls es, lib, dist
```

## 🎮 启动演示项目

### 方式 A: 使用启动脚本

```powershell
cd E:\ldesign\ldesign\libraries\cropper
.\start-demos.ps1

# 选择要启动的演示项目
# 1 = Vanilla
# 2 = Vue
# 3 = React
# 4 = Lit
# 5 = 全部并行启动
```

### 方式 B: 手动启动

#### Vanilla JS Demo
```powershell
cd packages\vanilla\demo
pnpm install
pnpm run dev
```
**打开浏览器**: http://localhost:5173

#### Vue 3 Demo
```powershell
cd packages\vue\demo
pnpm install
pnpm run dev
```
**打开浏览器**: http://localhost:5174

#### React Demo
```powershell
cd packages\react\demo
pnpm install
pnpm run dev
```
**打开浏览器**: http://localhost:5175

#### Lit Demo
```powershell
cd packages\lit\demo
pnpm install
pnpm run dev
```
**打开浏览器**: http://localhost:5176

## ✅ 功能测试清单

在每个演示项目中测试以下功能：

### 基础功能
- [ ] 页面加载，裁剪器正常显示
- [ ] 图片加载成功（来自 picsum.photos）
- [ ] 拖动裁剪框可以调整位置
- [ ] 拖动裁剪框边缘可以调整大小
- [ ] 鼠标滚轮可以缩放图片

### 按钮功能
- [ ] ↻ Rotate 按钮 - 旋转 90°
- [ ] ↔ Flip H 按钮 - 水平翻转
- [ ] ↕ Flip V 按钮 - 垂直翻转
- [ ] Reset 按钮 - 重置到初始状态
- [ ] Get Cropped Image 按钮 - 显示裁剪结果

### 控制台输出
- [ ] "✅ Cropper ready!" 消息
- [ ] "📐 Crop data:" 持续输出（拖动裁剪框时）
- [ ] Cropper 实例对象打印正确

### 裁剪结果
- [ ] 点击 "Get Cropped Image" 后显示裁剪后的图片
- [ ] 裁剪结果尺寸正确
- [ ] 裁剪结果位置正确

## 🖥️ 浏览器测试

建议在以下浏览器测试：
- Chrome/Edge (最新版)
- Firefox (最新版)
- Safari (最新版，如果可用)

## 📊 预期结果

### 构建输出

每个包构建后应该有：
```
packages/[包名]/
├── es/              # ESM 格式
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── lib/             # CJS 格式
│   ├── index.cjs
│   ├── index.d.ts
│   └── ...
└── dist/            # UMD 格式
    ├── index.js
    ├── index.min.js (可选)
    └── ...
```

### 演示项目界面

每个演示应该显示：
1. 标题（例如："🖼️ Cropper Vue 3 Demo"）
2. 5个控制按钮（Rotate, Flip H, Flip V, Reset, Get Cropped）
3. 裁剪器容器（800x600px，带蓝色边框）
4. 图片正常加载和显示
5. 裁剪框可见并可操作

## 🐛 常见问题排查

### 问题 1: 模块找不到

**症状**: "Cannot find module '@ldesign/cropper-core'"

**解决**:
```bash
# 确保 core 包已构建
cd packages/core
ldesign-builder

# 确保演示项目已安装依赖
cd ../[框架]/demo
pnpm install
```

### 问题 2: 样式未加载

**症状**: 裁剪器无样式

**解决**: 检查 demo 中是否导入了样式：
```typescript
// 取消注释
import '@ldesign/cropper/es/style.css'
// 或
import '@ldesign/cropper-core/es/style.css'
```

### 问题 3: Vite 端口冲突

**症状**: "Port 5173 is already in use"

**解决**: 
- 关闭其他占用端口的服务
- 或修改 `vite.config.ts` 中的端口号

### 问题 4: TypeScript 错误

**症状**: 类型定义找不到

**解决**:
```bash
# 确保包已构建并生成了 .d.ts 文件
cd packages/core
ls es/*.d.ts
```

## 📝 测试报告模板

```markdown
## 测试日期: [日期]

### 构建测试
- [ ] @ldesign/cropper-core 构建成功
- [ ] @ldesign/cropper 构建成功
- [ ] @ldesign/cropper-vue 构建成功
- [ ] @ldesign/cropper-react 构建成功
- [ ] @ldesign/cropper-lit 构建成功

### 演示测试
- [ ] Vanilla Demo 启动成功
- [ ] Vue Demo 启动成功
- [ ] React Demo 启动成功
- [ ] Lit Demo 启动成功

### 功能测试
- [ ] 所有基础功能正常
- [ ] 所有按钮功能正常
- [ ] 裁剪结果正确
- [ ] 控制台无错误

### 浏览器兼容性
- [ ] Chrome 测试通过
- [ ] Firefox 测试通过
- [ ] Edge 测试通过

### 问题记录
[记录遇到的任何问题]

### 截图
[可选：添加演示截图]
```

## 🎯 完整测试流程

```powershell
# 1. 进入项目目录
cd E:\ldesign\ldesign\libraries\cropper

# 2. 运行构建测试
.\test-all.ps1

# 3. 启动演示（选择一个）
.\start-demos.ps1

# 4. 在浏览器中测试所有功能

# 5. 记录测试结果
```

## 📄 许可证

MIT

