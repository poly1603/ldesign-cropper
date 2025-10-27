/**
 * Cropper - Main cropper class
 */

import type {
  CropperOptions,
  CropBoxData,
  ImageData,
  CanvasData,
  ContainerData,
  CropData,
  GetCroppedCanvasOptions,
  Action,
  Point,
  DragMode
} from '../types'
import { CropBox } from './CropBox'
import { ImageProcessor } from './ImageProcessor'
import { InteractionManager } from './InteractionManager'
import { Toolbar, type ToolbarOptions } from './Toolbar'
import { HistoryManager, type HistoryOptions } from './HistoryManager'
import { PresetManager, type PresetOptions } from './PresetManager'
import { WorkerManager } from '../workers/WorkerManager'
import { TouchGestureManager, type TouchGestureOptions } from './TouchGestureManager'
import { MobileUI, type MobileUIOptions } from './MobileUI'
import { AccessibilityManager, type AccessibilityOptions } from './AccessibilityManager'
import { Selection, type SelectionOptions, type SelectionType } from './Selection'
import { MaskManager, type MaskOptions } from './MaskManager'
import { SelectionToolbar, type SelectionToolbarOptions } from '../ui/SelectionToolbar'
import { getElement, createElement, addClass, removeClass, setStyle } from '../utils/dom'
import { dispatch } from '../utils/events'
import { clamp } from '../utils/math'
import { UI, CSS_CLASSES, EVENTS, ERRORS } from '../config/constants'

const DEFAULTS = {
  viewMode: 0 as const,
  dragMode: 'crop' as const,
  initialAspectRatio: 1, // Default to square
  aspectRatio: NaN,
  responsive: true,
  restore: true,
  checkCrossOrigin: true,
  checkOrientation: true,
  modal: true,
  modalOpacity: UI.DEFAULT_MODAL_OPACITY,
  guides: true,
  center: true,
  highlight: true,
  highlightOpacity: UI.DEFAULT_HIGHLIGHT_OPACITY,
  background: true,
  cropBoxStyle: 'default' as const,
  autoCrop: true,
  autoCropArea: UI.DEFAULT_AUTO_CROP_AREA, // Deprecated, use initialCropBoxSize instead
  initialCropBoxSize: UI.DEFAULT_INITIAL_CROP_SIZE,
  movable: true,
  rotatable: true,
  scalable: true,
  skewable: true,
  translatable: true,
  zoomable: true,
  zoomOnTouch: true,
  zoomOnWheel: true,
  wheelZoomRatio: 0.1,
  scaleStep: 0.1,
  cropBoxMovable: true,
  cropBoxResizable: true,
  toggleDragModeOnDblclick: true,
  minContainerWidth: UI.MIN_CONTAINER_WIDTH,
  minContainerHeight: UI.MIN_CONTAINER_HEIGHT,
  minCanvasWidth: 0,
  minCanvasHeight: 0,
  minCropBoxWidth: 0,
  minCropBoxHeight: 0,
  maxCropBoxWidth: Infinity,
  maxCropBoxHeight: Infinity,
  alt: '',
  crossorigin: '',
  themeColor: '#39f',
  toolbar: true,  // Default to show toolbar
  placeholder: {
    text: 'Click or drag image here',
    subtext: 'Supports: JPG, PNG, GIF, WEBP',
    icon: '',
    clickToUpload: true,
    dragAndDrop: true,
    acceptedFiles: 'image/*',
    maxFileSize: UI.MAX_PLACEHOLDER_FILE_SIZE,
    className: ''
  },
  useWorker: false,  // Enable Web Worker for heavy operations
  workerOptions: {
    maxWorkers: 4,
    timeout: 30000
  },
  touchGestures: true,  // Enable touch gestures on mobile
  touchOptions: {
    pinchZoom: true,
    doubleTapZoom: true,
    swipeGestures: true,
    rotationGestures: true,
    momentum: true
  },
  mobileUI: true,  // Enable mobile-optimized UI
  mobileOptions: {
    autoDetect: true,
    breakpoint: 768,
    simplifiedControls: true,
    largeButtons: true,
    gestureHints: true
  },
  accessibility: true,  // Enable accessibility features
  accessibilityOptions: {
    enabled: true,
    language: 'en',
    announceActions: true,
    announceValues: true,
    keyboardHelp: true
  },
  selection: false,  // Enable selection tools
  selectionOptions: {
    enabled: true,
    type: 'rectangle',
    mode: 'new',
    feather: 0,
    antiAlias: true,
    tolerance: 32,
    brushSize: 20,
    showToolbar: true
  },
  masks: false,  // Enable mask tools
  maskOptions: {
    enabled: true,
    opacity: 50,
    color: '#ff0000',
    showOverlay: true,
    invertMask: false,
    quickMask: false,
    autoCreateFromSelection: true
  }
}

export class Cropper {
  public element: HTMLElement  // Public element property for HistoryManager
  private container: HTMLElement | null = null
  private wrapper: HTMLElement | null = null
  private options: CropperOptions
  private cropBox: CropBox | null = null
  private imageProcessor: ImageProcessor | null = null
  private interactionManager: InteractionManager | null = null
  private toolbar: Toolbar | null = null
  private historyManager: HistoryManager | null = null
  private presetManager: PresetManager | null = null
  private placeholderElement: HTMLElement | null = null
  private fileInput: HTMLInputElement | null = null
  private workerManager: WorkerManager | null = null
  private touchGestureManager: TouchGestureManager | null = null
  private mobileUI: MobileUI | null = null
  private accessibilityManager: AccessibilityManager | null = null
  private selection: Selection | null = null
  private maskManager: MaskManager | null = null
  private selectionToolbar: SelectionToolbar | null = null
  public ready = false  // Changed to public for HistoryManager access
  private disabled = false
  private currentAction: Action = 'crop'
  private dragMode: DragMode = 'crop'
  private zoom = 1

  constructor(elementParam: string | Element, options: CropperOptions = {}) {
    // Get the actual element
    const el = getElement(elementParam)
    if (!el) {
      throw new Error(ERRORS.CONTAINER_NOT_FOUND)
    }
    this.element = el as HTMLElement
    this.options = { ...DEFAULTS, ...options }
    this.dragMode = this.options.dragMode || 'crop'

    this.init()
  }

  /**
   * Initialize cropper
   */
  private async init(): Promise<void> {
    // Use the element property directly
    this.container = this.element

    // Create wrapper
    this.wrapper = createElement('div', CSS_CLASSES.CONTAINER)
    this.container.appendChild(this.wrapper)

    // Add background immediately if enabled
    if (this.options.background) {
      this.addBackground()
    }

    // Create image processor
    this.imageProcessor = new ImageProcessor(this.wrapper)

    // Initialize worker manager if enabled
    if (this.options.useWorker) {
      this.workerManager = new WorkerManager(this.options.workerOptions)
    }

    // Initialize accessibility manager
    if (this.options.accessibility) {
      this.accessibilityManager = new AccessibilityManager(this.wrapper, this.options.accessibilityOptions)
    }

    // Initialize touch gesture manager
    if (this.options.touchGestures) {
      this.initTouchGestures()
    }

    // Initialize mobile UI
    if (this.options.mobileUI) {
      this.initMobileUI()
    }

    // Initialize selection and mask system
    if (this.options.selection || this.options.masks) {
      this.initSelectionAndMask()
    }

    // Merge placeholder options with defaults
    this.options.placeholder = {
      ...DEFAULTS.placeholder,
      ...this.options.placeholder
    }

    // Load image if src provided, otherwise show placeholder
    if (this.options.src) {
      await this.replace(this.options.src)
    } else {
      this.showPlaceholder()
    }
  }

  /**
   * Replace image
   */
  async replace(src: string): Promise<void> {
    if (!this.imageProcessor || !this.wrapper) return

    try {
      // Hide placeholder if it exists
      this.hidePlaceholder()

      // Load image
      await this.imageProcessor.load(
        src,
        this.options.checkCrossOrigin ? this.options.crossorigin : undefined
      )

      // Initialize crop box
      this.initCropBox()

      // Initialize interaction manager
      this.initInteractionManager()

      // Initialize toolbar if enabled
      this.initToolbar()

      // Initialize history manager
      this.initHistoryManager()

      // Initialize preset manager
      this.initPresetManager()

      // Initialize selection and mask if not already initialized
      if ((this.options.selection || this.options.masks) && !this.selection) {
        this.initSelectionAndMask()
      }

      // Mark as ready
      this.ready = true

      // Dispatch ready event
      if (this.container) {
        dispatch(this.container, 'ready', { cropper: this })
      }

      // Call ready callback
      if (this.options.ready) {
        this.options.ready(new CustomEvent('ready', { detail: { cropper: this } }))
      }
    } catch (error) {
      console.error('Failed to load image:', error)
      // Show placeholder again if image load fails
      this.showPlaceholder()
      throw error
    }
  }

  /**
   * Initialize crop box
   */
  private initCropBox(): void {
    if (!this.wrapper || !this.imageProcessor) return

    const imageData = this.imageProcessor.getImageData()
    if (!imageData) return

    // Get the display rectangle of the image (including its offset in the container)
    const displayRect = this.imageProcessor.getDisplayRect()
    if (!displayRect) return

    // Create crop box
    this.cropBox = new CropBox(this.wrapper, {
      aspectRatio: this.options.aspectRatio || this.options.initialAspectRatio || undefined,
      minWidth: this.options.minCropBoxWidth,
      minHeight: this.options.minCropBoxHeight,
      maxWidth: this.options.maxCropBoxWidth,
      maxHeight: this.options.maxCropBoxHeight,
      modal: this.options.modal,
      modalOpacity: this.options.modalOpacity,
      guides: this.options.guides,
      center: this.options.center,
      highlight: this.options.highlight,
      highlightOpacity: this.options.highlightOpacity,
      background: this.options.background,
      style: this.options.cropBoxStyle
    })

    // Render crop box
    this.cropBox.render()

    // Auto crop
    if (this.options.autoCrop) {
      // Use initialCropBoxSize if provided, otherwise use autoCropArea for backwards compatibility
      const sizeRatio = this.options.initialCropBoxSize ?? this.options.autoCropArea ?? 0.5

      // Use aspect ratio if provided, otherwise use initialAspectRatio (default to 1 for square)
      const aspectRatio = this.options.aspectRatio || this.options.initialAspectRatio || 1

      let width, height

      // Calculate initial crop box size based on the smaller dimension of the image
      const minImageDimension = Math.min(displayRect.width, displayRect.height)

      if (aspectRatio === 1) {
        // For square crop box
        width = minImageDimension * sizeRatio
        height = width
      } else if (aspectRatio > 1) {
        // Landscape orientation
        // Start with the smaller dimension and calculate based on aspect ratio
        height = minImageDimension * sizeRatio
        width = height * aspectRatio

        // If width exceeds the image width, scale down
        if (width > displayRect.width * 0.9) {
          width = displayRect.width * sizeRatio
          height = width / aspectRatio
        }
      } else {
        // Portrait orientation
        width = minImageDimension * sizeRatio
        height = width / aspectRatio

        // If height exceeds the image height, scale down
        if (height > displayRect.height * 0.9) {
          height = displayRect.height * sizeRatio
          width = height * aspectRatio
        }
      }

      // Ensure crop box doesn't exceed image boundaries
      width = Math.min(width, displayRect.width * 0.95)
      height = Math.min(height, displayRect.height * 0.95)

      // Center the crop box relative to the actual image position in the container
      const left = displayRect.left + (displayRect.width - width) / 2
      const top = displayRect.top + (displayRect.height - height) / 2

      this.cropBox.setData({
        left,
        top,
        width,
        height
      })
    }
  }

  /**
   * Initialize interaction manager
   */
  private initInteractionManager(): void {
    if (!this.wrapper) return

    this.interactionManager = new InteractionManager(
      this.wrapper,
      {
        onStart: this.handleInteractionStart.bind(this),
        onMove: this.handleInteractionMove.bind(this),
        onEnd: this.handleInteractionEnd.bind(this),
        onZoom: this.handleZoom.bind(this)
      },
      {
        movable: this.options.movable,
        zoomable: this.options.zoomable,
        zoomOnTouch: this.options.zoomOnTouch,
        zoomOnWheel: this.options.zoomOnWheel,
        wheelZoomRatio: this.options.wheelZoomRatio
      }
    )
  }

  /**
   * Initialize toolbar
   */
  private initToolbar(): void {
    if (!this.container || !this.options.toolbar) return

    // Destroy existing toolbar if any
    if (this.toolbar) {
      this.toolbar.destroy()
    }

    // Handle both boolean and object toolbar options
    const toolbarOptions = typeof this.options.toolbar === 'boolean'
      ? {} // Use default options if true
      : this.options.toolbar

    // Create a toolbar container wrapper if not exists
    let toolbarContainer = this.container.querySelector('.cropper-toolbar-container') as HTMLElement
    if (!toolbarContainer) {
      toolbarContainer = document.createElement('div')
      toolbarContainer.className = 'cropper-toolbar-container'
      // Insert toolbar container after the cropper wrapper
      if (this.wrapper && this.wrapper.nextSibling) {
        this.container.insertBefore(toolbarContainer, this.wrapper.nextSibling)
      } else {
        this.container.appendChild(toolbarContainer)
      }
    }

    // Create toolbar with options, using the toolbar container
    this.toolbar = new Toolbar(this, toolbarContainer, toolbarOptions)

    // Listen to toolbar crop event
    this.container.addEventListener('toolbar:crop', (event: any) => {
      const canvas = event.detail.canvas
      if (canvas && this.options.onToolbarCrop) {
        this.options.onToolbarCrop(canvas)
      }
    })
  }

  /**
   * Handle interaction start
   */
  private handleInteractionStart(action: Action, point: Point, event: MouseEvent | TouchEvent): void {
    this.currentAction = action

    if (this.container) {
      dispatch(this.container, 'cropstart', {
        action,
        originalEvent: event
      })
    }

    if (this.options.cropstart) {
      this.options.cropstart(new CustomEvent('cropstart', { detail: { action, originalEvent: event } }))
    }
  }

  /**
   * Handle interaction move
   */
  private handleInteractionMove(
    action: Action,
    point: Point,
    deltaX: number,
    deltaY: number,
    event: MouseEvent | TouchEvent
  ): void {
    if (!this.cropBox) return

    // Handle different actions
    switch (action) {
      case 'move':
        if (this.options.cropBoxMovable) {
          this.cropBox.move(deltaX, deltaY)
          this.applyViewModeConstraints()
        }
        break

      case 'crop':
        // Move entire image (not the crop box)
        if (this.options.movable && this.imageProcessor) {
          this.imageProcessor.move(deltaX, deltaY)
        }
        break

      // Handle resize actions
      case 'e':
      case 'w':
      case 's':
      case 'n':
      case 'se':
      case 'sw':
      case 'ne':
      case 'nw':
        if (this.options.cropBoxResizable) {
          this.handleResize(action, deltaX, deltaY)
          this.applyViewModeConstraints()
        }
        break
    }

    // Dispatch crop event
    if (this.container) {
      dispatch(this.container, 'crop', this.getData())
    }

    if (this.options.crop) {
      this.options.crop(new CustomEvent('crop', { detail: this.getData() }))
    }
  }

  /**
   * Handle interaction end
   */
  private handleInteractionEnd(action: Action, point: Point, event: MouseEvent | TouchEvent): void {
    if (this.container) {
      dispatch(this.container, 'cropend', {
        action,
        originalEvent: event
      })
    }

    if (this.options.cropend) {
      this.options.cropend(new CustomEvent('cropend', { detail: { action, originalEvent: event } }))
    }
  }

  /**
   * Handle resize
   */
  private handleResize(action: Action, deltaX: number, deltaY: number): void {
    if (!this.cropBox) return

    const data = this.cropBox.getData()
    const newData = { ...data }

    switch (action) {
      case 'e':
        newData.width = data.width + deltaX
        break
      case 'w':
        newData.width = data.width - deltaX
        newData.left = data.left + deltaX
        break
      case 's':
        newData.height = data.height + deltaY
        break
      case 'n':
        newData.height = data.height - deltaY
        newData.top = data.top + deltaY
        break
      case 'se':
        newData.width = data.width + deltaX
        newData.height = data.height + deltaY
        break
      case 'sw':
        newData.width = data.width - deltaX
        newData.height = data.height + deltaY
        newData.left = data.left + deltaX
        break
      case 'ne':
        newData.width = data.width + deltaX
        newData.height = data.height - deltaY
        newData.top = data.top + deltaY
        break
      case 'nw':
        newData.width = data.width - deltaX
        newData.height = data.height - deltaY
        newData.left = data.left + deltaX
        newData.top = data.top + deltaY
        break
    }

    this.cropBox.setData(newData)
  }

  /**
   * Apply view mode constraints
   */
  private applyViewModeConstraints(): void {
    if (!this.cropBox || !this.imageProcessor) return

    const viewMode = this.options.viewMode || 0
    if (viewMode === 0) return // No restrictions

    const imageRect = this.imageProcessor.getDisplayRect()
    if (!imageRect) return

    const cropBoxData = this.cropBox.getData()

    if (viewMode >= 1) {
      // Restrict crop box to not exceed the image boundaries
      const newData = { ...cropBoxData }

      // Constrain position
      newData.left = clamp(cropBoxData.left, imageRect.left, imageRect.left + imageRect.width - cropBoxData.width)
      newData.top = clamp(cropBoxData.top, imageRect.top, imageRect.top + imageRect.height - cropBoxData.height)

      // Constrain size
      if (cropBoxData.left < imageRect.left || cropBoxData.left + cropBoxData.width > imageRect.left + imageRect.width) {
        newData.width = Math.min(cropBoxData.width, imageRect.width)
        newData.left = Math.max(imageRect.left, Math.min(cropBoxData.left, imageRect.left + imageRect.width - newData.width))
      }

      if (cropBoxData.top < imageRect.top || cropBoxData.top + cropBoxData.height > imageRect.top + imageRect.height) {
        newData.height = Math.min(cropBoxData.height, imageRect.height)
        newData.top = Math.max(imageRect.top, Math.min(cropBoxData.top, imageRect.top + imageRect.height - newData.height))
      }

      this.cropBox.setData(newData, false)
    }
  }

  /**
   * Handle zoom
   */
  private handleZoom(delta: number, point: Point, event: WheelEvent | TouchEvent): void {
    if (!this.options.zoomable || !this.imageProcessor) return

    const imageData = this.imageProcessor.getImageData()
    if (!imageData) return

    // Calculate new scale based on delta
    const ratio = 1 + delta
    const newScaleX = imageData.scaleX * ratio
    const newScaleY = imageData.scaleY * ratio

    // Apply the new scale
    this.imageProcessor.scale(newScaleX, newScaleY)

    // Update zoom tracking
    this.zoom = (newScaleX + newScaleY) / 2

    if (this.container) {
      dispatch(this.container, 'zoom', { zoom: this.zoom, originalEvent: event })
    }

    if (this.options.zoom) {
      this.options.zoom(new CustomEvent('zoom', { detail: { zoom: this.zoom, originalEvent: event } }))
    }
  }

  /**
   * Get crop data
   */
  getData(rounded = false): CropData {
    if (!this.cropBox || !this.imageProcessor) {
      return {
        x: 0, y: 0, width: 0, height: 0,
        rotate: 0, scaleX: 1, scaleY: 1,
        skewX: 0, skewY: 0,
        translateX: 0, translateY: 0
      }
    }

    const cropBoxData = this.cropBox.getData()
    const imageData = this.imageProcessor.getImageData()
    const displayRect = this.imageProcessor.getDisplayRect()

    if (!imageData || !displayRect) {
      return {
        x: 0, y: 0, width: 0, height: 0,
        rotate: 0, scaleX: 1, scaleY: 1,
        skewX: 0, skewY: 0,
        translateX: 0, translateY: 0
      }
    }

    // Calculate crop coordinates relative to the original image
    // Account for image position, scale and transforms
    const scaleX = imageData.scaleX
    const scaleY = imageData.scaleY
    const imageLeft = displayRect.left + imageData.translateX
    const imageTop = displayRect.top + imageData.translateY

    // Convert crop box coordinates to image coordinates
    const relativeX = (cropBoxData.left - imageLeft) / Math.abs(scaleX)
    const relativeY = (cropBoxData.top - imageTop) / Math.abs(scaleY)
    const relativeWidth = cropBoxData.width / Math.abs(scaleX)
    const relativeHeight = cropBoxData.height / Math.abs(scaleY)

    // Map to natural image dimensions
    const ratio = imageData.naturalWidth / imageData.width

    const data: CropData = {
      x: relativeX * ratio,
      y: relativeY * ratio,
      width: relativeWidth * ratio,
      height: relativeHeight * ratio,
      rotate: imageData.rotate,
      scaleX: imageData.scaleX,
      scaleY: imageData.scaleY,
      skewX: imageData.skewX,
      skewY: imageData.skewY,
      translateX: imageData.translateX,
      translateY: imageData.translateY
    }

    if (rounded) {
      data.x = Math.round(data.x)
      data.y = Math.round(data.y)
      data.width = Math.round(data.width)
      data.height = Math.round(data.height)
    }

    return data
  }

  /**
   * Get image data
   */
  getImageData(): ImageData | null {
    if (!this.imageProcessor) return null
    return this.imageProcessor.getImageData()
  }

  /**
   * Set crop box data
   */
  setData(data: Partial<CropBoxData>): void {
    if (!this.ready || !this.cropBox) return
    this.cropBox.setData(data)
  }

  /**
   * Get container data
   */
  getContainerData(): ContainerData | null {
    if (!this.container) return null
    return {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    }
  }

  /**
   * Get canvas data
   */
  getCanvasData(): CanvasData | null {
    if (!this.imageProcessor) return null
    const rect = this.imageProcessor.getDisplayRect()
    const imageData = this.imageProcessor.getImageData()
    if (!rect || !imageData) return null
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      naturalWidth: imageData.naturalWidth,
      naturalHeight: imageData.naturalHeight
    }
  }

  /**
   * Set canvas data
   */
  setCanvasData(data: Partial<CanvasData>): void {
    if (!this.ready || !this.imageProcessor) return
    // Canvas data is managed by imageProcessor through transforms
    // This would require implementing a method to set the display rect
    // For now, this is a placeholder
  }

  /**
   * Get crop box data
   */
  getCropBoxData(): CropBoxData | null {
    if (!this.cropBox) return null
    return this.cropBox.getData()
  }

  /**
   * Set crop box data
   */
  setCropBoxData(data: Partial<CropBoxData>): void {
    if (!this.ready || !this.cropBox) return
    this.cropBox.setData(data)
  }

  /**
   * Set aspect ratio
   */
  setAspectRatio(aspectRatio: number): void {
    if (!this.ready || !this.cropBox) return
    this.options.aspectRatio = aspectRatio
    this.cropBox.setAspectRatio(aspectRatio)
  }

  /**
   * Set options dynamically
   */
  setOptions(options: Partial<CropperOptions>): void {
    this.options = { ...this.options, ...options }

    // Apply certain options immediately if cropper is ready
    if (this.ready) {
      if (options.aspectRatio !== undefined && this.cropBox) {
        this.cropBox.setAspectRatio(options.aspectRatio)
      }
      if (options.cropBoxStyle !== undefined && this.cropBox) {
        this.cropBox.setStyle(options.cropBoxStyle)
      }
      if (options.dragMode !== undefined) {
        this.dragMode = options.dragMode
      }
    }
  }

  /**
   * Get cropped canvas
   */
  getCroppedCanvas(options: GetCroppedCanvasOptions & { applyShape?: boolean; autoFormat?: boolean } = {}): HTMLCanvasElement | null {
    if (!this.ready || !this.imageProcessor || !this.cropBox) return null

    const cropBoxData = this.cropBox.getData()

    // Enhanced options with shape and background handling
    const enhancedOptions: any = { ...options }

    // Add crop shape if applyShape is true
    if (options.applyShape && this.options.cropBoxStyle !== 'default') {
      enhancedOptions.cropShape = this.options.cropBoxStyle

      // For rounded and circle shapes, add white background outside the shape
      if (this.options.cropBoxStyle === 'circle' || this.options.cropBoxStyle === 'rounded') {
        enhancedOptions.fillBackground = true
      }
    }

    return this.imageProcessor.getCroppedCanvas(cropBoxData, enhancedOptions)
  }

  /**
   * Get the appropriate export format based on crop box style
   */
  getExportFormat(): { type: string; extension: string; quality: number } {
    // For circle and rounded styles, use PNG to preserve transparency
    // For other styles, use JPG for better compression
    if (this.options.cropBoxStyle === 'circle' || this.options.cropBoxStyle === 'rounded') {
      return {
        type: 'image/png',
        extension: 'png',
        quality: 1
      }
    } else {
      return {
        type: 'image/jpeg',
        extension: 'jpg',
        quality: 0.95
      }
    }
  }

  /**
   * Rotate image
   */
  rotate(degrees: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.rotatable) return
    this.imageProcessor.rotate(degrees)
  }

  /**
   * Scale image
   */
  scale(scaleX: number, scaleY?: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.scalable) return
    this.imageProcessor.scale(scaleX, scaleY)
  }

  /**
   * Flip horizontal
   */
  scaleX(scaleX: number): void {
    this.scale(scaleX, undefined)
  }

  /**
   * Flip vertical
   */
  scaleY(scaleY: number): void {
    if (!this.ready || !this.imageProcessor) return
    const imageData = this.imageProcessor.getImageData()
    if (imageData) {
      this.scale(imageData.scaleX, scaleY)
    }
  }

  /**
   * Skew image
   */
  skew(skewX: number, skewY?: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.skewable) return
    this.imageProcessor.skew(skewX, skewY)
  }

  /**
   * Skew horizontal
   */
  skewX(skewX: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.skewable) return
    this.imageProcessor.skewX(skewX)
  }

  /**
   * Skew vertical
   */
  skewY(skewY: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.skewable) return
    this.imageProcessor.skewY(skewY)
  }

  /**
   * Translate image
   */
  translate(x: number, y: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.translatable) return
    this.imageProcessor.translate(x, y)
  }

  /**
   * Move image
   */
  move(deltaX: number, deltaY: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.translatable) return
    this.imageProcessor.move(deltaX, deltaY)
  }

  /**
   * Add background to the container
   */
  private addBackground(): void {
    if (!this.wrapper) return

    // Check if background already exists
    const existingBg = this.wrapper.querySelector('.cropper-bg')
    if (!existingBg) {
      const backgroundElement = createElement('div', 'cropper-bg')
      // Insert as first child to ensure it's at the bottom
      this.wrapper.insertBefore(backgroundElement, this.wrapper.firstChild)
    }
  }

  /**
   * Reset
   */
  reset(): void {
    if (!this.ready) return

    if (this.imageProcessor) {
      this.imageProcessor.reset()
    }

    if (this.cropBox) {
      // Destroy the existing crop box before creating a new one
      this.cropBox.destroy()
      this.initCropBox()
    }

    this.zoom = 1
  }

  /**
   * Clear
   */
  clear(): void {
    if (!this.ready || !this.cropBox) return
    this.cropBox.hide()
  }

  /**
   * Set crop box style
   */
  setCropBoxStyle(style: 'default' | 'rounded' | 'circle' | 'minimal' | 'dotted' | 'solid' | 'gradient'): void {
    if (!this.cropBox) return
    this.cropBox.setStyle(style)
    this.options.cropBoxStyle = style
  }

  /**
   * Disable
   */
  disable(): void {
    this.disabled = true
    if (this.interactionManager) {
      this.interactionManager.disable()
    }
  }

  /**
   * Enable
   */
  enable(): void {
    this.disabled = false
    if (this.interactionManager) {
      this.interactionManager.enable()
    }
  }

  /**
   * Show placeholder
   */
  private showPlaceholder(): void {
    if (!this.wrapper || this.placeholderElement) return

    const placeholder = this.options.placeholder
    if (!placeholder) return

    // Create placeholder element
    this.placeholderElement = createElement('div', 'cropper-placeholder')
    if (placeholder.className) {
      addClass(this.placeholderElement, placeholder.className)
    }

    // Add icon
    if (placeholder.icon) {
      const iconElement = createElement('div', 'cropper-placeholder-icon')
      iconElement.innerHTML = placeholder.icon
      this.placeholderElement.appendChild(iconElement)
    } else {
      // Default SVG icon
      const iconElement = createElement('div', 'cropper-placeholder-icon')
      iconElement.innerHTML = `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      `
      this.placeholderElement.appendChild(iconElement)
    }

    // Add text
    if (placeholder.text) {
      const textElement = createElement('div', 'cropper-placeholder-text')
      textElement.textContent = placeholder.text
      this.placeholderElement.appendChild(textElement)
    }

    // Add subtext
    if (placeholder.subtext) {
      const subtextElement = createElement('div', 'cropper-placeholder-subtext')
      subtextElement.textContent = placeholder.subtext
      this.placeholderElement.appendChild(subtextElement)
    }

    // Create hidden file input
    if (placeholder.clickToUpload || placeholder.dragAndDrop) {
      this.fileInput = document.createElement('input')
      this.fileInput.type = 'file'
      this.fileInput.accept = placeholder.acceptedFiles || 'image/*'
      this.fileInput.style.display = 'none'
      this.wrapper.appendChild(this.fileInput)

      // Handle file input change
      this.fileInput.addEventListener('change', this.handleFileSelect.bind(this))
    }

    // Add click handler
    if (placeholder.clickToUpload) {
      this.placeholderElement.style.cursor = 'pointer'
      this.placeholderElement.addEventListener('click', () => {
        if (this.fileInput) {
          this.fileInput.click()
        }
      })
    }

    // Add drag and drop handlers
    if (placeholder.dragAndDrop) {
      this.placeholderElement.addEventListener('dragover', this.handleDragOver.bind(this))
      this.placeholderElement.addEventListener('dragleave', this.handleDragLeave.bind(this))
      this.placeholderElement.addEventListener('drop', this.handleDrop.bind(this))
    }

    this.wrapper.appendChild(this.placeholderElement)
  }

  /**
   * Hide placeholder
   */
  private hidePlaceholder(): void {
    if (this.placeholderElement && this.placeholderElement.parentNode) {
      this.placeholderElement.parentNode.removeChild(this.placeholderElement)
      this.placeholderElement = null
    }
  }

  /**
   * Handle file selection
   */
  private handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      this.loadFile(input.files[0])
    }
  }

  /**
   * Handle drag over
   */
  private handleDragOver(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    if (this.placeholderElement) {
      addClass(this.placeholderElement, 'cropper-placeholder-dragover')
    }
  }

  /**
   * Handle drag leave
   */
  private handleDragLeave(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    if (this.placeholderElement) {
      removeClass(this.placeholderElement, 'cropper-placeholder-dragover')
    }
  }

  /**
   * Handle drop
   */
  private handleDrop(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()

    if (this.placeholderElement) {
      removeClass(this.placeholderElement, 'cropper-placeholder-dragover')
    }

    const files = event.dataTransfer?.files
    if (files && files[0]) {
      // Check if it's an image file
      if (files[0].type.startsWith('image/')) {
        this.loadFile(files[0])
      } else {
        this.handleUploadError('Please drop an image file')
      }
    }
  }

  /**
   * Load file
   */
  private loadFile(file: File): void {
    const placeholder = this.options.placeholder

    // Check file size
    if (placeholder?.maxFileSize) {
      const maxSizeInBytes = placeholder.maxFileSize * 1024 * 1024
      if (file.size > maxSizeInBytes) {
        this.handleUploadError(`File size must be less than ${placeholder.maxFileSize}MB`)
        return
      }
    }

    // Create object URL and load image
    const url = URL.createObjectURL(file)

    // Load the image
    this.replace(url).then(() => {
      // Dispatch upload event
      if (this.container) {
        dispatch(this.container, 'upload', { file, url })
      }
      if (this.options.upload) {
        this.options.upload(new CustomEvent('upload', { detail: { file, url } }))
      }
    }).catch((error) => {
      URL.revokeObjectURL(url)
      this.handleUploadError('Failed to load image')
    })
  }

  /**
   * Handle upload error
   */
  private handleUploadError(message: string): void {
    console.error('Upload error:', message)

    // Dispatch error event
    if (this.container) {
      dispatch(this.container, 'uploadError', { message })
    }
    if (this.options.uploadError) {
      this.options.uploadError(new CustomEvent('uploadError', { detail: { message } }))
    }
  }

  /**
   * Initialize history manager
   */
  private initHistoryManager(): void {
    if (!this.options.history) return

    const historyOptions = typeof this.options.history === 'object' ? this.options.history : {}
    this.historyManager = new HistoryManager(this, historyOptions)

    // Listen for history change events to update toolbar buttons
    this.historyManager.on('change', (data: { canUndo: boolean, canRedo: boolean }) => {
      if (this.toolbar) {
        this.toolbar.updateButton('undo', { disabled: !data.canUndo })
        this.toolbar.updateButton('redo', { disabled: !data.canRedo })
      }
    })

    // Listen for toolbar undo/redo events
    if (this.container) {
      this.container.addEventListener('toolbar:undo', () => {
        if (this.historyManager) {
          this.historyManager.undo()
        }
      })

      this.container.addEventListener('toolbar:redo', () => {
        if (this.historyManager) {
          this.historyManager.redo()
        }
      })
    }
  }

  /**
   * Initialize preset manager
   */
  private initPresetManager(): void {
    if (!this.options.presets) return

    const presetOptions = typeof this.options.presets === 'object' ? this.options.presets : {}
    this.presetManager = new PresetManager(this, presetOptions)
  }

  /**
   * Get history manager
   */
  public getHistoryManager(): HistoryManager | null {
    return this.historyManager
  }

  /**
   * Get preset manager
   */
  public getPresetManager(): PresetManager | null {
    return this.presetManager
  }

  /**
   * Analyze image using AI
   * Returns brightness, contrast, dominant colors, etc.
   */
  public async analyzeImage(): Promise<any> {
    if (!this.workerManager || !this.imageProcessor) {
      throw new Error('Worker manager not initialized or no image loaded')
    }

    const canvas = this.imageProcessor.getCanvas()
    if (!canvas) {
      throw new Error('No canvas available')
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return this.workerManager.analyzeImage(imageData)
  }

  /**
   * Detect faces in the image
   * Returns array of detected faces with positions
   */
  public async detectFaces(): Promise<any> {
    if (!this.workerManager || !this.imageProcessor) {
      throw new Error('Worker manager not initialized or no image loaded')
    }

    const canvas = this.imageProcessor.getCanvas()
    if (!canvas) {
      throw new Error('No canvas available')
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return this.workerManager.detectFaces(imageData)
  }

  /**
   * Get composition suggestions
   * Returns array of suggested crop areas based on composition rules
   */
  public async getCompositionSuggestions(): Promise<any> {
    if (!this.workerManager || !this.imageProcessor) {
      throw new Error('Worker manager not initialized or no image loaded')
    }

    const canvas = this.imageProcessor.getCanvas()
    if (!canvas) {
      throw new Error('No canvas available')
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const suggestions = await this.workerManager.suggestComposition(imageData)

    // Sort by score and return
    return suggestions.sort((a: any, b: any) => b.score - a.score)
  }

  /**
   * Apply smart crop based on AI suggestions
   * @param type - Type of composition: 'face', 'rule-of-thirds', 'golden-ratio', etc.
   */
  public async applySmartCrop(type: string = 'auto'): Promise<void> {
    if (!this.cropBox) {
      throw new Error('Crop box not initialized')
    }

    let cropData = null

    if (type === 'face') {
      // Try face detection first
      const faces = await this.detectFaces()
      if (faces.faces && faces.faces.length > 0) {
        // Use the first detected face
        const face = faces.faces[0]
        // Add some padding around the face
        const padding = Math.max(face.width, face.height) * 0.3
        cropData = {
          x: Math.max(0, face.x - padding),
          y: Math.max(0, face.y - padding),
          width: face.width + padding * 2,
          height: face.height + padding * 2
        }
      }
    } else if (type === 'auto') {
      // Get composition suggestions
      const suggestions = await this.getCompositionSuggestions()
      if (suggestions && suggestions.length > 0) {
        cropData = suggestions[0].cropBox
      }
    } else {
      // Get specific composition type
      const suggestions = await this.getCompositionSuggestions()
      const suggestion = suggestions.find((s: any) => s.type === type)
      if (suggestion) {
        cropData = suggestion.cropBox
      }
    }

    // Apply the crop
    if (cropData) {
      this.cropBox.setCropBoxData(cropData)

      // Dispatch event
      if (this.container) {
        dispatch(this.container, 'smartcrop', { type, cropData })
      }
    }
  }

  /**
   * Initialize touch gestures
   */
  private initTouchGestures(): void {
    if (!this.wrapper) return

    this.touchGestureManager = new TouchGestureManager(this.wrapper, this.options.touchOptions)

    // Set up gesture callbacks
    this.touchGestureManager.setPanCallback((deltaX, deltaY) => {
      if (this.cropBox) {
        this.cropBox.move(deltaX, deltaY)

        // Announce for accessibility
        if (this.accessibilityManager) {
          this.accessibilityManager.announce('Moving crop box')
        }
      }
    })

    this.touchGestureManager.setZoomCallback((scale, centerX, centerY) => {
      if (this.imageProcessor) {
        const currentScale = this.imageProcessor.getImageData().scaleX || 1
        this.scale(currentScale * scale)

        // Announce zoom level
        if (this.accessibilityManager) {
          this.accessibilityManager.announceValue('zoom', scale * 100)
        }
      }
    })

    this.touchGestureManager.setRotateCallback((angle, centerX, centerY) => {
      this.rotate(angle)

      // Announce rotation
      if (this.accessibilityManager) {
        this.accessibilityManager.announceValue('rotation', angle)
      }
    })

    this.touchGestureManager.setDoubleTapCallback((x, y) => {
      // Toggle between fit and 2x zoom
      const currentZoom = this.zoom
      if (currentZoom > 1.5) {
        this.scale(1)
      } else {
        this.scale(2)
      }
    })

    this.touchGestureManager.setSwipeCallback((direction) => {
      // Swipe to navigate presets or undo/redo
      if (direction === 'left' && this.historyManager) {
        this.historyManager.undo()
      } else if (direction === 'right' && this.historyManager) {
        this.historyManager.redo()
      }
    })
  }

  /**
   * Initialize mobile UI
   */
  private initMobileUI(): void {
    if (!this.wrapper) return

    this.mobileUI = new MobileUI(this.wrapper, this.options.mobileOptions)

    // Set up control actions
    this.mobileUI.setControlAction('rotate', () => this.rotate(90))
    this.mobileUI.setControlAction('flip-h', () => this.scaleX(-this.getImageData().scaleX || 1))
    this.mobileUI.setControlAction('flip-v', () => this.scaleY(-this.getImageData().scaleY || 1))
    this.mobileUI.setControlAction('aspect', () => {
      // Cycle through aspect ratios
      const ratios = [0, 1, 4 / 3, 16 / 9, 2 / 3]
      const current = this.options.aspectRatio || 0
      const index = ratios.indexOf(current)
      const next = ratios[(index + 1) % ratios.length]
      this.setAspectRatio(next)
    })
    this.mobileUI.setControlAction('reset', () => this.reset())
    this.mobileUI.setControlAction('done', () => {
      const canvas = this.getCroppedCanvas()
      if (this.options.onToolbarCrop && canvas) {
        this.options.onToolbarCrop(canvas)
      }
    })

    // Update mobile UI when state changes
    if (this.container) {
      this.container.addEventListener('crop', () => {
        if (this.mobileUI && this.cropBox) {
          const data = this.cropBox.getCropBoxData()
          const aspectRatio = data.width / data.height

          // Update aspect ratio button
          let label = 'Free'
          if (Math.abs(aspectRatio - 1) < 0.01) label = '1:1'
          else if (Math.abs(aspectRatio - 4 / 3) < 0.01) label = '4:3'
          else if (Math.abs(aspectRatio - 16 / 9) < 0.01) label = '16:9'
          else if (Math.abs(aspectRatio - 2 / 3) < 0.01) label = '2:3'

          this.mobileUI.updateControl('aspect', { label })
        }
      })
    }
  }

  /**
   * Initialize selection and mask system
   */
  private initSelectionAndMask(): void {
    if (!this.wrapper || !this.imageProcessor) return

    const canvas = this.imageProcessor.getCanvas()
    if (!canvas) return

    const { width, height } = canvas

    // Initialize selection
    if (this.options.selection) {
      this.selection = new Selection(width, height, this.options.selectionOptions)

      // Add selection canvas to wrapper
      const selectionCanvas = this.selection.getCanvas()
      selectionCanvas.style.position = 'absolute'
      selectionCanvas.style.top = '0'
      selectionCanvas.style.left = '0'
      selectionCanvas.style.width = '100%'
      selectionCanvas.style.height = '100%'
      selectionCanvas.style.pointerEvents = 'none'
      selectionCanvas.style.zIndex = '2'
      this.wrapper.appendChild(selectionCanvas)
    }

    // Initialize mask manager
    if (this.options.masks) {
      this.maskManager = new MaskManager(
        this.wrapper,
        width,
        height,
        this.options.maskOptions
      )

      // Set the selection instance
      if (this.selection) {
        this.maskManager.setSelection?.(this.selection)
      }
    }

    // Initialize selection toolbar if enabled
    if (this.options.selectionOptions?.showToolbar && (this.selection || this.maskManager)) {
      this.selectionToolbar = new SelectionToolbar(this.wrapper, {
        position: 'bottom',
        theme: this.options.theme || 'light'
      })

      // Connect toolbar to selection and mask manager
      if (this.selection) {
        this.selectionToolbar.setSelection(this.selection)
      }
      if (this.maskManager) {
        this.selectionToolbar.setMaskManager(this.maskManager)
      }

      // Setup event handlers for selection
      if (this.selection) {
        this.setupSelectionHandlers()
      }
    }
  }

  /**
   * Setup selection event handlers
   */
  private setupSelectionHandlers(): void {
    if (!this.wrapper || !this.selection) return

    let isSelecting = false

    const handleMouseDown = (event: MouseEvent) => {
      if (!this.selection || this.dragMode !== 'none') return

      const rect = this.wrapper!.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      isSelecting = true
      this.selection.startSelection(x, y)
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!this.selection || !isSelecting) return

      const rect = this.wrapper!.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      this.selection.updateSelection(x, y)
    }

    const handleMouseUp = () => {
      if (!this.selection || !isSelecting) return

      isSelecting = false
      this.selection.endSelection()
    }

    // Add event listeners
    this.wrapper.addEventListener('mousedown', handleMouseDown)
    this.wrapper.addEventListener('mousemove', handleMouseMove)
    this.wrapper.addEventListener('mouseup', handleMouseUp)
    this.wrapper.addEventListener('mouseleave', handleMouseUp)

    // Handle magic wand selection
    this.wrapper.addEventListener('click', (event: MouseEvent) => {
      if (!this.selection || this.selection.getType?.() !== 'magic-wand') return

      const rect = this.wrapper!.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Get image data
      const canvas = this.imageProcessor?.getCanvas()
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      this.selection.magicWandSelect(x, y, imageData)
    })
  }

  /**
   * Get worker manager instance
   */
  public getWorkerManager(): WorkerManager | null {
    return this.workerManager
  }

  /**
   * Get touch gesture manager
   */
  public getTouchGestureManager(): TouchGestureManager | null {
    return this.touchGestureManager
  }

  /**
   * Get mobile UI manager
   */
  public getMobileUI(): MobileUI | null {
    return this.mobileUI
  }

  /**
   * Get accessibility manager
   */
  public getAccessibilityManager(): AccessibilityManager | null {
    return this.accessibilityManager
  }

  /**
   * Get selection instance
   */
  public getSelection(): Selection | null {
    return this.selection
  }

  /**
   * Get mask manager instance
   */
  public getMaskManager(): MaskManager | null {
    return this.maskManager
  }

  /**
   * Get selection toolbar instance
   */
  public getSelectionToolbar(): SelectionToolbar | null {
    return this.selectionToolbar
  }

  /**
   * Enable selection mode
   */
  public enableSelectionMode(type?: SelectionType): void {
    if (!this.selection) {
      console.warn('Selection not initialized')
      return
    }

    // Set drag mode to none to prevent conflict
    this.setDragMode('none')

    // Set selection type if provided
    if (type) {
      this.selection.setType(type)
    }

    // Show selection toolbar
    if (this.selectionToolbar) {
      this.selectionToolbar.show()
    }
  }

  /**
   * Disable selection mode
   */
  public disableSelectionMode(): void {
    // Clear any active selection
    if (this.selection) {
      this.selection.clearSelection()
    }

    // Hide selection toolbar
    if (this.selectionToolbar) {
      this.selectionToolbar.hide()
    }

    // Restore drag mode
    this.setDragMode(this.options.dragMode || 'crop')
  }

  /**
   * Apply current selection as mask
   */
  public applySelectionAsMask(): void {
    if (!this.maskManager || !this.selection || !this.selection.hasSelection()) {
      console.warn('No active selection to convert to mask')
      return
    }

    this.maskManager.createMaskFromSelection()
  }

  /**
   * Apply mask to crop
   */
  public async applyCropWithMask(): Promise<HTMLCanvasElement | null> {
    if (!this.maskManager || !this.imageProcessor) {
      return this.getCroppedCanvas()
    }

    // Get cropped canvas
    const canvas = this.getCroppedCanvas()
    if (!canvas) return null

    // Apply mask
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const maskedData = this.maskManager.applyMaskToImage(imageData)

    ctx.putImageData(maskedData, 0, 0)

    return canvas
  }

  /**
   * Destroy
   */
  destroy(): void {
    if (!this.container) return

    if (this.historyManager) {
      this.historyManager.destroy()
    }

    if (this.presetManager) {
      this.presetManager.destroy()
    }

    if (this.toolbar) {
      this.toolbar.destroy()
    }

    if (this.interactionManager) {
      this.interactionManager.destroy()
    }

    if (this.cropBox) {
      this.cropBox.destroy()
    }

    if (this.imageProcessor) {
      this.imageProcessor.destroy()
    }

    if (this.workerManager) {
      this.workerManager.terminate()
    }

    if (this.touchGestureManager) {
      this.touchGestureManager.destroy()
    }

    if (this.mobileUI) {
      this.mobileUI.destroy()
    }

    if (this.accessibilityManager) {
      this.accessibilityManager.destroy()
    }

    if (this.selection) {
      this.selection.destroy()
    }

    if (this.maskManager) {
      this.maskManager.destroy()
    }

    if (this.selectionToolbar) {
      this.selectionToolbar.destroy()
    }

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper)
    }

    this.container = null
    this.wrapper = null
    this.cropBox = null
    this.imageProcessor = null
    this.interactionManager = null
    this.toolbar = null
    this.historyManager = null
    this.presetManager = null
    this.workerManager = null
    this.touchGestureManager = null
    this.mobileUI = null
    this.accessibilityManager = null
    this.ready = false
  }
}
