/**
 * Smart Cache System
 * Multi-level caching with intelligent preloading
 */

export interface CacheOptions {
  maxMemorySize?: number
  maxLocalStorageSize?: number
  maxIndexedDBSize?: number
  ttl?: number
  useCompression?: boolean
  preloadStrategy?: 'predictive' | 'adjacent' | 'none'
}

export interface CacheEntry<T = any> {
  key: string
  data: T
  size: number
  lastAccessed: number
  accessCount: number
  created: number
  ttl?: number
  compressed?: boolean
}

export interface CacheStats {
  memory: {
    used: number
    max: number
    entries: number
  }
  localStorage: {
    used: number
    max: number
    entries: number
  }
  indexedDB: {
    used: number
    max: number
    entries: number
  }
  hits: number
  misses: number
  evictions: number
}

/**
 * LRU Cache implementation
 */
class LRUCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private maxSize: number
  private currentSize = 0

  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry)
      return null

    // Check TTL
    if (entry.ttl && Date.now() - entry.created > entry.ttl) {
      this.delete(key)
      return null
    }

    // Update access time and count
    entry.lastAccessed = Date.now()
    entry.accessCount++

    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.data
  }

  set(key: string, data: T, size: number, ttl?: number): void {
    // Remove if exists
    if (this.cache.has(key)) {
      this.delete(key)
    }

    // Evict if necessary
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value
      if (firstKey)
        this.delete(firstKey)
    }

    const entry: CacheEntry<T> = {
      key,
      data,
      size,
      lastAccessed: Date.now(),
      accessCount: 1,
      created: Date.now(),
      ttl,
    }

    this.cache.set(key, entry)
    this.currentSize += size
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry)
      return false

    this.cache.delete(key)
    this.currentSize -= entry.size
    return true
  }

  clear(): void {
    this.cache.clear()
    this.currentSize = 0
  }

  getSize(): number {
    return this.currentSize
  }

  getEntries(): number {
    return this.cache.size
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  getStats(): Map<string, { accessCount: number, lastAccessed: number }> {
    const stats = new Map<string, { accessCount: number, lastAccessed: number }>()

    for (const [key, entry] of this.cache) {
      stats.set(key, {
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
      })
    }

    return stats
  }
}

/**
 * Smart Cache Manager
 * Manages multi-level caching with automatic promotion/demotion
 */
export class SmartCache {
  private options: Required<CacheOptions>
  private memoryCache: LRUCache
  private localStoragePrefix = 'ldesign_cropper_'
  private dbName = 'LDesignCropperCache'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  // Statistics
  private stats: CacheStats = {
    memory: { used: 0, max: 0, entries: 0 },
    localStorage: { used: 0, max: 0, entries: 0 },
    indexedDB: { used: 0, max: 0, entries: 0 },
    hits: 0,
    misses: 0,
    evictions: 0,
  }

  // Preloading
  private preloadQueue = new Set<string>()
  private preloadInProgress = false

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxMemorySize: options.maxMemorySize || 50 * 1024 * 1024, // 50MB
      maxLocalStorageSize: options.maxLocalStorageSize || 10 * 1024 * 1024, // 10MB
      maxIndexedDBSize: options.maxIndexedDBSize || 100 * 1024 * 1024, // 100MB
      ttl: options.ttl || 3600000, // 1 hour
      useCompression: options.useCompression || false,
      preloadStrategy: options.preloadStrategy || 'adjacent',
    }

    this.memoryCache = new LRUCache(this.options.maxMemorySize)
    this.stats.memory.max = this.options.maxMemorySize
    this.stats.localStorage.max = this.options.maxLocalStorageSize
    this.stats.indexedDB.max = this.options.maxIndexedDBSize

    this.initIndexedDB()
    this.cleanupLocalStorage()
  }

  /**
   * Initialize IndexedDB
   */
  private async initIndexedDB(): Promise<void> {
    if (!('indexedDB' in window))
      return

    try {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onsuccess = () => {
        this.db = request.result
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' })
          store.createIndex('lastAccessed', 'lastAccessed')
          store.createIndex('size', 'size')
        }
      }
    }
    catch (error) {
      console.error('Failed to initialize IndexedDB:', error)
    }
  }

  /**
   * Get item from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    // Try memory cache first
    let data = this.memoryCache.get(key)
    if (data !== null) {
      this.stats.hits++
      this.triggerPreload(key)
      return data as T
    }

    // Try localStorage
    data = await this.getFromLocalStorage<T>(key)
    if (data !== null) {
      this.stats.hits++
      // Promote to memory cache
      this.promoteToMemory(key, data, this.estimateSize(data))
      this.triggerPreload(key)
      return data
    }

    // Try IndexedDB
    data = await this.getFromIndexedDB<T>(key)
    if (data !== null) {
      this.stats.hits++
      // Promote to higher levels
      this.promoteToMemory(key, data, this.estimateSize(data))
      this.promoteToLocalStorage(key, data)
      this.triggerPreload(key)
      return data
    }

    this.stats.misses++
    return null
  }

  /**
   * Set item in cache
   */
  async set<T = any>(key: string, data: T, options: { ttl?: number, compress?: boolean } = {}): Promise<void> {
    const size = this.estimateSize(data)
    const ttl = options.ttl || this.options.ttl

    // Store in memory cache
    this.memoryCache.set(key, data, size, ttl)
    this.updateStats()

    // Store in localStorage if small enough
    if (size < 1024 * 100) { // 100KB limit for localStorage
      await this.setInLocalStorage(key, data, ttl)
    }

    // Store in IndexedDB
    await this.setInIndexedDB(key, data, size, ttl)
  }

  /**
   * Delete item from all caches
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.memoryCache.delete(key)
    await this.deleteFromLocalStorage(key)
    await this.deleteFromIndexedDB(key)
    this.updateStats()
    return deleted
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()
    await this.clearLocalStorage()
    await this.clearIndexedDB()
    this.updateStats()
  }

  /**
   * Get from localStorage
   */
  private async getFromLocalStorage<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.localStoragePrefix + key)
      if (!item)
        return null

      const entry = JSON.parse(item)

      // Check TTL
      if (entry.ttl && Date.now() - entry.created > entry.ttl) {
        localStorage.removeItem(this.localStoragePrefix + key)
        return null
      }

      return entry.data
    }
    catch (error) {
      return null
    }
  }

  /**
   * Set in localStorage
   */
  private async setInLocalStorage<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      const entry = {
        data,
        created: Date.now(),
        ttl,
      }

      localStorage.setItem(this.localStoragePrefix + key, JSON.stringify(entry))
    }
    catch (error) {
      // Storage quota exceeded, cleanup old entries
      this.cleanupLocalStorage()
    }
  }

  /**
   * Delete from localStorage
   */
  private async deleteFromLocalStorage(key: string): Promise<void> {
    localStorage.removeItem(this.localStoragePrefix + key)
  }

  /**
   * Clear localStorage
   */
  private async clearLocalStorage(): Promise<void> {
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith(this.localStoragePrefix)) {
        localStorage.removeItem(key)
      }
    }
  }

  /**
   * Cleanup old localStorage entries
   */
  private cleanupLocalStorage(): void {
    const keys = Object.keys(localStorage)
    const entries: Array<{ key: string, created: number }> = []

    for (const key of keys) {
      if (key.startsWith(this.localStoragePrefix)) {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            const entry = JSON.parse(item)
            entries.push({ key, created: entry.created || 0 })
          }
        }
        catch (error) {
          localStorage.removeItem(key)
        }
      }
    }

    // Remove oldest entries if over limit
    entries.sort((a, b) => a.created - b.created)
    const toRemove = Math.max(0, entries.length - 50) // Keep max 50 entries

    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key)
    }
  }

  /**
   * Get from IndexedDB
   */
  private async getFromIndexedDB<T>(key: string): Promise<T | null> {
    if (!this.db)
      return null

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const request = store.get(key)

      request.onsuccess = () => {
        const entry = request.result
        if (!entry) {
          resolve(null)
          return
        }

        // Check TTL
        if (entry.ttl && Date.now() - entry.created > entry.ttl) {
          this.deleteFromIndexedDB(key)
          resolve(null)
          return
        }

        resolve(entry.data)
      }

      request.onerror = () => resolve(null)
    })
  }

  /**
   * Set in IndexedDB
   */
  private async setInIndexedDB<T>(key: string, data: T, size: number, ttl: number): Promise<void> {
    if (!this.db)
      return

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')

      const entry = {
        key,
        data,
        size,
        created: Date.now(),
        lastAccessed: Date.now(),
        ttl,
      }

      const request = store.put(entry)
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  }

  /**
   * Delete from IndexedDB
   */
  private async deleteFromIndexedDB(key: string): Promise<void> {
    if (!this.db)
      return

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  }

  /**
   * Clear IndexedDB
   */
  private async clearIndexedDB(): Promise<void> {
    if (!this.db)
      return

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  }

  /**
   * Estimate size of data
   */
  private estimateSize(data: any): number {
    if (data instanceof ArrayBuffer) {
      return data.byteLength
    }

    if (data instanceof Blob) {
      return data.size
    }

    if (typeof data === 'string') {
      return data.length * 2 // Approximate UTF-16 size
    }

    // For objects, use JSON stringify
    try {
      return JSON.stringify(data).length * 2
    }
    catch (error) {
      return 1024 // Default 1KB
    }
  }

  /**
   * Promote to memory cache
   */
  private promoteToMemory<T>(key: string, data: T, size: number): void {
    this.memoryCache.set(key, data, size, this.options.ttl)
  }

  /**
   * Promote to localStorage
   */
  private promoteToLocalStorage<T>(key: string, data: T): void {
    if (this.estimateSize(data) < 1024 * 100) {
      this.setInLocalStorage(key, data, this.options.ttl)
    }
  }

  /**
   * Trigger preloading
   */
  private triggerPreload(key: string): void {
    if (this.options.preloadStrategy === 'none')
      return

    if (this.options.preloadStrategy === 'adjacent') {
      // Preload adjacent items (e.g., next/prev in a sequence)
      const match = key.match(/(.+)_(\d+)$/)
      if (match) {
        const base = match[1]
        const index = Number.parseInt(match[2])

        this.preloadQueue.add(`${base}_${index + 1}`)
        this.preloadQueue.add(`${base}_${index - 1}`)
      }
    }
    else if (this.options.preloadStrategy === 'predictive') {
      // Use access patterns to predict next items
      const stats = this.memoryCache.getStats()
      const related = this.findRelatedKeys(key, stats)

      for (const relatedKey of related) {
        this.preloadQueue.add(relatedKey)
      }
    }

    this.processPreloadQueue()
  }

  /**
   * Find related keys based on access patterns
   */
  private findRelatedKeys(
    key: string,
    stats: Map<string, { accessCount: number, lastAccessed: number }>,
  ): string[] {
    const related: string[] = []
    const keyParts = key.split('_')

    for (const [otherKey, otherStats] of stats) {
      if (otherKey === key)
        continue

      // Find keys with similar patterns
      const otherParts = otherKey.split('_')
      let similarity = 0

      for (let i = 0; i < Math.min(keyParts.length, otherParts.length); i++) {
        if (keyParts[i] === otherParts[i])
          similarity++
      }

      // If similar and frequently accessed together
      if (similarity >= keyParts.length * 0.7 && otherStats.accessCount > 1) {
        related.push(otherKey)
      }
    }

    return related.slice(0, 3) // Return top 3 related keys
  }

  /**
   * Process preload queue
   */
  private async processPreloadQueue(): Promise<void> {
    if (this.preloadInProgress || this.preloadQueue.size === 0)
      return

    this.preloadInProgress = true

    // Process up to 3 items
    const toPreload = Array.from(this.preloadQueue).slice(0, 3)

    for (const key of toPreload) {
      this.preloadQueue.delete(key)

      // Check if already in memory
      if (this.memoryCache.get(key) === null) {
        // Try to load from lower levels
        await this.get(key)
      }
    }

    this.preloadInProgress = false

    // Continue processing if more items
    if (this.preloadQueue.size > 0) {
      setTimeout(() => this.processPreloadQueue(), 100)
    }
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    this.stats.memory.used = this.memoryCache.getSize()
    this.stats.memory.entries = this.memoryCache.getEntries()

    // Estimate localStorage usage
    let localStorageSize = 0
    let localStorageEntries = 0

    for (const key in localStorage) {
      if (key.startsWith(this.localStoragePrefix)) {
        localStorageSize += (key.length + (localStorage.getItem(key)?.length || 0)) * 2
        localStorageEntries++
      }
    }

    this.stats.localStorage.used = localStorageSize
    this.stats.localStorage.entries = localStorageEntries
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * Get cache keys
   */
  getKeys(): {
    memory: string[]
    localStorage: string[]
  } {
    const memory = this.memoryCache.getKeys()
    const localStorage: string[] = []

    for (const key in window.localStorage) {
      if (key.startsWith(this.localStoragePrefix)) {
        localStorage.push(key.replace(this.localStoragePrefix, ''))
      }
    }

    return { memory, localStorage }
  }

  /**
   * Warmup cache with initial data
   */
  async warmup(keys: string[], loader: (key: string) => Promise<any>): Promise<void> {
    const promises = keys.map(async (key) => {
      const cached = await this.get(key)
      if (cached === null) {
        const data = await loader(key)
        if (data !== null) {
          await this.set(key, data)
        }
      }
    })

    await Promise.all(promises)
  }
}
