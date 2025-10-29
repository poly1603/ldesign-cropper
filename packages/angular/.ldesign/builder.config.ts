import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  framework: 'angular',
  formats: ['esm', 'cjs'],
  dts: true,
  external: [
    '@angular/core',
    '@angular/common',
    '@angular/platform-browser',
    'rxjs',
    'tslib',
    'zone.js',
    '@ldesign/cropper-core'
  ],
  outDir: {
    esm: 'es',
    cjs: 'lib'
  }
})
