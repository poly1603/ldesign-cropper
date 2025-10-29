import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  framework: 'solid',
  formats: ['esm', 'cjs'],
  dts: true,
  external: [
    'solid-js',
    'solid-js/web',
    '@ldesign/cropper-core'
  ],
  outDir: {
    esm: 'es',
    cjs: 'lib'
  }
})
