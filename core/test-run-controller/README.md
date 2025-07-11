# @testring/test-run-controller

测试运行控制器，作为 testring 框架的核心调度中心，负责管理测试队列、协调测试工作进程，并提供完整的测试生命周期控制。该模块通过队列机制实现测试的有序执行，支持并行处理、重试机制和丰富的插件钩子系统。

[![npm version](https://badge.fury.io/js/@testring/test-run-controller.svg)](https://www.npmjs.com/package/@testring/test-run-controller)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## 功能概述

测试运行控制器是 testring 框架的调度核心，提供了：
- 智能的测试队列管理和调度
- 灵活的工作进程配置（本地/多进程）
- 完善的错误处理和重试机制
- 丰富的插件钩子扩展点
- 超时控制和资源管理
- 详细的执行状态监控

## 主要特性

### 队列管理
- 基于队列的测试调度系统
- 支持动态队列修改和优先级控制
- 智能的负载均衡算法
- 完整的队列生命周期管理

### 进程管理
- 支持本地进程执行（`local` 模式）
- 多子进程并行执行
- 工作进程的创建、管理和销毁
- 进程异常处理和恢复

### 重试机制
- 可配置的重试次数和延迟
- 智能的重试策略
- 重试过程的详细监控
- 插件控制的重试决策

### 插件系统
- 丰富的生命周期钩子
- 灵活的插件注册和管理
- 支持测试流程的完全自定义
- 错误处理和状态控制

## 安装

```bash
npm install @testring/test-run-controller
```

## 核心概念

### TestRunController 类
主要的测试运行控制器类，继承自 `PluggableModule`：

```typescript
class TestRunController extends PluggableModule {
  constructor(
    config: IConfig,
    testWorker: ITestWorker,
    devtoolConfig?: IDevtoolRuntimeConfiguration
  )
  
  async runQueue(testSet: IFile[]): Promise<Error[] | null>
  async kill(): Promise<void>
}
```

### 队列项结构
每个测试在队列中的表示：

```typescript
interface IQueuedTest {
  retryCount: number;        // 当前重试次数
  retryErrors: Error[];      // 重试过程中的错误
  test: IFile;              // 测试文件信息
  parameters: object;        // 测试参数
  envParameters: object;     // 环境参数
}
```

## 基本用法

### 创建和配置控制器

```typescript
import { TestRunController } from '@testring/test-run-controller';
import { TestWorker } from '@testring/test-worker';
import { loggerClient } from '@testring/logger';

// 配置对象
const config = {
  workerLimit: 2,           // 并行工作进程数
  retryCount: 3,           // 重试次数
  retryDelay: 2000,        // 重试延迟（毫秒）
  testTimeout: 30000,      // 测试超时时间
  bail: false,             // 是否在首次失败时停止
  debug: false,            // 调试模式
  logLevel: 'info',        // 日志级别
  screenshots: 'afterError' // 截图策略
};

// 创建控制器
const testWorker = new TestWorker(config);
const controller = new TestRunController(config, testWorker);

// 运行测试队列
const testFiles = [
  { path: './tests/test1.spec.js', content: '...' },
  { path: './tests/test2.spec.js', content: '...' },
  { path: './tests/test3.spec.js', content: '...' }
];

const errors = await controller.runQueue(testFiles);

if (errors && errors.length > 0) {
  loggerClient.error(`测试失败数量: ${errors.length}`);
  errors.forEach(error => {
    loggerClient.error('测试错误:', error.message);
  });
} else {
  loggerClient.info('所有测试执行成功');
}
```

### 本地进程模式

```typescript
const config = {
  workerLimit: 'local',    // 在当前进程中运行测试
  retryCount: 2,
  retryDelay: 1000
};

const controller = new TestRunController(config, testWorker);
const errors = await controller.runQueue(testFiles);

// 在本地模式下，测试将在当前进程中顺序执行
// 这对于调试和开发环境很有用
```

### 多进程并行模式

```typescript
const config = {
  workerLimit: 4,          // 创建4个子进程
  restartWorker: true,     // 每个测试后重启工作进程
  retryCount: 3,
  retryDelay: 2000,
  testTimeout: 60000
};

const controller = new TestRunController(config, testWorker);

// 监听控制器事件
const beforeRunHook = controller.getHook('beforeRun');
const afterTestHook = controller.getHook('afterTest');

beforeRunHook?.readHook('monitor', (testQueue) => {
  console.log(`准备执行 ${testQueue.length} 个测试`);
});

afterTestHook?.readHook('reporter', (queuedTest, error, workerMeta) => {
  if (error) {
    console.log(`测试失败: ${queuedTest.test.path} (进程 ${workerMeta.processID})`);
  } else {
    console.log(`测试成功: ${queuedTest.test.path} (进程 ${workerMeta.processID})`);
  }
});

const errors = await controller.runQueue(testFiles);
```

## 配置选项详解

### 核心配置

```typescript
interface TestRunControllerConfig {
  // 工作进程配置
  workerLimit: number | 'local';     // 并发工作进程数或本地模式
  restartWorker?: boolean;           // 是否在每个测试后重启进程
  
  // 重试配置
  retryCount?: number;               // 最大重试次数（默认 0）
  retryDelay?: number;               // 重试延迟时间（毫秒，默认 0）
  
  // 超时配置
  testTimeout?: number;              // 单个测试超时时间（毫秒）
  
  // 执行策略
  bail?: boolean;                    // 首次失败时是否停止所有测试
  
  // 调试和日志
  debug?: boolean;                   // 调试模式
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'debug';
  
  // 截图配置
  screenshots?: 'disable' | 'enable' | 'afterError';
  screenshotPath?: string;
  
  // 开发工具
  devtool?: boolean;                 // 是否启用开发工具
  
  // HTTP 配置
  httpThrottle?: number;             // HTTP 请求限流
  
  // 环境参数
  envParameters?: object;            // 传递给测试的环境参数
}
```

### 配置示例

#### 开发环境配置
```typescript
const devConfig = {
  workerLimit: 'local',              // 本地模式便于调试
  retryCount: 1,                     // 少量重试
  retryDelay: 1000,
  testTimeout: 30000,
  bail: true,                        // 快速失败
  debug: true,                       // 启用调试
  logLevel: 'debug',
  screenshots: 'afterError',
  devtool: true
};
```

#### 生产环境配置
```typescript
const prodConfig = {
  workerLimit: 8,                    // 充分利用多核
  restartWorker: true,               // 隔离测试环境
  retryCount: 3,                     // 更多重试提高稳定性
  retryDelay: 5000,
  testTimeout: 120000,               // 更长的超时时间
  bail: false,                       // 执行所有测试
  debug: false,
  logLevel: 'info',
  screenshots: 'afterError'
};
```

#### CI/CD 环境配置
```typescript
const ciConfig = {
  workerLimit: 2,                    // 受限的资源
  retryCount: 1,                     // 减少重试提高速度
  retryDelay: 2000,
  testTimeout: 60000,
  bail: false,
  debug: false,
  logLevel: 'warn',
  screenshots: 'disable'             // 不需要截图
};
```

## 插件钩子系统

TestRunController 继承自 `PluggableModule`，提供了丰富的插件钩子：

### 生命周期钩子

#### beforeRun / afterRun
在整个测试队列执行前后触发：

```typescript
const controller = new TestRunController(config, testWorker);

// 队列开始前的准备工作
controller.getHook('beforeRun')?.writeHook('setup', async (testQueue) => {
  console.log(`准备执行 ${testQueue.length} 个测试`);
  
  // 可以修改测试队列
  return testQueue.filter(test => !test.test.path.includes('skip'));
});

// 队列完成后的清理工作
controller.getHook('afterRun')?.readHook('cleanup', async (error) => {
  if (error) {
    console.error('测试队列执行失败:', error);
  } else {
    console.log('所有测试执行完成');
  }
  
  // 执行清理工作
  await cleanupTestEnvironment();
});
```

#### beforeTest / afterTest
在每个测试执行前后触发：

```typescript
// 测试开始前的准备
controller.getHook('beforeTest')?.readHook('testSetup', async (queuedTest, workerMeta) => {
  console.log(`开始执行: ${queuedTest.test.path} (进程 ${workerMeta.processID})`);
  
  // 记录测试开始时间
  queuedTest.startTime = Date.now();
});

// 测试完成后的处理
controller.getHook('afterTest')?.readHook('testTeardown', async (queuedTest, error, workerMeta) => {
  const duration = Date.now() - queuedTest.startTime;
  
  if (error) {
    console.error(`测试失败: ${queuedTest.test.path} (耗时 ${duration}ms)`);
    console.error('错误信息:', error.message);
    
    // 保存失败截图
    if (queuedTest.parameters.runData?.screenshotsEnabled) {
      await saveFailureScreenshot(queuedTest.test.path);
    }
  } else {
    console.log(`测试成功: ${queuedTest.test.path} (耗时 ${duration}ms)`);
  }
});
```

### 控制钩子

#### shouldNotExecute
控制是否执行整个测试队列：

```typescript
controller.getHook('shouldNotExecute')?.writeHook('environmentCheck', async (shouldSkip, testQueue) => {
  // 检查测试环境是否准备就绪
  const environmentReady = await checkTestEnvironment();
  
  if (!environmentReady) {
    console.warn('测试环境未准备就绪，跳过测试执行');
    return true;  // 跳过整个队列
  }
  
  return shouldSkip;
});
```

#### shouldNotStart
控制单个测试是否应该开始：

```typescript
controller.getHook('shouldNotStart')?.writeHook('testFilter', async (shouldSkip, queuedTest, workerMeta) => {
  // 根据条件跳过特定测试
  if (queuedTest.test.path.includes('performance') && process.env.SKIP_PERFORMANCE === 'true') {
    console.log(`跳过性能测试: ${queuedTest.test.path}`);
    return true;
  }
  
  // 检查测试依赖
  const dependenciesAvailable = await checkTestDependencies(queuedTest.test);
  if (!dependenciesAvailable) {
    console.warn(`跳过测试（依赖不可用）: ${queuedTest.test.path}`);
    return true;
  }
  
  return shouldSkip;
});
```

#### shouldNotRetry
控制失败的测试是否应该重试：

```typescript
controller.getHook('shouldNotRetry')?.writeHook('retryStrategy', async (shouldNotRetry, queuedTest, workerMeta) => {
  // 某些类型的错误不重试
  const lastError = queuedTest.retryErrors[queuedTest.retryErrors.length - 1];
  
  if (lastError?.message.includes('SYNTAX_ERROR')) {
    console.log(`语法错误不重试: ${queuedTest.test.path}`);
    return true;  // 不重试
  }
  
  if (lastError?.message.includes('TIMEOUT')) {
    // 超时错误增加重试延迟
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  return shouldNotRetry;
});
```

#### beforeTestRetry
在测试重试前触发：

```typescript
controller.getHook('beforeTestRetry')?.readHook('retryLogger', async (queuedTest, error, workerMeta) => {
  console.warn(`测试重试 ${queuedTest.retryCount + 1}/${config.retryCount}: ${queuedTest.test.path}`);
  console.warn('失败原因:', error.message);
  
  // 记录重试统计
  await recordRetryMetrics(queuedTest.test.path, queuedTest.retryCount, error);
});
```

## 高级用法

### 自定义测试队列管理

```typescript
class CustomTestRunController extends TestRunController {
  constructor(config, testWorker) {
    super(config, testWorker);
    
    // 注册自定义钩子
    this.setupCustomHooks();
  }
  
  private setupCustomHooks() {
    // 动态队列管理
    this.getHook('beforeRun')?.writeHook('dynamicQueue', async (testQueue) => {
      // 根据历史失败率重新排序测试
      const sortedQueue = await this.sortTestsByFailureRate(testQueue);
      
      // 添加冒烟测试到队列开头
      const smokeTests = await this.getSmokeTests();
      return [...smokeTests, ...sortedQueue];
    });
    
    // 智能重试策略
    this.getHook('shouldNotRetry')?.writeHook('smartRetry', async (shouldNotRetry, queuedTest) => {
      const failurePattern = this.analyzeFailurePattern(queuedTest.retryErrors);
      
      // 如果是系统级错误，暂停一段时间再重试
      if (failurePattern === 'SYSTEM_ERROR') {
        await this.waitForSystemRecovery();
      }
      
      return shouldNotRetry;
    });
  }
  
  private async sortTestsByFailureRate(testQueue) {
    // 根据历史数据排序测试
    const testHistory = await this.loadTestHistory();
    
    return testQueue.sort((a, b) => {
      const aFailureRate = testHistory[a.test.path]?.failureRate || 0;
      const bFailureRate = testHistory[b.test.path]?.failureRate || 0;
      
      // 失败率低的测试优先执行
      return aFailureRate - bFailureRate;
    });
  }
  
  private async getSmokeTests() {
    // 获取关键的冒烟测试
    return [
      { test: { path: './tests/smoke/basic.spec.js' }, retryCount: 0, retryErrors: [] }
    ];
  }
  
  private analyzeFailurePattern(errors) {
    // 分析错误模式
    const errorMessages = errors.map(e => e.message).join(' ');
    
    if (errorMessages.includes('ECONNREFUSED') || errorMessages.includes('timeout')) {
      return 'NETWORK_ERROR';
    }
    
    if (errorMessages.includes('out of memory') || errorMessages.includes('heap')) {
      return 'MEMORY_ERROR';
    }
    
    return 'TEST_ERROR';
  }
  
  private async waitForSystemRecovery() {
    // 等待系统恢复
    console.log('检测到系统错误，等待系统恢复...');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}
```

### 测试报告和监控

```typescript
class TestReportingController extends TestRunController {
  private testResults = [];
  private startTime;
  
  constructor(config, testWorker) {
    super(config, testWorker);
    this.setupReporting();
  }
  
  private setupReporting() {
    // 记录测试开始时间
    this.getHook('beforeRun')?.readHook('startTimer', (testQueue) => {
      this.startTime = Date.now();
      console.log(`开始执行测试套件，共 ${testQueue.length} 个测试`);
    });
    
    // 收集每个测试的结果
    this.getHook('afterTest')?.readHook('collectResults', (queuedTest, error, workerMeta) => {
      const result = {
        testPath: queuedTest.test.path,
        status: error ? 'failed' : 'passed',
        duration: Date.now() - queuedTest.startTime,
        retryCount: queuedTest.retryCount,
        processID: workerMeta.processID,
        error: error ? error.message : null
      };
      
      this.testResults.push(result);
    });
    
    // 生成最终报告
    this.getHook('afterRun')?.readHook('generateReport', async (error) => {
      const totalDuration = Date.now() - this.startTime;
      const report = this.generateTestReport(totalDuration);
      
      // 保存报告
      await this.saveReport(report);
      
      // 发送通知
      await this.sendNotification(report);
    });
  }
  
  private generateTestReport(totalDuration) {
    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    const totalRetries = this.testResults.reduce((sum, r) => sum + r.retryCount, 0);
    
    return {
      summary: {
        total: this.testResults.length,
        passed,
        failed,
        passRate: ((passed / this.testResults.length) * 100).toFixed(2) + '%',
        totalDuration,
        totalRetries
      },
      details: this.testResults,
      slowestTests: this.testResults
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
      flakyTests: this.testResults
        .filter(r => r.retryCount > 0)
        .sort((a, b) => b.retryCount - a.retryCount)
    };
  }
  
  private async saveReport(report) {
    const reportPath = './test-reports/execution-report.json';
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`测试报告已保存: ${reportPath}`);
  }
  
  private async sendNotification(report) {
    if (report.summary.failed > 0) {
      // 发送失败通知
      await this.sendSlackNotification(`测试执行完成：${report.summary.failed} 个测试失败`);
    }
  }
}
```

### 资源管理和清理

```typescript
class ResourceManagedController extends TestRunController {
  private resources = new Map();
  
  async runQueue(testSet) {
    try {
      // 预分配资源
      await this.allocateResources(testSet.length);
      
      return await super.runQueue(testSet);
    } finally {
      // 确保资源被清理
      await this.cleanupResources();
    }
  }
  
  async kill() {
    try {
      await super.kill();
    } finally {
      await this.cleanupResources();
    }
  }
  
  private async allocateResources(testCount) {
    // 分配数据库连接池
    const dbPool = await createDatabasePool(testCount);
    this.resources.set('database', dbPool);
    
    // 分配临时目录
    const tempDir = await createTempDirectory();
    this.resources.set('tempDir', tempDir);
    
    // 启动测试服务
    const testServer = await startTestServer();
    this.resources.set('testServer', testServer);
  }
  
  private async cleanupResources() {
    for (const [name, resource] of this.resources) {
      try {
        await this.cleanupResource(name, resource);
      } catch (error) {
        console.error(`清理资源失败 ${name}:`, error);
      }
    }
    
    this.resources.clear();
  }
  
  private async cleanupResource(name, resource) {
    switch (name) {
      case 'database':
        await resource.end();
        break;
      case 'tempDir':
        await fs.rmdir(resource, { recursive: true });
        break;
      case 'testServer':
        await resource.close();
        break;
    }
  }
}
```

## 错误处理和调试

### 错误分类和处理

```typescript
class ErrorHandlingController extends TestRunController {
  private errorClassifier = new ErrorClassifier();
  
  constructor(config, testWorker) {
    super(config, testWorker);
    this.setupErrorHandling();
  }
  
  private setupErrorHandling() {
    this.getHook('afterTest')?.readHook('errorHandler', async (queuedTest, error, workerMeta) => {
      if (error) {
        const errorType = this.errorClassifier.classify(error);
        
        switch (errorType) {
          case 'NETWORK_ERROR':
            await this.handleNetworkError(queuedTest, error);
            break;
          case 'MEMORY_ERROR':
            await this.handleMemoryError(workerMeta);
            break;
          case 'TEST_ERROR':
            await this.handleTestError(queuedTest, error);
            break;
          case 'SYSTEM_ERROR':
            await this.handleSystemError(error);
            break;
        }
      }
    });
  }
  
  private async handleNetworkError(queuedTest, error) {
    // 网络错误处理
    console.warn(`网络错误 in ${queuedTest.test.path}:`, error.message);
    
    // 检查网络连接
    const networkOk = await this.checkNetworkConnectivity();
    if (!networkOk) {
      throw new Error('网络连接不可用，停止测试执行');
    }
  }
  
  private async handleMemoryError(workerMeta) {
    // 内存错误处理
    console.error(`工作进程 ${workerMeta.processID} 内存不足`);
    
    // 强制垃圾回收
    if (global.gc) {
      global.gc();
    }
    
    // 记录内存使用情况
    const memUsage = process.memoryUsage();
    console.log('内存使用情况:', memUsage);
  }
  
  private async handleTestError(queuedTest, error) {
    // 测试逻辑错误
    console.error(`测试逻辑错误 in ${queuedTest.test.path}:`, error.message);
    
    // 保存错误现场
    await this.saveErrorContext(queuedTest, error);
  }
  
  private async handleSystemError(error) {
    // 系统级错误
    console.error('系统级错误:', error.message);
    
    // 发送告警
    await this.sendAlert('SYSTEM_ERROR', error);
  }
}

class ErrorClassifier {
  classify(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('econnrefused') || message.includes('timeout')) {
      return 'NETWORK_ERROR';
    }
    
    if (message.includes('out of memory') || message.includes('heap')) {
      return 'MEMORY_ERROR';
    }
    
    if (message.includes('assertion') || message.includes('expect')) {
      return 'TEST_ERROR';
    }
    
    return 'SYSTEM_ERROR';
  }
}
```

### 调试工具

```typescript
class DebuggableController extends TestRunController {
  private debugMode: boolean;
  private executionTrace = [];
  
  constructor(config, testWorker) {
    super(config, testWorker);
    this.debugMode = config.debug || false;
    
    if (this.debugMode) {
      this.setupDebugHooks();
    }
  }
  
  private setupDebugHooks() {
    // 跟踪所有钩子调用
    const originalCallHook = this.callHook.bind(this);
    this.callHook = async (hookName, ...args) => {
      const startTime = Date.now();
      
      this.trace(`调用钩子: ${hookName}`, args);
      
      try {
        const result = await originalCallHook(hookName, ...args);
        const duration = Date.now() - startTime;
        
        this.trace(`钩子完成: ${hookName} (${duration}ms)`, result);
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.trace(`钩子失败: ${hookName} (${duration}ms)`, error);
        throw error;
      }
    };
    
    // 记录测试执行状态
    this.getHook('beforeTest')?.readHook('debugTrace', (queuedTest, workerMeta) => {
      this.trace('开始测试', {
        test: queuedTest.test.path,
        worker: workerMeta.processID,
        retryCount: queuedTest.retryCount
      });
    });
    
    this.getHook('afterTest')?.readHook('debugTrace', (queuedTest, error, workerMeta) => {
      this.trace('测试完成', {
        test: queuedTest.test.path,
        worker: workerMeta.processID,
        success: !error,
        error: error?.message
      });
    });
  }
  
  private trace(message, data) {
    const traceEntry = {
      timestamp: Date.now(),
      message,
      data
    };
    
    this.executionTrace.push(traceEntry);
    
    if (this.debugMode) {
      console.log(`[DEBUG] ${message}:`, data);
    }
  }
  
  getExecutionTrace() {
    return this.executionTrace;
  }
  
  async saveExecutionTrace() {
    if (this.executionTrace.length > 0) {
      const tracePath = './debug/execution-trace.json';
      await fs.writeFile(tracePath, JSON.stringify(this.executionTrace, null, 2));
      console.log(`执行跟踪已保存: ${tracePath}`);
    }
  }
}
```

## 性能优化

### 智能负载均衡

```typescript
class LoadBalancedController extends TestRunController {
  private workerStats = new Map();
  
  private createWorkers(limit) {
    const workers = super.createWorkers(limit);
    
    // 初始化工作进程统计
    workers.forEach((worker, index) => {
      this.workerStats.set(worker.getWorkerID(), {
        testsExecuted: 0,
        totalDuration: 0,
        averageDuration: 0,
        currentTest: null,
        lastActivityTime: Date.now()
      });
    });
    
    return workers;
  }
  
  private async executeWorker(worker, queue) {
    const workerId = worker.getWorkerID();
    const stats = this.workerStats.get(workerId);
    
    // 更新工作进程状态
    stats.lastActivityTime = Date.now();
    
    const queuedTest = queue.shift();
    if (!queuedTest) return;
    
    stats.currentTest = queuedTest.test.path;
    
    const startTime = Date.now();
    
    try {
      await super.executeWorker(worker, queue);
      
      // 更新成功统计
      const duration = Date.now() - startTime;
      stats.testsExecuted++;
      stats.totalDuration += duration;
      stats.averageDuration = stats.totalDuration / stats.testsExecuted;
      
    } finally {
      stats.currentTest = null;
      stats.lastActivityTime = Date.now();
    }
  }
  
  getWorkerStatistics() {
    const stats = {};
    
    for (const [workerId, data] of this.workerStats) {
      stats[workerId] = {
        ...data,
        efficiency: data.averageDuration > 0 ? 1000 / data.averageDuration : 0
      };
    }
    
    return stats;
  }
}
```

### 内存管理

```typescript
class MemoryOptimizedController extends TestRunController {
  private memoryThreshold = 500 * 1024 * 1024; // 500MB
  private gcInterval;
  
  async runQueue(testSet) {
    // 启动内存监控
    this.startMemoryMonitoring();
    
    try {
      return await super.runQueue(testSet);
    } finally {
      this.stopMemoryMonitoring();
    }
  }
  
  private startMemoryMonitoring() {
    this.gcInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      
      if (memUsage.heapUsed > this.memoryThreshold) {
        console.warn(`内存使用过高: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
        
        // 强制垃圾回收
        if (global.gc) {
          global.gc();
          console.log('执行了垃圾回收');
        }
      }
    }, 5000);
  }
  
  private stopMemoryMonitoring() {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
    }
  }
}
```

## 最佳实践

### 1. 配置优化
- 根据硬件资源合理设置 `workerLimit`
- 在开发环境使用 `'local'` 模式便于调试
- 设置合适的重试次数和延迟时间
- 根据测试复杂度调整超时时间

### 2. 插件使用
- 使用插件钩子实现自定义逻辑
- 保持插件的轻量级和独立性
- 在插件中进行适当的错误处理
- 使用读取钩子进行监控和日志记录

### 3. 错误处理
- 实现完善的错误分类和处理策略
- 提供详细的错误信息和上下文
- 使用重试机制处理临时性错误
- 建立错误监控和告警机制

### 4. 性能优化
- 监控工作进程的资源使用情况
- 实现智能的负载均衡策略
- 定期进行内存管理和垃圾回收
- 优化测试队列的调度算法

### 5. 调试和监控
- 在开发环境启用详细的调试日志
- 收集和分析测试执行数据
- 建立完整的测试报告系统
- 实现实时的执行状态监控

## 故障排除

### 常见问题

#### 工作进程创建失败
```bash
Error: Failed to create a test worker instance
```
解决方案：检查系统资源，确认 TestWorker 配置正确。

#### 测试超时
```bash
Error: Test timeout exceeded 30000ms
```
解决方案：增加 `testTimeout` 配置或优化测试代码。

#### 内存不足
```bash
Error: out of memory
```
解决方案：减少 `workerLimit` 或增加系统内存。

### 调试技巧

```typescript
// 启用详细调试
const config = {
  debug: true,
  logLevel: 'debug',
  workerLimit: 1  // 单进程便于调试
};

// 添加调试钩子
controller.getHook('beforeTest')?.readHook('debug', (queuedTest) => {
  console.log('调试信息:', queuedTest);
});
```

## 依赖

- `@testring/pluggable-module` - 插件系统基础
- `@testring/logger` - 日志记录
- `@testring/utils` - 工具函数
- `@testring/types` - 类型定义
- `@testring/fs-store` - 文件存储

## 相关模块

- `@testring/test-worker` - 测试工作进程
- `@testring/cli` - 命令行界面
- `@testring/plugin-api` - 插件 API

## 许可证

MIT License

