/**
 * Virtual Canvas
 * Implements virtual scrolling for large images
 * Only renders visible portions to optimize performance
 */

import { raf, cancelRaf } from '../utils/performance'
import { clamp } from '../utils/math'
import { IMAGE, MEMORY } from '../config/constants'

export interface VirtualCanvasOptions {
  tileSize?: number
  bufferSize?: number  // Extra tiles to render outside viewport
  maxMemory?: number
  smoothScrolling?: boolean
  adaptiveQuality?: boolean
  debug?: boolean
}

export interface Viewport {
  x: number
  y: number
  width: number
  height: number
  scale: number
}

export interface Tile {
  x: number
  y: number
  width: number
  height: number
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
  loaded: boolean
  lastUsed: number
  quality: number
}

export class VirtualCanvas {
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private image: HTMLImageElement | null = null
  private options: VirtualCanvasOptions

  // Viewport properties
  private viewport: Viewport = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1
  }

  // Tile management
  private tiles: Map<string, Tile> = new Map()
  private tileSize: number
  private bufferSize: number
  private visibleTiles: Set<string> = new Set()

  // Performance
  private rafId: number | null = null
  private lastRenderTime: number = 0
  private renderQueue: Set<string> = new Set()
  private memoryUsage: number = 0
  private maxMemory: number

  // Quality adaptation
  private currentQuality: number = 1
  private targetQuality: number = 1
  private qualityTransition: number = 0

  constructor(container: HTMLElement, options: VirtualCanvasOptions = {}) {
    this.container = container
    this.options = {
      tileSize: IMAGE.PROGRESSIVE_CHUNK_SIZE,
      bufferSize: 1,
      maxMemory: MEMORY.MAX_MEMORY_USAGE,
      smoothScrolling: true,
      adaptiveQuality: true,
      debug: false,
      ...options
    }

    this.tileSize = this.options.tileSize!
    this.bufferSize = this.options.bufferSize!
    this.maxMemory = this.options.maxMemory!

    // Create main canvas
    this.canvas = document.createElement('canvas')
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.imageRendering = 'auto'
    this.container.appendChild(this.canvas)

    const ctx = this.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    })

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    this.ctx = ctx

    // Initialize viewport
    this.updateViewport()

    // Set up resize observer
    this.setupResizeObserver()
  }

  /**
   * Load image
   */
  async loadImage(src: string | HTMLImageElement): Promise<void> {
    if (typeof src === 'string') {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = src
      })

      this.image = img
    } else {
      this.image = src
    }

    // Clear existing tiles
    this.clearTiles()

    // Update viewport
    this.updateViewport()

    // Initial render
    this.render()
  }

  /**
   * Set viewport
   */
  setViewport(x: number, y: number, scale: number): void {
    const changed = (
      this.viewport.x !== x ||
      this.viewport.y !== y ||
      this.viewport.scale !== scale
    )

    if (!changed) return

    this.viewport.x = x
    this.viewport.y = y
    this.viewport.scale = scale

    // Adaptive quality during movement
    if (this.options.adaptiveQuality) {
      this.targetQuality = scale < 0.5 ? 0.5 : scale > 2 ? 2 : 1
    }

    this.scheduleRender()
  }

  /**
   * Get viewport
   */
  getViewport(): Viewport {
    return { ...this.viewport }
  }

  /**
   * Update viewport dimensions
   */
  private updateViewport(): void {
    const rect = this.container.getBoundingClientRect()
    this.viewport.width = rect.width
    this.viewport.height = rect.height

    // Update canvas size
    this.canvas.width = rect.width * window.devicePixelRatio
    this.canvas.height = rect.height * window.devicePixelRatio
    this.canvas.style.width = `${rect.width}px`
    this.canvas.style.height = `${rect.height}px`

    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  }

  /**
   * Set up resize observer
   */
  private setupResizeObserver(): void {
    const resizeObserver = new ResizeObserver(() => {
      this.updateViewport()
      this.scheduleRender()
    })

    resizeObserver.observe(this.container)
  }

  /**
   * Schedule render
   */
  private scheduleRender(): void {
    if (this.rafId !== null) return

    this.rafId = raf(() => {
      this.rafId = null
      this.render()
    })
  }

  /**
   * Render visible tiles
   */
  private render(): void {
    if (!this.image) return

    const startTime = performance.now()

    // Clear canvas
    this.ctx.clearRect(0, 0, this.viewport.width, this.viewport.height)

    // Update quality smoothly
    if (this.options.smoothScrolling && this.currentQuality !== this.targetQuality) {
      const delta = this.targetQuality - this.currentQuality
      this.currentQuality += delta * 0.1

      if (Math.abs(delta) < 0.01) {
        this.currentQuality = this.targetQuality
      } else {
        this.scheduleRender()
      }
    }

    // Calculate visible tiles
    const visibleTiles = this.calculateVisibleTiles()

    // Update tile visibility
    this.updateTileVisibility(visibleTiles)

    // Render tiles
    for (const tileKey of visibleTiles) {
      this.renderTile(tileKey)
    }

    // Debug info
    if (this.options.debug) {
      this.renderDebugInfo()
    }

    // Memory management
    this.manageMemory()

    this.lastRenderTime = performance.now() - startTime
  }

  /**
   * Calculate visible tiles
   */
  private calculateVisibleTiles(): Set<string> {
    if (!this.image) return new Set()

    const scale = this.viewport.scale
    const tileSize = this.tileSize

    // Calculate visible area in image coordinates
    const viewLeft = this.viewport.x / scale
    const viewTop = this.viewport.y / scale
    const viewRight = (this.viewport.x + this.viewport.width) / scale
    const viewBottom = (this.viewport.y + this.viewport.height) / scale

    // Add buffer
    const buffer = tileSize * this.bufferSize
    const startCol = Math.floor((viewLeft - buffer) / tileSize)
    const endCol = Math.ceil((viewRight + buffer) / tileSize)
    const startRow = Math.floor((viewTop - buffer) / tileSize)
    const endRow = Math.ceil((viewBottom + buffer) / tileSize)

    // Calculate tile grid bounds
    const maxCol = Math.ceil(this.image.width / tileSize)
    const maxRow = Math.ceil(this.image.height / tileSize)

    const visibleTiles = new Set<string>()

    for (let row = Math.max(0, startRow); row < Math.min(maxRow, endRow); row++) {
      for (let col = Math.max(0, startCol); col < Math.min(maxCol, endCol); col++) {
        visibleTiles.add(`${col},${row}`)
      }
    }

    return visibleTiles
  }

  /**
   * Update tile visibility
   */
  private updateTileVisibility(newVisible: Set<string>): void {
    // Find tiles that are no longer visible
    for (const tileKey of this.visibleTiles) {
      if (!newVisible.has(tileKey)) {
        const tile = this.tiles.get(tileKey)
        if (tile) {
          tile.lastUsed = Date.now()
        }
      }
    }

    this.visibleTiles = newVisible
  }

  /**
   * Render single tile
   */
  private renderTile(tileKey: string): void {
    if (!this.image) return

    let tile = this.tiles.get(tileKey)

    // Create tile if it doesn't exist
    if (!tile) {
      const [col, row] = tileKey.split(',').map(Number)
      tile = this.createTile(col, row)
      this.tiles.set(tileKey, tile)
    }

    // Load tile if not loaded
    if (!tile.loaded) {
      this.loadTile(tile)
      return
    }

    // Skip if no canvas
    if (!tile.canvas) return

    // Calculate render position
    const scale = this.viewport.scale
    const x = tile.x * scale - this.viewport.x
    const y = tile.y * scale - this.viewport.y
    const width = tile.width * scale
    const height = tile.height * scale

    // Skip if outside viewport
    if (x + width < 0 || y + height < 0 || x > this.viewport.width || y > this.viewport.height) {
      return
    }

    // Apply quality
    this.ctx.imageSmoothingEnabled = this.currentQuality > 0.5
    this.ctx.imageSmoothingQuality = this.currentQuality > 1 ? 'high' : 'medium'

    // Draw tile
    this.ctx.drawImage(
      tile.canvas,
      0, 0, tile.canvas.width, tile.canvas.height,
      x, y, width, height
    )
  }

  /**
   * Create tile
   */
  private createTile(col: number, row: number): Tile {
    if (!this.image) throw new Error('No image loaded')

    const x = col * this.tileSize
    const y = row * this.tileSize
    const width = Math.min(this.tileSize, this.image.width - x)
    const height = Math.min(this.tileSize, this.image.height - y)

    return {
      x,
      y,
      width,
      height,
      canvas: null,
      ctx: null,
      loaded: false,
      lastUsed: Date.now(),
      quality: 1
    }
  }

  /**
   * Load tile
   */
  private async loadTile(tile: Tile): Promise<void> {
    if (!this.image || tile.loaded) return

    // Create canvas
    tile.canvas = document.createElement('canvas')
    tile.canvas.width = tile.width
    tile.canvas.height = tile.height

    const ctx = tile.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    })

    if (!ctx) {
      console.error('Failed to get tile context')
      return
    }

    tile.ctx = ctx

    // Draw image portion
    ctx.drawImage(
      this.image,
      tile.x, tile.y, tile.width, tile.height,
      0, 0, tile.width, tile.height
    )

    tile.loaded = true
    tile.lastUsed = Date.now()

    // Update memory usage
    this.memoryUsage += tile.width * tile.height * 4

    // Schedule render
    this.scheduleRender()
  }

  /**
   * Manage memory
   */
  private manageMemory(): void {
    if (this.memoryUsage <= this.maxMemory) return

    // Sort tiles by last used time
    const sortedTiles = Array.from(this.tiles.entries())
      .filter(([key, tile]) => !this.visibleTiles.has(key) && tile.loaded)
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed)

    // Remove oldest tiles until under memory limit
    for (const [key, tile] of sortedTiles) {
      if (this.memoryUsage <= this.maxMemory * 0.8) break

      this.unloadTile(key, tile)
    }
  }

  /**
   * Unload tile
   */
  private unloadTile(key: string, tile: Tile): void {
    if (!tile.loaded || !tile.canvas) return

    // Clear canvas
    if (tile.ctx) {
      tile.ctx.clearRect(0, 0, tile.canvas.width, tile.canvas.height)
    }

    // Update memory usage
    this.memoryUsage -= tile.width * tile.height * 4

    // Reset tile
    tile.canvas = null
    tile.ctx = null
    tile.loaded = false

    // Remove from map if far from viewport
    const [col, row] = key.split(',').map(Number)
    const distance = Math.max(
      Math.abs(col - this.viewport.x / this.tileSize),
      Math.abs(row - this.viewport.y / this.tileSize)
    )

    if (distance > this.bufferSize * 3) {
      this.tiles.delete(key)
    }
  }

  /**
   * Clear all tiles
   */
  private clearTiles(): void {
    for (const [key, tile] of this.tiles) {
      this.unloadTile(key, tile)
    }

    this.tiles.clear()
    this.visibleTiles.clear()
    this.memoryUsage = 0
  }

  /**
   * Render debug info
   */
  private renderDebugInfo(): void {
    const info = [
      `Tiles: ${this.visibleTiles.size}/${this.tiles.size}`,
      `Memory: ${(this.memoryUsage / 1024 / 1024).toFixed(1)}MB`,
      `Render: ${this.lastRenderTime.toFixed(1)}ms`,
      `Quality: ${this.currentQuality.toFixed(2)}`,
      `Scale: ${this.viewport.scale.toFixed(2)}`
    ]

    this.ctx.save()
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.ctx.fillRect(10, 10, 200, info.length * 20 + 20)

    this.ctx.fillStyle = '#00ff00'
    this.ctx.font = '14px monospace'

    info.forEach((line, i) => {
      this.ctx.fillText(line, 20, 30 + i * 20)
    })

    this.ctx.restore()

    // Draw tile grid
    if (this.image) {
      this.ctx.save()
      this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
      this.ctx.lineWidth = 1

      for (const tileKey of this.visibleTiles) {
        const tile = this.tiles.get(tileKey)
        if (!tile) continue

        const x = tile.x * this.viewport.scale - this.viewport.x
        const y = tile.y * this.viewport.scale - this.viewport.y
        const width = tile.width * this.viewport.scale
        const height = tile.height * this.viewport.scale

        this.ctx.strokeRect(x, y, width, height)
      }

      this.ctx.restore()
    }
  }

  /**
   * Pan viewport
   */
  pan(deltaX: number, deltaY: number): void {
    if (!this.image) return

    const maxX = Math.max(0, this.image.width * this.viewport.scale - this.viewport.width)
    const maxY = Math.max(0, this.image.height * this.viewport.scale - this.viewport.height)

    this.setViewport(
      clamp(this.viewport.x + deltaX, 0, maxX),
      clamp(this.viewport.y + deltaY, 0, maxY),
      this.viewport.scale
    )
  }

  /**
   * Zoom viewport
   */
  zoom(scale: number, centerX?: number, centerY?: number): void {
    if (!this.image) return

    const newScale = clamp(scale, 0.1, 10)

    // Default to viewport center
    if (centerX === undefined) centerX = this.viewport.width / 2
    if (centerY === undefined) centerY = this.viewport.height / 2

    // Calculate new position to keep center point fixed
    const dx = centerX / this.viewport.scale - centerX / newScale
    const dy = centerY / this.viewport.scale - centerY / newScale

    const maxX = Math.max(0, this.image.width * newScale - this.viewport.width)
    const maxY = Math.max(0, this.image.height * newScale - this.viewport.height)

    this.setViewport(
      clamp(this.viewport.x - dx * this.viewport.scale, 0, maxX),
      clamp(this.viewport.y - dy * this.viewport.scale, 0, maxY),
      newScale
    )
  }

  /**
   * Fit image to viewport
   */
  fit(): void {
    if (!this.image) return

    const scaleX = this.viewport.width / this.image.width
    const scaleY = this.viewport.height / this.image.height
    const scale = Math.min(scaleX, scaleY)

    const x = (this.viewport.width - this.image.width * scale) / 2
    const y = (this.viewport.height - this.image.height * scale) / 2

    this.setViewport(
      Math.max(0, -x),
      Math.max(0, -y),
      scale
    )
  }

  /**
   * Get memory usage
   */
  getMemoryUsage(): { used: number, max: number, percentage: number } {
    return {
      used: this.memoryUsage,
      max: this.maxMemory,
      percentage: (this.memoryUsage / this.maxMemory) * 100
    }
  }

  /**
   * Destroy
   */
  destroy(): void {
    if (this.rafId !== null) {
      cancelRaf(this.rafId)
    }

    this.clearTiles()

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }
  }
}




