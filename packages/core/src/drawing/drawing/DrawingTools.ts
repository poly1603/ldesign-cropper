/**
 * Drawing Tools
 * Basic drawing tools for annotations
 */

import type { DrawingEngine } from './DrawingEngine'

export interface Point {
  x: number
  y: number
}

export interface DrawingToolOptions {
  color?: string
  lineWidth?: number
  opacity?: number
  [key: string]: any
}

export abstract class DrawingTool {
  protected engine: DrawingEngine
  protected options: DrawingToolOptions
  protected isDrawing: boolean = false
  protected startPoint: Point | null = null

  constructor(engine: DrawingEngine, options: DrawingToolOptions = {}) {
    this.engine = engine
    this.options = {
      color: '#000000',
      lineWidth: 2,
      opacity: 1,
      ...options
    }
  }

  abstract onStart(point: Point, event: MouseEvent | TouchEvent): void
  abstract onMove(point: Point, event: MouseEvent | TouchEvent): void
  abstract onEnd(point: Point, event: MouseEvent | TouchEvent): void

  protected getContext(): CanvasRenderingContext2D | null {
    const layer = this.engine.getActiveLayer()
    if (!layer) return null
    return layer.canvas.getContext('2d')
  }

  setOptions(options: Partial<DrawingToolOptions>): void {
    this.options = { ...this.options, ...options }
  }

  getOptions(): DrawingToolOptions {
    return { ...this.options }
  }
}

/**
 * Pen/Brush Tool
 */
export class PenTool extends DrawingTool {
  private lastPoint: Point | null = null

  onStart(point: Point): void {
    this.isDrawing = true
    this.startPoint = point
    this.lastPoint = point

    const ctx = this.getContext()
    if (!ctx) return

    ctx.strokeStyle = this.options.color!
    ctx.lineWidth = this.options.lineWidth!
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = this.options.opacity!

    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  onMove(point: Point): void {
    if (!this.isDrawing || !this.lastPoint) return

    const ctx = this.getContext()
    if (!ctx) return

    ctx.lineTo(point.x, point.y)
    ctx.stroke()

    this.lastPoint = point
  }

  onEnd(): void {
    if (!this.isDrawing) return

    const ctx = this.getContext()
    if (ctx) {
      ctx.closePath()
      ctx.globalAlpha = 1
    }

    this.isDrawing = false
    this.lastPoint = null
    this.engine.saveState()
  }
}

/**
 * Line Tool
 */
export class LineTool extends DrawingTool {
  onStart(point: Point): void {
    this.isDrawing = true
    this.startPoint = point
  }

  onMove(point: Point): void {
    if (!this.isDrawing || !this.startPoint) return

    const ctx = this.getContext()
    if (!ctx) return

    // Clear and redraw (for preview)
    const layer = this.engine.getActiveLayer()
    if (!layer) return

    ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)

    ctx.strokeStyle = this.options.color!
    ctx.lineWidth = this.options.lineWidth!
    ctx.globalAlpha = this.options.opacity!

    ctx.beginPath()
    ctx.moveTo(this.startPoint.x, this.startPoint.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()

    ctx.globalAlpha = 1
  }

  onEnd(point: Point): void {
    if (!this.isDrawing || !this.startPoint) return

    const ctx = this.getContext()
    if (!ctx) return

    ctx.strokeStyle = this.options.color!
    ctx.lineWidth = this.options.lineWidth!
    ctx.globalAlpha = this.options.opacity!

    ctx.beginPath()
    ctx.moveTo(this.startPoint.x, this.startPoint.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()

    ctx.globalAlpha = 1

    this.isDrawing = false
    this.engine.saveState()
  }
}

/**
 * Rectangle Tool
 */
export class RectangleTool extends DrawingTool {
  onStart(point: Point): void {
    this.isDrawing = true
    this.startPoint = point
  }

  onMove(point: Point): void {
    if (!this.isDrawing || !this.startPoint) return

    this.drawRectangle(this.startPoint, point, true)
  }

  onEnd(point: Point): void {
    if (!this.isDrawing || !this.startPoint) return

    this.drawRectangle(this.startPoint, point, false)

    this.isDrawing = false
    this.engine.saveState()
  }

  private drawRectangle(start: Point, end: Point, isPreview: boolean): void {
    const ctx = this.getContext()
    if (!ctx) return

    const layer = this.engine.getActiveLayer()
    if (!layer) return

    if (isPreview) {
      ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
    }

    const x = Math.min(start.x, end.x)
    const y = Math.min(start.y, end.y)
    const width = Math.abs(end.x - start.x)
    const height = Math.abs(end.y - start.y)

    ctx.strokeStyle = this.options.color!
    ctx.lineWidth = this.options.lineWidth!
    ctx.globalAlpha = this.options.opacity!

    if (this.options.fill) {
      ctx.fillStyle = this.options.fillColor || this.options.color!
      ctx.fillRect(x, y, width, height)
    }

    ctx.strokeRect(x, y, width, height)
    ctx.globalAlpha = 1
  }
}

/**
 * Circle/Ellipse Tool
 */
export class CircleTool extends DrawingTool {
  onStart(point: Point): void {
    this.isDrawing = true
    this.startPoint = point
  }

  onMove(point: Point): void {
    if (!this.isDrawing || !this.startPoint) return

    this.drawCircle(this.startPoint, point, true)
  }

  onEnd(point: Point): void {
    if (!this.isDrawing || !this.startPoint) return

    this.drawCircle(this.startPoint, point, false)

    this.isDrawing = false
    this.engine.saveState()
  }

  private drawCircle(start: Point, end: Point, isPreview: boolean): void {
    const ctx = this.getContext()
    if (!ctx) return

    const layer = this.engine.getActiveLayer()
    if (!layer) return

    if (isPreview) {
      ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
    }

    const centerX = (start.x + end.x) / 2
    const centerY = (start.y + end.y) / 2
    const radiusX = Math.abs(end.x - start.x) / 2
    const radiusY = Math.abs(end.y - start.y) / 2

    ctx.strokeStyle = this.options.color!
    ctx.lineWidth = this.options.lineWidth!
    ctx.globalAlpha = this.options.opacity!

    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)

    if (this.options.fill) {
      ctx.fillStyle = this.options.fillColor || this.options.color!
      ctx.fill()
    }

    ctx.stroke()
    ctx.globalAlpha = 1
  }
}

/**
 * Text Tool
 */
export class TextTool extends DrawingTool {
  onStart(point: Point): void {
    this.startPoint = point
  }

  onMove(): void {
    // Text tool doesn't need move handling
  }

  onEnd(point: Point): void {
    if (!this.startPoint) return

    // In real implementation, this would show a text input dialog
    const text = this.options.text || 'Text'
    this.drawText(point, text)

    this.engine.saveState()
  }

  private drawText(point: Point, text: string): void {
    const ctx = this.getContext()
    if (!ctx) return

    const fontSize = this.options.fontSize || 24
    const fontFamily = this.options.fontFamily || 'Arial, sans-serif'

    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.fillStyle = this.options.color!
    ctx.globalAlpha = this.options.opacity!
    ctx.textBaseline = 'top'

    ctx.fillText(text, point.x, point.y)
    ctx.globalAlpha = 1
  }

  /**
   * Draw text at position
   */
  drawTextAt(point: Point, text: string): void {
    this.drawText(point, text)
    this.engine.saveState()
  }
}

/**
 * Eraser Tool
 */
export class EraserTool extends DrawingTool {
  private lastPoint: Point | null = null

  onStart(point: Point): void {
    this.isDrawing = true
    this.lastPoint = point

    const ctx = this.getContext()
    if (!ctx) return

    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = this.options.lineWidth || 20
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  onMove(point: Point): void {
    if (!this.isDrawing || !this.lastPoint) return

    const ctx = this.getContext()
    if (!ctx) return

    ctx.lineTo(point.x, point.y)
    ctx.stroke()

    this.lastPoint = point
  }

  onEnd(): void {
    if (!this.isDrawing) return

    const ctx = this.getContext()
    if (ctx) {
      ctx.closePath()
      ctx.globalCompositeOperation = 'source-over'
    }

    this.isDrawing = false
    this.lastPoint = null
    this.engine.saveState()
  }
}

/**
 * Arrow Tool
 */
export class ArrowTool extends DrawingTool {
  onStart(point: Point): void {
    this.isDrawing = true
    this.startPoint = point
  }

  onMove(point: Point): void {
    if (!this.isDrawing || !this.startPoint) return

    this.drawArrow(this.startPoint, point, true)
  }

  onEnd(point: Point): void {
    if (!this.isDrawing || !this.startPoint) return

    this.drawArrow(this.startPoint, point, false)

    this.isDrawing = false
    this.engine.saveState()
  }

  private drawArrow(start: Point, end: Point, isPreview: boolean): void {
    const ctx = this.getContext()
    if (!ctx) return

    const layer = this.engine.getActiveLayer()
    if (!layer) return

    if (isPreview) {
      ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
    }

    const headLength = this.options.headLength || 20
    const angle = Math.atan2(end.y - start.y, end.x - start.x)

    ctx.strokeStyle = this.options.color!
    ctx.fillStyle = this.options.color!
    ctx.lineWidth = this.options.lineWidth!
    ctx.globalAlpha = this.options.opacity!

    // Draw line
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()

    // Draw arrowhead
    ctx.beginPath()
    ctx.moveTo(end.x, end.y)
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.closePath()
    ctx.fill()

    ctx.globalAlpha = 1
  }
}

/**
 * Blur/Pixelate Tool (for privacy)
 */
export class BlurTool extends DrawingTool {
  private points: Point[] = []

  onStart(point: Point): void {
    this.isDrawing = true
    this.points = [point]
  }

  onMove(point: Point): void {
    if (!this.isDrawing) return

    this.points.push(point)
    this.applyBlur()
  }

  onEnd(): void {
    if (!this.isDrawing) return

    this.applyBlur()
    this.isDrawing = false
    this.points = []
    this.engine.saveState()
  }

  private applyBlur(): void {
    const ctx = this.getContext()
    if (!ctx || this.points.length === 0) return

    const radius = this.options.lineWidth || 20

    this.points.forEach((point) => {
      const imageData = ctx.getImageData(
        point.x - radius,
        point.y - radius,
        radius * 2,
        radius * 2
      )

      // Apply simple blur
      this.blurImageData(imageData, this.options.blurAmount || 5)

      ctx.putImageData(imageData, point.x - radius, point.y - radius)
    })
  }

  private blurImageData(imageData: ImageData, radius: number): void {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const output = new Uint8ClampedArray(data)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0,
          a = 0
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

    data.set(output)
  }
}

/**
 * Highlight/Marker Tool
 */
export class HighlightTool extends PenTool {
  constructor(engine: DrawingEngine, options: DrawingToolOptions = {}) {
    super(engine, {
      color: '#ffff00',
      lineWidth: 10,
      opacity: 0.4,
      ...options
    })
  }
}

/**
 * Get all available tools
 */
export function getAllDrawingTools(engine: DrawingEngine): Record<string, DrawingTool> {
  return {
    pen: new PenTool(engine),
    line: new LineTool(engine),
    rectangle: new RectangleTool(engine),
    circle: new CircleTool(engine),
    text: new TextTool(engine),
    eraser: new EraserTool(engine),
    arrow: new ArrowTool(engine),
    blur: new BlurTool(engine),
    highlight: new HighlightTool(engine)
  }
}

