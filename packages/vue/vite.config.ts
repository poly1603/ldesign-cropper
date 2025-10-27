import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignCropperVue',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        const ext = format === 'es' ? 'js' : 'cjs'
        return `index.${ext}`
      }
    },
    rollupOptions: {
      external: ['vue', '@ldesign/cropper-core'],
      output: {
        globals: {
          vue: 'Vue',
          '@ldesign/cropper-core': 'LDesignCropperCore'
        },
        exports: 'named'
      }
    },
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: true,
    target: 'es2020'
  }
})

