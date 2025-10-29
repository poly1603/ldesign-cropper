# 📖 Cropper 项目概览

## 🎯 项目简介

**@ldesign/cropper** 是一个强大的、支持多框架的图像裁剪库,提供 150+ 功能特性,支持 8 个主流前端框架。

### 核心价值

- 🌍 **一次开发,处处可用** - 统一的 API,支持 8 个框架
- 🚀 **开箱即用** - 零配置或最小配置
- 📦 **功能丰富** - 裁剪、滤镜、批量处理、绘图等
- ⚡ **高性能** - 60fps 流畅交互
- 📚 **文档完整** - 10,000+ 行文档

---

## 📊 项目统计

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | TypeScript 5.7 |
| 构建工具 | @ldesign/builder |
| 包管理 | pnpm workspace |
| 代码检查 | @antfu/eslint-config |
| 测试框架 | Vitest |
| 文档工具 | VitePress (待配置) |

### 代码量统计

```
总代码量: ~17,500 行
├── 核心代码: ~10,000 行
├── 框架适配: ~2,000 行
├── 配置文件: ~500 行
└── 测试代码: ~5,000 行

文档量: ~10,000 行
├── README 文档: ~3,000 行
├── 架构文档: ~2,000 行
└── 使用指南: ~5,000 行
```

### 包结构

```
9 个包
├── 1 个核心包 (core)
├── 1 个原生包 (vanilla)
├── 4 个经典框架 (vue, react, angular, lit)
└── 3 个现代框架 (solid, svelte, qwik)
```

---

## 🎨 功能矩阵

### 核心功能

| 功能类别 | 功能数量 | 状态 |
|---------|---------|------|
| 基础裁剪 | 20+ | ✅ |
| 图像变换 | 15+ | ✅ |
| 滤镜系统 | 33 | ✅ |
| 批量处理 | 10+ | ✅ |
| 绘图工具 | 15+ | ✅ |
| 图层系统 | 10+ | ✅ |
| 选区工具 | 8+ | ✅ |
| 导出功能 | 10+ | ✅ |
| 性能优化 | 15+ | ✅ |
| 辅助功能 | 20+ | ✅ |

**总计**: 150+ 功能特性

### 框架支持矩阵

| 框架 | 版本 | 状态 | 组件类型 | Hook/Composable |
|------|------|------|----------|-----------------|
| Vue | 3.4+ | ✅ | Composition API | useCropper |
| React | 18+ | ✅ | Function Component | useCropper |
| Angular | 17+ | ✅ | Standalone Component | - |
| Solid | 1.8+ | ✅ | Fine-grained Reactive | useCropper |
| Svelte | 4/5 | ✅ | Compiled Component | - |
| Qwik | 1.0+ | ✅ | Resumable Component | useCropper |
| Lit | 3+ | ✅ | Web Component | - |
| Vanilla | ES6+ | ✅ | Class | - |

---

## 🏗️ 架构设计

### 分层架构

```
┌─────────────────────────────────────┐
│     Framework Adapters Layer        │
│  (Vue, React, Angular, Solid, ...)  │
├─────────────────────────────────────┤
│        Core Functionality            │
│  (Cropper, Filters, Batch, ...)     │
├─────────────────────────────────────┤
│         Utility Layer                │
│  (Math, DOM, Performance, ...)      │
├─────────────────────────────────────┤
│        Browser APIs                  │
│  (Canvas, WebWorker, ...)            │
└─────────────────────────────────────┘
```

### 模块依赖

```
packages/angular    ──┐
packages/solid      ──┤
packages/svelte     ──┤
packages/qwik       ──┼──> packages/core
packages/vue        ──┤
packages/react      ──┤
packages/lit        ──┤
packages/vanilla    ──┘
```

---

## 📦 包详情

### Core Package (@ldesign/cropper-core)

**职责**: 提供框架无关的核心功能

**主要模块**:
- `core/` - 核心裁剪逻辑
- `filters/` - 滤镜引擎
- `drawing/` - 绘图工具
- `workers/` - Web Worker 支持
- `utils/` - 工具函数
- `types/` - TypeScript 类型定义

**大小**: ~45KB (gzipped)

### Framework Packages

| 包名 | 大小 | 主要文件 |
|------|------|----------|
| @ldesign/cropper-vue | ~10KB | Cropper.vue, useCropper.ts |
| @ldesign/cropper-react | ~10KB | Cropper.tsx, useCropper.ts |
| @ldesign/cropper-angular | ~12KB | cropper.component.ts |
| @ldesign/cropper-solid | ~8KB | Cropper.tsx, useCropper.ts |
| @ldesign/cropper-svelte | ~8KB | Cropper.svelte |
| @ldesign/cropper-qwik | ~10KB | cropper.tsx, useCropper.ts |
| @ldesign/cropper-lit | ~12KB | cropper.element.ts |
| @ldesign/cropper | ~10KB | Cropper.ts |

---

## 🔄 开发流程

### 标准开发流程

```mermaid
graph LR
    A[克隆项目] --> B[安装依赖]
    B --> C[选择包]
    C --> D[开发功能]
    D --> E[编写测试]
    E --> F[运行测试]
    F --> G[代码检查]
    G --> H[构建]
    H --> I[提交PR]
```

### 命令速查

```bash
# 开发
pnpm install              # 安装依赖
pnpm build                # 构建所有包
pnpm build:core           # 构建核心包
pnpm build:vue            # 构建 Vue 包

# 测试
pnpm test                 # 运行所有测试
pnpm test --watch         # Watch 模式
pnpm test --coverage      # 覆盖率报告

# 代码质量
pnpm lint                 # Lint 检查
pnpm lint:fix             # 自动修复
pnpm typecheck            # 类型检查

# 清理
pnpm clean                # 清理构建产物
```

---

## 🎯 设计原则

### API 设计

1. **统一性** - 所有框架使用相同的 API
2. **简洁性** - 最小化必需参数
3. **可扩展性** - 支持自定义配置
4. **类型安全** - 完整的 TypeScript 支持

### 代码规范

1. **命名规范**
   - 组件: PascalCase
   - 函数: camelCase
   - 常量: UPPER_CASE
   - 私有: 使用 `_` 前缀或 `private`

2. **文件结构**
   - 每个文件单一职责
   - 导出清晰明确
   - 避免循环依赖

3. **注释规范**
   - 公共 API 必须有 JSDoc
   - 复杂逻辑必须有说明
   - 避免冗余注释

---

## 📈 性能指标

### 当前性能 (v2.0.0)

| 指标 | 目标 | 实际 | 状态 |
|------|------|------|------|
| 首次渲染 | <100ms | ~80ms | ✅ |
| 裁剪操作 | <50ms | ~40ms | ✅ |
| 滤镜应用 | <100ms | ~80ms | ✅ |
| 帧率 | 60fps | 60fps | ✅ |
| Bundle 大小 | <100KB | ~85KB | ✅ |
| 内存占用 | <150MB | ~120MB | ✅ |

### 优化策略

- ✅ Canvas 池化
- ✅ 事件节流/防抖
- ✅ Web Worker 异步处理
- ✅ 智能缓存
- ✅ Lazy Loading
- ✅ Tree Shaking

---

## 🧪 测试策略

### 测试金字塔

```
        ┌─────────┐
        │  E2E    │  5%
        └─────────┘
      ┌─────────────┐
      │  Integration │  15%
      └─────────────┘
    ┌───────────────────┐
    │   Unit Tests      │  80%
    └───────────────────┘
```

### 测试覆盖率目标

- 单元测试: >80%
- 集成测试: >60%
- E2E 测试: 核心流程 100%

### 测试类型

1. **单元测试** - Vitest
   - 工具函数
   - 核心算法
   - 滤镜引擎

2. **集成测试** - Vitest
   - 组件交互
   - API 调用
   - 事件流

3. **E2E 测试** - Playwright (待实现)
   - 用户流程
   - 跨浏览器
   - 性能测试

---

## 🚀 发布流程

### 版本号规范

遵循语义化版本 (Semver):
- **Major** (x.0.0) - 破坏性更新
- **Minor** (0.x.0) - 新功能,向后兼容
- **Patch** (0.0.x) - Bug 修复

### 发布检查清单

- [ ] 所有测试通过
- [ ] Lint 检查通过
- [ ] 类型检查通过
- [ ] 文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号已更新
- [ ] 构建成功
- [ ] Demo 验证通过

---

## 📚 学习资源

### 入门资源

1. **快速开始** - [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
2. **API 文档** - 各包的 README
3. **示例代码** - `examples/` 目录
4. **视频教程** - (计划中)

### 进阶资源

1. **架构文档** - [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **功能列表** - [FEATURES.md](./FEATURES.md)
3. **贡献指南** - [CONTRIBUTING.md](./CONTRIBUTING.md)
4. **路线图** - [ROADMAP.md](./ROADMAP.md)

---

## 🤝 社区

### 获取帮助

- 💬 [GitHub Discussions](https://github.com/ldesign/cropper/discussions)
- 🐛 [GitHub Issues](https://github.com/ldesign/cropper/issues)
- 📧 Email: support@ldesign.com
- 💼 Discord: (计划中)

### 贡献方式

1. **代码贡献** - 提交 PR
2. **Bug 报告** - 提交 Issue
3. **功能建议** - 参与讨论
4. **文档改进** - 完善文档
5. **翻译** - 多语言支持

---

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE)

---

## 🎉 致谢

感谢所有贡献者和用户的支持!

### 主要贡献者

- ldesign Team - 核心开发团队

### 技术栈感谢

- TypeScript
- Vite/Rollup
- Vitest
- 所有依赖的开源项目

---

**最后更新**: 2025-10-29  
**当前版本**: 2.0.0  
**维护团队**: ldesign
