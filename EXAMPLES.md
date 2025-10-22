# @ldesign/cropper - Usage Examples

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Filters](#filters)
3. [Batch Processing](#batch-processing)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Advanced Configurations](#advanced-configurations)
6. [Performance Optimization](#performance-optimization)

## Basic Usage

### Simple Image Cropper

```javascript
import { Cropper } from '@ldesign/cropper'
import '@ldesign/cropper/dist/style.css'

// Create cropper
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9,
  autoCrop: true
})

// Get cropped image
const canvas = cropper.getCroppedCanvas()
canvas.toBlob((blob) => {
  // Upload or save
  const formData = new FormData()
  formData.append('image', blob)
  
  fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
})
```

### Circular Crop

```javascript
const cropper = new Cropper('#container', {
  src: 'profile.jpg',
  aspectRatio: 1,
  cropBoxStyle: 'circle',
  autoCrop: true,
  initialCropBoxSize: 0.8
})

// Export with circle shape applied
const canvas = cropper.getCroppedCanvas({
  width: 256,
  height: 256,
  applyShape: true  // Applies circle mask
})
```

### Social Media Presets

```javascript
import { Cropper, PresetManager } from '@ldesign/cropper'

const cropper = new Cropper('#container', {
  src: 'image.jpg',
  presets: true
})

const presetManager = cropper.getPresetManager()

// Apply Instagram Story preset (9:16)
presetManager.applyPreset('instagram-story')

// Apply YouTube Thumbnail preset (16:9)
presetManager.applyPreset('youtube-thumbnail')

// Apply custom preset
presetManager.applyPreset('facebook-cover') // 1640x859
```

## Filters

### Applying Single Filters

```javascript
import { FilterEngine, brightnessFilter, contrastFilter } from '@ldesign/cropper'

const filterEngine = new FilterEngine()

// Register filters
filterEngine.registerFilter(brightnessFilter)
filterEngine.registerFilter(contrastFilter)

// Get image data
const canvas = cropper.getCroppedCanvas()
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

// Set original
filterEngine.setOriginalImageData(imageData)

// Apply filters
filterEngine.addFilterLayer('brightness', { brightness: 20 })
filterEngine.addFilterLayer('contrast', { contrast: 15 })

// Get filtered result
const filtered = filterEngine.applyFilters()
ctx.putImageData(filtered, 0, 0)
```

### Using Filter Presets

```javascript
import { 
  FilterEngine, 
  getAllBuiltInFilters,
  valenciaPreset,
  vintagePreset,
  applyPreset 
} from '@ldesign/cropper'

const filterEngine = new FilterEngine()

// Register all built-in filters
getAllBuiltInFilters().forEach(filter => {
  filterEngine.registerFilter(filter)
})

const canvas = cropper.getCroppedCanvas()
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

filterEngine.setOriginalImageData(imageData)

// Apply Valencia preset
applyPreset(filterEngine, valenciaPreset)
const filtered = filterEngine.applyFilters()
ctx.putImageData(filtered, 0, 0)
```

### Custom Filter Chain

```javascript
const filterEngine = new FilterEngine()
getAllBuiltInFilters().forEach(f => filterEngine.registerFilter(f))

// Create custom Instagram-like filter
filterEngine.addFilterLayer('exposure', { exposure: 10 })
filterEngine.addFilterLayer('contrast', { contrast: 20 })
filterEngine.addFilterLayer('saturation', { saturation: -10 })
filterEngine.addFilterLayer('vignette', { strength: 0.4 })
filterEngine.addFilterLayer('temperature', { temperature: 15 })

// Export configuration
const config = filterEngine.exportConfig()
localStorage.setItem('myFilter', JSON.stringify(config))

// Import later
const savedConfig = JSON.parse(localStorage.getItem('myFilter'))
filterEngine.importConfig(savedConfig)
```

### Filter Panel UI

```javascript
import { FilterPanel } from '@ldesign/cropper'

const cropper = new Cropper('#container', { src: 'image.jpg' })

const filterPanel = new FilterPanel(cropper, document.body, {
  position: 'right',
  showPresets: true,
  showCustomFilters: true,
  enableComparison: true
})

// Listen for filter applied
document.body.addEventListener('filter:applied', (e) => {
  console.log('Filter applied:', e.detail)
})
```

## Batch Processing

### Process Multiple Images

```javascript
import { BatchProcessor } from '@ldesign/cropper'

const processor = new BatchProcessor({
  cropperOptions: {
    aspectRatio: 1,
    autoCrop: true,
    initialCropBoxSize: 0.8
  },
  canvasOptions: {
    width: 512,
    height: 512
  },
  parallelProcessing: true,
  maxConcurrent: 4,
  onProgress: (item, index, total) => {
    console.log(`Processing ${index + 1}/${total}: ${item.file.name}`)
    updateProgressBar((index + 1) / total * 100)
  },
  onItemComplete: (item, index) => {
    console.log(`Completed: ${item.file.name}`)
    if (item.result) {
      // Save or preview
      const url = URL.createObjectURL(item.result)
      addThumbnail(url)
    }
  },
  onComplete: (items) => {
    console.log('All done!', items)
    showCompletionMessage()
  },
  onError: (item, error) => {
    console.error(`Failed: ${item.file.name}`, error)
    showError(item.file.name, error.message)
  }
})

// Add files from input
document.getElementById('fileInput').addEventListener('change', (e) => {
  const files = Array.from(e.target.files)
  processor.addItems(files)
})

// Start processing
document.getElementById('startBtn').addEventListener('click', async () => {
  await processor.start()
})

// Export all results
document.getElementById('downloadBtn').addEventListener('click', () => {
  processor.exportResults()
})
```

### Sequential vs Parallel Processing

```javascript
// Sequential (one at a time)
const sequential = new BatchProcessor({
  parallelProcessing: false
})

// Parallel (4 at a time)
const parallel = new BatchProcessor({
  parallelProcessing: true,
  maxConcurrent: 4
})

// Add same files to both
files.forEach(file => {
  sequential.addItem(file)
  parallel.addItem(file)
})

// Sequential is safer but slower
await sequential.start()

// Parallel is faster but uses more memory
await parallel.start()
```

### Progress Tracking

```javascript
const processor = new BatchProcessor({
  onProgress: (item, index, total) => {
    const progress = processor.getProgress()
    
    console.log({
      current: `${index + 1}/${total}`,
      completed: progress.completed,
      failed: progress.failed,
      pending: progress.pending,
      processing: progress.processing,
      percentage: progress.percentage.toFixed(1) + '%'
    })
    
    // Update UI
    document.getElementById('progress-bar').style.width = 
      progress.percentage + '%'
    document.getElementById('progress-text').textContent = 
      `${progress.completed}/${total} completed`
  }
})
```

## Keyboard Shortcuts

### Default Shortcuts

```javascript
import { Cropper, KeyboardManager } from '@ldesign/cropper'

const cropper = new Cropper('#container', {
  src: 'image.jpg',
  // Keyboard shortcuts enabled by default
  keyboard: true
})

// Access keyboard manager
const kbd = new KeyboardManager(cropper)

// All default shortcuts are automatically registered:
// - Arrow keys: Move crop box
// - Shift + Arrows: Move crop box (large step)
// - +/-: Zoom in/out
// - 0: Reset zoom
// - R: Rotate right
// - Shift+R: Rotate left
// - H: Flip horizontal
// - V: Flip vertical
// - Ctrl+Z: Undo
// - Ctrl+Shift+Z: Redo
// - Ctrl+S: Save
// - Ctrl+C: Copy
// - Escape: Reset
// - 1-4: Aspect ratio presets
// - Shift+?: Show help
```

### Custom Shortcuts

```javascript
const kbd = new KeyboardManager(cropper, {
  enabled: true,
  customBindings: [
    {
      key: 'f',
      action: () => {
        // Custom action: Toggle fullscreen
        document.documentElement.requestFullscreen()
      },
      description: 'Toggle fullscreen'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => {
        // Custom action: Export with custom settings
        const canvas = cropper.getCroppedCanvas({
          width: 1920,
          height: 1080
        })
        downloadCanvas(canvas, 'export.jpg')
      },
      description: 'Export as 1920x1080'
    },
    {
      key: 'g',
      action: () => {
        // Toggle grid overlay
        toggleGrid()
      },
      description: 'Toggle grid overlay'
    }
  ]
})

// Disable temporarily
kbd.disable()

// Re-enable
kbd.enable()

// Show help overlay
// (User can press Shift+? or call programmatically)
kbd.showHelp()
```

### Disable Specific Shortcuts

```javascript
const kbd = new KeyboardManager(cropper)

// Remove a binding
kbd.unregisterBinding({
  key: 'r',  // Remove rotate shortcut
  action: () => {}
})

// Re-register with different action
kbd.registerBinding({
  key: 'r',
  action: () => {
    // Custom rotate behavior
    cropper.rotate(45)  // Rotate 45° instead of 90°
  },
  description: 'Rotate 45°'
})
```

## Advanced Configurations

### Large Image Handling

```javascript
import { Cropper, ImageTileManager, shouldUseTiling } from '@ldesign/cropper'

// Check if image needs tiling
const img = new Image()
img.src = 'large-image.jpg'
img.onload = () => {
  if (shouldUseTiling(img)) {
    console.log('Large image detected, using tiling')
    
    // Create tile manager
    const tileManager = new ImageTileManager(img, {
      tileSize: 512,
      preloadDistance: 2
    })
    
    // Load visible tiles
    await tileManager.loadVisibleTiles(0, 0, 800, 600)
    
    console.log(`Loaded ${tileManager.getLoadedTilesCount()}/${tileManager.getTotalTilesCount()} tiles`)
  }
  
  // Create cropper normally
  const cropper = new Cropper('#container', {
    src: img.src
  })
}
```

### Memory Monitoring

```javascript
import { memoryMonitor, performanceMonitor } from '@ldesign/cropper'

// Enable performance monitoring
performanceMonitor.enable()

// Mark start
performanceMonitor.mark('crop-start')

// Do work
const canvas = cropper.getCroppedCanvas()

// Mark end and measure
performanceMonitor.mark('crop-end')
performanceMonitor.measure('crop-operation', 'crop-start', 'crop-end')

// Get average time
const avgTime = performanceMonitor.getAverage('crop-operation')
console.log(`Average crop time: ${avgTime.toFixed(2)}ms`)

// Check memory usage
const memory = memoryMonitor.getMemoryUsage()
if (memory) {
  console.log(`Memory used: ${memoryMonitor.formatBytes(memory.usedJSHeapSize)}`)
  
  const pressure = memoryMonitor.checkMemoryPressure()
  if (pressure.pressure === 'high') {
    console.warn('High memory pressure detected!')
  }
}
```

### History Management

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  history: {
    maxSize: 50,        // Keep last 50 states
    autoSave: true,     // Auto-save on changes
    saveInterval: 1000  // Debounce saves by 1s
  }
})

const history = cropper.getHistoryManager()

// Manual save
history.saveState()

// Undo/Redo
history.undo()
history.redo()

// Check state
console.log({
  canUndo: history.canUndo(),
  canRedo: history.canRedo(),
  historySize: history.getHistorySize(),
  currentIndex: history.getCurrentIndex()
})

// Export/Import history
const exported = history.exportHistory()
localStorage.setItem('cropperHistory', exported)

// Later...
const saved = localStorage.getItem('cropperHistory')
history.importHistory(saved)

// Listen for history changes
history.on('change', (data) => {
  updateUndoButton(data.canUndo)
  updateRedoButton(data.canRedo)
})
```

## Performance Optimization

### Optimize for Large Images

```javascript
const cropper = new Cropper('#container', {
  src: 'huge-image.jpg',
  
  // Reduce initial crop box size for faster rendering
  initialCropBoxSize: 0.3,
  
  // Disable certain features temporarily
  guides: false,
  center: false,
  
  // Limit history for memory
  history: {
    maxSize: 20
  }
})
```

### Throttle Custom Operations

```javascript
import { throttle, debounce } from '@ldesign/cropper'

// Throttle updates (max once per 16ms = 60fps)
const throttledUpdate = throttle((data) => {
  updatePreview(data)
}, 16)

cropper.element.addEventListener('crop', (e) => {
  throttledUpdate(e.detail)
})

// Debounce expensive operations (wait 500ms after last event)
const debouncedSave = debounce(() => {
  saveToServer(cropper.getData())
}, 500)

cropper.element.addEventListener('cropend', debouncedSave)
```

### Canvas Pooling

```javascript
import { canvasPool } from '@ldesign/cropper'

// Acquire canvas from pool
const canvas = canvasPool.acquire(800, 600)

// Use it
const ctx = canvas.getContext('2d')
ctx.drawImage(image, 0, 0)

// Release back to pool when done
canvasPool.release(canvas)

// Check pool stats
const stats = canvasPool.getStats()
console.log(`Pool: ${stats.poolSize}, In use: ${stats.inUse}`)
```

### Memoization for Custom Functions

```javascript
import { memoize } from '@ldesign/cropper'

// Expensive calculation
const calculateComplexTransform = (width, height, angle) => {
  // Complex math...
  return result
}

// Memoize it
const memoizedTransform = memoize(
  calculateComplexTransform,
  (w, h, a) => `${w}:${h}:${a}`  // Cache key generator
)

// First call: calculates
const result1 = memoizedTransform(800, 600, 45)

// Second call with same params: returns cached result
const result2 = memoizedTransform(800, 600, 45)
```

## Tips & Best Practices

1. **Always destroy when done**
   ```javascript
   cropper.destroy()
   ```

2. **Use appropriate quality presets**
   ```javascript
   import { QUALITY_PRESETS } from '@ldesign/cropper'
   
   const canvas = cropper.getCroppedCanvas(QUALITY_PRESETS.WEB)
   ```

3. **Monitor memory for long-running apps**
   ```javascript
   setInterval(() => {
     const pressure = memoryMonitor.checkMemoryPressure()
     if (pressure.pressure === 'high') {
       // Clean up, reduce quality, etc.
       canvasPool.clear()
     }
   }, 30000)
   ```

4. **Use batch processing for multiple images**
   ```javascript
   // Don't create multiple Cropper instances
   // Use BatchProcessor instead
   ```

5. **Leverage keyboard shortcuts**
   ```javascript
   // Users love keyboard shortcuts
   // Enable them by default
   { keyboard: true }
   ```

