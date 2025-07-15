# @testring/test-utils

测试工具集模块，作为 testring 框架的测试辅助核心，提供完整的测试模拟对象、文件操作工具和单元测试支持能力。该模块集成了传输层模拟、测试工作器模拟、浏览器代理模拟和文件系统操作工具，为测试开发和测试自动化提供全面的解决方案。

[![npm version](https://badge.fury.io/js/@testring/test-utils.svg)](https://www.npmjs.com/package/@testring/test-utils)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## 功能概述

测试工具集模块是 testring 框架的测试辅助核心，提供了：
- 完整的传输层模拟和消息通信模拟
- 智能的测试工作器模拟和生命周期管理
- 全面的浏览器代理控制器模拟
- 高效的文件系统操作和路径解析工具
- **插件兼容性测试工具 (PluginCompatibilityTester)**
- **完整的单元测试套件和集成测试**
- 类型安全的 TypeScript 支持和接口定义
- 灵活的测试场景配置和模拟参数
- 并发安全和错误处理机制
- 面向对象的模拟设计和可扩展架构

## 主要特性

### 传输层模拟
- 完整的 ITransport 接口实现和模拟
- 支持各种消息类型和传输模式
- 事件驱动的消息处理和监听机制
- 多进程间通信模拟和测试支持

### 测试工作器模拟
- 完整的测试工作器生命周期模拟
- 可配置的执行延迟和失败情景
- 详细的执行统计和状态追踪
- 并发执行和资源管理模拟

### 浏览器代理模拟
- 完整的浏览器代理控制器模拟
- 支持各种浏览器操作和事件模拟
- 灵活的测试场景配置和模拟参数
- 错误注入和异常情景测试支持

### 文件系统工具
- 高效的文件读取和路径解析工具
- 支持异步文件操作和错误处理
- 灵活的路径配置和相对路径支持
- 跨平台兼容性和编码支持

### 插件兼容性测试
- **PluginCompatibilityTester** - 浏览器代理插件兼容性测试工具
- 支持 Selenium 和 Playwright 驱动程序兼容性测试
- 完整的 IBrowserProxyPlugin 接口方法验证
- 可配置的测试跳过和自定义超时设置
- 详细的测试结果报告和错误处理

### 单元测试套件
- **完整的单元测试覆盖** - 包含所有核心功能的单元测试
- **集成测试示例** - 展示如何使用测试工具的集成测试
- **使用示例和文档** - 详细的使用模式和最佳实践
- **Mock 工具集** - 可重用的模拟对象和测试辅助工具

## 安装

```bash
npm install @testring/test-utils
```

或使用 yarn：

```bash
yarn add @testring/test-utils
```

## 核心架构

### TransportMock 类
传输层模拟实现，继承自 `EventEmitter`：

```typescript
class TransportMock extends EventEmitter implements ITransport {
  // 消息广播方法
  public broadcast<T>(messageType: string, payload: T): void
  public broadcastFrom<T>(messageType: string, payload: T, processID: string): void
  public broadcastLocal<T>(messageType: string, payload: T): void
  public broadcastUniversally<T>(messageType: string, payload: T): void
  
  // 消息发送和监听
  public send<T>(src: string, messageType: string, payload: T): Promise<void>
  public on<T>(messageType: string, callback: (m: T, source?: string) => void): Function
  public once<T>(messageType: string, callback: (m: T, source?: string) => void): Function
  public onceFrom<T>(processID: string, messageType: string, callback: Function): Function
  
  // 进程管理
  public registerChild(processID: string, process: IWorkerEmitter): void
  public isChildProcess(): boolean
}
```

### TestWorkerMock 类
测试工作器模拟实现：

```typescript
class TestWorkerMock implements ITestWorker {
  constructor(
    shouldFail?: boolean,     // 是否模拟失败
    executionDelay?: number   // 执行延迟时间
  )
  
  // 核心方法
  public spawn(): ITestWorkerInstance
  
  // 模拟控制方法
  public $getSpawnedCount(): number
  public $getKillCallsCount(): number
  public $getExecutionCallsCount(): number
  public $getInstanceName(): string
  public $getErrorInstance(): any
}

class TestWorkerMockInstance implements ITestWorkerInstance {
  public getWorkerID(): string
  public execute(): Promise<void>
  public kill(): Promise<void>
  
  // 测试状态查询
  public $getKillCallsCount(): number
  public $getExecuteCallsCount(): number
  public $getErrorInstance(): any
}
```

### 文件工具函数
```typescript
// 文件路径解析工厂
function fileResolverFactory(...root: string[]): (...file: string[]) => string

// 文件读取工厂
function fileReaderFactory(...root: string[]): (source: string) => Promise<string>
```

## 基本用法

### 传输层模拟使用

```typescript
import { TransportMock } from '@testring/test-utils';

// 创建传输层模拟
const transportMock = new TransportMock();

// 监听消息
transportMock.on('test.start', (payload, source) => {
  console.log('测试开始:', payload, '来源:', source);
});

transportMock.on('test.complete', (payload) => {
  console.log('测试完成:', payload);
});

// 测试消息广播
transportMock.broadcast('test.start', {
  testName: 'example-test',
  timestamp: Date.now()
});

// 测试指向消息
transportMock.send('worker-1', 'test.execute', {
  testFile: './test/example.test.js'
});

// 测试来源消息
transportMock.broadcastFrom('test.result', {
  success: true,
  duration: 1500
}, 'worker-1');

// 清理监听器
const removeListener = transportMock.on('test.error', (error) => {
  console.error('测试错误:', error);
});

// 移除监听器
removeListener();

// 单次监听
transportMock.once('test.finish', () => {
  console.log('测试结束（仅触发一次）');
});

// 来源特定监听
transportMock.onceFrom('worker-2', 'test.status', (status) => {
  console.log('工作器 2 状态:', status);
});
```

### 测试工作器模拟使用

```typescript
import { TestWorkerMock } from '@testring/test-utils';

// 创建成功的测试工作器模拟
const successWorker = new TestWorkerMock(false, 1000); // 不失败，1秒延迟

// 创建失败的测试工作器模拟
const failingWorker = new TestWorkerMock(true, 500); // 失败，0.5秒延迟

// 创建即时测试工作器模拟
const instantWorker = new TestWorkerMock(false, 0); // 不失败，无延迟

// 生成工作器实例
const worker1 = successWorker.spawn();
const worker2 = failingWorker.spawn();
const worker3 = instantWorker.spawn();

console.log('工作器 ID:', worker1.getWorkerID());

// 测试成功执行
async function testSuccessfulExecution() {
  try {
    console.log('开始执行成功测试...');
    await worker1.execute();
    console.log('测试执行成功');
  } catch (error) {
    console.error('测试执行失败:', error);
  }
}

// 测试失败执行
async function testFailedExecution() {
  try {
    console.log('开始执行失败测试...');
    await worker2.execute();
    console.log('意外成功！');
  } catch (error) {
    console.log('按预期失败:', error);
  }
}

// 测试工作器管理
async function testWorkerManagement() {
  // 执行多个任务
  await worker1.execute();
  await worker3.execute();
  
  // 查看统计信息
  console.log('生成实例数:', successWorker.$getSpawnedCount());
  console.log('执行次数:', successWorker.$getExecutionCallsCount());
  console.log('终止次数:', successWorker.$getKillCallsCount());
  
  // 终止工作器
  await worker1.kill();
  await worker3.kill();
  
  console.log('终止后统计:', successWorker.$getKillCallsCount());
}

// 执行测试
testSuccessfulExecution();
testFailedExecution();
testWorkerManagement();
```

### 文件系统工具使用

```typescript
import { fileReaderFactory, fileResolverFactory } from '@testring/test-utils';
import * as path from 'path';

// 创建路径解析器
const resolveProjectPath = fileResolverFactory(__dirname, '..');
const resolveTestPath = fileResolverFactory(__dirname, '../test');
const resolveSrcPath = fileResolverFactory(__dirname, '../src');

// 使用路径解析器
const configPath = resolveProjectPath('tsconfig.json');
const testFile = resolveTestPath('example.test.ts');
const sourceFile = resolveSrcPath('index.ts');

console.log('配置文件路径:', configPath);
console.log('测试文件路径:', testFile);
console.log('源码文件路径:', sourceFile);

// 创建文件读取器
const readProjectFile = fileReaderFactory(__dirname, '..');
const readTestFile = fileReaderFactory(__dirname, '../test');
const readSourceFile = fileReaderFactory(__dirname, '../src');

// 使用文件读取器
async function readFiles() {
  try {
    // 读取配置文件
    const packageJson = await readProjectFile('package.json');
    console.log('package.json 内容长度:', packageJson.length);
    
    // 读取测试文件
    const testContent = await readTestFile('example.test.ts');
    console.log('测试文件内容长度:', testContent.length);
    
    // 读取源码文件
    const sourceContent = await readSourceFile('index.ts');
    console.log('源码文件内容长度:', sourceContent.length);
    
  } catch (error) {
    console.error('文件读取失败:', error.message);
  }
}

// 批量读取文件
async function readMultipleFiles() {
  const files = [
    'package.json',
    'tsconfig.json',
    'README.md'
  ];
  
  const results = await Promise.allSettled(
    files.map(file => readProjectFile(file))
  );
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`${files[index]}: 读取成功，长度 ${result.value.length}`);
    } else {
      console.log(`${files[index]}: 读取失败 - ${result.reason.message}`);
    }
  });
}

readFiles();
readMultipleFiles();
```

## 高级用法和模式

### 集成测试环境搭建

```typescript
import { TransportMock, TestWorkerMock, fileReaderFactory } from '@testring/test-utils';

// 集成测试环境类
class IntegratedTestEnvironment {
  public transport: TransportMock;
  public workers: Map<string, TestWorkerMock>;
  public fileReader: (source: string) => Promise<string>;
  private messageHistory: Array<{ type: string; payload: any; timestamp: number }> = [];
  
  constructor(projectRoot: string = process.cwd()) {
    this.transport = new TransportMock();
    this.workers = new Map();
    this.fileReader = fileReaderFactory(projectRoot);
    
    this.setupMessageLogging();
  }
  
  // 设置消息日志
  private setupMessageLogging() {
    const originalBroadcast = this.transport.broadcast.bind(this.transport);
    
    this.transport.broadcast = <T>(messageType: string, payload: T) => {
      this.messageHistory.push({
        type: messageType,
        payload,
        timestamp: Date.now()
      });
      
      return originalBroadcast(messageType, payload);
    };
  }
  
  // 创建测试工作器
  createTestWorker(name: string, shouldFail = false, delay = 0): TestWorkerMock {
    const worker = new TestWorkerMock(shouldFail, delay);
    this.workers.set(name, worker);
    return worker;
  }
  
  // 获取测试工作器
  getTestWorker(name: string): TestWorkerMock | undefined {
    return this.workers.get(name);
  }
  
  // 批量创建工作器
  createMultipleWorkers(configs: Array<{
    name: string;
    shouldFail?: boolean;
    delay?: number;
  }>): Map<string, TestWorkerMock> {
    configs.forEach(config => {
      this.createTestWorker(config.name, config.shouldFail, config.delay);
    });
    
    return this.workers;
  }
  
  // 模拟测试执行流程
  async simulateTestExecution(workerName: string, testFiles: string[]) {
    const worker = this.getTestWorker(workerName);
    if (!worker) {
      throw new Error(`工作器 '${workerName}' 不存在`);
    }
    
    // 广播测试开始
    this.transport.broadcast('test.session.start', {
      workerName,
      testFiles,
      timestamp: Date.now()
    });
    
    const results = [];
    
    for (const testFile of testFiles) {
      // 广播测试文件开始
      this.transport.broadcast('test.file.start', {
        workerName,
        testFile,
        timestamp: Date.now()
      });
      
      try {
        // 生成工作器实例并执行
        const instance = worker.spawn();
        await instance.execute();
        
        results.push({ testFile, success: true, error: null });
        
        // 广播测试文件成功
        this.transport.broadcast('test.file.success', {
          workerName,
          testFile,
          timestamp: Date.now()
        });
        
      } catch (error) {
        results.push({ testFile, success: false, error });
        
        // 广播测试文件失败
        this.transport.broadcast('test.file.failure', {
          workerName,
          testFile,
          error: error.toString(),
          timestamp: Date.now()
        });
      }
    }
    
    // 广播测试会话结束
    this.transport.broadcast('test.session.complete', {
      workerName,
      results,
      timestamp: Date.now()
    });
    
    return results;
  }
  
  // 获取测试统计
  getTestStatistics() {
    const stats = {
      totalWorkers: this.workers.size,
      totalSpawned: 0,
      totalExecutions: 0,
      totalKills: 0,
      messageCount: this.messageHistory.length
    };
    
    this.workers.forEach(worker => {
      stats.totalSpawned += worker.$getSpawnedCount();
      stats.totalExecutions += worker.$getExecutionCallsCount();
      stats.totalKills += worker.$getKillCallsCount();
    });
    
    return stats;
  }
  
  // 获取消息历史
  getMessageHistory(messageType?: string) {
    if (messageType) {
      return this.messageHistory.filter(msg => msg.type === messageType);
    }
    return [...this.messageHistory];
  }
  
  // 清理环境
  async cleanup() {
    // 终止所有工作器
    for (const [name, worker] of this.workers) {
      for (let i = 0; i < worker.$getSpawnedCount(); i++) {
        const instance = worker.spawn();
        await instance.kill();
      }
    }
    
    // 清理消息历史
    this.messageHistory = [];
    
    // 清理传输层监听器
    this.transport.removeAllListeners();
    
    console.log('测试环境已清理');
  }
}

// 使用集成测试环境
async function runIntegratedTest() {
  const testEnv = new IntegratedTestEnvironment();
  
  // 监听测试事件
  testEnv.transport.on('test.session.start', (data) => {
    console.log('测试会话开始:', data);
  });
  
  testEnv.transport.on('test.file.success', (data) => {
    console.log('测试文件成功:', data.testFile);
  });
  
  testEnv.transport.on('test.file.failure', (data) => {
    console.log('测试文件失败:', data.testFile, data.error);
  });
  
  // 创建工作器
  testEnv.createMultipleWorkers([
    { name: 'unit-tests', shouldFail: false, delay: 100 },
    { name: 'integration-tests', shouldFail: false, delay: 500 },
    { name: 'e2e-tests', shouldFail: true, delay: 1000 }
  ]);
  
  try {
    // 模拟测试执行
    await testEnv.simulateTestExecution('unit-tests', [
      'unit/parser.test.js',
      'unit/validator.test.js'
    ]);
    
    await testEnv.simulateTestExecution('integration-tests', [
      'integration/api.test.js'
    ]);
    
    await testEnv.simulateTestExecution('e2e-tests', [
      'e2e/user-flow.test.js'
    ]);
    
    // 输出统计信息
    const stats = testEnv.getTestStatistics();
    console.log('测试统计:', stats);
    
    // 输出消息历史
    const messages = testEnv.getMessageHistory();
    console.log(`共产生 ${messages.length} 条消息`);
    
  } finally {
    await testEnv.cleanup();
  }
}

runIntegratedTest().catch(console.error);
```

### 高级测试场景模拟

```typescript
// 复杂测试场景模拟器
class AdvancedTestScenarios {
  private testEnv: IntegratedTestEnvironment;
  
  constructor() {
    this.testEnv = new IntegratedTestEnvironment();
  }
  
  // 模拟并发测试执行
  async simulateConcurrentExecution() {
    console.log('开始并发测试模拟...');
    
    // 创建多个工作器
    this.testEnv.createMultipleWorkers([
      { name: 'worker-1', shouldFail: false, delay: 200 },
      { name: 'worker-2', shouldFail: false, delay: 300 },
      { name: 'worker-3', shouldFail: true, delay: 150 }
    ]);
    
    // 并发执行测试
    const concurrentTasks = [
      this.testEnv.simulateTestExecution('worker-1', ['test1.js', 'test2.js']),
      this.testEnv.simulateTestExecution('worker-2', ['test3.js']),
      this.testEnv.simulateTestExecution('worker-3', ['test4.js', 'test5.js'])
    ];
    
    const results = await Promise.allSettled(concurrentTasks);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`工作器 ${index + 1} 执行成功:`, result.value);
      } else {
        console.log(`工作器 ${index + 1} 执行失败:`, result.reason);
      }
    });
  }
  
  // 模拟网络延迟和重试
  async simulateNetworkIssues() {
    console.log('模拟网络问题场景...');
    
    const unstableWorker = this.testEnv.createTestWorker('unstable', false, 0);
    
    // 模拟不稳定的网络环境
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`第 ${attempt} 次尝试...`);
        
        // 随机延迟模拟网络抖动
        const delay = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const instance = unstableWorker.spawn();
        await instance.execute();
        
        console.log(`第 ${attempt} 次尝试成功`);
        break;
        
      } catch (error) {
        console.log(`第 ${attempt} 次尝试失败:`, error.message);
        
        if (attempt === 3) {
          console.log('所有重试均失败');
        } else {
          // 指数退避重试
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
  }
  
  // 模拟资源限制场景
  async simulateResourceConstraints() {
    console.log('模拟资源限制场景...');
    
    const maxConcurrentWorkers = 3;
    const totalTasks = 10;
    
    // 创建有限的工作器集
    const workers = [];
    for (let i = 0; i < maxConcurrentWorkers; i++) {
      workers.push(this.testEnv.createTestWorker(`limited-worker-${i}`, false, 100));
    }
    
    // 模拟任务队列
    const taskQueue = [];
    for (let i = 0; i < totalTasks; i++) {
      taskQueue.push({
        id: i,
        testFile: `task-${i}.test.js`
      });
    }
    
    // 限流执行任务
    const executingTasks = new Set();
    const completedTasks = [];
    
    while (taskQueue.length > 0 || executingTasks.size > 0) {
      // 启动新任务
      while (executingTasks.size < maxConcurrentWorkers && taskQueue.length > 0) {
        const task = taskQueue.shift()!;
        const workerIndex = executingTasks.size;
        const worker = workers[workerIndex];
        
        const execution = this.executeTask(worker, task)
          .then(result => {
            completedTasks.push(result);
            executingTasks.delete(execution);
          })
          .catch(error => {
            console.error(`任务 ${task.id} 失败:`, error.message);
            executingTasks.delete(execution);
          });
        
        executingTasks.add(execution);
      }
      
      // 等待至少一个任务完成
      if (executingTasks.size > 0) {
        await Promise.race(Array.from(executingTasks));
      }
    }
    
    console.log(`所有任务完成，成功: ${completedTasks.length}/${totalTasks}`);
  }
  
  private async executeTask(worker: TestWorkerMock, task: any) {
    console.log(`开始执行任务 ${task.id}`);
    const instance = worker.spawn();
    await instance.execute();
    console.log(`任务 ${task.id} 完成`);
    return { taskId: task.id, success: true };
  }
  
  // 清理资源
  async cleanup() {
    await this.testEnv.cleanup();
  }
}

// 运行高级测试场景
async function runAdvancedScenarios() {
  const scenarios = new AdvancedTestScenarios();
  
  try {
    await scenarios.simulateConcurrentExecution();
    console.log('\n--- 分割线 ---\n');
    
    await scenarios.simulateNetworkIssues();
    console.log('\n--- 分割线 ---\n');
    
    await scenarios.simulateResourceConstraints();
    
  } finally {
    await scenarios.cleanup();
  }
}

runAdvancedScenarios().catch(console.error);
```

## PluginCompatibilityTester 使用指南

### 基本用法

```typescript
import { PluginCompatibilityTester, CompatibilityTestConfig } from '../../../test-utils/plugin-compatibility-tester';

// 配置兼容性测试
const config: CompatibilityTestConfig = {
    pluginName: 'my-browser-plugin',
    skipTests: ['screenshots'], // 可选：跳过特定测试
    customTimeouts: {           // 可选：自定义超时设置
        waitForExist: 10000,
        waitForVisible: 8000
    }
};

// 创建测试器实例
const tester = new PluginCompatibilityTester(plugin, config);

// 运行单个测试方法
await tester.testMethodImplementation();
await tester.testBasicNavigation();
await tester.testElementQueries();

// 或运行所有测试
const results = await tester.runAllTests();
console.log(`通过: ${results.passed}, 失败: ${results.failed}, 跳过: ${results.skipped}`);
```

### 可用的测试方法

- `testMethodImplementation()` - 验证所有必需的 IBrowserProxyPlugin 方法已实现
- `testBasicNavigation()` - 测试 URL 导航、页面标题、刷新和源码获取
- `testElementQueries()` - 测试元素存在性和可见性检查
- `testFormInteractions()` - 测试表单输入操作
- `testJavaScriptExecution()` - 测试 JavaScript 执行能力
- `testScreenshots()` - 测试截图功能
- `testWaitOperations()` - 测试等待操作
- `testSessionManagement()` - 测试多会话处理
- `testErrorHandling()` - 测试错误场景

### 配置选项

#### skipTests 跳过测试
测试名称应为小写且无空格的格式：
```typescript
skipTests: [
    'methodimplementation',  // 跳过方法实现测试
    'basicnavigation',       // 跳过基本导航测试
    'elementqueries',        // 跳过元素查询测试
    'forminteractions',      // 跳过表单交互测试
    'javascriptexecution',   // 跳过 JavaScript 执行测试
    'screenshots',           // 跳过截图测试
    'waitoperations',        // 跳过等待操作测试
    'sessionmanagement',     // 跳过会话管理测试
    'errorhandling'          // 跳过错误处理测试
]
```

#### customTimeouts 自定义超时
```typescript
customTimeouts: {
    waitForExist: 10000,     // 元素存在等待超时（毫秒）
    waitForVisible: 8000,    // 元素可见等待超时（毫秒）
    executeAsync: 15000      // 异步执行超时（毫秒）
}
```

## 单元测试

本包现在包含了 PluginCompatibilityTester 的完整单元测试：

### 测试文件结构

```
test/
├── plugin-compatibility-tester.spec.ts      # PluginCompatibilityTester 类的单元测试
├── plugin-compatibility-integration.spec.ts # 使用 PluginCompatibilityTester 的集成测试
├── plugin-compatibility-usage.spec.ts       # 使用示例和文档测试
├── mocks/
│   └── browser-proxy-plugin.mock.ts         # 测试用的模拟实现
└── setup.ts                                 # 测试环境设置
```

### 运行测试

```bash
# 仅运行此包的测试
cd packages/test-utils
npm test

# 运行所有项目测试（包含此包）
npm run test
```

### 测试覆盖范围

单元测试覆盖了：
- 构造函数和配置处理
- 各个测试方法的功能
- 错误处理场景
- 跳过测试功能
- 与实际插件实现的集成
- 使用模式和示例

## 迁移说明

原始的 `test-utils/plugin-compatibility-tester.ts` 文件已转换为适当的单元测试。功能保持不变，但现在已经过适当测试并集成到项目的测试套件中。

### 变更内容

1. **添加了单元测试** - PluginCompatibilityTester 类的全面单元测试
2. **添加了集成测试** - 演示如何与实际插件一起使用 PluginCompatibilityTester 的测试
3. **添加了模拟工具** - 用于测试的可重用模拟实现
4. **更新了包配置** - 添加了测试脚本和依赖项
5. **与项目测试集成** - 测试现在作为 `npm run test` 的一部分运行

### 保持不变的内容

- PluginCompatibilityTester 类 API 保持不变
- 所有测试方法的工作方式完全相同
- 配置选项完全相同
- 原始文件位置 (`test-utils/plugin-compatibility-tester.ts`) 得到保留

## 最佳实践

### 1. 模拟设计
- 使用真实的接口实现而非简单的模拟
- 提供可配置的模拟行为和参数
- 实现错误注入和异常情景测试
- 模拟真实的时间延迟和网络状况

### 2. 测试隔离
- 保证测试之间的独立性和可重复性
- 及时清理测试资源和状态
- 避免全局状态和跨测试依赖
- 使用适当的清理和重置机制

### 3. 性能考虑
- 合理使用模拟对象避免内存泄漏
- 优化文件操作和 I/O 操作的性能
- 控制并发测试的数量和资源使用
- 监控测试执行时间和资源消耗

### 4. 错误处理
- 提供清晰的错误信息和调试信息
- 实现适当的错误恢复和重试机制
- 区分模拟错误和实际测试错误
- 记录详细的错误日志和上下文信息

### 5. 可维护性
- 提供清晰的 API 文档和使用示例
- 使用描述性的命名和注释
- 实现对模拟状态的内省和调试支持
- 提供版本兼容性和升级指南

## 故障排除

### 常见问题

#### 模拟对象不工作
```bash
Error: Mock method not implemented
```
解决方案：检查模拟对象的接口实现、方法调用、类型匹配。

#### 文件读取失败
```bash
ENOENT: no such file or directory
```
解决方案：检查文件路径、工作目录、文件权限、路径解析。

#### 内存泄漏
```bash
MaxListenersExceededWarning
```
解决方案：检查事件监听器清理、对象释放、内存管理。

#### 并发问题
```bash
Race condition in test execution
```
解决方案：检查并发控制、状态管理、异步操作同步。

### 调试技巧

```typescript
// 启用详细日志
const transportMock = new TransportMock();

// 监听所有消息
transportMock.on('*', (payload, source) => {
  console.log('消息事件:', { payload, source });
});

// 检查模拟状态
const worker = new TestWorkerMock(false, 100);
console.log('工作器统计:', {
  spawned: worker.$getSpawnedCount(),
  executions: worker.$getExecutionCallsCount(),
  kills: worker.$getKillCallsCount()
});

// 文件读取调试
const readFile = fileReaderFactory(__dirname);
readFile('test.txt')
  .then(content => console.log('文件内容:', content))
  .catch(error => console.error('读取错误:', error));
```

## 依赖

- `@testring/types` - 类型定义
- `events` - Node.js 事件系统
- `fs` - Node.js 文件系统
- `path` - Node.js 路径处理

## 相关模块

- `@testring/transport` - 真实传输层实现
- `@testring/test-worker` - 真实测试工作器实现
- `@testring/browser-proxy` - 浏览器代理实现
- `@testring/test-runner` - 测试运行器

## 许可证

MIT License