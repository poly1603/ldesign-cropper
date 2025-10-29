import type { CropperOptions } from '@ldesign/cropper-core'
import type { Component, JSX } from 'solid-js'
import { Cropper as CropperCore } from '@ldesign/cropper-core'
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'

export interface CropperProps {
  src?: string
  aspectRatio?: number
  viewMode?: 0 | 1 | 2 | 3
  dragMode?: 'crop' | 'move' | 'none'
  options?: CropperOptions
  onReady?: (event: CustomEvent) => void
  onCropstart?: (event: CustomEvent) => void
  onCropmove?: (event: CustomEvent) => void
  onCropend?: (event: CustomEvent) => void
  onCrop?: (event: CustomEvent) => void
  onZoom?: (event: CustomEvent) => void
  class?: string
  style?: JSX.CSSProperties
}

export const Cropper: Component<CropperProps> = (props) => {
  let containerRef: HTMLDivElement | undefined
  let cropper: CropperCore | undefined
  const [isReady, setIsReady] = createSignal(false)

  onMount(() => {
    if (containerRef) {
      const options: CropperOptions = {
        ...props.options,
        src: props.src,
        aspectRatio: props.aspectRatio,
        viewMode: props.viewMode,
        dragMode: props.dragMode,
        ready: (e) => {
          setIsReady(true)
          props.onReady?.(e)
        },
        cropstart: props.onCropstart,
        cropmove: props.onCropmove,
        cropend: props.onCropend,
        crop: props.onCrop,
        zoom: props.onZoom,
      }

      cropper = new CropperCore(containerRef, options)
    }
  })

  createEffect(() => {
    if (cropper && props.aspectRatio !== undefined) {
      cropper.setAspectRatio(props.aspectRatio)
    }
  })

  createEffect(() => {
    if (cropper && props.src) {
      cropper.replace(props.src)
    }
  })

  onCleanup(() => {
    cropper?.destroy()
  })

  return (
    <div
      ref={containerRef}
      class={props.class}
      style={{
        'width': '100%',
        'height': '100%',
        'min-height': '400px',
        ...props.style,
      }}
    />
  )
}

// Export composable for advanced usage
export function useCropper() {
  const [cropper, setCropper] = createSignal<CropperCore | undefined>()

  const initCropper = (element: HTMLElement, options: CropperOptions) => {
    const instance = new CropperCore(element, options)
    setCropper(instance)
    return instance
  }

  const destroyCropper = () => {
    cropper()?.destroy()
    setCropper(undefined)
  }

  onCleanup(() => {
    destroyCropper()
  })

  return {
    cropper,
    initCropper,
    destroyCropper,
  }
}
