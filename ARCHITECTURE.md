# @ldesign/cropper 架构文档

## 📦 包结构

这是一个 monorepo 项目,支持多种前端框架,基于统一的核心功能库。

```
@ldesign/cropper-workspace/
├── packages/
│   ├── core/           # 核心功能库 (框架无关)
│   ├── vanilla/        # 原生JavaScript封装
│   ├── vue/            # Vue 3 组件
│   ├── react/          # React 组件
│   ├── angular/        # Angular 组件 ✨新增
│   ├── solid/          # Solid.js 组件 ✨新增
│   ├── svelte/         # Svelte 组件 ✨新增
│   ├── qwik/           # Qwik 组件 ✨新增
│   └── lit/            # Lit Web Component
├── docs/               # VitePress 文档站点
├── examples/           # 各框架示例项目
└── __tests__/          # 测试套件
```

## 🏗️ 核心架构

### 1. Core Package (@ldesign/cropper-core)

所有框架封装的基础,提供:

- **图像裁剪核心功能**
  - 自由/固定比例裁剪
  - 缩放、旋转、翻转
  - 拖拽和触摸手势
  
- **滤镜系统** (16种内置滤镜)
  - 基础调整: 亮度、对比度、饱和度、色调
  - 艺术效果: 灰度、复古、模糊、锐化
  - Instagram 风格预设 (17种)

- **批量处理**
  - 队列管理
  - 并行/串行处理
  - 进度追踪

- **性能优化**
  - Web Worker 支持
  - Canvas 池化
  - 内存管理
  - 60fps 流畅动画

- **高级功能**
  - 绘图工具
  - 图层系统
  - 选区和蒙版
  - 键盘快捷键
  - 无障碍支持

### 2. 框架适配器

每个框架包提供:
- 符合框架习惯的组件 API
- 类型定义 (TypeScript)
- 生命周期管理
- 响应式更新
- 事件系统集成

#### Vue (@ldesign/cropper-vue)
```vue
<template>
  <Cropper
    :src="image"
    :aspect-ratio="16/9"
    @ready="onReady"
  />
</template>
```

#### React (@ldesign/cropper-react)
```jsx
<Cropper
  src={image}
  aspectRatio={16/9}
  onReady={handleReady}
/>
```

#### Angular (@ldesign/cropper-angular)
```html
<l-cropper
  [src]="image"
  [aspectRatio]="16/9"
  (ready)="onReady($event)"
></l-cropper>
```

#### Solid (@ldesign/cropper-solid)
```jsx
<Cropper
  src={image()}
  aspectRatio={16/9}
  onReady={handleReady}
/>
```

#### Svelte (@ldesign/cropper-svelte)
```svelte
<Cropper
  {src}
  aspectRatio={16/9}
  on:ready={handleReady}
/>
```

#### Qwik (@ldesign/cropper-qwik)
```jsx
<Cropper
  src={image}
  aspectRatio={16/9}
  onReady$={handleReady}
/>
```

## 🛠️ 构建系统

### @ldesign/builder

所有包使用统一的构建工具 `@ldesign/builder`:

**特点:**
- 自动检测框架类型
- 零配置或最小配置
- 支持 ESM + CJS 双格式输出
- 自动生成 TypeScript 声明文件
- 优化的打包体积

**配置示例:**
```typescript
// packages/vue/.ldesign/builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  framework: 'vue',
  formats: ['esm', 'cjs'],
  dts: true,
  external: ['vue', '@ldesign/cropper-core'],
  outDir: {
    esm: 'es',
    cjs: 'lib'
  }
})
```

## 📋 开发工作流

### 1. 安装依赖
```bash
pnpm install
```

### 2. 构建所有包
```bash
pnpm build
```

### 3. 构建特定包
```bash
pnpm build:core
pnpm build:vue
pnpm build:react
pnpm build:angular
pnpm build:solid
pnpm build:svelte
pnpm build:qwik
```

### 4. 运行测试
```bash
pnpm test
```

### 5. Lint 检查
```bash
pnpm lint
pnpm lint:fix
```

### 6. 类型检查
```bash
pnpm typecheck
```

## 🧪 测试策略

### 单元测试 (Vitest)
- 核心功能测试
- 工具函数测试
- 滤镜引擎测试
- 覆盖率目标: >80%

### 性能测试 (Benchmark)
- 裁剪操作性能
- 滤镜应用速度
- 内存占用监控
- 无内存泄漏

### E2E 测试 (Playwright/Cypress)
- 用户交互流程
- 跨框架一致性
- 浏览器兼容性

## 📚 文档结构

### VitePress 站点

```
docs/
├── index.md              # 首页
├── guide/
│   ├── getting-started.md
│   ├── installation.md
│   └── basic-usage.md
├── api/
│   ├── core.md
│   ├── options.md
│   └── methods.md
├── frameworks/
│   ├── vue.md
│   ├── react.md
│   ├── angular.md
│   ├── solid.md
│   ├── svelte.md
│   └── qwik.md
└── examples/
    ├── filters.md
    ├── batch.md
    └── advanced.md
```

## 🚀 发布流程

### 版本管理
- 使用 pnpm workspace 管理版本
- 所有包统一版本号
- 遵循语义化版本规范

### 发布步骤
```bash
# 1. 确保所有测试通过
pnpm test

# 2. 构建所有包
pnpm build

# 3. 检查类型
pnpm typecheck

# 4. Lint检查
pnpm lint

# 5. 发布 (每个包单独发布)
cd packages/core && pnpm publish
cd packages/vue && pnpm publish
# ... 其他包
```

## 🎯 性能指标

### 目标
- 首次渲染: <100ms
- 裁剪操作: <50ms
- 滤镜应用: <100ms
- 60fps 流畅交互
- 包体积: <100KB (gzipped)

### 优化策略
- Tree-shaking 支持
- 按需加载滤镜
- Canvas 池化
- Web Worker 异步处理
- 智能缓存

## 🔧 开发规范

### 代码风格
- 使用 @antfu/eslint-config
- TypeScript 严格模式
- 禁止使用 any (警告级别)
- Prettier 格式化

### Git 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具链
```

### PR 流程
1. Fork 项目
2. 创建特性分支
3. 完成开发和测试
4. 提交 PR
5. Code Review
6. 合并到 main

## 📊 项目状态

### 已完成 ✅
- [x] 核心功能完整实现
- [x] 8个框架适配器
- [x] 构建系统配置
- [x] TypeScript 类型定义
- [x] ESLint 配置
- [x] 基础单元测试

### 进行中 🚧
- [ ] 演示项目
- [ ] VitePress 文档
- [ ] 完整的测试覆盖
- [ ] 性能优化
- [ ] AI 功能增强

### 计划中 📝
- [ ] 可视化测试
- [ ] CI/CD 配置
- [ ] 国际化支持
- [ ] 主题系统

## 🤝 贡献指南

欢迎贡献!请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE)

---

**维护者:** ldesign Team  
**最后更新:** 2025-10-29
