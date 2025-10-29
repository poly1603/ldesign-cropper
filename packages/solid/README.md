# @ldesign/cropper-solid

> Solid.js wrapper for @ldesign/cropper - A powerful, high-performance image cropper library

[![NPM Version](https://img.shields.io/npm/v/@ldesign/cropper-solid.svg)](https://www.npmjs.com/package/@ldesign/cropper-solid)
[![License](https://img.shields.io/npm/l/@ldesign/cropper-solid.svg)](https://github.com/ldesign/cropper/blob/main/LICENSE)

## ✨ Features

- ⚡ **Solid.js 1.8+** - Built with fine-grained reactivity
- 📦 **TypeScript** - Full type definitions included
- 🎨 **150+ Features** - Image cropping, filters, batch processing, and more
- 🚀 **High Performance** - 60fps animations, Web Worker support
- 💪 **Production Ready** - Battle-tested and optimized

## 📦 Installation

```bash
npm install @ldesign/cropper-solid
# or
pnpm add @ldesign/cropper-solid
# or
yarn add @ldesign/cropper-solid
```

## 🚀 Quick Start

### Component Usage

```tsx
import { createSignal } from 'solid-js'
import { Cropper } from '@ldesign/cropper-solid'

function App() {
  const [imageUrl] = createSignal('https://example.com/image.jpg')

  const handleReady = (event: CustomEvent) => {
    console.log('Cropper ready!', event)
  }

  const handleCrop = (event: CustomEvent) => {
    console.log('Crop data:', event.detail)
  }

  return (
    <Cropper
      src={imageUrl()}
      aspectRatio={16/9}
      onReady={handleReady}
      onCrop={handleCrop}
    />
  )
}

export default App
```

### With Reactive Props

```tsx
import { createSignal } from 'solid-js'
import { Cropper } from '@ldesign/cropper-solid'

function ImageEditor() {
  const [src, setSrc] = createSignal('path/to/image.jpg')
  const [aspectRatio, setAspectRatio] = createSignal(16 / 9)

  return (
    <div>
      <Cropper
        src={src()}
        aspectRatio={aspectRatio()}
        viewMode={1}
        dragMode="crop"
        onReady={(e) => console.log('Ready', e)}
      />
      
      <div class="controls">
        <button onClick={() => setAspectRatio(1)}>Square</button>
        <button onClick={() => setAspectRatio(16/9)}>16:9</button>
        <button onClick={() => setAspectRatio(4/3)}>4:3</button>
      </div>
    </div>
  )
}
```

### Using the Composable

```tsx
import { createSignal, onMount } from 'solid-js'
import { useCropper } from '@ldesign/cropper-solid'

function AdvancedEditor() {
  let containerRef: HTMLDivElement | undefined
  const { cropper, initCropper, destroyCropper } = useCropper()

  onMount(() => {
    if (containerRef) {
      initCropper(containerRef, {
        src: 'path/to/image.jpg',
        aspectRatio: 16 / 9,
        autoCrop: true
      })
    }
  })

  const getCroppedImage = () => {
    const canvas = cropper()?.getCroppedCanvas()
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      console.log('Cropped:', dataUrl)
    }
  }

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={getCroppedImage}>Get Image</button>
      <button onClick={destroyCropper}>Destroy</button>
    </div>
  )
}
```

## 📖 API

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Image source URL |
| `aspectRatio` | `number` | - | Fixed aspect ratio (e.g., 16/9) |
| `viewMode` | `0 \| 1 \| 2 \| 3` | `0` | View mode restriction |
| `dragMode` | `'crop' \| 'move' \| 'none'` | `'crop'` | Drag mode |
| `options` | `CropperOptions` | - | Full cropper options |
| `class` | `string` | - | Additional CSS class |
| `style` | `JSX.CSSProperties` | - | Inline styles |

### Component Events

| Event | Type | Description |
|-------|------|-------------|
| `onReady` | `(event: CustomEvent) => void` | Fired when ready |
| `onCropstart` | `(event: CustomEvent) => void` | Fired when crop starts |
| `onCropmove` | `(event: CustomEvent) => void` | Fired when crop box moves |
| `onCropend` | `(event: CustomEvent) => void` | Fired when crop ends |
| `onCrop` | `(event: CustomEvent) => void` | Fired on crop |
| `onZoom` | `(event: CustomEvent) => void` | Fired on zoom |

### useCropper Composable

```typescript
function useCropper(): {
  cropper: Accessor<CropperCore | undefined>
  initCropper: (element: HTMLElement, options: CropperOptions) => CropperCore
  destroyCropper: () => void
}
```

## 🎨 Advanced Usage

### With Filters

```tsx
import { createSignal, onMount } from 'solid-js'
import { Cropper } from '@ldesign/cropper-solid'
import { FilterEngine } from '@ldesign/cropper-core'

function FilterEditor() {
  const [src] = createSignal('path/to/image.jpg')
  let filterEngine: FilterEngine | undefined

  const handleReady = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      filterEngine = new FilterEngine(canvas)
    }
  }

  const applyFilter = (name: string) => {
    filterEngine?.applyFilter(name)
  }

  return (
    <>
      <Cropper src={src()} onReady={handleReady} />
      <div>
        <button onClick={() => applyFilter('grayscale')}>Grayscale</button>
        <button onClick={() => applyFilter('vintage')}>Vintage</button>
        <button onClick={() => applyFilter('valencia')}>Valencia</button>
      </div>
    </>
  )
}
```

### Batch Processing

```tsx
import { createSignal, For } from 'solid-js'
import { Cropper } from '@ldesign/cropper-solid'
import { BatchProcessor } from '@ldesign/cropper-core'

function BatchCropper() {
  const [images] = createSignal([
    'image1.jpg',
    'image2.jpg',
    'image3.jpg'
  ])

  const processBatch = async () => {
    const processor = new BatchProcessor({
      concurrency: 3,
      mode: 'parallel'
    })

    await processor.process(images(), async (src) => {
      // Process each image
      return { src, processed: true }
    })
  }

  return (
    <>
      <For each={images()}>
        {(src) => (
          <Cropper
            src={src}
            aspectRatio={16/9}
            style={{ width: '200px', height: '200px' }}
          />
        )}
      </For>
      <button onClick={processBatch}>Process All</button>
    </>
  )
}
```

## 💡 Tips

1. **Reactivity**: Props are automatically reactive - changes will update the cropper
2. **Performance**: Use `createMemo` for expensive computed props
3. **Cleanup**: Cropper is automatically destroyed when component unmounts
4. **Custom Styling**: Use `class` or `style` props for custom appearance

## 🔗 Links

- [Documentation](https://github.com/ldesign/cropper)
- [Core Package](https://www.npmjs.com/package/@ldesign/cropper-core)
- [Solid.js](https://www.solidjs.com/)

## 📄 License

MIT © ldesign
