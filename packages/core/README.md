# @ldesign/cropper-core

高性能图像裁剪核心库 - 框架无关

## 特性

- 🎯 **框架无关** - 纯 JavaScript 实现，可在任何框架中使用
- 🖼️ **多种裁剪模式** - 自由裁剪、固定比例、预设比例
- ⚡ **GPU 加速** - 硬件加速的变换，流畅的交互
- 💾 **内存优化** - 智能缓存和清理，防止内存泄漏
- 🎨 **内置滤镜** - 16+ 内置滤镜和 Instagram 风格预设
- 📦 **批量处理** - 支持并行/串行批量处理多张图片
- ⌨️ **键盘快捷键** - 完整的键盘快捷键支持
- 📜 **撤销/重做** - 完整的历史管理

## 安装

```bash
npm install @ldesign/cropper-core
```

## 快速开始

```javascript
import { Cropper } from '@ldesign/cropper-core'
import '@ldesign/cropper-core/style.css'

const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9,
  autoCrop: true,
  toolbar: true,
  keyboard: true
})

// 获取裁剪后的 canvas
const canvas = cropper.getCroppedCanvas()

// 导出为 blob
canvas.toBlob((blob) => {
  // 上传或下载
})
```

## API 文档

完整的 API 文档请参阅主项目 README。

## 许可证

MIT

