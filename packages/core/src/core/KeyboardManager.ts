/**
 * Keyboard Manager
 * Handles keyboard shortcuts and bindings
 */

import type { Cropper } from './Cropper'
import { KEYBOARD, TRANSFORM } from '../config/constants'

export interface KeyBinding {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
}

export interface KeyboardManagerOptions {
  enabled?: boolean
  customBindings?: KeyBinding[]
  showHelp?: boolean
}

export class KeyboardManager {
  private cropper: Cropper
  private options: KeyboardManagerOptions
  private bindings: Map<string, KeyBinding> = new Map()
  private enabled: boolean
  private helpOverlay: HTMLElement | null = null

  constructor(cropper: Cropper, options: KeyboardManagerOptions = {}) {
    this.cropper = cropper
    this.options = {
      enabled: true,
      customBindings: [],
      showHelp: true,
      ...options
    }
    this.enabled = this.options.enabled ?? true

    this.registerDefaultBindings()

    if (this.options.customBindings) {
      this.options.customBindings.forEach((binding) => {
        this.registerBinding(binding)
      })
    }

    this.attachEventListeners()
  }

  /**
   * Register default keyboard bindings
   */
  private registerDefaultBindings(): void {
    // Navigation
    this.registerBinding({
      key: KEYBOARD.ARROW_UP,
      action: () => this.moveCropBox(0, -KEYBOARD.MOVE_STEP),
      description: 'Move crop box up'
    })

    this.registerBinding({
      key: KEYBOARD.ARROW_DOWN,
      action: () => this.moveCropBox(0, KEYBOARD.MOVE_STEP),
      description: 'Move crop box down'
    })

    this.registerBinding({
      key: KEYBOARD.ARROW_LEFT,
      action: () => this.moveCropBox(-KEYBOARD.MOVE_STEP, 0),
      description: 'Move crop box left'
    })

    this.registerBinding({
      key: KEYBOARD.ARROW_RIGHT,
      action: () => this.moveCropBox(KEYBOARD.MOVE_STEP, 0),
      description: 'Move crop box right'
    })

    // Navigation with Shift (larger steps)
    this.registerBinding({
      key: KEYBOARD.ARROW_UP,
      shiftKey: true,
      action: () => this.moveCropBox(0, -KEYBOARD.MOVE_STEP_LARGE),
      description: 'Move crop box up (large)'
    })

    this.registerBinding({
      key: KEYBOARD.ARROW_DOWN,
      shiftKey: true,
      action: () => this.moveCropBox(0, KEYBOARD.MOVE_STEP_LARGE),
      description: 'Move crop box down (large)'
    })

    this.registerBinding({
      key: KEYBOARD.ARROW_LEFT,
      shiftKey: true,
      action: () => this.moveCropBox(-KEYBOARD.MOVE_STEP_LARGE, 0),
      description: 'Move crop box left (large)'
    })

    this.registerBinding({
      key: KEYBOARD.ARROW_RIGHT,
      shiftKey: true,
      action: () => this.moveCropBox(KEYBOARD.MOVE_STEP_LARGE, 0),
      description: 'Move crop box right (large)'
    })

    // Zoom
    this.registerBinding({
      key: KEYBOARD.PLUS,
      action: () => this.zoom(TRANSFORM.DEFAULT_SCALE_STEP),
      description: 'Zoom in'
    })

    this.registerBinding({
      key: KEYBOARD.EQUAL,
      action: () => this.zoom(TRANSFORM.DEFAULT_SCALE_STEP),
      description: 'Zoom in'
    })

    this.registerBinding({
      key: KEYBOARD.MINUS,
      action: () => this.zoom(-TRANSFORM.DEFAULT_SCALE_STEP),
      description: 'Zoom out'
    })

    this.registerBinding({
      key: KEYBOARD.ZERO,
      action: () => this.resetZoom(),
      description: 'Reset zoom to 100%'
    })

    // Rotation
    this.registerBinding({
      key: 'r',
      action: () => this.rotate(TRANSFORM.DEFAULT_ROTATION_STEP),
      description: 'Rotate right 90°'
    })

    this.registerBinding({
      key: 'r',
      shiftKey: true,
      action: () => this.rotate(-TRANSFORM.DEFAULT_ROTATION_STEP),
      description: 'Rotate left 90°'
    })

    // Flip
    this.registerBinding({
      key: 'h',
      action: () => this.flipHorizontal(),
      description: 'Flip horizontal'
    })

    this.registerBinding({
      key: 'v',
      action: () => this.flipVertical(),
      description: 'Flip vertical'
    })

    // Reset
    this.registerBinding({
      key: 'Escape',
      action: () => this.reset(),
      description: 'Reset to original'
    })

    // Undo/Redo
    this.registerBinding({
      key: 'z',
      ctrlKey: true,
      action: () => this.undo(),
      description: 'Undo'
    })

    this.registerBinding({
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      action: () => this.redo(),
      description: 'Redo'
    })

    this.registerBinding({
      key: 'y',
      ctrlKey: true,
      action: () => this.redo(),
      description: 'Redo'
    })

    // Save/Export
    this.registerBinding({
      key: 's',
      ctrlKey: true,
      action: () => this.save(),
      description: 'Save/Export'
    })

    // Copy
    this.registerBinding({
      key: 'c',
      ctrlKey: true,
      action: () => this.copy(),
      description: 'Copy to clipboard'
    })

    // Help
    if (this.options.showHelp) {
      this.registerBinding({
        key: '?',
        shiftKey: true,
        action: () => this.toggleHelp(),
        description: 'Show keyboard shortcuts'
      })
    }

    // Delete/Clear
    this.registerBinding({
      key: KEYBOARD.DELETE,
      action: () => this.clear(),
      description: 'Clear crop box'
    })

    this.registerBinding({
      key: KEYBOARD.BACKSPACE,
      action: () => this.clear(),
      description: 'Clear crop box'
    })

    // Aspect ratio presets
    this.registerBinding({
      key: '1',
      action: () => this.setAspectRatio(1),
      description: 'Set aspect ratio 1:1'
    })

    this.registerBinding({
      key: '2',
      action: () => this.setAspectRatio(16 / 9),
      description: 'Set aspect ratio 16:9'
    })

    this.registerBinding({
      key: '3',
      action: () => this.setAspectRatio(4 / 3),
      description: 'Set aspect ratio 4:3'
    })

    this.registerBinding({
      key: '4',
      action: () => this.setAspectRatio(NaN),
      description: 'Free aspect ratio'
    })
  }

  /**
   * Register a key binding
   */
  registerBinding(binding: KeyBinding): void {
    const key = this.generateBindingKey(binding)
    this.bindings.set(key, binding)
  }

  /**
   * Unregister a key binding
   */
  unregisterBinding(binding: Partial<KeyBinding>): boolean {
    const key = this.generateBindingKey(binding as KeyBinding)
    return this.bindings.delete(key)
  }

  /**
   * Generate binding key
   */
  private generateBindingKey(binding: KeyBinding): string {
    const parts: string[] = []
    if (binding.ctrlKey) parts.push('Ctrl')
    if (binding.shiftKey) parts.push('Shift')
    if (binding.altKey) parts.push('Alt')
    if (binding.metaKey) parts.push('Meta')
    parts.push(binding.key)
    return parts.join('+')
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  /**
   * Detach event listeners
   */
  private detachEventListeners(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
  }

  /**
   * Handle key down event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return

    // Don't trigger if typing in input fields
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const key = this.generateBindingKey({
      key: event.key,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      action: () => { },
      description: ''
    })

    const binding = this.bindings.get(key)
    if (binding) {
      event.preventDefault()
      binding.action()
    }
  }

  // Action methods

  private moveCropBox(deltaX: number, deltaY: number): void {
    const cropBoxData = this.cropper.getCropBoxData()
    if (cropBoxData) {
      this.cropper.setCropBoxData({
        left: cropBoxData.left + deltaX,
        top: cropBoxData.top + deltaY
      })
    }
  }

  private zoom(delta: number): void {
    const imageData = this.cropper.getImageData()
    if (imageData) {
      this.cropper.scale(imageData.scaleX + delta, imageData.scaleY + delta)
    }
  }

  private resetZoom(): void {
    this.cropper.scale(1, 1)
  }

  private rotate(degrees: number): void {
    this.cropper.rotate(degrees)
  }

  private flipHorizontal(): void {
    const imageData = this.cropper.getImageData()
    if (imageData) {
      this.cropper.scaleX(-imageData.scaleX)
    }
  }

  private flipVertical(): void {
    const imageData = this.cropper.getImageData()
    if (imageData) {
      this.cropper.scaleY(-imageData.scaleY)
    }
  }

  private reset(): void {
    this.cropper.reset()
  }

  private undo(): void {
    const historyManager = this.cropper.getHistoryManager()
    historyManager?.undo()
  }

  private redo(): void {
    const historyManager = this.cropper.getHistoryManager()
    historyManager?.redo()
  }

  private save(): void {
    const canvas = this.cropper.getCroppedCanvas()
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `cropped-${Date.now()}.png`
          a.click()
          URL.revokeObjectURL(url)
        }
      })
    }
  }

  private async copy(): Promise<void> {
    const canvas = this.cropper.getCroppedCanvas()
    if (canvas && 'clipboard' in navigator) {
      try {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const item = new ClipboardItem({ 'image/png': blob })
            await navigator.clipboard.write([item])
          }
        })
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  private clear(): void {
    this.cropper.clear()
  }

  private setAspectRatio(ratio: number): void {
    this.cropper.setAspectRatio(ratio)
  }

  /**
   * Toggle help overlay
   */
  private toggleHelp(): void {
    if (this.helpOverlay && this.helpOverlay.parentNode) {
      this.helpOverlay.parentNode.removeChild(this.helpOverlay)
      this.helpOverlay = null
    } else {
      this.showHelp()
    }
  }

  /**
   * Show help overlay
   */
  private showHelp(): void {
    const overlay = document.createElement('div')
    overlay.className = 'cropper-keyboard-help-overlay'

    const panel = document.createElement('div')
    panel.className = 'cropper-keyboard-help-panel'

    const header = document.createElement('div')
    header.className = 'cropper-keyboard-help-header'

    const title = document.createElement('h2')
    title.textContent = 'Keyboard Shortcuts'

    const closeBtn = document.createElement('button')
    closeBtn.className = 'cropper-keyboard-help-close'
    closeBtn.textContent = '×'
    closeBtn.addEventListener('click', () => this.toggleHelp())

    header.appendChild(title)
    header.appendChild(closeBtn)

    const content = document.createElement('div')
    content.className = 'cropper-keyboard-help-content'

    // Group bindings by category
    const categories: Record<string, KeyBinding[]> = {}

    this.bindings.forEach((binding) => {
      const category = this.categorizeBinding(binding)
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(binding)
    })

    // Render categories
    Object.entries(categories).forEach(([category, bindings]) => {
      const section = document.createElement('div')
      section.className = 'cropper-keyboard-help-section'

      const sectionTitle = document.createElement('h3')
      sectionTitle.textContent = category

      const list = document.createElement('dl')
      list.className = 'cropper-keyboard-help-list'

      bindings.forEach((binding) => {
        const dt = document.createElement('dt')
        dt.textContent = this.formatKeyCombo(binding)

        const dd = document.createElement('dd')
        dd.textContent = binding.description

        list.appendChild(dt)
        list.appendChild(dd)
      })

      section.appendChild(sectionTitle)
      section.appendChild(list)
      content.appendChild(section)
    })

    panel.appendChild(header)
    panel.appendChild(content)
    overlay.appendChild(panel)

    document.body.appendChild(overlay)
    this.helpOverlay = overlay

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.toggleHelp()
      }
    })
  }

  /**
   * Categorize binding
   */
  private categorizeBinding(binding: KeyBinding): string {
    const key = binding.key.toLowerCase()

    if (key.startsWith('arrow')) return 'Navigation'
    if (['+', '=', '-', '0'].includes(key)) return 'Zoom'
    if (key === 'r') return 'Rotation'
    if (['h', 'v'].includes(key)) return 'Flip'
    if (key === 'z' || key === 'y') return 'History'
    if (key === 's' || key === 'c') return 'Export'
    if (['1', '2', '3', '4'].includes(key)) return 'Aspect Ratio'
    if (key === 'escape' || key === 'delete' || key === 'backspace')
      return 'Actions'
    if (key === '?') return 'Help'

    return 'Other'
  }

  /**
   * Format key combination for display
   */
  private formatKeyCombo(binding: KeyBinding): string {
    const parts: string[] = []
    if (binding.ctrlKey) parts.push('Ctrl')
    if (binding.shiftKey) parts.push('Shift')
    if (binding.altKey) parts.push('Alt')
    if (binding.metaKey) parts.push('⌘')

    // Format key name
    let keyName = binding.key
    if (keyName.startsWith('Arrow')) {
      keyName = keyName.replace('Arrow', '→ ')
    }
    parts.push(keyName)

    return parts.join(' + ')
  }

  /**
   * Enable keyboard manager
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * Disable keyboard manager
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * Get all bindings
   */
  getBindings(): KeyBinding[] {
    return Array.from(this.bindings.values())
  }

  /**
   * Destroy keyboard manager
   */
  destroy(): void {
    this.detachEventListeners()
    this.bindings.clear()

    if (this.helpOverlay && this.helpOverlay.parentNode) {
      this.helpOverlay.parentNode.removeChild(this.helpOverlay)
      this.helpOverlay = null
    }
  }
}

