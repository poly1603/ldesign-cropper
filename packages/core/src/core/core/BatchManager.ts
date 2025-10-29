/**
 * Batch Manager UI
 * User interface for batch processing
 */

import type { CropperOptions, GetCroppedCanvasOptions } from '../types'
import type { BatchItem } from './BatchProcessor'
import { createElement } from '../utils/dom'
import { BatchProcessor } from './BatchProcessor'

export interface BatchManagerOptions {
  container: HTMLElement
  cropperOptions?: CropperOptions
  canvasOptions?: GetCroppedCanvasOptions
  showThumbnails?: boolean
  thumbnailSize?: number
  allowRemove?: boolean
  autoStart?: boolean
}

export class BatchManager {
  private container: HTMLElement
  private processor: BatchProcessor
  private options: BatchManagerOptions
  private element: HTMLDivElement | null = null
  private itemElements: Map<string, HTMLElement> = new Map()

  constructor(options: BatchManagerOptions) {
    this.container = options.container
    this.options = {
      showThumbnails: true,
      thumbnailSize: 150,
      allowRemove: true,
      autoStart: false,
      ...options,
    }

    this.processor = new BatchProcessor({
      cropperOptions: this.options.cropperOptions,
      canvasOptions: this.options.canvasOptions,
      autoStart: this.options.autoStart,
      onProgress: this.handleProgress.bind(this),
      onItemComplete: this.handleItemComplete.bind(this),
      onComplete: this.handleComplete.bind(this),
      onError: this.handleError.bind(this),
    })

    this.render()
  }

  /**
   * Render batch manager UI
   */
  private render(): void {
    this.element = createElement('div', 'cropper-batch-manager')

    // Create header
    const header = this.createHeader()
    this.element.appendChild(header)

    // Create upload area
    const uploadArea = this.createUploadArea()
    this.element.appendChild(uploadArea)

    // Create items grid
    const grid = createElement('div', 'batch-items-grid')
    grid.id = 'batch-items-grid'
    this.element.appendChild(grid)

    // Create footer with controls
    const footer = this.createFooter()
    this.element.appendChild(footer)

    this.container.appendChild(this.element)
  }

  /**
   * Create header
   */
  private createHeader(): HTMLElement {
    const header = createElement('div', 'batch-manager-header')

    const title = createElement('h3', 'batch-manager-title')
    title.textContent = 'Batch Image Processing'

    const info = createElement('div', 'batch-manager-info')
    info.id = 'batch-info'
    info.textContent = '0 images selected'

    header.appendChild(title)
    header.appendChild(info)

    return header
  }

  /**
   * Create upload area
   */
  private createUploadArea(): HTMLElement {
    const area = createElement('div', 'batch-upload-area')

    const icon = createElement('div', 'batch-upload-icon')
    icon.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    `

    const text = createElement('div', 'batch-upload-text')
    text.textContent = 'Click to select images or drag and drop'

    const subtext = createElement('div', 'batch-upload-subtext')
    subtext.textContent = 'Multiple files supported'

    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*'
    input.style.display = 'none'
    input.addEventListener('change', this.handleFileSelect.bind(this))

    area.addEventListener('click', () => input.click())
    area.addEventListener('dragover', this.handleDragOver.bind(this))
    area.addEventListener('dragleave', this.handleDragLeave.bind(this))
    area.addEventListener('drop', this.handleDrop.bind(this))

    area.appendChild(icon)
    area.appendChild(text)
    area.appendChild(subtext)
    area.appendChild(input)

    return area
  }

  /**
   * Create footer with controls
   */
  private createFooter(): HTMLElement {
    const footer = createElement('div', 'batch-manager-footer')

    // Progress bar
    const progressContainer = createElement('div', 'batch-progress-container')
    const progressBar = createElement('div', 'batch-progress-bar')
    progressBar.id = 'batch-progress-bar'
    progressBar.style.width = '0%'
    progressContainer.appendChild(progressBar)

    // Buttons
    const buttons = createElement('div', 'batch-manager-buttons')

    const startBtn = createElement('button', 'batch-button batch-button-primary')
    startBtn.id = 'batch-start-btn'
    startBtn.textContent = 'Start Processing'
    startBtn.addEventListener('click', () => this.start())

    const cancelBtn = createElement('button', 'batch-button')
    cancelBtn.id = 'batch-cancel-btn'
    cancelBtn.textContent = 'Cancel'
    cancelBtn.style.display = 'none'
    cancelBtn.addEventListener('click', () => this.cancel())

    const exportBtn = createElement('button', 'batch-button')
    exportBtn.id = 'batch-export-btn'
    exportBtn.textContent = 'Export All'
    exportBtn.style.display = 'none'
    exportBtn.addEventListener('click', () => this.export())

    const clearBtn = createElement('button', 'batch-button')
    clearBtn.textContent = 'Clear All'
    clearBtn.addEventListener('click', () => this.clear())

    buttons.appendChild(startBtn)
    buttons.appendChild(cancelBtn)
    buttons.appendChild(exportBtn)
    buttons.appendChild(clearBtn)

    footer.appendChild(progressContainer)
    footer.appendChild(buttons)

    return footer
  }

  /**
   * Handle file selection
   */
  private handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement
    if (!input.files)
      return

    const files = Array.from(input.files)
    this.addFiles(files)
  }

  /**
   * Handle drag over
   */
  private handleDragOver(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * Handle drag leave
   */
  private handleDragLeave(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * Handle drop
   */
  private handleDrop(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()

    const files = event.dataTransfer?.files
    if (!files)
      return

    const imageFiles = Array.from(files).filter(f =>
      f.type.startsWith('image/'),
    )
    this.addFiles(imageFiles)
  }

  /**
   * Add files to batch
   */
  addFiles(files: File[]): void {
    files.forEach((file) => {
      const id = this.processor.addItem(file)
      this.addItemToGrid(id, file)
    })

    this.updateInfo()
  }

  /**
   * Add item to grid
   */
  private addItemToGrid(id: string, file: File): void {
    const grid = this.element?.querySelector('#batch-items-grid')
    if (!grid)
      return

    const item = createElement('div', 'batch-item')
    item.dataset.id = id

    // Thumbnail
    if (this.options.showThumbnails) {
      const thumb = createElement('div', 'batch-item-thumbnail')
      const img = createElement('img') as HTMLImageElement
      img.src = URL.createObjectURL(file)
      img.onload = () => URL.revokeObjectURL(img.src)
      thumb.appendChild(img)
      item.appendChild(thumb)
    }

    // Info
    const info = createElement('div', 'batch-item-info')
    const name = createElement('div', 'batch-item-name')
    name.textContent = file.name
    name.title = file.name

    const size = createElement('div', 'batch-item-size')
    size.textContent = this.formatFileSize(file.size)

    const status = createElement('div', 'batch-item-status')
    status.textContent = 'Pending'

    info.appendChild(name)
    info.appendChild(size)
    info.appendChild(status)
    item.appendChild(info)

    // Progress
    const progress = createElement('div', 'batch-item-progress')
    const progressBar = createElement('div', 'batch-item-progress-bar')
    progressBar.style.width = '0%'
    progress.appendChild(progressBar)
    item.appendChild(progress)

    // Remove button
    if (this.options.allowRemove) {
      const removeBtn = createElement('button', 'batch-item-remove')
      removeBtn.innerHTML = '×'
      removeBtn.title = 'Remove'
      removeBtn.addEventListener('click', () => {
        this.removeItem(id)
      })
      item.appendChild(removeBtn)
    }

    grid.appendChild(item)
    this.itemElements.set(id, item)
  }

  /**
   * Remove item
   */
  private removeItem(id: string): void {
    this.processor.removeItem(id)

    const element = this.itemElements.get(id)
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
    }

    this.itemElements.delete(id)
    this.updateInfo()
  }

  /**
   * Update info
   */
  private updateInfo(): void {
    const info = this.element?.querySelector('#batch-info')
    if (!info)
      return

    const items = this.processor.getItems()
    info.textContent = `${items.length} image${items.length !== 1 ? 's' : ''} selected`
  }

  /**
   * Start processing
   */
  async start(): Promise<void> {
    const startBtn = this.element?.querySelector('#batch-start-btn') as HTMLButtonElement
    const cancelBtn = this.element?.querySelector('#batch-cancel-btn') as HTMLButtonElement

    if (startBtn)
      startBtn.style.display = 'none'
    if (cancelBtn)
      cancelBtn.style.display = ''

    await this.processor.start()

    if (startBtn)
      startBtn.style.display = ''
    if (cancelBtn)
      cancelBtn.style.display = 'none'
  }

  /**
   * Cancel processing
   */
  cancel(): void {
    this.processor.cancel()

    const startBtn = this.element?.querySelector('#batch-start-btn') as HTMLButtonElement
    const cancelBtn = this.element?.querySelector('#batch-cancel-btn') as HTMLButtonElement

    if (startBtn)
      startBtn.style.display = ''
    if (cancelBtn)
      cancelBtn.style.display = 'none'
  }

  /**
   * Export results
   */
  export(): void {
    this.processor.exportResults()
  }

  /**
   * Clear all
   */
  clear(): void {
    this.processor.clear()

    const grid = this.element?.querySelector('#batch-items-grid')
    if (grid) {
      grid.innerHTML = ''
    }

    this.itemElements.clear()
    this.updateInfo()
    this.updateProgress(0)

    const exportBtn = this.element?.querySelector('#batch-export-btn') as HTMLButtonElement
    if (exportBtn)
      exportBtn.style.display = 'none'
  }

  /**
   * Handle progress
   */
  private handleProgress(item: BatchItem, index: number, total: number): void {
    const element = this.itemElements.get(item.id)
    if (!element)
      return

    const status = element.querySelector('.batch-item-status')
    if (status) {
      status.textContent = item.status === 'processing' ? 'Processing...' : 'Pending'
    }

    const progressBar = element.querySelector('.batch-item-progress-bar') as HTMLElement
    if (progressBar) {
      progressBar.style.width = `${item.progress}%`
    }

    // Update overall progress
    const progress = this.processor.getProgress()
    this.updateProgress(progress.percentage)
  }

  /**
   * Handle item complete
   */
  private handleItemComplete(item: BatchItem, index: number): void {
    const element = this.itemElements.get(item.id)
    if (!element)
      return

    const status = element.querySelector('.batch-item-status')
    if (status) {
      status.textContent = 'Completed'
      element.classList.add('batch-item-completed')
    }

    const progressBar = element.querySelector('.batch-item-progress-bar') as HTMLElement
    if (progressBar) {
      progressBar.style.width = '100%'
    }
  }

  /**
   * Handle complete
   */
  private handleComplete(items: BatchItem[]): void {
    const exportBtn = this.element?.querySelector('#batch-export-btn') as HTMLButtonElement
    if (exportBtn)
      exportBtn.style.display = ''

    // Dispatch event
    const event = new CustomEvent('batch:complete', {
      detail: { items },
      bubbles: true,
    })
    this.container.dispatchEvent(event)
  }

  /**
   * Handle error
   */
  private handleError(item: BatchItem, error: Error): void {
    const element = this.itemElements.get(item.id)
    if (!element)
      return

    const status = element.querySelector('.batch-item-status')
    if (status) {
      status.textContent = 'Failed'
      element.classList.add('batch-item-failed')
    }

    console.error(`Batch item ${item.file.name} failed:`, error)
  }

  /**
   * Update progress
   */
  private updateProgress(percentage: number): void {
    const progressBar = this.element?.querySelector('#batch-progress-bar') as HTMLElement
    if (progressBar) {
      progressBar.style.width = `${percentage}%`
    }
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0)
      return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
  }

  /**
   * Get batch processor
   */
  getProcessor(): BatchProcessor {
    return this.processor
  }

  /**
   * Destroy batch manager
   */
  destroy(): void {
    this.processor.destroy()

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
      this.element = null
    }

    this.itemElements.clear()
  }
}
