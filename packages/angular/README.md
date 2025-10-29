# @ldesign/cropper-angular

> Angular wrapper for @ldesign/cropper - A powerful, high-performance image cropper library

[![NPM Version](https://img.shields.io/npm/v/@ldesign/cropper-angular.svg)](https://www.npmjs.com/package/@ldesign/cropper-angular)
[![License](https://img.shields.io/npm/l/@ldesign/cropper-angular.svg)](https://github.com/ldesign/cropper/blob/main/LICENSE)

## ✨ Features

- 🎯 **Angular 17+** - Built with standalone components
- 📦 **TypeScript** - Full type definitions included
- 🎨 **150+ Features** - Image cropping, filters, batch processing, and more
- 🚀 **High Performance** - 60fps animations, Web Worker support
- 💪 **Production Ready** - Battle-tested and optimized

## 📦 Installation

```bash
npm install @ldesign/cropper-angular
# or
pnpm add @ldesign/cropper-angular
# or
yarn add @ldesign/cropper-angular
```

## 🚀 Quick Start

### 1. Import the Component

```typescript
import { Component } from '@angular/core'
import { CropperComponent } from '@ldesign/cropper-angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CropperComponent],
  template: `
    <l-cropper
      [src]="imageUrl"
      [aspectRatio]="16/9"
      (ready)="onReady($event)"
      (crop)="onCrop($event)"
    ></l-cropper>
  `
})
export class AppComponent {
  imageUrl = 'https://example.com/image.jpg'

  onReady(event: CustomEvent) {
    console.log('Cropper ready!', event)
  }

  onCrop(event: CustomEvent) {
    console.log('Crop data:', event.detail)
  }
}
```

### 2. Basic Usage

```typescript
import { Component, ViewChild } from '@angular/core'
import { CropperComponent } from '@ldesign/cropper-angular'

@Component({
  selector: 'app-image-editor',
  standalone: true,
  imports: [CropperComponent],
  template: `
    <l-cropper
      #cropper
      [src]="imageUrl"
      [aspectRatio]="aspectRatio"
      [viewMode]="1"
      [dragMode]="'crop'"
      (ready)="onReady($event)"
    ></l-cropper>
    
    <div class="controls">
      <button (click)="getCroppedImage()">Get Cropped Image</button>
      <button (click)="reset()">Reset</button>
      <button (click)="rotate()">Rotate</button>
    </div>
  `
})
export class ImageEditorComponent {
  @ViewChild('cropper') cropper!: CropperComponent

  imageUrl = 'path/to/image.jpg'
  aspectRatio = 16 / 9

  onReady(event: CustomEvent) {
    console.log('Cropper is ready')
  }

  getCroppedImage() {
    const canvas = this.cropper.getCroppedCanvas()
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      console.log('Cropped image:', dataUrl)
    }
  }

  reset() {
    this.cropper.reset()
  }

  rotate() {
    this.cropper.rotate(90)
  }
}
```

## 📖 API

### Component Props (Inputs)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Image source URL |
| `aspectRatio` | `number` | - | Fixed aspect ratio (e.g., 16/9) |
| `viewMode` | `0 \| 1 \| 2 \| 3` | `0` | View mode restriction |
| `dragMode` | `'crop' \| 'move' \| 'none'` | `'crop'` | Drag mode |
| `options` | `CropperOptions` | - | Full cropper options |

### Component Events (Outputs)

| Event | Type | Description |
|-------|------|-------------|
| `ready` | `EventEmitter<CustomEvent>` | Fired when cropper is ready |
| `cropstart` | `EventEmitter<CustomEvent>` | Fired when crop starts |
| `cropmove` | `EventEmitter<CustomEvent>` | Fired when crop box moves |
| `cropend` | `EventEmitter<CustomEvent>` | Fired when crop ends |
| `crop` | `EventEmitter<CustomEvent>` | Fired on crop |
| `zoom` | `EventEmitter<CustomEvent>` | Fired on zoom |

### Component Methods

```typescript
// Get cropped canvas
getCroppedCanvas(options?: GetCroppedCanvasOptions): HTMLCanvasElement | null

// Get crop box data
getCropBoxData(): CropBoxData | null

// Get image data
getImageData(): ImageData | null

// Set aspect ratio
setAspectRatio(aspectRatio: number): void

// Reset to initial state
reset(): void

// Clear crop box
clear(): void

// Replace image
replace(url: string): void

// Destroy cropper
destroy(): void

// Zoom
zoom(ratio: number): void

// Rotate
rotate(degree: number): void

// Scale
scale(scaleX: number, scaleY?: number): void

// Move
move(offsetX: number, offsetY?: number): void
```

## 🎨 Advanced Usage

### With Filters

```typescript
import { Component } from '@angular/core'
import { CropperComponent } from '@ldesign/cropper-angular'
import { FilterEngine } from '@ldesign/cropper-core'

@Component({
  selector: 'app-filter-editor',
  standalone: true,
  imports: [CropperComponent],
  template: `
    <l-cropper [src]="imageUrl" (ready)="onReady()"></l-cropper>
    <button (click)="applyFilter('grayscale')">Grayscale</button>
    <button (click)="applyFilter('vintage')">Vintage</button>
  `
})
export class FilterEditorComponent {
  imageUrl = 'path/to/image.jpg'
  filterEngine?: FilterEngine

  onReady() {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      this.filterEngine = new FilterEngine(canvas)
    }
  }

  applyFilter(filterName: string) {
    this.filterEngine?.applyFilter(filterName)
  }
}
```

### Module Configuration

If you're using NgModules (not standalone):

```typescript
import { NgModule } from '@angular/core'
import { CropperComponent } from '@ldesign/cropper-angular'

@NgModule({
  imports: [CropperComponent],
  exports: [CropperComponent]
})
export class CropperModule { }
```

## 🎯 Options

All options from `@ldesign/cropper-core` are supported:

```typescript
const options: CropperOptions = {
  viewMode: 1,
  dragMode: 'crop',
  aspectRatio: 16 / 9,
  autoCrop: true,
  movable: true,
  rotatable: true,
  scalable: true,
  zoomable: true,
  zoomOnWheel: true,
  cropBoxMovable: true,
  cropBoxResizable: true,
  // ... and many more
}
```

## 💡 Tips

1. **Responsive Images**: Use `responsive: true` option for automatic container resizing
2. **Performance**: Enable Web Worker with `useWorker: true` for heavy operations
3. **Mobile**: Touch gestures are enabled by default via `touchGestures: true`
4. **Accessibility**: Built-in keyboard shortcuts and ARIA support

## 🔗 Links

- [Documentation](https://github.com/ldesign/cropper)
- [Core Package](https://www.npmjs.com/package/@ldesign/cropper-core)
- [Examples](https://github.com/ldesign/cropper/tree/main/examples)

## 📄 License

MIT © ldesign
