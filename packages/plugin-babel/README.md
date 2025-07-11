# @testring/plugin-babel

Babel 编译插件模块，作为 testring 框架的代码转换核心，提供完整的 JavaScript 和 TypeScript 代码编译、转换和优化能力。该插件基于 Babel 7.x 版本，支持现代 JavaScript 语法转换、模块系统处理、源码映射和自定义转换规则，为测试环境提供灵活强大的代码编译解决方案。

[![npm version](https://badge.fury.io/js/@testring/plugin-babel.svg)](https://www.npmjs.com/package/@testring/plugin-babel)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## 功能概述

Babel 编译插件模块是 testring 框架的代码转换核心，提供了：
- 完整的 ES6+ 到 ES5 语法转换支持
- 智能的模块系统转换（ES6 modules 转 CommonJS）
- 灵活的 Babel 插件和预设配置系统
- 高效的异步代码编译和缓存机制
- 详细的源码映射和调试信息支持
- 自定义转换规则和插件扩展能力
- 与 testring 测试工作器的深度集成
- 性能优化的编译流程和内存管理

## 主要特性

### 代码转换
- 支持最新的 ECMAScript 语法特性
- 智能的模块导入导出转换
- 可配置的转换选项和优化级别
- 保持源码结构和注释的完整性

### 插件系统
- 内置常用的 Babel 插件和预设
- 支持自定义插件链和转换规则
- 灵活的插件配置和参数传递
- 与第三方 Babel 生态的无缝集成

### 性能优化
- 高效的异步编译处理
- 智能的编译缓存和重用机制
- 最小化的内存占用和 CPU 使用
- 优化的文件系统访问和 I/O 操作

### 开发体验
- 详细的编译错误信息和诊断
- 完整的源码映射和调试支持
- 灵活的配置选项和环境适配
- 与现代开发工具的良好集成

## 安装

```bash
npm install @testring/plugin-babel
```

或使用 yarn：

```bash
yarn add @testring/plugin-babel
```

## 核心架构

### BabelPlugin 函数
主要的插件注册接口，集成到 testring 测试工作器：

```typescript
function babelPlugin(
  pluginAPI: PluginAPI,
  config?: babelCore.TransformOptions | null
): void
```

### 内置插件配置
```typescript
export const babelPlugins = [
  [
    '@babel/plugin-transform-modules-commonjs',
    {
      strictMode: false,
    },
  ],
];
```

### Babel 配置选项
```typescript
interface BabelTransformOptions {
  sourceFileName?: string;  // 源文件名
  sourceMaps?: boolean;     // 是否生成源码映射
  sourceRoot?: string;      // 源码根目录
  plugins?: any[];          // Babel 插件列表
  presets?: any[];          // Babel 预设列表
  filename?: string;        // 当前文件名
  compact?: boolean;        // 是否压缩输出
  minified?: boolean;       // 是否最小化
  comments?: boolean;       // 是否保留注释
}
```

## 基本用法

### 插件注册和配置

```typescript
import babelPlugin from '@testring/plugin-babel';
import { PluginAPI } from '@testring/plugin-api';

// 基本插件注册
function registerBabelPlugin(pluginAPI: PluginAPI) {
  // 使用默认配置
  babelPlugin(pluginAPI);
}

// 带自定义配置的注册
function registerBabelPluginWithConfig(pluginAPI: PluginAPI) {
  babelPlugin(pluginAPI, {
    // 启用源码映射
    sourceMaps: true,
    
    // 保留注释
    comments: true,
    
    // 添加自定义插件
    plugins: [
      // 支持装饰器语法
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // 支持类属性
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      // 支持可选链操作符
      '@babel/plugin-proposal-optional-chaining',
      // 支持空值合并操作符
      '@babel/plugin-proposal-nullish-coalescing-operator'
    ],
    
    // 添加预设
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: '14'
          },
          modules: false // 保持 ES6 模块
        }
      ],
      '@babel/preset-typescript'
    ]
  });
}

// 环境特定配置
function registerBabelPluginForEnvironment(pluginAPI: PluginAPI, env: string) {
  const configs = {
    development: {
      sourceMaps: true,
      comments: true,
      compact: false,
      plugins: [
        // 开发环境插件
        '@babel/plugin-transform-runtime'
      ]
    },
    
    production: {
      sourceMaps: false,
      comments: false,
      compact: true,
      minified: true,
      plugins: [
        // 生产环境优化插件
        'babel-plugin-transform-remove-console',
        'babel-plugin-transform-remove-debugger'
      ]
    },
    
    test: {
      sourceMaps: true,
      comments: true,
      plugins: [
        // 测试环境插件
        '@babel/plugin-transform-modules-commonjs',
        'babel-plugin-istanbul' // 代码覆盖率
      ]
    }
  };
  
  const config = configs[env] || configs.development;
  babelPlugin(pluginAPI, config);
}

// 在测试框架中使用
const pluginAPI = new PluginAPI(/* 配置参数 */);
registerBabelPluginWithConfig(pluginAPI);
```

### TypeScript 支持配置

```typescript
// TypeScript 项目的 Babel 配置
function registerBabelForTypeScript(pluginAPI: PluginAPI) {
  babelPlugin(pluginAPI, {
    presets: [
      // TypeScript 预设
      [
        '@babel/preset-typescript',
        {
          allowNamespaces: true,
          allowDeclareFields: true,
          onlyRemoveTypeImports: true
        }
      ],
      // 环境预设
      [
        '@babel/preset-env',
        {
          targets: {
            node: '14'
          },
          useBuiltIns: 'usage',
          corejs: 3
        }
      ]
    ],
    
    plugins: [
      // TypeScript 相关插件
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-async-generator-functions',
      '@babel/plugin-proposal-optional-catch-binding',
      '@babel/plugin-proposal-json-strings',
      '@babel/plugin-syntax-dynamic-import'
    ],
    
    // TypeScript 文件扩展名
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    
    // 源码映射配置
    sourceMaps: 'inline',
    sourceRoot: process.cwd()
  });
}

// React + TypeScript 配置
function registerBabelForReactTypeScript(pluginAPI: PluginAPI) {
  babelPlugin(pluginAPI, {
    presets: [
      '@babel/preset-typescript',
      [
        '@babel/preset-react',
        {
          runtime: 'automatic', // 新的 JSX 转换
          development: process.env.NODE_ENV === 'development'
        }
      ],
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['last 2 versions'],
            node: '14'
          }
        }
      ]
    ],
    
    plugins: [
      // React 相关插件
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-syntax-dynamic-import',
      
      // 开发环境热重载
      ...(process.env.NODE_ENV === 'development' ? [
        'react-hot-loader/babel'
      ] : []),
      
      // 生产环境优化
      ...(process.env.NODE_ENV === 'production' ? [
        'babel-plugin-transform-react-remove-prop-types',
        'babel-plugin-transform-react-constant-elements'
      ] : [])
    ]
  });
}
```

## 高级配置和自定义

### 自定义插件开发

```typescript
// 自定义 Babel 插件示例
function createCustomBabelPlugin() {
  return {
    name: 'custom-testring-plugin',
    visitor: {
      // 转换测试相关的装饰器
      Decorator(path: any) {
        if (path.node.expression.name === 'test') {
          // 自定义转换逻辑
          path.node.expression.name = 'testTransformed';
        }
      },
      
      // 处理异步函数
      FunctionDeclaration(path: any) {
        if (path.node.async && path.node.id?.name?.startsWith('test')) {
          // 为测试函数添加错误处理
          const body = path.node.body;
          body.body.unshift({
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'console' },
                property: { type: 'Identifier', name: 'log' }
              },
              arguments: [{
                type: 'StringLiteral',
                value: `Running test: ${path.node.id.name}`
              }]
            }
          });
        }
      },
      
      // 转换导入语句
      ImportDeclaration(path: any) {
        const source = path.node.source.value;
        
        // 转换测试工具导入
        if (source.startsWith('@testring/')) {
          // 添加运行时检查
          console.log(`Loading testring module: ${source}`);
        }
      }
    }
  };
}

// 使用自定义插件
function registerBabelWithCustomPlugin(pluginAPI: PluginAPI) {
  babelPlugin(pluginAPI, {
    plugins: [
      // 内置插件
      '@babel/plugin-transform-modules-commonjs',
      
      // 自定义插件
      createCustomBabelPlugin(),
      
      // 其他插件
      '@babel/plugin-proposal-optional-chaining'
    ]
  });
}
```

### 条件编译和环境优化

```typescript
// 环境感知的 Babel 配置
class BabelConfigManager {
  private environment: string;
  private projectRoot: string;
  
  constructor(environment = process.env.NODE_ENV || 'development') {
    this.environment = environment;
    this.projectRoot = process.cwd();
  }
  
  // 获取基础配置
  getBaseConfig(): any {
    return {
      sourceRoot: this.projectRoot,
      sourceFileName: 'unknown',
      sourceMaps: this.environment !== 'production',
      comments: this.environment === 'development',
      compact: this.environment === 'production',
      minified: this.environment === 'production'
    };
  }
  
  // 获取插件列表
  getPlugins(): any[] {
    const basePlugins = [
      ['@babel/plugin-transform-modules-commonjs', { strictMode: false }],
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-async-generator-functions'
    ];
    
    const environmentPlugins = {
      development: [
        '@babel/plugin-transform-runtime',
        'babel-plugin-source-map-support'
      ],
      
      test: [
        'babel-plugin-istanbul',
        ['babel-plugin-module-resolver', {
          root: [this.projectRoot],
          alias: {
            '@test': './test',
            '@src': './src'
          }
        }]
      ],
      
      production: [
        'babel-plugin-transform-remove-console',
        'babel-plugin-transform-remove-debugger',
        ['babel-plugin-transform-remove-undefined', { tdz: true }]
      ]
    };
    
    return [
      ...basePlugins,
      ...(environmentPlugins[this.environment] || [])
    ];
  }
  
  // 获取预设列表
  getPresets(): any[] {
    const basePresets = [];
    
    // TypeScript 支持
    if (this.hasTypeScript()) {
      basePresets.push([
        '@babel/preset-typescript',
        {
          allowNamespaces: true,
          allowDeclareFields: true
        }
      ]);
    }
    
    // 环境预设
    basePresets.push([
      '@babel/preset-env',
      {
        targets: this.getTargets(),
        useBuiltIns: 'usage',
        corejs: 3,
        modules: 'commonjs'
      }
    ]);
    
    return basePresets;
  }
  
  // 获取目标环境
  private getTargets(): any {
    const targets = {
      development: { node: 'current' },
      test: { node: '14' },
      production: {
        node: '14',
        browsers: ['last 2 versions', 'not dead']
      }
    };
    
    return targets[this.environment] || targets.development;
  }
  
  // 检查 TypeScript 支持
  private hasTypeScript(): boolean {
    try {
      require.resolve('typescript');
      return true;
    } catch {
      return false;
    }
  }
  
  // 生成完整配置
  generateConfig(): any {
    return {
      ...this.getBaseConfig(),
      plugins: this.getPlugins(),
      presets: this.getPresets()
    };
  }
}

// 使用配置管理器
function registerBabelWithManager(pluginAPI: PluginAPI, environment?: string) {
  const configManager = new BabelConfigManager(environment);
  const config = configManager.generateConfig();
  
  console.log('Babel 配置:', JSON.stringify(config, null, 2));
  
  babelPlugin(pluginAPI, config);
}

// 在不同环境中使用
registerBabelWithManager(pluginAPI, 'development');
registerBabelWithManager(pluginAPI, 'test');
registerBabelWithManager(pluginAPI, 'production');
```

### 代码覆盖率和分析

```typescript
// 代码覆盖率配置
function registerBabelWithCoverage(pluginAPI: PluginAPI) {
  const coverageConfig = {
    plugins: [
      // 基础转换插件
      ['@babel/plugin-transform-modules-commonjs', { strictMode: false }],
      
      // Istanbul 代码覆盖率插件
      [
        'babel-plugin-istanbul',
        {
          exclude: [
            '**/*.test.js',
            '**/*.test.ts',
            '**/*.spec.js',
            '**/*.spec.ts',
            '**/node_modules/**',
            '**/test/**',
            '**/tests/**',
            '**/__tests__/**',
            '**/__mocks__/**'
          ],
          include: [
            'src/**/*.js',
            'src/**/*.ts',
            'lib/**/*.js',
            'lib/**/*.ts'
          ]
        }
      ],
      
      // 源码映射支持
      'babel-plugin-source-map-support'
    ],
    
    // 启用源码映射
    sourceMaps: 'both',
    sourceRoot: process.cwd(),
    
    // 保留注释和调试信息
    comments: true,
    compact: false
  };
  
  babelPlugin(pluginAPI, coverageConfig);
}

// 性能分析配置
function registerBabelWithProfiling(pluginAPI: PluginAPI) {
  babelPlugin(pluginAPI, {
    plugins: [
      ['@babel/plugin-transform-modules-commonjs', { strictMode: false }],
      
      // 性能分析插件
      [
        'babel-plugin-transform-function-profiling',
        {
          profilerName: 'testring-profiler',
          outputFile: './profiling-results.json'
        }
      ],
      
      // 内存使用分析
      'babel-plugin-transform-memory-usage'
    ],
    
    // 添加运行时检查
    compact: false,
    comments: true
  });
}
```

## 集成和扩展

### 与测试工作器集成

```typescript
import { PluginAPI } from '@testring/plugin-api';
import babelPlugin from '@testring/plugin-babel';

// 创建集成的测试环境
class TestEnvironmentWithBabel {
  private pluginAPI: PluginAPI;
  
  constructor(pluginAPI: PluginAPI) {
    this.pluginAPI = pluginAPI;
    this.setupBabelCompilation();
  }
  
  private setupBabelCompilation() {
    // 基础 Babel 配置
    const babelConfig = {
      presets: [
        ['@babel/preset-env', {
          targets: { node: '14' },
          modules: 'commonjs'
        }],
        '@babel/preset-typescript'
      ],
      
      plugins: [
        ['@babel/plugin-transform-modules-commonjs', { strictMode: false }],
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread'
      ],
      
      sourceMaps: true,
      sourceRoot: process.cwd()
    };
    
    // 注册 Babel 插件
    babelPlugin(this.pluginAPI, babelConfig);
    
    // 监听编译事件
    this.setupCompilationHooks();
  }
  
  private setupCompilationHooks() {
    const testWorker = this.pluginAPI.getTestWorker();
    
    // 编译前钩子
    testWorker.beforeCompile((filename: string) => {
      console.log(`开始编译: ${filename}`);
    });
    
    // 编译后钩子
    testWorker.afterCompile((filename: string, code: string) => {
      console.log(`编译完成: ${filename}, 代码长度: ${code.length}`);
    });
    
    // 编译错误钩子
    testWorker.onCompileError((filename: string, error: Error) => {
      console.error(`编译失败: ${filename}`, error);
    });
  }
  
  // 动态编译代码
  async compileCode(code: string, filename: string): Promise<string> {
    const testWorker = this.pluginAPI.getTestWorker();
    
    try {
      const compiledCode = await testWorker.compile(code, filename);
      return compiledCode;
    } catch (error) {
      console.error(`代码编译失败: ${filename}`, error);
      throw error;
    }
  }
  
  // 编译文件
  async compileFile(filepath: string): Promise<string> {
    const fs = require('fs').promises;
    const code = await fs.readFile(filepath, 'utf-8');
    
    return this.compileCode(code, filepath);
  }
  
  // 批量编译
  async compileFiles(filepaths: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    await Promise.all(filepaths.map(async (filepath) => {
      try {
        const compiledCode = await this.compileFile(filepath);
        results.set(filepath, compiledCode);
      } catch (error) {
        console.error(`批量编译失败: ${filepath}`, error);
        results.set(filepath, '');
      }
    }));
    
    return results;
  }
}

// 使用示例
const pluginAPI = new PluginAPI(/* 配置 */);
const testEnv = new TestEnvironmentWithBabel(pluginAPI);

// 编译单个文件
testEnv.compileFile('./src/test/example.test.ts')
  .then(code => console.log('编译结果:', code))
  .catch(error => console.error('编译错误:', error));

// 批量编译
const testFiles = [
  './src/test/unit.test.ts',
  './src/test/integration.test.ts',
  './src/test/e2e.test.ts'
];

testEnv.compileFiles(testFiles)
  .then(results => {
    console.log('批量编译完成:');
    results.forEach((code, filepath) => {
      console.log(`${filepath}: ${code.length} 字符`);
    });
  });
```

### Webpack 集成

```typescript
// 与 Webpack 集成的配置
function createWebpackBabelConfig() {
  return {
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: { node: '14' },
                  modules: 'commonjs'
                }],
                '@babel/preset-typescript'
              ],
              
              plugins: [
                ['@babel/plugin-transform-modules-commonjs', { strictMode: false }],
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-object-rest-spread'
              ],
              
              cacheDirectory: true,
              cacheCompression: false
            }
          }
        }
      ]
    }
  };
}

// 与 Jest 集成的配置
function createJestBabelConfig() {
  return {
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
        presets: [
          ['@babel/preset-env', {
            targets: { node: 'current' }
          }],
          '@babel/preset-typescript'
        ],
        
        plugins: [
          ['@babel/plugin-transform-modules-commonjs', { strictMode: false }],
          'babel-plugin-istanbul'
        ]
      }]
    }
  };
}
```

## 最佳实践

### 1. 配置管理
- 使用环境变量区分不同构建环境
- 建立清晰的插件优先级和依赖关系
- 实现配置的版本控制和变更追踪
- 提供默认配置和自定义配置的良好平衡

### 2. 性能优化
- 启用 Babel 缓存以提高重复编译速度
- 合理选择插件和预设避免不必要的转换
- 使用并行编译处理大量文件
- 监控编译时间和内存使用情况

### 3. 错误处理
- 提供详细的编译错误信息和位置
- 实现友好的错误恢复和重试机制
- 记录编译过程中的警告和提示
- 建立错误分类和常见问题解决方案

### 4. 调试支持
- 保持准确的源码映射信息
- 在开发环境中保留注释和调试信息
- 提供编译过程的详细日志
- 支持断点调试和源码查看

### 5. 兼容性
- 确保与不同版本 Babel 的兼容性
- 处理不同 JavaScript 版本的语法差异
- 支持主流的构建工具和测试框架
- 提供平滑的升级路径和迁移指南

## 故障排除

### 常见问题

#### 编译失败
```bash
SyntaxError: Unexpected token
```
解决方案：检查 Babel 配置、插件版本、语法支持。

#### 模块导入错误
```bash
Error: Cannot resolve module
```
解决方案：检查模块转换配置、路径解析、文件扩展名。

#### 源码映射问题
```bash
Source map error
```
解决方案：检查源码映射配置、文件路径、编译选项。

#### 性能问题
```bash
Babel compilation is slow
```
解决方案：启用缓存、优化插件配置、并行处理。

### 调试技巧

```typescript
// 启用详细日志
process.env.BABEL_ENV = 'debug';

// 检查 Babel 配置
babelPlugin(pluginAPI, {
  ...config,
  // 输出详细信息
  verbose: true,
  // 保留中间结果
  auxiliaryCommentBefore: '/* Babel compiled */',
  auxiliaryCommentAfter: '/* End Babel */',
});

// 监控编译性能
const startTime = Date.now();
babelPlugin(pluginAPI, config);
console.log(`Babel 插件注册耗时: ${Date.now() - startTime}ms`);
```

## 依赖

- `@babel/core` - Babel 核心编译器
- `@babel/plugin-transform-modules-commonjs` - 模块转换插件
- `@testring/plugin-api` - 插件 API 接口
- `@types/babel__core` - Babel 类型定义

## 相关模块

- `@testring/plugin-api` - 插件开发接口
- `@testring/test-worker` - 测试工作器
- `@testring/test-runner` - 测试运行器

## 许可证

MIT License