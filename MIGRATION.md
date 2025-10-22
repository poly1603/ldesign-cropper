# Migration Guide - @ldesign/cropper v2.0

## Overview

Version 2.0 brings major performance improvements, new features, and enhanced capabilities while maintaining **100% backwards compatibility**. No code changes are required for existing implementations.

## What's New in v2.0

### 🚀 Automatic Performance Improvements

All existing code automatically benefits from:

- **60fps animations** - Smooth interactions with RAF
- **GPU acceleration** - Hardware-accelerated transforms
- **Memory optimization** - Smart caching and cleanup
- **Faster calculations** - Memoization and lookup tables

**No changes required!** Just upgrade and enjoy better performance.

### ✨ New Optional Features

New features are opt-in and won't affect existing code:

1. **Filter System** - 16 filters + 17 presets
2. **Batch Processing** - Process multiple images
3. **Keyboard Shortcuts** - 20+ shortcuts
4. **Enhanced Export** - Watermarks, quality presets

## Migration Scenarios

### Scenario 1: No Changes Needed

If you're happy with current functionality:

```javascript
// v1.0 - Still works exactly the same
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9
})

// All existing methods work unchanged
cropper.rotate(90)
cropper.setAspectRatio(1)
const canvas = cropper.getCroppedCanvas()
```

✅ **Result**: Automatically faster and more memory efficient

### Scenario 2: Enable New Features

To use new features, just add options:

```javascript
// v2.0 - With new features
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  aspectRatio: 16 / 9,
  keyboard: true,  // NEW: Enable keyboard shortcuts
  filters: true    // NEW: Enable filter panel
})
```

### Scenario 3: Using Filters

```javascript
// NEW in v2.0
import { 
  FilterEngine, 
  getAllBuiltInFilters,
  valenciaPreset,
  applyPreset 
} from '@ldesign/cropper'

const engine = new FilterEngine()
getAllBuiltInFilters().forEach(f => engine.registerFilter(f))

// Apply preset
applyPreset(engine, valenciaPreset)

// Or custom filters
engine.addFilterLayer('brightness', { brightness: 20 })
engine.addFilterLayer('contrast', { contrast: 15 })
```

### Scenario 4: Batch Processing

```javascript
// NEW in v2.0
import { BatchProcessor } from '@ldesign/cropper'

const processor = new BatchProcessor({
  cropperOptions: {
    aspectRatio: 1,
    autoCrop: true
  },
  parallelProcessing: true,
  maxConcurrent: 4
})

files.forEach(file => processor.addItem(file))
await processor.start()
processor.exportResults()
```

### Scenario 5: Performance Monitoring

```javascript
// NEW in v2.0
import { performanceMonitor, memoryMonitor } from '@ldesign/cropper'

// Enable monitoring
performanceMonitor.enable()

// Use cropper...

// Check metrics
const metrics = performanceMonitor.getMetrics()
const memory = memoryMonitor.getMemoryUsage()
```

## API Compatibility

### ✅ All v1.0 APIs Work

```javascript
// All these methods work exactly the same
cropper.rotate(degrees)
cropper.scale(x, y)
cropper.scaleX(x)
cropper.scaleY(y)
cropper.move(x, y)
cropper.reset()
cropper.clear()
cropper.setAspectRatio(ratio)
cropper.setData(data)
cropper.getData()
cropper.getImageData()
cropper.getCropBoxData()
cropper.setCropBoxData(data)
cropper.getContainerData()
cropper.getCanvasData()
cropper.getCroppedCanvas(options)
cropper.enable()
cropper.disable()
cropper.destroy()
```

### 🆕 New APIs (Optional)

```javascript
// New in v2.0 - completely optional
cropper.setCropBoxStyle(style)

// Access new managers
const historyManager = cropper.getHistoryManager()
const presetManager = cropper.getPresetManager()

// New exports
import {
  FilterPanel,
  KeyboardManager,
  BatchProcessor,
  ImageTileManager,
  exportWithPreset,
  throttle,
  debounce,
  LRUCache
} from '@ldesign/cropper'
```

## Configuration Changes

### History Options Enhanced

```javascript
// v1.0
history: true

// v2.0 - Enhanced with LRU cache (backwards compatible)
history: {
  maxSize: 50,        // Uses LRU cache now (more efficient)
  autoSave: true,     // Same as before
  saveInterval: 1000  // Same as before
}

// Old config still works!
history: true  // Uses defaults with LRU cache
```

### New Configuration Options

```javascript
// All optional - won't affect existing code
new Cropper('#container', {
  // Existing options...
  src: 'image.jpg',
  
  // NEW: Keyboard shortcuts
  keyboard: true,
  
  // NEW: Filter panel
  filters: {
    visible: true,
    position: 'right',
    showPresets: true
  }
})
```

## Performance Considerations

### Automatic Optimizations

These happen automatically without any code changes:

1. **Event Throttling**
   - Move events: 16ms (60fps)
   - Wheel events: 50ms debounce

2. **GPU Acceleration**
   - All transforms use `transform3d`
   - Automatic `will-change` hints

3. **Memory Management**
   - Canvas pooling (max 10)
   - LRU cache for history
   - Automatic cleanup

### Optional Optimizations

For better performance with large images:

```javascript
// v2.0 - Optimize for large images
const cropper = new Cropper('#container', {
  src: 'huge-image.jpg',
  
  // Reduce initial size
  initialCropBoxSize: 0.3,
  
  // Disable expensive features
  guides: false,
  center: false,
  
  // Limit history
  history: { maxSize: 20 }
})
```

## Testing Your Migration

### 1. Basic Functionality Test

```javascript
// Test that basic cropping still works
const cropper = new Cropper('#test', { src: 'test.jpg' })
const canvas = cropper.getCroppedCanvas()
console.assert(canvas !== null, 'Cropping should work')
```

### 2. Performance Test

```javascript
import { performanceMonitor } from '@ldesign/cropper'

performanceMonitor.enable()
performanceMonitor.mark('start')

// Your cropping operations...

performanceMonitor.mark('end')
const time = performanceMonitor.measure('test', 'start', 'end')
console.log(`Operation took ${time}ms`)
```

### 3. Memory Test

```javascript
import { memoryMonitor } from '@ldesign/cropper'

const before = memoryMonitor.getMemoryUsage()

// Create and destroy cropper multiple times
for (let i = 0; i < 10; i++) {
  const c = new Cropper('#test', { src: 'test.jpg' })
  c.destroy()
}

const after = memoryMonitor.getMemoryUsage()
console.log('Memory leak check:', 
  memoryMonitor.formatBytes(after.usedJSHeapSize - before.usedJSHeapSize))
```

## Common Migration Patterns

### Pattern 1: Add Filters to Existing App

```javascript
// Before (v1.0)
const cropper = new Cropper('#container', { src: 'image.jpg' })

// After (v2.0) - Add filters
const cropper = new Cropper('#container', { 
  src: 'image.jpg',
  filters: true  // Enable filter panel
})

// Or programmatically
import { FilterEngine, getAllBuiltInFilters } from '@ldesign/cropper'
const engine = new FilterEngine()
getAllBuiltInFilters().forEach(f => engine.registerFilter(f))
```

### Pattern 2: Add Keyboard Shortcuts

```javascript
// Before (v1.0)
const cropper = new Cropper('#container', { src: 'image.jpg' })

// After (v2.0) - Add keyboard shortcuts
const cropper = new Cropper('#container', { 
  src: 'image.jpg',
  keyboard: true  // Enable shortcuts
})

// Users can now use Arrow keys, R, H, V, Ctrl+Z, etc.
```

### Pattern 3: Enable Batch Processing

```javascript
// Before (v1.0) - Manual loop
files.forEach(file => {
  const cropper = new Cropper(container, { src: URL.createObjectURL(file) })
  // Manual processing...
  cropper.destroy()
})

// After (v2.0) - Batch processor
import { BatchProcessor } from '@ldesign/cropper'

const processor = new BatchProcessor({
  parallelProcessing: true,
  maxConcurrent: 4
})

files.forEach(file => processor.addItem(file))
await processor.start()
processor.exportResults()
```

### Pattern 4: Enhanced Export

```javascript
// Before (v1.0)
const canvas = cropper.getCroppedCanvas({ width: 1920 })
canvas.toBlob(blob => download(blob), 'image/jpeg', 0.9)

// After (v2.0) - Use presets and watermarks
import { exportWithPreset } from '@ldesign/cropper'

const blob = await exportWithPreset(canvas, 'WEB', {
  watermark: {
    text: '© 2025',
    position: 'bottom-right'
  }
})
download(blob)
```

## Troubleshooting

### Issue: "Import not found"

Make sure you're importing from the correct path:

```javascript
// Correct
import { FilterEngine } from '@ldesign/cropper'

// Also correct
import { FilterEngine } from '@ldesign/cropper/dist/index.js'
```

### Issue: "Performance seems slower"

Check if you have too many filters enabled:

```javascript
// Disable filters if not needed
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  filters: false  // Disable filter panel
})
```

### Issue: "Memory usage increased"

Adjust cache settings:

```javascript
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  history: {
    maxSize: 20  // Reduce from default 50
  }
})
```

## Getting Help

- Check `EXAMPLES.md` for code examples
- Check `QUICK_REFERENCE.md` for quick lookup
- Check `README.md` for full API documentation
- Press `Shift + ?` in the app to see keyboard shortcuts

## Summary

✅ **No breaking changes**
✅ **All v1.0 code works unchanged**
✅ **Automatic performance improvements**
✅ **New features are opt-in**
✅ **Easy to adopt incrementally**

Upgrade with confidence! 🎉

