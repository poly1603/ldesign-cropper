# @ldesign/cropper-qwik

> Qwik wrapper for @ldesign/cropper - A powerful, high-performance image cropper library

[![NPM Version](https://img.shields.io/npm/v/@ldesign/cropper-qwik.svg)](https://www.npmjs.com/package/@ldesign/cropper-qwik)
[![License](https://img.shields.io/npm/l/@ldesign/cropper-qwik.svg)](https://github.com/ldesign/cropper/blob/main/LICENSE)

## ✨ Features

- ⚡ **Qwik 1.0+** - Built with resumability
- 📦 **TypeScript** - Full type definitions included
- 🎨 **150+ Features** - Image cropping, filters, batch processing, and more
- 🚀 **High Performance** - 60fps animations, Web Worker support
- 💪 **Production Ready** - Battle-tested and optimized

## 📦 Installation

```bash
npm install @ldesign/cropper-qwik
# or
pnpm add @ldesign/cropper-qwik
# or
yarn add @ldesign/cropper-qwik
```

## 🚀 Quick Start

### Component Usage

```tsx
import { component$ } from '@builder.io/qwik'
import { Cropper } from '@ldesign/cropper-qwik'

export default component$(() => {
  return (
    <Cropper
      src="https://example.com/image.jpg"
      aspectRatio={16/9}
      onReady$={(event) => {
        console.log('Cropper ready!', event)
      }}
      onCrop$={(event) => {
        console.log('Crop data:', event.detail)
      }}
    />
  )
})
```

### With State Management

```tsx
import { component$, useSignal } from '@builder.io/qwik'
import { Cropper } from '@ldesign/cropper-qwik'

export default component$(() => {
  const src = useSignal('path/to/image.jpg')
  const aspectRatio = useSignal(16 / 9)

  return (
    <div>
      <Cropper
        src={src.value}
        aspectRatio={aspectRatio.value}
        viewMode={1}
        dragMode="crop"
        onReady$={() => console.log('Ready')}
      />
      
      <div class="controls">
        <button onClick$={() => aspectRatio.value = 1}>Square</button>
        <button onClick$={() => aspectRatio.value = 16/9}>16:9</button>
        <button onClick$={() => aspectRatio.value = 4/3}>4:3</button>
      </div>
    </div>
  )
})
```

### Using the Composable

```tsx
import { component$, useVisibleTask$ } from '@builder.io/qwik'
import { useCropper } from '@ldesign/cropper-qwik'

export default component$(() => {
  const { cropper, initCropper, destroyCropper } = useCropper()

  useVisibleTask$(({ cleanup }) => {
    const container = document.getElementById('cropper-container')
    if (container) {
      initCropper(container, {
        src: 'path/to/image.jpg',
        aspectRatio: 16 / 9
      })
    }

    cleanup(() => {
      destroyCropper()
    })
  })

  const getCroppedImage = $(() => {
    const canvas = cropper.value?.getCroppedCanvas()
    if (canvas) {
      console.log('Cropped:', canvas.toDataURL('image/png'))
    }
  })

  return (
    <div>
      <div id="cropper-container" />
      <button onClick$={getCroppedImage}>Get Image</button>
    </div>
  )
})
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

### Component Events

| Event | Type | Description |
|-------|------|-------------|
| `onReady$` | `PropFunction<(event: CustomEvent) => void>` | Fired when ready |
| `onCropstart$` | `PropFunction<(event: CustomEvent) => void>` | Crop starts |
| `onCropmove$` | `PropFunction<(event: CustomEvent) => void>` | Crop box moves |
| `onCropend$` | `PropFunction<(event: CustomEvent) => void>` | Crop ends |
| `onCrop$` | `PropFunction<(event: CustomEvent) => void>` | On crop |
| `onZoom$` | `PropFunction<(event: CustomEvent) => void>` | On zoom |

> **Note**: All event handlers must use the `$` suffix for Qwik's optimizer.

### useCropper Composable

```typescript
function useCropper(): {
  cropper: Signal<CropperCore | undefined>
  initCropper: (element: HTMLElement, options: CropperOptions) => CropperCore
  destroyCropper: () => void
}
```

## 🎨 Advanced Usage

### With Filters

```tsx
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import { Cropper } from '@ldesign/cropper-qwik'
import { FilterEngine } from '@ldesign/cropper-core'

export default component$(() => {
  const filterEngine = useSignal<FilterEngine>()

  const handleReady = $(() => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      filterEngine.value = new FilterEngine(canvas)
    }
  })

  const applyFilter = $((name: string) => {
    filterEngine.value?.applyFilter(name)
  })

  return (
    <>
      <Cropper
        src="path/to/image.jpg"
        onReady$={handleReady}
      />
      <div>
        <button onClick$={() => applyFilter('grayscale')}>Grayscale</button>
        <button onClick$={() => applyFilter('vintage')}>Vintage</button>
        <button onClick$={() => applyFilter('valencia')}>Valencia</button>
      </div>
    </>
  )
})
```

### Image Upload

```tsx
import { component$, useSignal, $ } from '@builder.io/qwik'
import { Cropper } from '@ldesign/cropper-qwik'

export default component$(() => {
  const imageUrl = useSignal<string>()

  const handleFileChange = $((event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imageUrl.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  })

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange$={handleFileChange}
      />
      
      {imageUrl.value && (
        <Cropper src={imageUrl.value} aspectRatio={16/9} />
      )}
    </div>
  )
})
```

### Batch Processing

```tsx
import { component$, useSignal, $ } from '@builder.io/qwik'
import { Cropper } from '@ldesign/cropper-qwik'
import { BatchProcessor } from '@ldesign/cropper-core'

export default component$(() => {
  const images = useSignal([
    'image1.jpg',
    'image2.jpg',
    'image3.jpg'
  ])

  const processBatch = $(async () => {
    const processor = new BatchProcessor({
      concurrency: 3,
      mode: 'parallel'
    })

    await processor.process(images.value, async (src) => {
      return { src, processed: true }
    })
  })

  return (
    <>
      {images.value.map((src) => (
        <Cropper
          key={src}
          src={src}
          aspectRatio={16/9}
          style={{ width: '200px', height: '200px' }}
        />
      ))}
      <button onClick$={processBatch}>Process All</button>
    </>
  )
})
```

## 💡 Tips

1. **Resumability**: Qwik's resumability means faster initial loads
2. **Lazy Loading**: Cropper logic only loads when visible
3. **Event Handlers**: Always use `$` suffix for event handlers
4. **Signals**: Use Qwik signals for reactive state management

## 🔗 Links

- [Documentation](https://github.com/ldesign/cropper)
- [Core Package](https://www.npmjs.com/package/@ldesign/cropper-core)
- [Qwik](https://qwik.builder.io/)

## 📄 License

MIT © ldesign
