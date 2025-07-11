# @testring/http-api

HTTP API 测试模块，作为 testring 框架的核心网络请求层，提供完整的 HTTP/HTTPS 接口测试能力。该模块封装了丰富的 HTTP 操作方法、Cookie 管理、请求队列和错误处理机制，是进行 API 自动化测试的核心组件。

[![npm version](https://badge.fury.io/js/@testring/http-api.svg)](https://www.npmjs.com/package/@testring/http-api)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## 功能概述

HTTP API 测试模块是 testring 框架的网络请求核心，提供了：
- 完整的 HTTP 方法支持（GET、POST、PUT、DELETE 等）
- 智能请求队列和节流控制
- Cookie 会话管理和自动处理
- 请求响应拦截和处理
- 错误处理和重试机制
- 请求参数验证和格式化
- 完整响应或仅响应体返回选择
- 基于传输层的消息通信

## 主要特性

### HTTP 请求
- 支持所有标准 HTTP 方法
- 自动请求参数验证
- 灵活的请求配置选项
- 完整的请求/响应生命周期管理

### Cookie 管理
- 自动 Cookie 存储和发送
- 跨请求 Cookie 会话保持
- 手动 Cookie 操作支持
- 基于 URL 的 Cookie 作用域管理

### 请求队列
- 智能请求排队机制
- 可配置的请求节流控制
- 并发请求管理
- 队列状态监控

### 传输层集成
- 基于 testring 传输层架构
- 进程间消息通信支持
- 统一的消息广播机制
- 详细的请求日志记录

## 安装

```bash
npm install @testring/http-api
```

或使用 yarn：

```bash
yarn add @testring/http-api
```

## 核心架构

### HttpClient 类
主要的 HTTP 客户端接口，继承自 `AbstractHttpClient`：

```typescript
class HttpClient extends AbstractHttpClient {
  constructor(
    transport: ITransport,
    params?: Partial<HttpClientParams>
  )
  
  // HTTP 方法
  public get(options: IHttpRequest, cookieJar?: IHttpCookieJar): Promise<any>
  public post(options: IHttpRequest, cookieJar?: IHttpCookieJar): Promise<any>
  public put(options: IHttpRequest, cookieJar?: IHttpCookieJar): Promise<any>
  public delete(options: IHttpRequest, cookieJar?: IHttpCookieJar): Promise<any>
  public send(options: IHttpRequest, cookieJar?: IHttpCookieJar): Promise<any>
  
  // Cookie 管理
  public createCookieJar(): IHttpCookieJar
}
```

### 配置选项
```typescript
interface HttpClientParams {
  httpThrottle: number;  // 请求节流间隔（毫秒）
}

interface IHttpRequest {
  url: string;                    // 请求 URL
  method?: string;                // HTTP 方法
  headers?: Record<string, any>;  // 请求头
  body?: any;                     // 请求体
  json?: boolean;                 // 是否 JSON 格式
  form?: Record<string, any>;     // 表单数据
  qs?: Record<string, any>;       // 查询参数
  timeout?: number;               // 超时时间
  resolveWithFullResponse?: boolean;  // 返回完整响应
  simple?: boolean;               // 简单模式
  cookies?: string[];             // Cookie 列表
}
```

## 基本用法

### 创建 HTTP 客户端

```typescript
import { HttpClient } from '@testring/http-api';
import { transport } from '@testring/transport';

// 创建 HTTP 客户端实例
const httpClient = new HttpClient(transport, {
  httpThrottle: 100  // 请求间隔 100ms
});

// 创建 Cookie 会话
const cookieJar = httpClient.createCookieJar();
```

### GET 请求

```typescript
// 简单 GET 请求
const response = await httpClient.get({
  url: 'https://api.example.com/users'
});

console.log('用户列表:', response);

// 带查询参数的 GET 请求
const users = await httpClient.get({
  url: 'https://api.example.com/users',
  qs: {
    page: 1,
    limit: 10,
    status: 'active'
  }
});

// 带请求头的 GET 请求
const userData = await httpClient.get({
  url: 'https://api.example.com/user/profile',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Accept': 'application/json',
    'User-Agent': 'TestString/1.0'
  }
}, cookieJar);

// 获取完整响应信息
const fullResponse = await httpClient.get({
  url: 'https://api.example.com/status',
  resolveWithFullResponse: true
});

console.log('状态码:', fullResponse.statusCode);
console.log('响应头:', fullResponse.headers);
console.log('响应体:', fullResponse.body);
```

### POST 请求

```typescript
// JSON 数据 POST 请求
const newUser = await httpClient.post({
  url: 'https://api.example.com/users',
  json: true,
  body: {
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'user'
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  }
}, cookieJar);

console.log('创建的用户:', newUser);

// 表单数据 POST 请求
const loginResult = await httpClient.post({
  url: 'https://api.example.com/auth/login',
  form: {
    username: 'testuser',
    password: 'password123',
    remember: true
  }
}, cookieJar);

// 文件上传 POST 请求
const uploadResult = await httpClient.post({
  url: 'https://api.example.com/upload',
  formData: {
    file: {
      value: fileBuffer,
      options: {
        filename: 'document.pdf',
        contentType: 'application/pdf'
      }
    },
    description: '用户文档'
  }
});
```

### PUT 和 DELETE 请求

```typescript
// PUT 请求更新用户信息
const updatedUser = await httpClient.put({
  url: 'https://api.example.com/users/123',
  json: true,
  body: {
    name: '李四',
    email: 'lisi@example.com',
    status: 'active'
  },
  headers: {
    'Authorization': 'Bearer token123'
  }
}, cookieJar);

// DELETE 请求删除用户
const deleteResult = await httpClient.delete({
  url: 'https://api.example.com/users/123',
  headers: {
    'Authorization': 'Bearer token123'
  }
}, cookieJar);

console.log('删除结果:', deleteResult);

// PATCH 请求（使用 send 方法）
const patchResult = await httpClient.send({
  url: 'https://api.example.com/users/123',
  method: 'PATCH',
  json: true,
  body: {
    status: 'inactive'
  }
});
```

## Cookie 会话管理

### 基础 Cookie 操作

```typescript
import { HttpCookieJar } from '@testring/http-api';

// 创建 Cookie 会话
const cookieJar = httpClient.createCookieJar();

// 手动设置 Cookie
cookieJar.setCookie('sessionId=abc123def456', 'https://api.example.com');

// 创建复杂 Cookie
const customCookie = cookieJar.createCookie({
  key: 'authToken',
  value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  domain: '.example.com',
  path: '/api',
  httpOnly: true,
  secure: true,
  maxAge: 3600
});

cookieJar.setCookie(customCookie, 'https://api.example.com');

// 获取指定 URL 的所有 Cookie
const cookies = cookieJar.getCookies('https://api.example.com/users');
console.log('当前 Cookie:', cookies);
```

### 会话保持示例

```typescript
class ApiTestSession {
  private httpClient: HttpClient;
  private cookieJar: IHttpCookieJar;
  private authToken: string | null = null;
  
  constructor(transport: ITransport) {
    this.httpClient = new HttpClient(transport, { httpThrottle: 50 });
    this.cookieJar = this.httpClient.createCookieJar();
  }
  
  // 登录并保持会话
  async login(username: string, password: string) {
    const loginResponse = await this.httpClient.post({
      url: 'https://api.example.com/auth/login',
      json: true,
      body: { username, password }
    }, this.cookieJar);
    
    this.authToken = loginResponse.token;
    
    // Cookie 会自动保存在 cookieJar 中
    console.log('登录成功，Token:', this.authToken);
    return loginResponse;
  }
  
  // 认证后的 API 请求
  async getProfile() {
    return await this.httpClient.get({
      url: 'https://api.example.com/user/profile',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    }, this.cookieJar);
  }
  
  // 创建资源
  async createResource(data: any) {
    return await this.httpClient.post({
      url: 'https://api.example.com/resources',
      json: true,
      body: data,
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    }, this.cookieJar);
  }
  
  // 注销
  async logout() {
    await this.httpClient.post({
      url: 'https://api.example.com/auth/logout',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    }, this.cookieJar);
    
    this.authToken = null;
  }
}

// 使用示例
const session = new ApiTestSession(transport);
await session.login('testuser', 'password123');
const profile = await session.getProfile();
const newResource = await session.createResource({ name: '测试资源' });
await session.logout();
```

## 高级配置和选项

### 请求超时和重试

```typescript
// 设置请求超时
const timeoutResponse = await httpClient.get({
  url: 'https://slow-api.example.com/data',
  timeout: 30000  // 30秒超时
});

// 自定义重试逻辑
class RetryableHttpClient {
  constructor(private httpClient: HttpClient) {}
  
  async requestWithRetry(
    requestOptions: IHttpRequest,
    maxRetries = 3,
    delay = 1000,
    cookieJar?: IHttpCookieJar
  ) {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await this.httpClient.send(requestOptions, cookieJar);
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries) {
          console.log(`请求失败，${delay}ms后重试 (${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // 指数退避
        }
      }
    }
    
    throw lastError!;
  }
}

const retryClient = new RetryableHttpClient(httpClient);
const result = await retryClient.requestWithRetry({
  url: 'https://unreliable-api.example.com/data'
}, 3, 1000, cookieJar);
```

### 请求拦截和处理

```typescript
class InterceptingHttpClient {
  constructor(
    private httpClient: HttpClient,
    private baseUrl: string = '',
    private defaultHeaders: Record<string, string> = {}
  ) {}
  
  // 请求预处理
  private preprocessRequest(options: IHttpRequest): IHttpRequest {
    return {
      ...options,
      url: options.url.startsWith('http') ? options.url : `${this.baseUrl}${options.url}`,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    };
  }
  
  // 响应后处理
  private postprocessResponse(response: any): any {
    // 统一错误处理
    if (response && response.error) {
      throw new Error(`API 错误: ${response.error.message}`);
    }
    
    // 数据转换
    if (response && response.data) {
      return response.data;
    }
    
    return response;
  }
  
  async get(options: IHttpRequest, cookieJar?: IHttpCookieJar) {
    const processedOptions = this.preprocessRequest(options);
    const response = await this.httpClient.get(processedOptions, cookieJar);
    return this.postprocessResponse(response);
  }
  
  async post(options: IHttpRequest, cookieJar?: IHttpCookieJar) {
    const processedOptions = this.preprocessRequest(options);
    const response = await this.httpClient.post(processedOptions, cookieJar);
    return this.postprocessResponse(response);
  }
}

// 使用示例
const apiClient = new InterceptingHttpClient(
  httpClient,
  'https://api.example.com',
  {
    'User-Agent': 'TestString-API-Client/1.0',
    'Accept': 'application/json'
  }
);

const users = await apiClient.get({ url: '/users' }, cookieJar);
```

## 请求队列和节流

### 节流控制

```typescript
// 创建带节流的客户端
const throttledClient = new HttpClient(transport, {
  httpThrottle: 500  // 每个请求间隔 500ms
});

// 并发请求会自动排队
const requests = [
  throttledClient.get({ url: 'https://api.example.com/users/1' }),
  throttledClient.get({ url: 'https://api.example.com/users/2' }),
  throttledClient.get({ url: 'https://api.example.com/users/3' }),
  throttledClient.get({ url: 'https://api.example.com/users/4' }),
  throttledClient.get({ url: 'https://api.example.com/users/5' })
];

// 这些请求会按队列顺序执行，每个间隔 500ms
const results = await Promise.all(requests);
console.log('所有用户数据:', results);
```

### 批量请求处理

```typescript
class BatchHttpClient {
  constructor(
    private httpClient: HttpClient,
    private batchSize: number = 5,
    private batchDelay: number = 1000
  ) {}
  
  async processBatch<T>(
    requests: IHttpRequest[],
    cookieJar?: IHttpCookieJar
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += this.batchSize) {
      const batch = requests.slice(i, i + this.batchSize);
      
      console.log(`处理批次 ${Math.floor(i / this.batchSize) + 1}, 请求数: ${batch.length}`);
      
      const batchPromises = batch.map(request => 
        this.httpClient.send(request, cookieJar)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // 批次间延迟
      if (i + this.batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, this.batchDelay));
      }
    }
    
    return results;
  }
}

// 使用示例
const batchClient = new BatchHttpClient(httpClient, 3, 2000);

const userRequests = Array.from({ length: 10 }, (_, i) => ({
  url: `https://api.example.com/users/${i + 1}`
}));

const allUsers = await batchClient.processBatch(userRequests, cookieJar);
console.log('批量获取的用户:', allUsers);
```

## 错误处理和调试

### 综合错误处理

```typescript
class RobustApiClient {
  constructor(private httpClient: HttpClient) {}
  
  async safeRequest(
    options: IHttpRequest,
    cookieJar?: IHttpCookieJar
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const data = await this.httpClient.send(options, cookieJar);
      return { success: true, data };
    } catch (error) {
      console.error('请求失败:', {
        url: options.url,
        method: options.method || 'GET',
        error: error.message
      });
      
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }
  
  private formatError(error: any): string {
    if (error.code === 'ECONNREFUSED') {
      return '连接被拒绝，请检查服务器状态';
    }
    
    if (error.code === 'ETIMEDOUT') {
      return '请求超时，请检查网络连接';
    }
    
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          return '请求参数错误';
        case 401:
          return '认证失败，请检查凭据';
        case 403:
          return '权限不足';
        case 404:
          return '资源不存在';
        case 429:
          return '请求过于频繁，请稍后重试';
        case 500:
          return '服务器内部错误';
        default:
          return `HTTP ${error.statusCode}: ${error.message || '未知错误'}`;
      }
    }
    
    return error.message || '未知错误';
  }
  
  async validateResponse(response: any, schema: any): Promise<boolean> {
    // 实现响应验证逻辑
    try {
      // 这里可以集成 JSON Schema 验证
      return true;
    } catch (error) {
      console.error('响应验证失败:', error.message);
      return false;
    }
  }
}

// 使用示例
const robustClient = new RobustApiClient(httpClient);

const result = await robustClient.safeRequest({
  url: 'https://api.example.com/users',
  timeout: 10000
}, cookieJar);

if (result.success) {
  console.log('请求成功:', result.data);
} else {
  console.error('请求失败:', result.error);
}
```

### 请求日志和监控

```typescript
class LoggingHttpClient {
  constructor(
    private httpClient: HttpClient,
    private enableLogging: boolean = true
  ) {}
  
  private logRequest(options: IHttpRequest, startTime: number) {
    if (!this.enableLogging) return;
    
    console.log(`[HTTP] ${options.method || 'GET'} ${options.url}`, {
      timestamp: new Date().toISOString(),
      startTime,
      headers: options.headers,
      body: options.body ? '有请求体' : '无请求体'
    });
  }
  
  private logResponse(
    options: IHttpRequest,
    response: any,
    startTime: number,
    error?: Error
  ) {
    if (!this.enableLogging) return;
    
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error(`[HTTP] ${options.method || 'GET'} ${options.url} FAILED`, {
        duration: `${duration}ms`,
        error: error.message
      });
    } else {
      console.log(`[HTTP] ${options.method || 'GET'} ${options.url} SUCCESS`, {
        duration: `${duration}ms`,
        statusCode: response.statusCode || 'N/A',
        responseSize: JSON.stringify(response).length
      });
    }
  }
  
  async request(
    method: 'get' | 'post' | 'put' | 'delete',
    options: IHttpRequest,
    cookieJar?: IHttpCookieJar
  ) {
    const startTime = Date.now();
    this.logRequest(options, startTime);
    
    try {
      const response = await this.httpClient[method](options, cookieJar);
      this.logResponse(options, response, startTime);
      return response;
    } catch (error) {
      this.logResponse(options, null, startTime, error as Error);
      throw error;
    }
  }
  
  get(options: IHttpRequest, cookieJar?: IHttpCookieJar) {
    return this.request('get', options, cookieJar);
  }
  
  post(options: IHttpRequest, cookieJar?: IHttpCookieJar) {
    return this.request('post', options, cookieJar);
  }
}

const loggingClient = new LoggingHttpClient(httpClient);
```

## 测试场景示例

### API 集成测试

```typescript
class ApiIntegrationTest {
  private httpClient: HttpClient;
  private cookieJar: IHttpCookieJar;
  private baseUrl: string;
  
  constructor(transport: ITransport, baseUrl: string) {
    this.httpClient = new HttpClient(transport, { httpThrottle: 100 });
    this.cookieJar = this.httpClient.createCookieJar();
    this.baseUrl = baseUrl;
  }
  
  // 完整的用户管理测试流程
  async testUserManagement() {
    console.log('开始用户管理集成测试...');
    
    // 1. 管理员登录
    const loginResponse = await this.httpClient.post({
      url: `${this.baseUrl}/auth/login`,
      json: true,
      body: {
        username: 'admin',
        password: 'admin123'
      }
    }, this.cookieJar);
    
    console.log('✓ 管理员登录成功');
    
    // 2. 创建新用户
    const newUser = await this.httpClient.post({
      url: `${this.baseUrl}/users`,
      json: true,
      body: {
        name: '测试用户',
        email: 'test@example.com',
        role: 'user'
      },
      headers: {
        'Authorization': `Bearer ${loginResponse.token}`
      }
    }, this.cookieJar);
    
    console.log('✓ 新用户创建成功:', newUser.id);
    
    // 3. 获取用户列表
    const users = await this.httpClient.get({
      url: `${this.baseUrl}/users`,
      qs: { page: 1, limit: 10 },
      headers: {
        'Authorization': `Bearer ${loginResponse.token}`
      }
    }, this.cookieJar);
    
    console.log('✓ 用户列表获取成功，用户数量:', users.length);
    
    // 4. 更新用户信息
    const updatedUser = await this.httpClient.put({
      url: `${this.baseUrl}/users/${newUser.id}`,
      json: true,
      body: {
        name: '更新的测试用户',
        status: 'active'
      },
      headers: {
        'Authorization': `Bearer ${loginResponse.token}`
      }
    }, this.cookieJar);
    
    console.log('✓ 用户信息更新成功');
    
    // 5. 删除用户
    await this.httpClient.delete({
      url: `${this.baseUrl}/users/${newUser.id}`,
      headers: {
        'Authorization': `Bearer ${loginResponse.token}`
      }
    }, this.cookieJar);
    
    console.log('✓ 用户删除成功');
    
    // 6. 注销
    await this.httpClient.post({
      url: `${this.baseUrl}/auth/logout`,
      headers: {
        'Authorization': `Bearer ${loginResponse.token}`
      }
    }, this.cookieJar);
    
    console.log('✓ 管理员注销成功');
    console.log('用户管理集成测试完成！');
  }
  
  // 性能测试
  async performanceTest(concurrency: number = 10, requests: number = 100) {
    console.log(`开始性能测试: ${concurrency} 并发, ${requests} 请求...`);
    
    const startTime = Date.now();
    const requestPromises: Promise<any>[] = [];
    
    for (let i = 0; i < requests; i++) {
      const promise = this.httpClient.get({
        url: `${this.baseUrl}/health`,
        timeout: 5000
      });
      
      requestPromises.push(promise);
      
      // 控制并发数
      if (requestPromises.length >= concurrency) {
        await Promise.all(requestPromises.splice(0, concurrency));
      }
    }
    
    // 处理剩余请求
    if (requestPromises.length > 0) {
      await Promise.all(requestPromises);
    }
    
    const duration = Date.now() - startTime;
    const rps = Math.round((requests / duration) * 1000);
    
    console.log(`性能测试完成: ${duration}ms, ${rps} RPS`);
  }
}

// 使用示例
const apiTest = new ApiIntegrationTest(transport, 'https://api.example.com');
await apiTest.testUserManagement();
await apiTest.performanceTest(5, 50);
```

## HttpServer 服务端

### 服务端创建和配置

```typescript
import { createHttpServer } from '@testring/http-api';

// 创建 HTTP 服务器
const httpServer = createHttpServer(transport);

// 服务器会自动处理来自客户端的 HTTP 请求
// 并使用内置的 request 函数执行实际的网络请求
```

## 最佳实践

### 1. 连接管理
- 合理使用 Cookie 会话保持连接状态
- 避免创建过多的 HttpClient 实例
- 及时清理不需要的 Cookie
- 设置合适的请求超时时间

### 2. 错误处理
- 实现全面的错误捕获和分类
- 提供明确的错误消息和处理建议
- 建立重试机制处理网络间歇性问题
- 记录详细的请求和响应日志

### 3. 性能优化
- 使用请求节流避免服务器过载
- 合理设置并发数和批次大小
- 复用 Cookie 会话减少认证开销
- 选择性返回完整响应或仅响应体

### 4. 安全考虑
- 避免在日志中记录敏感信息
- 使用 HTTPS 进行敏感数据传输
- 正确处理认证 Token 和 Cookie
- 验证响应数据格式和内容

### 5. 测试组织
- 建立清晰的测试会话管理
- 使用页面对象模式封装 API 接口
- 实现可重用的测试工具和辅助方法
- 分离配置和测试逻辑

## 故障排除

### 常见问题

#### 连接错误
```bash
Error: ECONNREFUSED
```
解决方案：检查目标服务器状态、网络连接、防火墙设置。

#### 超时错误
```bash
Error: ETIMEDOUT
```
解决方案：增加超时时间、检查网络延迟、优化服务器响应速度。

#### 认证失败
```bash
Error: 401 Unauthorized
```
解决方案：检查认证凭据、Cookie 会话状态、Token 有效期。

#### 请求格式错误
```bash
Error: 400 Bad Request
```
解决方案：验证请求参数、Content-Type 头、数据格式。

### 调试技巧

```typescript
// 启用详细日志
const debugClient = new HttpClient(transport, { httpThrottle: 0 });

// 检查 Cookie 状态
console.log('当前 Cookie:', cookieJar.getCookies('https://api.example.com'));

// 使用完整响应模式调试
const fullResponse = await debugClient.get({
  url: 'https://api.example.com/debug',
  resolveWithFullResponse: true
});

console.log('完整响应:', {
  statusCode: fullResponse.statusCode,
  headers: fullResponse.headers,
  body: fullResponse.body
});
```

## 依赖

- `@testring/logger` - 日志记录
- `@testring/transport` - 传输层通信
- `@testring/types` - 类型定义
- `@testring/utils` - 工具函数
- `request` - HTTP 请求库
- `request-promise-native` - Promise 化的请求
- `tough-cookie` - Cookie 管理

## 相关模块

- `@testring/web-application` - Web 应用测试
- `@testring/client-ws-transport` - WebSocket 传输
- `@testring/test-utils` - 测试工具

## 许可证

MIT License