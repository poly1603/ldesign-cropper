import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/cropper-vue': resolve(__dirname, '../src/index.ts'),
      '@ldesign/cropper-core': resolve(__dirname, '../../core/src/index.ts')
    }
  },
  server: {
    port: 5174
  }
})
