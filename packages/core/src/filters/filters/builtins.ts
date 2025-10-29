/**
 * Built-in Filters
 * Common image filters implementation
 */

import type { Filter, FilterOptions } from './FilterEngine'
import { clamp } from '../utils/math'

/**
 * Brightness filter
 */
export const brightnessFilter: Filter = {
  name: 'brightness',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const brightness = options.brightness || 0 // -100 to 100
    const factor = 1 + brightness / 100

    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(data[i] * factor, 0, 255)
      data[i + 1] = clamp(data[i + 1] * factor, 0, 255)
      data[i + 2] = clamp(data[i + 2] * factor, 0, 255)
    }

    return imageData
  },
}

/**
 * Contrast filter
 */
export const contrastFilter: Filter = {
  name: 'contrast',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const contrast = options.contrast || 0 // -100 to 100
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))

    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(factor * (data[i] - 128) + 128, 0, 255)
      data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128, 0, 255)
      data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128, 0, 255)
    }

    return imageData
  },
}

/**
 * Saturation filter
 */
export const saturationFilter: Filter = {
  name: 'saturation',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const saturation = options.saturation || 0 // -100 to 100
    const factor = 1 + saturation / 100

    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Calculate grayscale using luminance weights
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b

      data[i] = clamp(gray + factor * (r - gray), 0, 255)
      data[i + 1] = clamp(gray + factor * (g - gray), 0, 255)
      data[i + 2] = clamp(gray + factor * (b - gray), 0, 255)
    }

    return imageData
  },
}

/**
 * Hue rotation filter
 */
export const hueFilter: Filter = {
  name: 'hue',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const hue = ((options.hue || 0) % 360) * (Math.PI / 180)
    const cos = Math.cos(hue)
    const sin = Math.sin(hue)

    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      data[i] = clamp(
        r * (0.299 + 0.701 * cos + 0.168 * sin)
        + g * (0.587 - 0.587 * cos + 0.330 * sin)
        + b * (0.114 - 0.114 * cos - 0.497 * sin),
        0,
        255,
      )
      data[i + 1] = clamp(
        r * (0.299 - 0.299 * cos - 0.328 * sin)
        + g * (0.587 + 0.413 * cos + 0.035 * sin)
        + b * (0.114 - 0.114 * cos + 0.292 * sin),
        0,
        255,
      )
      data[i + 2] = clamp(
        r * (0.299 - 0.300 * cos + 1.250 * sin)
        + g * (0.587 - 0.588 * cos - 1.050 * sin)
        + b * (0.114 + 0.886 * cos - 0.203 * sin),
        0,
        255,
      )
    }

    return imageData
  },
}

/**
 * Grayscale filter
 */
export const grayscaleFilter: Filter = {
  name: 'grayscale',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const intensity = options.intensity !== undefined ? options.intensity : 1

    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const gray
        = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      data[i] = data[i] + (gray - data[i]) * intensity
      data[i + 1] = data[i + 1] + (gray - data[i + 1]) * intensity
      data[i + 2] = data[i + 2] + (gray - data[i + 2]) * intensity
    }

    return imageData
  },
}

/**
 * Sepia filter
 */
export const sepiaFilter: Filter = {
  name: 'sepia',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const intensity = options.intensity !== undefined ? options.intensity : 1

    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const newR = clamp(
        r * (1 - 0.607 * intensity)
        + g * 0.769 * intensity
        + b * 0.189 * intensity,
        0,
        255,
      )
      const newG = clamp(
        r * 0.349 * intensity
        + g * (1 - 0.314 * intensity)
        + b * 0.168 * intensity,
        0,
        255,
      )
      const newB = clamp(
        r * 0.272 * intensity
        + g * 0.534 * intensity
        + b * (1 - 0.869 * intensity),
        0,
        255,
      )

      data[i] = r + (newR - r) * intensity
      data[i + 1] = g + (newG - g) * intensity
      data[i + 2] = b + (newB - b) * intensity
    }

    return imageData
  },
}

/**
 * Invert filter
 */
export const invertFilter: Filter = {
  name: 'invert',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const intensity = options.intensity !== undefined ? options.intensity : 1

    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] + (255 - data[i] - data[i]) * intensity
      data[i + 1] = data[i + 1] + (255 - data[i + 1] - data[i + 1]) * intensity
      data[i + 2] = data[i + 2] + (255 - data[i + 2] - data[i + 2]) * intensity
    }

    return imageData
  },
}

/**
 * Box blur filter (simple and fast)
 */
export const blurFilter: Filter = {
  name: 'blur',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const radius = Math.max(1, Math.floor(options.radius || 5))
    const width = imageData.width
    const height = imageData.height
    const data = imageData.data
    const output = new Uint8ClampedArray(data)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0
        let g = 0
        let b = 0
        let a = 0
        let count = 0

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx
            const ny = y + dy

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4
              r += data[idx]
              g += data[idx + 1]
              b += data[idx + 2]
              a += data[idx + 3]
              count++
            }
          }
        }

        const idx = (y * width + x) * 4
        output[idx] = r / count
        output[idx + 1] = g / count
        output[idx + 2] = b / count
        output[idx + 3] = a / count
      }
    }

    imageData.data.set(output)
    return imageData
  },
}

/**
 * Sharpen filter
 */
export const sharpenFilter: Filter = {
  name: 'sharpen',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const amount = options.amount !== undefined ? options.amount : 1
    const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0]

    return applyConvolutionFilter(imageData, kernel, 1)
  },
}

/**
 * Edge detection filter
 */
export const edgeDetectFilter: Filter = {
  name: 'edgeDetect',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1]
    return applyConvolutionFilter(imageData, kernel, 1)
  },
}

/**
 * Emboss filter
 */
export const embossFilter: Filter = {
  name: 'emboss',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2]
    return applyConvolutionFilter(imageData, kernel, 1)
  },
}

/**
 * Vignette filter
 */
export const vignetteFilter: Filter = {
  name: 'vignette',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const strength = options.strength !== undefined ? options.strength : 0.5
    const width = imageData.width
    const height = imageData.height
    const data = imageData.data

    const centerX = width / 2
    const centerY = height / 2
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX
        const dy = y - centerY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const vignette = 1 - (dist / maxDist) * strength

        const idx = (y * width + x) * 4
        data[idx] *= vignette
        data[idx + 1] *= vignette
        data[idx + 2] *= vignette
      }
    }

    return imageData
  },
}

/**
 * Temperature filter (warm/cool)
 */
export const temperatureFilter: Filter = {
  name: 'temperature',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const temp = options.temperature || 0 // -100 (cool) to 100 (warm)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      if (temp > 0) {
        // Warm: increase red, decrease blue
        data[i] = clamp(data[i] + temp * 2, 0, 255)
        data[i + 2] = clamp(data[i + 2] - temp, 0, 255)
      }
      else if (temp < 0) {
        // Cool: decrease red, increase blue
        data[i] = clamp(data[i] + temp, 0, 255)
        data[i + 2] = clamp(data[i + 2] - temp * 2, 0, 255)
      }
    }

    return imageData
  },
}

/**
 * Exposure filter
 */
export const exposureFilter: Filter = {
  name: 'exposure',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const exposure = options.exposure || 0 // -100 to 100
    const factor = 2 ** (exposure / 100)

    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(data[i] * factor, 0, 255)
      data[i + 1] = clamp(data[i + 1] * factor, 0, 255)
      data[i + 2] = clamp(data[i + 2] * factor, 0, 255)
    }

    return imageData
  },
}

/**
 * Noise filter
 */
export const noiseFilter: Filter = {
  name: 'noise',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const amount = options.amount !== undefined ? options.amount : 10
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * amount * 2
      data[i] = clamp(data[i] + noise, 0, 255)
      data[i + 1] = clamp(data[i + 1] + noise, 0, 255)
      data[i + 2] = clamp(data[i + 2] + noise, 0, 255)
    }

    return imageData
  },
}

/**
 * Pixelate filter
 */
export const pixelateFilter: Filter = {
  name: 'pixelate',
  apply: (imageData: ImageData, options: FilterOptions = {}): ImageData => {
    const blockSize = Math.max(1, Math.floor(options.blockSize || 10))
    const width = imageData.width
    const height = imageData.height
    const data = imageData.data

    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        // Calculate average color for this block
        let r = 0
        let g = 0
        let b = 0
        let a = 0
        let count = 0

        for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
          for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4
            r += data[idx]
            g += data[idx + 1]
            b += data[idx + 2]
            a += data[idx + 3]
            count++
          }
        }

        r /= count
        g /= count
        b /= count
        a /= count

        // Apply average color to all pixels in block
        for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
          for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4
            data[idx] = r
            data[idx + 1] = g
            data[idx + 2] = b
            data[idx + 3] = a
          }
        }
      }
    }

    return imageData
  },
}

/**
 * Apply convolution filter
 */
function applyConvolutionFilter(
  imageData: ImageData,
  kernel: number[],
  divisor: number = 1,
): ImageData {
  const width = imageData.width
  const height = imageData.height
  const data = imageData.data
  const output = new Uint8ClampedArray(data)

  const side = Math.floor(Math.sqrt(kernel.length))
  const half = Math.floor(side / 2)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0
      let g = 0
      let b = 0

      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const nx = x + kx - half
          const ny = y + ky - half

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4
            const weight = kernel[ky * side + kx]
            r += data[idx] * weight
            g += data[idx + 1] * weight
            b += data[idx + 2] * weight
          }
        }
      }

      const idx = (y * width + x) * 4
      output[idx] = clamp(r / divisor, 0, 255)
      output[idx + 1] = clamp(g / divisor, 0, 255)
      output[idx + 2] = clamp(b / divisor, 0, 255)
    }
  }

  imageData.data.set(output)
  return imageData
}

/**
 * Get all built-in filters
 */
export function getAllBuiltInFilters(): Filter[] {
  return [
    brightnessFilter,
    contrastFilter,
    saturationFilter,
    hueFilter,
    grayscaleFilter,
    sepiaFilter,
    invertFilter,
    blurFilter,
    sharpenFilter,
    edgeDetectFilter,
    embossFilter,
    vignetteFilter,
    temperatureFilter,
    exposureFilter,
    noiseFilter,
    pixelateFilter,
  ]
}
