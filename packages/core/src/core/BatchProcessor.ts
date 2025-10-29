/**
 * Batch Processor
 * Handles batch processing of multiple images
 */

import type { GetCroppedCanvasOptions } from '../types'
import type { WorkerManager } from '../workers/WorkerManager'
import type { CropperOptions } from './Cropper'
import { canvasToBlob } from '../utils/image'
import { Cropper } from './Cropper'

export interface BatchItem {
  id: string
  file: File
  url: string
  cropper?: Cropper
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  error?: Error
  result?: Blob
  imageData?: ImageData
}

export interface BatchProcessorOptions {
  cropperOptions?: CropperOptions
  canvasOptions?: GetCroppedCanvasOptions
  parallelProcessing?: boolean
  maxConcurrent?: number
  autoStart?: boolean
  useWorker?: boolean
  workerManager?: WorkerManager
  filters?: Array<{ name: string, options: any }>
  onProgress?: (item: BatchItem, index: number, total: number) => void
  onItemComplete?: (item: BatchItem, index: number) => void
  onComplete?: (items: BatchItem[]) => void
  onError?: (item: BatchItem, error: Error) => void
}

export class BatchProcessor {
  private items: BatchItem[] = []
  private options: BatchProcessorOptions
  private processing: boolean = false
  private cancelled: boolean = false
  private currentIndex: number = 0
  private workers: Set<number> = new Set()

  constructor(options: BatchProcessorOptions = {}) {
    this.options = {
      parallelProcessing: false,
      maxConcurrent: 1,
      autoStart: false,
      ...options,
    }
  }

  /**
   * Add item to batch
   */
  addItem(file: File): string {
    const id = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const url = URL.createObjectURL(file)

    const item: BatchItem = {
      id,
      file,
      url,
      status: 'pending',
      progress: 0,
    }

    this.items.push(item)

    if (this.options.autoStart && !this.processing) {
      this.start()
    }

    return id
  }

  /**
   * Add multiple items
   */
  addItems(files: File[]): string[] {
    return files.map(file => this.addItem(file))
  }

  /**
   * Remove item
   */
  removeItem(id: string): boolean {
    const index = this.items.findIndex(item => item.id === id)
    if (index === -1)
      return false

    const item = this.items[index]

    // Revoke object URL
    if (item.url) {
      URL.revokeObjectURL(item.url)
    }

    // Destroy cropper if exists
    if (item.cropper) {
      item.cropper.destroy()
    }

    this.items.splice(index, 1)
    return true
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.items.forEach((item) => {
      if (item.url) {
        URL.revokeObjectURL(item.url)
      }
      if (item.cropper) {
        item.cropper.destroy()
      }
    })
    this.items = []
    this.currentIndex = 0
  }

  /**
   * Start batch processing
   */
  async start(): Promise<void> {
    if (this.processing)
      return

    this.processing = true
    this.cancelled = false
    this.currentIndex = 0

    if (this.options.parallelProcessing) {
      await this.processParallel()
    }
    else {
      await this.processSequential()
    }

    this.processing = false

    if (this.options.onComplete && !this.cancelled) {
      this.options.onComplete(this.items)
    }
  }

  /**
   * Process items sequentially
   */
  private async processSequential(): Promise<void> {
    for (let i = 0; i < this.items.length; i++) {
      if (this.cancelled)
        break

      const item = this.items[i]
      if (item.status === 'cancelled' || item.status === 'completed')
        continue

      this.currentIndex = i
      await this.processItem(item, i)
    }
  }

  /**
   * Process items in parallel
   */
  private async processParallel(): Promise<void> {
    const maxConcurrent = this.options.maxConcurrent || 2
    const promises: Promise<void>[] = []

    for (let i = 0; i < this.items.length; i++) {
      if (this.cancelled)
        break

      const item = this.items[i]
      if (item.status === 'cancelled' || item.status === 'completed')
        continue

      // Wait if we've reached max concurrent
      if (this.workers.size >= maxConcurrent) {
        await Promise.race(promises)
      }

      const promise = this.processItem(item, i).finally(() => {
        this.workers.delete(i)
      })

      this.workers.add(i)
      promises.push(promise)
    }

    // Wait for all remaining items
    await Promise.all(promises)
  }

  /**
   * Process single item
   */
  private async processItem(item: BatchItem, index: number): Promise<void> {
    if (item.status !== 'pending' || this.cancelled)
      return

    try {
      item.status = 'processing'
      item.progress = 0

      // If using worker and filters are specified
      if (this.options.useWorker && this.options.workerManager && this.options.filters) {
        await this.processItemWithWorker(item, index)
      }
      else {
        await this.processItemWithCropper(item, index)
      }
    }
    catch (error) {
      item.status = 'failed'
      item.error = error as Error

      if (this.options.onError) {
        this.options.onError(item, error as Error)
      }
    }
  }

  /**
   * Process item with worker
   */
  private async processItemWithWorker(item: BatchItem, index: number): Promise<void> {
    try {
      // Load image
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = item.url
      })

      item.progress = 20

      // Create canvas and get image data
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx)
        throw new Error('Failed to get canvas context')

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      item.imageData = imageData

      item.progress = 40

      // Apply filters using worker
      if (this.options.filters && this.options.workerManager) {
        let processedData = imageData
        for (const filter of this.options.filters) {
          processedData = await this.options.workerManager.applyFilter(
            processedData,
            filter.name,
            filter.options,
          )
          item.progress += 20 / this.options.filters.length
        }
        item.imageData = processedData
      }

      item.progress = 80

      // Convert back to blob
      ctx.putImageData(item.imageData, 0, 0)
      const blob = await canvasToBlob(canvas)
      item.result = blob
      item.progress = 100
      item.status = 'completed'

      if (this.options.onItemComplete) {
        this.options.onItemComplete(item, index)
      }

      // Report progress
      if (this.options.onProgress) {
        this.options.onProgress(item, index, this.items.length)
      }
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Process item with traditional cropper
   */
  private async processItemWithCropper(item: BatchItem, index: number): Promise<void> {
    // Create temporary container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)

    // Create cropper
    const cropper = new Cropper(container, {
      ...this.options.cropperOptions,
      src: item.url,
      ready: async () => {
        try {
          item.progress = 50

          // Get cropped canvas
          const canvas = cropper.getCroppedCanvas(this.options.canvasOptions)

          if (!canvas) {
            throw new Error('Failed to get cropped canvas')
          }

          item.progress = 75

          // Convert to blob
          const blob = await canvasToBlob(canvas)
          item.result = blob
          item.progress = 100
          item.status = 'completed'

          if (this.options.onItemComplete) {
            this.options.onItemComplete(item, index)
          }
        }
        catch (error) {
          item.status = 'failed'
          item.error = error as Error

          if (this.options.onError) {
            this.options.onError(item, error as Error)
          }
        }
        finally {
          // Cleanup
          cropper.destroy()
          document.body.removeChild(container)
        }
      },
    })

    item.cropper = cropper

    // Report progress
    if (this.options.onProgress) {
      this.options.onProgress(item, index, this.items.length)
    }
  }

  /**
   * Cancel batch processing
   */
  cancel(): void {
    this.cancelled = true

    // Mark all pending items as cancelled
    this.items.forEach((item) => {
      if (item.status === 'pending' || item.status === 'processing') {
        item.status = 'cancelled'
      }
    })
  }

  /**
   * Pause processing
   */
  pause(): void {
    this.cancelled = true
  }

  /**
   * Resume processing
   */
  async resume(): Promise<void> {
    if (this.processing)
      return

    this.cancelled = false
    await this.start()
  }

  /**
   * Get item by ID
   */
  getItem(id: string): BatchItem | undefined {
    return this.items.find(item => item.id === id)
  }

  /**
   * Get all items
   */
  getItems(): BatchItem[] {
    return [...this.items]
  }

  /**
   * Get completed items
   */
  getCompletedItems(): BatchItem[] {
    return this.items.filter(item => item.status === 'completed')
  }

  /**
   * Get failed items
   */
  getFailedItems(): BatchItem[] {
    return this.items.filter(item => item.status === 'failed')
  }

  /**
   * Get progress
   */
  getProgress(): {
    total: number
    completed: number
    failed: number
    pending: number
    processing: number
    percentage: number
  } {
    const total = this.items.length
    const completed = this.items.filter(item => item.status === 'completed')
      .length
    const failed = this.items.filter(item => item.status === 'failed').length
    const pending = this.items.filter(item => item.status === 'pending').length
    const processing = this.items.filter(
      item => item.status === 'processing',
    ).length

    return {
      total,
      completed,
      failed,
      pending,
      processing,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    }
  }

  /**
   * Export results as ZIP (requires external library)
   * This is a placeholder - would need JSZip or similar
   */
  async exportAsZip(filename: string = 'batch-export.zip'): Promise<void> {
    const completed = this.getCompletedItems()

    if (completed.length === 0) {
      throw new Error('No completed items to export')
    }

    // This would require JSZip library
    // For now, just download individual files
    completed.forEach((item, index) => {
      if (item.result) {
        const url = URL.createObjectURL(item.result)
        const a = document.createElement('a')
        a.href = url
        a.download = `image-${index + 1}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    })
  }

  /**
   * Export results individually
   */
  exportResults(): void {
    const completed = this.getCompletedItems()

    completed.forEach((item, index) => {
      if (item.result) {
        const url = URL.createObjectURL(item.result)
        const a = document.createElement('a')
        a.href = url
        a.download = item.file.name.replace(/\.[^/.]+$/, '-cropped.png')
        a.click()
        URL.revokeObjectURL(url)
      }
    })
  }

  /**
   * Is processing
   */
  isProcessing(): boolean {
    return this.processing
  }

  /**
   * Is cancelled
   */
  isCancelled(): boolean {
    return this.cancelled
  }

  /**
   * Destroy batch processor
   */
  destroy(): void {
    this.cancel()
    this.clear()
  }
}
