# 快速上手 - @ldesign/cropper v2.0

## 5分钟快速入门

### 1. 安装 (30秒)

```bash
npm install @ldesign/cropper
```

### 2. 基础使用 (2分钟)

```html
<!-- HTML -->
<div id="cropper-container" style="width: 800px; height: 600px;"></div>
```

```javascript
// JavaScript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/dist/style.css'

const cropper = new Cropper('#cropper-container', {
  src: 'your-image.jpg',
  aspectRatio: 16 / 9
})

// 获取裁剪结果
const canvas = cropper.getCroppedCanvas()
```

### 3. 添加滤镜 (1分钟)

```javascript
import { FilterEngine, valenciaPreset, applyPreset } from '@ldesign/cropper'

const engine = new FilterEngine()
// 注册滤镜后应用预设
applyPreset(engine, valenciaPreset)
```

### 4. 启用快捷键 (30秒)

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  keyboard: true  // ← 就这么简单！
})

// 用户现在可以使用:
// - 方向键移动
// - +/- 缩放
// - R 旋转
// - Ctrl+Z 撤销
// - Shift+? 查看所有快捷键
```

### 5. 批处理 (1分钟)

```javascript
import { BatchProcessor } from '@ldesign/cropper'

const processor = new BatchProcessor({
  cropperOptions: { aspectRatio: 1 },
  parallelProcessing: true
})

// 添加文件并处理
files.forEach(f => processor.addItem(f))
await processor.start()
processor.exportResults()
```

## 🎯 常见场景

### 头像裁剪
```javascript
new Cropper('#container', {
  src: 'profile.jpg',
  aspectRatio: 1,           // 正方形
  cropBoxStyle: 'circle',   // 圆形裁剪框
  initialCropBoxSize: 0.8   // 80%大小
})
```

### 社交媒体图片
```javascript
const cropper = new Cropper('#container', {
  src: 'photo.jpg',
  presets: true
})

// 应用Instagram Story预设
cropper.getPresetManager().applyPreset('instagram-story')
```

### 带滤镜的裁剪
```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  filters: true  // 显示滤镜面板
})

// 用户可以在UI中选择滤镜预设
```

### 添加水印导出
```javascript
import { exportCanvas } from '@ldesign/cropper'

const canvas = cropper.getCroppedCanvas()
const blob = await exportCanvas(canvas, {
  watermark: {
    text: '© 2025 Your Name',
    position: 'bottom-right',
    opacity: 0.7
  }
})

// 下载
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'watermarked.jpg'
a.click()
```

## 🔥 新功能亮点

### 1. 滤镜 (16个 + 17个预设)
```javascript
// 单个滤镜
engine.addFilterLayer('brightness', { brightness: 20 })

// 滤镜组合
engine.addFilterLayer('brightness', { brightness: 10 })
engine.addFilterLayer('contrast', { contrast: 15 })
engine.addFilterLayer('vignette', { strength: 0.5 })

// 一键预设
applyPreset(engine, valenciaPreset)  // Instagram风格
```

### 2. 批处理
```javascript
// 一次处理100张图片
const processor = new BatchProcessor({
  parallelProcessing: true,
  maxConcurrent: 4,  // 4个并发
  onProgress: (item, index, total) => {
    console.log(`进度: ${index + 1}/${total}`)
  }
})
```

### 3. 绘图工具 (9种)
```javascript
import { DrawingEngine, DrawingToolbar } from '@ldesign/cropper'

const engine = new DrawingEngine({ width: 800, height: 600 })
const toolbar = new DrawingToolbar(engine, container)

// 用户可以使用画笔、形状、文字等工具
```

### 4. 键盘快捷键 (20+)
```
开箱即用:
- 方向键: 移动
- +/-: 缩放
- R: 旋转
- H/V: 翻转
- Ctrl+Z: 撤销
- Ctrl+S: 保存
```

## ⚡ 性能提示

### 大图片优化
```javascript
// 自动启用分块 (>10MB)
// 无需配置，自动处理！
```

### 监控内存
```javascript
import { memoryMonitor } from '@ldesign/cropper'

const memory = memoryMonitor.getMemoryUsage()
console.log(memoryMonitor.formatBytes(memory.usedJSHeapSize))
```

### 使用质量预设
```javascript
import { exportWithPreset } from '@ldesign/cropper'

// Web优化 (1920x1080, JPEG 85%)
const blob = await exportWithPreset(canvas, 'WEB')

// 打印质量 (4096x4096, JPEG 95%)
const blob = await exportWithPreset(canvas, 'PRINT')
```

## 📱 框架集成

### Vue 3
```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Cropper } from '@ldesign/cropper'

const cropperRef = ref(null)
let cropper = null

onMounted(() => {
  cropper = new Cropper(cropperRef.value, {
    src: 'image.jpg',
    keyboard: true,
    filters: true
  })
})

onUnmounted(() => {
  cropper?.destroy()
})
</script>

<template>
  <div ref="cropperRef"></div>
</template>
```

### React
```jsx
import { useEffect, useRef } from 'react'
import { Cropper } from '@ldesign/cropper'

function App() {
  const ref = useRef(null)
  const cropperRef = useRef(null)

  useEffect(() => {
    cropperRef.current = new Cropper(ref.current, {
      src: 'image.jpg',
      keyboard: true,
      filters: true
    })

    return () => cropperRef.current?.destroy()
  }, [])

  return <div ref={ref}></div>
}
```

## 🎓 学习路径

1. **入门** (5分钟)
   - 阅读本文件
   - 运行基础示例

2. **进阶** (15分钟)
   - 查看 `EXAMPLES.md`
   - 尝试滤镜和批处理

3. **精通** (30分钟)
   - 阅读 `QUICK_REFERENCE.md`
   - 探索所有快捷键
   - 自定义配置

4. **专家** (1小时)
   - 阅读 `README.md` 完整API
   - 查看性能优化技巧
   - 开发自定义插件

## 🆘 获取帮助

### 文档资源
- `README.md` - 完整API文档
- `EXAMPLES.md` - 详细示例
- `QUICK_REFERENCE.md` - 快速查找
- `FEATURES.md` - 功能清单

### 快捷方式
- 按 `Shift + ?` 查看键盘快捷键
- 查看控制台日志了解错误
- 使用性能监控工具调试

### 社区
- GitHub Issues
- 文档网站
- 示例demo

## ✨ 核心优势

1. **高性能**: 60fps流畅体验
2. **功能丰富**: 150+功能
3. **易于使用**: 清晰API
4. **体积小**: 仅85KB完整版
5. **100%兼容**: 无破坏性变更
6. **文档完善**: 10+文档文件

## 🎉 开始使用

```bash
npm install @ldesign/cropper
```

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/dist/style.css'

const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9,
  keyboard: true,
  filters: true
})

// 就这么简单！🚀
```

---

**提示**: 按 `Shift + ?` 查看所有键盘快捷键
**文档**: 查看 `README.md` 了解完整API
**示例**: 查看 `EXAMPLES.md` 了解更多用法

