# @testring/dependencies-builder

依赖分析和构建模块，提供了测试文件依赖关系的分析、解析和构建功能。

## 功能概述

该模块负责分析 JavaScript/TypeScript 文件的依赖关系，构建依赖字典和依赖树，为测试执行提供完整的依赖信息：
- 静态分析文件中的 `require()` 调用
- 构建完整的依赖关系图
- 解析相对路径和绝对路径
- 处理循环依赖
- 排除 node_modules 依赖

## 主要特性

### 静态代码分析
- 基于 Babel AST 解析代码结构
- 识别 `require()` 调用和模块引用
- 支持 CommonJS 模块系统
- 处理动态依赖路径解析

### 依赖树构建
- 递归构建完整的依赖关系
- 缓存机制避免重复解析
- 处理循环依赖情况
- 生成扁平化的依赖字典

### 路径解析
- 相对路径转绝对路径
- 自动补全文件扩展名
- 跨平台路径处理
- Node.js 模块解析规则

## 安装

```bash
npm install --save-dev @testring/dependencies-builder
```

或使用 yarn:

```bash
yarn add @testring/dependencies-builder --dev
```

## 主要 API

### buildDependencyDictionary
构建文件的依赖字典：

```typescript
import { buildDependencyDictionary } from '@testring/dependencies-builder';

const dependencyDict = await buildDependencyDictionary(file, readFileFunction);
```

### mergeDependencyDictionaries
合并多个依赖字典：

```typescript
import { mergeDependencyDictionaries } from '@testring/dependencies-builder';

const mergedDict = await mergeDependencyDictionaries(dict1, dict2);
```

## 使用方法

### 基本使用
```typescript
import { buildDependencyDictionary } from '@testring/dependencies-builder';
import { fs } from '@testring/utils';

// 准备文件读取函数
const readFile = async (filePath: string): Promise<string> => {
  return await fs.readFile(filePath, 'utf8');
};

// 分析文件依赖
const file = {
  path: './src/main.js',
  content: `
    const helper = require('./helper');
    const utils = require('../utils/index');
    
    module.exports = {
      run: () => {
        helper.doSomething();
        utils.log('完成');
      }
    };
  `
};

const dependencyDict = await buildDependencyDictionary(file, readFile);
console.log('依赖关系:', dependencyDict);
```

### 依赖字典结构
```typescript
// 依赖字典格式
type DependencyDict = {
  [absolutePath: string]: {
    [requirePath: string]: {
      path: string;      // 依赖文件的绝对路径
      content: string;   // 依赖文件的内容
    }
  }
};

// 示例输出
{
  "/project/src/main.js": {
    "./helper": {
      path: "/project/src/helper.js",
      content: "module.exports = { doSomething: () => {} };"
    },
    "../utils/index": {
      path: "/project/utils/index.js", 
      content: "module.exports = { log: console.log };"
    }
  },
  "/project/src/helper.js": {},
  "/project/utils/index.js": {}
}
```

### 处理循环依赖
```typescript
// 模块 A 依赖模块 B，模块 B 也依赖模块 A
const fileA = {
  path: './a.js',
  content: 'const b = require("./b"); module.exports = { fromA: true };'
};

const fileB = {
  path: './b.js', 
  content: 'const a = require("./a"); module.exports = { fromB: true };'
};

// 依赖构建器会正确处理循环依赖
const deps = await buildDependencyDictionary(fileA, readFile);
// 不会陷入无限递归
```

### 合并依赖字典
```typescript
// 当有多个入口文件时，可以合并它们的依赖字典
const dict1 = await buildDependencyDictionary(file1, readFile);
const dict2 = await buildDependencyDictionary(file2, readFile);

const mergedDict = await mergeDependencyDictionaries(dict1, dict2);
// 包含两个文件的所有依赖关系
```

## 路径解析规则

### 相对路径解析
```typescript
// 从 /project/src/main.js 解析
'./helper'      → '/project/src/helper.js'
'../utils'      → '/project/utils/index.js'
'./config.json' → '/project/src/config.json'
```

### 文件扩展名处理
```typescript
// 自动尝试常见扩展名
'./module'  → 尝试 './module.js', './module.json', './module/index.js'
```

### Node.js 模块排除
```typescript
// 这些依赖会被排除，不包含在依赖字典中
require('fs')           // Node.js 内置模块
require('lodash')       // node_modules 中的包
require('@babel/core')  // scoped 包
```

## 性能优化

### 缓存机制
- 已解析的文件会被缓存
- 避免重复解析相同文件
- 支持循环依赖的处理

### 内存管理
- 合理的内存使用
- 避免内存泄漏
- 适合大型项目使用

## 错误处理

### 文件不存在
```typescript
// 当依赖文件不存在时
try {
  const deps = await buildDependencyDictionary(file, readFile);
} catch (error) {
  console.error('依赖解析失败:', error.message);
}
```

### 语法错误
```typescript
// 当文件包含语法错误时
const fileWithSyntaxError = {
  path: './bad.js',
  content: 'const x = ; // 语法错误'
};

// 构建器会抛出解析错误
```

## 与测试框架集成

该模块通常与其他 testring 模块配合使用：

### 与 fs-reader 集成
```typescript
import { FSReader } from '@testring/fs-reader';
import { buildDependencyDictionary } from '@testring/dependencies-builder';

const fsReader = new FSReader();
const file = await fsReader.readFile('./test.spec.js');

if (file) {
  const deps = await buildDependencyDictionary(file, fsReader.readFile);
  // 获得完整的测试文件依赖信息
}
```

### 与 sandbox 集成
```typescript
// 依赖字典可以传递给沙箱环境使用
import { Sandbox } from '@testring/sandbox';

const deps = await buildDependencyDictionary(file, readFile);
const sandbox = new Sandbox(file.content, file.path, deps);
sandbox.execute();
```

## 类型定义

该模块使用 `@testring/types` 中定义的类型：

```typescript
interface IDependencyDictionary<T> {
  [key: string]: T;
}

interface IDependencyDictionaryNode {
  path: string;
  content: string;
}

interface IDependencyTreeNode {
  path: string;
  content: string;
  nodes: IDependencyDictionary<IDependencyTreeNode> | null;
}

type DependencyDict = IDependencyDictionary<IDependencyDictionary<IDependencyDictionaryNode>>;
type DependencyFileReader = (path: string) => Promise<string>;
```

## 最佳实践

### 组织代码结构
- 保持清晰的目录结构
- 避免过深的依赖嵌套
- 使用一致的模块导入风格

### 处理大型项目
- 考虑依赖分析的性能影响
- 适当使用缓存机制
- 监控内存使用情况

### 调试依赖问题
- 检查生成的依赖字典
- 验证路径解析结果
- 确认文件存在性
