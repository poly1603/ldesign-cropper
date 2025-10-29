/**
 * Constants for the cropper library
 * Centralized configuration values and magic numbers
 */

// Performance constants
export const PERFORMANCE = {
  /** Target frame rate (fps) */
  TARGET_FPS: 60,
  /** Throttle delay for move events (ms) */
  MOVE_THROTTLE_MS: 16, // ~60fps
  /** Debounce delay for wheel events (ms) */
  WHEEL_DEBOUNCE_MS: 50,
  /** Debounce delay for resize events (ms) */
  RESIZE_DEBOUNCE_MS: 100,
  /** Maximum canvas pool size */
  MAX_CANVAS_POOL_SIZE: 10,
  /** Maximum history states to keep */
  MAX_HISTORY_SIZE: 50,
  /** Auto-save interval for history (ms) */
  HISTORY_SAVE_INTERVAL_MS: 1000,
} as const

// Memory constants
export const MEMORY = {
  /** Large image threshold (bytes) - 10MB */
  LARGE_IMAGE_THRESHOLD: 10 * 1024 * 1024,
  /** Very large image threshold (bytes) - 50MB */
  VERY_LARGE_IMAGE_THRESHOLD: 50 * 1024 * 1024,
  /** Memory pressure warning threshold (%) */
  MEMORY_WARNING_THRESHOLD: 50,
  /** Memory pressure critical threshold (%) */
  MEMORY_CRITICAL_THRESHOLD: 80,
  /** Maximum allowed memory usage (bytes) - 500MB */
  MAX_MEMORY_USAGE: 500 * 1024 * 1024,
} as const

// UI constants
export const UI = {
  /** Default modal opacity */
  DEFAULT_MODAL_OPACITY: 0.3,
  /** Default highlight opacity */
  DEFAULT_HIGHLIGHT_OPACITY: 0.03,
  /** Minimum container width (px) */
  MIN_CONTAINER_WIDTH: 200,
  /** Minimum container height (px) */
  MIN_CONTAINER_HEIGHT: 100,
  /** Default auto-crop area ratio */
  DEFAULT_AUTO_CROP_AREA: 0.8,
  /** Default initial crop box size ratio */
  DEFAULT_INITIAL_CROP_SIZE: 0.5,
  /** Minimum crop box size (px) */
  MIN_CROP_BOX_SIZE: 50,
  /** Maximum placeholder file size (MB) */
  MAX_PLACEHOLDER_FILE_SIZE: 10,
  /** Drag detection threshold (px) */
  DRAG_THRESHOLD: 1,
} as const

// Transform constants
export const TRANSFORM = {
  /** Default rotation step (degrees) */
  DEFAULT_ROTATION_STEP: 90,
  /** Default scale step */
  DEFAULT_SCALE_STEP: 0.1,
  /** Default zoom ratio */
  DEFAULT_ZOOM_RATIO: 0.1,
  /** Default skew step (degrees) */
  DEFAULT_SKEW_STEP: 5,
  /** Minimum scale value */
  MIN_SCALE: 0.1,
  /** Maximum scale value */
  MAX_SCALE: 10,
} as const

// Image constants
export const IMAGE = {
  /** Default image format */
  DEFAULT_FORMAT: 'image/png' as const,
  /** Default JPEG quality */
  DEFAULT_JPEG_QUALITY: 0.92,
  /** Default WebP quality */
  DEFAULT_WEBP_QUALITY: 0.92,
  /** Default PNG quality */
  DEFAULT_PNG_QUALITY: 1,
  /** Progressive rendering chunk size (px) */
  PROGRESSIVE_CHUNK_SIZE: 512,
  /** Image smoothing quality */
  IMAGE_SMOOTHING_QUALITY: 'high' as ImageSmoothingQuality,
} as const

// Preset constants
export const PRESETS = {
  /** Common aspect ratios */
  ASPECT_RATIOS: {
    FREE: Number.NaN,
    SQUARE: 1,
    LANDSCAPE_4_3: 4 / 3,
    LANDSCAPE_16_9: 16 / 9,
    LANDSCAPE_21_9: 21 / 9,
    PORTRAIT_3_4: 3 / 4,
    PORTRAIT_9_16: 9 / 16,
  },
  /** Common social media sizes */
  SOCIAL_MEDIA: {
    FACEBOOK_POST: { width: 1200, height: 630 },
    FACEBOOK_COVER: { width: 1640, height: 859 },
    INSTAGRAM_POST: { width: 1080, height: 1080 },
    INSTAGRAM_STORY: { width: 1080, height: 1920 },
    TWITTER_POST: { width: 1200, height: 675 },
    TWITTER_HEADER: { width: 1500, height: 500 },
    YOUTUBE_THUMBNAIL: { width: 1280, height: 720 },
    YOUTUBE_BANNER: { width: 2560, height: 1440 },
    LINKEDIN_POST: { width: 1200, height: 1200 },
    LINKEDIN_COVER: { width: 1584, height: 396 },
  },
  /** Common document sizes */
  DOCUMENT: {
    A4_PORTRAIT: { width: 210, height: 297 },
    A4_LANDSCAPE: { width: 297, height: 210 },
    LETTER_PORTRAIT: { width: 216, height: 279 },
    LETTER_LANDSCAPE: { width: 279, height: 216 },
  },
  /** Common sizes */
  SIZES: {
    AVATAR_SMALL: { width: 64, height: 64 },
    AVATAR_MEDIUM: { width: 128, height: 128 },
    AVATAR_LARGE: { width: 256, height: 256 },
    THUMBNAIL_SMALL: { width: 150, height: 150 },
    THUMBNAIL_MEDIUM: { width: 300, height: 300 },
    HD_720P: { width: 1280, height: 720 },
    FHD_1080P: { width: 1920, height: 1080 },
    UHD_4K: { width: 3840, height: 2160 },
  },
} as const

// Filter constants
export const FILTERS = {
  /** Default filter intensity */
  DEFAULT_INTENSITY: 1,
  /** Filter range */
  MIN_INTENSITY: 0,
  MAX_INTENSITY: 2,
  /** Blur range */
  MIN_BLUR: 0,
  MAX_BLUR: 50,
  /** Brightness range */
  MIN_BRIGHTNESS: -100,
  MAX_BRIGHTNESS: 100,
  /** Contrast range */
  MIN_CONTRAST: -100,
  MAX_CONTRAST: 100,
  /** Saturation range */
  MIN_SATURATION: -100,
  MAX_SATURATION: 100,
  /** Hue range */
  MIN_HUE: -180,
  MAX_HUE: 180,
} as const

// Keyboard shortcuts
export const KEYBOARD = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
  SPACE: ' ',
  PLUS: '+',
  MINUS: '-',
  EQUAL: '=',
  ZERO: '0',
  /** Keyboard movement step (px) */
  MOVE_STEP: 10,
  /** Keyboard movement step with shift (px) */
  MOVE_STEP_LARGE: 50,
} as const

// Export quality presets
export const QUALITY_PRESETS = {
  WEB: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'image/jpeg' as const,
  },
  PRINT: {
    maxWidth: 4096,
    maxHeight: 4096,
    quality: 0.95,
    format: 'image/jpeg' as const,
  },
  ARCHIVE: {
    quality: 1,
    format: 'image/png' as const,
  },
  THUMBNAIL: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.8,
    format: 'image/jpeg' as const,
  },
} as const

// CSS class names
export const CSS_CLASSES = {
  CONTAINER: 'cropper-container',
  CANVAS: 'cropper-canvas',
  CROP_BOX: 'cropper-crop-box',
  VIEW_BOX: 'cropper-view-box',
  FACE: 'cropper-face',
  MODAL: 'cropper-modal',
  BACKGROUND: 'cropper-bg',
  DASHED: 'cropper-dashed',
  CENTER: 'cropper-center',
  LINE: 'cropper-line',
  POINT: 'cropper-point',
  TOOLBAR: 'cropper-toolbar',
  TOOLBAR_BUTTON: 'cropper-toolbar-button',
  TOOLBAR_GROUP: 'cropper-toolbar-group',
  PLACEHOLDER: 'cropper-placeholder',
  HIDDEN: 'cropper-hidden',
  DISABLED: 'cropper-disabled',
  ACTIVE: 'cropper-active',
} as const

// Event names
export const EVENTS = {
  READY: 'ready',
  CROP_START: 'cropstart',
  CROP_MOVE: 'cropmove',
  CROP_END: 'cropend',
  CROP: 'crop',
  ZOOM: 'zoom',
  UPLOAD: 'upload',
  UPLOAD_ERROR: 'uploadError',
  PRESET_APPLIED: 'preset:applied',
  PRESET_CLEARED: 'preset:cleared',
  FILTER_APPLIED: 'filter:applied',
  FILTER_CLEARED: 'filter:cleared',
} as const

// Error messages
export const ERRORS = {
  CONTAINER_NOT_FOUND: 'Container element not found',
  IMAGE_LOAD_FAILED: 'Failed to load image',
  CANVAS_CONTEXT_FAILED: 'Failed to get canvas context',
  INVALID_DIMENSIONS: 'Invalid image dimensions',
  MEMORY_LIMIT_EXCEEDED: 'Memory limit exceeded',
  INVALID_FORMAT: 'Invalid image format',
  OPERATION_CANCELLED: 'Operation was cancelled',
} as const
