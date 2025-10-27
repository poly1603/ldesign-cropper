/**
 * Touch Gesture Manager
 * Handles multi-touch gestures for mobile devices
 */

import { dispatch } from '../utils/events'
import { clamp, distance, midpoint } from '../utils/math'
import { throttle } from '../utils/performance'

export interface TouchGestureOptions {
  enabled?: boolean
  pinchZoom?: boolean
  doubleTapZoom?: boolean
  swipeGestures?: boolean
  rotationGestures?: boolean
  momentum?: boolean
  elasticBounds?: boolean
  tapThreshold?: number
  swipeThreshold?: number
  doubleTapDelay?: number
  momentumFriction?: number
}

export interface TouchPoint {
  id: number
  x: number
  y: number
  startX: number
  startY: number
  timestamp: number
}

export interface GestureState {
  type: 'none' | 'pan' | 'pinch' | 'rotate' | 'swipe'
  startDistance?: number
  startAngle?: number
  startScale?: number
  lastScale?: number
  velocity?: { x: number; y: number }
}

const DEFAULTS: Required<TouchGestureOptions> = {
  enabled: true,
  pinchZoom: true,
  doubleTapZoom: true,
  swipeGestures: true,
  rotationGestures: true,
  momentum: true,
  elasticBounds: true,
  tapThreshold: 10,
  swipeThreshold: 50,
  doubleTapDelay: 300,
  momentumFriction: 0.95
}

export class TouchGestureManager {
  private element: HTMLElement
  private options: Required<TouchGestureOptions>
  private touches: Map<number, TouchPoint> = new Map()
  private gestureState: GestureState = { type: 'none' }
  private lastTapTime = 0
  private lastTapPosition: { x: number; y: number } | null = null
  private momentumAnimationId: number | null = null
  private velocity = { x: 0, y: 0 }
  private lastMoveTime = 0

  // Callbacks
  private onPan?: (deltaX: number, deltaY: number) => void
  private onZoom?: (scale: number, centerX: number, centerY: number) => void
  private onRotate?: (angle: number, centerX: number, centerY: number) => void
  private onTap?: (x: number, y: number) => void
  private onDoubleTap?: (x: number, y: number) => void
  private onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void

  constructor(element: HTMLElement, options: TouchGestureOptions = {}) {
    this.element = element
    this.options = { ...DEFAULTS, ...options }

    if (this.options.enabled) {
      this.init()
    }
  }

  /**
   * Initialize touch event listeners
   */
  private init(): void {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false })

    // Prevent default gestures
    this.element.style.touchAction = 'none'
    this.element.style.userSelect = 'none'
    this.element.style.webkitUserSelect = 'none'

    // Add touch-friendly class
    this.element.classList.add('touch-enabled')
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault()

    // Update touches
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      this.touches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
        timestamp: Date.now()
      })
    }

    // Stop momentum
    if (this.momentumAnimationId) {
      cancelAnimationFrame(this.momentumAnimationId)
      this.momentumAnimationId = null
    }

    // Detect gesture type
    this.detectGestureType()

    // Check for tap
    if (this.touches.size === 1) {
      const touch = Array.from(this.touches.values())[0]
      this.checkForTap(touch)
    }

    // Dispatch event
    dispatch(this.element, 'touchgesturestart', {
      touches: Array.from(this.touches.values()),
      gestureType: this.gestureState.type
    })
  }

  /**
   * Handle touch move
   */
  private handleTouchMove = throttle((event: TouchEvent) => {
    event.preventDefault()

    // Update touch positions
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      const savedTouch = this.touches.get(touch.identifier)

      if (savedTouch) {
        savedTouch.x = touch.clientX
        savedTouch.y = touch.clientY
      }
    }

    const touchArray = Array.from(this.touches.values())

    // Handle different gestures
    switch (this.gestureState.type) {
      case 'pan':
        this.handlePan(touchArray)
        break

      case 'pinch':
        this.handlePinch(touchArray)
        break

      case 'rotate':
        this.handleRotation(touchArray)
        break
    }

    // Update velocity for momentum
    if (this.options.momentum && touchArray.length === 1) {
      const now = Date.now()
      const dt = now - this.lastMoveTime

      if (dt > 0) {
        const touch = touchArray[0]
        const rect = this.element.getBoundingClientRect()

        this.velocity = {
          x: (touch.x - rect.left - this.velocity.x * dt) / dt,
          y: (touch.y - rect.top - this.velocity.y * dt) / dt
        }
      }

      this.lastMoveTime = now
    }

    // Dispatch event
    dispatch(this.element, 'touchgesturemove', {
      touches: touchArray,
      gestureType: this.gestureState.type
    })
  }, 16) // ~60fps

  /**
   * Handle touch end
   */
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault()

    // Remove ended touches
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      this.touches.delete(touch.identifier)
    }

    // Check for swipe
    if (this.gestureState.type === 'pan' && event.changedTouches.length === 1) {
      const touch = event.changedTouches[0]
      const savedTouch = Array.from(this.touches.values()).find(t => t.id === touch.identifier)

      if (savedTouch) {
        this.checkForSwipe(savedTouch)
      }
    }

    // Start momentum animation if enabled
    if (this.options.momentum && this.touches.size === 0 &&
      (Math.abs(this.velocity.x) > 0.5 || Math.abs(this.velocity.y) > 0.5)) {
      this.startMomentum()
    }

    // Reset gesture state if no more touches
    if (this.touches.size === 0) {
      this.gestureState = { type: 'none' }
    } else {
      // Re-detect gesture type with remaining touches
      this.detectGestureType()
    }

    // Dispatch event
    dispatch(this.element, 'touchgestureend', {
      touches: Array.from(this.touches.values()),
      gestureType: this.gestureState.type
    })
  }

  /**
   * Handle touch cancel
   */
  private handleTouchCancel(event: TouchEvent): void {
    // Clear all touches
    this.touches.clear()
    this.gestureState = { type: 'none' }

    // Stop momentum
    if (this.momentumAnimationId) {
      cancelAnimationFrame(this.momentumAnimationId)
      this.momentumAnimationId = null
    }

    // Dispatch event
    dispatch(this.element, 'touchgesturecancel')
  }

  /**
   * Detect gesture type based on touch count and movement
   */
  private detectGestureType(): void {
    const touchCount = this.touches.size

    if (touchCount === 1) {
      this.gestureState = { type: 'pan' }
    } else if (touchCount === 2) {
      const touches = Array.from(this.touches.values())
      const dist = distance(
        touches[0].x, touches[0].y,
        touches[1].x, touches[1].y
      )

      const angle = Math.atan2(
        touches[1].y - touches[0].y,
        touches[1].x - touches[0].x
      )

      this.gestureState = {
        type: this.options.rotationGestures ? 'rotate' : 'pinch',
        startDistance: dist,
        startAngle: angle,
        startScale: 1,
        lastScale: 1
      }
    } else {
      this.gestureState = { type: 'none' }
    }
  }

  /**
   * Handle pan gesture
   */
  private handlePan(touches: TouchPoint[]): void {
    if (touches.length !== 1) return

    const touch = touches[0]
    const deltaX = touch.x - touch.startX
    const deltaY = touch.y - touch.startY

    if (this.onPan) {
      this.onPan(deltaX, deltaY)
    }
  }

  /**
   * Handle pinch gesture
   */
  private handlePinch(touches: TouchPoint[]): void {
    if (touches.length !== 2 || !this.options.pinchZoom) return

    const dist = distance(
      touches[0].x, touches[0].y,
      touches[1].x, touches[1].y
    )

    if (this.gestureState.startDistance) {
      const scale = dist / this.gestureState.startDistance
      const center = midpoint(
        touches[0].x, touches[0].y,
        touches[1].x, touches[1].y
      )

      if (this.onZoom) {
        this.onZoom(scale, center.x, center.y)
      }

      this.gestureState.lastScale = scale
    }
  }

  /**
   * Handle rotation gesture
   */
  private handleRotation(touches: TouchPoint[]): void {
    if (touches.length !== 2 || !this.options.rotationGestures) return

    const angle = Math.atan2(
      touches[1].y - touches[0].y,
      touches[1].x - touches[0].x
    )

    if (this.gestureState.startAngle !== undefined) {
      const rotation = angle - this.gestureState.startAngle
      const center = midpoint(
        touches[0].x, touches[0].y,
        touches[1].x, touches[1].y
      )

      if (this.onRotate) {
        this.onRotate(rotation * 180 / Math.PI, center.x, center.y)
      }
    }
  }

  /**
   * Check for tap gesture
   */
  private checkForTap(touch: TouchPoint): void {
    const now = Date.now()
    const timeSinceLastTap = now - this.lastTapTime

    // Check for double tap
    if (this.options.doubleTapZoom &&
      timeSinceLastTap < this.options.doubleTapDelay &&
      this.lastTapPosition) {

      const dist = distance(
        touch.x, touch.y,
        this.lastTapPosition.x, this.lastTapPosition.y
      )

      if (dist < this.options.tapThreshold) {
        if (this.onDoubleTap) {
          this.onDoubleTap(touch.x, touch.y)
        }

        // Reset to prevent triple tap
        this.lastTapTime = 0
        this.lastTapPosition = null
        return
      }
    }

    // Record tap for potential double tap
    this.lastTapTime = now
    this.lastTapPosition = { x: touch.x, y: touch.y }

    // Delayed single tap (wait for potential double tap)
    setTimeout(() => {
      if (this.lastTapTime === now) {
        const movement = distance(
          touch.x, touch.y,
          touch.startX, touch.startY
        )

        if (movement < this.options.tapThreshold && this.onTap) {
          this.onTap(touch.x, touch.y)
        }
      }
    }, this.options.doubleTapDelay)
  }

  /**
   * Check for swipe gesture
   */
  private checkForSwipe(touch: TouchPoint): void {
    if (!this.options.swipeGestures) return

    const deltaX = touch.x - touch.startX
    const deltaY = touch.y - touch.startY
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (dist < this.options.swipeThreshold) return

    const duration = Date.now() - touch.timestamp
    const velocity = dist / duration

    // Require minimum velocity
    if (velocity < 0.3) return

    // Determine direction
    let direction: 'left' | 'right' | 'up' | 'down'

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }

    if (this.onSwipe) {
      this.onSwipe(direction)
    }
  }

  /**
   * Start momentum animation
   */
  private startMomentum(): void {
    const animate = () => {
      // Apply friction
      this.velocity.x *= this.options.momentumFriction
      this.velocity.y *= this.options.momentumFriction

      // Stop if velocity is too low
      if (Math.abs(this.velocity.x) < 0.1 && Math.abs(this.velocity.y) < 0.1) {
        this.momentumAnimationId = null
        return
      }

      // Apply velocity
      if (this.onPan) {
        this.onPan(this.velocity.x, this.velocity.y)
      }

      this.momentumAnimationId = requestAnimationFrame(animate)
    }

    animate()
  }

  /**
   * Set pan callback
   */
  setPanCallback(callback: (deltaX: number, deltaY: number) => void): void {
    this.onPan = callback
  }

  /**
   * Set zoom callback
   */
  setZoomCallback(callback: (scale: number, centerX: number, centerY: number) => void): void {
    this.onZoom = callback
  }

  /**
   * Set rotate callback
   */
  setRotateCallback(callback: (angle: number, centerX: number, centerY: number) => void): void {
    this.onRotate = callback
  }

  /**
   * Set tap callback
   */
  setTapCallback(callback: (x: number, y: number) => void): void {
    this.onTap = callback
  }

  /**
   * Set double tap callback
   */
  setDoubleTapCallback(callback: (x: number, y: number) => void): void {
    this.onDoubleTap = callback
  }

  /**
   * Set swipe callback
   */
  setSwipeCallback(callback: (direction: 'left' | 'right' | 'up' | 'down') => void): void {
    this.onSwipe = callback
  }

  /**
   * Enable/disable gestures
   */
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled

    if (enabled) {
      this.init()
    } else {
      this.destroy()
    }
  }

  /**
   * Update options
   */
  updateOptions(options: Partial<TouchGestureOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * Get current gesture state
   */
  getGestureState(): GestureState {
    return { ...this.gestureState }
  }

  /**
   * Get active touches
   */
  getActiveTouches(): TouchPoint[] {
    return Array.from(this.touches.values())
  }

  /**
   * Destroy
   */
  destroy(): void {
    // Remove event listeners
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this))

    // Reset styles
    this.element.style.touchAction = ''
    this.element.style.userSelect = ''
    this.element.style.webkitUserSelect = ''

    // Remove class
    this.element.classList.remove('touch-enabled')

    // Stop momentum
    if (this.momentumAnimationId) {
      cancelAnimationFrame(this.momentumAnimationId)
      this.momentumAnimationId = null
    }

    // Clear state
    this.touches.clear()
    this.gestureState = { type: 'none' }
  }
}


