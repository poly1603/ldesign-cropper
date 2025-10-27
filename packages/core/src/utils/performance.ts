/**
 * Performance utilities for optimization and monitoring
 */

/**
 * Throttle function execution
 * Ensures function is called at most once per delay period
 * @param fn Function to throttle
 * @param delay Delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  let timeoutId: number | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null

  const execute = () => {
    if (lastArgs !== null) {
      lastCall = Date.now()
      fn.apply(lastThis, lastArgs)
      lastArgs = null
      lastThis = null
    }
    timeoutId = null
  }

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall

    lastArgs = args
    lastThis = this

    if (timeSinceLastCall >= delay) {
      // Execute immediately if enough time has passed
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      execute()
    } else if (timeoutId === null) {
      // Schedule execution if not already scheduled
      timeoutId = window.setTimeout(execute, delay - timeSinceLastCall)
    }
  }
}

/**
 * Debounce function execution
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * Request animation frame wrapper with fallback
 */
export const raf = (callback: FrameRequestCallback): number => {
  return window.requestAnimationFrame(callback)
}

/**
 * Cancel animation frame wrapper
 */
export const cancelRaf = (id: number): void => {
  window.cancelAnimationFrame(id)
}

/**
 * Memoize function results
 * @param fn Function to memoize
 * @param keyGenerator Optional key generator
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator
      ? keyGenerator(...args)
      : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  } as T
}

/**
 * Batch DOM reads and writes for better performance
 */
export class DOMBatcher {
  private readQueue: Array<() => void> = []
  private writeQueue: Array<() => void> = []
  private scheduled = false

  read(fn: () => void): void {
    this.readQueue.push(fn)
    this.schedule()
  }

  write(fn: () => void): void {
    this.writeQueue.push(fn)
    this.schedule()
  }

  private schedule(): void {
    if (this.scheduled) return

    this.scheduled = true
    raf(() => {
      this.flush()
    })
  }

  private flush(): void {
    // Execute all reads first
    while (this.readQueue.length > 0) {
      const read = this.readQueue.shift()
      read?.()
    }

    // Then execute all writes
    while (this.writeQueue.length > 0) {
      const write = this.writeQueue.shift()
      write?.()
    }

    this.scheduled = false
  }

  clear(): void {
    this.readQueue = []
    this.writeQueue = []
    this.scheduled = false
  }
}

/**
 * Performance monitor for tracking metrics
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()
  private enabled = false

  constructor(enabled = false) {
    this.enabled = enabled
  }

  enable(): void {
    this.enabled = true
  }

  disable(): void {
    this.enabled = false
  }

  mark(name: string): void {
    if (!this.enabled) return
    performance.mark(name)
  }

  measure(name: string, startMark: string, endMark?: string): number {
    if (!this.enabled) return 0

    try {
      const measure = performance.measure(name, startMark, endMark)
      const duration = measure.duration

      if (!this.metrics.has(name)) {
        this.metrics.set(name, [])
      }

      const values = this.metrics.get(name)!
      values.push(duration)

      // Keep only last 100 measurements
      if (values.length > 100) {
        values.shift()
      }

      return duration
    } catch (e) {
      return 0
    }
  }

  getAverage(name: string): number {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return 0

    const sum = values.reduce((a, b) => a + b, 0)
    return sum / values.length
  }

  getMetrics(): Record<string, { avg: number; count: number; total: number }> {
    const result: Record<string, { avg: number; count: number; total: number }> = {}

    this.metrics.forEach((values, name) => {
      const total = values.reduce((a, b) => a + b, 0)
      result[name] = {
        avg: total / values.length,
        count: values.length,
        total
      }
    })

    return result
  }

  clear(): void {
    this.metrics.clear()
    performance.clearMarks()
    performance.clearMeasures()
  }
}

/**
 * Memory monitor for tracking memory usage
 */
export class MemoryMonitor {
  getMemoryUsage(): {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      }
    }
    return null
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  checkMemoryPressure(): {
    pressure: 'low' | 'medium' | 'high'
    usagePercent: number
  } {
    const usage = this.getMemoryUsage()
    if (!usage) {
      return { pressure: 'low', usagePercent: 0 }
    }

    const usagePercent = (usage.usedJSHeapSize / usage.jsHeapSizeLimit) * 100

    let pressure: 'low' | 'medium' | 'high' = 'low'
    if (usagePercent > 80) {
      pressure = 'high'
    } else if (usagePercent > 50) {
      pressure = 'medium'
    }

    return { pressure, usagePercent }
  }
}

/**
 * FPS Monitor
 */
export class FPSMonitor {
  private fps = 0
  private frames = 0
  private lastTime = performance.now()
  private rafId: number | null = null

  start(): void {
    const tick = () => {
      this.frames++
      const now = performance.now()
      const delta = now - this.lastTime

      if (delta >= 1000) {
        this.fps = Math.round((this.frames * 1000) / delta)
        this.frames = 0
        this.lastTime = now
      }

      this.rafId = raf(tick)
    }

    tick()
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelRaf(this.rafId)
      this.rafId = null
    }
  }

  getFPS(): number {
    return this.fps
  }
}

/**
 * Canvas pool for reusing canvas elements
 */
export class CanvasPool {
  private pool: HTMLCanvasElement[] = []
  private maxSize: number
  private inUse = new Set<HTMLCanvasElement>()

  constructor(maxSize = 10) {
    this.maxSize = maxSize
  }

  acquire(width: number, height: number): HTMLCanvasElement {
    let canvas = this.pool.pop()

    if (!canvas) {
      canvas = document.createElement('canvas')
    }

    canvas.width = width
    canvas.height = height
    this.inUse.add(canvas)

    return canvas
  }

  release(canvas: HTMLCanvasElement): void {
    if (!this.inUse.has(canvas)) return

    this.inUse.delete(canvas)

    // Clear canvas
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    // Return to pool if not full
    if (this.pool.length < this.maxSize) {
      this.pool.push(canvas)
    }
  }

  clear(): void {
    this.pool = []
    this.inUse.clear()
  }

  getStats(): { poolSize: number; inUse: number } {
    return {
      poolSize: this.pool.length,
      inUse: this.inUse.size
    }
  }
}

// Export global instances
export const performanceMonitor = new PerformanceMonitor(false)
export const memoryMonitor = new MemoryMonitor()
export const canvasPool = new CanvasPool()

