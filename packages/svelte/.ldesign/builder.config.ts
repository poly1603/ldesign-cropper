import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  framework: 'svelte',
  formats: ['esm', 'cjs'],
  dts: true,
  external: [
    'svelte',
    'svelte/internal',
    'svelte/store',
    '@ldesign/cropper-core'
  ],
  outDir: {
    esm: 'es',
    cjs: 'lib'
  },
  // Disable CSS processing to avoid PostCSS issues
  disableCss: true,
})
