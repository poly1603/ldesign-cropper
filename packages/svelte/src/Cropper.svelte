<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { Cropper as CropperCore, type CropperOptions } from '@ldesign/cropper-core'

  export let src: string | undefined = undefined
  export let aspectRatio: number | undefined = undefined
  export let viewMode: 0 | 1 | 2 | 3 | undefined = undefined
  export let dragMode: 'crop' | 'move' | 'none' | undefined = undefined
  export let options: CropperOptions | undefined = undefined

  const dispatch = createEventDispatcher()
  
  let container: HTMLDivElement
  let cropper: CropperCore | undefined

  onMount(() => {
    if (container) {
      const cropperOptions: CropperOptions = {
        ...options,
        src,
        aspectRatio,
        viewMode,
        dragMode,
        ready: (e) => dispatch('ready', e),
        cropstart: (e) => dispatch('cropstart', e),
        cropmove: (e) => dispatch('cropmove', e),
        cropend: (e) => dispatch('cropend', e),
        crop: (e) => dispatch('crop', e),
        zoom: (e) => dispatch('zoom', e)
      }

      cropper = new CropperCore(container, cropperOptions)
    }
  })

  onDestroy(() => {
    cropper?.destroy()
  })

  // Reactive updates
  $: if (cropper && aspectRatio !== undefined) {
    cropper.setAspectRatio(aspectRatio)
  }

  $: if (cropper && src) {
    cropper.replace(src)
  }

  // Public API methods
  export function getCroppedCanvas(canvasOptions?: any) {
    return cropper?.getCroppedCanvas(canvasOptions)
  }

  export function getCropBoxData() {
    return cropper?.getCropBoxData()
  }

  export function getImageData() {
    return cropper?.getImageData()
  }

  export function setAspectRatio(ratio: number) {
    cropper?.setAspectRatio(ratio)
  }

  export function reset() {
    cropper?.reset()
  }

  export function clear() {
    cropper?.clear()
  }

  export function replace(url: string) {
    cropper?.replace(url)
  }

  export function destroy() {
    cropper?.destroy()
  }

  export function zoom(ratio: number) {
    cropper?.zoom(ratio)
  }

  export function rotate(degree: number) {
    cropper?.rotate(degree)
  }

  export function scale(scaleX: number, scaleY?: number) {
    cropper?.scale(scaleX, scaleY)
  }

  export function move(offsetX: number, offsetY?: number) {
    cropper?.move(offsetX, offsetY)
  }
</script>

<div bind:this={container} class="cropper-container" {...$$restProps}>
  <slot />
</div>

<style>
  .cropper-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
  }
</style>
