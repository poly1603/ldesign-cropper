# Cropper 构建和测试指南

## 📋 当前状态

### ✅ 已完成
1. 工作空间结构创建
2. 所有包的配置文件（`.ldesign/builder.config.ts`）
3. Core、Vanilla、Vue、React、Lit 包的代码

### ⏸️ 待完成
1. 解决主工作空间依赖问题
2. 构建所有包
3. 创建并测试演示项目

## 🔧 解决依赖问题

主工作空间有 `@ldesign/color` 包的依赖问题。需要先解决这个问题才能构建：

```bash
cd E:\ldesign\ldesign

# 解决 @ldesign/color 依赖问题
# 选项 1: 构建 @ldesign/color 包
cd packages/color
pnpm install
pnpm run build

# 选项 2: 临时移除有问题的包
# 或者等待依赖问题解决

# 然后安装所有依赖
cd E:\ldesign\ldesign
pnpm install
```

## 📦 构建包（按顺序）

### 1. 构建 Builder 工具
```bash
cd E:\ldesign\ldesign\tools\builder
pnpm install
pnpm run build
```

### 2. 构建 Core 包
```bash
cd E:\ldesign\ldesign\libraries\cropper\packages\core
pnpm run build
```

### 3. 构建其他包
```bash
# Vanilla
cd ../vanilla
pnpm run build

# Vue
cd ../vue
pnpm run build

# React
cd ../react
pnpm run build

# Lit
cd ../lit
pnpm run build
```

## 🎯 创建演示项目

### Vanilla JS Demo

```bash
cd E:\ldesign\ldesign\libraries\cropper\packages\vanilla
mkdir demo
cd demo
pnpm create vite . --template vanilla-ts
```

创建 `demo/src/main.ts`:
```typescript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/es/style.css'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div>
    <h1>Cropper Vanilla Demo</h1>
    <div id="cropper-container" style="width: 800px; height: 600px; margin: 20px auto;"></div>
  </div>
`

// 创建示例图片
const img = new Image()
img.src = 'https://picsum.photos/1200/800'
img.onload = () => {
  const cropper = new Cropper('#cropper-container', {
    src: img.src,
    aspectRatio: 16 / 9,
  })
  
  console.log('Cropper initialized:', cropper)
}
```

### Vue 3 Demo

```bash
cd E:\ldesign\ldesign\libraries\cropper\packages\vue
mkdir demo
cd demo
pnpm create vite . --template vue-ts
```

创建 `demo/src/App.vue`:
```vue
<template>
  <div class="app">
    <h1>Cropper Vue Demo</h1>
    <Cropper
      ref="cropperRef"
      src="https://picsum.photos/1200/800"
      :aspect-ratio="16/9"
      @ready="onReady"
      @crop="onCrop"
      style="width: 800px; height: 600px; margin: 20px auto;"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Cropper } from '@ldesign/cropper-vue'
import '@ldesign/cropper-vue/es/style.css'

const cropperRef = ref()

const onReady = () => {
  console.log('Cropper ready!')
}

const onCrop = (e: CustomEvent) => {
  console.log('Crop data:', e.detail)
}
</script>
```

### React Demo

```bash
cd E:\ldesign\ldesign\libraries\cropper\packages\react
mkdir demo
cd demo
pnpm create vite . --template react-ts
```

创建 `demo/src/App.tsx`:
```tsx
import { useRef } from 'react'
import { Cropper, type CropperRef } from '@ldesign/cropper-react'
import '@ldesign/cropper-react/es/style.css'
import './App.css'

function App() {
  const cropperRef = useRef<CropperRef>(null)

  const handleReady = () => {
    console.log('Cropper ready!')
  }

  const handleCrop = (e: CustomEvent) => {
    console.log('Crop data:', e.detail)
  }

  return (
    <div className="app">
      <h1>Cropper React Demo</h1>
      <Cropper
        ref={cropperRef}
        src="https://picsum.photos/1200/800"
        aspectRatio={16/9}
        onReady={handleReady}
        onCrop={handleCrop}
        style={{ width: '800px', height: '600px', margin: '20px auto' }}
      />
    </div>
  )
}

export default App
```

### Lit Demo

```bash
cd E:\ldesign\ldesign\libraries\cropper\packages\lit
mkdir demo
cd demo
pnpm create vite . --template lit-ts
```

创建 `demo/src/my-element.ts`:
```typescript
import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@ldesign/cropper-lit'
import '@ldesign/cropper-lit/es/style.css'

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 20px;
    }

    l-cropper {
      width: 800px;
      height: 600px;
      margin: 20px auto;
      display: block;
    }
  `

  render() {
    return html`
      <div>
        <h1>Cropper Lit Demo</h1>
        <l-cropper
          src="https://picsum.photos/1200/800"
          aspect-ratio="1.7778"
          @cropper-ready=${this.handleReady}
          @cropper-crop=${this.handleCrop}
        ></l-cropper>
      </div>
    `
  }

  private handleReady() {
    console.log('Cropper ready!')
  }

  private handleCrop(e: CustomEvent) {
    console.log('Crop data:', e.detail)
  }
}
```

## 🧪 测试演示

### 配置 Demo Package.json

每个 demo 的 `package.json` 需要添加对应包的依赖：

```json
{
  "dependencies": {
    "@ldesign/cropper": "workspace:*",  // vanilla
    // 或
    "@ldesign/cropper-vue": "workspace:*",  // vue
    // 或
    "@ldesign/cropper-react": "workspace:*",  // react
    // 或
    "@ldesign/cropper-lit": "workspace:*"  // lit
  }
}
```

### 运行演示

```bash
# 在各自的 demo 目录中
pnpm install
pnpm run dev

# 打开浏览器访问 http://localhost:5173
```

## 📝 验证清单

- [ ] Builder 工具构建成功
- [ ] Core 包构建成功（生成 es/, lib/, dist/ 目录）
- [ ] Vanilla 包构建成功
- [ ] Vue 包构建成功
- [ ] React 包构建成功
- [ ] Lit 包构建成功
- [ ] Vanilla Demo 运行正常
- [ ] Vue Demo 运行正常
- [ ] React Demo 运行正常
- [ ] Lit Demo 运行正常

## 🐛 常见问题

### 1. ldesign-builder 命令找不到
确保 @ldesign/builder 已构建并且在 PATH 中。

### 2. 包依赖找不到
确保先构建 core 包，再构建其他包。

### 3. 类型定义缺失
确保配置中 `dts: true`，并且 TypeScript 编译成功。

## 📄 许可证

MIT


