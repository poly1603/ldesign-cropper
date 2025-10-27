import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ldesign/cropper-core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ldesign/cropper-react': resolve(__dirname, '../../packages/react/src/index.tsx')
    }
  },
  server: {
    port: 5175
  }
})

