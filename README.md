# @ldesign/cropper

A powerful, flexible, and performant image cropper library that works with any framework.

## Features

### Core Features
- 🎯 **Framework Agnostic** - Works with vanilla JS, Vue, React, Angular
- 🖼️ **Multiple Crop Modes** - Free, fixed aspect ratio, preset ratios
- 🎨 **Customizable Styles** - Default, rounded, circle, minimal, and more
- ⌨️ **Keyboard Shortcuts** - Comprehensive keyboard support for power users
- 📜 **Undo/Redo** - Full history management with configurable limits
- 🎭 **Preset Management** - Built-in presets for social media, documents, etc.

### Performance Features
- ⚡ **GPU Acceleration** - Hardware-accelerated transforms for smooth interactions
- 🧮 **Optimized Calculations** - Memoization and lookup tables for fast operations
- 🎯 **RequestAnimationFrame** - Butter-smooth 60fps animations
- 🔄 **Event Throttling** - Efficient event handling with debouncing/throttling
- 💾 **Memory Management** - Smart caching and cleanup to prevent memory leaks
- 🖼️ **Large Image Support** - Efficient tiling for images over 10MB

### Advanced Features
- 🎨 **16+ Built-in Filters** - Brightness, contrast, blur, sepia, vintage, and more
- 🌈 **Instagram-style Presets** - 17+ professional filter presets
- 🔧 **Filter Pipeline** - Chain multiple filters with custom intensities
- 📦 **Batch Processing** - Process multiple images with parallel/sequential modes
- 📐 **Aspect Ratio Presets** - Social media, document, and custom ratios
- 🎯 **Smart Crop Detection** - AI-powered face detection (optional)
- 🖌️ **Drawing Tools** - Annotations, shapes, text (coming soon)

## Installation

```bash
npm install @ldesign/cropper
```

## Quick Start

### Vanilla JavaScript

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/dist/style.css'

const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9,
  autoCrop: true,
  toolbar: true,
  keyboard: true
})

// Get cropped canvas
const canvas = cropper.getCroppedCanvas()

// Export as blob
canvas.toBlob((blob) => {
  // Upload or download
})
```

### Vue 3

```vue
<template>
  <div>
    <div ref="cropperRef"></div>
    <button @click="crop">Crop Image</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/dist/style.css'

const cropperRef = ref(null)
let cropper = null

onMounted(() => {
  cropper = new Cropper(cropperRef.value, {
    src: 'image.jpg',
    aspectRatio: 1
  })
})

const crop = () => {
  const canvas = cropper.getCroppedCanvas()
  // Use the canvas
}
</script>
```

### React

```jsx
import { useEffect, useRef } from 'react'
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/dist/style.css'

function ImageCropper() {
  const containerRef = useRef(null)
  const cropperRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      cropperRef.current = new Cropper(containerRef.current, {
        src: 'image.jpg',
        aspectRatio: 16 / 9
      })
    }

    return () => {
      cropperRef.current?.destroy()
    }
  }, [])

  const handleCrop = () => {
    const canvas = cropperRef.current?.getCroppedCanvas()
    // Use the canvas
  }

  return (
    <div>
      <div ref={containerRef}></div>
      <button onClick={handleCrop}>Crop</button>
    </div>
  )
}
```

## API Reference

### Constructor Options

```typescript
interface CropperOptions {
  // Image source
  src?: string
  
  // Aspect ratio
  aspectRatio?: number
  initialAspectRatio?: number
  
  // View mode (0-3)
  viewMode?: 0 | 1 | 2 | 3
  
  // Drag mode
  dragMode?: 'crop' | 'move' | 'none'
  
  // Auto crop
  autoCrop?: boolean
  initialCropBoxSize?: number
  
  // UI
  modal?: boolean
  modalOpacity?: number
  guides?: boolean
  center?: boolean
  highlight?: boolean
  background?: boolean
  cropBoxStyle?: 'default' | 'rounded' | 'circle' | 'minimal'
  
  // Toolbar
  toolbar?: boolean | ToolbarOptions
  
  // History
  history?: boolean | HistoryOptions
  
  // Keyboard shortcuts
  keyboard?: boolean | KeyboardManagerOptions
  
  // Filters
  filters?: boolean | FilterPanelOptions
  
  // Capabilities
  movable?: boolean
  rotatable?: boolean
  scalable?: boolean
  zoomable?: boolean
  
  // Events
  ready?: (event: CustomEvent) => void
  crop?: (event: CustomEvent) => void
  cropstart?: (event: CustomEvent) => void
  cropend?: (event: CustomEvent) => void
  zoom?: (event: CustomEvent) => void
}
```

### Methods

#### Image Manipulation

```javascript
// Rotate
cropper.rotate(90)  // Rotate 90 degrees

// Scale (zoom)
cropper.scale(1.5, 1.5)

// Flip
cropper.scaleX(-1)  // Flip horizontal
cropper.scaleY(-1)  // Flip vertical

// Move
cropper.move(10, 10)

// Reset
cropper.reset()
```

#### Crop Box

```javascript
// Get crop box data
const data = cropper.getCropBoxData()

// Set crop box data
cropper.setCropBoxData({
  left: 100,
  top: 100,
  width: 300,
  height: 300
})

// Set aspect ratio
cropper.setAspectRatio(16 / 9)

// Set crop box style
cropper.setCropBoxStyle('circle')
```

#### Export

```javascript
// Get cropped canvas
const canvas = cropper.getCroppedCanvas({
  width: 1920,
  height: 1080,
  fillColor: '#fff'
})

// Get as blob
canvas.toBlob((blob) => {
  // Upload or download
}, 'image/jpeg', 0.95)

// Get as data URL
const dataURL = canvas.toDataURL('image/png')
```

## Filters

### Built-in Filters

```javascript
import { FilterEngine, getAllBuiltInFilters } from '@ldesign/cropper'

const filterEngine = new FilterEngine()

// Register filters
getAllBuiltInFilters().forEach(filter => {
  filterEngine.registerFilter(filter)
})

// Apply filters
filterEngine.addFilterLayer('brightness', { brightness: 20 })
filterEngine.addFilterLayer('contrast', { contrast: 15 })
filterEngine.addFilterLayer('saturation', { saturation: 10 })

// Apply to image data
const filtered = filterEngine.applyFilters(imageData)
```

### Available Filters

- **Brightness** - Adjust image brightness (-100 to 100)
- **Contrast** - Adjust image contrast (-100 to 100)
- **Saturation** - Adjust color saturation (-100 to 100)
- **Hue** - Rotate hue (-180 to 180 degrees)
- **Grayscale** - Convert to black and white
- **Sepia** - Apply sepia tone
- **Invert** - Invert colors
- **Blur** - Apply blur effect
- **Sharpen** - Sharpen image
- **Edge Detect** - Edge detection filter
- **Emboss** - Emboss effect
- **Vignette** - Add vignette effect
- **Temperature** - Adjust color temperature (warm/cool)
- **Exposure** - Adjust exposure
- **Noise** - Add film grain
- **Pixelate** - Pixelate effect

### Filter Presets

```javascript
import { getAllPresets, applyPreset } from '@ldesign/cropper'

const presets = getAllPresets()
// Valencia, Nashville, Lomo, Toaster, Walden, Earlybird, Mayfair,
// Amaro, Gingham, Clarendon, Black & White, Vintage, Dramatic,
// Cool, Warm, Faded, Vivid

// Apply preset
applyPreset(filterEngine, presets[0])
```

## Batch Processing

Process multiple images with the same settings:

```javascript
import { BatchProcessor } from '@ldesign/cropper'

const processor = new BatchProcessor({
  cropperOptions: {
    aspectRatio: 1,
    initialCropBoxSize: 0.8
  },
  canvasOptions: {
    width: 512,
    height: 512
  },
  parallelProcessing: true,
  maxConcurrent: 4,
  onProgress: (item, index, total) => {
    console.log(`Processing ${index + 1}/${total}`)
  },
  onComplete: (items) => {
    console.log('All done!', items)
  }
})

// Add files
files.forEach(file => processor.addItem(file))

// Start processing
await processor.start()

// Export results
processor.exportResults()
```

## Keyboard Shortcuts

Default keyboard shortcuts (can be customized):

| Shortcut | Action |
|----------|--------|
| Arrow Keys | Move crop box |
| Shift + Arrows | Move crop box (large step) |
| + / = | Zoom in |
| - | Zoom out |
| 0 | Reset zoom |
| R | Rotate right 90° |
| Shift + R | Rotate left 90° |
| H | Flip horizontal |
| V | Flip vertical |
| Ctrl + Z | Undo |
| Ctrl + Shift + Z / Ctrl + Y | Redo |
| Ctrl + S | Save/Export |
| Ctrl + C | Copy to clipboard |
| Escape | Reset |
| Delete / Backspace | Clear crop box |
| 1 | Set aspect ratio 1:1 |
| 2 | Set aspect ratio 16:9 |
| 3 | Set aspect ratio 4:3 |
| 4 | Free aspect ratio |
| Shift + ? | Show keyboard shortcuts |

## Performance Optimization

The library includes several performance optimizations:

- **GPU Acceleration**: Uses CSS `transform3d` and `will-change` for hardware acceleration
- **Request Animation Frame**: Smooth 60fps animations
- **Event Throttling**: Mouse/touch events throttled to 16ms (~60fps)
- **Memoization**: Expensive calculations cached
- **Canvas Pooling**: Reuses canvas elements to reduce memory
- **LRU Cache**: Intelligent history management
- **Large Image Tiling**: Efficient handling of images over 10MB

## Memory Management

- Automatic cleanup of resources
- Object URL revocation
- Canvas pooling with configurable limits
- LRU cache for history states
- Memory pressure monitoring

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- iOS Safari: Latest 2 versions

## Bundle Size

- Core: ~45KB gzipped
- With Filters: ~65KB gzipped
- Full Bundle: ~85KB gzipped

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## Credits

Developed by ldesign team.
