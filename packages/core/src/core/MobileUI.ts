/**
 * Mobile UI Manager
 * Provides optimized UI for mobile devices
 */

import { createElement, addClass, removeClass } from '../utils/dom'
import { dispatch } from '../utils/events'
import { CSS_CLASSES } from '../config/constants'

export interface MobileUIOptions {
  enabled?: boolean
  autoDetect?: boolean
  breakpoint?: number
  simplifiedControls?: boolean
  largeButtons?: boolean
  gestureHints?: boolean
  orientation?: 'auto' | 'portrait' | 'landscape'
  theme?: 'light' | 'dark' | 'auto'
}

export interface MobileControl {
  id: string
  icon: string
  label: string
  action: () => void
  active?: boolean
  disabled?: boolean
}

const DEFAULT_OPTIONS: Required<MobileUIOptions> = {
  enabled: true,
  autoDetect: true,
  breakpoint: 768,
  simplifiedControls: true,
  largeButtons: true,
  gestureHints: true,
  orientation: 'auto',
  theme: 'auto'
}

const MOBILE_CONTROLS: MobileControl[] = [
  {
    id: 'rotate',
    icon: '↻',
    label: '旋转',
    action: () => { }
  },
  {
    id: 'flip-h',
    icon: '↔',
    label: '水平翻转',
    action: () => { }
  },
  {
    id: 'flip-v',
    icon: '↕',
    label: '垂直翻转',
    action: () => { }
  },
  {
    id: 'aspect',
    icon: '▢',
    label: '比例',
    action: () => { }
  },
  {
    id: 'reset',
    icon: '↺',
    label: '重置',
    action: () => { }
  },
  {
    id: 'done',
    icon: '✓',
    label: '完成',
    action: () => { }
  }
]

export class MobileUI {
  private container: HTMLElement
  private options: Required<MobileUIOptions>
  private isMobile = false
  private controls: Map<string, MobileControl> = new Map()

  // UI Elements
  private mobileContainer: HTMLElement | null = null
  private toolbar: HTMLElement | null = null
  private gestureHint: HTMLElement | null = null
  private orientationOverlay: HTMLElement | null = null

  // State
  private currentOrientation: 'portrait' | 'landscape' = 'portrait'
  private gestureHintTimer: number | null = null

  constructor(container: HTMLElement, options: MobileUIOptions = {}) {
    this.container = container
    this.options = { ...DEFAULT_OPTIONS, ...options }

    // Initialize controls
    MOBILE_CONTROLS.forEach(control => {
      this.controls.set(control.id, { ...control })
    })

    if (this.options.enabled) {
      this.init()
    }
  }

  /**
   * Initialize mobile UI
   */
  private init(): void {
    // Auto-detect mobile
    if (this.options.autoDetect) {
      this.detectMobile()
      window.addEventListener('resize', this.detectMobile.bind(this))
    }

    // Listen for orientation changes
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this))

    // Apply theme
    this.applyTheme()

    // Create UI if mobile
    if (this.isMobile) {
      this.createMobileUI()
    }
  }

  /**
   * Detect if device is mobile
   */
  private detectMobile(): void {
    const wasMobile = this.isMobile

    // Check viewport width
    this.isMobile = window.innerWidth <= this.options.breakpoint

    // Also check touch capability
    if (!this.isMobile && 'ontouchstart' in window) {
      this.isMobile = true
    }

    // Also check user agent (fallback)
    if (!this.isMobile) {
      const ua = navigator.userAgent.toLowerCase()
      this.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
    }

    // Update UI if changed
    if (wasMobile !== this.isMobile) {
      if (this.isMobile) {
        this.createMobileUI()
      } else {
        this.destroyMobileUI()
      }
    }
  }

  /**
   * Create mobile UI
   */
  private createMobileUI(): void {
    // Add mobile class
    this.container.classList.add('cropper-mobile')

    // Create container
    this.mobileContainer = createElement('div', 'cropper-mobile-ui')

    // Create toolbar
    this.createToolbar()

    // Create gesture hints
    if (this.options.gestureHints) {
      this.createGestureHints()
    }

    // Create orientation overlay
    this.createOrientationOverlay()

    // Append to container
    this.container.appendChild(this.mobileContainer)

    // Apply styles
    this.applyMobileStyles()

    // Dispatch event
    dispatch(this.container, 'mobileui:created')
  }

  /**
   * Create mobile toolbar
   */
  private createToolbar(): void {
    this.toolbar = createElement('div', 'cropper-mobile-toolbar')

    // Create controls
    this.controls.forEach(control => {
      const button = this.createControl(control)
      this.toolbar!.appendChild(button)
    })

    // Add to container
    this.mobileContainer!.appendChild(this.toolbar)
  }

  /**
   * Create single control button
   */
  private createControl(control: MobileControl): HTMLElement {
    const button = createElement('button', 'cropper-mobile-button')
    button.id = `cropper-mobile-${control.id}`

    // Icon
    const icon = createElement('span', 'cropper-mobile-icon')
    icon.textContent = control.icon
    button.appendChild(icon)

    // Label (for accessibility)
    const label = createElement('span', 'cropper-mobile-label')
    label.textContent = control.label
    button.appendChild(label)

    // Attributes
    button.setAttribute('aria-label', control.label)
    button.setAttribute('role', 'button')

    if (control.disabled) {
      button.disabled = true
      button.setAttribute('aria-disabled', 'true')
    }

    if (control.active) {
      button.classList.add('active')
      button.setAttribute('aria-pressed', 'true')
    }

    // Event listener
    button.addEventListener('click', (e) => {
      e.preventDefault()
      this.handleControlClick(control)
    })

    // Touch feedback
    button.addEventListener('touchstart', () => {
      button.classList.add('touching')
    })

    button.addEventListener('touchend', () => {
      button.classList.remove('touching')
    })

    return button
  }

  /**
   * Handle control click
   */
  private handleControlClick(control: MobileControl): void {
    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }

    // Execute action
    control.action()

    // Dispatch event
    dispatch(this.container, 'mobileui:control', { controlId: control.id })
  }

  /**
   * Create gesture hints
   */
  private createGestureHints(): void {
    const hints = [
      { gesture: 'pinch', text: '双指缩放' },
      { gesture: 'rotate', text: '双指旋转' },
      { gesture: 'drag', text: '拖动调整' },
      { gesture: 'double-tap', text: '双击放大' }
    ]

    this.gestureHint = createElement('div', 'cropper-gesture-hints')

    hints.forEach(hint => {
      const hintEl = createElement('div', 'cropper-gesture-hint')
      hintEl.innerHTML = `
        <span class="gesture-icon gesture-${hint.gesture}"></span>
        <span class="gesture-text">${hint.text}</span>
      `
      this.gestureHint!.appendChild(hintEl)
    })

    this.mobileContainer!.appendChild(this.gestureHint)

    // Auto-hide after delay
    this.showGestureHints(5000)
  }

  /**
   * Show gesture hints temporarily
   */
  showGestureHints(duration: number = 3000): void {
    if (!this.gestureHint) return

    this.gestureHint.classList.add('visible')

    // Clear existing timer
    if (this.gestureHintTimer) {
      clearTimeout(this.gestureHintTimer)
    }

    // Hide after duration
    this.gestureHintTimer = window.setTimeout(() => {
      this.gestureHint!.classList.remove('visible')
      this.gestureHintTimer = null
    }, duration)
  }

  /**
   * Create orientation overlay
   */
  private createOrientationOverlay(): void {
    this.orientationOverlay = createElement('div', 'cropper-orientation-overlay')
    this.orientationOverlay.innerHTML = `
      <div class="orientation-message">
        <div class="orientation-icon">📱</div>
        <div class="orientation-text">请旋转设备以获得更好体验</div>
      </div>
    `

    this.mobileContainer!.appendChild(this.orientationOverlay)

    // Check initial orientation
    this.checkOrientation()
  }

  /**
   * Handle orientation change
   */
  private handleOrientationChange(): void {
    this.checkOrientation()

    // Dispatch event
    dispatch(this.container, 'mobileui:orientationchange', {
      orientation: this.currentOrientation
    })
  }

  /**
   * Check device orientation
   */
  private checkOrientation(): void {
    const isPortrait = window.innerHeight > window.innerWidth
    this.currentOrientation = isPortrait ? 'portrait' : 'landscape'

    // Show/hide overlay based on settings
    if (this.orientationOverlay) {
      if (this.options.orientation === 'landscape' && isPortrait) {
        this.orientationOverlay.classList.add('visible')
      } else if (this.options.orientation === 'portrait' && !isPortrait) {
        this.orientationOverlay.classList.add('visible')
      } else {
        this.orientationOverlay.classList.remove('visible')
      }
    }
  }

  /**
   * Apply theme
   */
  private applyTheme(): void {
    let theme = this.options.theme

    // Auto-detect theme
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme = prefersDark ? 'dark' : 'light'
    }

    // Apply theme class
    this.container.classList.remove('cropper-theme-light', 'cropper-theme-dark')
    this.container.classList.add(`cropper-theme-${theme}`)
  }

  /**
   * Apply mobile-specific styles
   */
  private applyMobileStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      .cropper-mobile {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }
      
      .cropper-mobile-ui {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
        pointer-events: none;
      }
      
      .cropper-mobile-toolbar {
        display: flex;
        justify-content: space-around;
        align-items: center;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        padding: 10px;
        pointer-events: auto;
      }
      
      .cropper-mobile-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        border: none;
        background: transparent;
        color: white;
        border-radius: 10px;
        transition: all 0.2s;
        cursor: pointer;
        pointer-events: auto;
      }
      
      .cropper-mobile-button:active,
      .cropper-mobile-button.touching {
        transform: scale(0.95);
        background: rgba(255, 255, 255, 0.1);
      }
      
      .cropper-mobile-button.active {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .cropper-mobile-button:disabled {
        opacity: 0.5;
      }
      
      .cropper-mobile-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }
      
      .cropper-mobile-label {
        font-size: 10px;
        opacity: 0.8;
      }
      
      .cropper-gesture-hints {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        padding: 20px;
        border-radius: 15px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
      }
      
      .cropper-gesture-hints.visible {
        opacity: 1;
      }
      
      .cropper-gesture-hint {
        display: flex;
        align-items: center;
        color: white;
        font-size: 14px;
      }
      
      .gesture-icon {
        width: 40px;
        height: 40px;
        margin-right: 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
      }
      
      .cropper-orientation-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
      }
      
      .cropper-orientation-overlay.visible {
        opacity: 1;
        pointer-events: auto;
      }
      
      .orientation-message {
        text-align: center;
        color: white;
      }
      
      .orientation-icon {
        font-size: 64px;
        margin-bottom: 20px;
        animation: rotate-phone 2s ease-in-out infinite;
      }
      
      .orientation-text {
        font-size: 18px;
      }
      
      @keyframes rotate-phone {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(90deg); }
      }
      
      /* Responsive adjustments */
      @media (max-width: 375px) {
        .cropper-mobile-button {
          width: 50px;
          height: 50px;
        }
        
        .cropper-mobile-icon {
          font-size: 20px;
        }
        
        .cropper-mobile-label {
          font-size: 9px;
        }
      }
      
      /* Dark theme */
      .cropper-theme-dark .cropper-mobile-toolbar {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .cropper-theme-dark .cropper-mobile-button {
        color: white;
      }
      
      /* Light theme */
      .cropper-theme-light .cropper-mobile-toolbar {
        background: rgba(255, 255, 255, 0.95);
      }
      
      .cropper-theme-light .cropper-mobile-button {
        color: #333;
      }
    `

    document.head.appendChild(style)
  }

  /**
   * Set control action
   */
  setControlAction(id: string, action: () => void): void {
    const control = this.controls.get(id)
    if (control) {
      control.action = action
    }
  }

  /**
   * Update control state
   */
  updateControl(id: string, state: Partial<MobileControl>): void {
    const control = this.controls.get(id)
    if (!control) return

    // Update control
    Object.assign(control, state)

    // Update UI
    const button = document.getElementById(`cropper-mobile-${id}`) as HTMLButtonElement
    if (!button) return

    if (state.disabled !== undefined) {
      button.disabled = state.disabled
      button.setAttribute('aria-disabled', String(state.disabled))
    }

    if (state.active !== undefined) {
      if (state.active) {
        button.classList.add('active')
        button.setAttribute('aria-pressed', 'true')
      } else {
        button.classList.remove('active')
        button.setAttribute('aria-pressed', 'false')
      }
    }

    if (state.label) {
      button.setAttribute('aria-label', state.label)
      const label = button.querySelector('.cropper-mobile-label')
      if (label) label.textContent = state.label
    }

    if (state.icon) {
      const icon = button.querySelector('.cropper-mobile-icon')
      if (icon) icon.textContent = state.icon
    }
  }

  /**
   * Destroy mobile UI
   */
  private destroyMobileUI(): void {
    // Remove mobile class
    this.container.classList.remove('cropper-mobile')

    // Remove UI
    if (this.mobileContainer) {
      this.mobileContainer.remove()
      this.mobileContainer = null
    }

    // Clear references
    this.toolbar = null
    this.gestureHint = null
    this.orientationOverlay = null

    // Clear timer
    if (this.gestureHintTimer) {
      clearTimeout(this.gestureHintTimer)
      this.gestureHintTimer = null
    }

    // Dispatch event
    dispatch(this.container, 'mobileui:destroyed')
  }

  /**
   * Check if mobile UI is active
   */
  isMobileActive(): boolean {
    return this.isMobile && this.mobileContainer !== null
  }

  /**
   * Get current orientation
   */
  getOrientation(): 'portrait' | 'landscape' {
    return this.currentOrientation
  }

  /**
   * Force enable/disable mobile UI
   */
  setMobileMode(enabled: boolean): void {
    this.isMobile = enabled

    if (enabled && !this.mobileContainer) {
      this.createMobileUI()
    } else if (!enabled && this.mobileContainer) {
      this.destroyMobileUI()
    }
  }

  /**
   * Destroy
   */
  destroy(): void {
    // Remove event listeners
    window.removeEventListener('resize', this.detectMobile.bind(this))
    window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this))

    // Destroy UI
    this.destroyMobileUI()
  }
}


