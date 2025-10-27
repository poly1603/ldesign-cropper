import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/cropper-core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ldesign/cropper-vue': resolve(__dirname, '../../packages/vue/src/index.ts')
    }
  },
  server: {
    port: 5174
  }
})

