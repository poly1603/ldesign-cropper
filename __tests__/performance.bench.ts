/**
 * Performance Benchmarks
 * Run with: npm run test:benchmark
 */

import { bench, describe } from 'vitest'
import { Cropper } from '../src/core/Cropper'
import { throttle, debounce, memoize } from '../src/utils/performance'
import { LRUCache } from '../src/utils/cache'
import { getAspectRatio, clamp, fastSin, fastCos } from '../src/utils/math'
import { FilterEngine, getAllBuiltInFilters } from '../src/filters'

describe('Performance Benchmarks', () => {
  describe('Math Operations', () => {
    bench('clamp', () => {
      clamp(Math.random() * 200 - 100, 0, 100)
    })

    bench('getAspectRatio (memoized)', () => {
      getAspectRatio(1920, 1080)
    })

    bench('fastSin (lookup table)', () => {
      fastSin(Math.floor(Math.random() * 360))
    })

    bench('Math.sin (native)', () => {
      Math.sin((Math.floor(Math.random() * 360) * Math.PI) / 180)
    })

    bench('fastCos (lookup table)', () => {
      fastCos(Math.floor(Math.random() * 360))
    })

    bench('Math.cos (native)', () => {
      Math.cos((Math.floor(Math.random() * 360) * Math.PI) / 180)
    })
  })

  describe('Cache Operations', () => {
    const cache = new LRUCache<string, number>(100)

    // Populate cache
    for (let i = 0; i < 50; i++) {
      cache.set(`key${i}`, i)
    }

    bench('LRUCache.get (hit)', () => {
      cache.get('key25')
    })

    bench('LRUCache.get (miss)', () => {
      cache.get('nonexistent')
    })

    bench('LRUCache.set', () => {
      cache.set(`key${Math.random()}`, Math.random())
    })
  })

  describe('Function Utilities', () => {
    const fn = (a: number, b: number) => a + b

    bench('throttle function', () => {
      const throttled = throttle(fn, 16)
      throttled(1, 2)
    })

    bench('debounce function', () => {
      const debounced = debounce(fn, 16)
      debounced(1, 2)
    })

    bench('memoize function', () => {
      const memoized = memoize(fn)
      memoized(1, 2)
    })
  })

  describe('Filter Operations', () => {
    const engine = new FilterEngine()
    getAllBuiltInFilters().forEach(f => engine.registerFilter(f))

    // Create test image data (100x100)
    const imageData = new ImageData(100, 100)
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = Math.random() * 255
      imageData.data[i + 1] = Math.random() * 255
      imageData.data[i + 2] = Math.random() * 255
      imageData.data[i + 3] = 255
    }

    engine.setOriginalImageData(imageData)

    bench('Filter - Brightness', () => {
      engine.clearFilters()
      engine.addFilterLayer('brightness', { brightness: 20 })
      engine.applyFilters()
    })

    bench('Filter - Grayscale', () => {
      engine.clearFilters()
      engine.addFilterLayer('grayscale', { intensity: 1 })
      engine.applyFilters()
    })

    bench('Filter - Blur', () => {
      engine.clearFilters()
      engine.addFilterLayer('blur', { radius: 5 })
      engine.applyFilters()
    })

    bench('Filter Chain (3 filters)', () => {
      engine.clearFilters()
      engine.addFilterLayer('brightness', { brightness: 10 })
      engine.addFilterLayer('contrast', { contrast: 15 })
      engine.addFilterLayer('saturation', { saturation: 20 })
      engine.applyFilters()
    })

    bench('Filter with Cache (same config)', () => {
      // Should hit cache
      engine.applyFilters()
    })
  })

  describe('Canvas Operations', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600

    bench('Create canvas', () => {
      const c = document.createElement('canvas')
      c.width = 800
      c.height = 600
    })

    bench('Get canvas context', () => {
      canvas.getContext('2d')
    })

    bench('Canvas toBlob', async () => {
      await new Promise((resolve) => {
        canvas.toBlob(resolve)
      })
    })
  })
})

