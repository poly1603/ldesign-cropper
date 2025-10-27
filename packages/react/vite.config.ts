import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'LDesignCropperReact',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        const ext = format === 'es' ? 'js' : 'cjs'
        return `index.${ext}`
      }
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@ldesign/cropper-core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
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

