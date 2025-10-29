import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',

  // Disable framework auto-detection to avoid Qwik-specific handling bugs
  framework: false,

  output: {
    format: ['esm', 'cjs'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    '@builder.io/qwik',
    '@builder.io/qwik/jsx-runtime',
    '@ldesign/cropper-core',
  ],
})
