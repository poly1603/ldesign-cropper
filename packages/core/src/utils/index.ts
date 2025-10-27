/**
 * Utilities
 */

export * from './math'
export * from './dom'
export * from './image'
export * from './cache'
export * from './export'

// Export events (but not throttle/debounce/raf to avoid conflicts)
export { on, off, dispatch, preventDefault, stopPropagation, getPointer, getCenter, getTouchDistance } from './events'

// Export compatibility (but not raf to avoid conflicts)
export {
  supportsTouchEvents,
  supportsPointerEvents,
  isMobile,
  isTablet,
  isIOS,
  isAndroid,
  supportsPassiveEvents,
  getEventListenerOptions,
  supportsResizeObserver,
  supportsIntersectionObserver,
  supportsRequestAnimationFrame,
  caf,
  getDevicePixelRatio,
  supportsWebGL
} from './compatibility'

// Export performance utilities (preferred source for throttle, debounce, raf)
export * from './performance'
