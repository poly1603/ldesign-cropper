/**
 * Performance Benchmarks
 * Run with: npm run test:benchmark
 */

import { bench, describe } from 'vitest'
import { FilterEngine, getAllBuiltInFilters } from '../src/filters'
import { LRUCache } from '../src/utils/cache'
import { clamp, fastCos, fastSin, getAspectRatio } from '../src/utils/math'
import { debounce, memoize, throttle } from '../src/utils/performance'

describe('performance Benchmarks', () => {
  describe('math Operations', () => {
    bench('clamp', () => {
      clamp(Math.random() * 200 - 100, 0, 100)
    })

    bench('getAspectRatio (memoized)', () => {
      getAspectRatio(1920, 1080)
    })

    bench('fastSin (lookup table)', () => {
      fastSin(Math.floor(Math.random() * 360))
    })

    bench('math.sin (native)', () => {
      Math.sin((Math.floor(Math.random() * 360) * Math.PI) / 180)
    })

    bench('fastCos (lookup table)', () => {
      fastCos(Math.floor(Math.random() * 360))
    })

    bench('math.cos (native)', () => {
      Math.cos((Math.floor(Math.random() * 360) * Math.PI) / 180)
    })
  })

  describe('cache Operations', () => {
    const cache = new LRUCache<string, number>(100)

    // Populate cache
    for (let i = 0; i < 50; i++) {
      cache.set(`key${i}`, i)
    }

    bench('lRUCache.get (hit)', () => {
      cache.get('key25')
    })

    bench('lRUCache.get (miss)', () => {
      cache.get('nonexistent')
    })

    bench('lRUCache.set', () => {
      cache.set(`key${Math.random()}`, Math.random())
    })
  })

  describe('function Utilities', () => {
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

  describe('filter Operations', () => {
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

    bench('filter - Brightness', () => {
      engine.clearFilters()
      engine.addFilterLayer('brightness', { brightness: 20 })
      engine.applyFilters()
    })

    bench('filter - Grayscale', () => {
      engine.clearFilters()
      engine.addFilterLayer('grayscale', { intensity: 1 })
      engine.applyFilters()
    })

    bench('filter - Blur', () => {
      engine.clearFilters()
      engine.addFilterLayer('blur', { radius: 5 })
      engine.applyFilters()
    })

    bench('filter Chain (3 filters)', () => {
      engine.clearFilters()
      engine.addFilterLayer('brightness', { brightness: 10 })
      engine.addFilterLayer('contrast', { contrast: 15 })
      engine.addFilterLayer('saturation', { saturation: 20 })
      engine.applyFilters()
    })

    bench('filter with Cache (same config)', () => {
      // Should hit cache
      engine.applyFilters()
    })
  })

  describe('canvas Operations', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600

    bench('create canvas', () => {
      const c = document.createElement('canvas')
      c.width = 800
      c.height = 600
    })

    bench('get canvas context', () => {
      canvas.getContext('2d')
    })

    bench('canvas toBlob', async () => {
      await new Promise((resolve) => {
        canvas.toBlob(resolve)
      })
    })
  })
})
