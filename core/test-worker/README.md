# @testring/test-worker

测试工作进程模块，作为 testring 框架的执行引擎，负责创建和管理测试工作进程，确保测试在独立、隔离的环境中并行执行。该模块是测试执行的核心，提供了完整的进程生命周期管理、编译支持和通信机制。

[![npm version](https://badge.fury.io/js/@testring/test-worker.svg)](https://www.npmjs.com/package/@testring/test-worker)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## 功能概述

测试工作进程模块是 testring 框架的执行核心，提供了：
- 多进程并行测试执行
- 完整的进程隔离和资源管理
- 灵活的代码编译和插件支持
- 高效的进程间通信机制
- 完善的错误处理和恢复策略
- 调试和开发支持

## 主要特性

### 进程管理
- 智能的工作进程创建和销毁
- 支持本地模式和多进程模式
- 进程资源监控和管理
- 异常进程的自动恢复

### 代码编译
- 支持 TypeScript 和 JavaScript
- 可插拔的编译器系统
- 动态代码加载和执行
- 编译缓存和优化

### 通信机制
- 高效的进程间通信（IPC）
- 双向消息传递
- 序列化和反序列化支持
- 通信错误处理和重试

### 隔离环境
- 每个测试在独立进程中运行
- 避免测试间的相互干扰
- 独立的内存空间和资源
- 完整的环境清理

## 安装

```bash
npm install @testring/test-worker
```

## 核心架构

### TestWorker 类
主要的工作进程管理器，负责创建和配置工作进程实例：

```typescript
class TestWorker extends PluggableModule {
  constructor(
    transport: ITransport,
    workerConfig: ITestWorkerConfig
  )
  
  spawn(): ITestWorkerInstance
}
```

### TestWorkerInstance 接口
工作进程实例的抽象接口：

```typescript
interface ITestWorkerInstance {
  getWorkerID(): string;
  execute(
    file: IFile,
    parameters: any,
    envParameters: any
  ): Promise<void>;
  kill(signal?: string): Promise<void>;
}
```

### 工作进程类型

#### 1. TestWorkerInstance (多进程模式)
真正的子进程实现，在独立的 Node.js 进程中执行测试。

#### 2. TestWorkerLocal (本地模式)
在当前进程中执行测试的实现，主要用于调试。

## 基本用法

### 创建和配置工作进程

```typescript
import { TestWorker } from '@testring/test-worker';
import { Transport } from '@testring/transport';

// 创建传输层
const transport = new Transport();

// 配置工作进程
const workerConfig = {
  debug: false,
  compilerOptions: {
    target: 'ES2019',
    module: 'commonjs'
  }
};

// 创建工作进程管理器
const testWorker = new TestWorker(transport, workerConfig);

// 生成工作进程实例
const workerInstance = testWorker.spawn();

console.log(`工作进程ID: ${workerInstance.getWorkerID()}`);
```

### 执行单个测试

```typescript
// 测试文件对象
const testFile = {
  path: './tests/example.spec.js',
  content: `
    describe('示例测试', () => {
      it('应该通过基本测试', () => {
        expect(1 + 1).toBe(2);
      });
    });
  `
};

// 测试参数
const parameters = {
  timeout: 30000,
  retries: 3
};

// 环境参数
const envParameters = {
  baseUrl: 'https://example.com',
  apiKey: 'test-api-key'
};

try {
  // 执行测试
  await workerInstance.execute(testFile, parameters, envParameters);
  console.log('测试执行成功');
} catch (error) {
  console.error('测试执行失败:', error);
} finally {
  // 清理工作进程
  await workerInstance.kill();
}
```

### 并行执行多个测试

```typescript
import { TestWorker } from '@testring/test-worker';

async function runTestsInParallel(testFiles, workerCount = 4) {
  const testWorker = new TestWorker(transport, workerConfig);
  
  // 创建工作进程池
  const workers = Array.from({ length: workerCount }, () => testWorker.spawn());
  
  try {
    // 分配测试到不同的工作进程
    const promises = testFiles.map((testFile, index) => {
      const worker = workers[index % workerCount];
      return worker.execute(testFile, parameters, envParameters);
    });
    
    // 等待所有测试完成
    const results = await Promise.allSettled(promises);
    
    // 分析结果
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`测试完成: ${successful} 成功, ${failed} 失败`);
    
    return results;
  } finally {
    // 清理所有工作进程
    await Promise.all(workers.map(worker => worker.kill()));
  }
}

// 使用示例
const testFiles = [
  { path: './tests/test1.spec.js', content: '...' },
  { path: './tests/test2.spec.js', content: '...' },
  { path: './tests/test3.spec.js', content: '...' },
  { path: './tests/test4.spec.js', content: '...' }
];

await runTestsInParallel(testFiles, 2);
```

## 配置选项

### TestWorkerConfig 接口

```typescript
interface ITestWorkerConfig {
  // 调试模式
  debug?: boolean;
  
  // 编译器选项
  compilerOptions?: {
    target?: string;
    module?: string;
    strict?: boolean;
    esModuleInterop?: boolean;
  };
  
  // 进程选项
  processOptions?: {
    execArgv?: string[];        // Node.js 执行参数
    env?: object;               // 环境变量
    timeout?: number;           // 进程超时时间
  };
  
  // 工作目录
  cwd?: string;
  
  // 最大内存限制
  maxMemory?: string;
  
  // 插件配置
  plugins?: string[];
}
```

### 配置示例

#### 开发环境配置
```typescript
const devConfig = {
  debug: true,                          // 启用调试输出
  compilerOptions: {
    target: 'ES2019',
    module: 'commonjs',
    strict: false,                      // 宽松的类型检查
    esModuleInterop: true
  },
  processOptions: {
    execArgv: ['--inspect=9229'],       // 启用调试器
    timeout: 60000                      // 较长的超时时间
  }
};
```

#### 生产环境配置
```typescript
const prodConfig = {
  debug: false,
  compilerOptions: {
    target: 'ES2019',
    module: 'commonjs',
    strict: true,                       // 严格的类型检查
    esModuleInterop: true
  },
  processOptions: {
    timeout: 30000,                     // 较短的超时时间
    env: {
      NODE_ENV: 'production'
    }
  },
  maxMemory: '2GB'                      // 内存限制
};
```

#### CI/CD 环境配置
```typescript
const ciConfig = {
  debug: false,
  compilerOptions: {
    target: 'ES2019',
    module: 'commonjs',
    strict: true
  },
  processOptions: {
    timeout: 45000,
    env: {
      NODE_ENV: 'test',
      CI: 'true'
    }
  }
};
```

## 工作模式

### 多进程模式（默认）

在多进程模式下，每个测试在独立的 Node.js 子进程中执行：

```typescript
// 多进程模式配置
const multiProcessConfig = {
  workerLimit: 4,                       // 创建4个工作进程
  restartWorker: true,                  // 每个测试后重启进程
  debug: false
};

const testWorker = new TestWorker(transport, multiProcessConfig);

// 创建工作进程实例（会启动子进程）
const worker1 = testWorker.spawn();    // 子进程 1
const worker2 = testWorker.spawn();    // 子进程 2
const worker3 = testWorker.spawn();    // 子进程 3
const worker4 = testWorker.spawn();    // 子进程 4

// 并行执行测试
await Promise.all([
  worker1.execute(test1, params, env),
  worker2.execute(test2, params, env),
  worker3.execute(test3, params, env),
  worker4.execute(test4, params, env)
]);
```

**优点：**
- 完全的进程隔离
- 真正的并行执行
- 错误不会影响其他测试
- 可以利用多核CPU

**缺点：**
- 进程创建开销
- 内存使用较多
- 调试相对困难

### 本地模式

在本地模式下，所有测试在当前进程中顺序执行：

```typescript
// 本地模式配置
const localConfig = {
  workerLimit: 'local',                 // 本地模式
  debug: true                           // 便于调试
};

const testWorker = new TestWorker(transport, localConfig);

// 创建本地工作进程实例
const localWorker = testWorker.spawn();

// 在当前进程中执行测试
await localWorker.execute(testFile, params, env);
```

**优点：**
- 启动速度快
- 调试友好
- 内存使用少
- 错误堆栈清晰

**缺点：**
- 没有进程隔离
- 无法并行执行
- 测试间可能相互影响

## 代码编译系统

### 编译器插件

TestWorker 支持可插拔的编译器系统：

```typescript
// 自定义编译器插件
const customCompilerPlugin = (pluginAPI) => {
  const testWorker = pluginAPI.getTestWorker();
  
  if (testWorker) {
    // 编译前处理
    testWorker.getHook('beforeCompile')?.writeHook('customPreprocess', async (filePaths) => {
      console.log('编译前预处理:', filePaths);
      return filePaths;
    });
    
    // 自定义编译逻辑
    testWorker.getHook('compile')?.writeHook('customCompiler', async (source, filename) => {
      console.log(`编译文件: ${filename}`);
      
      // TypeScript 编译
      if (filename.endsWith('.ts')) {
        return compileTypeScript(source, filename);
      }
      
      // Babel 编译
      if (filename.endsWith('.jsx')) {
        return compileBabel(source, filename);
      }
      
      // 直接返回 JavaScript
      return source;
    });
  }
};

// 注册编译器插件
const testWorker = new TestWorker(transport, {
  plugins: [customCompilerPlugin]
});
```

### TypeScript 支持

```typescript
// TypeScript 编译配置
const tsConfig = {
  compilerOptions: {
    target: 'ES2019',
    module: 'commonjs',
    strict: true,
    esModuleInterop: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    resolveJsonModule: true,
    allowSyntheticDefaultImports: true
  }
};

// TypeScript 编译器插件
const typescriptPlugin = (pluginAPI) => {
  const testWorker = pluginAPI.getTestWorker();
  
  testWorker?.getHook('compile')?.writeHook('typescript', async (source, filename) => {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
      const ts = require('typescript');
      
      const result = ts.transpile(source, tsConfig.compilerOptions, filename);
      return result;
    }
    
    return source;
  });
};
```

### Babel 支持

```typescript
// Babel 编译器插件
const babelPlugin = (pluginAPI) => {
  const testWorker = pluginAPI.getTestWorker();
  
  testWorker?.getHook('compile')?.writeHook('babel', async (source, filename) => {
    if (filename.endsWith('.jsx') || filename.endsWith('.js')) {
      const babel = require('@babel/core');
      
      const result = babel.transform(source, {
        filename,
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-proposal-decorators'
        ]
      });
      
      return result.code;
    }
    
    return source;
  });
};
```

## 进程间通信

### 通信协议

工作进程使用基于消息的通信协议：

```typescript
// 消息类型定义
interface WorkerMessage {
  type: 'execute' | 'kill' | 'ping' | 'result' | 'error';
  payload?: any;
  id?: string;
}

// 执行测试消息
const executeMessage: WorkerMessage = {
  type: 'execute',
  id: 'test-123',
  payload: {
    file: testFile,
    parameters: testParams,
    envParameters: envParams
  }
};

// 测试结果消息
const resultMessage: WorkerMessage = {
  type: 'result',
  id: 'test-123',
  payload: {
    success: true,
    duration: 1500,
    output: 'Test passed successfully'
  }
};

// 错误消息
const errorMessage: WorkerMessage = {
  type: 'error',
  id: 'test-123',
  payload: {
    error: 'AssertionError: Expected true, got false',
    stack: '...'
  }
};
```

### 通信示例

```typescript
// 自定义工作进程通信处理
class CustomTestWorkerInstance {
  private messageHandlers = new Map();
  
  constructor(private transport: ITransport) {
    this.setupMessageHandlers();
  }
  
  private setupMessageHandlers() {
    // 处理测试结果
    this.transport.on('message', (message: WorkerMessage) => {
      switch (message.type) {
        case 'result':
          this.handleTestResult(message);
          break;
        case 'error':
          this.handleTestError(message);
          break;
        case 'progress':
          this.handleTestProgress(message);
          break;
      }
    });
  }
  
  private handleTestResult(message: WorkerMessage) {
    console.log(`测试 ${message.id} 完成:`, message.payload);
    
    // 触发结果处理器
    const handler = this.messageHandlers.get(message.id);
    if (handler) {
      handler.resolve(message.payload);
      this.messageHandlers.delete(message.id);
    }
  }
  
  private handleTestError(message: WorkerMessage) {
    console.error(`测试 ${message.id} 失败:`, message.payload);
    
    // 触发错误处理器
    const handler = this.messageHandlers.get(message.id);
    if (handler) {
      handler.reject(new Error(message.payload.error));
      this.messageHandlers.delete(message.id);
    }
  }
  
  private handleTestProgress(message: WorkerMessage) {
    console.log(`测试 ${message.id} 进度:`, message.payload);
  }
  
  async execute(file: IFile, parameters: any, envParameters: any): Promise<any> {
    const testId = this.generateTestId();
    
    return new Promise((resolve, reject) => {
      // 注册消息处理器
      this.messageHandlers.set(testId, { resolve, reject });
      
      // 发送执行消息
      this.transport.send({
        type: 'execute',
        id: testId,
        payload: { file, parameters, envParameters }
      });
      
      // 设置超时
      setTimeout(() => {
        if (this.messageHandlers.has(testId)) {
          this.messageHandlers.delete(testId);
          reject(new Error('测试执行超时'));
        }
      }, parameters.timeout || 30000);
    });
  }
  
  private generateTestId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## 高级用法

### 工作进程池管理

```typescript
class TestWorkerPool {
  private workers: ITestWorkerInstance[] = [];
  private availableWorkers: ITestWorkerInstance[] = [];
  private busyWorkers = new Set<ITestWorkerInstance>();
  private testQueue: Array<{
    file: IFile;
    parameters: any;
    envParameters: any;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = [];
  
  constructor(
    private testWorker: TestWorker,
    private poolSize: number = 4
  ) {
    this.initializePool();
  }
  
  private async initializePool() {
    // 创建工作进程池
    for (let i = 0; i < this.poolSize; i++) {
      const worker = this.testWorker.spawn();
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }
  
  async execute(file: IFile, parameters: any, envParameters: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // 添加到队列
      this.testQueue.push({ file, parameters, envParameters, resolve, reject });
      
      // 尝试执行下一个测试
      this.executeNext();
    });
  }
  
  private async executeNext() {
    if (this.testQueue.length === 0 || this.availableWorkers.length === 0) {
      return;
    }
    
    const worker = this.availableWorkers.pop()!;
    const testTask = this.testQueue.shift()!;
    
    this.busyWorkers.add(worker);
    
    try {
      const result = await worker.execute(
        testTask.file,
        testTask.parameters,
        testTask.envParameters
      );
      
      testTask.resolve(result);
    } catch (error) {
      testTask.reject(error);
    } finally {
      // 归还工作进程
      this.busyWorkers.delete(worker);
      this.availableWorkers.push(worker);
      
      // 执行下一个测试
      this.executeNext();
    }
  }
  
  async destroy() {
    // 清理所有工作进程
    await Promise.all(this.workers.map(worker => worker.kill()));
    this.workers.length = 0;
    this.availableWorkers.length = 0;
    this.busyWorkers.clear();
  }
  
  getStats() {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.busyWorkers.size,
      queuedTests: this.testQueue.length
    };
  }
}

// 使用示例
const pool = new TestWorkerPool(testWorker, 4);

try {
  const results = await Promise.all([
    pool.execute(test1, params, env),
    pool.execute(test2, params, env),
    pool.execute(test3, params, env),
    pool.execute(test4, params, env)
  ]);
  
  console.log('所有测试完成:', results);
} finally {
  await pool.destroy();
}
```

### 动态工作进程管理

```typescript
class DynamicTestWorkerManager {
  private workers = new Map<string, ITestWorkerInstance>();
  private workerStats = new Map<string, {
    testsExecuted: number;
    averageDuration: number;
    lastActivity: number;
  }>();
  
  constructor(
    private testWorker: TestWorker,
    private minWorkers: number = 2,
    private maxWorkers: number = 8
  ) {
    this.maintainMinWorkers();
    this.startWorkerMonitoring();
  }
  
  private async maintainMinWorkers() {
    while (this.workers.size < this.minWorkers) {
      await this.createWorker();
    }
  }
  
  private async createWorker(): Promise<string> {
    const worker = this.testWorker.spawn();
    const workerId = worker.getWorkerID();
    
    this.workers.set(workerId, worker);
    this.workerStats.set(workerId, {
      testsExecuted: 0,
      averageDuration: 0,
      lastActivity: Date.now()
    });
    
    console.log(`创建工作进程: ${workerId}`);
    return workerId;
  }
  
  private async removeWorker(workerId: string) {
    const worker = this.workers.get(workerId);
    if (worker) {
      await worker.kill();
      this.workers.delete(workerId);
      this.workerStats.delete(workerId);
      console.log(`移除工作进程: ${workerId}`);
    }
  }
  
  private startWorkerMonitoring() {
    setInterval(() => {
      this.cleanupIdleWorkers();
      this.scaleWorkers();
    }, 10000); // 每10秒检查一次
  }
  
  private cleanupIdleWorkers() {
    const now = Date.now();
    const idleThreshold = 60000; // 1分钟
    
    for (const [workerId, stats] of this.workerStats) {
      if (now - stats.lastActivity > idleThreshold && this.workers.size > this.minWorkers) {
        this.removeWorker(workerId);
      }
    }
  }
  
  private async scaleWorkers() {
    const queueLength = this.getQueueLength(); // 假设有方法获取队列长度
    const activeWorkers = this.getActiveWorkerCount();
    
    // 如果队列很长，增加工作进程
    if (queueLength > activeWorkers * 2 && this.workers.size < this.maxWorkers) {
      await this.createWorker();
    }
    
    // 如果工作进程太多且队列为空，减少工作进程
    if (queueLength === 0 && this.workers.size > this.minWorkers) {
      const idleWorkers = Array.from(this.workers.keys())
        .filter(id => this.isWorkerIdle(id))
        .slice(0, this.workers.size - this.minWorkers);
      
      for (const workerId of idleWorkers) {
        await this.removeWorker(workerId);
      }
    }
  }
  
  async execute(file: IFile, parameters: any, envParameters: any): Promise<any> {
    // 选择最优的工作进程
    const workerId = this.selectOptimalWorker();
    const worker = this.workers.get(workerId);
    
    if (!worker) {
      throw new Error('没有可用的工作进程');
    }
    
    const startTime = Date.now();
    const stats = this.workerStats.get(workerId)!;
    
    try {
      const result = await worker.execute(file, parameters, envParameters);
      
      // 更新统计信息
      const duration = Date.now() - startTime;
      stats.testsExecuted++;
      stats.averageDuration = (stats.averageDuration + duration) / 2;
      stats.lastActivity = Date.now();
      
      return result;
    } catch (error) {
      stats.lastActivity = Date.now();
      throw error;
    }
  }
  
  private selectOptimalWorker(): string {
    // 选择平均执行时间最短的工作进程
    let bestWorker = '';
    let bestScore = Infinity;
    
    for (const [workerId, stats] of this.workerStats) {
      const score = stats.averageDuration || 1000; // 默认1秒
      if (score < bestScore) {
        bestScore = score;
        bestWorker = workerId;
      }
    }
    
    return bestWorker || Array.from(this.workers.keys())[0];
  }
  
  private getActiveWorkerCount(): number {
    // 获取正在工作的进程数量
    return Array.from(this.workers.keys())
      .filter(id => !this.isWorkerIdle(id))
      .length;
  }
  
  private isWorkerIdle(workerId: string): boolean {
    const stats = this.workerStats.get(workerId);
    return stats ? Date.now() - stats.lastActivity > 5000 : true;
  }
  
  private getQueueLength(): number {
    // 这里应该返回实际的队列长度
    return 0;
  }
  
  async destroy() {
    await Promise.all(
      Array.from(this.workers.values()).map(worker => worker.kill())
    );
    this.workers.clear();
    this.workerStats.clear();
  }
}
```

## 错误处理和恢复

### 进程异常处理

```typescript
class RobustTestWorker extends TestWorker {
  private failedWorkers = new Set<string>();
  private maxRetries = 3;
  
  spawn(): ITestWorkerInstance {
    const worker = super.spawn();
    const workerId = worker.getWorkerID();
    
    // 包装工作进程以添加错误处理
    return this.wrapWorkerWithErrorHandling(worker, workerId);
  }
  
  private wrapWorkerWithErrorHandling(
    worker: ITestWorkerInstance,
    workerId: string
  ): ITestWorkerInstance {
    const originalExecute = worker.execute.bind(worker);
    
    worker.execute = async (file: IFile, parameters: any, envParameters: any) => {
      let retryCount = 0;
      
      while (retryCount < this.maxRetries) {
        try {
          return await originalExecute(file, parameters, envParameters);
        } catch (error) {
          retryCount++;
          
          if (this.isRecoverableError(error)) {
            console.warn(`工作进程 ${workerId} 出现可恢复错误，重试 ${retryCount}/${this.maxRetries}:`, error.message);
            
            // 等待一段时间后重试
            await this.delay(1000 * retryCount);
            
            // 如果是进程崩溃，重新创建工作进程
            if (this.isProcessCrashError(error)) {
              await this.recreateWorker(worker, workerId);
            }
          } else {
            // 不可恢复的错误，直接抛出
            throw error;
          }
        }
      }
      
      // 重试次数用完，标记为失败
      this.failedWorkers.add(workerId);
      throw new Error(`工作进程 ${workerId} 执行失败，已达到最大重试次数`);
    };
    
    return worker;
  }
  
  private isRecoverableError(error: Error): boolean {
    const recoverablePatterns = [
      'ECONNRESET',
      'EPIPE',
      'process exited',
      'worker terminated'
    ];
    
    return recoverablePatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }
  
  private isProcessCrashError(error: Error): boolean {
    return error.message.includes('process exited') || 
           error.message.includes('worker terminated');
  }
  
  private async recreateWorker(
    worker: ITestWorkerInstance,
    workerId: string
  ): Promise<void> {
    try {
      // 尝试清理旧进程
      await worker.kill();
    } catch (cleanupError) {
      console.warn(`清理工作进程 ${workerId} 失败:`, cleanupError);
    }
    
    // 创建新的工作进程实例
    const newWorker = super.spawn();
    
    // 替换方法实现（这里需要根据实际实现调整）
    Object.setPrototypeOf(worker, Object.getPrototypeOf(newWorker));
    Object.assign(worker, newWorker);
    
    console.log(`工作进程 ${workerId} 已重新创建`);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getFailedWorkers(): string[] {
    return Array.from(this.failedWorkers);
  }
  
  resetFailedWorkers(): void {
    this.failedWorkers.clear();
  }
}
```

### 内存泄漏检测

```typescript
class MemoryMonitoredTestWorker extends TestWorker {
  private memoryThreshold = 500 * 1024 * 1024; // 500MB
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  spawn(): ITestWorkerInstance {
    const worker = super.spawn();
    const workerId = worker.getWorkerID();
    
    // 开始内存监控
    this.startMemoryMonitoring(worker, workerId);
    
    return worker;
  }
  
  private startMemoryMonitoring(
    worker: ITestWorkerInstance,
    workerId: string
  ): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        const memoryUsage = await this.getWorkerMemoryUsage(worker);
        
        if (memoryUsage > this.memoryThreshold) {
          console.warn(`工作进程 ${workerId} 内存使用过高: ${Math.round(memoryUsage / 1024 / 1024)}MB`);
          
          // 尝试垃圾回收
          await this.triggerGarbageCollection(worker);
          
          // 再次检查内存使用
          const newMemoryUsage = await this.getWorkerMemoryUsage(worker);
          
          if (newMemoryUsage > this.memoryThreshold * 0.8) {
            console.error(`工作进程 ${workerId} 可能存在内存泄漏，重启进程`);
            await this.restartWorker(worker, workerId);
          }
        }
      } catch (error) {
        console.error(`监控工作进程 ${workerId} 内存失败:`, error);
      }
    }, 10000); // 每10秒检查一次
  }
  
  private async getWorkerMemoryUsage(worker: ITestWorkerInstance): Promise<number> {
    // 这里需要实现获取工作进程内存使用的逻辑
    // 可以通过进程间通信获取
    return 0; // 占位实现
  }
  
  private async triggerGarbageCollection(worker: ITestWorkerInstance): Promise<void> {
    // 发送垃圾回收命令到工作进程
    // 这需要在工作进程中实现相应的处理逻辑
  }
  
  private async restartWorker(worker: ITestWorkerInstance, workerId: string): Promise<void> {
    try {
      await worker.kill();
      // 这里需要重新创建工作进程的逻辑
      console.log(`工作进程 ${workerId} 已重启`);
    } catch (error) {
      console.error(`重启工作进程 ${workerId} 失败:`, error);
    }
  }
  
  stopMemoryMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}
```

## 调试和开发支持

### 调试模式

```typescript
class DebuggableTestWorker extends TestWorker {
  private debugMode: boolean;
  private debugPort = 9229;
  
  constructor(transport: ITransport, config: ITestWorkerConfig & { debug?: boolean }) {
    super(transport, config);
    this.debugMode = config.debug || false;
  }
  
  spawn(): ITestWorkerInstance {
    if (this.debugMode) {
      return this.spawnDebugWorker();
    }
    
    return super.spawn();
  }
  
  private spawnDebugWorker(): ITestWorkerInstance {
    const debugConfig = {
      ...this.workerConfig,
      processOptions: {
        ...this.workerConfig.processOptions,
        execArgv: [
          `--inspect=${this.debugPort}`,
          '--inspect-brk'  // 在启动时暂停
        ]
      }
    };
    
    console.log(`启动调试模式工作进程，调试端口: ${this.debugPort}`);
    console.log(`使用 Chrome DevTools 连接: chrome://inspect`);
    
    this.debugPort++; // 为下一个进程分配新端口
    
    // 创建带调试配置的工作进程
    return new TestWorkerInstance(
      this.transport,
      this.compile,
      this.beforeCompile,
      debugConfig
    );
  }
}

// 使用调试模式
const debugWorker = new DebuggableTestWorker(transport, {
  debug: true,
  compilerOptions: {
    target: 'ES2019',
    sourceMap: true  // 启用源码映射
  }
});

// 在调试模式下执行测试
const worker = debugWorker.spawn();
await worker.execute(testFile, parameters, envParameters);
```

### 性能分析

```typescript
class ProfilingTestWorker extends TestWorker {
  private profilingEnabled: boolean;
  private profileData = new Map<string, any>();
  
  constructor(transport: ITransport, config: ITestWorkerConfig & { profiling?: boolean }) {
    super(transport, config);
    this.profilingEnabled = config.profiling || false;
  }
  
  spawn(): ITestWorkerInstance {
    const worker = super.spawn();
    
    if (this.profilingEnabled) {
      return this.wrapWorkerWithProfiling(worker);
    }
    
    return worker;
  }
  
  private wrapWorkerWithProfiling(worker: ITestWorkerInstance): ITestWorkerInstance {
    const originalExecute = worker.execute.bind(worker);
    const workerId = worker.getWorkerID();
    
    worker.execute = async (file: IFile, parameters: any, envParameters: any) => {
      const startTime = process.hrtime.bigint();
      const startMemory = process.memoryUsage();
      
      try {
        const result = await originalExecute(file, parameters, envParameters);
        
        const endTime = process.hrtime.bigint();
        const endMemory = process.memoryUsage();
        
        // 记录性能数据
        this.recordPerformanceData(workerId, file.path, {
          duration: Number(endTime - startTime) / 1000000, // 转换为毫秒
          memoryDelta: {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            external: endMemory.external - startMemory.external
          },
          success: true
        });
        
        return result;
      } catch (error) {
        const endTime = process.hrtime.bigint();
        
        this.recordPerformanceData(workerId, file.path, {
          duration: Number(endTime - startTime) / 1000000,
          success: false,
          error: error.message
        });
        
        throw error;
      }
    };
    
    return worker;
  }
  
  private recordPerformanceData(workerId: string, testPath: string, data: any): void {
    const key = `${workerId}:${testPath}`;
    this.profileData.set(key, {
      ...data,
      timestamp: Date.now()
    });
  }
  
  getPerformanceReport(): any {
    const report = {
      summary: {
        totalTests: this.profileData.size,
        successfulTests: 0,
        failedTests: 0,
        averageDuration: 0,
        totalMemoryUsed: 0
      },
      details: []
    };
    
    let totalDuration = 0;
    let totalMemory = 0;
    
    for (const [key, data] of this.profileData) {
      const [workerId, testPath] = key.split(':');
      
      if (data.success) {
        report.summary.successfulTests++;
      } else {
        report.summary.failedTests++;
      }
      
      totalDuration += data.duration;
      if (data.memoryDelta) {
        totalMemory += data.memoryDelta.heapUsed;
      }
      
      report.details.push({
        workerId,
        testPath,
        ...data
      });
    }
    
    report.summary.averageDuration = totalDuration / this.profileData.size;
    report.summary.totalMemoryUsed = totalMemory;
    
    // 按执行时间排序
    report.details.sort((a, b) => b.duration - a.duration);
    
    return report;
  }
  
  exportPerformanceData(filename: string): void {
    const report = this.getPerformanceReport();
    const fs = require('fs');
    
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`性能报告已导出到: ${filename}`);
  }
}

// 使用性能分析
const profilingWorker = new ProfilingTestWorker(transport, {
  profiling: true
});

// 执行测试
const worker = profilingWorker.spawn();
await worker.execute(testFile, parameters, envParameters);

// 生成性能报告
const report = profilingWorker.getPerformanceReport();
console.log('性能统计:', report.summary);

// 导出详细报告
profilingWorker.exportPerformanceData('./performance-report.json');
```

## 最佳实践

### 1. 工作进程配置
- 根据 CPU 核心数合理设置工作进程数量
- 在开发环境使用本地模式便于调试
- 生产环境启用进程重启确保隔离性
- 设置合适的内存限制避免系统资源耗尽

### 2. 代码编译
- 为不同文件类型配置相应的编译器
- 启用源码映射便于调试
- 使用编译缓存提高性能
- 配置合适的 TypeScript 选项

### 3. 错误处理
- 实现完善的错误分类和恢复机制
- 监控工作进程的健康状态
- 提供详细的错误上下文信息
- 建立进程重启和故障转移策略

### 4. 性能优化
- 使用工作进程池减少创建开销
- 实现智能的负载均衡算法
- 监控内存使用避免泄漏
- 定期清理和重启长时间运行的进程

### 5. 调试和监控
- 在开发环境启用详细的调试功能
- 收集和分析进程执行数据
- 实现性能监控和分析工具
- 建立完整的日志记录系统

## 故障排除

### 常见问题

#### 工作进程启动失败
```bash
Error: spawn ENOENT
```
解决方案：检查 Node.js 路径和权限，确认系统环境配置正确。

#### 进程间通信失败
```bash
Error: IPC channel closed
```
解决方案：检查进程是否正常运行，增加通信重试机制。

#### 内存使用过高
```bash
Error: out of memory
```
解决方案：减少并发进程数量，启用内存监控和垃圾回收。

### 调试技巧

```typescript
// 启用详细调试
const debugConfig = {
  debug: true,
  workerLimit: 'local',
  compilerOptions: {
    sourceMap: true
  },
  processOptions: {
    execArgv: ['--inspect=9229']
  }
};

// 监控工作进程状态
worker.on('error', (error) => {
  console.error('工作进程错误:', error);
});

worker.on('exit', (code, signal) => {
  console.log(`工作进程退出: code=${code}, signal=${signal}`);
});
```

## 依赖

- `@testring/pluggable-module` - 插件系统基础
- `@testring/child-process` - 子进程管理
- `@testring/transport` - 进程间通信
- `@testring/logger` - 日志记录
- `@testring/types` - 类型定义

## 相关模块

- `@testring/test-run-controller` - 测试运行控制器
- `@testring/sandbox` - 代码沙箱
- `@testring/cli` - 命令行界面

## 许可证

MIT License