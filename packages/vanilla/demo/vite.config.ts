import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/cropper': resolve(__dirname, '../src/index.ts'),
      '@ldesign/cropper-core': resolve(__dirname, '../../core/src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
})
