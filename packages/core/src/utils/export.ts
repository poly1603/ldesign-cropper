/**
 * Export utilities
 * Enhanced export capabilities with quality presets and watermarking
 */

import { QUALITY_PRESETS, IMAGE } from '../config/constants'

export interface ExportOptions {
  format?: 'png' | 'jpeg' | 'webp'
  quality?: number
  width?: number
  height?: number
  watermark?: WatermarkOptions
  metadata?: ExportMetadata
  progressive?: boolean
}

export interface WatermarkOptions {
  text?: string
  image?: HTMLImageElement
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  opacity?: number
  fontSize?: number
  fontFamily?: string
  color?: string
  margin?: number
}

export interface ExportMetadata {
  title?: string
  author?: string
  description?: string
  copyright?: string
  software?: string
}

/**
 * Export canvas with enhanced options
 */
export async function exportCanvas(
  canvas: HTMLCanvasElement,
  options: ExportOptions = {}
): Promise<Blob> {
  const {
    format = 'png',
    quality = IMAGE.DEFAULT_PNG_QUALITY,
    width,
    height,
    watermark,
    progressive = false
  } = options

  // Create output canvas
  let outputCanvas = canvas

  // Resize if needed
  if (width || height) {
    outputCanvas = resizeCanvas(canvas, width, height)
  }

  // Apply watermark if provided
  if (watermark) {
    outputCanvas = applyWatermark(outputCanvas, watermark)
  }

  // Convert to blob
  const mimeType = `image/${format}`
  const blob = await new Promise<Blob>((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      mimeType,
      quality
    )
  })

  return blob
}

/**
 * Resize canvas
 */
function resizeCanvas(
  canvas: HTMLCanvasElement,
  width?: number,
  height?: number
): HTMLCanvasElement {
  const sourceWidth = canvas.width
  const sourceHeight = canvas.height
  const aspectRatio = sourceWidth / sourceHeight

  let targetWidth = width || sourceWidth
  let targetHeight = height || sourceHeight

  // Maintain aspect ratio if only one dimension provided
  if (width && !height) {
    targetHeight = width / aspectRatio
  } else if (height && !width) {
    targetWidth = height * aspectRatio
  }

  const resized = document.createElement('canvas')
  resized.width = targetWidth
  resized.height = targetHeight

  const ctx = resized.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')

  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight)

  return resized
}

/**
 * Apply watermark to canvas
 */
function applyWatermark(
  canvas: HTMLCanvasElement,
  options: WatermarkOptions
): HTMLCanvasElement {
  const output = document.createElement('canvas')
  output.width = canvas.width
  output.height = canvas.height

  const ctx = output.getContext('2d')
  if (!ctx) return canvas

  // Draw original image
  ctx.drawImage(canvas, 0, 0)

  // Apply watermark
  ctx.globalAlpha = options.opacity || 0.5

  if (options.text) {
    applyTextWatermark(ctx, canvas.width, canvas.height, options)
  } else if (options.image) {
    applyImageWatermark(ctx, canvas.width, canvas.height, options)
  }

  ctx.globalAlpha = 1

  return output
}

/**
 * Apply text watermark
 */
function applyTextWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: WatermarkOptions
): void {
  const fontSize = options.fontSize || Math.max(width, height) * 0.03
  const fontFamily = options.fontFamily || 'Arial, sans-serif'
  const color = options.color || '#ffffff'
  const margin = options.margin || 20
  const text = options.text || '© Watermark'

  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.fillStyle = color
  ctx.textBaseline = 'top'

  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  const textHeight = fontSize

  let x = margin
  let y = margin

  switch (options.position) {
    case 'top-right':
      x = width - textWidth - margin
      y = margin
      break
    case 'bottom-left':
      x = margin
      y = height - textHeight - margin
      break
    case 'bottom-right':
      x = width - textWidth - margin
      y = height - textHeight - margin
      break
    case 'center':
      x = (width - textWidth) / 2
      y = (height - textHeight) / 2
      break
    default:
      // top-left
      break
  }

  // Add shadow for better visibility
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  ctx.fillText(text, x, y)

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

/**
 * Apply image watermark
 */
function applyImageWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: WatermarkOptions
): void {
  if (!options.image) return

  const margin = options.margin || 20
  const watermarkWidth = Math.min(options.image.width, width * 0.3)
  const watermarkHeight =
    (watermarkWidth / options.image.width) * options.image.height

  let x = margin
  let y = margin

  switch (options.position) {
    case 'top-right':
      x = width - watermarkWidth - margin
      y = margin
      break
    case 'bottom-left':
      x = margin
      y = height - watermarkHeight - margin
      break
    case 'bottom-right':
      x = width - watermarkWidth - margin
      y = height - watermarkHeight - margin
      break
    case 'center':
      x = (width - watermarkWidth) / 2
      y = (height - watermarkHeight) / 2
      break
    default:
      // top-left
      break
  }

  ctx.drawImage(options.image, x, y, watermarkWidth, watermarkHeight)
}

/**
 * Export with quality preset
 */
export async function exportWithPreset(
  canvas: HTMLCanvasElement,
  presetName: keyof typeof QUALITY_PRESETS,
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  const preset = QUALITY_PRESETS[presetName]

  return exportCanvas(canvas, {
    format: preset.format.split('/')[1] as 'png' | 'jpeg' | 'webp',
    quality: preset.quality,
    width: 'maxWidth' in preset ? preset.maxWidth : undefined,
    height: 'maxHeight' in preset ? preset.maxHeight : undefined,
    ...options
  })
}

/**
 * Download blob as file
 */
export function downloadBlob(
  blob: Blob,
  filename: string
): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export and download
 */
export async function exportAndDownload(
  canvas: HTMLCanvasElement,
  filename: string,
  options: ExportOptions = {}
): Promise<void> {
  const blob = await exportCanvas(canvas, options)
  downloadBlob(blob, filename)
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  prefix: string = 'cropped',
  format: string = 'png'
): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .substring(0, 19)
  return `${prefix}-${timestamp}.${format}`
}

/**
 * Detect optimal format based on image content
 */
export function detectOptimalFormat(canvas: HTMLCanvasElement): {
  format: 'png' | 'jpeg' | 'webp'
  reason: string
} {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { format: 'png', reason: 'Default' }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Check for transparency
  let hasTransparency = false
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      hasTransparency = true
      break
    }
  }

  if (hasTransparency) {
    return { format: 'png', reason: 'Image has transparency' }
  }

  // Check if browser supports WebP
  const supportsWebP = document
    .createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0

  if (supportsWebP) {
    return { format: 'webp', reason: 'Browser supports WebP (smaller size)' }
  }

  return { format: 'jpeg', reason: 'No transparency, optimal for photos' }
}

/**
 * Convert data URL to blob
 */
export function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(parts[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new Blob([u8arr], { type: mime })
}

/**
 * Create image from canvas
 */
export function canvasToImage(canvas: HTMLCanvasElement): HTMLImageElement {
  const img = new Image()
  img.src = canvas.toDataURL()
  return img
}

/**
 * Copy canvas to clipboard
 */
export async function copyCanvasToClipboard(
  canvas: HTMLCanvasElement
): Promise<boolean> {
  if (!('clipboard' in navigator)) {
    return false
  }

  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      })
    })

    const item = new ClipboardItem({ 'image/png': blob })
    await navigator.clipboard.write([item])
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Create progressive JPEG (requires server-side processing)
 * This is a placeholder - actual progressive JPEG creation requires
 * specialized libraries or server-side processing
 */
export async function createProgressiveJPEG(
  canvas: HTMLCanvasElement,
  quality: number = 0.92
): Promise<Blob> {
  // Standard JPEG export
  // For true progressive JPEG, you'd need a library like jpeg-js
  // or server-side processing
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create JPEG'))
        }
      },
      'image/jpeg',
      quality
    )
  })
}

