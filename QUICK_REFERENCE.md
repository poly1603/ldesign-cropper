# @ldesign/cropper - 快速参考

## 快速索引

- [安装](#安装)
- [基础用法](#基础用法)
- [滤镜](#滤镜)
- [批处理](#批处理)
- [键盘快捷键](#键盘快捷键)
- [导出](#导出)
- [性能优化](#性能优化)

## 安装

```bash
npm install @ldesign/cropper
```

## 基础用法

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/dist/style.css'

const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9
})

// 获取裁剪结果
const canvas = cropper.getCroppedCanvas()
```

## 滤镜

### 应用单个滤镜
```javascript
import { FilterEngine, brightnessFilter } from '@ldesign/cropper'

const engine = new FilterEngine()
engine.registerFilter(brightnessFilter)
engine.addFilterLayer('brightness', { brightness: 20 })

const filtered = engine.applyFilters(imageData)
```

### 使用预设
```javascript
import { valenciaPreset, applyPreset } from '@ldesign/cropper'

applyPreset(filterEngine, valenciaPreset)
```

### 可用滤镜 (16个)
- brightness, contrast, saturation, hue
- blur, sharpen, grayscale, sepia
- invert, edgeDetect, emboss, vignette
- temperature, exposure, noise, pixelate

### 可用预设 (17个)
- Valencia, Nashville, Lomo, Toaster
- Walden, Earlybird, Mayfair, Amaro
- Gingham, Clarendon, Black & White
- Vintage, Dramatic, Cool, Warm, Faded, Vivid

## 批处理

```javascript
import { BatchProcessor } from '@ldesign/cropper'

const processor = new BatchProcessor({
  parallelProcessing: true,
  maxConcurrent: 4,
  onProgress: (item, index, total) => {
    console.log(`${index + 1}/${total}`)
  }
})

// 添加文件
files.forEach(f => processor.addItem(f))

// 开始处理
await processor.start()

// 导出结果
processor.exportResults()
```

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| ← → ↑ ↓ | 移动裁剪框 |
| Shift + 方向键 | 大步移动 |
| + / - | 缩放 |
| 0 | 重置缩放 |
| R | 右旋转90° |
| Shift + R | 左旋转90° |
| H | 水平翻转 |
| V | 垂直翻转 |
| Ctrl + Z | 撤销 |
| Ctrl + Shift + Z | 重做 |
| Ctrl + S | 保存 |
| Ctrl + C | 复制 |
| Escape | 重置 |
| 1-4 | 宽高比预设 |
| Shift + ? | 显示帮助 |

## 导出

### 基础导出
```javascript
const canvas = cropper.getCroppedCanvas()
canvas.toBlob(blob => {
  // 下载或上传
})
```

### 使用质量预设
```javascript
import { exportWithPreset } from '@ldesign/cropper'

const blob = await exportWithPreset(canvas, 'WEB')
// WEB, PRINT, ARCHIVE, THUMBNAIL
```

### 添加水印
```javascript
import { exportCanvas } from '@ldesign/cropper'

const blob = await exportCanvas(canvas, {
  watermark: {
    text: '© 2025',
    position: 'bottom-right',
    opacity: 0.5
  }
})
```

## 性能优化

### 监控内存
```javascript
import { memoryMonitor } from '@ldesign/cropper'

const memory = memoryMonitor.getMemoryUsage()
console.log(memoryMonitor.formatBytes(memory.usedJSHeapSize))

const pressure = memoryMonitor.checkMemoryPressure()
// { pressure: 'low' | 'medium' | 'high', usagePercent: 45 }
```

### 性能监控
```javascript
import { performanceMonitor } from '@ldesign/cropper'

performanceMonitor.enable()
performanceMonitor.mark('start')
// ... 操作 ...
performanceMonitor.mark('end')
const duration = performanceMonitor.measure('op', 'start', 'end')
```

### Canvas池
```javascript
import { canvasPool } from '@ldesign/cropper'

const canvas = canvasPool.acquire(800, 600)
// 使用 canvas
canvasPool.release(canvas) // 归还到池中
```

### 自定义节流
```javascript
import { throttle, debounce } from '@ldesign/cropper'

const handler = throttle(fn, 16)    // 60fps
const saveHandler = debounce(fn, 500) // 500ms延迟
```

## 常量

```javascript
import { 
  QUALITY_PRESETS,  // Web, Print, Archive, Thumbnail
  PRESETS,          // 宽高比和尺寸预设
  PERFORMANCE,      // 性能配置
  MEMORY,           // 内存限制
  FILTERS           // 滤镜范围
} from '@ldesign/cropper/constants'

// 使用预设
const canvas = cropper.getCroppedCanvas(QUALITY_PRESETS.WEB)
```

## 事件

```javascript
// 监听事件
cropper.element.addEventListener('ready', (e) => {
  console.log('Cropper ready')
})

cropper.element.addEventListener('crop', (e) => {
  console.log('Crop data:', e.detail)
})

cropper.element.addEventListener('filter:applied', (e) => {
  console.log('Filter applied:', e.detail)
})
```

## 销毁

```javascript
// 始终在完成后销毁
cropper.destroy()
```

## 常见配置

### 头像裁剪
```javascript
new Cropper('#container', {
  aspectRatio: 1,
  cropBoxStyle: 'circle',
  initialCropBoxSize: 0.8
})
```

### 社交媒体裁剪
```javascript
new Cropper('#container', {
  presets: true
})
cropper.getPresetManager().applyPreset('instagram-story')
```

### 高性能模式
```javascript
new Cropper('#container', {
  guides: false,        // 禁用参考线
  center: false,        // 禁用中心指示器
  history: {
    maxSize: 20        // 限制历史记录
  }
})
```

## 获取帮助

- 查看 `EXAMPLES.md` 了解详细示例
- 查看 `README.md` 了解完整API
- 按 `Shift + ?` 查看键盘快捷键

