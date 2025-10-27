# @ldesign/cropper-react

React 适配器，用于 @ldesign/cropper-core

## 特性

- ⚛️ **React 组件** - 开箱即用的 React 组件
- 🪝 **React Hooks** - useCropper Hook
- 🔄 **响应式** - 完全支持 React 状态管理
- 🎨 **TypeScript** - 完整的类型支持
- 📦 **轻量级** - 最小化的包大小

## 安装

```bash
npm install @ldesign/cropper-react @ldesign/cropper-core
```

## 使用方式

### 1. 组件方式

```jsx
import { useRef } from 'react'
import { ReactCropper } from '@ldesign/cropper-react'

function App() {
  const cropperRef = useRef(null)

  const handleReady = (cropper) => {
    console.log('Cropper is ready', cropper)
  }

  const handleCrop = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCroppedCanvas()
      // 使用 canvas
    }
  }

  return (
    <div>
      <ReactCropper
        ref={cropperRef}
        src="/path/to/image.jpg"
        aspectRatio={16 / 9}
        autoCrop={true}
        onReady={handleReady}
        style={{ height: '400px', width: '100%' }}
      />
      <button onClick={handleCrop}>裁剪</button>
    </div>
  )
}
```

### 2. Hook 方式

```jsx
import { useCropper } from '@ldesign/cropper-react'

function App() {
  const {
    containerRef,
    isReady,
    getCroppedCanvas,
    rotate,
    scale
  } = useCropper({
    src: '/path/to/image.jpg',
    aspectRatio: 16 / 9,
    autoCrop: true
  })

  const handleCrop = () => {
    const canvas = getCroppedCanvas()
    // 使用 canvas
  }

  return (
    <div>
      <div ref={containerRef} style={{ height: '400px', width: '100%' }} />
      {isReady && (
        <div>
          <button onClick={handleCrop}>裁剪</button>
          <button onClick={() => rotate(90)}>旋转 90°</button>
          <button onClick={() => scale(1.1)}>放大</button>
        </div>
      )}
    </div>
  )
}
```

## Props

所有 props 都与 @ldesign/cropper-core 的选项对应。

### 组件特有 Props

- `style?: CSSProperties` - 容器样式
- `className?: string` - 容器类名
- `onReady?: (cropper: Cropper) => void` - 初始化完成回调
- `onCropStart?: (event: CustomEvent) => void` - 开始裁剪回调
- `onCropMove?: (event: CustomEvent) => void` - 裁剪移动回调
- `onCropEnd?: (event: CustomEvent) => void` - 裁剪结束回调
- `onCrop?: (event: CustomEvent) => void` - 裁剪变化回调
- `onZoom?: (event: CustomEvent) => void` - 缩放变化回调

## Ref 方法

组件通过 ref 暴露以下方法：

- `getCropper()` - 获取原始 Cropper 实例
- `getCroppedCanvas(options?)` - 获取裁剪后的 canvas
- `getData(rounded?)` - 获取裁剪数据
- `setData(data)` - 设置裁剪数据
- `rotate(degrees)` - 旋转图片
- `scale(scaleX, scaleY?)` - 缩放图片
- `scaleX(scale)` - 水平翻转
- `scaleY(scale)` - 垂直翻转
- `reset()` - 重置
- `clear()` - 清除
- `enable()` - 启用
- `disable()` - 禁用
- `destroy()` - 销毁

## 许可证

MIT

