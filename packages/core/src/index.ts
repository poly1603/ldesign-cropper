/**
 * @ldesign/cropper-core - Main entry point
 * High-performance image cropper core library
 */

// Core Classes
export { Cropper } from './core/Cropper'
export { CropBox } from './core/CropBox'
export { ImageProcessor } from './core/ImageProcessor'
export { InteractionManager } from './core/InteractionManager'
export { Toolbar } from './core/Toolbar'
export { HistoryManager } from './core/HistoryManager'
export { PresetManager } from './core/PresetManager'
export { FilterPanel } from './core/FilterPanel'
export { KeyboardManager } from './core/KeyboardManager'
export { BatchProcessor } from './core/BatchProcessor'
export { BatchManager } from './core/BatchManager'
export { ImageTileManager } from './core/ImageTileManager'

// Filters
export * from './filters'

// Drawing
export * from './drawing'

// Types
export type {
  CropperOptions,
  CropBoxData,
  ImageData,
  CanvasData,
  ContainerData,
  CropData,
  GetCroppedCanvasOptions,
  Point,
  Rectangle,
  Action,
  DragMode,
  ViewMode,
  ImageFormat,
  InternalData,
  CropperEvent,
  CropperPlugin
} from './types'

// Utils
export * from './utils'

// Constants
export * from './config/constants'

// Default export
export { Cropper as default } from './core/Cropper'

