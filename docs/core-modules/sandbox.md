# @testring/sandbox

代码沙箱执行模块，提供了安全的 JavaScript 代码执行环境，支持依赖注入和模块隔离。

## 功能概述

该模块提供了一个基于 Node.js `vm` 模块的代码执行沙箱，主要功能包括：
- 安全的代码执行环境
- 模块依赖管理和注入
- 循环依赖处理
- 上下文隔离和控制
- 动态代码执行和评估

## 主要特性

### 安全执行环境
- 基于 Node.js `vm.createContext()` 创建隔离环境
- 控制全局变量的访问
- 防止代码污染主进程
- 支持自定义上下文对象

### 依赖管理
- 自动处理模块依赖关系
- 支持相对路径和绝对路径
- 循环依赖检测和处理
- 模块缓存机制

### 动态执行
- 支持动态代码评估
- 运行时代码注入
- 模块热重载
- 脚本编译和执行

## 安装

```bash
npm install --save-dev @testring/sandbox
```

或使用 yarn:

```bash
yarn add @testring/sandbox --dev
```

## 主要 API

### Sandbox 类
主要的沙箱执行类：

```typescript
export class Sandbox {
  constructor(
    source: string,           // 源代码
    filename: string,         // 文件名
    dependencies: DependencyDict  // 依赖字典
  )
  
  // 执行代码并返回导出对象
  execute(): any
  
  // 获取沙箱上下文
  getContext(): any
  
  // 静态方法：清理模块缓存
  static clearCache(): void
  
  // 静态方法：评估脚本代码
  static evaluateScript(filename: string, code: string): Promise<Sandbox>
}
```

## 使用方法

### 基本使用
```typescript
import { Sandbox } from '@testring/sandbox';

// 准备依赖字典
const dependencies = {
  '/project/main.js': {
    './helper': {
      path: '/project/helper.js',
      content: 'module.exports = { add: (a, b) => a + b };'
    }
  },
  '/project/helper.js': {}
};

// 创建沙箱
const sandbox = new Sandbox(
  `
    const helper = require('./helper');
    module.exports = {
      calculate: (x, y) => helper.add(x, y) * 2
    };
  `,
  '/project/main.js',
  dependencies
);

// 执行代码
const exports = sandbox.execute();
console.log(exports.calculate(3, 4)); // 输出: 14
```

### 处理复杂模块
```typescript
import { Sandbox } from '@testring/sandbox';

const testCode = `
  const assert = require('assert');
  const utils = require('./utils');
  
  // 测试用例
  function runTests() {
    assert.equal(utils.add(1, 2), 3);
    assert.equal(utils.multiply(3, 4), 12);
    console.log('所有测试通过！');
  }
  
  module.exports = { runTests };
`;

const dependencies = {
  '/tests/main.test.js': {
    './utils': {
      path: '/tests/utils.js',
      content: `
        module.exports = {
          add: (a, b) => a + b,
          multiply: (a, b) => a * b
        };
      `
    }
  },
  '/tests/utils.js': {}
};

const sandbox = new Sandbox(testCode, '/tests/main.test.js', dependencies);
const testModule = sandbox.execute();
testModule.runTests(); // 执行测试
```

### 动态代码执行
```typescript
import { Sandbox } from '@testring/sandbox';

// 首先创建基础沙箱
const baseSandbox = new Sandbox(
  'module.exports = { data: [] };',
  '/app/data.js',
  {}
);
baseSandbox.execute();

// 动态执行额外的代码
const dynamicCode = `
  const dataModule = require('/app/data.js');
  dataModule.data.push('新数据');
  console.log('数据已添加:', dataModule.data);
`;

await Sandbox.evaluateScript('/app/dynamic.js', dynamicCode);
```

### 循环依赖处理
```typescript
// 模块 A
const moduleA = `
  const b = require('./moduleB');
  module.exports = {
    name: 'A',
    getBName: () => b.name,
    value: 'valueA'
  };
`;

// 模块 B (依赖模块 A)
const moduleB = `
  const a = require('./moduleA');
  module.exports = {
    name: 'B',
    getAValue: () => a.value,
    data: 'dataB'
  };
`;

const dependencies = {
  '/modules/moduleA.js': {
    './moduleB': {
      path: '/modules/moduleB.js',
      content: moduleB
    }
  },
  '/modules/moduleB.js': {
    './moduleA': {
      path: '/modules/moduleA.js',
      content: moduleA
    }
  }
};

// 沙箱会正确处理循环依赖
const sandbox = new Sandbox(moduleA, '/modules/moduleA.js', dependencies);
const exportedA = sandbox.execute();

console.log(exportedA.name);        // 'A'
console.log(exportedA.getBName());  // 'B'
```

## 上下文环境

### 沙箱上下文
沙箱为每个模块提供以下上下文变量：

```typescript
// 每个模块都有这些变量可用
{
  __dirname: string,    // 当前文件的目录路径
  __filename: string,   // 当前文件的完整路径
  require: Function,    // 模块加载函数
  module: {            // 模块对象
    filename: string,   // 文件名
    id: string,        // 模块ID
    exports: any       // 导出对象
  },
  exports: any,        // 模块导出的快捷引用
  global: object       // 全局对象引用
}
```

### 自定义上下文
```typescript
// 可以通过继承或修改 Sandbox 来添加自定义上下文
class CustomSandbox extends Sandbox {
  protected createContext(filename: string, dependencies: DependencyDict) {
    const context = super.createContext(filename, dependencies);
    
    // 添加自定义全局变量
    context.myGlobal = 'custom value';
    context.setTimeout = setTimeout;
    context.clearTimeout = clearTimeout;
    
    return context;
  }
}
```

## 模块缓存

### 缓存机制
```typescript
// 沙箱自动缓存已解析的模块
const sandbox1 = new Sandbox(code1, 'file1.js', deps);
const sandbox2 = new Sandbox(code2, 'file2.js', deps);

// 如果 file2.js 依赖 file1.js，会直接使用缓存的 sandbox1
sandbox1.execute();
sandbox2.execute();
```

### 清理缓存
```typescript
// 清理所有模块缓存
Sandbox.clearCache();

// 之后创建的沙箱会重新解析所有模块
const freshSandbox = new Sandbox(code, filename, deps);
```

## 错误处理

### 执行错误
```typescript
try {
  const sandbox = new Sandbox(
    'throw new Error("测试错误");',
    'error-test.js',
    {}
  );
  sandbox.execute();
} catch (error) {
  console.error('沙箱执行错误:', error.message);
}
```

### 语法错误
```typescript
try {
  const sandbox = new Sandbox(
    'const x = ; // 语法错误',
    'syntax-error.js',
    {}
  );
  sandbox.execute();
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error('代码语法错误:', error.message);
  }
}
```

### 依赖缺失
```typescript
const sandbox = new Sandbox(
  'const missing = require("./not-exists");',
  'main.js',
  {} // 空依赖字典
);

try {
  sandbox.execute();
} catch (error) {
  console.error('依赖缺失:', error.message);
}
```

## 性能优化

### 模块预编译
```typescript
// 对于重复使用的代码，可以预编译模块
const precompiledModules = new Map();

function getOrCreateSandbox(filename: string, source: string, deps: DependencyDict) {
  if (precompiledModules.has(filename)) {
    return precompiledModules.get(filename);
  }
  
  const sandbox = new Sandbox(source, filename, deps);
  precompiledModules.set(filename, sandbox);
  return sandbox;
}
```

### 内存管理
```typescript
// 定期清理不使用的模块缓存
setInterval(() => {
  if (shouldCleanCache()) {
    Sandbox.clearCache();
  }
}, 60000); // 每分钟检查一次
```

## 与测试框架集成

### 与 dependencies-builder 集成
```typescript
import { buildDependencyDictionary } from '@testring/dependencies-builder';
import { Sandbox } from '@testring/sandbox';

// 构建依赖字典
const deps = await buildDependencyDictionary(testFile, readFile);

// 在沙箱中执行测试
const sandbox = new Sandbox(testFile.content, testFile.path, deps);
const testModule = sandbox.execute();
```

### 测试隔离
```typescript
// 每个测试在独立的沙箱中执行
async function runTest(testFile) {
  const deps = await buildDependencyDictionary(testFile, readFile);
  const sandbox = new Sandbox(testFile.content, testFile.path, deps);
  
  try {
    const testModule = sandbox.execute();
    if (typeof testModule.run === 'function') {
      await testModule.run();
    }
  } finally {
    // 测试完成后清理
    Sandbox.clearCache();
  }
}
```

## 安全考虑

### 代码执行限制
虽然沙箱提供了隔离环境，但仍需注意：
- 不执行不受信任的代码
- 限制文件系统访问
- 监控内存和 CPU 使用
- 设置执行超时

### 权限控制
```typescript
// 可以通过自定义 require 函数来限制模块访问
class SecureSandbox extends Sandbox {
  private require(requestPath: string) {
    // 检查是否允许访问该模块
    if (isAllowedModule(requestPath)) {
      return super.require(requestPath);
    } else {
      throw new Error(`模块访问被拒绝: ${requestPath}`);
    }
  }
}
```

## 最佳实践

### 模块组织
- 保持模块职责单一
- 避免过深的依赖嵌套
- 使用清晰的模块接口

### 错误处理
- 总是处理沙箱执行异常
- 提供详细的错误信息
- 实现适当的降级策略

### 性能优化
- 合理使用模块缓存
- 避免重复创建沙箱
- 监控内存使用情况

## 类型定义

```typescript
interface DependencyDict {
  [absolutePath: string]: {
    [requirePath: string]: {
      path: string;
      content: string;
    }
  }
}

interface SandboxContext {
  __dirname: string;
  __filename: string;
  require: (path: string) => any;
  module: {
    filename: string;
    id: string;
    exports: any;
  };
  exports: any;
  global: any;
}
```