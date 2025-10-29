import type { CropBoxData, CropData, Cropper, type CropperOptions } from '@ldesign/cropper-core'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseCropperOptions extends CropperOptions {
  onReady?: (cropper: Cropper) => void
}

export interface UseCropperReturn {
  containerRef: React.RefObject<HTMLDivElement>
  cropper: Cropper | null
  ready: boolean
  getCropBoxData: () => CropBoxData | null
  setCropBoxData: (data: Partial<CropBoxData>) => void
  getData: (rounded?: boolean) => CropData | null
  getCroppedCanvas: (options?: any) => HTMLCanvasElement | null
  replace: (src: string) => Promise<void>
  reset: () => void
  clear: () => void
  rotate: (degree: number) => void
  scale: (scaleX: number, scaleY?: number) => void
  move: (offsetX: number, offsetY?: number) => void
  zoom: (ratio: number) => void
  enable: () => void
  disable: () => void
}

export function useCropper(options: UseCropperOptions = {}): UseCropperReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cropper, setCropper] = useState<Cropper | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current)
      return

    const { onReady, ...cropperOptions } = options

    const instance = new Cropper(containerRef.current, {
      ...cropperOptions,
      ready: (e) => {
        setReady(true)
        onReady?.(instance)
        if (cropperOptions.ready) {
          cropperOptions.ready(e)
        }
      },
    })

    setCropper(instance)

    return () => {
      instance.destroy()
      setCropper(null)
      setReady(false)
    }
  }, [])

  const getCropBoxData = useCallback(() => {
    return cropper?.getCropBoxData() || null
  }, [cropper])

  const setCropBoxData = useCallback((data: Partial<CropBoxData>) => {
    cropper?.setCropBoxData(data)
  }, [cropper])

  const getData = useCallback((rounded?: boolean) => {
    return cropper?.getData(rounded) || null
  }, [cropper])

  const getCroppedCanvas = useCallback((options?: any) => {
    return cropper?.getCroppedCanvas(options) || null
  }, [cropper])

  const replace = useCallback(async (src: string) => {
    await cropper?.replace(src)
  }, [cropper])

  const reset = useCallback(() => {
    cropper?.reset()
  }, [cropper])

  const clear = useCallback(() => {
    cropper?.clear()
  }, [cropper])

  const rotate = useCallback((degree: number) => {
    cropper?.rotate(degree)
  }, [cropper])

  const scale = useCallback((scaleX: number, scaleY?: number) => {
    cropper?.scale(scaleX, scaleY)
  }, [cropper])

  const move = useCallback((offsetX: number, offsetY?: number) => {
    cropper?.move(offsetX, offsetY)
  }, [cropper])

  const zoom = useCallback((ratio: number) => {
    cropper?.zoom(ratio)
  }, [cropper])

  const enable = useCallback(() => {
    cropper?.enable()
  }, [cropper])

  const disable = useCallback(() => {
    cropper?.disable()
  }, [cropper])

  return {
    containerRef,
    cropper,
    ready,
    getCropBoxData,
    setCropBoxData,
    getData,
    getCroppedCanvas,
    replace,
    reset,
    clear,
    rotate,
    scale,
    move,
    zoom,
    enable,
    disable,
  }
}
