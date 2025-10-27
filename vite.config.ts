import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'adapters/vue/index': resolve(__dirname, 'src/adapters/vue/index.ts'),
        'adapters/react/index': resolve(__dirname, 'src/adapters/react/index.tsx'),
        'adapters/angular/index': resolve(__dirname, 'src/adapters/angular/index.ts'),
        // Separate entries for tree-shaking
        'filters/index': resolve(__dirname, 'src/filters/index.ts'),
        'drawing/index': resolve(__dirname, 'src/drawing/index.ts'),
        'workers/index': resolve(__dirname, 'src/workers/index.ts')
      },
      name: 'LDesignCropper',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'js' : 'cjs'
        return `${entryName}.${ext}`
      }
    },
    rollupOptions: {
      external: ['vue', 'react', 'react-dom', 'react/jsx-runtime', '@angular/core', '@angular/common'],
      output: {
        globals: {
          vue: 'Vue',
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@angular/core': 'ng.core',
          '@angular/common': 'ng.common'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return assetInfo.name || 'assets/[name][extname]'
        },
        exports: 'named',
        // Enable tree-shaking
        preserveModules: false,
        // Optimize chunk sizes
        manualChunks: undefined
      }
    },
    cssCodeSplit: false,
    emptyOutDir: true,
    // Optimization settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
        pure_funcs: ['console.log'] // Remove console.log in production
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false // Remove comments
      }
    },
    // Source maps for debugging
    sourcemap: true,
    // Target modern browsers
    target: 'es2020'
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [],
    exclude: ['vue', 'react', 'react-dom', '@angular/core']
  },
  // Web Worker configuration
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'workers/[name].js'
      }
    }
  }
})
