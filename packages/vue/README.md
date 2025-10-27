# @ldesign/cropper-vue

Vue 3 适配器，用于 @ldesign/cropper-core

## 特性

- 🎯 **Vue 3 组件** - 开箱即用的 Vue 3 组件
- 🪝 **Composition API** - useCropper 组合式 API
- 📌 **指令支持** - v-cropper 指令
- 🔄 **响应式** - 完全支持 Vue 3 响应式系统
- 🎨 **TypeScript** - 完整的类型支持

## 安装

```bash
npm install @ldesign/cropper-vue @ldesign/cropper-core
```

## 使用方式

### 1. 组件方式

```vue
<template>
  <div>
    <VueCropper
      ref="cropperRef"
      :src="imageSrc"
      :aspect-ratio="16 / 9"
      :auto-crop="true"
      @ready="onReady"
      @crop="onCrop"
    />
    <button @click="crop">裁剪</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueCropper } from '@ldesign/cropper-vue'

const imageSrc = ref('/path/to/image.jpg')
const cropperRef = ref(null)

const onReady = (event) => {
  console.log('Cropper is ready')
}

const onCrop = (event) => {
  console.log('Crop event:', event)
}

const crop = () => {
  const canvas = cropperRef.value?.getCroppedCanvas()
  // 使用 canvas
}
</script>
```

### 2. Composable 方式

```vue
<template>
  <div>
    <div ref="containerRef"></div>
    <button @click="crop">裁剪</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCropper } from '@ldesign/cropper-vue'

const containerRef = ref(null)

const { cropper, ready } = useCropper(containerRef, {
  src: '/path/to/image.jpg',
  aspectRatio: 16 / 9,
  autoCrop: true
})

const crop = () => {
  if (cropper.value) {
    const canvas = cropper.value.getCroppedCanvas()
    // 使用 canvas
  }
}
</script>
```

### 3. 指令方式

```vue
<template>
  <div
    v-cropper="{
      src: '/path/to/image.jpg',
      aspectRatio: 16 / 9,
      autoCrop: true
    }"
  ></div>
</template>

<script setup>
import { vCropper, getCropperInstance } from '@ldesign/cropper-vue'

const handleCrop = () => {
  const cropper = getCropperInstance(elementRef.value)
  if (cropper) {
    const canvas = cropper.getCroppedCanvas()
    // 使用 canvas
  }
}
</script>
```

## Props

所有 props 都与 @ldesign/cropper-core 的选项对应。

## Events

- `ready` - 裁剪器初始化完成
- `cropstart` - 开始裁剪
- `cropmove` - 裁剪移动中
- `cropend` - 裁剪结束
- `crop` - 裁剪变化
- `zoom` - 缩放变化

## 许可证

MIT

