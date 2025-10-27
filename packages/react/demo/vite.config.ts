import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ldesign/cropper-react': resolve(__dirname, '../src/index.ts'),
      '@ldesign/cropper-core': resolve(__dirname, '../../core/src/index.ts')
    }
  },
  server: {
    port: 5175
  }
})
