/**
 * Layer
 * Individual layer in the layer system
 */

import { generateId } from '../utils/dom'
import { dispatch } from '../utils/events'

export type BlendMode
  = | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity'

export interface LayerOptions {
  name?: string
  visible?: boolean
  opacity?: number
  blendMode?: BlendMode
  locked?: boolean
  x?: number
  y?: number
  width?: number
  height?: number
}

export interface LayerTransform {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  skewX: number
  skewY: number
}

export class Layer {
  readonly id: string
  name: string
  visible: boolean
  opacity: number
  blendMode: BlendMode
  locked: boolean

  // Canvas for this layer
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  // Transform properties
  transform: LayerTransform = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    skewX: 0,
    skewY: 0,
  }

  // Original image data (for non-destructive editing)
  private originalImageData: ImageData | null = null

  // Parent layer system
  private layerSystem: any = null

  constructor(width: number, height: number, options: LayerOptions = {}) {
    this.id = generateId('layer')
    this.name = options.name || `Layer ${this.id}`
    this.visible = options.visible ?? true
    this.opacity = options.opacity ?? 1
    this.blendMode = options.blendMode || 'normal'
    this.locked = options.locked ?? false

    // Create canvas
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height

    const ctx = this.canvas.getContext('2d', {
      willReadFrequently: true,
      alpha: true,
    })

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    this.ctx = ctx

    // Set initial position if provided
    if (options.x !== undefined)
      this.transform.x = options.x
    if (options.y !== undefined)
      this.transform.y = options.y
  }

  /**
   * Set layer system reference
   */
  setLayerSystem(system: any): void {
    this.layerSystem = system
  }

  /**
   * Set layer content from image
   */
  setImage(image: HTMLImageElement | HTMLCanvasElement | ImageBitmap): void {
    if (this.locked) {
      throw new Error('Layer is locked')
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw image
    this.ctx.drawImage(image, 0, 0)

    // Store original for non-destructive editing
    this.originalImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)

    this.notifyChange()
  }

  /**
   * Set layer content from image data
   */
  setImageData(imageData: ImageData): void {
    if (this.locked) {
      throw new Error('Layer is locked')
    }

    this.ctx.putImageData(imageData, 0, 0)
    this.originalImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    )

    this.notifyChange()
  }

  /**
   * Get layer image data
   */
  getImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Clear layer
   */
  clear(): void {
    if (this.locked) {
      throw new Error('Layer is locked')
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.originalImageData = null
    this.notifyChange()
  }

  /**
   * Draw on layer
   */
  draw(callback: (ctx: CanvasRenderingContext2D) => void): void {
    if (this.locked) {
      throw new Error('Layer is locked')
    }

    this.ctx.save()
    callback(this.ctx)
    this.ctx.restore()

    this.notifyChange()
  }

  /**
   * Set visibility
   */
  setVisible(visible: boolean): void {
    if (this.visible === visible)
      return

    this.visible = visible
    this.notifyChange()

    if (this.layerSystem) {
      dispatch(this.layerSystem.container, 'layer:visibility', {
        layerId: this.id,
        visible,
      })
    }
  }

  /**
   * Set opacity
   */
  setOpacity(opacity: number): void {
    const newOpacity = Math.max(0, Math.min(1, opacity))
    if (this.opacity === newOpacity)
      return

    this.opacity = newOpacity
    this.notifyChange()

    if (this.layerSystem) {
      dispatch(this.layerSystem.container, 'layer:opacity', {
        layerId: this.id,
        opacity: newOpacity,
      })
    }
  }

  /**
   * Set blend mode
   */
  setBlendMode(mode: BlendMode): void {
    if (this.blendMode === mode)
      return

    this.blendMode = mode
    this.notifyChange()

    if (this.layerSystem) {
      dispatch(this.layerSystem.container, 'layer:blendmode', {
        layerId: this.id,
        blendMode: mode,
      })
    }
  }

  /**
   * Set locked state
   */
  setLocked(locked: boolean): void {
    if (this.locked === locked)
      return

    this.locked = locked

    if (this.layerSystem) {
      dispatch(this.layerSystem.container, 'layer:lock', {
        layerId: this.id,
        locked,
      })
    }
  }

  /**
   * Set name
   */
  setName(name: string): void {
    if (this.name === name)
      return

    this.name = name

    if (this.layerSystem) {
      dispatch(this.layerSystem.container, 'layer:rename', {
        layerId: this.id,
        name,
      })
    }
  }

  /**
   * Transform layer
   */
  setTransform(transform: Partial<LayerTransform>): void {
    if (this.locked) {
      throw new Error('Layer is locked')
    }

    Object.assign(this.transform, transform)
    this.notifyChange()

    if (this.layerSystem) {
      dispatch(this.layerSystem.container, 'layer:transform', {
        layerId: this.id,
        transform: this.transform,
      })
    }
  }

  /**
   * Move layer
   */
  move(deltaX: number, deltaY: number): void {
    this.setTransform({
      x: this.transform.x + deltaX,
      y: this.transform.y + deltaY,
    })
  }

  /**
   * Scale layer
   */
  scale(scaleX: number, scaleY?: number): void {
    this.setTransform({
      scaleX: this.transform.scaleX * scaleX,
      scaleY: this.transform.scaleY * (scaleY ?? scaleX),
    })
  }

  /**
   * Rotate layer
   */
  rotate(angle: number): void {
    this.setTransform({
      rotation: this.transform.rotation + angle,
    })
  }

  /**
   * Flip horizontal
   */
  flipHorizontal(): void {
    this.setTransform({
      scaleX: -this.transform.scaleX,
    })
  }

  /**
   * Flip vertical
   */
  flipVertical(): void {
    this.setTransform({
      scaleY: -this.transform.scaleY,
    })
  }

  /**
   * Reset transform
   */
  resetTransform(): void {
    this.setTransform({
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      skewX: 0,
      skewY: 0,
    })
  }

  /**
   * Apply filter to layer
   */
  applyFilter(filter: (imageData: ImageData) => ImageData): void {
    if (this.locked) {
      throw new Error('Layer is locked')
    }

    const imageData = this.getImageData()
    const filtered = filter(imageData)
    this.ctx.putImageData(filtered, 0, 0)

    this.notifyChange()
  }

  /**
   * Merge with another layer
   */
  merge(layer: Layer, preserveOriginal: boolean = false): void {
    if (this.locked) {
      throw new Error('Layer is locked')
    }

    this.ctx.save()

    // Apply blend mode and opacity
    this.ctx.globalAlpha = layer.opacity
    this.ctx.globalCompositeOperation = layer.blendMode

    // Apply transform
    const t = layer.transform
    this.ctx.translate(t.x + layer.canvas.width / 2, t.y + layer.canvas.height / 2)
    this.ctx.rotate((t.rotation * Math.PI) / 180)
    this.ctx.scale(t.scaleX, t.scaleY)
    this.ctx.transform(1, t.skewY, t.skewX, 1, 0, 0)

    // Draw layer
    this.ctx.drawImage(
      layer.canvas,
      -layer.canvas.width / 2,
      -layer.canvas.height / 2,
    )

    this.ctx.restore()

    if (!preserveOriginal) {
      layer.clear()
    }

    this.notifyChange()
  }

  /**
   * Clone layer
   */
  clone(): Layer {
    const cloned = new Layer(this.canvas.width, this.canvas.height, {
      name: `${this.name} copy`,
      visible: this.visible,
      opacity: this.opacity,
      blendMode: this.blendMode,
      locked: false,
    })

    // Copy content
    cloned.ctx.drawImage(this.canvas, 0, 0)

    // Copy transform
    cloned.transform = { ...this.transform }

    // Copy original data if exists
    if (this.originalImageData) {
      cloned.originalImageData = new ImageData(
        new Uint8ClampedArray(this.originalImageData.data),
        this.originalImageData.width,
        this.originalImageData.height,
      )
    }

    return cloned
  }

  /**
   * Resize layer canvas
   */
  resize(width: number, height: number): void {
    if (this.locked) {
      throw new Error('Layer is locked')
    }

    // Create temporary canvas with current content
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = this.canvas.width
    tempCanvas.height = this.canvas.height
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.drawImage(this.canvas, 0, 0)

    // Resize main canvas
    this.canvas.width = width
    this.canvas.height = height

    // Redraw content
    this.ctx.drawImage(tempCanvas, 0, 0)

    this.notifyChange()
  }

  /**
   * Get bounding box
   */
  getBoundingBox(): { x: number, y: number, width: number, height: number } {
    const t = this.transform
    const w = this.canvas.width * Math.abs(t.scaleX)
    const h = this.canvas.height * Math.abs(t.scaleY)

    return {
      x: t.x,
      y: t.y,
      width: w,
      height: h,
    }
  }

  /**
   * Check if point is inside layer
   */
  containsPoint(x: number, y: number): boolean {
    const bbox = this.getBoundingBox()
    return (
      x >= bbox.x
      && x <= bbox.x + bbox.width
      && y >= bbox.y
      && y <= bbox.y + bbox.height
    )
  }

  /**
   * Export layer as blob
   */
  async toBlob(type: string = 'image/png', quality: number = 0.95): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          }
          else {
            reject(new Error('Failed to create blob'))
          }
        },
        type,
        quality,
      )
    })
  }

  /**
   * Export layer as data URL
   */
  toDataURL(type: string = 'image/png', quality: number = 0.95): string {
    return this.canvas.toDataURL(type, quality)
  }

  /**
   * Notify layer system of changes
   */
  private notifyChange(): void {
    if (this.layerSystem) {
      this.layerSystem.notifyLayerChange(this)
    }
  }

  /**
   * Get layer info
   */
  getInfo(): {
    id: string
    name: string
    visible: boolean
    opacity: number
    blendMode: BlendMode
    locked: boolean
    width: number
    height: number
    transform: LayerTransform
  } {
    return {
      id: this.id,
      name: this.name,
      visible: this.visible,
      opacity: this.opacity,
      blendMode: this.blendMode,
      locked: this.locked,
      width: this.canvas.width,
      height: this.canvas.height,
      transform: { ...this.transform },
    }
  }

  /**
   * Destroy layer
   */
  destroy(): void {
    this.clear()
    this.originalImageData = null
    this.layerSystem = null
  }
}
