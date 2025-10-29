/**
 * Framework Adapters - All implementations
 *
 * Provides component, hook, and directive support for Vue, React, and Angular
 */

// Angular exports - Component
export {
  AngularCropperComponent,
} from './angular'
// React exports - Component and Hook
export {
  ReactCropper,
  useCropper as useReactCropper,
} from './react'

export type {
  ReactCropperProps,
  ReactCropperRef,
  UseCropperOptions as UseReactCropperOptions,
} from './react'
// Vue 3 exports - Component, Composable, and Directive
export {
  getCropperInstance as getVueCropperInstance,
  useCropper as useVueCropper,
  vCropper,
  cropperDirective as vCropperDirective,
  VueCropper,
} from './vue'

export type {
  UseCropperOptions as UseVueCropperOptions,
  CropperDirectiveValue as VueCropperDirectiveValue,
} from './vue'
