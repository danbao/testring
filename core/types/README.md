# @testring/types

TypeScript 类型定义模块，为 testring 框架提供完整的类型支持和接口定义。

## 功能概述

该模块是 testring 框架的类型定义中心，包含了：
- 所有核心模块的 TypeScript 接口定义
- 通用类型和枚举定义
- 配置对象的类型规范
- 插件开发的类型支持
- 测试相关的数据结构定义

## 主要特性

### 完整的类型支持
- 涵盖框架所有模块的类型定义
- 严格的 TypeScript 类型检查
- 完善的泛型支持
- 详细的接口文档

### 模块化设计
- 按功能模块组织类型定义
- 清晰的命名空间划分
- 易于扩展和维护
- 支持选择性导入

### 开发友好
- 提供 IDE 智能提示
- 编译时类型检查
- 详细的类型注释
- 示例和用法说明

## 安装

```bash
npm install --save-dev @testring/types
```

或使用 yarn:

```bash
yarn add @testring/types --dev
```

## 主要类型类别

### 配置类型
定义框架配置相关的接口：

```typescript
// 主配置接口
interface IConfig {
  tests: string;                    // 测试文件 glob 模式
  plugins: Array<string | IPlugin>; // 插件列表
  workerLimit: number | 'local';    // 工作进程限制
  retryCount: number;               // 重试次数
  retryDelay: number;               // 重试延迟
  logLevel: LogLevel;               // 日志级别
  bail: boolean;                    // 失败时是否立即停止
  testTimeout: number;              // 测试超时时间
  debug: boolean;                   // 调试模式
}

// 日志配置
interface IConfigLogger {
  logLevel: LogLevel;
  silent: boolean;
}

// 插件配置
interface IPlugin {
  name: string;
  config?: any;
}
```

### 测试相关类型
定义测试执行和管理的接口：

```typescript
// 测试文件接口
interface IFile {
  path: string;           // 文件路径
  content: string;        // 文件内容
  dependencies?: string[]; // 依赖列表
}

// 队列中的测试项
interface IQueuedTest {
  path: string;           // 测试文件路径
  content?: string;       // 测试内容
  retryCount?: number;    // 当前重试次数
  maxRetryCount?: number; // 最大重试次数
}

// 测试执行结果
interface ITestExecutionResult {
  success: boolean;       // 是否成功
  error?: Error;         // 错误信息
  duration?: number;     // 执行时长
  retryCount?: number;   // 重试次数
}
```

### 进程通信类型
定义进程间通信的接口：

```typescript
// 传输层接口
interface ITransport {
  send<T>(processID: string, messageType: string, payload: T): Promise<void>;
  broadcast<T>(messageType: string, payload: T): void;
  on<T>(messageType: string, callback: TransportMessageHandler<T>): void;
  once<T>(messageType: string, callback: TransportMessageHandler<T>): void;
  registerChild(processID: string, child: IWorkerEmitter): void;
  getProcessesList(): string[];
}

// 消息处理器
type TransportMessageHandler<T> = (message: T, processID?: string) => void;

// 直接传输消息格式
interface ITransportDirectMessage {
  type: string;
  payload: any;
}
```

### 工作进程类型
定义测试工作进程的接口：

```typescript
// 测试工作进程实例
interface ITestWorkerInstance {
  getWorkerID(): string;
  execute(test: IQueuedTest): Promise<void>;
  kill(): Promise<void>;
}

// 子进程 Fork 选项
interface IChildProcessForkOptions {
  debug: boolean;
  debugPort?: number;
  debugPortRange?: number[];
  execArgv?: string[];
  silent?: boolean;
}

// Fork 结果
interface IChildProcessFork {
  send(message: any): void;
  on(event: string, callback: Function): void;
  kill(signal?: string): void;
  debugPort?: number;
}
```

### 文件存储类型
定义文件存储系统的接口：

```typescript
// 文件存储客户端
interface IFSStoreClient {
  createTextFile(options: IFSStoreTextFileOptions): Promise<IFSStoreTextFile>;
  createBinaryFile(options: IFSStoreBinaryFileOptions): Promise<IFSStoreBinaryFile>;
  createScreenshotFile(options: IFSStoreScreenshotFileOptions): Promise<IFSStoreScreenshotFile>;
}

// 文件存储选项
interface IFSStoreFileOptions {
  ext?: string;           // 文件扩展名
  name?: string;          // 文件名
  content?: any;          // 文件内容
}

// 文件存储文件接口
interface IFSStoreFile {
  fullPath: string;       // 完整路径
  write(content: any): Promise<void>;
  read(): Promise<any>;
  release(): Promise<void>;
}
```

### 浏览器代理类型
定义浏览器自动化的接口：

```typescript
// 浏览器代理接口
interface IBrowserProxy {
  start(): Promise<void>;
  stop(): Promise<void>;
  execute(command: IBrowserCommand): Promise<any>;
  takeScreenshot(): Promise<Buffer>;
}

// 浏览器命令
interface IBrowserCommand {
  type: string;
  args: any[];
  timeout?: number;
}

// 浏览器选项
interface IBrowserProxyOptions {
  headless: boolean;
  width: number;
  height: number;
  userAgent?: string;
  proxy?: string;
}
```

### HTTP 相关类型
定义 HTTP 服务和客户端接口：

```typescript
// HTTP 客户端接口
interface IHttpClient {
  get(url: string, options?: any): Promise<any>;
  post(url: string, data?: any, options?: any): Promise<any>;
  put(url: string, data?: any, options?: any): Promise<any>;
  delete(url: string, options?: any): Promise<any>;
  request(options: any): Promise<any>;
}

// HTTP 服务器接口
interface IHttpServer {
  start(port?: number): Promise<void>;
  stop(): Promise<void>;
  addRoute(method: string, path: string, handler: Function): void;
  getPort(): number;
}

// HTTP 请求选项
interface IHttpRequestOptions {
  url: string;
  method: string;
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}
```

### 插件系统类型
定义插件开发的接口：

```typescript
// 插件模块集合
interface IPluginModules {
  logger: ILogger;
  fsReader?: IFSReader;
  testWorker: ITestWorker;
  testRunController: ITestRunController;
  browserProxy: IBrowserProxy;
  httpServer: IHttpServer;
  httpClientInstance: IHttpClient;
  fsStoreServer: IFSStoreServer;
}

// 插件函数类型
type PluginFunction = (api: IPluginAPI) => void | Promise<void>;

// 插件 API 接口
interface IPluginAPI {
  getLogger(): ILoggerAPI;
  getFSReader(): IFSReaderAPI | null;
  getTestWorker(): ITestWorkerAPI;
  getTestRunController(): ITestRunControllerAPI;
  getBrowserProxy(): IBrowserProxyAPI;
  getHttpServer(): IHttpServerAPI;
  getHttpClient(): IHttpClient;
  getFSStoreServer(): IFSStoreServerAPI;
}
```

### 日志系统类型
定义日志记录的接口：

```typescript
// 日志级别枚举
enum LogLevel {
  verbose = 'verbose',
  debug = 'debug',
  info = 'info',
  warning = 'warning',
  error = 'error',
  silent = 'silent'
}

// 日志客户端接口
interface ILoggerClient {
  verbose(...args: any[]): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

// 日志实体
interface ILogEntity {
  logLevel: LogLevel;
  content: any[];
  timestamp: number;
  processID?: string;
}
```

## 使用示例

### 在项目中使用类型
```typescript
import {
  IConfig,
  IQueuedTest,
  ITestWorkerInstance,
  LogLevel
} from '@testring/types';

// 配置对象
const config: IConfig = {
  tests: './tests/**/*.spec.js',
  plugins: ['@testring/plugin-selenium-driver'],
  workerLimit: 2,
  retryCount: 3,
  retryDelay: 1000,
  logLevel: LogLevel.info,
  bail: false,
  testTimeout: 30000,
  debug: false
};

// 测试队列项
const queuedTest: IQueuedTest = {
  path: './tests/login.spec.js',
  retryCount: 0,
  maxRetryCount: 3
};
```

### 实现接口
```typescript
import { ITestWorkerInstance, IQueuedTest } from '@testring/types';

class MyTestWorker implements ITestWorkerInstance {
  private workerID: string;
  
  constructor(id: string) {
    this.workerID = id;
  }
  
  getWorkerID(): string {
    return this.workerID;
  }
  
  async execute(test: IQueuedTest): Promise<void> {
    console.log(`执行测试: ${test.path}`);
    // 测试执行逻辑
  }
  
  async kill(): Promise<void> {
    console.log(`停止工作进程: ${this.workerID}`);
    // 清理逻辑
  }
}
```

### 插件开发类型支持
```typescript
import { PluginFunction, IPluginAPI } from '@testring/types';

const myPlugin: PluginFunction = (api: IPluginAPI) => {
  const logger = api.getLogger();
  const testWorker = api.getTestWorker();
  
  testWorker.beforeRun(async () => {
    await logger.info('插件初始化完成');
  });
};

export default myPlugin;
```

### 泛型使用
```typescript
import { Queue, IQueue } from '@testring/types';

// 创建类型安全的队列
const testQueue: IQueue<IQueuedTest> = new Queue<IQueuedTest>();

testQueue.push({
  path: './test1.spec.js',
  retryCount: 0
});

const nextTest = testQueue.shift(); // 类型为 IQueuedTest | void
```

## 枚举定义

### 日志级别
```typescript
enum LogLevel {
  verbose = 'verbose',
  debug = 'debug',
  info = 'info',
  warning = 'warning',
  error = 'error',
  silent = 'silent'
}
```

### 断点类型
```typescript
enum BreakpointsTypes {
  beforeInstruction = 'beforeInstruction',
  afterInstruction = 'afterInstruction'
}
```

### 浏览器事件
```typescript
enum BrowserProxyEvents {
  beforeStart = 'beforeStart',
  afterStart = 'afterStart',
  beforeStop = 'beforeStop',
  afterStop = 'afterStop'
}
```

### HTTP 方法
```typescript
enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}
```

## 实用类型

### 队列和栈
```typescript
// 队列接口
interface IQueue<T> {
  push(...elements: T[]): void;
  shift(): T | void;
  clean(): void;
  remove(fn: (item: T, index: number) => boolean): number;
  extract(fn: (item: T, index: number) => boolean): T[];
  getFirstElement(offset?: number): T | null;
  length: number;
}

// 栈接口
interface IStack<T> {
  push(...elements: T[]): void;
  pop(): T | void;
  clean(): void;
  length: number;
}
```

### 依赖字典
```typescript
// 依赖字典类型
type DependencyDict = IDependencyDictionary<IDependencyDictionary<IDependencyDictionaryNode>>;

// 依赖字典接口
interface IDependencyDictionary<T> {
  [key: string]: T;
}

// 依赖节点
interface IDependencyDictionaryNode {
  path: string;
  content: string;
}

// 依赖树节点
interface IDependencyTreeNode {
  path: string;
  content: string;
  nodes: IDependencyDictionary<IDependencyTreeNode> | null;
}
```

### 钩子和回调
```typescript
// 钩子回调类型
type HookCallback<T> = (payload: T) => Promise<void> | void;

// 断点回调类型
type HasBreakpointCallback = (hasBreakpoint: boolean) => Promise<void> | void;

// 文件读取器类型
type DependencyFileReader = (path: string) => Promise<string>;

// 消息处理器类型
type TransportMessageHandler<T> = (message: T, processID?: string) => void;
```

## 扩展类型

### 自定义配置扩展
```typescript
// 扩展基础配置
interface ICustomConfig extends IConfig {
  customOption: string;
  advancedSettings: {
    cacheEnabled: boolean;
    maxCacheSize: number;
  };
}
```

### 自定义插件模块
```typescript
// 扩展插件模块集合
interface IExtendedPluginModules extends IPluginModules {
  customModule: ICustomModule;
}
```

## 最佳实践

### 类型安全
```typescript
// 使用严格的类型检查
function createTestWorker(config: IConfig): ITestWorkerInstance {
  // 实现确保类型安全
  return new TestWorker(config);
}

// 使用类型守卫
function isQueuedTest(obj: any): obj is IQueuedTest {
  return obj && typeof obj.path === 'string';
}
```

### 泛型使用
```typescript
// 创建类型安全的通用函数
function processQueue<T>(queue: IQueue<T>, processor: (item: T) => void): void {
  let item = queue.shift();
  while (item) {
    processor(item);
    item = queue.shift();
  }
}
```

### 接口扩展
```typescript
// 正确扩展接口
interface IEnhancedLogger extends ILoggerClient {
  logWithTimestamp(level: LogLevel, ...args: any[]): void;
  getLogHistory(): ILogEntity[];
}
```

## 模块依赖

该模块为纯类型定义模块，不包含运行时代码，可以安全地在任何 TypeScript 项目中使用而不增加运行时开销。

## 版本兼容性

类型定义遵循语义化版本控制：
- **主版本**：破坏性类型变更
- **次版本**：新增类型定义
- **修订版本**：类型修复和优化

## IDE 支持

该模块为以下 IDE 提供完整的类型支持：
- Visual Studio Code
- WebStorm / IntelliJ IDEA
- Sublime Text (with TypeScript plugin)
- Atom (with TypeScript plugin)
- Vim/Neovim (with appropriate plugins)