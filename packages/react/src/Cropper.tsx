import type { CropBoxData, CropData, Cropper as CropperCore, type CropperOptions } from '@ldesign/cropper-core'

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import '@ldesign/cropper-core/style.css'

export interface CropperProps extends CropperOptions {
  onReady?: (event: CustomEvent) => void
  onCropStart?: (event: CustomEvent) => void
  onCropMove?: (event: CustomEvent) => void
  onCropEnd?: (event: CustomEvent) => void
  onCrop?: (event: CustomEvent) => void
  onZoom?: (event: CustomEvent) => void
  style?: React.CSSProperties
  className?: string
}

export interface CropperRef {
  getCropper: () => CropperCore | null
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
  destroy: () => void
}

export const Cropper = forwardRef<CropperRef, CropperProps>((props, ref) => {
  const {
    onReady,
    onCropStart,
    onCropMove,
    onCropEnd,
    onCrop,
    onZoom,
    style,
    className,
    ...cropperOptions
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const cropperRef = useRef<CropperCore | null>(null)

  // 初始化 Cropper
  useEffect(() => {
    if (!containerRef.current)
      return

    const options: CropperOptions = {
      ...cropperOptions,
      ready: (e) => {
        onReady?.(e)
        if (cropperOptions.ready)
          cropperOptions.ready(e)
      },
      cropstart: (e) => {
        onCropStart?.(e)
        if (cropperOptions.cropstart)
          cropperOptions.cropstart(e)
      },
      cropmove: (e) => {
        onCropMove?.(e)
        if (cropperOptions.cropmove)
          cropperOptions.cropmove(e)
      },
      cropend: (e) => {
        onCropEnd?.(e)
        if (cropperOptions.cropend)
          cropperOptions.cropend(e)
      },
      crop: (e) => {
        onCrop?.(e)
        if (cropperOptions.crop)
          cropperOptions.crop(e)
      },
      zoom: (e) => {
        onZoom?.(e)
        if (cropperOptions.zoom)
          cropperOptions.zoom(e)
      },
    }

    cropperRef.current = new CropperCore(containerRef.current, options)

    return () => {
      cropperRef.current?.destroy()
      cropperRef.current = null
    }
  }, [])

  // 监听 src 变化
  useEffect(() => {
    if (props.src && cropperRef.current) {
      cropperRef.current.replace(props.src)
    }
  }, [props.src])

  // 暴露方法
  useImperativeHandle(ref, () => ({
    getCropper: () => cropperRef.current,
    getCropBoxData: () => cropperRef.current?.getCropBoxData() || null,
    setCropBoxData: (data: Partial<CropBoxData>) => {
      cropperRef.current?.setCropBoxData(data)
    },
    getData: (rounded?: boolean) => cropperRef.current?.getData(rounded) || null,
    getCroppedCanvas: (options?: any) => cropperRef.current?.getCroppedCanvas(options) || null,
    replace: async (src: string) => {
      await cropperRef.current?.replace(src)
    },
    reset: () => cropperRef.current?.reset(),
    clear: () => cropperRef.current?.clear(),
    rotate: (degree: number) => cropperRef.current?.rotate(degree),
    scale: (scaleX: number, scaleY?: number) => cropperRef.current?.scale(scaleX, scaleY),
    move: (offsetX: number, offsetY?: number) => cropperRef.current?.move(offsetX, offsetY),
    zoom: (ratio: number) => cropperRef.current?.zoom(ratio),
    enable: () => cropperRef.current?.enable(),
    disable: () => cropperRef.current?.disable(),
    destroy: () => {
      cropperRef.current?.destroy()
      cropperRef.current = null
    },
  }))

  return (
    <div
      ref={containerRef}
      className={`cropper-container ${className || ''}`}
      style={style}
    />
  )
})

Cropper.displayName = 'Cropper'

export default Cropper
