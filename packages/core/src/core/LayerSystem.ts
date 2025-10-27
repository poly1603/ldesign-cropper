/**
 * Layer System
 * Manages multiple layers with compositing and operations
 */

import { Layer, type BlendMode } from './Layer'
import { dispatch } from '../utils/events'
import { createElement } from '../utils/dom'

export interface LayerSystemOptions {
  width?: number
  height?: number
  maxLayers?: number
  autoComposite?: boolean
  preserveDrawingBuffer?: boolean
}

export interface LayerInfo {
  id: string
  name: string
  index: number
  visible: boolean
  opacity: number
  blendMode: BlendMode
  locked: boolean
  thumbnail?: string
}

export class LayerSystem {
  container: HTMLElement
  private layers: Layer[] = []
  private activeLayer: Layer | null = null
  private compositeCanvas: HTMLCanvasElement
  private compositeCtx: CanvasRenderingContext2D
  private options: Required<LayerSystemOptions>

  // Layer panel UI
  private layerPanel: HTMLElement | null = null
  private layerPanelVisible = false

  // History for undo/redo
  private history: Array<{
    action: string
    data: any
  }> = []
  private historyIndex = -1
  private maxHistorySize = 50

  constructor(container: HTMLElement, options: LayerSystemOptions = {}) {
    this.container = container
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      maxLayers: options.maxLayers || 100,
      autoComposite: options.autoComposite ?? true,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false
    }

    // Create composite canvas
    this.compositeCanvas = document.createElement('canvas')
    this.compositeCanvas.width = this.options.width
    this.compositeCanvas.height = this.options.height
    this.compositeCanvas.className = 'layer-system-composite'

    const ctx = this.compositeCanvas.getContext('2d', {
      willReadFrequently: this.options.preserveDrawingBuffer,
      alpha: true
    })

    if (!ctx) {
      throw new Error('Failed to get composite canvas context')
    }

    this.compositeCtx = ctx

    // Add composite canvas to container
    this.container.appendChild(this.compositeCanvas)

    // Create default background layer
    this.createLayer('Background', { locked: true })
  }

  /**
   * Create a new layer
   */
  createLayer(name?: string, options: Partial<Layer> = {}): Layer {
    if (this.layers.length >= this.options.maxLayers) {
      throw new Error(`Maximum layer limit (${this.options.maxLayers}) reached`)
    }

    const layer = new Layer(this.options.width, this.options.height, {
      name: name || `Layer ${this.layers.length + 1}`,
      ...options
    })

    layer.setLayerSystem(this)

    // Add to layers array
    this.layers.push(layer)

    // Set as active if it's the only layer or no active layer
    if (!this.activeLayer || this.layers.length === 1) {
      this.setActiveLayer(layer.id)
    }

    // Add to history
    this.addToHistory('createLayer', { layerId: layer.id })

    // Composite if auto-composite is enabled
    if (this.options.autoComposite) {
      this.composite()
    }

    // Update UI
    this.updateLayerPanel()

    // Dispatch event
    dispatch(this.container, 'layer:create', {
      layer: layer.getInfo()
    })

    return layer
  }

  /**
   * Delete a layer
   */
  deleteLayer(layerId: string): boolean {
    const index = this.layers.findIndex(l => l.id === layerId)
    if (index === -1) return false

    const layer = this.layers[index]

    // Don't delete if it's the only layer
    if (this.layers.length === 1) {
      console.warn('Cannot delete the last layer')
      return false
    }

    // Don't delete if locked
    if (layer.locked) {
      console.warn('Cannot delete a locked layer')
      return false
    }

    // Remove from array
    this.layers.splice(index, 1)

    // Update active layer if needed
    if (this.activeLayer?.id === layerId) {
      this.activeLayer = this.layers[Math.max(0, index - 1)]
    }

    // Add to history
    this.addToHistory('deleteLayer', {
      layerId: layer.id,
      layerData: layer.getImageData(),
      layerInfo: layer.getInfo(),
      index
    })

    // Destroy layer
    layer.destroy()

    // Composite
    if (this.options.autoComposite) {
      this.composite()
    }

    // Update UI
    this.updateLayerPanel()

    // Dispatch event
    dispatch(this.container, 'layer:delete', { layerId })

    return true
  }

  /**
   * Duplicate a layer
   */
  duplicateLayer(layerId: string): Layer | null {
    const layer = this.getLayer(layerId)
    if (!layer) return null

    const duplicated = layer.clone()
    duplicated.setLayerSystem(this)

    // Insert after original
    const index = this.layers.findIndex(l => l.id === layerId)
    this.layers.splice(index + 1, 0, duplicated)

    // Add to history
    this.addToHistory('duplicateLayer', {
      originalId: layerId,
      duplicatedId: duplicated.id
    })

    // Composite
    if (this.options.autoComposite) {
      this.composite()
    }

    // Update UI
    this.updateLayerPanel()

    // Dispatch event
    dispatch(this.container, 'layer:duplicate', {
      originalId: layerId,
      duplicatedLayer: duplicated.getInfo()
    })

    return duplicated
  }

  /**
   * Merge two layers
   */
  mergeLayers(sourceId: string, targetId: string): boolean {
    const source = this.getLayer(sourceId)
    const target = this.getLayer(targetId)

    if (!source || !target) return false
    if (source.locked || target.locked) return false

    // Store for history
    const sourceData = source.getImageData()
    const targetData = target.getImageData()

    // Merge source into target
    target.merge(source)

    // Remove source layer
    const sourceIndex = this.layers.indexOf(source)
    this.layers.splice(sourceIndex, 1)

    // Add to history
    this.addToHistory('mergeLayers', {
      sourceId,
      targetId,
      sourceData,
      targetData,
      sourceIndex
    })

    // Destroy source
    source.destroy()

    // Composite
    if (this.options.autoComposite) {
      this.composite()
    }

    // Update UI
    this.updateLayerPanel()

    // Dispatch event
    dispatch(this.container, 'layer:merge', { sourceId, targetId })

    return true
  }

  /**
   * Move layer in stack
   */
  moveLayer(layerId: string, newIndex: number): boolean {
    const currentIndex = this.layers.findIndex(l => l.id === layerId)
    if (currentIndex === -1) return false

    const layer = this.layers[currentIndex]
    if (layer.locked) return false

    // Clamp new index
    newIndex = Math.max(0, Math.min(this.layers.length - 1, newIndex))

    if (currentIndex === newIndex) return false

    // Remove and reinsert
    this.layers.splice(currentIndex, 1)
    this.layers.splice(newIndex, 0, layer)

    // Add to history
    this.addToHistory('moveLayer', {
      layerId,
      oldIndex: currentIndex,
      newIndex
    })

    // Composite
    if (this.options.autoComposite) {
      this.composite()
    }

    // Update UI
    this.updateLayerPanel()

    // Dispatch event
    dispatch(this.container, 'layer:move', {
      layerId,
      oldIndex: currentIndex,
      newIndex
    })

    return true
  }

  /**
   * Set active layer
   */
  setActiveLayer(layerId: string): boolean {
    const layer = this.getLayer(layerId)
    if (!layer) return false

    this.activeLayer = layer

    // Update UI
    this.updateLayerPanel()

    // Dispatch event
    dispatch(this.container, 'layer:active', {
      layerId,
      layer: layer.getInfo()
    })

    return true
  }

  /**
   * Get layer by ID
   */
  getLayer(layerId: string): Layer | null {
    return this.layers.find(l => l.id === layerId) || null
  }

  /**
   * Get active layer
   */
  getActiveLayer(): Layer | null {
    return this.activeLayer
  }

  /**
   * Get all layers
   */
  getLayers(): Layer[] {
    return [...this.layers]
  }

  /**
   * Get layer info
   */
  getLayerInfo(): LayerInfo[] {
    return this.layers.map((layer, index) => ({
      id: layer.id,
      name: layer.name,
      index,
      visible: layer.visible,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      locked: layer.locked,
      thumbnail: this.generateThumbnail(layer)
    }))
  }

  /**
   * Composite all layers
   */
  composite(): void {
    // Clear composite canvas
    this.compositeCtx.clearRect(0, 0, this.options.width, this.options.height)

    // Draw each visible layer
    for (const layer of this.layers) {
      if (!layer.visible) continue

      this.compositeCtx.save()

      // Apply layer opacity
      this.compositeCtx.globalAlpha = layer.opacity

      // Apply blend mode
      this.compositeCtx.globalCompositeOperation = layer.blendMode

      // Apply transform
      const t = layer.transform
      this.compositeCtx.translate(
        t.x + layer.canvas.width / 2,
        t.y + layer.canvas.height / 2
      )
      this.compositeCtx.rotate((t.rotation * Math.PI) / 180)
      this.compositeCtx.scale(t.scaleX, t.scaleY)
      this.compositeCtx.transform(1, t.skewY, t.skewX, 1, 0, 0)

      // Draw layer
      this.compositeCtx.drawImage(
        layer.canvas,
        -layer.canvas.width / 2,
        -layer.canvas.height / 2
      )

      this.compositeCtx.restore()
    }

    // Dispatch event
    dispatch(this.container, 'layers:composite')
  }

  /**
   * Get composite canvas
   */
  getCompositeCanvas(): HTMLCanvasElement {
    return this.compositeCanvas
  }

  /**
   * Get composite image data
   */
  getCompositeImageData(): ImageData {
    return this.compositeCtx.getImageData(
      0, 0,
      this.options.width,
      this.options.height
    )
  }

  /**
   * Flatten all layers
   */
  flatten(): Layer {
    // Create new layer with composite
    const flattened = new Layer(this.options.width, this.options.height, {
      name: 'Flattened'
    })

    // Draw composite to new layer
    flattened.ctx.drawImage(this.compositeCanvas, 0, 0)

    // Store history
    const layersData = this.layers.map(l => ({
      id: l.id,
      data: l.getImageData(),
      info: l.getInfo()
    }))

    // Clear all layers except first
    this.layers = [flattened]
    flattened.setLayerSystem(this)
    this.activeLayer = flattened

    // Add to history
    this.addToHistory('flatten', { layersData })

    // Update UI
    this.updateLayerPanel()

    // Dispatch event
    dispatch(this.container, 'layers:flatten')

    return flattened
  }

  /**
   * Clear all layers
   */
  clearAll(): void {
    // Store for history
    const layersData = this.layers.map(l => ({
      id: l.id,
      data: l.getImageData(),
      info: l.getInfo()
    }))

    // Clear each layer
    this.layers.forEach(layer => {
      if (!layer.locked) {
        layer.clear()
      }
    })

    // Add to history
    this.addToHistory('clearAll', { layersData })

    // Composite
    if (this.options.autoComposite) {
      this.composite()
    }

    // Dispatch event
    dispatch(this.container, 'layers:clear')
  }

  /**
   * Resize all layers
   */
  resize(width: number, height: number): void {
    // Store for history
    const oldSize = {
      width: this.options.width,
      height: this.options.height
    }

    // Update options
    this.options.width = width
    this.options.height = height

    // Resize composite canvas
    this.compositeCanvas.width = width
    this.compositeCanvas.height = height

    // Resize all layers
    this.layers.forEach(layer => {
      layer.resize(width, height)
    })

    // Add to history
    this.addToHistory('resize', { oldSize, newSize: { width, height } })

    // Composite
    if (this.options.autoComposite) {
      this.composite()
    }

    // Dispatch event
    dispatch(this.container, 'layers:resize', { width, height })
  }

  /**
   * Notify of layer change
   */
  notifyLayerChange(layer: Layer): void {
    // Composite if auto-composite is enabled
    if (this.options.autoComposite) {
      this.composite()
    }

    // Update UI
    this.updateLayerPanel()

    // Dispatch event
    dispatch(this.container, 'layer:change', {
      layerId: layer.id,
      layer: layer.getInfo()
    })
  }

  /**
   * Generate thumbnail for layer
   */
  private generateThumbnail(layer: Layer): string {
    const thumbSize = 50
    const canvas = document.createElement('canvas')
    canvas.width = thumbSize
    canvas.height = thumbSize

    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Draw scaled layer
    ctx.drawImage(
      layer.canvas,
      0, 0,
      layer.canvas.width,
      layer.canvas.height,
      0, 0,
      thumbSize,
      thumbSize
    )

    return canvas.toDataURL('image/png', 0.6)
  }

  /**
   * Create layer panel UI
   */
  createLayerPanel(): void {
    if (this.layerPanel) return

    this.layerPanel = createElement('div', 'layer-panel')
    this.layerPanel.innerHTML = `
      <div class="layer-panel-header">
        <span class="layer-panel-title">Layers</span>
        <div class="layer-panel-controls">
          <button class="layer-btn" data-action="create" title="New Layer">+</button>
          <button class="layer-btn" data-action="delete" title="Delete Layer">-</button>
          <button class="layer-btn" data-action="duplicate" title="Duplicate">⧉</button>
          <button class="layer-btn" data-action="merge" title="Merge Down">⤓</button>
          <button class="layer-btn" data-action="flatten" title="Flatten">☰</button>
        </div>
      </div>
      <div class="layer-panel-list"></div>
      <div class="layer-panel-properties">
        <label>Opacity: <input type="range" class="layer-opacity" min="0" max="100" /></label>
        <label>Blend: 
          <select class="layer-blend">
            <option value="normal">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
            <option value="color-dodge">Color Dodge</option>
            <option value="color-burn">Color Burn</option>
            <option value="hard-light">Hard Light</option>
            <option value="soft-light">Soft Light</option>
            <option value="difference">Difference</option>
            <option value="exclusion">Exclusion</option>
          </select>
        </label>
      </div>
    `

    // Add styles
    this.addLayerPanelStyles()

    // Add to container
    this.container.appendChild(this.layerPanel)

    // Set up event listeners
    this.setupLayerPanelEvents()

    // Initial update
    this.updateLayerPanel()
  }

  /**
   * Add layer panel styles
   */
  private addLayerPanelStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      .layer-panel {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 250px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        font-size: 13px;
      }
      
      .layer-panel-header {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .layer-panel-title {
        font-weight: bold;
      }
      
      .layer-panel-controls {
        display: flex;
        gap: 5px;
      }
      
      .layer-btn {
        width: 24px;
        height: 24px;
        border: 1px solid #ccc;
        background: white;
        cursor: pointer;
        border-radius: 4px;
      }
      
      .layer-btn:hover {
        background: #f0f0f0;
      }
      
      .layer-panel-list {
        max-height: 300px;
        overflow-y: auto;
      }
      
      .layer-item {
        padding: 8px 10px;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
      }
      
      .layer-item:hover {
        background: #f5f5f5;
      }
      
      .layer-item.active {
        background: #e3f2fd;
      }
      
      .layer-item.locked {
        opacity: 0.6;
      }
      
      .layer-thumbnail {
        width: 30px;
        height: 30px;
        border: 1px solid #ccc;
      }
      
      .layer-info {
        flex: 1;
      }
      
      .layer-name {
        font-weight: 500;
      }
      
      .layer-visibility {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
      
      .layer-panel-properties {
        padding: 10px;
        border-top: 1px solid #ddd;
      }
      
      .layer-panel-properties label {
        display: block;
        margin-bottom: 5px;
      }
      
      .layer-panel-properties input,
      .layer-panel-properties select {
        width: 100%;
        margin-top: 5px;
      }
    `

    document.head.appendChild(style)
  }

  /**
   * Set up layer panel events
   */
  private setupLayerPanelEvents(): void {
    if (!this.layerPanel) return

    // Control buttons
    this.layerPanel.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const action = target.dataset.action

      if (!action) return

      switch (action) {
        case 'create':
          this.createLayer()
          break
        case 'delete':
          if (this.activeLayer) {
            this.deleteLayer(this.activeLayer.id)
          }
          break
        case 'duplicate':
          if (this.activeLayer) {
            this.duplicateLayer(this.activeLayer.id)
          }
          break
        case 'merge':
          if (this.activeLayer) {
            const index = this.layers.indexOf(this.activeLayer)
            if (index > 0) {
              this.mergeLayers(this.activeLayer.id, this.layers[index - 1].id)
            }
          }
          break
        case 'flatten':
          this.flatten()
          break
      }
    })

    // Opacity slider
    const opacitySlider = this.layerPanel.querySelector('.layer-opacity') as HTMLInputElement
    if (opacitySlider) {
      opacitySlider.addEventListener('input', () => {
        if (this.activeLayer) {
          this.activeLayer.setOpacity(parseFloat(opacitySlider.value) / 100)
        }
      })
    }

    // Blend mode select
    const blendSelect = this.layerPanel.querySelector('.layer-blend') as HTMLSelectElement
    if (blendSelect) {
      blendSelect.addEventListener('change', () => {
        if (this.activeLayer) {
          this.activeLayer.setBlendMode(blendSelect.value as BlendMode)
        }
      })
    }
  }

  /**
   * Update layer panel
   */
  private updateLayerPanel(): void {
    if (!this.layerPanel) return

    const list = this.layerPanel.querySelector('.layer-panel-list')
    if (!list) return

    // Clear list
    list.innerHTML = ''

    // Add layers (in reverse order - top to bottom)
    [...this.layers].reverse().forEach(layer => {
      const item = createElement('div', 'layer-item')
      if (layer === this.activeLayer) {
        item.classList.add('active')
      }
      if (layer.locked) {
        item.classList.add('locked')
      }

      item.innerHTML = `
        <img class="layer-thumbnail" src="${this.generateThumbnail(layer)}" />
        <div class="layer-info">
          <div class="layer-name">${layer.name}</div>
        </div>
        <input type="checkbox" class="layer-visibility" ${layer.visible ? 'checked' : ''} />
      `

      // Click to select
      item.addEventListener('click', (e) => {
        if (!(e.target as HTMLElement).classList.contains('layer-visibility')) {
          this.setActiveLayer(layer.id)
        }
      })

      // Visibility toggle
      const visToggle = item.querySelector('.layer-visibility') as HTMLInputElement
      visToggle?.addEventListener('change', () => {
        layer.setVisible(visToggle.checked)
      })

      list.appendChild(item)
    })

    // Update properties
    if (this.activeLayer) {
      const opacitySlider = this.layerPanel.querySelector('.layer-opacity') as HTMLInputElement
      const blendSelect = this.layerPanel.querySelector('.layer-blend') as HTMLSelectElement

      if (opacitySlider) {
        opacitySlider.value = String(this.activeLayer.opacity * 100)
      }

      if (blendSelect) {
        blendSelect.value = this.activeLayer.blendMode
      }
    }
  }

  /**
   * Show/hide layer panel
   */
  toggleLayerPanel(): void {
    if (!this.layerPanel) {
      this.createLayerPanel()
    }

    this.layerPanelVisible = !this.layerPanelVisible

    if (this.layerPanel) {
      this.layerPanel.style.display = this.layerPanelVisible ? 'block' : 'none'
    }
  }

  /**
   * Add to history
   */
  private addToHistory(action: string, data: any): void {
    // Remove any history after current index
    this.history = this.history.slice(0, this.historyIndex + 1)

    // Add new entry
    this.history.push({ action, data })

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    } else {
      this.historyIndex++
    }
  }

  /**
   * Undo last action
   */
  undo(): boolean {
    if (this.historyIndex < 0) return false

    const entry = this.history[this.historyIndex]

    // Implement undo logic based on action type
    // This is simplified - full implementation would restore exact state

    this.historyIndex--

    // Composite
    if (this.options.autoComposite) {
      this.composite()
    }

    return true
  }

  /**
   * Redo last undone action
   */
  redo(): boolean {
    if (this.historyIndex >= this.history.length - 1) return false

    this.historyIndex++
    const entry = this.history[this.historyIndex]

    // Implement redo logic based on action type

    // Composite
    if (this.options.autoComposite) {
      this.composite()
    }

    return true
  }

  /**
   * Export layers data
   */
  exportLayers(): any {
    return {
      width: this.options.width,
      height: this.options.height,
      layers: this.layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        locked: layer.locked,
        transform: layer.transform,
        imageData: layer.getImageData()
      }))
    }
  }

  /**
   * Import layers data
   */
  importLayers(data: any): void {
    // Clear existing layers
    this.layers = []

    // Resize if needed
    if (data.width && data.height) {
      this.resize(data.width, data.height)
    }

    // Import each layer
    data.layers.forEach((layerData: any) => {
      const layer = new Layer(this.options.width, this.options.height, {
        name: layerData.name,
        visible: layerData.visible,
        opacity: layerData.opacity,
        blendMode: layerData.blendMode,
        locked: layerData.locked
      })

      layer.setLayerSystem(this)
      layer.setImageData(layerData.imageData)
      layer.setTransform(layerData.transform)

      this.layers.push(layer)
    })

    // Set first layer as active
    if (this.layers.length > 0) {
      this.activeLayer = this.layers[0]
    }

    // Composite
    if (this.options.autoComposite) {
      this.composite()
    }

    // Update UI
    this.updateLayerPanel()
  }

  /**
   * Destroy layer system
   */
  destroy(): void {
    // Destroy all layers
    this.layers.forEach(layer => layer.destroy())
    this.layers = []

    // Remove UI
    if (this.layerPanel) {
      this.layerPanel.remove()
      this.layerPanel = null
    }

    // Remove composite canvas
    if (this.compositeCanvas.parentNode) {
      this.compositeCanvas.parentNode.removeChild(this.compositeCanvas)
    }

    // Clear references
    this.activeLayer = null
    this.history = []
  }
}

