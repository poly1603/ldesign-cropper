/**
 * Filter Engine
 * Core system for applying filters to images
 */

import type { WorkerManager } from '../workers/WorkerManager'
import { FILTERS } from '../config/constants'

export interface FilterOptions {
  intensity?: number
  [key: string]: any
}

export interface Filter {
  name: string
  apply: (
    imageData: ImageData,
    options?: FilterOptions,
  ) => ImageData
}

export interface FilterLayer {
  filter: Filter
  options: FilterOptions
  enabled: boolean
}

export interface FilterEngineOptions {
  useWorker?: boolean
  workerManager?: WorkerManager
}

/**
 * Filter Engine
 * Manages filter pipeline and application
 */
export class FilterEngine {
  private filters: Map<string, Filter> = new Map()
  private filterLayers: FilterLayer[] = []
  private originalImageData: ImageData | null = null
  private cachedResult: ImageData | null = null
  private cacheKey: string = ''
  private useWorker: boolean
  private workerManager?: WorkerManager

  constructor(options: FilterEngineOptions = {}) {
    this.useWorker = options.useWorker ?? false
    this.workerManager = options.workerManager
  }

  /**
   * Register a filter
   */
  registerFilter(filter: Filter): void {
    this.filters.set(filter.name, filter)
  }

  /**
   * Unregister a filter
   */
  unregisterFilter(name: string): boolean {
    return this.filters.delete(name)
  }

  /**
   * Get registered filter
   */
  getFilter(name: string): Filter | undefined {
    return this.filters.get(name)
  }

  /**
   * Get all registered filters
   */
  getAllFilters(): Filter[] {
    return Array.from(this.filters.values())
  }

  /**
   * Add filter layer
   */
  addFilterLayer(
    filterName: string,
    options: FilterOptions = {},
    enabled: boolean = true,
  ): boolean {
    const filter = this.filters.get(filterName)
    if (!filter) {
      console.warn(`Filter "${filterName}" not found`)
      return false
    }

    this.filterLayers.push({
      filter,
      options: { intensity: FILTERS.DEFAULT_INTENSITY, ...options },
      enabled,
    })

    this.invalidateCache()
    return true
  }

  /**
   * Remove filter layer
   */
  removeFilterLayer(index: number): boolean {
    if (index < 0 || index >= this.filterLayers.length) {
      return false
    }

    this.filterLayers.splice(index, 1)
    this.invalidateCache()
    return true
  }

  /**
   * Update filter layer
   */
  updateFilterLayer(
    index: number,
    options?: FilterOptions,
    enabled?: boolean,
  ): boolean {
    if (index < 0 || index >= this.filterLayers.length) {
      return false
    }

    const layer = this.filterLayers[index]
    if (options) {
      layer.options = { ...layer.options, ...options }
    }
    if (enabled !== undefined) {
      layer.enabled = enabled
    }

    this.invalidateCache()
    return true
  }

  /**
   * Clear all filter layers
   */
  clearFilters(): void {
    this.filterLayers = []
    this.invalidateCache()
  }

  /**
   * Get filter layers
   */
  getFilterLayers(): FilterLayer[] {
    return [...this.filterLayers]
  }

  /**
   * Set original image data
   */
  setOriginalImageData(imageData: ImageData): void {
    this.originalImageData = imageData
    this.invalidateCache()
  }

  /**
   * Apply all filters in pipeline
   */
  applyFilters(sourceImageData?: ImageData): ImageData | null {
    const source = sourceImageData || this.originalImageData
    if (!source) {
      return null
    }

    // Check cache
    const currentCacheKey = this.getCacheKey()
    if (this.cachedResult && this.cacheKey === currentCacheKey) {
      return this.cloneImageData(this.cachedResult)
    }

    // Apply filters sequentially
    let currentData = this.cloneImageData(source)

    for (const layer of this.filterLayers) {
      if (!layer.enabled)
        continue

      try {
        currentData = layer.filter.apply(currentData, layer.options)
      }
      catch (error) {
        console.error(`Failed to apply filter "${layer.filter.name}":`, error)
      }
    }

    // Cache result
    this.cachedResult = currentData
    this.cacheKey = currentCacheKey

    return this.cloneImageData(currentData)
  }

  /**
   * Apply all enabled filters asynchronously (with optional Worker support)
   */
  async applyFiltersAsync(
    imageData?: ImageData,
    onProgress?: (progress: number) => void,
  ): Promise<ImageData> {
    // Use worker if available and configured
    if (this.useWorker && this.workerManager && this.filterLayers.length === 1) {
      const layer = this.filterLayers[0]
      if (layer.enabled) {
        const source = imageData || this.originalImageData
        if (!source) {
          throw new Error('No image data available')
        }

        return await this.workerManager.applyFilter(
          source,
          layer.filter.name,
          layer.options,
        )
      }
    }

    // Fall back to synchronous processing
    const result = this.applyFilters(imageData)
    return Promise.resolve(result)
  }

  /**
   * Apply single filter without modifying pipeline
   */
  applyFilter(
    filterName: string,
    imageData: ImageData,
    options: FilterOptions = {},
  ): ImageData | null {
    const filter = this.filters.get(filterName)
    if (!filter) {
      console.warn(`Filter "${filterName}" not found`)
      return null
    }

    try {
      return filter.apply(this.cloneImageData(imageData), options)
    }
    catch (error) {
      console.error(`Failed to apply filter "${filterName}":`, error)
      return null
    }
  }

  /**
   * Preview filter (non-destructive)
   */
  previewFilter(
    filterName: string,
    options: FilterOptions = {},
  ): ImageData | null {
    if (!this.originalImageData) {
      return null
    }

    const filter = this.filters.get(filterName)
    if (!filter) {
      return null
    }

    try {
      return filter.apply(
        this.cloneImageData(this.originalImageData),
        options,
      )
    }
    catch (error) {
      console.error(`Failed to preview filter "${filterName}":`, error)
      return null
    }
  }

  /**
   * Clone ImageData
   */
  private cloneImageData(imageData: ImageData): ImageData {
    return new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    )
  }

  /**
   * Generate cache key from current filter state
   */
  private getCacheKey(): string {
    return this.filterLayers
      .filter(l => l.enabled)
      .map(l => `${l.filter.name}:${JSON.stringify(l.options)}`)
      .join('|')
  }

  /**
   * Invalidate cache
   */
  private invalidateCache(): void {
    this.cachedResult = null
    this.cacheKey = ''
  }

  /**
   * Get original image data
   */
  getOriginalImageData(): ImageData | null {
    return this.originalImageData
      ? this.cloneImageData(this.originalImageData)
      : null
  }

  /**
   * Reset to original
   */
  reset(): void {
    this.clearFilters()
    this.cachedResult = null
    this.cacheKey = ''
  }

  /**
   * Export filter configuration
   */
  exportConfig(): any {
    return {
      filters: this.filterLayers.map(layer => ({
        name: layer.filter.name,
        options: layer.options,
        enabled: layer.enabled,
      })),
    }
  }

  /**
   * Import filter configuration
   */
  importConfig(config: any): boolean {
    if (!config || !Array.isArray(config.filters)) {
      return false
    }

    this.clearFilters()

    for (const item of config.filters) {
      if (!item.name)
        continue
      this.addFilterLayer(item.name, item.options, item.enabled ?? true)
    }

    return true
  }

  /**
   * Destroy filter engine
   */
  destroy(): void {
    this.filters.clear()
    this.filterLayers = []
    this.originalImageData = null
    this.cachedResult = null
    this.cacheKey = ''
  }
}

/**
 * Helper function to get image data from canvas
 */
export function getImageDataFromCanvas(
  canvas: HTMLCanvasElement,
): ImageData | null {
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return null

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * Helper function to put image data back to canvas
 */
export function putImageDataToCanvas(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
): boolean {
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return false

  ctx.putImageData(imageData, 0, 0)
  return true
}

/**
 * Blend two ImageData objects
 */
export function blendImageData(
  base: ImageData,
  overlay: ImageData,
  opacity: number = 1,
): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(base.data),
    base.width,
    base.height,
  )

  const alpha = Math.max(0, Math.min(1, opacity))

  for (let i = 0; i < result.data.length; i += 4) {
    result.data[i] = base.data[i] * (1 - alpha) + overlay.data[i] * alpha
    result.data[i + 1]
      = base.data[i + 1] * (1 - alpha) + overlay.data[i + 1] * alpha
    result.data[i + 2]
      = base.data[i + 2] * (1 - alpha) + overlay.data[i + 2] * alpha
    result.data[i + 3] = Math.max(base.data[i + 3], overlay.data[i + 3])
  }

  return result
}
