/**
 * Selection System
 * Handles various selection types and operations
 */

import { dispatch } from '../utils/events'

export type SelectionType
  = | 'rectangle'
    | 'ellipse'
    | 'lasso'
    | 'magic-wand'
    | 'polygon'
    | 'brush'

export type SelectionMode
  = | 'new'
    | 'add'
    | 'subtract'
    | 'intersect'

export interface SelectionOptions {
  type?: SelectionType
  mode?: SelectionMode
  feather?: number
  antiAlias?: boolean
  tolerance?: number // For magic wand
  brushSize?: number // For brush selection
}

export interface SelectionPath {
  points: Array<{ x: number, y: number }>
  closed: boolean
}

export class Selection {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private maskCanvas: HTMLCanvasElement
  private maskCtx: CanvasRenderingContext2D
  private options: Required<SelectionOptions>

  // Selection state
  private type: SelectionType
  private mode: SelectionMode
  private isActive = false
  private isDrawing = false

  // Selection data
  private startPoint: { x: number, y: number } | null = null
  private currentPath: SelectionPath = { points: [], closed: false }
  private selectionMask: ImageData | null = null

  // Marching ants animation
  private marchingAntsOffset = 0
  private marchingAntsAnimation: number | null = null

  constructor(width: number, height: number, options: SelectionOptions = {}) {
    this.options = {
      type: options.type || 'rectangle',
      mode: options.mode || 'new',
      feather: options.feather || 0,
      antiAlias: options.antiAlias ?? true,
      tolerance: options.tolerance || 32,
      brushSize: options.brushSize || 20,
    }

    this.type = this.options.type
    this.mode = this.options.mode

    // Create main canvas for drawing selection
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height

    const ctx = this.canvas.getContext('2d', { alpha: true })
    if (!ctx)
      throw new Error('Failed to get canvas context')
    this.ctx = ctx

    // Create mask canvas for selection mask
    this.maskCanvas = document.createElement('canvas')
    this.maskCanvas.width = width
    this.maskCanvas.height = height

    const maskCtx = this.maskCanvas.getContext('2d', { alpha: true })
    if (!maskCtx)
      throw new Error('Failed to get mask context')
    this.maskCtx = maskCtx

    // Initialize selection mask
    this.clearSelection()
  }

  /**
   * Set selection type
   */
  setType(type: SelectionType): void {
    this.type = type
    this.resetDrawing()
  }

  /**
   * Get selection type
   */
  getType(): SelectionType {
    return this.type
  }

  /**
   * Set selection mode
   */
  setMode(mode: SelectionMode): void {
    this.mode = mode
  }

  /**
   * Set brush size
   */
  setBrushSize(size: number): void {
    this.options.brushSize = Math.max(1, Math.min(500, size))
  }

  /**
   * Start drawing selection
   */
  startSelection(x: number, y: number): void {
    this.isDrawing = true
    this.startPoint = { x, y }
    this.currentPath = { points: [{ x, y }], closed: false }

    if (this.mode === 'new') {
      this.clearSelection()
    }

    // Start marching ants animation
    this.startMarchingAnts()

    dispatch(this.canvas, 'selection:start', { x, y, type: this.type })
  }

  /**
   * Update selection while drawing
   */
  updateSelection(x: number, y: number): void {
    if (!this.isDrawing || !this.startPoint)
      return

    // Clear temporary drawing
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    switch (this.type) {
      case 'rectangle':
        this.drawRectangle(this.startPoint.x, this.startPoint.y, x, y)
        break

      case 'ellipse':
        this.drawEllipse(this.startPoint.x, this.startPoint.y, x, y)
        break

      case 'lasso':
      case 'polygon':
        this.currentPath.points.push({ x, y })
        this.drawPath(this.currentPath)
        break

      case 'brush':
        this.drawBrushStroke(x, y)
        break
    }

    dispatch(this.canvas, 'selection:update', { x, y })
  }

  /**
   * End selection drawing
   */
  endSelection(): void {
    if (!this.isDrawing)
      return

    this.isDrawing = false
    this.isActive = true

    // Close path for lasso
    if (this.type === 'lasso') {
      this.currentPath.closed = true
    }

    // Apply selection to mask
    this.applySelectionToMask()

    // Clear temporary drawing
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    dispatch(this.canvas, 'selection:end', {
      type: this.type,
      bounds: this.getSelectionBounds(),
    })
  }

  /**
   * Draw rectangle selection
   */
  private drawRectangle(x1: number, y1: number, x2: number, y2: number): void {
    const x = Math.min(x1, x2)
    const y = Math.min(y1, y2)
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)

    this.ctx.save()
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    this.ctx.lineWidth = 1
    this.ctx.setLineDash([5, 5])
    this.ctx.lineDashOffset = this.marchingAntsOffset

    this.ctx.strokeRect(x, y, width, height)

    // Draw handles
    this.drawHandles(x, y, width, height)

    this.ctx.restore()
  }

  /**
   * Draw ellipse selection
   */
  private drawEllipse(x1: number, y1: number, x2: number, y2: number): void {
    const centerX = (x1 + x2) / 2
    const centerY = (y1 + y2) / 2
    const radiusX = Math.abs(x2 - x1) / 2
    const radiusY = Math.abs(y2 - y1) / 2

    this.ctx.save()
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    this.ctx.lineWidth = 1
    this.ctx.setLineDash([5, 5])
    this.ctx.lineDashOffset = this.marchingAntsOffset

    this.ctx.beginPath()
    this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * Draw path (lasso/polygon)
   */
  private drawPath(path: SelectionPath): void {
    if (path.points.length < 2)
      return

    this.ctx.save()
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    this.ctx.lineWidth = 1
    this.ctx.setLineDash([5, 5])
    this.ctx.lineDashOffset = this.marchingAntsOffset

    this.ctx.beginPath()
    this.ctx.moveTo(path.points[0].x, path.points[0].y)

    for (let i = 1; i < path.points.length; i++) {
      this.ctx.lineTo(path.points[i].x, path.points[i].y)
    }

    if (path.closed) {
      this.ctx.closePath()
    }

    this.ctx.stroke()
    this.ctx.restore()
  }

  /**
   * Draw brush stroke
   */
  private drawBrushStroke(x: number, y: number): void {
    this.maskCtx.save()
    this.maskCtx.globalCompositeOperation
      = this.mode === 'subtract' ? 'destination-out' : 'source-over'

    this.maskCtx.fillStyle = 'white'
    this.maskCtx.beginPath()
    this.maskCtx.arc(x, y, this.options.brushSize / 2, 0, Math.PI * 2)
    this.maskCtx.fill()

    this.maskCtx.restore()
  }

  /**
   * Draw selection handles
   */
  private drawHandles(x: number, y: number, width: number, height: number): void {
    const handleSize = 8
    const handles = [
      { x, y }, // Top-left
      { x: x + width / 2, y }, // Top-center
      { x: x + width, y }, // Top-right
      { x: x + width, y: y + height / 2 }, // Right-center
      { x: x + width, y: y + height }, // Bottom-right
      { x: x + width / 2, y: y + height }, // Bottom-center
      { x, y: y + height }, // Bottom-left
      { x, y: y + height / 2 }, // Left-center
    ]

    this.ctx.fillStyle = 'white'
    this.ctx.strokeStyle = 'black'
    this.ctx.lineWidth = 1

    handles.forEach((handle) => {
      this.ctx.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize,
      )
      this.ctx.strokeRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize,
      )
    })
  }

  /**
   * Apply selection to mask
   */
  private applySelectionToMask(): void {
    if (!this.startPoint)
      return

    this.maskCtx.save()

    // Set composite operation based on mode
    switch (this.mode) {
      case 'new':
        this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height)
        this.maskCtx.globalCompositeOperation = 'source-over'
        break
      case 'add':
        this.maskCtx.globalCompositeOperation = 'source-over'
        break
      case 'subtract':
        this.maskCtx.globalCompositeOperation = 'destination-out'
        break
      case 'intersect':
        this.maskCtx.globalCompositeOperation = 'source-in'
        break
    }

    // Draw selection shape
    this.maskCtx.fillStyle = 'white'

    switch (this.type) {
      case 'rectangle':
        if (this.startPoint) {
          const x = Math.min(this.startPoint.x, this.currentPath.points[0]?.x || 0)
          const y = Math.min(this.startPoint.y, this.currentPath.points[0]?.y || 0)
          const width = Math.abs((this.currentPath.points[0]?.x || 0) - this.startPoint.x)
          const height = Math.abs((this.currentPath.points[0]?.y || 0) - this.startPoint.y)
          this.maskCtx.fillRect(x, y, width, height)
        }
        break

      case 'ellipse':
        if (this.startPoint && this.currentPath.points.length > 0) {
          const centerX = (this.startPoint.x + this.currentPath.points[0].x) / 2
          const centerY = (this.startPoint.y + this.currentPath.points[0].y) / 2
          const radiusX = Math.abs(this.currentPath.points[0].x - this.startPoint.x) / 2
          const radiusY = Math.abs(this.currentPath.points[0].y - this.startPoint.y) / 2

          this.maskCtx.beginPath()
          this.maskCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
          this.maskCtx.fill()
        }
        break

      case 'lasso':
      case 'polygon':
        if (this.currentPath.points.length > 2) {
          this.maskCtx.beginPath()
          this.maskCtx.moveTo(this.currentPath.points[0].x, this.currentPath.points[0].y)

          for (let i = 1; i < this.currentPath.points.length; i++) {
            this.maskCtx.lineTo(this.currentPath.points[i].x, this.currentPath.points[i].y)
          }

          this.maskCtx.closePath()
          this.maskCtx.fill()
        }
        break
    }

    // Apply feathering if needed
    if (this.options.feather > 0) {
      this.applyFeather(this.options.feather)
    }

    this.maskCtx.restore()

    // Update selection mask
    this.selectionMask = this.maskCtx.getImageData(
      0,
      0,
      this.maskCanvas.width,
      this.maskCanvas.height,
    )
  }

  /**
   * Apply feathering to selection
   */
  private applyFeather(radius: number): void {
    // Simple box blur for feathering
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = this.maskCanvas.width
    tempCanvas.height = this.maskCanvas.height
    const tempCtx = tempCanvas.getContext('2d')!

    tempCtx.filter = `blur(${radius}px)`
    tempCtx.drawImage(this.maskCanvas, 0, 0)

    this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height)
    this.maskCtx.drawImage(tempCanvas, 0, 0)
  }

  /**
   * Magic wand selection
   */
  magicWandSelect(
    x: number,
    y: number,
    imageData: ImageData,
    tolerance: number = this.options.tolerance,
  ): void {
    const { width, height, data } = imageData

    // Get target color
    const index = (y * width + x) * 4
    const targetR = data[index]
    const targetG = data[index + 1]
    const targetB = data[index + 2]
    const targetA = data[index + 3]

    // Create selection mask
    const mask = new Uint8ClampedArray(width * height * 4)
    const visited = new Set<number>()
    const queue: Array<[number, number]> = [[x, y]]

    // Flood fill algorithm
    while (queue.length > 0) {
      const [px, py] = queue.shift()!
      const idx = py * width + px

      if (visited.has(idx))
        continue
      if (px < 0 || px >= width || py < 0 || py >= height)
        continue

      visited.add(idx)

      const pidx = idx * 4
      const r = data[pidx]
      const g = data[pidx + 1]
      const b = data[pidx + 2]
      const a = data[pidx + 3]

      // Check color similarity
      const diff = Math.sqrt(
        (r - targetR) ** 2
        + (g - targetG) ** 2
        + (b - targetB) ** 2
        + (a - targetA) ** 2,
      )

      if (diff <= tolerance) {
        // Add to mask
        mask[pidx] = 255
        mask[pidx + 1] = 255
        mask[pidx + 2] = 255
        mask[pidx + 3] = 255

        // Add neighbors to queue
        queue.push([px + 1, py])
        queue.push([px - 1, py])
        queue.push([px, py + 1])
        queue.push([px, py - 1])
      }
    }

    // Apply mask
    const maskImageData = new ImageData(mask, width, height)

    if (this.mode === 'new') {
      this.maskCtx.clearRect(0, 0, width, height)
    }

    this.maskCtx.save()

    switch (this.mode) {
      case 'add':
        this.maskCtx.globalCompositeOperation = 'source-over'
        break
      case 'subtract':
        this.maskCtx.globalCompositeOperation = 'destination-out'
        break
      case 'intersect':
        this.maskCtx.globalCompositeOperation = 'source-in'
        break
    }

    this.maskCtx.putImageData(maskImageData, 0, 0)
    this.maskCtx.restore()

    this.selectionMask = this.maskCtx.getImageData(0, 0, width, height)
    this.isActive = true

    // Start marching ants
    this.startMarchingAnts()

    dispatch(this.canvas, 'selection:magicwand', { x, y, tolerance })
  }

  /**
   * Select all
   */
  selectAll(): void {
    this.maskCtx.fillStyle = 'white'
    this.maskCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height)

    this.selectionMask = this.maskCtx.getImageData(
      0,
      0,
      this.maskCanvas.width,
      this.maskCanvas.height,
    )

    this.isActive = true
    this.startMarchingAnts()

    dispatch(this.canvas, 'selection:all')
  }

  /**
   * Invert selection
   */
  invertSelection(): void {
    if (!this.selectionMask)
      return

    const data = this.selectionMask.data

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]
      data[i + 1] = 255 - data[i + 1]
      data[i + 2] = 255 - data[i + 2]
    }

    this.maskCtx.putImageData(this.selectionMask, 0, 0)

    dispatch(this.canvas, 'selection:invert')
  }

  /**
   * Expand selection
   */
  expandSelection(pixels: number): void {
    if (!this.selectionMask)
      return

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = this.maskCanvas.width
    tempCanvas.height = this.maskCanvas.height
    const tempCtx = tempCanvas.getContext('2d')!

    tempCtx.putImageData(this.selectionMask, 0, 0)

    this.maskCtx.save()
    this.maskCtx.filter = `blur(${pixels}px)`
    this.maskCtx.globalCompositeOperation = 'source-over'
    this.maskCtx.drawImage(tempCanvas, 0, 0)

    // Threshold to binary
    const imageData = this.maskCtx.getImageData(
      0,
      0,
      this.maskCanvas.width,
      this.maskCanvas.height,
    )

    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = imageData.data[i] > 128 ? 255 : 0
      imageData.data[i] = value
      imageData.data[i + 1] = value
      imageData.data[i + 2] = value
    }

    this.maskCtx.putImageData(imageData, 0, 0)
    this.maskCtx.restore()

    this.selectionMask = imageData

    dispatch(this.canvas, 'selection:expand', { pixels })
  }

  /**
   * Contract selection
   */
  contractSelection(pixels: number): void {
    if (!this.selectionMask)
      return

    // Invert, expand, invert again
    this.invertSelection()
    this.expandSelection(pixels)
    this.invertSelection()

    dispatch(this.canvas, 'selection:contract', { pixels })
  }

  /**
   * Get selection bounds
   */
  getSelectionBounds(): { x: number, y: number, width: number, height: number } | null {
    if (!this.selectionMask)
      return null

    const data = this.selectionMask.data
    const width = this.selectionMask.width
    const height = this.selectionMask.height

    let minX = width
    let minY = height
    let maxX = 0
    let maxY = 0

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        if (data[idx + 3] > 0) {
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        }
      }
    }

    if (minX > maxX || minY > maxY)
      return null

    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    }
  }

  /**
   * Check if point is in selection
   */
  isPointInSelection(x: number, y: number): boolean {
    if (!this.selectionMask)
      return false

    const idx = (Math.floor(y) * this.selectionMask.width + Math.floor(x)) * 4
    return this.selectionMask.data[idx + 3] > 128
  }

  /**
   * Get selection mask
   */
  getSelectionMask(): ImageData | null {
    return this.selectionMask
  }

  /**
   * Apply selection as mask to image
   */
  applyMaskToImage(imageData: ImageData): ImageData {
    if (!this.selectionMask)
      return imageData

    const result = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    )

    const maskData = this.selectionMask.data
    const imgData = result.data

    for (let i = 0; i < imgData.length; i += 4) {
      const alpha = maskData[i + 3] / 255
      imgData[i + 3] = Math.round(imgData[i + 3] * alpha)
    }

    return result
  }

  /**
   * Start marching ants animation
   */
  private startMarchingAnts(): void {
    if (this.marchingAntsAnimation)
      return

    const animate = () => {
      this.marchingAntsOffset = (this.marchingAntsOffset + 1) % 10
      this.drawSelectionOutline()
      this.marchingAntsAnimation = requestAnimationFrame(animate)
    }

    animate()
  }

  /**
   * Stop marching ants animation
   */
  private stopMarchingAnts(): void {
    if (this.marchingAntsAnimation) {
      cancelAnimationFrame(this.marchingAntsAnimation)
      this.marchingAntsAnimation = null
    }
  }

  /**
   * Draw selection outline (marching ants)
   */
  private drawSelectionOutline(): void {
    if (!this.selectionMask || !this.isActive)
      return

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Create path from mask edges
    const edges = this.findMaskEdges(this.selectionMask)

    this.ctx.save()
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    this.ctx.lineWidth = 1
    this.ctx.setLineDash([4, 4])
    this.ctx.lineDashOffset = this.marchingAntsOffset

    edges.forEach((edge) => {
      this.ctx.beginPath()
      this.ctx.moveTo(edge[0].x, edge[0].y)

      for (let i = 1; i < edge.length; i++) {
        this.ctx.lineTo(edge[i].x, edge[i].y)
      }

      this.ctx.closePath()
      this.ctx.stroke()
    })

    this.ctx.restore()
  }

  /**
   * Find edges of mask
   */
  private findMaskEdges(mask: ImageData): Array<Array<{ x: number, y: number }>> {
    // Simplified edge detection - returns array of edge paths
    const edges: Array<Array<{ x: number, y: number }>> = []
    const width = mask.width
    const height = mask.height
    const data = mask.data

    // Simple edge detection: check if pixel is on boundary
    const isEdge = (x: number, y: number): boolean => {
      if (x < 0 || x >= width || y < 0 || y >= height)
        return false

      const idx = (y * width + x) * 4
      if (data[idx + 3] < 128)
        return false

      // Check neighbors
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]

      for (const [nx, ny] of neighbors) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height)
          return true

        const nidx = (ny * width + nx) * 4
        if (data[nidx + 3] < 128)
          return true
      }

      return false
    }

    // Find edge points
    const edgePoints: Array<{ x: number, y: number }> = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (isEdge(x, y)) {
          edgePoints.push({ x, y })
        }
      }
    }

    // Group into continuous paths (simplified)
    if (edgePoints.length > 0) {
      edges.push(edgePoints)
    }

    return edges
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.selectionMask = null
    this.isActive = false
    this.isDrawing = false
    this.startPoint = null
    this.currentPath = { points: [], closed: false }

    this.stopMarchingAnts()

    dispatch(this.canvas, 'selection:clear')
  }

  /**
   * Reset drawing state
   */
  private resetDrawing(): void {
    this.isDrawing = false
    this.startPoint = null
    this.currentPath = { points: [], closed: false }
  }

  /**
   * Get selection canvas
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  /**
   * Get mask canvas
   */
  getMaskCanvas(): HTMLCanvasElement {
    return this.maskCanvas
  }

  /**
   * Check if selection is active
   */
  hasSelection(): boolean {
    return this.isActive && this.selectionMask !== null
  }

  /**
   * Resize selection
   */
  resize(width: number, height: number): void {
    // Store current selection
    const currentMask = this.selectionMask

    // Resize canvases
    this.canvas.width = width
    this.canvas.height = height
    this.maskCanvas.width = width
    this.maskCanvas.height = height

    // Restore selection if exists
    if (currentMask) {
      // Scale mask to new size
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = currentMask.width
      tempCanvas.height = currentMask.height
      const tempCtx = tempCanvas.getContext('2d')!
      tempCtx.putImageData(currentMask, 0, 0)

      this.maskCtx.drawImage(
        tempCanvas,
        0,
        0,
        currentMask.width,
        currentMask.height,
        0,
        0,
        width,
        height,
      )

      this.selectionMask = this.maskCtx.getImageData(0, 0, width, height)
    }
  }

  /**
   * Export selection data
   */
  exportSelection(): any {
    return {
      type: this.type,
      mode: this.mode,
      mask: this.selectionMask,
      bounds: this.getSelectionBounds(),
      options: this.options,
    }
  }

  /**
   * Import selection data
   */
  importSelection(data: any): void {
    this.type = data.type
    this.mode = data.mode
    this.options = data.options

    if (data.mask) {
      this.selectionMask = data.mask
      this.maskCtx.putImageData(data.mask, 0, 0)
      this.isActive = true
      this.startMarchingAnts()
    }
  }

  /**
   * Destroy selection
   */
  destroy(): void {
    this.clearSelection()
    this.stopMarchingAnts()
  }
}
