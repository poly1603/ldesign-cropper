/**
 * Utility function tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LRUCache, SizeAwareCache, TTLCache } from '../src/utils/cache'
import { clamp, getAspectRatio, round } from '../src/utils/math'
import { debounce, memoize, throttle } from '../src/utils/performance'

describe('performance Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      // First call executes immediately
      throttled()
      expect(fn).toHaveBeenCalledTimes(1)

      // Multiple calls within throttle window
      throttled()
      throttled()
      // Still only called once during this window
      expect(fn).toHaveBeenCalledTimes(1)

      // Wait for throttle period to end
      vi.advanceTimersByTime(100)
      // The trailing call should have been queued
      expect(fn).toHaveBeenCalledTimes(2)

      // New call after throttle period
      throttled()
      // Should execute immediately as new throttle window
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should pass arguments correctly', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled('arg1', 'arg2')
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      debounced()
      debounced()

      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should reset timer on each call', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      vi.advanceTimersByTime(50)
      debounced()
      vi.advanceTimersByTime(50)

      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('memoize', () => {
    it('should cache function results', () => {
      const fn = vi.fn((a: number, b: number) => a + b)
      const memoized = memoize(fn)

      const result1 = memoized(1, 2)
      const result2 = memoized(1, 2)

      expect(result1).toBe(3)
      expect(result2).toBe(3)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should use custom key generator', () => {
      const fn = vi.fn((a: number, b: number) => a + b)
      const memoized = memoize(fn, (a, b) => `${a}:${b}`)

      memoized(1, 2)
      memoized(1, 2)
      memoized(2, 1)

      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})

describe('math Utilities', () => {
  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('getAspectRatio', () => {
    it('should calculate aspect ratio correctly', () => {
      expect(getAspectRatio(1920, 1080)).toBeCloseTo(16 / 9)
      expect(getAspectRatio(1080, 1080)).toBe(1)
      expect(getAspectRatio(1080, 1920)).toBeCloseTo(9 / 16)
    })

    it('should memoize results', () => {
      const ratio1 = getAspectRatio(1920, 1080)
      const ratio2 = getAspectRatio(1920, 1080)

      // Should return same reference (memoized)
      expect(ratio1).toBe(ratio2)
    })
  })

  describe('round', () => {
    it('should round to specified decimals', () => {
      expect(round(3.14159, 2)).toBe(3.14)
      expect(round(3.14159, 0)).toBe(3)
      expect(round(3.14159, 4)).toBe(3.1416)
    })
  })
})

describe('cache Utilities', () => {
  describe('lRUCache', () => {
    it('should store and retrieve values', () => {
      const cache = new LRUCache<string, number>(3)

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
    })

    it('should evict least recently used item', () => {
      const cache = new LRUCache<string, number>(3)

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // Should evict 'a'

      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('d')).toBe(4)
    })

    it('should update item position on access', () => {
      const cache = new LRUCache<string, number>(3)

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.get('a') // Make 'a' most recently used
      cache.set('d', 4) // Should evict 'b', not 'a'

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBeUndefined()
    })

    it('should clear all items', () => {
      const cache = new LRUCache<string, number>(3)

      cache.set('a', 1)
      cache.set('b', 2)
      cache.clear()

      expect(cache.size()).toBe(0)
      expect(cache.get('a')).toBeUndefined()
    })
  })

  describe('tTLCache', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should store and retrieve values', () => {
      const cache = new TTLCache<string, number>(1000)

      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)
    })

    it('should expire items after TTL', () => {
      const cache = new TTLCache<string, number>(1000)

      cache.set('a', 1)
      expect(cache.get('a')).toBe(1)

      vi.advanceTimersByTime(1001)
      expect(cache.get('a')).toBeUndefined()
    })

    it('should support custom TTL per item', () => {
      const cache = new TTLCache<string, number>(1000)

      cache.set('a', 1, 500)
      cache.set('b', 2, 1500)

      vi.advanceTimersByTime(600)
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
    })
  })

  describe('sizeAwareCache', () => {
    it('should track cache size', () => {
      const cache = new SizeAwareCache<string, string>(
        100,
        val => val.length,
      )

      cache.set('a', 'x'.repeat(30))
      cache.set('b', 'y'.repeat(40))

      expect(cache.getCurrentSize()).toBe(70)
    })

    it('should evict items when size limit reached', () => {
      const cache = new SizeAwareCache<string, string>(
        100,
        val => val.length,
      )

      cache.set('a', 'x'.repeat(60))
      cache.set('b', 'y'.repeat(50)) // Should evict 'a'

      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe('y'.repeat(50))
    })

    it('should not store items larger than max size', () => {
      const cache = new SizeAwareCache<string, string>(
        100,
        val => val.length,
      )

      const result = cache.set('a', 'x'.repeat(150))
      expect(result).toBe(false)
      expect(cache.get('a')).toBeUndefined()
    })
  })
})
