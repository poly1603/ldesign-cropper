import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/cropper-core': resolve(__dirname, '../../packages/core/src/index.ts')
    }
  },
  server: {
    port: 5173
  }
})

