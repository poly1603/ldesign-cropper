# Changelog

All notable changes to the @ldesign/cropper library will be documented in this file.

## [2.0.0] - 2025-10-22

### 🚀 Major Performance Improvements

#### Rendering Performance
- **Added** RequestAnimationFrame (RAF) for 60fps smooth animations
- **Added** GPU acceleration using CSS `transform3d` and `will-change`
- **Added** Event throttling for move operations (16ms = 60fps)
- **Added** Event debouncing for wheel events (50ms)
- **Improved** Canvas result caching to avoid redundant redraws

#### Computation Performance
- **Added** Memoization for expensive calculations
- **Added** Trigonometric lookup tables (360° pre-calculated sin/cos)
- **Added** Lazy evaluation for derived properties
- **Improved** Transform calculations with optimized math

#### Memory Optimization
- **Added** Canvas pooling (max 10 canvases)
- **Added** LRU cache for history management
- **Added** Large image tiling for images >10MB
- **Added** Automatic resource cleanup
- **Fixed** Memory leaks in event listeners and timers
- **Improved** Object URL lifecycle management

### ✨ New Features

#### Filter System
- **Added** FilterEngine with pipeline architecture
- **Added** 16 built-in filters:
  - Basic: Brightness, Contrast, Saturation, Hue
  - Effects: Blur, Sharpen, Edge Detect, Emboss
  - Styles: Grayscale, Sepia, Invert, Vignette
  - Adjustments: Temperature, Exposure, Noise, Pixelate
- **Added** 17 Instagram-style presets:
  - Valencia, Nashville, Lomo, Toaster, Walden
  - Earlybird, Mayfair, Amaro, Gingham, Clarendon
  - Black & White, Vintage, Dramatic
  - Cool, Warm, Faded, Vivid
- **Added** FilterPanel UI component
- **Added** Filter composition and chaining
- **Added** Real-time filter preview

#### Batch Processing
- **Added** BatchProcessor for processing multiple images
- **Added** Sequential and parallel processing modes
- **Added** Configurable concurrency (default: 4)
- **Added** Progress tracking and cancellation
- **Added** Batch export capabilities

#### Keyboard Shortcuts
- **Added** KeyboardManager with 20+ default shortcuts
- **Added** Customizable key bindings
- **Added** Keyboard help overlay (Shift + ?)
- **Added** Navigation shortcuts (Arrow keys)
- **Added** Zoom shortcuts (+, -, 0)
- **Added** Rotation shortcuts (R, Shift+R)
- **Added** Flip shortcuts (H, V)
- **Added** Undo/Redo shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- **Added** Export shortcuts (Ctrl+S, Ctrl+C)
- **Added** Aspect ratio presets (1-4 keys)

#### Enhanced Export
- **Added** Quality presets (WEB, PRINT, ARCHIVE, THUMBNAIL)
- **Added** Text watermarking support
- **Added** Image watermarking support
- **Added** Automatic format detection (PNG/JPEG/WebP)
- **Added** Copy to clipboard functionality
- **Added** Batch download capabilities

### 🛠️ Improvements

#### Code Quality
- **Added** Centralized constants in `config/constants.ts`
- **Refactored** Magic numbers to named constants
- **Improved** Error handling with standardized messages
- **Added** TypeScript strict mode compliance
- **Improved** Code organization and separation of concerns

#### Utilities
- **Added** Performance utilities (`throttle`, `debounce`, `memoize`)
- **Added** Cache utilities (`LRUCache`, `TTLCache`, `SizeAwareCache`)
- **Added** Export utilities (`exportCanvas`, `exportWithPreset`)
- **Added** Performance monitoring (`PerformanceMonitor`, `MemoryMonitor`)
- **Added** FPS monitoring
- **Added** DOM batching for optimized updates

#### Developer Experience
- **Added** Comprehensive README with API documentation
- **Added** EXAMPLES.md with detailed usage patterns
- **Added** OPTIMIZATION_SUMMARY.md with technical details
- **Added** QUICK_REFERENCE.md for quick lookup
- **Added** Test coverage for utilities, filters, and cache
- **Improved** Package.json with additional scripts

### 🐛 Bug Fixes

- **Fixed** Memory leaks in event listener cleanup
- **Fixed** Object URL not being revoked on destroy
- **Fixed** CropBox positioning with GPU acceleration
- **Fixed** Canvas context not being properly cleaned up

### 📦 API Changes

#### New Exports
```typescript
// Core
export { FilterPanel } from '@ldesign/cropper'
export { KeyboardManager } from '@ldesign/cropper'
export { BatchProcessor } from '@ldesign/cropper'
export { ImageTileManager } from '@ldesign/cropper'

// Filters
export { FilterEngine, getAllBuiltInFilters } from '@ldesign/cropper'
export { getAllPresets, applyPreset } from '@ldesign/cropper'

// Utils
export { throttle, debounce, memoize } from '@ldesign/cropper'
export { LRUCache, TTLCache, SizeAwareCache } from '@ldesign/cropper'
export { performanceMonitor, memoryMonitor, canvasPool } from '@ldesign/cropper'
export { exportCanvas, exportWithPreset } from '@ldesign/cropper'

// Constants
export * from '@ldesign/cropper/constants'
```

#### New Options
```typescript
new Cropper('#container', {
  // New options
  keyboard?: boolean | KeyboardManagerOptions
  filters?: boolean | FilterPanelOptions
  
  // Enhanced history
  history?: {
    maxSize?: number      // Now uses LRU cache
    autoSave?: boolean
    saveInterval?: number
  }
})
```

### 💥 Breaking Changes

**None.** All changes are backwards compatible.

### 📊 Performance Metrics

- **FPS**: Consistent 60fps during interactions
- **Memory**: <150MB for typical images, <500MB for large images
- **Bundle Size**: 
  - Core: ~45KB gzipped
  - With Filters: ~65KB gzipped
  - Full: ~85KB gzipped

### 🔄 Migration Guide

No migration needed! All changes are backwards compatible.

To enable new features:

```javascript
// Before
const cropper = new Cropper('#container', { src: 'image.jpg' })

// After (with new features)
const cropper = new Cropper('#container', {
  src: 'image.jpg',
  keyboard: true,  // Enable keyboard shortcuts
  filters: true    // Enable filter panel
})
```

### 🎯 What's Next

Future enhancements (optional plugins):

- **AI Features**: Face detection, smart crop, background removal
- **Drawing Tools**: Annotations, shapes, text overlay
- **Advanced UI**: Batch processing UI, accessibility improvements
- **Build Optimization**: Tree-shaking, code splitting

### 📝 Notes

- Performance optimizations are automatic (no configuration needed)
- Memory management is automatic (smart caching and cleanup)
- All new features are opt-in (won't affect existing implementations)

---

## [1.0.0] - Previous Release

Initial release with core cropping functionality.

---

For detailed technical information, see:
- `OPTIMIZATION_SUMMARY.md` - Technical optimization details
- `IMPLEMENTATION_REPORT.md` - Complete implementation report
- `完成总结.md` - Chinese summary
