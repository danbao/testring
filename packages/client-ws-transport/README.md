# @testring/client-ws-transport

WebSocket 客户端传输模块，作为 testring 框架的核心实时通信组件，提供完整的 WebSocket 连接管理、消息传输和错误处理能力。该模块实现了高效的实时通信机制、自动重连、消息队列和手动协议处理，为测试环境中的实时数据交换提供稳定可靠的基础设施。

[![npm version](https://badge.fury.io/js/@testring/client-ws-transport.svg)](https://www.npmjs.com/package/@testring/client-ws-transport)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## 功能概述

WebSocket 客户端传输模块是 testring 框架的实时通信核心，提供了：
- 完整的 WebSocket 连接生命周期管理
- 智能的自动重连和错误恢复机制
- 高效的消息队列和异步处理
- 完善的事件系统和状态管理
- 类型安全的 TypeScript 接口
- 标准化的手动协议和数据格式
- 灵活的配置和扩展能力
- 并发安全和线程安全的操作

## 主要特性

### 连接管理
- 自动的 WebSocket 连接建立和维护
- 灵活的连接参数配置和管理
- 实时的连接状态监控和报告
- 优雅的连接关闭和资源清理

### 错误处理
- 全面的错误捕获和分类处理
- 智能的重连策略和重试机制
- 可配置的错误恢复和容错能力
- 详细的错误信息和调试支持

### 消息处理
- 高效的消息序列化和反序列化
- 智能的消息队列和异步发送
- 可靠的消息投递和顺序保证
- 灵活的消息格式和协议支持

### 事件系统
- 完整的事件驱动架构和监听机制
- 丰富的生命周期事件和状态通知
- 可扩展的事件处理和回调系统
- 线程安全的事件分发和处理

## 安装

```bash
npm install @testring/client-ws-transport
```

或使用 yarn：

```bash
yarn add @testring/client-ws-transport
```

## 核心架构

### ClientWsTransport 类
主要的 WebSocket 客户端传输接口，继承自 `EventEmitter`：

```typescript
class ClientWsTransport extends EventEmitter implements IClientWsTransport {
  constructor(
    host: string,
    port: number,
    shouldReconnect?: boolean
  )
  
  // 连接管理
  public connect(url?: string): void
  public disconnect(): void
  public reconnect(): void
  public getConnectionStatus(): boolean
  
  // 消息传输
  public send(type: DevtoolEvents, payload: any): Promise<void>
  public handshake(appId: string): Promise<void>
  
  // 事件系统 (继承自 EventEmitter)
  public on(event: ClientWsTransportEvents, listener: Function): this
  public emit(event: ClientWsTransportEvents, ...args: any[]): boolean
}
```

### 事件类型
```typescript
enum ClientWsTransportEvents {
  OPEN = 'open',        // 连接建立
  MESSAGE = 'message',  // 消息接收
  CLOSE = 'close',      // 连接关闭
  ERROR = 'error'       // 错误事件
}

enum DevtoolEvents {
  HANDSHAKE_REQUEST = 'handshake_request',       // 手动请求
  HANDSHAKE_RESPONSE = 'handshake_response',     // 手动响应
  MESSAGE = 'message',                           // 通用消息
  REGISTER = 'register',                         // 注册事件
  UNREGISTER = 'unregister'                      // 注销事件
}
```

### 消息类型
```typescript
interface IDevtoolWSMessage {
  type: DevtoolEvents;  // 消息类型
  payload: any;         // 消息载荷
}

interface IDevtoolWSHandshakeResponseMessage {
  type: DevtoolEvents.HANDSHAKE_RESPONSE;
  payload: {
    error?: string;     // 错误信息
    success?: boolean;  // 成功标识
  };
}

interface IQueuedMessage {
  type: DevtoolEvents;  // 消息类型
  payload: any;         // 消息载荷
  resolve: () => any;   // Promise 解决回调
}
```

## 基本用法

### 创建和连接

```typescript
import { ClientWsTransport, ClientWsTransportEvents, DevtoolEvents } from '@testring/client-ws-transport';

// 创建 WebSocket 客户端
const wsClient = new ClientWsTransport(
  'localhost',  // 服务器主机
  3001,         // WebSocket 端口
  true          // 是否自动重连
);

// 监听连接事件
wsClient.on(ClientWsTransportEvents.OPEN, () => {
  console.log('WebSocket 连接已建立');
});

wsClient.on(ClientWsTransportEvents.CLOSE, () => {
  console.log('WebSocket 连接已关闭');
});

wsClient.on(ClientWsTransportEvents.ERROR, (error) => {
  console.error('WebSocket 连接错误:', error);
});

wsClient.on(ClientWsTransportEvents.MESSAGE, (message) => {
  console.log('接收到消息:', message);
});

// 建立连接
wsClient.connect();

// 检查连接状态
if (wsClient.getConnectionStatus()) {
  console.log('连接已建立');
} else {
  console.log('连接未建立');
}
```

### 消息发送和接收

```typescript
// 发送消息
async function sendMessage() {
  try {
    // 发送通用消息
    await wsClient.send(DevtoolEvents.MESSAGE, {
      action: 'test.start',
      testId: 'test-001',
      timestamp: Date.now()
    });
    
    console.log('消息发送成功');
  } catch (error) {
    console.error('消息发送失败:', error);
  }
}

// 发送注册消息
async function registerClient() {
  try {
    await wsClient.send(DevtoolEvents.REGISTER, {
      clientId: 'test-client-1',
      clientType: 'web-application',
      capabilities: ['screenshot', 'element-highlight', 'console-log']
    });
    
    console.log('客户端注册成功');
  } catch (error) {
    console.error('客户端注册失败:', error);
  }
}

// 处理接收到的消息
wsClient.on(ClientWsTransportEvents.MESSAGE, (message) => {
  const { type, payload } = message;
  
  switch (type) {
    case DevtoolEvents.MESSAGE:
      handleGeneralMessage(payload);
      break;
      
    case DevtoolEvents.REGISTER:
      handleRegistrationMessage(payload);
      break;
      
    case DevtoolEvents.UNREGISTER:
      handleUnregistrationMessage(payload);
      break;
      
    default:
      console.log('未知消息类型:', type, payload);
  }
});

function handleGeneralMessage(payload: any) {
  console.log('处理通用消息:', payload);
  
  if (payload.action === 'test.status') {
    updateTestStatus(payload.testId, payload.status);
  } else if (payload.action === 'screenshot.request') {
    takeScreenshot(payload.options);
  }
}

function handleRegistrationMessage(payload: any) {
  console.log('处理注册消息:', payload);
  // 处理其他客户端的注册信息
}

function handleUnregistrationMessage(payload: any) {
  console.log('处理注销消息:', payload);
  // 处理其他客户端的注销信息
}

// 执行消息发送
sendMessage();
registerClient();
```

### 手动协议处理

```typescript
// 执行手动协议
async function performHandshake() {
  try {
    // 等待连接建立
    await new Promise<void>((resolve) => {
      if (wsClient.getConnectionStatus()) {
        resolve();
      } else {
        wsClient.once(ClientWsTransportEvents.OPEN, resolve);
      }
    });
    
    console.log('正在执行手动协议...');
    
    // 执行手动
    await wsClient.handshake('test-app-001');
    
    console.log('手动协议完成');
    
    // 手动成功后的操作
    await initializeApplication();
    
  } catch (error) {
    console.error('手动协议失败:', error);
    
    // 手动失败的处理逻辑
    handleHandshakeFailure(error);
  }
}

async function initializeApplication() {
  console.log('初始化应用程序...');
  
  // 注册客户端
  await wsClient.send(DevtoolEvents.REGISTER, {
    appId: 'test-app-001',
    version: '1.0.0',
    timestamp: Date.now()
  });
  
  // 发送初始状态
  await wsClient.send(DevtoolEvents.MESSAGE, {
    action: 'app.ready',
    status: 'initialized'
  });
}

function handleHandshakeFailure(error: Error) {
  console.error('手动失败，尝试重连...', error.message);
  
  // 延迟重试
  setTimeout(() => {
    wsClient.reconnect();
    setTimeout(performHandshake, 1000);
  }, 3000);
}

// 在连接建立后执行手动
wsClient.on(ClientWsTransportEvents.OPEN, () => {
  performHandshake();
});

// 开始连接
wsClient.connect();
```

## 高级功能和配置

### 自定义连接管理器

```typescript
class AdvancedWsClient {
  private wsClient: ClientWsTransport;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval?: NodeJS.Timeout;
  private isAuthenticated = false;
  
  constructor(host: string, port: number) {
    this.wsClient = new ClientWsTransport(host, port, false); // 禁用自动重连
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    this.wsClient.on(ClientWsTransportEvents.OPEN, () => {
      console.log('连接建立成功');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.authenticate();
    });
    
    this.wsClient.on(ClientWsTransportEvents.CLOSE, () => {
      console.log('连接已关闭');
      this.isAuthenticated = false;
      this.stopHeartbeat();
      this.attemptReconnect();
    });
    
    this.wsClient.on(ClientWsTransportEvents.ERROR, (error) => {
      console.error('连接错误:', error);
      this.handleConnectionError(error);
    });
    
    this.wsClient.on(ClientWsTransportEvents.MESSAGE, (message) => {
      this.handleMessage(message);
    });
  }
  
  // 身份验证
  private async authenticate() {
    try {
      await this.wsClient.handshake('advanced-client');
      
      // 发送身份验证信息
      await this.wsClient.send(DevtoolEvents.MESSAGE, {
        action: 'auth.login',
        credentials: {
          token: process.env.AUTH_TOKEN || 'default-token',
          clientId: 'advanced-client',
          version: '2.0.0'
        }
      });
      
      console.log('身份验证请求已发送');
    } catch (error) {
      console.error('身份验证失败:', error);
    }
  }
  
  // 心跳机制
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      if (this.wsClient.getConnectionStatus()) {
        try {
          await this.wsClient.send(DevtoolEvents.MESSAGE, {
            action: 'heartbeat',
            timestamp: Date.now()
          });
        } catch (error) {
          console.warn('心跳发送失败:', error);
        }
      }
    }, 30000); // 每 30 秒发送一次心跳
  }
  
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }
  
  // 智能重连
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`重连尝试次数超过限制 (${this.maxReconnectAttempts})`);
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 指数退避
    
    console.log(`${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连...`);
    
    setTimeout(() => {
      this.wsClient.connect();
    }, delay);
  }
  
  // 连接错误处理
  private handleConnectionError(error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.error('服务器拒绝连接，请检查服务器状态');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('连接超时，请检查网络连接');
    } else {
      console.error('未知连接错误:', error);
    }
  }
  
  // 消息处理
  private handleMessage(message: any) {
    const { type, payload } = message;
    
    if (type === DevtoolEvents.MESSAGE) {
      switch (payload.action) {
        case 'auth.success':
          this.isAuthenticated = true;
          console.log('身份验证成功');
          this.onAuthenticationSuccess();
          break;
          
        case 'auth.failed':
          console.error('身份验证失败:', payload.error);
          this.onAuthenticationFailure(payload.error);
          break;
          
        case 'heartbeat.response':
          // 心跳响应
          break;
          
        case 'server.shutdown':
          console.log('服务器即将关闭');
          this.gracefulShutdown();
          break;
          
        default:
          this.handleCustomMessage(payload);
      }
    }
  }
  
  private onAuthenticationSuccess() {
    // 身份验证成功后的初始化操作
    this.registerCapabilities();
  }
  
  private onAuthenticationFailure(error: string) {
    // 身份验证失败处理
    console.error('身份验证失败，关闭连接');
    this.wsClient.disconnect();
  }
  
  private async registerCapabilities() {
    await this.wsClient.send(DevtoolEvents.REGISTER, {
      clientType: 'advanced-client',
      capabilities: [
        'real-time-monitoring',
        'performance-tracking',
        'error-reporting',
        'screenshot-capture'
      ],
      metadata: {
        version: '2.0.0',
        platform: process.platform,
        nodeVersion: process.version
      }
    });
  }
  
  private handleCustomMessage(payload: any) {
    // 处理自定义消息
    console.log('自定义消息:', payload);
  }
  
  private gracefulShutdown() {
    console.log('执行优雅关闭...');
    this.stopHeartbeat();
    this.wsClient.disconnect();
  }
  
  // 公共 API
  public connect() {
    this.wsClient.connect();
  }
  
  public disconnect() {
    this.gracefulShutdown();
  }
  
  public async sendMessage(action: string, data: any) {
    if (!this.isAuthenticated) {
      throw new Error('客户端未身份验证');
    }
    
    return this.wsClient.send(DevtoolEvents.MESSAGE, {
      action,
      data,
      timestamp: Date.now()
    });
  }
  
  public getConnectionInfo() {
    return {
      connected: this.wsClient.getConnectionStatus(),
      authenticated: this.isAuthenticated,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// 使用高级客户端
const advancedClient = new AdvancedWsClient('localhost', 3001);

// 连接并使用
advancedClient.connect();

// 等待片刻后发送消息
setTimeout(async () => {
  try {
    await advancedClient.sendMessage('test.execute', {
      testSuite: 'integration-tests',
      environment: 'staging'
    });
    
    console.log('测试执行命令已发送');
  } catch (error) {
    console.error('发送消息失败:', error.message);
  }
}, 5000);

// 监控连接状态
setInterval(() => {
  const info = advancedClient.getConnectionInfo();
  console.log('连接状态:', info);
}, 10000);
```

### 消息队列和批量处理

```typescript
class MessageQueueManager {
  private wsClient: ClientWsTransport;
  private messageQueue: Array<{ type: DevtoolEvents; payload: any; priority: number }> = [];
  private processingQueue = false;
  private batchSize = 10;
  private batchInterval = 1000;
  
  constructor(wsClient: ClientWsTransport) {
    this.wsClient = wsClient;
    this.startBatchProcessing();
  }
  
  // 添加消息到队列
  public enqueueMessage(type: DevtoolEvents, payload: any, priority = 1) {
    this.messageQueue.push({ type, payload, priority });
    
    // 按优先级排序（高优先级在前）
    this.messageQueue.sort((a, b) => b.priority - a.priority);
    
    console.log(`消息已入队，当前队列长度: ${this.messageQueue.length}`);
  }
  
  // 开始批量处理
  private startBatchProcessing() {
    setInterval(async () => {
      if (!this.processingQueue && this.messageQueue.length > 0) {
        await this.processBatch();
      }
    }, this.batchInterval);
  }
  
  // 处理一批消息
  private async processBatch() {
    if (this.processingQueue || !this.wsClient.getConnectionStatus()) {
      return;
    }
    
    this.processingQueue = true;
    
    try {
      const batch = this.messageQueue.splice(0, this.batchSize);
      
      if (batch.length > 0) {
        console.log(`正在处理批次消息，数量: ${batch.length}`);
        
        // 并发发送消息
        const promises = batch.map(({ type, payload }) => 
          this.wsClient.send(type, payload).catch(error => {
            console.error('消息发送失败:', error);
            // 将失败的消息重新入队
            this.enqueueMessage(type, payload, 0); // 低优先级重试
          })
        );
        
        await Promise.all(promises);
        console.log('批次消息处理完成');
      }
    } catch (error) {
      console.error('批量处理错误:', error);
    } finally {
      this.processingQueue = false;
    }
  }
  
  // 获取队列状态
  public getQueueStatus() {
    return {
      queueLength: this.messageQueue.length,
      processing: this.processingQueue,
      connected: this.wsClient.getConnectionStatus()
    };
  }
  
  // 清空队列
  public clearQueue() {
    this.messageQueue = [];
    console.log('消息队列已清空');
  }
}

// 使用消息队列管理器
const wsClient = new ClientWsTransport('localhost', 3001, true);
const queueManager = new MessageQueueManager(wsClient);

// 连接建立后开始发送消息
wsClient.on(ClientWsTransportEvents.OPEN, async () => {
  // 执行手动
  await wsClient.handshake('queue-client');
  
  // 发送不同优先级的消息
  queueManager.enqueueMessage(DevtoolEvents.MESSAGE, {
    action: 'test.critical',
    data: '紧急消息'
  }, 10); // 高优先级
  
  queueManager.enqueueMessage(DevtoolEvents.MESSAGE, {
    action: 'test.normal',
    data: '普通消息'
  }, 5); // 中优先级
  
  queueManager.enqueueMessage(DevtoolEvents.MESSAGE, {
    action: 'test.low',
    data: '低优先级消息'
  }, 1); // 低优先级
  
  // 批量添加消息
  for (let i = 0; i < 50; i++) {
    queueManager.enqueueMessage(DevtoolEvents.MESSAGE, {
      action: 'test.batch',
      index: i,
      timestamp: Date.now()
    }, Math.floor(Math.random() * 10));
  }
});

// 定期检查队列状态
setInterval(() => {
  const status = queueManager.getQueueStatus();
  console.log('队列状态:', status);
}, 5000);

wsClient.connect();
```

## 性能优化和监控

### 性能监控器

```typescript
class PerformanceMonitor {
  private wsClient: ClientWsTransport;
  private metrics = {
    messagesSent: 0,
    messagesReceived: 0,
    errorsCount: 0,
    averageLatency: 0,
    connectionUptime: 0,
    lastConnectionTime: 0
  };
  private latencyHistory: number[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  
  constructor(wsClient: ClientWsTransport) {
    this.wsClient = wsClient;
    this.setupMonitoring();
  }
  
  private setupMonitoring() {
    // 监听连接事件
    this.wsClient.on(ClientWsTransportEvents.OPEN, () => {
      this.metrics.lastConnectionTime = Date.now();
      this.startUptimeTracking();
    });
    
    this.wsClient.on(ClientWsTransportEvents.CLOSE, () => {
      this.stopUptimeTracking();
    });
    
    this.wsClient.on(ClientWsTransportEvents.ERROR, () => {
      this.metrics.errorsCount++;
    });
    
    this.wsClient.on(ClientWsTransportEvents.MESSAGE, () => {
      this.metrics.messagesReceived++;
    });
    
    // 包装发送方法以监控延迟
    this.wrapSendMethod();
  }
  
  private wrapSendMethod() {
    const originalSend = this.wsClient.send.bind(this.wsClient);
    
    this.wsClient.send = async (type: DevtoolEvents, payload: any): Promise<void> => {
      const startTime = Date.now();
      
      try {
        await originalSend(type, payload);
        
        const latency = Date.now() - startTime;
        this.recordLatency(latency);
        this.metrics.messagesSent++;
        
      } catch (error) {
        this.metrics.errorsCount++;
        throw error;
      }
    };
  }
  
  private recordLatency(latency: number) {
    this.latencyHistory.push(latency);
    
    // 保持最近 100 次延迟记录
    if (this.latencyHistory.length > 100) {
      this.latencyHistory.shift();
    }
    
    // 计算平均延迟
    this.metrics.averageLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
  }
  
  private startUptimeTracking() {
    this.monitoringInterval = setInterval(() => {
      if (this.wsClient.getConnectionStatus()) {
        this.metrics.connectionUptime = Date.now() - this.metrics.lastConnectionTime;
      }
    }, 1000);
  }
  
  private stopUptimeTracking() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }
  
  // 获取性能指标
  public getMetrics() {
    return {
      ...this.metrics,
      connected: this.wsClient.getConnectionStatus(),
      latencyHistory: [...this.latencyHistory],
      uptimeFormatted: this.formatUptime(this.metrics.connectionUptime)
    };
  }
  
  // 获取详细统计
  public getDetailedStats() {
    const latencies = this.latencyHistory;
    
    return {
      connection: {
        status: this.wsClient.getConnectionStatus(),
        uptime: this.formatUptime(this.metrics.connectionUptime),
        lastConnected: new Date(this.metrics.lastConnectionTime).toISOString()
      },
      messages: {
        sent: this.metrics.messagesSent,
        received: this.metrics.messagesReceived,
        total: this.metrics.messagesSent + this.metrics.messagesReceived,
        errorRate: this.metrics.errorsCount / (this.metrics.messagesSent || 1)
      },
      performance: {
        averageLatency: Math.round(this.metrics.averageLatency),
        minLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
        maxLatency: latencies.length > 0 ? Math.max(...latencies) : 0,
        latencyPercentiles: this.calculatePercentiles(latencies)
      },
      errors: {
        count: this.metrics.errorsCount,
        rate: this.metrics.errorsCount / (this.metrics.messagesSent || 1)
      }
    };
  }
  
  private calculatePercentiles(values: number[]) {
    if (values.length === 0) return { p50: 0, p90: 0, p95: 0, p99: 0 };
    
    const sorted = [...values].sort((a, b) => a - b);
    const len = sorted.length;
    
    return {
      p50: sorted[Math.floor(len * 0.5)],
      p90: sorted[Math.floor(len * 0.9)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)]
    };
  }
  
  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}小时 ${minutes % 60}分钟 ${seconds % 60}秒`;
    } else if (minutes > 0) {
      return `${minutes}分钟 ${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  }
  
  // 重置指标
  public resetMetrics() {
    this.metrics = {
      messagesSent: 0,
      messagesReceived: 0,
      errorsCount: 0,
      averageLatency: 0,
      connectionUptime: 0,
      lastConnectionTime: Date.now()
    };
    this.latencyHistory = [];
    
    console.log('性能指标已重置');
  }
  
  // 生成性能报告
  public generateReport(): string {
    const stats = this.getDetailedStats();
    
    return `
=== WebSocket 性能报告 ===

连接状态: ${stats.connection.status ? '已连接' : '未连接'}
连接时间: ${stats.connection.uptime}
最后连接: ${stats.connection.lastConnected}

消息统计:
- 已发送: ${stats.messages.sent}
- 已接收: ${stats.messages.received}
- 总计: ${stats.messages.total}
- 错误率: ${(stats.messages.errorRate * 100).toFixed(2)}%

性能指标:
- 平均延迟: ${stats.performance.averageLatency}ms
- 最小延迟: ${stats.performance.minLatency}ms
- 最大延迟: ${stats.performance.maxLatency}ms
- P50: ${stats.performance.latencyPercentiles.p50}ms
- P90: ${stats.performance.latencyPercentiles.p90}ms
- P95: ${stats.performance.latencyPercentiles.p95}ms
- P99: ${stats.performance.latencyPercentiles.p99}ms

错误统计:
- 错误次数: ${stats.errors.count}
- 错误率: ${(stats.errors.rate * 100).toFixed(2)}%

=========================
    `;
  }
}

// 使用性能监控器
const wsClient = new ClientWsTransport('localhost', 3001, true);
const monitor = new PerformanceMonitor(wsClient);

// 定期输出性能指标
setInterval(() => {
  const metrics = monitor.getMetrics();
  console.log('实时指标:', {
    connected: metrics.connected,
    sent: metrics.messagesSent,
    received: metrics.messagesReceived,
    avgLatency: Math.round(metrics.averageLatency),
    errors: metrics.errorsCount,
    uptime: metrics.uptimeFormatted
  });
}, 10000);

// 定期生成详细报告
setInterval(() => {
  console.log(monitor.generateReport());
}, 60000);

wsClient.connect();
```

## 最佳实践

### 1. 连接管理
- 合理设置重连策略和重试次数
- 实现适当的连接超时和心跳机制
- 监控连接状态和网络质量
- 处理网络间歇性问题和连接中断

### 2. 消息处理
- 使用适当的消息序列化和反序列化
- 实现消息的缓存和队列管理
- 处理大消息的分片和重组
- 实现消息的加密和压缩（如需）

### 3. 错误处理
- 建立全面的错误分类和处理策略
- 实现智能的重试和恢复机制
- 记录详细的错误日志和调试信息
- 提供用户友好的错误提示和解决建议

### 4. 性能优化
- 监控和优化消息传输的延迟和吞吐量
- 合理使用消息批量处理和队列
- 实现适当的内存管理和资源清理
- 优化网络使用和带宽消耗

### 5. 安全考虑
- 实现适当的身份验证和授权机制
- 使用安全的 WebSocket 连接（WSS）
- 验证和过滤传入的消息数据
- 避免暴露敏感信息和凭据

## 故障排除

### 常见问题

#### 连接失败
```bash
Error: WebSocket connection failed
```
解决方案：检查服务器地址、端口配置、网络连接、防火墙设置。

#### 消息发送失败
```bash
Error: WebSocket connection not OPEN
```
解决方案：检查连接状态、实现消息队列、等待连接建立。

#### 手动失败
```bash
Error: Handshake failed
```
解决方案：检查应用 ID配置、服务器状态、协议版本兼容性。

#### 消息解析错误
```bash
SyntaxError: Unexpected token in JSON
```
解决方案：检查消息格式、JSON 序列化、数据编码问题。

### 调试技巧

```typescript
// 启用详细调试日志
const wsClient = new ClientWsTransport('localhost', 3001, true);

// 监听所有事件
wsClient.on(ClientWsTransportEvents.OPEN, () => {
  console.log('连接已建立');
});

wsClient.on(ClientWsTransportEvents.MESSAGE, (message) => {
  console.log('接收消息:', message);
});

wsClient.on(ClientWsTransportEvents.ERROR, (error) => {
  console.error('连接错误:', error);
});

wsClient.on(ClientWsTransportEvents.CLOSE, () => {
  console.log('连接已关闭');
});

// 检查连接状态
console.log('连接状态:', wsClient.getConnectionStatus());

// 检查 WebSocket 原生对象
console.log('WebSocket readyState:', wsClient.connection?.readyState);
```

## 依赖

- `@testring/types` - 类型定义
- `@testring/utils` - 工具函数
- `events` - Node.js 事件系统

## 相关模块

- `@testring/devtool-backend` - 开发者工具后端
- `@testring/transport` - 传输层通信
- `@testring/logger` - 日志系统

## 许可证

MIT License