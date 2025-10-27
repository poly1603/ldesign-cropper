# @ldesign/cropper-core

核心图像裁剪库，提供所有底层功能。

## 功能特性

- 🎨 强大的图像裁剪和编辑
- 🎭 选区和蒙版系统
- 🖼️ 图层管理系统
- 🎨 丰富的滤镜效果
- 🎯 AI 智能裁剪
- 📱 移动端优化
- ♿ 完整的无障碍支持
- ⚡ Web Workers 并行处理
- 🚀 虚拟画布技术

## 安装

```bash
pnpm add @ldesign/cropper-core
```

## 使用

```typescript
import { Cropper } from '@ldesign/cropper-core'
import '@ldesign/cropper-core/style.css'

const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9
})
```

## API

详见主文档。

## License

MIT
