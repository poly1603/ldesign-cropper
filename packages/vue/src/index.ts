/**
 * @ldesign/cropper-vue
 * Vue 3 wrapper for @ldesign/cropper
 */

import type { App } from 'vue'
import Cropper from './Cropper.vue'

// Export component
export { Cropper }
export default Cropper

// Export types from core
export type * from '@ldesign/cropper-core'

// Vue plugin
export const CropperPlugin = {
  install(app: App) {
    app.component('LCropper', Cropper)
    app.component('LDesignCropper', Cropper)
  }
}

// Export core functionality
export * from '@ldesign/cropper-core'


