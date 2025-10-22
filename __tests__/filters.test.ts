/**
 * Filter tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { FilterEngine } from '../src/filters/FilterEngine'
import {
  brightnessFilter,
  contrastFilter,
  grayscaleFilter,
  sepiaFilter
} from '../src/filters/builtins'
import { valenciaPreset, applyPreset } from '../src/filters/presets'

describe('FilterEngine', () => {
  let filterEngine: FilterEngine
  let imageData: ImageData

  beforeEach(() => {
    filterEngine = new FilterEngine()

    // Create test image data (2x2 red image)
    imageData = new ImageData(2, 2)
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 255     // R
      imageData.data[i + 1] = 0   // G
      imageData.data[i + 2] = 0   // B
      imageData.data[i + 3] = 255 // A
    }
  })

  describe('Filter Registration', () => {
    it('should register filters', () => {
      filterEngine.registerFilter(brightnessFilter)

      const filter = filterEngine.getFilter('brightness')
      expect(filter).toBeDefined()
      expect(filter?.name).toBe('brightness')
    })

    it('should unregister filters', () => {
      filterEngine.registerFilter(brightnessFilter)
      filterEngine.unregisterFilter('brightness')

      const filter = filterEngine.getFilter('brightness')
      expect(filter).toBeUndefined()
    })

    it('should get all registered filters', () => {
      filterEngine.registerFilter(brightnessFilter)
      filterEngine.registerFilter(contrastFilter)

      const filters = filterEngine.getAllFilters()
      expect(filters).toHaveLength(2)
    })
  })

  describe('Filter Layers', () => {
    beforeEach(() => {
      filterEngine.registerFilter(brightnessFilter)
      filterEngine.registerFilter(contrastFilter)
    })

    it('should add filter layer', () => {
      const result = filterEngine.addFilterLayer('brightness', { brightness: 20 })
      expect(result).toBe(true)

      const layers = filterEngine.getFilterLayers()
      expect(layers).toHaveLength(1)
      expect(layers[0].filter.name).toBe('brightness')
    })

    it('should not add non-existent filter', () => {
      const result = filterEngine.addFilterLayer('nonexistent')
      expect(result).toBe(false)
    })

    it('should remove filter layer', () => {
      filterEngine.addFilterLayer('brightness')
      filterEngine.addFilterLayer('contrast')

      filterEngine.removeFilterLayer(0)

      const layers = filterEngine.getFilterLayers()
      expect(layers).toHaveLength(1)
      expect(layers[0].filter.name).toBe('contrast')
    })

    it('should update filter layer', () => {
      filterEngine.addFilterLayer('brightness', { brightness: 10 })

      filterEngine.updateFilterLayer(0, { brightness: 20 })

      const layers = filterEngine.getFilterLayers()
      expect(layers[0].options.brightness).toBe(20)
    })

    it('should clear all filters', () => {
      filterEngine.addFilterLayer('brightness')
      filterEngine.addFilterLayer('contrast')

      filterEngine.clearFilters()

      expect(filterEngine.getFilterLayers()).toHaveLength(0)
    })
  })

  describe('Filter Application', () => {
    beforeEach(() => {
      filterEngine.registerFilter(brightnessFilter)
      filterEngine.registerFilter(grayscaleFilter)
      filterEngine.setOriginalImageData(imageData)
    })

    it('should apply single filter', () => {
      filterEngine.addFilterLayer('brightness', { brightness: 50 })

      const filtered = filterEngine.applyFilters()
      expect(filtered).toBeDefined()

      // Brightness should increase red channel
      expect(filtered!.data[0]).toBeGreaterThan(imageData.data[0])
    })

    it('should apply multiple filters in sequence', () => {
      filterEngine.addFilterLayer('brightness', { brightness: 20 })
      filterEngine.addFilterLayer('grayscale', { intensity: 1 })

      const filtered = filterEngine.applyFilters()
      expect(filtered).toBeDefined()

      // After grayscale, R=G=B
      expect(filtered!.data[0]).toBe(filtered!.data[1])
      expect(filtered!.data[1]).toBe(filtered!.data[2])
    })

    it('should skip disabled filters', () => {
      filterEngine.addFilterLayer('brightness', { brightness: 50 }, false)

      const filtered = filterEngine.applyFilters()

      // Should be unchanged since filter is disabled
      expect(filtered!.data[0]).toBe(imageData.data[0])
    })

    it('should cache filter results', () => {
      filterEngine.addFilterLayer('brightness', { brightness: 20 })

      const filtered1 = filterEngine.applyFilters()
      const filtered2 = filterEngine.applyFilters()

      // Should return cached result (different object but same values)
      expect(filtered1!.data[0]).toBe(filtered2!.data[0])
    })
  })

  describe('Export/Import Configuration', () => {
    beforeEach(() => {
      filterEngine.registerFilter(brightnessFilter)
      filterEngine.registerFilter(contrastFilter)
    })

    it('should export configuration', () => {
      filterEngine.addFilterLayer('brightness', { brightness: 20 })
      filterEngine.addFilterLayer('contrast', { contrast: 15 })

      const config = filterEngine.exportConfig()

      expect(config.filters).toHaveLength(2)
      expect(config.filters[0].name).toBe('brightness')
      expect(config.filters[1].name).toBe('contrast')
    })

    it('should import configuration', () => {
      const config = {
        filters: [
          { name: 'brightness', options: { brightness: 20 }, enabled: true },
          { name: 'contrast', options: { contrast: 15 }, enabled: false }
        ]
      }

      const result = filterEngine.importConfig(config)
      expect(result).toBe(true)

      const layers = filterEngine.getFilterLayers()
      expect(layers).toHaveLength(2)
      expect(layers[0].enabled).toBe(true)
      expect(layers[1].enabled).toBe(false)
    })
  })
})

describe('Built-in Filters', () => {
  let imageData: ImageData

  beforeEach(() => {
    // Create test image data (2x2 with various colors)
    imageData = new ImageData(2, 2)
    const colors = [
      [255, 0, 0, 255],   // Red
      [0, 255, 0, 255],   // Green
      [0, 0, 255, 255],   // Blue
      [128, 128, 128, 255] // Gray
    ]

    colors.forEach((color, i) => {
      const offset = i * 4
      imageData.data[offset] = color[0]
      imageData.data[offset + 1] = color[1]
      imageData.data[offset + 2] = color[2]
      imageData.data[offset + 3] = color[3]
    })
  })

  describe('Brightness Filter', () => {
    it('should increase brightness', () => {
      const original = imageData.data[0]
      const filtered = brightnessFilter.apply(imageData, { brightness: 50 })

      expect(filtered.data[0]).toBeGreaterThan(original)
    })

    it('should decrease brightness', () => {
      const original = imageData.data[0]
      const filtered = brightnessFilter.apply(imageData, { brightness: -50 })

      expect(filtered.data[0]).toBeLessThan(original)
    })
  })

  describe('Grayscale Filter', () => {
    it('should convert to grayscale', () => {
      const filtered = grayscaleFilter.apply(imageData, { intensity: 1 })

      // First pixel (red) should have equal RGB values
      expect(filtered.data[0]).toBe(filtered.data[1])
      expect(filtered.data[1]).toBe(filtered.data[2])
    })

    it('should support partial intensity', () => {
      const original = {
        r: imageData.data[0],
        g: imageData.data[1],
        b: imageData.data[2]
      }

      const filtered = grayscaleFilter.apply(imageData, { intensity: 0.5 })

      // Should be between original and fully grayscale
      expect(filtered.data[0]).not.toBe(original.r)
      expect(filtered.data[0]).not.toBe(filtered.data[1])
    })
  })

  describe('Sepia Filter', () => {
    it('should apply sepia tone', () => {
      const filtered = sepiaFilter.apply(imageData, { intensity: 1 })

      // Sepia should have warm tones (R > G > B typically)
      expect(filtered.data[0]).toBeGreaterThan(0)
    })
  })
})

describe('Filter Presets', () => {
  let filterEngine: FilterEngine
  let imageData: ImageData

  beforeEach(() => {
    filterEngine = new FilterEngine()

    // Register all required filters
    filterEngine.registerFilter(brightnessFilter)
    filterEngine.registerFilter(contrastFilter)

    // Create test image
    imageData = new ImageData(2, 2)
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 128
      imageData.data[i + 1] = 128
      imageData.data[i + 2] = 128
      imageData.data[i + 3] = 255
    }

    filterEngine.setOriginalImageData(imageData)
  })

  it('should apply Valencia preset', () => {
    const result = applyPreset(filterEngine, valenciaPreset)
    expect(result).toBe(true)

    const layers = filterEngine.getFilterLayers()
    expect(layers.length).toBeGreaterThan(0)
  })

  it('should have correct preset structure', () => {
    expect(valenciaPreset.name).toBe('Valencia')
    expect(valenciaPreset.description).toBeDefined()
    expect(valenciaPreset.filters).toBeInstanceOf(Array)
    expect(valenciaPreset.filters.length).toBeGreaterThan(0)
  })
})

