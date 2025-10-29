/**
 * Drawing Engine
 * Canvas-based drawing layer with undo/redo support
 */

import { canvasPool } from '../utils/performance'

export interface DrawingLayer {
  id: string
  name: string
  canvas: HTMLCanvasElement
  visible: boolean
  opacity: number
}

export interface DrawingState {
  imageData: ImageData
  timestamp: number
}

export interface DrawingEngineOptions {
  width: number
  height: number
  maxHistorySize?: number
}

export class DrawingEngine {
  private width: number
  private height: number
  private layers: DrawingLayer[] = []
  private activeLayerId: string | null = null
  private history: DrawingState[] = []
  private historyIndex: number = -1
  private maxHistorySize: number

  constructor(options: DrawingEngineOptions) {
    this.width = options.width
    this.height = options.height
    this.maxHistorySize = options.maxHistorySize || 50

    // Create default layer
    this.addLayer('Background')
    this.activeLayerId = this.layers[0].id
  }

  /**
   * Add new layer
   */
  addLayer(name: string): string {
    const id = `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const canvas = canvasPool.acquire(this.width, this.height)

    const layer: DrawingLayer = {
      id,
      name,
      canvas,
      visible: true,
      opacity: 1,
    }

    this.layers.push(layer)
    return id
  }

  /**
   * Remove layer
   */
  removeLayer(id: string): boolean {
    const index = this.layers.findIndex(l => l.id === id)
    if (index === -1 || this.layers.length === 1)
      return false

    const layer = this.layers[index]
    canvasPool.release(layer.canvas)
    this.layers.splice(index, 1)

    if (this.activeLayerId === id) {
      this.activeLayerId = this.layers[0].id
    }

    return true
  }

  /**
   * Get layer by ID
   */
  getLayer(id: string): DrawingLayer | undefined {
    return this.layers.find(l => l.id === id)
  }

  /**
   * Get all layers
   */
  getLayers(): DrawingLayer[] {
    return [...this.layers]
  }

  /**
   * Set active layer
   */
  setActiveLayer(id: string): boolean {
    if (!this.layers.find(l => l.id === id))
      return false
    this.activeLayerId = id
    return true
  }

  /**
   * Get active layer
   */
  getActiveLayer(): DrawingLayer | null {
    if (!this.activeLayerId)
      return null
    return this.layers.find(l => l.id === this.activeLayerId) || null
  }

  /**
   * Set layer visibility
   */
  setLayerVisibility(id: string, visible: boolean): boolean {
    const layer = this.layers.find(l => l.id === id)
    if (!layer)
      return false

    layer.visible = visible
    return true
  }

  /**
   * Set layer opacity
   */
  setLayerOpacity(id: string, opacity: number): boolean {
    const layer = this.layers.find(l => l.id === id)
    if (!layer)
      return false

    layer.opacity = Math.max(0, Math.min(1, opacity))
    return true
  }

  /**
   * Merge all layers into single canvas
   */
  mergeLayersToCanvas(): HTMLCanvasElement {
    const output = document.createElement('canvas')
    output.width = this.width
    output.height = this.height

    const ctx = output.getContext('2d')
    if (!ctx)
      return output

    // Draw layers from bottom to top
    for (const layer of this.layers) {
      if (!layer.visible)
        continue

      ctx.globalAlpha = layer.opacity
      ctx.drawImage(layer.canvas, 0, 0)
    }

    ctx.globalAlpha = 1
    return output
  }

  /**
   * Save current state to history
   */
  saveState(): void {
    const activeLayer = this.getActiveLayer()
    if (!activeLayer)
      return

    const ctx = activeLayer.canvas.getContext('2d')
    if (!ctx)
      return

    const imageData = ctx.getImageData(0, 0, this.width, this.height)

    // Remove any states after current index
    this.history = this.history.slice(0, this.historyIndex + 1)

    // Add new state
    this.history.push({
      imageData: new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height,
      ),
      timestamp: Date.now(),
    })

    this.historyIndex++

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.historyIndex--
    }
  }

  /**
   * Undo
   */
  undo(): boolean {
    if (this.historyIndex <= 0)
      return false

    this.historyIndex--
    this.restoreState(this.history[this.historyIndex])
    return true
  }

  /**
   * Redo
   */
  redo(): boolean {
    if (this.historyIndex >= this.history.length - 1)
      return false

    this.historyIndex++
    this.restoreState(this.history[this.historyIndex])
    return true
  }

  /**
   * Restore state
   */
  private restoreState(state: DrawingState): void {
    const activeLayer = this.getActiveLayer()
    if (!activeLayer)
      return

    const ctx = activeLayer.canvas.getContext('2d')
    if (!ctx)
      return

    ctx.putImageData(state.imageData, 0, 0)
  }

  /**
   * Can undo
   */
  canUndo(): boolean {
    return this.historyIndex > 0
  }

  /**
   * Can redo
   */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  /**
   * Clear active layer
   */
  clear(): void {
    const activeLayer = this.getActiveLayer()
    if (!activeLayer)
      return

    const ctx = activeLayer.canvas.getContext('2d')
    if (!ctx)
      return

    ctx.clearRect(0, 0, this.width, this.height)
    this.saveState()
  }

  /**
   * Clear all layers
   */
  clearAll(): void {
    this.layers.forEach((layer) => {
      const ctx = layer.canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, this.width, this.height)
      }
    })

    this.history = []
    this.historyIndex = -1
  }

  /**
   * Destroy drawing engine
   */
  destroy(): void {
    this.layers.forEach((layer) => {
      canvasPool.release(layer.canvas)
    })

    this.layers = []
    this.history = []
    this.activeLayerId = null
    this.historyIndex = -1
  }
}
