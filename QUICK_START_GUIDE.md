# 🚀 Cropper 快速入门指南

欢迎使用 @ldesign/cropper! 本指南将帮助你在 5 分钟内开始使用。

---

## 📦 选择你的框架

@ldesign/cropper 支持 8 个主流前端框架,选择一个开始:

### 1️⃣ Vue 3

```bash
pnpm add @ldesign/cropper-vue
```

```vue
<script setup>
import { Cropper } from '@ldesign/cropper-vue'
import '@ldesign/cropper-vue/es/style.css'

const handleReady = () => {
  console.log('Cropper ready!')
}
</script>

<template>
  <Cropper
    src="https://example.com/image.jpg"
    :aspect-ratio="16/9"
    @ready="handleReady"
  />
</template>
```

### 2️⃣ React

```bash
pnpm add @ldesign/cropper-react
```

```jsx
import { Cropper } from '@ldesign/cropper-react'
import '@ldesign/cropper-react/es/style.css'

function App() {
  return (
    <Cropper
      src="https://example.com/image.jpg"
      aspectRatio={16/9}
      onReady={() => console.log('Ready!')}
    />
  )
}
```

### 3️⃣ Angular

```bash
pnpm add @ldesign/cropper-angular
```

```typescript
import { Component } from '@angular/core'
import { CropperComponent } from '@ldesign/cropper-angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CropperComponent],
  template: `
    <l-cropper
      [src]="'https://example.com/image.jpg'"
      [aspectRatio]="16/9"
      (ready)="onReady()"
    ></l-cropper>
  `
})
export class AppComponent {
  onReady() {
    console.log('Ready!')
  }
}
```

### 4️⃣ Solid.js

```bash
pnpm add @ldesign/cropper-solid
```

```tsx
import { Cropper } from '@ldesign/cropper-solid'

function App() {
  return (
    <Cropper
      src="https://example.com/image.jpg"
      aspectRatio={16/9}
      onReady={() => console.log('Ready!')}
    />
  )
}
```

### 5️⃣ Svelte

```bash
pnpm add @ldesign/cropper-svelte
```

```svelte
<script>
  import { Cropper } from '@ldesign/cropper-svelte'
</script>

<Cropper
  src="https://example.com/image.jpg"
  aspectRatio={16/9}
  on:ready={() => console.log('Ready!')}
/>
```

### 6️⃣ Qwik

```bash
pnpm add @ldesign/cropper-qwik
```

```tsx
import { component$ } from '@builder.io/qwik'
import { Cropper } from '@ldesign/cropper-qwik'

export default component$(() => {
  return (
    <Cropper
      src="https://example.com/image.jpg"
      aspectRatio={16/9}
      onReady$={() => console.log('Ready!')}
    />
  )
})
```

### 7️⃣ 原生 JavaScript

```bash
pnpm add @ldesign/cropper
```

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/es/style.css'

const cropper = new Cropper('#container', {
  src: 'https://example.com/image.jpg',
  aspectRatio: 16 / 9,
  ready: () => console.log('Ready!')
})
```

### 8️⃣ Lit (Web Components)

```bash
pnpm add @ldesign/cropper-lit
```

```html
<script type="module">
  import '@ldesign/cropper-lit'
</script>

<l-cropper
  src="https://example.com/image.jpg"
  aspect-ratio="1.7778"
></l-cropper>
```

---

## 🎨 常见用例

### 获取裁剪后的图片

#### Vue
```vue
<script setup>
import { ref } from 'vue'
import { Cropper } from '@ldesign/cropper-vue'

const cropperRef = ref()

const getCropped = () => {
  const canvas = cropperRef.value.getCroppedCanvas()
  const dataUrl = canvas.toDataURL('image/png')
  console.log(dataUrl)
}
</script>

<template>
  <Cropper ref="cropperRef" src="image.jpg" />
  <button @click="getCropped">获取图片</button>
</template>
```

#### React
```jsx
import { useRef } from 'react'
import { Cropper } from '@ldesign/cropper-react'

function App() {
  const cropperRef = useRef()

  const getCropped = () => {
    const canvas = cropperRef.current.getCroppedCanvas()
    const dataUrl = canvas.toDataURL('image/png')
    console.log(dataUrl)
  }

  return (
    <>
      <Cropper ref={cropperRef} src="image.jpg" />
      <button onClick={getCropped}>获取图片</button>
    </>
  )
}
```

### 应用滤镜

```typescript
import { FilterEngine } from '@ldesign/cropper-core'

const canvas = document.querySelector('canvas')
const filterEngine = new FilterEngine(canvas)

// 应用内置滤镜
filterEngine.applyFilter('grayscale')
filterEngine.applyFilter('vintage')

// 应用Instagram风格预设
filterEngine.applyPreset('valencia')
filterEngine.applyPreset('nashville')
```

### 批量处理

```typescript
import { BatchProcessor } from '@ldesign/cropper-core'

const processor = new BatchProcessor({
  concurrency: 3,
  mode: 'parallel'
})

const images = ['img1.jpg', 'img2.jpg', 'img3.jpg']

await processor.process(images, async (src) => {
  // 处理每个图片
  return { src, processed: true }
})
```

---

## ⚙️ 常用配置

### 基础配置

```typescript
{
  src: 'image.jpg',           // 图片源
  aspectRatio: 16 / 9,        // 固定宽高比
  viewMode: 1,                 // 视图模式 (0-3)
  dragMode: 'crop',            // 拖拽模式
  autoCrop: true,              // 自动裁剪
  movable: true,               // 可移动
  rotatable: true,             // 可旋转
  scalable: true,              // 可缩放
  zoomable: true,              // 可缩放
  zoomOnWheel: true            // 滚轮缩放
}
```

### 高级配置

```typescript
{
  // Web Worker支持
  useWorker: true,
  workerOptions: {
    maxWorkers: 4,
    timeout: 30000
  },

  // 触摸手势
  touchGestures: true,
  touchOptions: {
    pinchZoom: true,
    doubleTapZoom: true,
    swipeGestures: true
  },

  // 移动端UI
  mobileUI: true,
  mobileOptions: {
    autoDetect: true,
    breakpoint: 768,
    simplifiedControls: true
  },

  // 无障碍支持
  accessibility: true,
  accessibilityOptions: {
    enabled: true,
    announceActions: true,
    keyboardHelp: true
  }
}
```

---

## 🎯 特色功能

### 1. 滤镜系统

16种内置滤镜:
- brightness, contrast, saturation, hue
- grayscale, sepia, invert, blur
- sharpen, edge-detect, emboss, vignette
- temperature, exposure, noise, pixelate

17种Instagram风格预设:
- valencia, nashville, lomo, toaster
- walden, earlybird, mayfair, amaro
- gingham, clarendon, vintage, dramatic
- cool, warm, faded, vivid, black-white

### 2. 批量处理

- 队列管理
- 并行/串行处理
- 进度追踪
- 错误处理

### 3. 高级工具

- 绘图工具
- 图层系统
- 选区和蒙版
- 键盘快捷键

---

## 📚 深入学习

### API 文档

每个包的 README 包含完整的 API 文档:
- `packages/vue/README.md`
- `packages/react/README.md`
- `packages/angular/README.md`
- `packages/solid/README.md`
- `packages/svelte/README.md`
- `packages/qwik/README.md`

### 架构文档

- `ARCHITECTURE.md` - 完整架构说明
- `FEATURES.md` - 功能列表 (150+)
- `REFACTORING_COMPLETE.md` - 项目详情

---

## 💡 最佳实践

### 1. 响应式布局

```typescript
{
  responsive: true,  // 自动适应容器大小
  restore: true      // 窗口大小改变时恢复状态
}
```

### 2. 性能优化

```typescript
{
  useWorker: true,           // 使用Web Worker
  wheelZoomRatio: 0.1,       // 滚轮缩放比例
  checkOrientation: true     // 自动修正图片方向
}
```

### 3. 用户体验

```typescript
{
  guides: true,              // 显示参考线
  center: true,              // 显示中心点
  highlight: true,           // 高亮裁剪区域
  background: true,          // 显示网格背景
  modal: true                // 显示遮罩
}
```

---

## 🐛 常见问题

### Q: 如何设置固定比例?
```typescript
aspectRatio: 16 / 9  // 或 1 (正方形), 4/3, etc.
```

### Q: 如何禁用某些功能?
```typescript
{
  movable: false,
  rotatable: false,
  scalable: false,
  zoomable: false
}
```

### Q: 如何获取裁剪数据?
```typescript
const data = cropper.getCropBoxData()
const imageData = cropper.getImageData()
```

### Q: 如何重置裁剪?
```typescript
cropper.reset()    // 重置到初始状态
cropper.clear()    // 清除裁剪框
```

---

## 🔗 相关链接

- [完整文档](./ARCHITECTURE.md)
- [功能列表](./FEATURES.md)
- [示例代码](./examples/)
- [GitHub Issues](https://github.com/ldesign/cropper/issues)

---

## 🎉 开始使用吧!

选择你喜欢的框架,5 分钟即可集成完成!

**遇到问题?** 查看 [常见问题](#-常见问题) 或提交 Issue。

**想要贡献?** 查看 [贡献指南](./CONTRIBUTING.md)。

---

**祝你使用愉快!** ❤️
