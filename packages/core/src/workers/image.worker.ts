/**
 * Image processing worker
 * Handles heavy image operations in a separate thread
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
  WorkerResponse,
} from './types'

// Import filters (will be bundled with the worker)
import { getAllBuiltInFilters } from '../filters/builtins'
import { FilterEngine } from '../filters/FilterEngine'

// Message handler
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, data } = event.data

  try {
    let result: any

    switch (type) {
      case 'applyFilter':
        result = await applyFilter(data as FilterWorkerData)
        break

      case 'applyFilterBatch':
        result = await applyFilterBatch(data as BatchFilterWorkerData)
        break

      case 'resizeImage':
        result = await resizeImage(data as ResizeWorkerData)
        break

      case 'rotateImage':
        result = await rotateImage(data as RotateWorkerData)
        break

      case 'cropImage':
        result = await cropImage(data as CropWorkerData)
        break

      case 'generateThumbnail':
        result = await generateThumbnail(data as ThumbnailWorkerData)
        break

      case 'analyzeImage':
        result = await analyzeImage(data as ImageData)
        break

      case 'detectFaces':
        result = await detectFaces(data as ImageData)
        break

      case 'suggestComposition':
        result = await suggestComposition(data as ImageData)
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }

    const response: WorkerResponse = {
      id,
      success: true,
      data: result,
    }

    self.postMessage(response)
  }
  catch (error) {
    const response: WorkerResponse = {
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }

    self.postMessage(response)
  }
})

// Filter processing
async function applyFilter(data: FilterWorkerData): Promise<ImageData> {
  const { imageData, filterName, filterOptions } = data

  const filterEngine = new FilterEngine()
  const filters = getAllBuiltInFilters()

  // Register all filters
  filters.forEach(filter => filterEngine.registerFilter(filter))

  // Apply the requested filter
  filterEngine.addFilterLayer(filterName, filterOptions)

  return filterEngine.applyFilters(imageData)
}

// Batch filter processing with progress
async function applyFilterBatch(data: BatchFilterWorkerData): Promise<ImageData[]> {
  const { images, filterName, filterOptions } = data
  const results: ImageData[] = []

  const filterEngine = new FilterEngine()
  const filters = getAllBuiltInFilters()
  filters.forEach(filter => filterEngine.registerFilter(filter))

  for (let i = 0; i < images.length; i++) {
    // Apply filter
    filterEngine.clearFilterLayers()
    filterEngine.addFilterLayer(filterName, filterOptions)
    const result = filterEngine.applyFilters(images[i])
    results.push(result)

    // Send progress update
    const progress = ((i + 1) / images.length) * 100
    const progressResponse: WorkerResponse = {
      id: 'progress',
      success: true,
      progress,
    }
    self.postMessage(progressResponse)
  }

  return results
}

// Image resizing with different algorithms
async function resizeImage(data: ResizeWorkerData): Promise<ImageData> {
  const { imageData, width, height, algorithm = 'bilinear' } = data

  // Create temporary canvas for resizing
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Configure quality settings based on algorithm
  switch (algorithm) {
    case 'bicubic':
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      break
    case 'lanczos':
      // Lanczos would require custom implementation
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      break
    default:
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'medium'
  }

  // Create temporary canvas with original image
  const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height)
  const tempCtx = tempCanvas.getContext('2d')

  if (!tempCtx) {
    throw new Error('Failed to get temp canvas context')
  }

  tempCtx.putImageData(imageData, 0, 0)

  // Draw resized image
  ctx.drawImage(tempCanvas, 0, 0, width, height)

  return ctx.getImageData(0, 0, width, height)
}

// Image rotation
async function rotateImage(data: RotateWorkerData): Promise<ImageData> {
  const { imageData, angle, fillColor = '#ffffff' } = data

  const radians = (angle * Math.PI) / 180
  const sin = Math.abs(Math.sin(radians))
  const cos = Math.abs(Math.cos(radians))

  // Calculate new dimensions
  const newWidth = Math.round(imageData.width * cos + imageData.height * sin)
  const newHeight = Math.round(imageData.width * sin + imageData.height * cos)

  // Create canvas
  const canvas = new OffscreenCanvas(newWidth, newHeight)
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Fill background
  ctx.fillStyle = fillColor
  ctx.fillRect(0, 0, newWidth, newHeight)

  // Translate and rotate
  ctx.translate(newWidth / 2, newHeight / 2)
  ctx.rotate(radians)

  // Create temp canvas with original image
  const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height)
  const tempCtx = tempCanvas.getContext('2d')

  if (!tempCtx) {
    throw new Error('Failed to get temp canvas context')
  }

  tempCtx.putImageData(imageData, 0, 0)

  // Draw rotated image
  ctx.drawImage(
    tempCanvas,
    -imageData.width / 2,
    -imageData.height / 2,
  )

  return ctx.getImageData(0, 0, newWidth, newHeight)
}

// Image cropping
async function cropImage(data: CropWorkerData): Promise<ImageData> {
  const { imageData, x, y, width, height } = data

  // Validate crop bounds
  const cropX = Math.max(0, Math.min(x, imageData.width))
  const cropY = Math.max(0, Math.min(y, imageData.height))
  const cropWidth = Math.min(width, imageData.width - cropX)
  const cropHeight = Math.min(height, imageData.height - cropY)

  // Create canvas for cropping
  const canvas = new OffscreenCanvas(cropWidth, cropHeight)
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Create temp canvas with original image
  const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height)
  const tempCtx = tempCanvas.getContext('2d')

  if (!tempCtx) {
    throw new Error('Failed to get temp canvas context')
  }

  tempCtx.putImageData(imageData, 0, 0)

  // Draw cropped portion
  ctx.drawImage(
    tempCanvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  )

  return ctx.getImageData(0, 0, cropWidth, cropHeight)
}

// Thumbnail generation
async function generateThumbnail(data: ThumbnailWorkerData): Promise<ImageData> {
  const { imageData, width, height, quality = 0.8 } = data

  // Calculate aspect ratio preserving dimensions
  const aspectRatio = imageData.width / imageData.height
  let targetWidth = width
  let targetHeight = height

  if (aspectRatio > width / height) {
    targetHeight = width / aspectRatio
  }
  else {
    targetWidth = height * aspectRatio
  }

  // Use resize function
  return resizeImage({
    imageData,
    width: Math.round(targetWidth),
    height: Math.round(targetHeight),
    quality,
    algorithm: 'bilinear',
  })
}

// Image analysis
async function analyzeImage(imageData: ImageData): Promise<ImageAnalysisResult> {
  const pixels = imageData.data
  const pixelCount = pixels.length / 4

  let totalBrightness = 0
  let totalSaturation = 0
  let hasTransparency = false

  const redHistogram = Array.from({ length: 256 }).fill(0)
  const greenHistogram = Array.from({ length: 256 }).fill(0)
  const blueHistogram = Array.from({ length: 256 }).fill(0)

  const colorMap = new Map<string, number>()

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const a = pixels[i + 3]

    // Check transparency
    if (a < 255) {
      hasTransparency = true
    }

    // Calculate brightness (perceived)
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    totalBrightness += brightness

    // Calculate saturation (HSL)
    const max = Math.max(r, g, b) / 255
    const min = Math.min(r, g, b) / 255
    const saturation = max === 0 ? 0 : (max - min) / max
    totalSaturation += saturation

    // Update histograms
    redHistogram[r]++
    greenHistogram[g]++
    blueHistogram[b]++

    // Track colors for dominant color analysis
    const colorKey = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
  }

  // Calculate averages
  const avgBrightness = totalBrightness / pixelCount
  const avgSaturation = totalSaturation / pixelCount

  // Calculate contrast (standard deviation of brightness)
  let brightnessVariance = 0
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    brightnessVariance += (brightness - avgBrightness) ** 2
  }
  const contrast = Math.sqrt(brightnessVariance / pixelCount)

  // Get dominant colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(n => Number.parseInt(n) * 32 + 16)
      return `rgb(${r},${g},${b})`
    })

  return {
    brightness: avgBrightness,
    contrast,
    saturation: avgSaturation,
    dominantColors: sortedColors,
    histogram: {
      red: redHistogram,
      green: greenHistogram,
      blue: blueHistogram,
    },
    hasTransparency,
  }
}

// Simple face detection using Viola-Jones algorithm principles
async function detectFaces(imageData: ImageData): Promise<FaceDetectionResult> {
  // This is a simplified face detection algorithm
  // For production, consider using a proper library or model

  const faces: FaceDetectionResult['faces'] = []

  // Convert to grayscale
  const grayscale = new Uint8ClampedArray(imageData.width * imageData.height)
  for (let i = 0, j = 0; i < imageData.data.length; i += 4, j++) {
    const gray = Math.round(
      0.299 * imageData.data[i]
      + 0.587 * imageData.data[i + 1]
      + 0.114 * imageData.data[i + 2],
    )
    grayscale[j] = gray
  }

  // Simple skin tone detection as a basic heuristic
  const skinRegions = detectSkinRegions(imageData)

  // Find connected components that could be faces
  for (const region of skinRegions) {
    // Basic face-like aspect ratio check
    const aspectRatio = region.width / region.height
    if (aspectRatio >= 0.6 && aspectRatio <= 1.4 && region.width >= 50 && region.height >= 50) {
      faces.push({
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
        confidence: 0.5 + (1 - Math.abs(aspectRatio - 1)) * 0.3,
      })
    }
  }

  return { faces }
}

// Helper function for skin detection
function detectSkinRegions(imageData: ImageData): Array<{ x: number, y: number, width: number, height: number }> {
  const width = imageData.width
  const height = imageData.height
  const pixels = imageData.data
  const skinMask = new Uint8ClampedArray(width * height)

  // Detect skin pixels using RGB rules
  for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]

    // Simple skin detection rules
    const isSkin = (
      r > 95 && g > 40 && b > 20
      && r > g && r > b
      && Math.abs(r - g) > 15
      && r - g > 15
    )

    skinMask[j] = isSkin ? 255 : 0
  }

  // Find connected components
  const regions: Array<{ x: number, y: number, width: number, height: number }> = []
  const visited = new Uint8ClampedArray(width * height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (skinMask[idx] && !visited[idx]) {
        const region = floodFill(skinMask, visited, x, y, width, height)
        if (region.pixelCount > 100) { // Minimum size threshold
          regions.push({
            x: region.minX,
            y: region.minY,
            width: region.maxX - region.minX,
            height: region.maxY - region.minY,
          })
        }
      }
    }
  }

  return regions
}

// Helper function for flood fill
function floodFill(
  mask: Uint8ClampedArray,
  visited: Uint8ClampedArray,
  startX: number,
  startY: number,
  width: number,
  height: number,
): { minX: number, maxX: number, minY: number, maxY: number, pixelCount: number } {
  const stack: Array<[number, number]> = [[startX, startY]]
  let minX = startX; let maxX = startX
  let minY = startY; let maxY = startY
  let pixelCount = 0

  while (stack.length > 0) {
    const [x, y] = stack.pop()!
    const idx = y * width + x

    if (x < 0 || x >= width || y < 0 || y >= height || visited[idx] || !mask[idx]) {
      continue
    }

    visited[idx] = 1
    pixelCount++

    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }

  return { minX, maxX, minY, maxY, pixelCount }
}

// Composition suggestions
async function suggestComposition(imageData: ImageData): Promise<CompositionSuggestion[]> {
  const suggestions: CompositionSuggestion[] = []
  const analysis = await analyzeImage(imageData)

  // Rule of thirds
  suggestions.push({
    type: 'rule-of-thirds',
    cropBox: {
      x: imageData.width * 0.1,
      y: imageData.height * 0.1,
      width: imageData.width * 0.8,
      height: imageData.height * 0.8,
    },
    score: 0.8,
    description: 'Classic rule of thirds composition',
  })

  // Golden ratio
  const goldenRatio = 1.618
  const goldenWidth = imageData.height * goldenRatio
  const goldenHeight = imageData.width / goldenRatio

  if (goldenWidth <= imageData.width) {
    suggestions.push({
      type: 'golden-ratio',
      cropBox: {
        x: (imageData.width - goldenWidth) / 2,
        y: 0,
        width: goldenWidth,
        height: imageData.height,
      },
      score: 0.85,
      description: 'Golden ratio composition (horizontal)',
    })
  }

  if (goldenHeight <= imageData.height) {
    suggestions.push({
      type: 'golden-ratio',
      cropBox: {
        x: 0,
        y: (imageData.height - goldenHeight) / 2,
        width: imageData.width,
        height: goldenHeight,
      },
      score: 0.85,
      description: 'Golden ratio composition (vertical)',
    })
  }

  // Center composition (good for portraits)
  const centerSize = Math.min(imageData.width, imageData.height) * 0.7
  suggestions.push({
    type: 'center',
    cropBox: {
      x: (imageData.width - centerSize) / 2,
      y: (imageData.height - centerSize) / 2,
      width: centerSize,
      height: centerSize,
    },
    score: 0.7,
    description: 'Centered square composition',
  })

  // Diagonal composition
  suggestions.push({
    type: 'diagonal',
    cropBox: {
      x: imageData.width * 0.05,
      y: imageData.height * 0.05,
      width: imageData.width * 0.9,
      height: imageData.height * 0.9,
    },
    score: 0.75,
    description: 'Dynamic diagonal composition',
  })

  // Sort by score
  return suggestions.sort((a, b) => b.score - a.score)
}

// Export for TypeScript
export { }
