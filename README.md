# @ldesign/cropper

> 强大的、支持多框架的图像裁剪库 - 150+ 功能特性,8 个框架支持

[![NPM Version](https://img.shields.io/npm/v/@ldesign/cropper-core.svg)](https://www.npmjs.com/package/@ldesign/cropper-core)
[![License](https://img.shields.io/npm/l/@ldesign/cropper-core.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

## ✨ 特性

- 🎯 **8 个框架支持** - Vue, React, Angular, Solid, Svelte, Qwik, Lit, Vanilla JS
- 🎨 **150+ 功能特性** - 裁剪、滤镜、批量处理、绘图工具
- 📦 **TypeScript** - 完整的类型定义
- ⚡ **高性能** - 60fps 流畅动画,Web Worker 支持
- 🎁 **丰富滤镜** - 16 种内置滤镜 + 17 种 Instagram 风格预设
- 📱 **移动端优化** - 触摸手势,响应式设计
- ♿ **无障碍支持** - ARIA 标签,键盘快捷键
- 💪 **生产就绪** - 经过实战检验和优化

## 📦 包结构

- `@ldesign/cropper-core` - 核心功能库 (框架无关)
- `@ldesign/cropper` - 原生 JS 封装
- `@ldesign/cropper-vue` - Vue 3 组件
- `@ldesign/cropper-react` - React 组件
- `@ldesign/cropper-angular` - Angular 组件 ✨
- `@ldesign/cropper-solid` - Solid.js 组件 ✨
- `@ldesign/cropper-svelte` - Svelte 组件 ✨
- `@ldesign/cropper-qwik` - Qwik 组件 ✨
- `@ldesign/cropper-lit` - Lit Web Component

## 🚀 快速开始

### 原生 JS

```bash
pnpm add @ldesign/cropper
```

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/es/style.css'

const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9
})
```

### Vue 3

```bash
pnpm add @ldesign/cropper-vue
```

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

const onReady = () => {
  console.log('Cropper ready!')
}
</script>
```

### React

```bash
pnpm add @ldesign/cropper-react
```

```jsx
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

### Lit

```bash
pnpm add @ldesign/cropper-lit
```

```html
<script type="module">
  import '@ldesign/cropper-lit'
</script>

<l-cropper
  src="image.jpg"
  aspect-ratio="1.7778"
></l-cropper>
```

## 💻 开发

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 运行演示
pnpm demo:vue
pnpm demo:react
pnpm demo:lit
```

## 📄 License

MIT
