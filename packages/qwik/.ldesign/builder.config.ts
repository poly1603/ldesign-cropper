import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  framework: 'qwik',
  formats: ['esm', 'cjs'],
  dts: true,
  external: [
    '@builder.io/qwik',
    '@builder.io/qwik/jsx-runtime',
    '@ldesign/cropper-core'
  ],
  outDir: {
    esm: 'es',
    cjs: 'lib'
  }
})
