import { component$, useSignal, useVisibleTask$, type QRL, type PropFunction } from '@builder.io/qwik'
import { Cropper as CropperCore, type CropperOptions } from '@ldesign/cropper-core'

export interface CropperProps {
  src?: string
  aspectRatio?: number
  viewMode?: 0 | 1 | 2 | 3
  dragMode?: 'crop' | 'move' | 'none'
  options?: CropperOptions
  onReady$?: PropFunction<(event: CustomEvent) => void>
  onCropstart$?: PropFunction<(event: CustomEvent) => void>
  onCropmove$?: PropFunction<(event: CustomEvent) => void>
  onCropend$?: PropFunction<(event: CustomEvent) => void>
  onCrop$?: PropFunction<(event: CustomEvent) => void>
  onZoom$?: PropFunction<(event: CustomEvent) => void>
  class?: string
}

export const Cropper = component$<CropperProps>((props) => {
  const containerRef = useSignal<HTMLDivElement>()
  const cropperRef = useSignal<CropperCore>()

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    track(() => props.src)
    track(() => props.aspectRatio)

    if (containerRef.value) {
      if (cropperRef.value) {
        // Update existing cropper
        if (props.aspectRatio !== undefined) {
          cropperRef.value.setAspectRatio(props.aspectRatio)
        }
        if (props.src) {
          cropperRef.value.replace(props.src)
        }
      }
      else {
        // Initialize cropper
        const options: CropperOptions = {
          ...props.options,
          src: props.src,
          aspectRatio: props.aspectRatio,
          viewMode: props.viewMode,
          dragMode: props.dragMode,
          ready: (e) => props.onReady$?.(e),
          cropstart: (e) => props.onCropstart$?.(e),
          cropmove: (e) => props.onCropmove$?.(e),
          cropend: (e) => props.onCropend$?.(e),
          crop: (e) => props.onCrop$?.(e),
          zoom: (e) => props.onZoom$?.(e)
        }

        cropperRef.value = new CropperCore(containerRef.value, options)
      }
    }

    cleanup(() => {
      cropperRef.value?.destroy()
      cropperRef.value = undefined
    })
  })

  return (
    <div
      ref={containerRef}
      class={`cropper-container ${props.class || ''}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px'
      }}
    />
  )
})

// Composable hook for advanced usage
export function useCropper() {
  const cropper = useSignal<CropperCore>()

  const initCropper = (element: HTMLElement, options: CropperOptions) => {
    const instance = new CropperCore(element, options)
    cropper.value = instance
    return instance
  }

  const destroyCropper = () => {
    cropper.value?.destroy()
    cropper.value = undefined
  }

  return {
    cropper,
    initCropper,
    destroyCropper
  }
}
