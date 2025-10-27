/**
 * Mask Manager
 * Handles mask creation, editing, and application
 */

import { dispatch } from '../utils/events'
import { Selection } from './Selection'

export interface MaskOptions {
  opacity?: number
  color?: string
  showOverlay?: boolean
  invertMask?: boolean
}

export interface MaskLayer {
  id: string
  name: string
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  visible: boolean
  opacity: number
  inverted: boolean
}

export class MaskManager {
  private container: HTMLElement
  private imageCanvas: HTMLCanvasElement
  private imageCtx: CanvasRenderingContext2D
  private maskCanvas: HTMLCanvasElement
  private maskCtx: CanvasRenderingContext2D
  private overlayCanvas: HTMLCanvasElement
  private overlayCtx: CanvasRenderingContext2D

  private options: Required<MaskOptions>
  private selection: Selection | null = null
  private masks: Map<string, MaskLayer> = new Map()
  private activeMask: MaskLayer | null = null

  // Edit state
  private isEditing = false
  private brushSize = 20
  private brushOpacity = 100
  private brushHardness = 100
  private erasing = false

  constructor(container: HTMLElement, width: number, height: number, options: MaskOptions = {}) {
    this.container = container

    this.options = {
      opacity: options.opacity ?? 50,
      color: options.color || '#ff0000',
      showOverlay: options.showOverlay ?? true,
      invertMask: options.invertMask ?? false
    }

    // Create image canvas (for displaying the masked result)
    this.imageCanvas = document.createElement('canvas')
    this.imageCanvas.width = width
    this.imageCanvas.height = height
    this.imageCanvas.style.position = 'absolute'
    this.imageCanvas.style.pointerEvents = 'none'

    const imageCtx = this.imageCanvas.getContext('2d', { alpha: true })
    if (!imageCtx) throw new Error('Failed to get image context')
    this.imageCtx = imageCtx

    // Create mask canvas
    this.maskCanvas = document.createElement('canvas')
    this.maskCanvas.width = width
    this.maskCanvas.height = height
    this.maskCanvas.style.position = 'absolute'
    this.maskCanvas.style.pointerEvents = 'none'

    const maskCtx = this.maskCanvas.getContext('2d', { alpha: true })
    if (!maskCtx) throw new Error('Failed to get mask context')
    this.maskCtx = maskCtx

    // Create overlay canvas (for showing mask visualization)
    this.overlayCanvas = document.createElement('canvas')
    this.overlayCanvas.width = width
    this.overlayCanvas.height = height
    this.overlayCanvas.style.position = 'absolute'
    this.overlayCanvas.style.pointerEvents = 'none'

    const overlayCtx = this.overlayCanvas.getContext('2d', { alpha: true })
    if (!overlayCtx) throw new Error('Failed to get overlay context')
    this.overlayCtx = overlayCtx

    // Add canvases to container
    this.container.appendChild(this.imageCanvas)
    this.container.appendChild(this.overlayCanvas)

    // Initialize selection
    this.selection = new Selection(width, height)
  }

  /**
   * Create mask from selection
   */
  createMaskFromSelection(): MaskLayer | null {
    if (!this.selection || !this.selection.hasSelection()) {
      console.warn('No active selection to create mask from')
      return null
    }

    const selectionMask = this.selection.getSelectionMask()
    if (!selectionMask) return null

    const maskId = `mask_${Date.now()}`
    const maskLayer = this.createMaskLayer(maskId, 'Selection Mask')

    // Copy selection data to mask
    maskLayer.ctx.putImageData(selectionMask, 0, 0)

    this.masks.set(maskId, maskLayer)
    this.activeMask = maskLayer

    // Clear selection after creating mask
    this.selection.clearSelection()

    // Update display
    this.updateMaskDisplay()

    dispatch(this.container, 'mask:created', { id: maskId, fromSelection: true })

    return maskLayer
  }

  /**
   * Create empty mask layer
   */
  private createMaskLayer(id: string, name: string): MaskLayer {
    const canvas = document.createElement('canvas')
    canvas.width = this.maskCanvas.width
    canvas.height = this.maskCanvas.height

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) throw new Error('Failed to get mask context')

    // Initialize with transparent black
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    return {
      id,
      name,
      canvas,
      ctx,
      visible: true,
      opacity: 100,
      inverted: false
    }
  }

  /**
   * Add new mask
   */
  addMask(name: string = 'New Mask'): MaskLayer {
    const maskId = `mask_${Date.now()}`
    const maskLayer = this.createMaskLayer(maskId, name)

    this.masks.set(maskId, maskLayer)
    this.activeMask = maskLayer

    this.updateMaskDisplay()

    dispatch(this.container, 'mask:added', { id: maskId, name })

    return maskLayer
  }

  /**
   * Remove mask
   */
  removeMask(id: string): boolean {
    const mask = this.masks.get(id)
    if (!mask) return false

    this.masks.delete(id)

    if (this.activeMask?.id === id) {
      // Set next available mask as active
      this.activeMask = this.masks.size > 0
        ? Array.from(this.masks.values())[0]
        : null
    }

    this.updateMaskDisplay()

    dispatch(this.container, 'mask:removed', { id })

    return true
  }

  /**
   * Set active mask
   */
  setActiveMask(id: string): boolean {
    const mask = this.masks.get(id)
    if (!mask) return false

    this.activeMask = mask
    this.updateMaskDisplay()

    dispatch(this.container, 'mask:activated', { id })

    return true
  }

  /**
   * Start mask editing
   */
  startEditing(): void {
    this.isEditing = true

    // Enable pointer events for editing
    this.overlayCanvas.style.pointerEvents = 'auto'

    // Add event listeners
    this.overlayCanvas.addEventListener('mousedown', this.handleMouseDown)
    this.overlayCanvas.addEventListener('mousemove', this.handleMouseMove)
    this.overlayCanvas.addEventListener('mouseup', this.handleMouseUp)
    this.overlayCanvas.addEventListener('mouseleave', this.handleMouseUp)

    dispatch(this.container, 'mask:edit:start')
  }

  /**
   * Stop mask editing
   */
  stopEditing(): void {
    this.isEditing = false

    // Disable pointer events
    this.overlayCanvas.style.pointerEvents = 'none'

    // Remove event listeners
    this.overlayCanvas.removeEventListener('mousedown', this.handleMouseDown)
    this.overlayCanvas.removeEventListener('mousemove', this.handleMouseMove)
    this.overlayCanvas.removeEventListener('mouseup', this.handleMouseUp)
    this.overlayCanvas.removeEventListener('mouseleave', this.handleMouseUp)

    dispatch(this.container, 'mask:edit:stop')
  }

  /**
   * Paint on mask
   */
  private paintOnMask = (x: number, y: number, isDrawing: boolean) => {
    if (!this.activeMask || !isDrawing) return

    const ctx = this.activeMask.ctx

    ctx.save()
    ctx.globalCompositeOperation = this.erasing ? 'destination-out' : 'source-over'

    // Calculate brush gradient for hardness
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.brushSize)

    if (this.brushHardness < 100) {
      const hardness = this.brushHardness / 100
      gradient.addColorStop(0, `rgba(255, 255, 255, ${this.brushOpacity / 100})`)
      gradient.addColorStop(hardness, `rgba(255, 255, 255, ${this.brushOpacity / 100})`)
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    } else {
      gradient.addColorStop(0, `rgba(255, 255, 255, ${this.brushOpacity / 100})`)
      gradient.addColorStop(1, `rgba(255, 255, 255, ${this.brushOpacity / 100})`)
    }

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, this.brushSize, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    this.updateMaskDisplay()
  }

  /**
   * Handle mouse down
   */
  private handleMouseDown = (event: MouseEvent) => {
    if (!this.isEditing || !this.activeMask) return

    const rect = this.overlayCanvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    this.paintOnMask(x, y, true)

    dispatch(this.container, 'mask:paint:start', { x, y })
  }

  /**
   * Handle mouse move
   */
  private handleMouseMove = (event: MouseEvent) => {
    if (!this.isEditing || !this.activeMask) return

    const rect = this.overlayCanvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (event.buttons === 1) { // Left button pressed
      this.paintOnMask(x, y, true)
    }

    // Show brush cursor
    this.showBrushCursor(x, y)
  }

  /**
   * Handle mouse up
   */
  private handleMouseUp = (event: MouseEvent) => {
    if (!this.isEditing) return

    dispatch(this.container, 'mask:paint:end')
  }

  /**
   * Show brush cursor
   */
  private showBrushCursor(x: number, y: number): void {
    this.overlayCtx.save()

    // Clear previous cursor
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height)

    // Draw current mask overlay
    if (this.options.showOverlay) {
      this.drawMaskOverlay()
    }

    // Draw brush cursor
    this.overlayCtx.strokeStyle = this.erasing ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'
    this.overlayCtx.lineWidth = 1
    this.overlayCtx.beginPath()
    this.overlayCtx.arc(x, y, this.brushSize, 0, Math.PI * 2)
    this.overlayCtx.stroke()

    // Draw center point
    this.overlayCtx.fillStyle = this.overlayCtx.strokeStyle
    this.overlayCtx.beginPath()
    this.overlayCtx.arc(x, y, 2, 0, Math.PI * 2)
    this.overlayCtx.fill()

    this.overlayCtx.restore()
  }

  /**
   * Set brush properties
   */
  setBrushSize(size: number): void {
    this.brushSize = Math.max(1, Math.min(500, size))
    dispatch(this.container, 'mask:brush:size', { size: this.brushSize })
  }

  setBrushOpacity(opacity: number): void {
    this.brushOpacity = Math.max(0, Math.min(100, opacity))
    dispatch(this.container, 'mask:brush:opacity', { opacity: this.brushOpacity })
  }

  setBrushHardness(hardness: number): void {
    this.brushHardness = Math.max(0, Math.min(100, hardness))
    dispatch(this.container, 'mask:brush:hardness', { hardness: this.brushHardness })
  }

  setErasing(erasing: boolean): void {
    this.erasing = erasing
    dispatch(this.container, 'mask:brush:mode', { erasing })
  }

  /**
   * Apply mask to image
   */
  applyMaskToImage(imageData: ImageData): ImageData {
    if (!this.activeMask) return imageData

    const maskData = this.activeMask.ctx.getImageData(
      0, 0,
      this.activeMask.canvas.width,
      this.activeMask.canvas.height
    )

    const result = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    )

    const imgData = result.data
    const mskData = maskData.data

    for (let i = 0; i < imgData.length; i += 4) {
      // Use mask alpha channel to determine opacity
      let maskAlpha = mskData[i + 3] / 255

      if (this.activeMask.inverted) {
        maskAlpha = 1 - maskAlpha
      }

      // Apply mask opacity
      maskAlpha *= this.activeMask.opacity / 100

      // Apply to image alpha
      imgData[i + 3] = Math.round(imgData[i + 3] * maskAlpha)
    }

    return result
  }

  /**
   * Update mask display
   */
  private updateMaskDisplay(): void {
    // Clear overlay
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height)

    if (!this.activeMask) return

    // Composite all visible masks
    this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height)

    this.masks.forEach(mask => {
      if (!mask.visible) return

      this.maskCtx.save()
      this.maskCtx.globalAlpha = mask.opacity / 100

      if (mask.inverted) {
        // Invert mask
        this.maskCtx.globalCompositeOperation = 'source-over'
        this.maskCtx.fillStyle = 'white'
        this.maskCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height)
        this.maskCtx.globalCompositeOperation = 'destination-out'
      }

      this.maskCtx.drawImage(mask.canvas, 0, 0)
      this.maskCtx.restore()
    })

    // Draw mask overlay if enabled
    if (this.options.showOverlay) {
      this.drawMaskOverlay()
    }

    dispatch(this.container, 'mask:updated')
  }

  /**
   * Draw mask overlay visualization
   */
  private drawMaskOverlay(): void {
    if (!this.activeMask) return

    const maskData = this.maskCtx.getImageData(
      0, 0,
      this.maskCanvas.width,
      this.maskCanvas.height
    )

    // Create colored overlay
    const overlayData = this.overlayCtx.createImageData(
      this.overlayCanvas.width,
      this.overlayCanvas.height
    )

    // Parse color
    const color = this.hexToRgb(this.options.color)
    if (!color) return

    for (let i = 0; i < overlayData.data.length; i += 4) {
      const maskAlpha = maskData.data[i + 3] / 255

      overlayData.data[i] = color.r
      overlayData.data[i + 1] = color.g
      overlayData.data[i + 2] = color.b
      overlayData.data[i + 3] = Math.round(maskAlpha * (this.options.opacity / 100) * 255)
    }

    this.overlayCtx.putImageData(overlayData, 0, 0)
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  /**
   * Quick mask mode (toggle)
   */
  toggleQuickMask(): void {
    this.options.showOverlay = !this.options.showOverlay
    this.updateMaskDisplay()

    dispatch(this.container, 'mask:quickmask', { enabled: this.options.showOverlay })
  }

  /**
   * Invert mask
   */
  invertMask(id?: string): void {
    const mask = id ? this.masks.get(id) : this.activeMask
    if (!mask) return

    mask.inverted = !mask.inverted
    this.updateMaskDisplay()

    dispatch(this.container, 'mask:inverted', { id: mask.id, inverted: mask.inverted })
  }

  /**
   * Blur mask
   */
  blurMask(radius: number, id?: string): void {
    const mask = id ? this.masks.get(id) : this.activeMask
    if (!mask) return

    // Apply blur filter
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = mask.canvas.width
    tempCanvas.height = mask.canvas.height
    const tempCtx = tempCanvas.getContext('2d')!

    tempCtx.filter = `blur(${radius}px)`
    tempCtx.drawImage(mask.canvas, 0, 0)

    mask.ctx.clearRect(0, 0, mask.canvas.width, mask.canvas.height)
    mask.ctx.drawImage(tempCanvas, 0, 0)

    this.updateMaskDisplay()

    dispatch(this.container, 'mask:blurred', { id: mask.id, radius })
  }

  /**
   * Refine mask edge
   */
  refineMaskEdge(options: {
    radius?: number
    smooth?: number
    feather?: number
    contrast?: number
  }, id?: string): void {
    const mask = id ? this.masks.get(id) : this.activeMask
    if (!mask) return

    const { radius = 2, smooth = 1, feather = 0, contrast = 0 } = options

    // Get mask data
    let imageData = mask.ctx.getImageData(0, 0, mask.canvas.width, mask.canvas.height)

    // Apply refinements
    if (smooth > 0) {
      imageData = this.smoothMask(imageData, smooth)
    }

    if (feather > 0) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = mask.canvas.width
      tempCanvas.height = mask.canvas.height
      const tempCtx = tempCanvas.getContext('2d')!

      tempCtx.putImageData(imageData, 0, 0)

      mask.ctx.clearRect(0, 0, mask.canvas.width, mask.canvas.height)
      mask.ctx.filter = `blur(${feather}px)`
      mask.ctx.drawImage(tempCanvas, 0, 0)

      imageData = mask.ctx.getImageData(0, 0, mask.canvas.width, mask.canvas.height)
    }

    if (contrast !== 0) {
      imageData = this.adjustMaskContrast(imageData, contrast)
    }

    // Apply back to mask
    mask.ctx.putImageData(imageData, 0, 0)

    this.updateMaskDisplay()

    dispatch(this.container, 'mask:refined', { id: mask.id, options })
  }

  /**
   * Smooth mask edges
   */
  private smoothMask(imageData: ImageData, iterations: number): ImageData {
    const { width, height, data } = imageData
    const result = new Uint8ClampedArray(data)

    for (let iter = 0; iter < iterations; iter++) {
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4 + 3 // Alpha channel

          // Average with neighbors
          let sum = 0
          let count = 0

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nidx = ((y + dy) * width + (x + dx)) * 4 + 3
              sum += data[nidx]
              count++
            }
          }

          result[idx] = Math.round(sum / count)
        }
      }

      // Copy result back for next iteration
      data.set(result)
    }

    return new ImageData(result, width, height)
  }

  /**
   * Adjust mask contrast
   */
  private adjustMaskContrast(imageData: ImageData, contrast: number): ImageData {
    const { data } = imageData
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))

    for (let i = 3; i < data.length; i += 4) {
      data[i] = Math.round(factor * (data[i] - 128) + 128)
      data[i] = Math.max(0, Math.min(255, data[i]))
    }

    return imageData
  }

  /**
   * Clear mask
   */
  clearMask(id?: string): void {
    const mask = id ? this.masks.get(id) : this.activeMask
    if (!mask) return

    mask.ctx.clearRect(0, 0, mask.canvas.width, mask.canvas.height)
    this.updateMaskDisplay()

    dispatch(this.container, 'mask:cleared', { id: mask.id })
  }

  /**
   * Fill mask
   */
  fillMask(id?: string): void {
    const mask = id ? this.masks.get(id) : this.activeMask
    if (!mask) return

    mask.ctx.fillStyle = 'white'
    mask.ctx.fillRect(0, 0, mask.canvas.width, mask.canvas.height)
    this.updateMaskDisplay()

    dispatch(this.container, 'mask:filled', { id: mask.id })
  }

  /**
   * Set selection instance
   */
  setSelection(selection: Selection): void {
    this.selection = selection
  }

  /**
   * Get selection
   */
  getSelection(): Selection | null {
    return this.selection
  }

  /**
   * Get all masks
   */
  getMasks(): MaskLayer[] {
    return Array.from(this.masks.values())
  }

  /**
   * Get active mask
   */
  getActiveMask(): MaskLayer | null {
    return this.activeMask
  }

  /**
   * Export mask data
   */
  exportMask(id?: string): ImageData | null {
    const mask = id ? this.masks.get(id) : this.activeMask
    if (!mask) return null

    return mask.ctx.getImageData(0, 0, mask.canvas.width, mask.canvas.height)
  }

  /**
   * Import mask data
   */
  importMask(imageData: ImageData, name: string = 'Imported Mask'): MaskLayer {
    const maskLayer = this.addMask(name)
    maskLayer.ctx.putImageData(imageData, 0, 0)

    this.updateMaskDisplay()

    return maskLayer
  }

  /**
   * Resize masks
   */
  resize(width: number, height: number): void {
    // Resize all canvases
    this.imageCanvas.width = width
    this.imageCanvas.height = height
    this.maskCanvas.width = width
    this.maskCanvas.height = height
    this.overlayCanvas.width = width
    this.overlayCanvas.height = height

    // Resize all masks
    this.masks.forEach(mask => {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = mask.canvas.width
      tempCanvas.height = mask.canvas.height
      const tempCtx = tempCanvas.getContext('2d')!
      tempCtx.drawImage(mask.canvas, 0, 0)

      mask.canvas.width = width
      mask.canvas.height = height

      mask.ctx.drawImage(
        tempCanvas,
        0, 0, tempCanvas.width, tempCanvas.height,
        0, 0, width, height
      )
    })

    // Resize selection
    if (this.selection) {
      this.selection.resize(width, height)
    }

    this.updateMaskDisplay()
  }

  /**
   * Destroy mask manager
   */
  destroy(): void {
    // Stop editing if active
    if (this.isEditing) {
      this.stopEditing()
    }

    // Clear all masks
    this.masks.clear()
    this.activeMask = null

    // Destroy selection
    if (this.selection) {
      this.selection.destroy()
    }

    // Remove canvases
    this.container.removeChild(this.imageCanvas)
    this.container.removeChild(this.overlayCanvas)
  }
}

