# Cropper 快速开始指南

## 🚀 立即开始

### 步骤 1: 解决依赖问题

主工作空间有依赖问题需要先解决。选择以下任一方法：

**方法 A: 构建 color 包**
```bash
cd E:\ldesign\ldesign\packages\color
pnpm run build
```

**方法 B: 跳过有问题的包安装**
```bash
cd E:\ldesign\ldesign
# 编辑 pnpm-workspace.yaml，临时排除 packages/tabs
```

### 步骤 2: 构建 Builder 工具

```bash
cd E:\ldesign\ldesign\tools\builder
pnpm install
pnpm run build
```

### 步骤 3: 构建 Cropper 包

```bash
# 构建 core 包
cd E:\ldesign\ldesign\libraries\cropper\packages\core
pnpm run build

# 构建 vanilla 包
cd ../vanilla
pnpm run build

# 构建 vue 包
cd ../vue
pnpm run build

# 构建 react 包
cd ../react
pnpm run build

# 构建 lit 包
cd ../lit
pnpm run build
```

### 步骤 4: 创建演示项目

#### Vanilla Demo

```bash
cd E:\ldesign\ldesign\libraries\cropper\packages\vanilla
mkdir demo
cd demo
pnpm create vite@latest . --template vanilla-ts
```

编辑 `package.json`:
```json
{
  "dependencies": {
    "@ldesign/cropper": "workspace:*"
  }
}
```

编辑 `src/main.ts`:
```typescript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/es/style.css'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <div>
    <h1>Cropper Demo</h1>
    <div id="cropper" style="width: 800px; height: 600px"></div>
  </div>
`

new Cropper('#cropper', {
  src: 'https://picsum.photos/1200/800',
  aspectRatio: 16 / 9
})
```

启动：
```bash
pnpm install
pnpm run dev
```

## 📦 使用已构建的包

### 安装

```bash
# Vanilla JS
pnpm add @ldesign/cropper

# Vue 3
pnpm add @ldesign/cropper-vue

# React
pnpm add @ldesign/cropper-react

# Lit
pnpm add @ldesign/cropper-lit
```

### 使用示例

#### Vanilla JS
```typescript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/es/style.css'

const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9
})
```

#### Vue 3
```vue
<template>
  <Cropper
    src="image.jpg"
    :aspect-ratio="16/9"
    @ready="onReady"
  />
</template>

<script setup>
import { Cropper } from '@ldesign/cropper-vue'
import '@ldesign/cropper-vue/es/style.css'

const onReady = () => console.log('Ready!')
</script>
```

#### React
```tsx
import { Cropper } from '@ldesign/cropper-react'
import '@ldesign/cropper-react/es/style.css'

function App() {
  return (
    <Cropper
      src="image.jpg"
      aspectRatio={16/9}
      onReady={() => console.log('Ready!')}
    />
  )
}
```

#### Lit
```typescript
import '@ldesign/cropper-lit'
import '@ldesign/cropper-lit/es/style.css'

// 在模板中使用
html`<l-cropper src="image.jpg" aspect-ratio="1.7778"></l-cropper>`
```

## 🐛 问题排查

### 问题 1: ldesign-builder 命令找不到

**解决方案**: 确保 @ldesign/builder 已构建
```bash
cd E:\ldesign\ldesign\tools\builder
pnpm run build
```

### 问题 2: 包依赖找不到

**解决方案**: 确保先构建 core 包
```bash
cd E:\ldesign\ldesign\libraries\cropper\packages\core
pnpm run build
```

### 问题 3: 类型定义缺失

**解决方案**: 检查 tsconfig.json 和构建日志
```bash
# 查看构建日志
pnpm run build --verbose
```

## 📚 更多文档

- [完整构建指南](./BUILD_AND_TEST_GUIDE.md)
- [项目状态](./PROJECT_STATUS.md)
- [工作空间设置](./WORKSPACE_SETUP_COMPLETE.md)

## ✨ 特性

- 🎨 强大的图像裁剪和编辑
- 🎭 选区和蒙版系统
- 🖼️ 多图层支持
- 🎨 丰富的滤镜效果
- 🤖 AI 智能裁剪
- 📱 移动端优化
- ♿ 完整的无障碍支持
- ⚡ Web Workers 加速
- 🚀 虚拟画布技术

## 📄 许可证

MIT


