# @ldesign/cropper-svelte

> Svelte wrapper for @ldesign/cropper - A powerful, high-performance image cropper library

[![NPM Version](https://img.shields.io/npm/v/@ldesign/cropper-svelte.svg)](https://www.npmjs.com/package/@ldesign/cropper-svelte)
[![License](https://img.shields.io/npm/l/@ldesign/cropper-svelte.svg)](https://github.com/ldesign/cropper/blob/main/LICENSE)

## ✨ Features

- 🎯 **Svelte 4/5** - Built with compiled reactivity
- 📦 **TypeScript** - Full type definitions included
- 🎨 **150+ Features** - Image cropping, filters, batch processing, and more
- 🚀 **High Performance** - 60fps animations, Web Worker support
- 💪 **Production Ready** - Battle-tested and optimized

## 📦 Installation

```bash
npm install @ldesign/cropper-svelte
# or
pnpm add @ldesign/cropper-svelte
# or
yarn add @ldesign/cropper-svelte
```

## 🚀 Quick Start

### Basic Usage

```svelte
<script>
  import { Cropper } from '@ldesign/cropper-svelte'

  let imageUrl = 'https://example.com/image.jpg'

  function handleReady(event) {
    console.log('Cropper ready!', event.detail)
  }

  function handleCrop(event) {
    console.log('Crop data:', event.detail)
  }
</script>

<Cropper
  src={imageUrl}
  aspectRatio={16/9}
  on:ready={handleReady}
  on:crop={handleCrop}
/>
```

### With TypeScript

```svelte
<script lang="ts">
  import { Cropper } from '@ldesign/cropper-svelte'
  import type { CropperOptions } from '@ldesign/cropper-core'

  let imageUrl = 'path/to/image.jpg'
  let aspectRatio = 16 / 9
  
  let cropper: Cropper

  const options: CropperOptions = {
    viewMode: 1,
    dragMode: 'crop',
    autoCrop: true
  }

  function getCroppedImage() {
    const canvas = cropper.getCroppedCanvas()
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      console.log('Cropped:', dataUrl)
    }
  }
</script>

<Cropper
  bind:this={cropper}
  src={imageUrl}
  aspectRatio={aspectRatio}
  {options}
  on:ready={() => console.log('Ready')}
/>

<button on:click={getCroppedImage}>Get Cropped Image</button>
```

### Reactive Updates

```svelte
<script>
  import { Cropper } from '@ldesign/cropper-svelte'

  let src = 'image1.jpg'
  let aspectRatio = 16 / 9

  function changeImage() {
    src = 'image2.jpg'
  }

  function changeAspectRatio(ratio) {
    aspectRatio = ratio
  }
</script>

<Cropper {src} {aspectRatio} />

<div class="controls">
  <button on:click={changeImage}>Change Image</button>
  <button on:click={() => changeAspectRatio(1)}>Square</button>
  <button on:click={() => changeAspectRatio(16/9)}>16:9</button>
  <button on:click={() => changeAspectRatio(4/3)}>4:3</button>
</div>
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

### Component Events

| Event | Type | Description |
|-------|------|-------------|
| `ready` | `CustomEvent` | Fired when cropper is ready |
| `cropstart` | `CustomEvent` | Fired when crop starts |
| `cropmove` | `CustomEvent` | Fired when crop box moves |
| `cropend` | `CustomEvent` | Fired when crop ends |
| `crop` | `CustomEvent` | Fired on crop |
| `zoom` | `CustomEvent` | Fired on zoom |

### Component Methods

Access methods via component binding:

```svelte
<script>
  let cropper

  function useMethods() {
    cropper.getCroppedCanvas()
    cropper.getCropBoxData()
    cropper.getImageData()
    cropper.setAspectRatio(16/9)
    cropper.reset()
    cropper.clear()
    cropper.zoom(0.1)
    cropper.rotate(90)
    cropper.scale(1, -1)
    cropper.move(10, 10)
  }
</script>

<Cropper bind:this={cropper} src="image.jpg" />
```

## 🎨 Advanced Usage

### With Filters

```svelte
<script>
  import { Cropper } from '@ldesign/cropper-svelte'
  import { FilterEngine } from '@ldesign/cropper-core'

  let cropper
  let filterEngine

  function handleReady() {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      filterEngine = new FilterEngine(canvas)
    }
  }

  function applyFilter(name) {
    filterEngine?.applyFilter(name)
  }
</script>

<Cropper
  bind:this={cropper}
  src="path/to/image.jpg"
  on:ready={handleReady}
/>

<div class="filters">
  <button on:click={() => applyFilter('grayscale')}>Grayscale</button>
  <button on:click={() => applyFilter('vintage')}>Vintage</button>
  <button on:click={() => applyFilter('valencia')}>Valencia</button>
</div>
```

### Custom Styling

```svelte
<script>
  import { Cropper } from '@ldesign/cropper-svelte'
</script>

<Cropper
  src="image.jpg"
  class="custom-cropper"
  style="border: 2px solid #ccc; border-radius: 8px;"
/>

<style>
  :global(.custom-cropper) {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }
</style>
```

### Slot Support

```svelte
<script>
  import { Cropper } from '@ldesign/cropper-svelte'
</script>

<Cropper src="image.jpg">
  <div class="loading">Loading image...</div>
</Cropper>
```

## 💡 Tips

1. **Reactive Props**: `src` and `aspectRatio` are reactive - changes auto-update
2. **Two-Way Binding**: Use `bind:this` to access component methods
3. **Event Handling**: All events use Svelte's `on:` directive
4. **Slots**: Use default slot for loading states or overlays

## 🔗 Links

- [Documentation](https://github.com/ldesign/cropper)
- [Core Package](https://www.npmjs.com/package/@ldesign/cropper-core)
- [Svelte](https://svelte.dev/)

## 📄 License

MIT © ldesign
