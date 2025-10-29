# ESLint 错误修复指南

**当前状态**：309 个问题（43 错误 + 266 警告）  
**目标**：修复所有错误，减少警告到可接受水平

## 📊 错误分类

### 高优先级错误（43个）

#### 1. 使用 `global` 或 `self` (约10个)
**错误**：`Unexpected use of 'global'. Use globalThis instead`

**位置**：
- `__tests__/setup.ts`
- Web Worker 相关文件

**修复方法**：
```typescript
// 修复前
global.IntersectionObserver = ...

// 修复后
globalThis.IntersectionObserver = ...
```

#### 2. 使用 `isNaN` (约5个)
**错误**：`Prefer Number.isNaN over isNaN`

**修复方法**：
```typescript
// 修复前
if (isNaN(value)) { ... }

// 修复后
if (Number.isNaN(value)) { ... }
```

#### 3. 使用 `alert`/`prompt`/`confirm` (约5个)
**错误**：`Unexpected alert/prompt/confirm`

**修复方法**：
- 移除或替换为自定义对话框
- 或者添加 eslint-disable 注释（如果是调试代码）

```typescript
// 修复前
const result = prompt('Enter value:')

// 修复后
// TODO: Replace with custom dialog
// eslint-disable-next-line no-alert
const result = prompt('Enter value:')
```

#### 4. 重复导入 (约3个)
**错误**：`'@angular/core' imported multiple times`

**修复方法**：
```typescript
// 修复前
import { Component } from '@angular/core'
import { Input } from '@angular/core'

// 修复后
import { Component, Input } from '@angular/core'
```

#### 5. 类成员重复 (约2个)
**错误**：`Duplicate name 'zoom'`

**修复方法**：
- 检查是否有同名的方法或属性
- 重命名或移除重复的定义

#### 6. Function 类型使用 (约5个)
**错误**：`The Function type accepts any function-like value`

**修复方法**：
```typescript
// 修复前
callback: Function

// 修复后
callback: (...args: any[]) => any
// 或更具体的类型
callback: (event: CustomEvent) => void
```

#### 7. 其他严重错误
- `Unnecessary try/catch wrapper`
- `Unnecessary return statement`
- `Expected error to be handled`
- `using deprecated parameters`

### 中优先级警告（266个）

#### 1. TypeScript `any` 类型 (约100个)
**警告**：`Unexpected any. Specify a different type`

**修复建议**：
- 逐步为参数和返回值添加具体类型
- 优先修复公共 API 的类型
- 内部实现可以保留部分 `any`

#### 2. 未使用的变量 (约50个)
**警告**：`'x' is defined but never used`

**修复方法**：
```typescript
// 修复前
const result = someFunction()

// 修复后（如果不需要）
someFunction()

// 或使用下划线前缀（表示有意忽略）
const _result = someFunction()
```

#### 3. 代码风格问题 (约50个)
- `style/comma-dangle`
- `style/no-multi-spaces`
- `style/max-statements-per-line`

**修复方法**：运行自动修复
```bash
pnpm run lint:fix
```

#### 4. 测试文件问题 (约40个)
- `test/prefer-lowercase-title`
- `perfectionist/sort-imports`
- `perfectionist/sort-named-imports`

**修复建议**：
- 可以为测试文件单独配置规则
- 或批量修复导入排序

## 🔧 快速修复命令

### 自动修复
```bash
# 自动修复所有可修复的问题
pnpm run lint:fix
```

### 分批修复
```bash
# 只修复特定目录
pnpm run lint:fix packages/core/src

# 只修复特定文件类型
pnpm run lint:fix "**/*.test.ts"
```

## 📝 修复优先级

### 第一批：立即修复（预计1小时）
1. ✅ 所有 `global` → `globalThis` 替换
2. ✅ 所有 `isNaN` → `Number.isNaN` 替换
3. ✅ 移除或注释掉 `alert`/`prompt`/`confirm`
4. ✅ 合并重复导入

### 第二批：本周修复（预计2-3小时）
1. 修复所有 Function 类型
2. 修复类成员重复问题
3. 处理未使用的变量
4. 运行 lint:fix 自动修复风格问题

### 第三批：逐步改进（1-2周）
1. 减少 `any` 类型使用
2. 改进类型定义
3. 优化测试文件
4. 达到零 error 状态

## 🎯 目标

- **短期**：减少到 < 20 个错误
- **中期**：零错误，< 100 个警告
- **长期**：零错误，< 50 个警告

## 📄 批量修复脚本

可以创建脚本批量替换：

```bash
# PowerShell 脚本示例
Get-ChildItem -Recurse -Include *.ts,*.tsx | ForEach-Object {
    (Get-Content $_.FullName) -replace '\bglobal\.', 'globalThis.' | Set-Content $_.FullName
    (Get-Content $_.FullName) -replace '\bisNaN\(', 'Number.isNaN(' | Set-Content $_.FullName
}
```

## 🔍 验证

修复后运行：
```bash
# 查看剩余问题
pnpm run lint

# 统计错误和警告数量
pnpm run lint 2>&1 | Select-String "problems"
```

---

**创建时间**：2025-10-29  
**当前状态**：309 problems (43 errors, 266 warnings)  
**目标状态**：0 errors, < 50 warnings
