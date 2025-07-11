# @testring/devtool-backend

开发者工具后端服务模块，作为 testring 框架的调试和开发工具核心，提供完整的测试调试、录制、重放和实时监控能力。该模块集成了 Web 服务器、WebSocket 通信、消息代理和前端界面，为测试开发和调试提供全面的解决方案。

[![npm version](https://badge.fury.io/js/@testring/devtool-backend.svg)](https://www.npmjs.com/package/@testring/devtool-backend)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## 功能概述

开发者工具后端服务模块是 testring 框架的调试中心，提供了：
- 完整的测试调试和录制服务器
- 基于 Express 的 Web 服务和路由系统
- WebSocket 实时通信和消息代理
- 前端界面集成和静态资源服务
- 测试进程的生命周期管理
- 多进程协调和消息中继
- 可扩展的插件系统和钩子机制
- 测试执行状态的实时监控

## 主要特性

### 服务器管理
- 自动化的子进程创建和管理
- 进程间消息传递和同步
- 整合的日志系统和错误处理
- 优雅的服务器启动和关闭管理

### 通信系统
- 统一的消息传输层接口
- 实时双向消息代理机制
- 多渠道消息广播和定向发送
- 全面的错误处理和重连机制

### 界面集成
- 内置的前端界面和路由系统
- 多种界面模式（编辑器、弹窗、主页）
- 静态资源服务和缓存管理
- 响应式设计和跨平台兼容

### 扩展性
- 完整的插件系统和生命周期钩子
- 灵活的配置系统和可自定义选项
- 多模块集成和协调能力
- 向后兼容的 API 设计

## 安装

```bash
npm install @testring/devtool-backend
```

或使用 yarn：

```bash
yarn add @testring/devtool-backend
```

## 核心架构

### DevtoolServerController 类
主要的开发者工具服务控制器，继承自 `PluggableModule`：

```typescript
class DevtoolServerController extends PluggableModule implements IDevtoolServerController {
  constructor(transport: ITransport)
  
  // 服务器管理
  public async init(): Promise<void>
  public async kill(): Promise<void>
  
  // 配置管理
  public getRuntimeConfiguration(): IDevtoolRuntimeConfiguration
  
  // 生命周期钩子
  private callHook<T>(hook: DevtoolPluginHooks, data?: T): Promise<T>
}
```

### 配置类型
```typescript
interface IDevtoolServerConfig {
  host: string;                 // 服务器主机地址
  httpPort: number;             // HTTP 服务端口
  wsPort: number;               // WebSocket 服务端口
  router: RouterConfig[];       // 路由配置
  staticRoutes: StaticRoutes;   // 静态路由配置
}

interface IDevtoolRuntimeConfiguration {
  extensionId: string;  // 浏览器扩展 ID
  httpPort: number;     // HTTP 服务端口
  wsPort: number;       // WebSocket 服务端口
  host: string;         // 服务器主机地址
}

interface RouterConfig {
  method: 'get' | 'post' | 'put' | 'delete'; // HTTP 方法
  mask: string;         // 路由模式
  handler: string;      // 处理器路径
}
```

### 插件钩子
```typescript
enum DevtoolPluginHooks {
  beforeStart = 'beforeStart',      // 服务器启动前
  afterStart = 'afterStart',        // 服务器启动后
  beforeStop = 'beforeStop',        // 服务器停止前
  afterStop = 'afterStop'           // 服务器停止后
}
```

## 基本用法

### 创建开发者工具服务器

```typescript
import { DevtoolServerController } from '@testring/devtool-backend';
import { transport } from '@testring/transport';

// 创建开发者工具服务器
const devtoolServer = new DevtoolServerController(transport);

// 初始化并启动服务器
try {
  await devtoolServer.init();
  console.log('开发者工具服务器启动成功');
  
  // 获取运行时配置
  const runtimeConfig = devtoolServer.getRuntimeConfiguration();
  console.log('运行时配置:', runtimeConfig);
  
  // 开发者工具在以下地址可用
  console.log(`开发者工具: http://${runtimeConfig.host}:${runtimeConfig.httpPort}`);
  console.log(`WebSocket: ws://${runtimeConfig.host}:${runtimeConfig.wsPort}`);
  
} catch (error) {
  console.error('开发者工具服务器启动失败:', error);
}

// 在适当的时候停止服务器
process.on('SIGINT', async () => {
  console.log('正在关闭开发者工具服务器...');
  await devtoolServer.kill();
  console.log('开发者工具服务器已关闭');
  process.exit(0);
});
```

### 与测试进程集成

```typescript
import { DevtoolServerController } from '@testring/devtool-backend';
import { transport } from '@testring/transport';
import { TestRunner } from '@testring/test-runner';

class TestEnvironment {
  private devtoolServer: DevtoolServerController;
  private testRunner: TestRunner;
  
  constructor() {
    this.devtoolServer = new DevtoolServerController(transport);
    this.testRunner = new TestRunner(/* 测试运行器配置 */);
  }
  
  async setupDevelopmentEnvironment() {
    console.log('正在设置开发环境...');
    
    // 启动开发者工具服务器
    await this.devtoolServer.init();
    
    const config = this.devtoolServer.getRuntimeConfiguration();
    console.log(`开发者工具已启动: http://${config.host}:${config.httpPort}`);
    
    // 配置测试运行器使用开发者工具
    this.testRunner.configure({
      devtool: {
        extensionId: config.extensionId,
        httpPort: config.httpPort,
        wsPort: config.wsPort,
        host: config.host
      }
    });
    
    console.log('开发环境设置完成');
  }
  
  async runTestsWithDebugging() {
    try {
      await this.setupDevelopmentEnvironment();
      
      console.log('正在运行测试（启用调试模式）...');
      const results = await this.testRunner.run();
      
      console.log('测试结果:', results);
      return results;
      
    } catch (error) {
      console.error('测试执行失败:', error);
      throw error;
    }
  }
  
  async teardown() {
    console.log('正在清理开发环境...');
    
    if (this.devtoolServer) {
      await this.devtoolServer.kill();
    }
    
    console.log('开发环境已清理');
  }
}

// 使用示例
const testEnv = new TestEnvironment();

// 运行带调试的测试
testEnv.runTestsWithDebugging()
  .then(results => {
    console.log('测试完成:', results);
  })
  .catch(error => {
    console.error('测试失败:', error);
  })
  .finally(() => {
    return testEnv.teardown();
  });
```

## 插件系统和扩展

### 自定义插件开发

```typescript
import {
  DevtoolServerController,
  DevtoolPluginHooks,
  IDevtoolServerConfig
} from '@testring/devtool-backend';

class CustomDevtoolPlugin {
  private name = 'CustomDevtoolPlugin';
  
  // 服务器启动前的配置修改
  async beforeStart(config: IDevtoolServerConfig): Promise<IDevtoolServerConfig> {
    console.log(`[${this.name}] 服务器启动前配置:`, config);
    
    // 修改默认配置
    return {
      ...config,
      host: process.env.DEVTOOL_HOST || config.host,
      httpPort: parseInt(process.env.DEVTOOL_HTTP_PORT || config.httpPort.toString()),
      wsPort: parseInt(process.env.DEVTOOL_WS_PORT || config.wsPort.toString()),
      router: [
        ...config.router,
        // 添加自定义路由
        {
          method: 'get',
          mask: '/api/custom',
          handler: this.getCustomApiHandler()
        }
      ]
    };
  }
  
  // 服务器启动后的初始化
  async afterStart(): Promise<void> {
    console.log(`[${this.name}] 服务器启动完成，执行自定义初始化...`);
    
    // 执行自定义初始化逻辑
    await this.initializeCustomFeatures();
  }
  
  // 服务器停止前的清理
  async beforeStop(): Promise<void> {
    console.log(`[${this.name}] 服务器停止前，执行清理...`);
    
    // 执行清理逻辑
    await this.cleanup();
  }
  
  // 服务器停止后的最终化
  async afterStop(): Promise<void> {
    console.log(`[${this.name}] 服务器已停止，执行最终清理...`);
    
    // 执行最终清理逻辑
    await this.finalCleanup();
  }
  
  private getCustomApiHandler(): string {
    // 返回自定义 API 处理器路径
    return require.resolve('./custom-api-handler');
  }
  
  private async initializeCustomFeatures(): Promise<void> {
    // 初始化自定义功能
    console.log('初始化自定义功能...');
    
    // 示例: 设置定时任务
    setInterval(() => {
      console.log('自定义定时任务执行...');
    }, 10000);
  }
  
  private async cleanup(): Promise<void> {
    // 清理资源
    console.log('清理自定义资源...');
  }
  
  private async finalCleanup(): Promise<void> {
    // 最终清理
    console.log('最终清理完成');
  }
}

// 使用自定义插件
const customPlugin = new CustomDevtoolPlugin();
const devtoolServer = new DevtoolServerController(transport);

// 注册插件钩子
devtoolServer.registerPluginHook(DevtoolPluginHooks.beforeStart, customPlugin.beforeStart.bind(customPlugin));
devtoolServer.registerPluginHook(DevtoolPluginHooks.afterStart, customPlugin.afterStart.bind(customPlugin));
devtoolServer.registerPluginHook(DevtoolPluginHooks.beforeStop, customPlugin.beforeStop.bind(customPlugin));
devtoolServer.registerPluginHook(DevtoolPluginHooks.afterStop, customPlugin.afterStop.bind(customPlugin));

// 启动带插件的服务器
await devtoolServer.init();
```

### 配置管理器

```typescript
class DevtoolConfigManager {
  private defaultConfig: IDevtoolServerConfig;
  private runtimeConfig: IDevtoolServerConfig;
  
  constructor() {
    this.defaultConfig = this.loadDefaultConfig();
  }
  
  // 加载默认配置
  private loadDefaultConfig(): IDevtoolServerConfig {
    return {
      host: 'localhost',
      httpPort: 3000,
      wsPort: 3001,
      router: [
        {
          method: 'get',
          mask: '/',
          handler: this.getRouterPath('index-page')
        },
        {
          method: 'get',
          mask: '/editor',
          handler: this.getRouterPath('editor-page')
        },
        {
          method: 'get',
          mask: '/api/health',
          handler: this.getRouterPath('health-check')
        }
      ],
      staticRoutes: {
        'assets': {
          rootPath: '/assets',
          directory: './public/assets'
        }
      }
    };
  }
  
  // 从环境变量加载配置
  loadFromEnvironment(): IDevtoolServerConfig {
    const config = { ...this.defaultConfig };
    
    if (process.env.DEVTOOL_HOST) {
      config.host = process.env.DEVTOOL_HOST;
    }
    
    if (process.env.DEVTOOL_HTTP_PORT) {
      config.httpPort = parseInt(process.env.DEVTOOL_HTTP_PORT);
    }
    
    if (process.env.DEVTOOL_WS_PORT) {
      config.wsPort = parseInt(process.env.DEVTOOL_WS_PORT);
    }
    
    return config;
  }
  
  // 从文件加载配置
  loadFromFile(configPath: string): IDevtoolServerConfig {
    try {
      const fileConfig = require(configPath);
      return this.mergeConfigs(this.defaultConfig, fileConfig);
    } catch (error) {
      console.warn(`无法加载配置文件 ${configPath}:`, error.message);
      return this.defaultConfig;
    }
  }
  
  // 合并配置
  private mergeConfigs(base: IDevtoolServerConfig, override: Partial<IDevtoolServerConfig>): IDevtoolServerConfig {
    return {
      ...base,
      ...override,
      router: [
        ...base.router,
        ...(override.router || [])
      ],
      staticRoutes: {
        ...base.staticRoutes,
        ...(override.staticRoutes || {})
      }
    };
  }
  
  // 验证配置
  validateConfig(config: IDevtoolServerConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.host) {
      errors.push('主机地址不能为空');
    }
    
    if (!config.httpPort || config.httpPort <= 0 || config.httpPort > 65535) {
      errors.push('HTTP 端口必须在 1-65535 范围内');
    }
    
    if (!config.wsPort || config.wsPort <= 0 || config.wsPort > 65535) {
      errors.push('WebSocket 端口必须在 1-65535 范围内');
    }
    
    if (config.httpPort === config.wsPort) {
      errors.push('HTTP 端口和 WebSocket 端口不能相同');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  // 获取路由器路径
  private getRouterPath(filename: string): string {
    return require.resolve(`./routes/${filename}`);
  }
  
  // 获取最终配置
  getConfig(): IDevtoolServerConfig {
    if (!this.runtimeConfig) {
      // 优先级: 文件配置 > 环境变量 > 默认配置
      let config = this.loadFromEnvironment();
      
      const configFile = process.env.DEVTOOL_CONFIG_FILE;
      if (configFile) {
        config = this.loadFromFile(configFile);
      }
      
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
      }
      
      this.runtimeConfig = config;
    }
    
    return this.runtimeConfig;
  }
}

// 使用配置管理器
const configManager = new DevtoolConfigManager();

// 自定义配置加载插件
class ConfigurableDevtoolPlugin {
  async beforeStart(config: IDevtoolServerConfig): Promise<IDevtoolServerConfig> {
    // 使用配置管理器加载配置
    const managedConfig = configManager.getConfig();
    
    console.log('使用管理的配置:', managedConfig);
    
    return managedConfig;
  }
}

// 集成配置管理器
const configurablePlugin = new ConfigurableDevtoolPlugin();
const devtoolServer = new DevtoolServerController(transport);

devtoolServer.registerPluginHook(
  DevtoolPluginHooks.beforeStart,
  configurablePlugin.beforeStart.bind(configurablePlugin)
);

await devtoolServer.init();
```

## 消息代理和通信

### 消息代理系统

```typescript
class DevtoolMessageProxy {
  private transport: ITransport;
  private proxyHandlers: Map<string, Function> = new Map();
  
  constructor(transport: ITransport) {
    this.transport = transport;
    this.initializeProxyHandlers();
  }
  
  // 初始化代理处理器
  private initializeProxyHandlers() {
    // 测试进程消息代理
    this.registerProxyHandler('test.register', this.proxyTestRegister.bind(this));
    this.registerProxyHandler('test.unregister', this.proxyTestUnregister.bind(this));
    this.registerProxyHandler('test.updateState', this.proxyTestUpdateState.bind(this));
    
    // Web 应用消息代理
    this.registerProxyHandler('webApp.register', this.proxyWebAppRegister.bind(this));
    this.registerProxyHandler('webApp.unregister', this.proxyWebAppUnregister.bind(this));
    this.registerProxyHandler('webApp.action', this.proxyWebAppAction.bind(this));
    
    // 自定义消息代理
    this.registerProxyHandler('custom.debug', this.proxyCustomDebug.bind(this));
  }
  
  // 注册代理处理器
  private registerProxyHandler(messageType: string, handler: Function) {
    this.proxyHandlers.set(messageType, handler);
    
    // 监听消息并代理
    this.transport.on(messageType, (messageData: any, processID?: string) => {
      this.proxyMessage(messageType, messageData, processID);
    });
  }
  
  // 代理消息
  private proxyMessage(messageType: string, messageData: any, processID?: string) {
    const handler = this.proxyHandlers.get(messageType);
    if (handler) {
      handler(messageData, processID);
    } else {
      console.warn(`未知消息类型: ${messageType}`);
    }
  }
  
  // 测试注册代理
  private proxyTestRegister(messageData: any, processID?: string) {
    console.log(`测试注册: ${processID}`, messageData);
    
    // 转发给开发者工具前端
    this.sendToDevtoolFrontend({
      type: 'test.register',
      data: {
        processID,
        ...messageData
      }
    });
  }
  
  // 测试状态更新代理
  private proxyTestUpdateState(messageData: any, processID?: string) {
    console.log(`测试状态更新: ${processID}`, messageData);
    
    // 转发给开发者工具前端
    this.sendToDevtoolFrontend({
      type: 'test.stateUpdate',
      data: {
        processID,
        ...messageData
      }
    });
  }
  
  // Web 应用注册代理
  private proxyWebAppRegister(messageData: any, processID?: string) {
    console.log(`Web 应用注册: ${processID}`, messageData);
    
    // 转发给开发者工具前端
    this.sendToDevtoolFrontend({
      type: 'webApp.register',
      data: {
        processID,
        ...messageData
      }
    });
  }
  
  // Web 应用动作代理
  private proxyWebAppAction(messageData: any, processID?: string) {
    console.log(`Web 应用动作: ${processID}`, messageData);
    
    // 转发给开发者工具前端
    this.sendToDevtoolFrontend({
      type: 'webApp.action',
      data: {
        processID,
        action: messageData.action,
        element: messageData.element,
        timestamp: Date.now()
      }
    });
  }
  
  // 自定义调试代理
  private proxyCustomDebug(messageData: any, processID?: string) {
    console.log(`自定义调试: ${processID}`, messageData);
    
    // 转发给开发者工具前端
    this.sendToDevtoolFrontend({
      type: 'custom.debug',
      data: {
        processID,
        debugInfo: messageData,
        timestamp: Date.now()
      }
    });
  }
  
  // 清理代理处理器
  private proxyTestUnregister(messageData: any, processID?: string) {
    console.log(`测试清理: ${processID}`, messageData);
    
    // 转发给开发者工具前端
    this.sendToDevtoolFrontend({
      type: 'test.unregister',
      data: {
        processID,
        ...messageData
      }
    });
  }
  
  // 发送消息到开发者工具前端
  private sendToDevtoolFrontend(message: any) {
    // 这里实际上会通过 WebSocket 发送给前端
    this.transport.send('devtool-frontend', 'devtool.message', message);
  }
  
  // 发送命令到测试进程
  sendCommandToProcess(processID: string, command: string, data?: any) {
    this.transport.send(processID, command, data);
  }
  
  // 广播消息给所有进程
  broadcastMessage(messageType: string, messageData: any) {
    this.transport.broadcastLocal(messageType, messageData);
  }
}

// 使用消息代理
const messageProxy = new DevtoolMessageProxy(transport);

// 发送命令到指定进程
messageProxy.sendCommandToProcess('test-process-1', 'pause');
messageProxy.sendCommandToProcess('test-process-2', 'resume');
messageProxy.sendCommandToProcess('web-app-1', 'takeScreenshot');

// 广播消息
messageProxy.broadcastMessage('global.pause', { reason: '用户请求暂停' });
messageProxy.broadcastMessage('global.resume', { reason: '用户请求恢复' });
```

## 路由和静态资源

### 自定义路由处理器

```typescript
// routes/custom-api-handler.ts
module.exports = (req, res) => {
  const { method, url, query, body } = req;
  
  console.log(`自定义 API 请求: ${method} ${url}`);
  
  switch (method) {
    case 'GET':
      // 获取测试状态
      if (url === '/api/test/status') {
        res.json({
          status: 'running',
          activeTests: 3,
          completedTests: 15,
          timestamp: new Date().toISOString()
        });
      }
      // 获取系统信息
      else if (url === '/api/system/info') {
        res.json({
          version: '1.0.0',
          platform: process.platform,
          nodeVersion: process.version,
          memory: process.memoryUsage(),
          uptime: process.uptime()
        });
      }
      // 获取测试结果
      else if (url.startsWith('/api/test/results/')) {
        const testId = url.split('/').pop();
        res.json({
          testId,
          results: {
            passed: 8,
            failed: 2,
            skipped: 1,
            details: [
              { name: 'login test', status: 'passed', duration: 1200 },
              { name: 'navigation test', status: 'failed', duration: 800 },
              { name: 'form test', status: 'passed', duration: 1500 }
            ]
          }
        });
      }
      else {
        res.status(404).json({ error: 'API 路径不存在' });
      }
      break;
      
    case 'POST':
      // 控制测试执行
      if (url === '/api/test/control') {
        const { action, testId } = body;
        
        console.log(`测试控制动作: ${action} for ${testId}`);
        
        // 这里可以集成与测试进程的通信
        // messageProxy.sendCommandToProcess(testId, action);
        
        res.json({
          success: true,
          message: `动作 ${action} 已执行`,
          timestamp: new Date().toISOString()
        });
      }
      // 保存测试配置
      else if (url === '/api/config/save') {
        const config = body;
        
        console.log('保存测试配置:', config);
        
        // 这里可以实际保存配置到文件或数据库
        
        res.json({
          success: true,
          message: '配置保存成功'
        });
      }
      else {
        res.status(404).json({ error: 'API 路径不存在' });
      }
      break;
      
    default:
      res.status(405).json({ error: 'HTTP 方法不支持' });
  }
};

// routes/health-check.ts
module.exports = (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
};

// routes/index-page.ts
module.exports = (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Testring 开发者工具</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 2em; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 1em; background: #f0f0f0; border-radius: 5px; }
        .links { margin-top: 2em; }
        .links a { display: block; margin: 0.5em 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Testring 开发者工具</h1>
        <div class="status">
          <h2>状态信息</h2>
          <p><strong>状态:</strong> 正常运行</p>
          <p><strong>时间:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>运行时间:</strong> ${Math.floor(process.uptime())} 秒</p>
        </div>
        <div class="links">
          <h2>快速链接</h2>
          <a href="/editor">测试编辑器</a>
          <a href="/popup">弹窗调试器</a>
          <a href="/api/system/info">系统信息 API</a>
          <a href="/api/test/status">测试状态 API</a>
          <a href="/static">静态资源</a>
        </div>
      </div>
    </body>
    </html>
  `);
};
```

## 最佳实践

### 1. 服务器管理
- 使用适当的端口配置避免冲突
- 实现优雅的服务器关闭和资源清理
- 监控服务器状态和性能指标
- 实现健康检查和自动重启机制

### 2. 消息处理
- 合理设计消息代理和路由策略
- 实现消息的错误处理和重试机制
- 使用适当的消息序列化和反序列化
- 实现消息的限流和防抖动处理

### 3. 安全考虑
- 实现适当的身份验证和授权机制
- 限制只在开发环境中启用调试工具
- 避免暴露敏感的系统信息和测试数据
- 实现请求限流和防止滥用的机制

### 4. 性能优化
- 合理使用缓存和静态资源压缩
- 优化消息传输的性能和延迟
- 实现适当的连接池和资源管理
- 监控内存使用和防止内存泄漏

### 5. 开发体验
- 提供清晰的错误信息和调试信息
- 实现实时的状态反馈和进度显示
- 提供丰富的日志和调试信息
- 实现用户友好的配置和定制选项

## 故障排除

### 常见问题

#### 服务器启动失败
```bash
Error: listen EADDRINUSE: address already in use
```
解决方案：检查端口占用情况，修改配置中的端口号。

#### 子进程通信失败
```bash
Error: Worker process communication failed
```
解决方案：检查传输层配置、子进程状态、消息格式。

#### 前端资源加载失败
```bash
Error: Cannot find module '@testring/devtool-frontend'
```
解决方案：检查前端模块安装、静态资源路径配置。

#### 消息代理错误
```bash
Error: Message proxy handler not found
```
解决方案：检查消息类型注册、处理器配置、传输层状态。

### 调试技巧

```typescript
// 启用详细调试日志
process.env.DEBUG = 'testring:devtool*';

// 检查服务器状态
const devtoolServer = new DevtoolServerController(transport);

// 调试配置
console.log('默认配置:', devtoolServer.getConfig());

// 调试运行时配置
try {
  const runtimeConfig = devtoolServer.getRuntimeConfiguration();
  console.log('运行时配置:', runtimeConfig);
} catch (error) {
  console.error('配置未初始化:', error.message);
}

// 调试子进程通信
transport.on('*', (messageType, messageData, sourceId) => {
  console.log(`消息 [${messageType}] 从 [${sourceId}]:`, messageData);
});
```

## 依赖

- `@testring/pluggable-module` - 可插拔模块系统
- `@testring/transport` - 传输层通信
- `@testring/logger` - 日志系统
- `@testring/devtool-frontend` - 前端界面
- `@testring/devtool-extension` - 浏览器扩展
- `express` - Web 服务器框架
- `ws` - WebSocket 通信
- `redux` - 状态管理

## 相关模块

- `@testring/devtool-frontend` - 开发者工具前端界面
- `@testring/devtool-extension` - 浏览器扩展
- `@testring/web-application` - Web 应用测试
- `@testring/test-runner` - 测试运行器

## 许可证

MIT License
