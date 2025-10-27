# @ldesign/cropper

强大的图像裁剪库，支持多种框架。

## 📦 包结构

- `@ldesign/cropper-core` - 核心功能库
- `@ldesign/cropper` - 原生 JS 封装
- `@ldesign/cropper-vue` - Vue 3 组件
- `@ldesign/cropper-react` - React 组件
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
