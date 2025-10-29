/**
 * Cache utilities
 * LRU cache implementation for managing memory efficiently
 */

/**
 * LRU (Least Recently Used) Cache
 */
export class LRUCache<K, V> {
  private capacity: number
  private cache: Map<K, V>
  private usageOrder: K[]

  constructor(capacity: number) {
    this.capacity = capacity
    this.cache = new Map()
    this.usageOrder = []
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined
    }

    // Move to end (most recently used)
    this.markAsUsed(key)
    return this.cache.get(key)
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V): void {
    // If key exists, update it
    if (this.cache.has(key)) {
      this.cache.set(key, value)
      this.markAsUsed(key)
      return
    }

    // If cache is full, remove least recently used
    if (this.cache.size >= this.capacity) {
      const oldestKey = this.usageOrder.shift()
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey)
      }
    }

    // Add new entry
    this.cache.set(key, value)
    this.usageOrder.push(key)
  }

  /**
   * Check if key exists
   */
  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * Delete entry
   */
  delete(key: K): boolean {
    if (!this.cache.has(key)) {
      return false
    }

    this.cache.delete(key)
    const index = this.usageOrder.indexOf(key)
    if (index > -1) {
      this.usageOrder.splice(index, 1)
    }
    return true
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear()
    this.usageOrder = []
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Get capacity
   */
  getCapacity(): number {
    return this.capacity
  }

  /**
   * Set new capacity
   */
  setCapacity(newCapacity: number): void {
    if (newCapacity < this.capacity) {
      // Remove oldest entries if new capacity is smaller
      while (this.cache.size > newCapacity) {
        const oldestKey = this.usageOrder.shift()
        if (oldestKey !== undefined) {
          this.cache.delete(oldestKey)
        }
      }
    }
    this.capacity = newCapacity
  }

  /**
   * Get all keys in usage order
   */
  keys(): K[] {
    return [...this.usageOrder]
  }

  /**
   * Get all values
   */
  values(): V[] {
    return this.usageOrder.map(key => this.cache.get(key)!)
  }

  /**
   * Mark key as recently used
   */
  private markAsUsed(key: K): void {
    const index = this.usageOrder.indexOf(key)
    if (index > -1) {
      this.usageOrder.splice(index, 1)
    }
    this.usageOrder.push(key)
  }

  /**
   * Get least recently used key
   */
  getLRUKey(): K | undefined {
    return this.usageOrder[0]
  }

  /**
   * Get most recently used key
   */
  getMRUKey(): K | undefined {
    return this.usageOrder[this.usageOrder.length - 1]
  }
}

/**
 * Timed cache entry
 */
interface TimedCacheEntry<V> {
  value: V
  expiry: number
}

/**
 * TTL (Time To Live) Cache
 * Cache with automatic expiration
 */
export class TTLCache<K, V> {
  private cache: Map<K, TimedCacheEntry<V>>
  private ttl: number
  private cleanupInterval: number
  private cleanupTimer: number | null = null

  constructor(ttl: number = 60000, cleanupInterval: number = 10000) {
    this.cache = new Map()
    this.ttl = ttl
    this.cleanupInterval = cleanupInterval
    this.startCleanup()
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      return undefined
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return undefined
    }

    return entry.value
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V, customTTL?: number): void {
    const ttl = customTTL !== undefined ? customTTL : this.ttl
    const expiry = Date.now() + ttl

    this.cache.set(key, { value, expiry })
  }

  /**
   * Check if key exists and not expired
   */
  has(key: K): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete entry
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: K[] = []

    this.cache.forEach((entry, key) => {
      if (now > entry.expiry) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Start automatic cleanup
   */
  private startCleanup(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * Destroy cache
   */
  destroy(): void {
    this.stopCleanup()
    this.clear()
  }
}

/**
 * Simple memory size-aware cache
 */
export class SizeAwareCache<K, V> {
  private cache: Map<K, { value: V, size: number }>
  private maxSize: number
  private currentSize: number = 0
  private getSizeFunc: (value: V) => number

  constructor(maxSize: number, getSizeFunc: (value: V) => number) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.getSizeFunc = getSizeFunc
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    return entry?.value
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V): boolean {
    const size = this.getSizeFunc(value)

    // If value is too large for cache, don't store it
    if (size > this.maxSize) {
      return false
    }

    // If key exists, remove old size
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!
      this.currentSize -= oldEntry.size
    }

    // Make room if necessary
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value
      const firstEntry = this.cache.get(firstKey)!
      this.currentSize -= firstEntry.size
      this.cache.delete(firstKey)
    }

    // Add new entry
    this.cache.set(key, { value, size })
    this.currentSize += size

    return true
  }

  /**
   * Check if key exists
   */
  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * Delete entry
   */
  delete(key: K): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    this.currentSize -= entry.size
    return this.cache.delete(key)
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear()
    this.currentSize = 0
  }

  /**
   * Get current size
   */
  getCurrentSize(): number {
    return this.currentSize
  }

  /**
   * Get max size
   */
  getMaxSize(): number {
    return this.maxSize
  }

  /**
   * Get cache usage percentage
   */
  getUsagePercent(): number {
    return (this.currentSize / this.maxSize) * 100
  }
}
