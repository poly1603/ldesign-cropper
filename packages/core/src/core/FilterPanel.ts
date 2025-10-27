/**
 * Filter Panel
 * UI component for filter selection and control
 */

import type { Cropper } from './Cropper'
import { FilterEngine, Filter } from '../filters/FilterEngine'
import { getAllBuiltInFilters } from '../filters/builtins'
import { getAllPresets, applyPreset, FilterPreset } from '../filters/presets'
import { createElement, setStyle } from '../utils/dom'
import { dispatch } from '../utils/events'
import { FILTERS, CSS_CLASSES } from '../config/constants'

export interface FilterPanelOptions {
  visible?: boolean
  position?: 'left' | 'right' | 'bottom'
  showPresets?: boolean
  showCustomFilters?: boolean
  enableComparison?: boolean
}

export class FilterPanel {
  private cropper: Cropper
  private filterEngine: FilterEngine
  private container: HTMLElement
  private element: HTMLDivElement | null = null
  private options: FilterPanelOptions
  private currentCanvas: HTMLCanvasElement | null = null
  private comparisonMode: boolean = false

  constructor(
    cropper: Cropper,
    container: HTMLElement,
    options: FilterPanelOptions = {}
  ) {
    this.cropper = cropper
    this.container = container
    this.options = {
      visible: true,
      position: 'right',
      showPresets: true,
      showCustomFilters: true,
      enableComparison: true,
      ...options
    }

    this.filterEngine = new FilterEngine()
    this.initializeFilters()

    if (this.options.visible) {
      this.render()
    }
  }

  /**
   * Initialize filter engine with built-in filters
   */
  private initializeFilters(): void {
    const filters = getAllBuiltInFilters()
    filters.forEach((filter) => {
      this.filterEngine.registerFilter(filter)
    })
  }

  /**
   * Render filter panel
   */
  render(): void {
    if (this.element) {
      this.destroy()
    }

    this.element = createElement('div', 'cropper-filter-panel')
    this.element.classList.add(`filter-panel-${this.options.position}`)

    // Create header
    const header = this.createHeader()
    this.element.appendChild(header)

    // Create tabs
    const tabs = this.createTabs()
    this.element.appendChild(tabs)

    // Create content area
    const content = createElement('div', 'filter-panel-content')
    content.id = 'filter-panel-content'
    this.element.appendChild(content)

    // Show presets by default
    this.showPresetsTab()

    // Append to container
    this.container.appendChild(this.element)
  }

  /**
   * Create header
   */
  private createHeader(): HTMLElement {
    const header = createElement('div', 'filter-panel-header')

    const title = createElement('h3', 'filter-panel-title')
    title.textContent = 'Filters'

    const closeBtn = createElement('button', 'filter-panel-close')
    closeBtn.innerHTML = '×'
    closeBtn.setAttribute('aria-label', 'Close filter panel')
    closeBtn.addEventListener('click', () => this.hide())

    header.appendChild(title)
    header.appendChild(closeBtn)

    return header
  }

  /**
   * Create tabs
   */
  private createTabs(): HTMLElement {
    const tabs = createElement('div', 'filter-panel-tabs')

    if (this.options.showPresets) {
      const presetsTab = createElement('button', 'filter-panel-tab')
      presetsTab.textContent = 'Presets'
      presetsTab.dataset.tab = 'presets'
      presetsTab.classList.add('active')
      presetsTab.addEventListener('click', () => this.showPresetsTab())
      tabs.appendChild(presetsTab)
    }

    if (this.options.showCustomFilters) {
      const customTab = createElement('button', 'filter-panel-tab')
      customTab.textContent = 'Custom'
      customTab.dataset.tab = 'custom'
      customTab.addEventListener('click', () => this.showCustomTab())
      tabs.appendChild(customTab)
    }

    return tabs
  }

  /**
   * Show presets tab
   */
  private showPresetsTab(): void {
    const content = this.element?.querySelector('#filter-panel-content')
    if (!content) return

    content.innerHTML = ''

    // Update active tab
    this.setActiveTab('presets')

    // Create preset grid
    const grid = createElement('div', 'filter-preset-grid')

    const presets = getAllPresets()
    presets.forEach((preset) => {
      const card = this.createPresetCard(preset)
      grid.appendChild(card)
    })

    content.appendChild(grid)

    // Add reset button
    const resetBtn = createElement('button', 'filter-panel-button')
    resetBtn.textContent = 'Reset All Filters'
    resetBtn.addEventListener('click', () => this.resetFilters())
    content.appendChild(resetBtn)
  }

  /**
   * Show custom tab
   */
  private showCustomTab(): void {
    const content = this.element?.querySelector('#filter-panel-content')
    if (!content) return

    content.innerHTML = ''

    // Update active tab
    this.setActiveTab('custom')

    // Create filter controls
    const filters = getAllBuiltInFilters()
    filters.forEach((filter) => {
      const control = this.createFilterControl(filter)
      content.appendChild(control)
    })

    // Add apply button
    const applyBtn = createElement('button', 'filter-panel-button')
    applyBtn.textContent = 'Apply Filters'
    applyBtn.addEventListener('click', () => this.applyCurrentFilters())
    content.appendChild(applyBtn)

    // Add reset button
    const resetBtn = createElement('button', 'filter-panel-button')
    resetBtn.textContent = 'Reset All'
    resetBtn.addEventListener('click', () => this.resetFilters())
    content.appendChild(resetBtn)
  }

  /**
   * Create preset card
   */
  private createPresetCard(preset: FilterPreset): HTMLElement {
    const card = createElement('div', 'filter-preset-card')

    const name = createElement('div', 'filter-preset-name')
    name.textContent = preset.name

    const desc = createElement('div', 'filter-preset-description')
    desc.textContent = preset.description

    const applyBtn = createElement('button', 'filter-preset-apply')
    applyBtn.textContent = 'Apply'
    applyBtn.addEventListener('click', () => this.applyPreset(preset))

    card.appendChild(name)
    card.appendChild(desc)
    card.appendChild(applyBtn)

    return card
  }

  /**
   * Create filter control
   */
  private createFilterControl(filter: Filter): HTMLElement {
    const control = createElement('div', 'filter-control')

    const label = createElement('label', 'filter-control-label')
    label.textContent = this.formatFilterName(filter.name)

    const slider = createElement('input', 'filter-control-slider') as HTMLInputElement
    slider.type = 'range'
    slider.min = String(FILTERS.MIN_INTENSITY)
    slider.max = String(FILTERS.MAX_INTENSITY)
    slider.value = '1'
    slider.step = '0.1'
    slider.dataset.filter = filter.name

    const value = createElement('span', 'filter-control-value')
    value.textContent = '1.0'

    slider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      value.textContent = parseFloat(target.value).toFixed(1)
      this.updateFilterPreview(filter.name, parseFloat(target.value))
    })

    control.appendChild(label)
    control.appendChild(slider)
    control.appendChild(value)

    return control
  }

  /**
   * Format filter name
   */
  private formatFilterName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  /**
   * Set active tab
   */
  private setActiveTab(tabName: string): void {
    const tabs = this.element?.querySelectorAll('.filter-panel-tab')
    tabs?.forEach((tab) => {
      if ((tab as HTMLElement).dataset.tab === tabName) {
        tab.classList.add('active')
      } else {
        tab.classList.remove('active')
      }
    })
  }

  /**
   * Apply preset
   */
  private applyPreset(preset: FilterPreset): void {
    const canvas = this.cropper.getCroppedCanvas()
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    this.filterEngine.setOriginalImageData(imageData)

    applyPreset(this.filterEngine, preset)
    const filtered = this.filterEngine.applyFilters()

    if (filtered) {
      ctx.putImageData(filtered, 0, 0)
      this.dispatchFilterEvent('preset', preset.name, canvas)
    }
  }

  /**
   * Update filter preview
   */
  private updateFilterPreview(filterName: string, intensity: number): void {
    // Real-time preview implementation
    // This would update the cropper display in real-time
    const canvas = this.cropper.getCroppedCanvas()
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    this.filterEngine.setOriginalImageData(imageData)

    // Clear and add new filter with intensity
    this.filterEngine.clearFilters()
    this.filterEngine.addFilterLayer(filterName, { intensity })

    const filtered = this.filterEngine.applyFilters()
    if (filtered) {
      ctx.putImageData(filtered, 0, 0)
    }
  }

  /**
   * Apply current filters
   */
  private applyCurrentFilters(): void {
    const canvas = this.cropper.getCroppedCanvas()
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    this.filterEngine.setOriginalImageData(imageData)

    // Collect all filter values from sliders
    const sliders = this.element?.querySelectorAll('.filter-control-slider')
    sliders?.forEach((slider) => {
      const input = slider as HTMLInputElement
      const filterName = input.dataset.filter
      const intensity = parseFloat(input.value)

      if (filterName && intensity !== 1) {
        this.filterEngine.addFilterLayer(filterName, { intensity })
      }
    })

    const filtered = this.filterEngine.applyFilters()
    if (filtered) {
      ctx.putImageData(filtered, 0, 0)
      this.dispatchFilterEvent('custom', 'multiple', canvas)
    }
  }

  /**
   * Reset filters
   */
  private resetFilters(): void {
    this.filterEngine.reset()

    // Reset all sliders
    const sliders = this.element?.querySelectorAll('.filter-control-slider')
    sliders?.forEach((slider) => {
      const input = slider as HTMLInputElement
      input.value = '1'
      const value = slider.parentElement?.querySelector('.filter-control-value')
      if (value) {
        value.textContent = '1.0'
      }
    })

    // Reload original image
    const canvas = this.cropper.getCroppedCanvas()
    if (canvas) {
      this.dispatchFilterEvent('reset', 'none', canvas)
    }
  }

  /**
   * Dispatch filter event
   */
  private dispatchFilterEvent(
    type: string,
    filterName: string,
    canvas: HTMLCanvasElement
  ): void {
    const event = new CustomEvent('filter:applied', {
      detail: { type, filterName, canvas },
      bubbles: true
    })
    this.container.dispatchEvent(event)
  }

  /**
   * Show panel
   */
  show(): void {
    if (!this.element) {
      this.render()
    } else {
      setStyle(this.element, { display: '' })
    }
  }

  /**
   * Hide panel
   */
  hide(): void {
    if (this.element) {
      setStyle(this.element, { display: 'none' })
    }
  }

  /**
   * Toggle panel visibility
   */
  toggle(): void {
    if (this.element && this.element.style.display === 'none') {
      this.show()
    } else {
      this.hide()
    }
  }

  /**
   * Get filter engine
   */
  getFilterEngine(): FilterEngine {
    return this.filterEngine
  }

  /**
   * Destroy panel
   */
  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
      this.element = null
    }

    this.filterEngine.destroy()
  }
}

