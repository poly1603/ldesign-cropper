/**
 * Drawing Toolbar
 * UI for drawing tool selection and options
 */

import { DrawingEngine } from './DrawingEngine'
import { DrawingTool, getAllDrawingTools } from './DrawingTools'
import { createElement } from '../utils/dom'

export interface DrawingToolbarOptions {
  position?: 'top' | 'bottom' | 'left' | 'right'
  tools?: string[]
  defaultTool?: string
  colorPalette?: string[]
  brushSizes?: number[]
}

export class DrawingToolbar {
  private engine: DrawingEngine
  private container: HTMLElement
  private element: HTMLDivElement | null = null
  private options: DrawingToolbarOptions
  private tools: Record<string, DrawingTool>
  private activeTool: string = 'pen'
  private currentColor: string = '#000000'
  private currentSize: number = 2

  constructor(
    engine: DrawingEngine,
    container: HTMLElement,
    options: DrawingToolbarOptions = {}
  ) {
    this.engine = engine
    this.container = container
    this.options = {
      position: 'top',
      tools: ['pen', 'line', 'rectangle', 'circle', 'arrow', 'text', 'eraser', 'blur', 'highlight'],
      defaultTool: 'pen',
      colorPalette: [
        '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
        '#ffff00', '#ff00ff', '#00ffff', '#808080'
      ],
      brushSizes: [1, 2, 4, 8, 16, 32],
      ...options
    }

    this.tools = getAllDrawingTools(engine)
    this.activeTool = this.options.defaultTool || 'pen'

    this.render()
  }

  /**
   * Render toolbar
   */
  private render(): void {
    this.element = createElement('div', 'cropper-drawing-toolbar')
    this.element.classList.add(`drawing-toolbar-${this.options.position}`)

    // Tool buttons
    const toolsGroup = this.createToolsGroup()
    this.element.appendChild(toolsGroup)

    // Color picker
    const colorGroup = this.createColorGroup()
    this.element.appendChild(colorGroup)

    // Size selector
    const sizeGroup = this.createSizeGroup()
    this.element.appendChild(sizeGroup)

    // Layer controls
    const layerGroup = this.createLayerGroup()
    this.element.appendChild(layerGroup)

    this.container.appendChild(this.element)
  }

  /**
   * Create tools group
   */
  private createToolsGroup(): HTMLElement {
    const group = createElement('div', 'drawing-toolbar-group')

    const toolIcons: Record<string, string> = {
      pen: '✏️',
      line: '📏',
      rectangle: '▢',
      circle: '○',
      arrow: '→',
      text: 'A',
      eraser: '🧹',
      blur: '🔲',
      highlight: '🖍️'
    }

    this.options.tools?.forEach((toolName) => {
      const btn = createElement('button', 'drawing-tool-button')
      btn.dataset.tool = toolName
      btn.textContent = toolIcons[toolName] || toolName
      btn.title = this.capitalizeFirst(toolName)

      if (toolName === this.activeTool) {
        btn.classList.add('active')
      }

      btn.addEventListener('click', () => {
        this.selectTool(toolName)
      })

      group.appendChild(btn)
    })

    return group
  }

  /**
   * Create color group
   */
  private createColorGroup(): HTMLElement {
    const group = createElement('div', 'drawing-toolbar-group')

    const colorPicker = document.createElement('input')
    colorPicker.type = 'color'
    colorPicker.className = 'drawing-color-picker'
    colorPicker.value = this.currentColor
    colorPicker.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement
      this.setColor(input.value)
    })

    group.appendChild(colorPicker)

    // Preset colors
    this.options.colorPalette?.forEach((color) => {
      const swatch = createElement('button', 'drawing-color-swatch')
      swatch.style.backgroundColor = color
      swatch.title = color
      swatch.addEventListener('click', () => {
        this.setColor(color)
        colorPicker.value = color
      })
      group.appendChild(swatch)
    })

    return group
  }

  /**
   * Create size group
   */
  private createSizeGroup(): HTMLElement {
    const group = createElement('div', 'drawing-toolbar-group')

    const label = createElement('label', 'drawing-toolbar-label')
    label.textContent = 'Size:'

    const slider = document.createElement('input')
    slider.type = 'range'
    slider.className = 'drawing-size-slider'
    slider.min = '1'
    slider.max = '50'
    slider.value = String(this.currentSize)
    slider.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement
      this.setSize(parseInt(input.value))
      valueDisplay.textContent = input.value
    })

    const valueDisplay = createElement('span', 'drawing-size-value')
    valueDisplay.textContent = String(this.currentSize)

    group.appendChild(label)
    group.appendChild(slider)
    group.appendChild(valueDisplay)

    return group
  }

  /**
   * Create layer group
   */
  private createLayerGroup(): HTMLElement {
    const group = createElement('div', 'drawing-toolbar-group')

    const addLayerBtn = createElement('button', 'drawing-toolbar-button')
    addLayerBtn.textContent = '+ Layer'
    addLayerBtn.title = 'Add new layer'
    addLayerBtn.addEventListener('click', () => {
      const name = prompt('Layer name:', `Layer ${this.engine.getLayers().length + 1}`)
      if (name) {
        this.engine.addLayer(name)
      }
    })

    const clearBtn = createElement('button', 'drawing-toolbar-button')
    clearBtn.textContent = 'Clear'
    clearBtn.title = 'Clear current layer'
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear current layer?')) {
        this.engine.clear()
      }
    })

    const undoBtn = createElement('button', 'drawing-toolbar-button')
    undoBtn.textContent = '↶'
    undoBtn.title = 'Undo'
    undoBtn.addEventListener('click', () => {
      this.engine.undo()
    })

    const redoBtn = createElement('button', 'drawing-toolbar-button')
    redoBtn.textContent = '↷'
    redoBtn.title = 'Redo'
    redoBtn.addEventListener('click', () => {
      this.engine.redo()
    })

    group.appendChild(addLayerBtn)
    group.appendChild(clearBtn)
    group.appendChild(undoBtn)
    group.appendChild(redoBtn)

    return group
  }

  /**
   * Select tool
   */
  private selectTool(toolName: string): void {
    this.activeTool = toolName

    // Update button states
    const buttons = this.element?.querySelectorAll('.drawing-tool-button')
    buttons?.forEach((btn) => {
      const button = btn as HTMLElement
      if (button.dataset.tool === toolName) {
        button.classList.add('active')
      } else {
        button.classList.remove('active')
      }
    })

    // Update tool options
    const tool = this.tools[toolName]
    if (tool) {
      tool.setOptions({
        color: this.currentColor,
        lineWidth: this.currentSize
      })
    }

    // Dispatch event
    const event = new CustomEvent('drawing:toolchange', {
      detail: { tool: toolName },
      bubbles: true
    })
    this.container.dispatchEvent(event)
  }

  /**
   * Set color
   */
  private setColor(color: string): void {
    this.currentColor = color

    const tool = this.tools[this.activeTool]
    if (tool) {
      tool.setOptions({ color })
    }
  }

  /**
   * Set size
   */
  private setSize(size: number): void {
    this.currentSize = size

    const tool = this.tools[this.activeTool]
    if (tool) {
      tool.setOptions({ lineWidth: size })
    }
  }

  /**
   * Get active tool
   */
  getActiveTool(): DrawingTool | null {
    return this.tools[this.activeTool] || null
  }

  /**
   * Get tool by name
   */
  getTool(name: string): DrawingTool | undefined {
    return this.tools[name]
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Destroy toolbar
   */
  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
      this.element = null
    }
  }
}

