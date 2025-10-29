/**
 * Accessibility Manager
 * Manages ARIA labels, announcements, and keyboard navigation
 */

export interface AccessibilityOptions {
  enabled?: boolean
  language?: string
  announceActions?: boolean
  announceValues?: boolean
  keyboardHelp?: boolean
  highContrast?: boolean
  reducedMotion?: boolean
  focusIndicator?: boolean
}

export interface AccessibilityStrings {
  [key: string]: string
  // Main controls
  cropperLabel: string
  cropBoxLabel: string
  imageLabel: string
  toolbarLabel: string

  // Actions
  moveAction: string
  resizeAction: string
  rotateAction: string
  zoomAction: string
  cropAction: string
  resetAction: string

  // States
  croppingState: string
  movingState: string
  resizingState: string
  rotatingState: string

  // Values
  cropAreaValue: string
  rotationValue: string
  zoomValue: string
  aspectRatioValue: string

  // Instructions
  keyboardInstructions: string
  dragInstructions: string
  touchInstructions: string

  // Announcements
  actionCompleted: string
  actionCancelled: string
  imageLoaded: string
  cropCompleted: string
}

const DEFAULT_STRINGS: AccessibilityStrings = {
  // Main controls
  cropperLabel: 'Image cropper',
  cropBoxLabel: 'Crop box',
  imageLabel: 'Image canvas',
  toolbarLabel: 'Cropper toolbar',

  // Actions
  moveAction: 'Move crop box',
  resizeAction: 'Resize crop box',
  rotateAction: 'Rotate image',
  zoomAction: 'Zoom image',
  cropAction: 'Crop image',
  resetAction: 'Reset changes',

  // States
  croppingState: 'Cropping mode active',
  movingState: 'Moving crop box',
  resizingState: 'Resizing crop box',
  rotatingState: 'Rotating image',

  // Values
  cropAreaValue: 'Crop area: {width} by {height} pixels',
  rotationValue: 'Rotation: {angle} degrees',
  zoomValue: 'Zoom: {zoom} percent',
  aspectRatioValue: 'Aspect ratio: {ratio}',

  // Instructions
  keyboardInstructions: 'Use arrow keys to move, plus/minus to zoom, R to rotate. Press Shift+? for all shortcuts.',
  dragInstructions: 'Click and drag to adjust crop area',
  touchInstructions: 'Touch and drag to adjust, pinch to zoom',

  // Announcements
  actionCompleted: '{action} completed',
  actionCancelled: '{action} cancelled',
  imageLoaded: 'Image loaded successfully',
  cropCompleted: 'Image cropped successfully',
}

const CHINESE_STRINGS: AccessibilityStrings = {
  // Main controls
  cropperLabel: '图片裁剪器',
  cropBoxLabel: '裁剪框',
  imageLabel: '图片画布',
  toolbarLabel: '裁剪工具栏',

  // Actions
  moveAction: '移动裁剪框',
  resizeAction: '调整裁剪框大小',
  rotateAction: '旋转图片',
  zoomAction: '缩放图片',
  cropAction: '裁剪图片',
  resetAction: '重置更改',

  // States
  croppingState: '裁剪模式已激活',
  movingState: '正在移动裁剪框',
  resizingState: '正在调整裁剪框大小',
  rotatingState: '正在旋转图片',

  // Values
  cropAreaValue: '裁剪区域：{width} × {height} 像素',
  rotationValue: '旋转角度：{angle} 度',
  zoomValue: '缩放比例：{zoom}%',
  aspectRatioValue: '宽高比：{ratio}',

  // Instructions
  keyboardInstructions: '使用方向键移动，加减号缩放，R键旋转。按Shift+?查看所有快捷键。',
  dragInstructions: '点击并拖动调整裁剪区域',
  touchInstructions: '触摸并拖动调整，双指缩放',

  // Announcements
  actionCompleted: '{action}已完成',
  actionCancelled: '{action}已取消',
  imageLoaded: '图片加载成功',
  cropCompleted: '图片裁剪成功',
}

export class AccessibilityManager {
  private container: HTMLElement
  private options: Required<AccessibilityOptions>
  private strings: AccessibilityStrings
  private liveRegion: HTMLElement | null = null
  private helpDialog: HTMLElement | null = null
  private focusableElements: HTMLElement[] = []
  private currentFocusIndex = 0

  constructor(container: HTMLElement, options: AccessibilityOptions = {}) {
    this.container = container
    this.options = {
      enabled: options.enabled ?? true,
      language: options.language ?? 'en',
      announceActions: options.announceActions ?? true,
      announceValues: options.announceValues ?? true,
      keyboardHelp: options.keyboardHelp ?? true,
      highContrast: options.highContrast ?? false,
      reducedMotion: options.reducedMotion ?? false,
      focusIndicator: options.focusIndicator ?? true,
    }

    // Select language strings
    this.strings = this.options.language === 'zh' ? CHINESE_STRINGS : DEFAULT_STRINGS

    if (this.options.enabled) {
      this.init()
    }
  }

  /**
   * Initialize accessibility features
   */
  private init(): void {
    // Create live region for announcements
    this.createLiveRegion()

    // Set up ARIA attributes
    this.setupARIA()

    // Set up keyboard navigation
    this.setupKeyboardNavigation()

    // Apply visual preferences
    this.applyVisualPreferences()

    // Check system preferences
    this.checkSystemPreferences()
  }

  /**
   * Create live region for screen reader announcements
   */
  private createLiveRegion(): void {
    this.liveRegion = document.createElement('div')
    this.liveRegion.setAttribute('aria-live', 'polite')
    this.liveRegion.setAttribute('aria-atomic', 'true')
    this.liveRegion.className = 'cropper-live-region'
    this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `

    document.body.appendChild(this.liveRegion)
  }

  /**
   * Set up ARIA attributes
   */
  private setupARIA(): void {
    // Main container
    this.container.setAttribute('role', 'application')
    this.container.setAttribute('aria-label', this.strings.cropperLabel)
    this.container.setAttribute('tabindex', '0')

    // Add keyboard instructions
    this.container.setAttribute('aria-describedby', 'cropper-instructions')

    // Create instructions element
    const instructions = document.createElement('div')
    instructions.id = 'cropper-instructions'
    instructions.className = 'sr-only'
    instructions.textContent = this.strings.keyboardInstructions
    this.container.appendChild(instructions)
  }

  /**
   * Set up keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    // Collect focusable elements
    this.updateFocusableElements()

    // Add keyboard event listeners
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this))

    // Add focus trap
    this.container.addEventListener('focusin', this.handleFocusIn.bind(this))
    this.container.addEventListener('focusout', this.handleFocusOut.bind(this))
  }

  /**
   * Update list of focusable elements
   */
  updateFocusableElements(): void {
    this.focusableElements = Array.from(
      this.container.querySelectorAll(
        'button:not([disabled]), [role="button"]:not([aria-disabled="true"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ) as HTMLElement[]
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Tab navigation
    if (event.key === 'Tab') {
      this.handleTabNavigation(event)
    }

    // Help dialog
    if (event.key === '?' && event.shiftKey) {
      this.toggleHelpDialog()
      event.preventDefault()
    }

    // Escape to close help
    if (event.key === 'Escape' && this.helpDialog) {
      this.closeHelpDialog()
      event.preventDefault()
    }
  }

  /**
   * Handle tab navigation
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    if (this.focusableElements.length === 0)
      return

    const currentElement = document.activeElement as HTMLElement
    const currentIndex = this.focusableElements.indexOf(currentElement)

    if (currentIndex === -1) {
      // Focus first element
      this.focusableElements[0].focus()
      event.preventDefault()
      return
    }

    if (event.shiftKey) {
      // Move backwards
      const nextIndex = currentIndex === 0
        ? this.focusableElements.length - 1
        : currentIndex - 1
      this.focusableElements[nextIndex].focus()
    }
    else {
      // Move forwards
      const nextIndex = (currentIndex + 1) % this.focusableElements.length
      this.focusableElements[nextIndex].focus()
    }

    event.preventDefault()
  }

  /**
   * Handle focus in
   */
  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement

    // Add focus indicator
    if (this.options.focusIndicator) {
      target.classList.add('cropper-focus')
    }

    // Announce element
    const label = target.getAttribute('aria-label') || target.textContent || ''
    if (label) {
      this.announce(label)
    }
  }

  /**
   * Handle focus out
   */
  private handleFocusOut(event: FocusEvent): void {
    const target = event.target as HTMLElement

    // Remove focus indicator
    target.classList.remove('cropper-focus')
  }

  /**
   * Apply visual preferences
   */
  private applyVisualPreferences(): void {
    // High contrast mode
    if (this.options.highContrast) {
      this.container.classList.add('cropper-high-contrast')
    }

    // Reduced motion
    if (this.options.reducedMotion) {
      this.container.classList.add('cropper-reduced-motion')
    }

    // Focus indicator
    if (this.options.focusIndicator) {
      this.addFocusStyles()
    }
  }

  /**
   * Check system preferences
   */
  private checkSystemPreferences(): void {
    // Check for prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.options.reducedMotion = true
      this.container.classList.add('cropper-reduced-motion')
    }

    // Check for prefers-contrast
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.options.highContrast = true
      this.container.classList.add('cropper-high-contrast')
    }

    // Check for prefers-color-scheme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.container.classList.add('cropper-dark-mode')
    }
  }

  /**
   * Add focus styles
   */
  private addFocusStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      .cropper-focus {
        outline: 3px solid #005fcc !important;
        outline-offset: 2px !important;
      }
      
      .cropper-high-contrast .cropper-focus {
        outline: 4px solid #000 !important;
        outline-offset: 4px !important;
      }
      
      .cropper-reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `

    document.head.appendChild(style)
  }

  /**
   * Toggle help dialog
   */
  private toggleHelpDialog(): void {
    if (this.helpDialog) {
      this.closeHelpDialog()
    }
    else {
      this.openHelpDialog()
    }
  }

  /**
   * Open help dialog
   */
  private openHelpDialog(): void {
    this.helpDialog = document.createElement('div')
    this.helpDialog.className = 'cropper-help-dialog'
    this.helpDialog.setAttribute('role', 'dialog')
    this.helpDialog.setAttribute('aria-label', 'Keyboard shortcuts')

    const shortcuts = [
      { key: '↑↓←→', action: this.strings.moveAction },
      { key: '+/-', action: this.strings.zoomAction },
      { key: 'R', action: this.strings.rotateAction },
      { key: 'Enter', action: this.strings.cropAction },
      { key: 'Escape', action: this.strings.resetAction },
      { key: 'Ctrl+Z', action: 'Undo' },
      { key: 'Ctrl+Y', action: 'Redo' },
      { key: 'Tab', action: 'Navigate controls' },
    ]

    const content = `
      <div class="cropper-help-content">
        <h2>Keyboard Shortcuts</h2>
        <button class="cropper-help-close" aria-label="Close help">×</button>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${shortcuts.map(s => `
              <tr>
                <td><kbd>${s.key}</kbd></td>
                <td>${s.action}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `

    this.helpDialog.innerHTML = content

    // Style
    this.helpDialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid #000;
      border-radius: 8px;
      padding: 20px;
      z-index: 10000;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `

    document.body.appendChild(this.helpDialog)

    // Focus close button
    const closeBtn = this.helpDialog.querySelector('.cropper-help-close') as HTMLButtonElement
    closeBtn?.addEventListener('click', () => this.closeHelpDialog())
    closeBtn?.focus()

    // Announce
    this.announce('Help dialog opened. Press Escape to close.')
  }

  /**
   * Close help dialog
   */
  private closeHelpDialog(): void {
    if (this.helpDialog) {
      this.helpDialog.remove()
      this.helpDialog = null
      this.container.focus()
      this.announce('Help dialog closed')
    }
  }

  /**
   * Announce message to screen reader
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion || !this.options.announceActions)
      return

    // Set priority
    this.liveRegion.setAttribute('aria-live', priority)

    // Clear and set message
    this.liveRegion.textContent = ''

    // Use timeout to ensure announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message
      }
    }, 100)
  }

  /**
   * Announce action
   */
  announceAction(action: string): void {
    const message = this.strings.actionCompleted.replace('{action}', action)
    this.announce(message)
  }

  /**
   * Announce value change
   */
  announceValue(type: string, value: any): void {
    if (!this.options.announceValues)
      return

    let message = ''

    switch (type) {
      case 'cropArea':
        message = this.strings.cropAreaValue
          .replace('{width}', Math.round(value.width))
          .replace('{height}', Math.round(value.height))
        break

      case 'rotation':
        message = this.strings.rotationValue.replace('{angle}', value)
        break

      case 'zoom':
        message = this.strings.zoomValue.replace('{zoom}', Math.round(value * 100))
        break

      case 'aspectRatio':
        message = this.strings.aspectRatioValue.replace('{ratio}', value)
        break
    }

    if (message) {
      this.announce(message, 'polite')
    }
  }

  /**
   * Set element label
   */
  setLabel(element: HTMLElement, label: string): void {
    element.setAttribute('aria-label', label)
  }

  /**
   * Set element description
   */
  setDescription(element: HTMLElement, description: string): void {
    const id = `desc-${Date.now()}`

    // Create description element
    const desc = document.createElement('div')
    desc.id = id
    desc.className = 'sr-only'
    desc.textContent = description
    this.container.appendChild(desc)

    // Link to element
    element.setAttribute('aria-describedby', id)
  }

  /**
   * Set element state
   */
  setState(element: HTMLElement, state: string, value: string | boolean): void {
    const attrName = `aria-${state}`
    element.setAttribute(attrName, String(value))
  }

  /**
   * Mark element as busy
   */
  setBusy(element: HTMLElement, busy: boolean): void {
    element.setAttribute('aria-busy', String(busy))

    if (busy) {
      this.announce('Processing, please wait...', 'polite')
    }
  }

  /**
   * Update strings for different language
   */
  setLanguage(language: string): void {
    this.options.language = language
    this.strings = language === 'zh' ? CHINESE_STRINGS : DEFAULT_STRINGS

    // Update existing ARIA labels
    this.setupARIA()
  }

  /**
   * Enable/disable accessibility features
   */
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled

    if (enabled) {
      this.init()
    }
    else {
      this.destroy()
    }
  }

  /**
   * Get current options
   */
  getOptions(): AccessibilityOptions {
    return { ...this.options }
  }

  /**
   * Destroy
   */
  destroy(): void {
    // Remove live region
    if (this.liveRegion) {
      this.liveRegion.remove()
      this.liveRegion = null
    }

    // Close help dialog
    if (this.helpDialog) {
      this.closeHelpDialog()
    }

    // Remove ARIA attributes
    this.container.removeAttribute('role')
    this.container.removeAttribute('aria-label')
    this.container.removeAttribute('aria-describedby')
    this.container.removeAttribute('tabindex')

    // Remove classes
    this.container.classList.remove(
      'cropper-high-contrast',
      'cropper-reduced-motion',
      'cropper-dark-mode',
    )
  }
}
