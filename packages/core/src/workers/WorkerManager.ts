/**
 * Worker Manager
 * Manages communication with Web Workers for background processing
 */

import type {
  BatchFilterWorkerData,
  CompositionSuggestion,
  CropWorkerData,
  FaceDetectionResult,
  FilterWorkerData,
  ImageAnalysisResult,
  ResizeWorkerData,
  RotateWorkerData,
  ThumbnailWorkerData,
  WorkerMessage,
  WorkerMessageType,
  WorkerResponse,
} from './types'

export interface WorkerManagerOptions {
  maxWorkers?: number
  workerPath?: string
  timeout?: number
}

interface PendingTask {
  resolve: (value: any) => void
  reject: (reason: any) => void
  timeout: number
}

export class WorkerManager {
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private pendingTasks = new Map<string, PendingTask>()
  private taskQueue: Array<() => void> = []
  private maxWorkers: number
  private workerPath: string
  private timeout: number
  private taskCounter = 0
  private progressCallbacks = new Map<string, (progress: number) => void>()

  constructor(options: WorkerManagerOptions = {}) {
    this.maxWorkers = options.maxWorkers || navigator.hardwareConcurrency || 4
    this.workerPath = options.workerPath || new URL('./image.worker.ts', import.meta.url).href
    this.timeout = options.timeout || 30000 // 30 seconds default

    this.initializeWorkers()
  }

  /**
   * Initialize worker pool
   */
  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorker()
    }
  }

  /**
   * Create a new worker
   */
  private createWorker(): void {
    try {
      const worker = new Worker(this.workerPath, { type: 'module' })

      worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(worker, event.data)
      })

      worker.addEventListener('error', (error) => {
        console.error('Worker error:', error)
        this.handleWorkerError(worker, error)
      })

      this.workers.push(worker)
      this.availableWorkers.push(worker)
    }
    catch (error) {
      console.error('Failed to create worker:', error)
    }
  }

  /**
   * Handle message from worker
   */
  private handleWorkerMessage(worker: Worker, response: WorkerResponse): void {
    const { id, success, data, error, progress } = response

    // Handle progress updates
    if (id === 'progress' && progress !== undefined) {
      this.progressCallbacks.forEach(callback => callback(progress))
      return
    }

    const pendingTask = this.pendingTasks.get(id)
    if (!pendingTask)
      return

    // Clear timeout
    clearTimeout(pendingTask.timeout)

    // Remove from pending
    this.pendingTasks.delete(id)

    // Resolve or reject promise
    if (success) {
      pendingTask.resolve(data)
    }
    else {
      pendingTask.reject(new Error(error || 'Unknown worker error'))
    }

    // Return worker to pool
    this.releaseWorker(worker)
  }

  /**
   * Handle worker error
   */
  private handleWorkerError(worker: Worker, error: Event | ErrorEvent): void {
    // Find and reject all pending tasks for this worker
    this.pendingTasks.forEach((task, id) => {
      task.reject(new Error('Worker crashed'))
      this.pendingTasks.delete(id)
    })

    // Remove worker from pools
    const workerIndex = this.workers.indexOf(worker)
    if (workerIndex !== -1) {
      this.workers.splice(workerIndex, 1)
    }

    const availableIndex = this.availableWorkers.indexOf(worker)
    if (availableIndex !== -1) {
      this.availableWorkers.splice(availableIndex, 1)
    }

    // Terminate the worker
    worker.terminate()

    // Create a replacement worker
    this.createWorker()
  }

  /**
   * Get an available worker or queue the task
   */
  private async getWorker(): Promise<Worker> {
    if (this.availableWorkers.length > 0) {
      return this.availableWorkers.pop()!
    }

    // Wait for a worker to become available
    return new Promise((resolve) => {
      this.taskQueue.push(() => {
        const worker = this.availableWorkers.pop()
        if (worker)
          resolve(worker)
      })
    })
  }

  /**
   * Release worker back to pool
   */
  private releaseWorker(worker: Worker): void {
    this.availableWorkers.push(worker)

    // Process queued tasks
    if (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()
      task?.()
    }
  }

  /**
   * Send message to worker and wait for response
   */
  private async sendMessage<T>(
    type: WorkerMessageType,
    data: any,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    const worker = await this.getWorker()
    const id = `task_${++this.taskCounter}`

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingTasks.delete(id)
        this.releaseWorker(worker)
        reject(new Error('Worker timeout'))
      }, this.timeout)

      // Store pending task
      this.pendingTasks.set(id, { resolve, reject, timeout })

      // Store progress callback if provided
      if (onProgress) {
        this.progressCallbacks.set(id, onProgress)
      }

      // Send message to worker
      const message: WorkerMessage = { id, type, data }
      worker.postMessage(message)
    }).finally(() => {
      // Clean up progress callback
      this.progressCallbacks.delete(id)
    }) as Promise<T>
  }

  /**
   * Apply filter to image
   */
  async applyFilter(
    imageData: ImageData,
    filterName: string,
    filterOptions: any = {},
  ): Promise<ImageData> {
    const data: FilterWorkerData = {
      imageData,
      filterName,
      filterOptions,
    }

    return this.sendMessage<ImageData>('applyFilter', data)
  }

  /**
   * Apply filter to multiple images
   */
  async applyFilterBatch(
    images: ImageData[],
    filterName: string,
    filterOptions: any = {},
    onProgress?: (progress: number) => void,
  ): Promise<ImageData[]> {
    const data: BatchFilterWorkerData = {
      images,
      filterName,
      filterOptions,
    }

    return this.sendMessage<ImageData[]>('applyFilterBatch', data, onProgress)
  }

  /**
   * Resize image
   */
  async resizeImage(
    imageData: ImageData,
    width: number,
    height: number,
    options: Partial<ResizeWorkerData> = {},
  ): Promise<ImageData> {
    const data: ResizeWorkerData = {
      imageData,
      width,
      height,
      ...options,
    }

    return this.sendMessage<ImageData>('resizeImage', data)
  }

  /**
   * Rotate image
   */
  async rotateImage(
    imageData: ImageData,
    angle: number,
    fillColor?: string,
  ): Promise<ImageData> {
    const data: RotateWorkerData = {
      imageData,
      angle,
      fillColor,
    }

    return this.sendMessage<ImageData>('rotateImage', data)
  }

  /**
   * Crop image
   */
  async cropImage(
    imageData: ImageData,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<ImageData> {
    const data: CropWorkerData = {
      imageData,
      x,
      y,
      width,
      height,
    }

    return this.sendMessage<ImageData>('cropImage', data)
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(
    imageData: ImageData,
    width: number,
    height: number,
    quality?: number,
  ): Promise<ImageData> {
    const data: ThumbnailWorkerData = {
      imageData,
      width,
      height,
      quality,
    }

    return this.sendMessage<ImageData>('generateThumbnail', data)
  }

  /**
   * Analyze image
   */
  async analyzeImage(imageData: ImageData): Promise<ImageAnalysisResult> {
    return this.sendMessage<ImageAnalysisResult>('analyzeImage', imageData)
  }

  /**
   * Detect faces
   */
  async detectFaces(imageData: ImageData): Promise<FaceDetectionResult> {
    return this.sendMessage<FaceDetectionResult>('detectFaces', imageData)
  }

  /**
   * Get composition suggestions
   */
  async suggestComposition(imageData: ImageData): Promise<CompositionSuggestion[]> {
    return this.sendMessage<CompositionSuggestion[]>('suggestComposition', imageData)
  }

  /**
   * Process multiple operations in parallel
   */
  async parallel<T>(operations: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(operations.map(op => op()))
  }

  /**
   * Get worker statistics
   */
  getStats(): {
    totalWorkers: number
    availableWorkers: number
    pendingTasks: number
    queuedTasks: number
  } {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      pendingTasks: this.pendingTasks.size,
      queuedTasks: this.taskQueue.length,
    }
  }

  /**
   * Terminate all workers
   */
  terminate(): void {
    // Clear all pending tasks
    this.pendingTasks.forEach((task) => {
      task.reject(new Error('WorkerManager terminated'))
    })
    this.pendingTasks.clear()

    // Clear task queue
    this.taskQueue = []

    // Terminate all workers
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
    this.availableWorkers = []

    // Clear callbacks
    this.progressCallbacks.clear()
  }
}
