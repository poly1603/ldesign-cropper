import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'filters/index': resolve(__dirname, 'src/filters/index.ts'),
        'drawing/index': resolve(__dirname, 'src/drawing/index.ts'),
      },
      name: 'LDesignCropperCore',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'js' : 'cjs'
        return `${entryName}.${ext}`
      },
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css')
            return 'style.css'
          return assetInfo.name || 'assets/[name][extname]'
        },
        exports: 'named',
        preserveModules: false,
      },
    },
    cssCodeSplit: false,
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    sourcemap: true,
    target: 'es2020',
  },
  optimizeDeps: {
    include: [],
  },
})
