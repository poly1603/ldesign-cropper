/**
 * @ldesign/cropper 构建配置
 * 
 * 图片裁剪库，支持 Vue、React、Angular 等多框架
 * 使用框架无关的核心 + 框架适配器模式
 */

import { defineConfig, libraryPackage } from '@ldesign/builder'

export default defineConfig(
  libraryPackage({
    // 输出配置
    output: {
      // ESM 格式
      esm: {
        dir: 'dist',
        format: 'esm',
        preserveStructure: true, // 保留目录结构
        dts: true
      },

      // CJS 格式
      cjs: {
        dir: 'dist',
        format: 'cjs',
        preserveStructure: true,
        dts: true
      },

      // UMD 格式 - 只打包核心
      umd: {
        dir: 'dist',
        format: 'umd',
        minify: true,
        sourcemap: true,
        input: 'src/index.ts' // 只打包核心，不包含适配器
      }
    },

    // UMD 构建配置
    umd: {
      enabled: true,
      name: 'LDesignCropper'
    },

    // 排除非生产代码
    exclude: [
      '**/demo/**',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/docs/**',
      '**/tests/**'
    ],

    // 外部依赖 - 框架都是可选的
    external: [
      'vue',
      'react',
      'react-dom',
      '@angular/core',
      '@angular/common'
    ],

    // 全局变量映射
    globals: {
      'vue': 'Vue',
      'react': 'React',
      'react-dom': 'ReactDOM',
      '@angular/core': 'ng.core',
      '@angular/common': 'ng.common'
    },

    // TypeScript 配置
    typescript: {
      declaration: true,
      target: 'ES2020',
      module: 'ESNext'
    },

    // 样式处理 - CSS 样式
    style: {
      extract: true,
      minimize: true,
      autoprefixer: true
    },

    // 性能优化
    performance: {
      treeshaking: true,
      minify: false
    }
  })
)

