import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',

  output: {
    format: ['esm', 'cjs', 'umd'],
    name: 'LDesignCropperReact',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      '@ldesign/cropper-core': 'LDesignCropperCore'
    },
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
    umd: {
      dir: 'dist',
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    'react',
    'react-dom',
    '@ldesign/cropper-core',
    /^@ldesign\//,
  ],
})

