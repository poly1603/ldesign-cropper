/**
 * Image Tile Manager
 * Handles large images by breaking them into tiles for efficient rendering
 */

import { MEMORY, IMAGE } from '../config/constants'
import { canvasPool } from '../utils/performance'

export interface TileInfo {
  x: number
  y: number
  width: number
  height: number
  canvas: HTMLCanvasElement | null
  loaded: boolean
}

export interface ImageTileManagerOptions {
  tileSize?: number
  maxMemory?: number
  preloadDistance?: number
}

export class ImageTileManager {
  private image: HTMLImageElement
  private tiles: Map<string, TileInfo> = new Map()
  private tileSize: number
  private maxMemory: number
  private preloadDistance: number
  private totalTiles = 0

  constructor(
    image: HTMLImageElement,
    options: ImageTileManagerOptions = {}
  ) {
    this.image = image
    this.tileSize = options.tileSize || IMAGE.PROGRESSIVE_CHUNK_SIZE
    this.maxMemory = options.maxMemory || MEMORY.MAX_MEMORY_USAGE
    this.preloadDistance = options.preloadDistance || 2

    this.calculateTiles()
  }

  /**
   * Calculate tile grid
   */
  private calculateTiles(): void {
    const cols = Math.ceil(this.image.naturalWidth / this.tileSize)
    const rows = Math.ceil(this.image.naturalHeight / this.tileSize)
    this.totalTiles = cols * rows

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * this.tileSize
        const y = row * this.tileSize
        const width = Math.min(
          this.tileSize,
          this.image.naturalWidth - x
        )
        const height = Math.min(
          this.tileSize,
          this.image.naturalHeight - y
        )

        const key = this.getTileKey(col, row)
        this.tiles.set(key, {
          x,
          y,
          width,
          height,
          canvas: null,
          loaded: false
        })
      }
    }
  }

  /**
   * Get tile key
   */
  private getTileKey(col: number, row: number): string {
    return `${col},${row}`
  }

  /**
   * Load a specific tile
   */
  async loadTile(col: number, row: number): Promise<TileInfo | null> {
    const key = this.getTileKey(col, row)
    const tile = this.tiles.get(key)

    if (!tile) return null
    if (tile.loaded) return tile

    try {
      // Create canvas for this tile
      const canvas = canvasPool.acquire(tile.width, tile.height)
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        canvasPool.release(canvas)
        return null
      }

      // Draw the tile from the source image
      ctx.drawImage(
        this.image,
        tile.x,
        tile.y,
        tile.width,
        tile.height,
        0,
        0,
        tile.width,
        tile.height
      )

      tile.canvas = canvas
      tile.loaded = true

      return tile
    } catch (error) {
      console.error('Failed to load tile:', error)
      return null
    }
  }

  /**
   * Load tiles in viewport and nearby
   */
  async loadVisibleTiles(
    viewportX: number,
    viewportY: number,
    viewportWidth: number,
    viewportHeight: number
  ): Promise<void> {
    // Calculate which tiles are in viewport
    const startCol = Math.max(
      0,
      Math.floor(viewportX / this.tileSize) - this.preloadDistance
    )
    const endCol = Math.min(
      Math.ceil(this.image.naturalWidth / this.tileSize),
      Math.ceil((viewportX + viewportWidth) / this.tileSize) + this.preloadDistance
    )
    const startRow = Math.max(
      0,
      Math.floor(viewportY / this.tileSize) - this.preloadDistance
    )
    const endRow = Math.min(
      Math.ceil(this.image.naturalHeight / this.tileSize),
      Math.ceil((viewportY + viewportHeight) / this.tileSize) + this.preloadDistance
    )

    // Load tiles
    const promises: Promise<TileInfo | null>[] = []
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        promises.push(this.loadTile(col, row))
      }
    }

    await Promise.all(promises)

    // Unload tiles far from viewport to save memory
    this.unloadDistantTiles(startCol, endCol, startRow, endRow)
  }

  /**
   * Unload tiles that are far from viewport
   */
  private unloadDistantTiles(
    startCol: number,
    endCol: number,
    startRow: number,
    endRow: number
  ): void {
    this.tiles.forEach((tile, key) => {
      const [col, row] = key.split(',').map(Number)

      // Check if tile is outside the preload area
      if (
        col < startCol ||
        col >= endCol ||
        row < startRow ||
        row >= endRow
      ) {
        if (tile.canvas && tile.loaded) {
          canvasPool.release(tile.canvas)
          tile.canvas = null
          tile.loaded = false
        }
      }
    })
  }

  /**
   * Render tiles to a target canvas
   */
  renderTiles(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    scale: number
  ): void {
    this.tiles.forEach((tile) => {
      if (!tile.loaded || !tile.canvas) return

      const x = (tile.x - offsetX) * scale
      const y = (tile.y - offsetY) * scale
      const width = tile.width * scale
      const height = tile.height * scale

      ctx.drawImage(tile.canvas, x, y, width, height)
    })
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): number {
    let total = 0
    this.tiles.forEach((tile) => {
      if (tile.loaded && tile.canvas) {
        // Estimate: 4 bytes per pixel (RGBA)
        total += tile.width * tile.height * 4
      }
    })
    return total
  }

  /**
   * Get loaded tiles count
   */
  getLoadedTilesCount(): number {
    let count = 0
    this.tiles.forEach((tile) => {
      if (tile.loaded) count++
    })
    return count
  }

  /**
   * Get total tiles count
   */
  getTotalTilesCount(): number {
    return this.totalTiles
  }

  /**
   * Clear all tiles
   */
  clear(): void {
    this.tiles.forEach((tile) => {
      if (tile.canvas) {
        canvasPool.release(tile.canvas)
      }
    })
    this.tiles.clear()
  }

  /**
   * Destroy tile manager
   */
  destroy(): void {
    this.clear()
  }
}

/**
 * Check if image should use tiling based on size
 */
export function shouldUseTiling(image: HTMLImageElement): boolean {
  const pixels = image.naturalWidth * image.naturalHeight
  const estimatedMemory = pixels * 4 // RGBA

  return estimatedMemory > MEMORY.LARGE_IMAGE_THRESHOLD
}

/**
 * Calculate optimal tile size for an image
 */
export function calculateOptimalTileSize(
  imageWidth: number,
  imageHeight: number
): number {
  const pixels = imageWidth * imageHeight

  if (pixels > MEMORY.VERY_LARGE_IMAGE_THRESHOLD) {
    return 256 // Smaller tiles for very large images
  } else if (pixels > MEMORY.LARGE_IMAGE_THRESHOLD) {
    return 512 // Standard tile size
  } else {
    return 1024 // Larger tiles for moderate images
  }
}

