/**
 * @ldesign/cropper - Main entry point
 * A powerful, flexible image cropper library that works with any framework
 */

// Core
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
export { VirtualCanvas } from './core/VirtualCanvas'
export { AccessibilityManager } from './core/AccessibilityManager'
export { TouchGestureManager } from './core/TouchGestureManager'
export { MobileUI } from './core/MobileUI'
export { Layer } from './core/Layer'
export { LayerSystem } from './core/LayerSystem'
export { Selection } from './core/Selection'
export { MaskManager } from './core/MaskManager'

// UI Components
export { SelectionToolbar } from './ui/SelectionToolbar'

// Filters
export * from './filters'

// Drawing
export * from './drawing'

// Workers
export * from './workers'

// Framework Adapters
export * from './adapters'

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
