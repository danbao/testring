# @testring/fs-store

文件存储管理模块，作为 testring 框架的文件系统抽象层，提供在多进程环境下统一的文件读写与缓存能力。该模块通过客户端-服务器架构实现文件操作的并发控制、权限管理和资源协调，确保多进程环境下的文件操作安全性和一致性。

[![npm version](https://badge.fury.io/js/@testring/fs-store.svg)](https://www.npmjs.com/package/@testring/fs-store)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## 功能概述

文件存储管理模块是 testring 框架的文件系统基础设施，提供了：
- 多进程环境下的文件操作协调和同步
- 文件锁机制和并发访问控制
- 统一的文件命名和路径管理
- 多种文件类型的工厂模式支持
- 插件化的文件操作扩展机制
- 完整的文件生命周期管理

## 主要特性

### 并发控制
- 文件锁机制防止并发写入冲突
- 权限队列管理和访问控制
- 线程池限制同时执行的文件操作数量
- 事务支持确保操作的原子性

### 多进程支持
- 基于 transport 的进程间通信
- 服务器-客户端架构支持多工作进程
- 统一的文件存储目录管理
- 工作进程间的文件共享机制

### 文件类型支持
- 文本文件（UTF-8 编码）
- 二进制文件（Binary 编码）
- 截图文件（PNG 格式）
- 自定义文件类型扩展

### 插件化扩展
- 文件命名策略的自定义钩子
- 文件操作队列的插件控制
- 文件释放事件的监听机制
- 存储路径的动态配置

## 安装

```bash
npm install @testring/fs-store
```

## 核心架构

### 系统架构
fs-store 模块采用客户端-服务器架构：

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Worker 1      │    │   Worker 2      │    │   Worker N      │
│  FSStoreClient  │    │  FSStoreClient  │    │  FSStoreClient  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  FSStoreServer  │
                    │   (Main Process)│
                    └─────────────────┘
                             │
                    ┌─────────────────┐
                    │  File System    │
                    │   (Disk)        │
                    └─────────────────┘
```

### 核心组件

#### FSStoreServer
服务器端组件，负责文件操作的协调和管理：

```typescript
class FSStoreServer extends PluggableModule {
  constructor(threadCount: number = 10, msgNamePrefix: string)
  
  // 初始化服务器
  init(): boolean
  
  // 获取服务器状态
  getState(): number
  
  // 清理传输层连接
  cleanUpTransport(): void
  
  // 获取文件名列表
  getNameList(): string[]
}
```

#### FSStoreClient
客户端组件，提供文件操作的接口：

```typescript
class FSStoreClient {
  constructor(msgNamePrefix: string)
  
  // 获取文件锁
  getLock(meta: requestMeta, cb: Function): string
  
  // 获取文件访问权限
  getAccess(meta: requestMeta, cb: Function): string
  
  // 获取文件删除权限
  getUnlink(meta: requestMeta, cb: Function): string
  
  // 释放文件资源
  release(requestId: string, cb?: Function): boolean
  
  // 释放所有工作进程的操作
  releaseAllWorkerActions(): void
}
```

#### FSStoreFile
文件操作的主要接口：

```typescript
class FSStoreFile implements IFSStoreFile {
  constructor(options: FSStoreOptions)
  
  // 文件锁操作
  async lock(): Promise<void>
  async unlock(): Promise<boolean>
  async unlockAll(): Promise<boolean>
  
  // 文件访问操作
  async getAccess(): Promise<void>
  async releaseAccess(): Promise<boolean>
  
  // 文件 I/O 操作
  async read(): Promise<Buffer>
  async write(data: Buffer): Promise<string>
  async append(data: Buffer): Promise<string>
  async stat(): Promise<fs.Stats>
  async unlink(): Promise<boolean>
  
  // 事务支持
  async transaction(cb: () => Promise<void>): Promise<void>
  async startTransaction(): Promise<void>
  async endTransaction(): Promise<void>
  
  // 状态查询
  isLocked(): boolean
  isValid(): boolean
  getFullPath(): string | null
  getState(): Record<string, any>
}
```

## 基本用法

### 服务器端设置

```typescript
import { FSStoreServer } from '@testring/fs-store';

// 创建文件存储服务器
const server = new FSStoreServer(
  10,  // 并发线程数
  'test-fs-store'  // 消息名前缀
);

// 检查服务器状态
console.log('服务器状态:', server.getState());

// 获取当前管理的文件列表
console.log('文件列表:', server.getNameList());
```

### 客户端文件操作

```typescript
import { FSStoreClient } from '@testring/fs-store';

// 创建客户端
const client = new FSStoreClient('test-fs-store');

// 获取文件锁
const lockId = client.getLock(
  { ext: 'txt' },
  (fullPath, requestId) => {
    console.log('文件锁获取成功:', fullPath);
    
    // 执行文件操作
    // ...
    
    // 释放锁
    client.release(requestId);
  }
);

// 获取文件访问权限
const accessId = client.getAccess(
  { ext: 'log' },
  (fullPath, requestId) => {
    console.log('文件访问权限获取成功:', fullPath);
    
    // 执行文件读写
    // ...
    
    // 释放访问权限
    client.release(requestId);
  }
);
```

### 使用 FSStoreFile 进行文件操作

```typescript
import { FSStoreFile } from '@testring/fs-store';

// 创建文件对象
const file = new FSStoreFile({
  meta: { ext: 'txt' },
  fsOptions: { encoding: 'utf8' }
});

// 写入文件
await file.write(Buffer.from('Hello World'));
console.log('文件路径:', file.getFullPath());

// 读取文件
const content = await file.read();
console.log('文件内容:', content.toString());

// 追加内容
await file.append(Buffer.from('\n追加内容'));

// 获取文件状态
const stats = await file.stat();
console.log('文件大小:', stats.size);

// 删除文件
await file.unlink();
```

## 文件工厂模式

### 文本文件工厂

```typescript
import { FSTextFileFactory } from '@testring/fs-store';

// 创建文本文件
const textFile = FSTextFileFactory.create(
  { ext: 'txt' },  // 文件元数据
  { fsOptions: { encoding: 'utf8' } }  // 文件选项
);

// 写入文本内容
await textFile.write(Buffer.from('文本内容'));

// 读取文本内容
const content = await textFile.read();
console.log('文本内容:', content.toString());
```

### 二进制文件工厂

```typescript
import { FSBinaryFileFactory } from '@testring/fs-store';

// 创建二进制文件
const binaryFile = FSBinaryFileFactory.create(
  { ext: 'bin' },
  { fsOptions: { encoding: 'binary' } }
);

// 写入二进制数据
const binaryData = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
await binaryFile.write(binaryData);

// 读取二进制数据
const data = await binaryFile.read();
console.log('二进制数据:', data);
```

### 截图文件工厂

```typescript
import { FSScreenshotFileFactory } from '@testring/fs-store';

// 创建截图文件
const screenshotFile = FSScreenshotFileFactory.create(
  { ext: 'png' },
  { fsOptions: { encoding: 'binary' } }
);

// 保存截图数据
const screenshotData = Buffer.from(/* 截图数据 */);
await screenshotFile.write(screenshotData);

console.log('截图文件路径:', screenshotFile.getFullPath());
```

## 高级用法

### 文件事务处理

```typescript
import { FSStoreFile } from '@testring/fs-store';

const file = new FSStoreFile({
  meta: { ext: 'log' },
  fsOptions: { encoding: 'utf8' }
});

// 使用事务确保操作的原子性
await file.transaction(async () => {
  // 在事务中执行多个操作
  await file.write(Buffer.from('开始记录\n'));
  await file.append(Buffer.from('操作1完成\n'));
  await file.append(Buffer.from('操作2完成\n'));
  await file.append(Buffer.from('记录结束\n'));
});

console.log('事务完成，文件路径:', file.getFullPath());
```

### 手动事务控制

```typescript
const file = new FSStoreFile({
  meta: { ext: 'data' },
  fsOptions: { encoding: 'utf8' }
});

try {
  // 开始事务
  await file.startTransaction();
  
  // 执行多个操作
  await file.write(Buffer.from('数据头\n'));
  
  for (let i = 0; i < 10; i++) {
    await file.append(Buffer.from(`数据行 ${i}\n`));
  }
  
  await file.append(Buffer.from('数据尾\n'));
  
  // 提交事务
  await file.endTransaction();
  
  console.log('手动事务完成');
} catch (error) {
  // 事务会自动结束
  console.error('事务失败:', error);
}
```

### 文件锁管理

```typescript
const file = new FSStoreFile({
  meta: { ext: 'shared' },
  fsOptions: { encoding: 'utf8' },
  lock: true  // 创建时自动加锁
});

// 检查锁状态
if (file.isLocked()) {
  console.log('文件已被锁定');
}

// 手动加锁
await file.lock();

// 执行需要锁保护的操作
await file.write(Buffer.from('受保护的数据'));

// 解锁
await file.unlock();

// 解锁所有锁
await file.unlockAll();
```

### 等待文件解锁

```typescript
const file = new FSStoreFile({
  meta: { fileName: 'shared-file.txt' },
  fsOptions: { encoding: 'utf8' }
});

// 等待文件解锁
await file.waitForUnlock();

// 现在可以安全地操作文件
await file.write(Buffer.from('文件现在可写'));
```

## 静态方法使用

### 快速文件操作

```typescript
import { FSStoreFile } from '@testring/fs-store';

// 快速写入文件
const filePath = await FSStoreFile.write(
  Buffer.from('快速写入的内容'),
  {
    meta: { ext: 'txt' },
    fsOptions: { encoding: 'utf8' }
  }
);

// 快速追加文件
await FSStoreFile.append(
  Buffer.from('追加的内容'),
  {
    meta: { fileName: 'existing-file.txt' },
    fsOptions: { encoding: 'utf8' }
  }
);

// 快速读取文件
const content = await FSStoreFile.read({
  meta: { fileName: 'existing-file.txt' },
  fsOptions: { encoding: 'utf8' }
});

// 快速删除文件
await FSStoreFile.unlink({
  meta: { fileName: 'file-to-delete.txt' }
});
```

## 服务器端插件钩子

### 文件名生成钩子

```typescript
import { FSStoreServer, fsStoreServerHooks } from '@testring/fs-store';

const server = new FSStoreServer();

// 自定义文件命名策略
server.getHook(fsStoreServerHooks.ON_FILENAME)?.writeHook(
  'customNaming',
  (fileName, context) => {
    const { workerId, requestId, meta } = context;
    
    // 根据工作进程ID和请求信息生成自定义文件名
    const timestamp = Date.now();
    const customName = `${workerId}-${timestamp}-${fileName}`;
    
    return path.join('/custom/path', customName);
  }
);
```

### 队列管理钩子

```typescript
server.getHook(fsStoreServerHooks.ON_QUEUE)?.writeHook(
  'customQueue',
  (defaultQueue, meta, context) => {
    const { workerId } = context;
    
    // 为特定工作进程提供专用队列
    if (workerId === 'high-priority-worker') {
      return new CustomHighPriorityQueue();
    }
    
    return defaultQueue;
  }
);
```

### 文件释放钩子

```typescript
server.getHook(fsStoreServerHooks.ON_RELEASE)?.readHook(
  'releaseLogger',
  (context) => {
    const { workerId, requestId, fullPath, fileName, action } = context;
    
    console.log(`文件释放: ${fileName} (${action}) by ${workerId}`);
    
    // 记录文件操作统计
    recordFileOperationStats(workerId, action, fullPath);
  }
);
```

## 配置和自定义

### 服务器配置

```typescript
const server = new FSStoreServer(
  20,  // 增加并发线程数到20
  'production-fs-store'  // 生产环境消息前缀
);
```

### 客户端配置

```typescript
const client = new FSStoreClient('production-fs-store');

// 配置文件选项
const fileOptions = {
  meta: {
    ext: 'log',
    type: 'application/log',
    uniqPolicy: 'global'
  },
  fsOptions: {
    encoding: 'utf8',
    flag: 'a'  // 追加模式
  },
  lock: true  // 自动加锁
};

const file = new FSStoreFile(fileOptions);
```

### 自定义文件类型工厂

```typescript
import { FSStoreFile, FSStoreType, FSFileUniqPolicy } from '@testring/fs-store';

// 创建自定义 JSON 文件工厂
export function createJSONFileFactory(
  extraMeta?: requestMeta,
  extraData?: FSStoreDataOptions
) {
  const baseMeta = {
    type: FSStoreType.text,
    ext: 'json',
    uniqPolicy: FSFileUniqPolicy.global
  };
  
  const data = {
    fsOptions: { encoding: 'utf8' as BufferEncoding }
  };
  
  return new FSStoreFile({
    ...data,
    ...extraData,
    meta: { ...baseMeta, ...extraMeta }
  });
}

// 使用自定义工厂
const jsonFile = createJSONFileFactory({ fileName: 'config.json' });
await jsonFile.write(Buffer.from(JSON.stringify({ test: true })));
```

## 多进程文件共享

### 主进程设置

```typescript
// main.js
import { FSStoreServer } from '@testring/fs-store';

const server = new FSStoreServer(10, 'shared-fs');

// 启动服务器
console.log('文件存储服务器已启动');
```

### 工作进程使用

```typescript
// worker.js
import { FSStoreClient, FSTextFileFactory } from '@testring/fs-store';

const client = new FSStoreClient('shared-fs');

// 在工作进程中创建文件
const file = FSTextFileFactory.create({ ext: 'log' });

// 写入工作进程特定的内容
await file.write(Buffer.from(`工作进程 ${process.pid} 的日志\n`));

// 追加时间戳
await file.append(Buffer.from(`时间: ${new Date().toISOString()}\n`));

console.log('工作进程文件路径:', file.getFullPath());
```

## 错误处理和调试

### 错误处理模式

```typescript
import { FSStoreFile } from '@testring/fs-store';

class SafeFileOperations {
  async safeWrite(data: Buffer, options: FSStoreOptions): Promise<string | null> {
    try {
      const file = new FSStoreFile(options);
      const filePath = await file.write(data);
      return filePath;
    } catch (error) {
      console.error('文件写入失败:', error.message);
      
      if (error.message.includes('permission')) {
        console.error('权限不足，请检查文件权限');
      } else if (error.message.includes('space')) {
        console.error('磁盘空间不足');
      } else if (error.message.includes('lock')) {
        console.error('文件被锁定，请稍后重试');
      }
      
      return null;
    }
  }
  
  async safeTransaction(file: FSStoreFile, operations: Function[]): Promise<boolean> {
    try {
      await file.transaction(async () => {
        for (const operation of operations) {
          await operation();
        }
      });
      return true;
    } catch (error) {
      console.error('事务失败:', error.message);
      return false;
    }
  }
}
```

### 调试和监控

```typescript
import { FSStoreServer, FSStoreClient } from '@testring/fs-store';

class DebuggableFileStore {
  private server: FSStoreServer;
  private client: FSStoreClient;
  private operationLog: Array<{
    timestamp: number;
    operation: string;
    details: any;
  }> = [];
  
  constructor() {
    this.server = new FSStoreServer(10, 'debug-fs');
    this.client = new FSStoreClient('debug-fs');
    
    this.setupDebugging();
  }
  
  private setupDebugging() {
    // 监控服务器状态
    setInterval(() => {
      const fileList = this.server.getNameList();
      const serverState = this.server.getState();
      
      console.log('服务器状态:', {
        state: serverState,
        managedFiles: fileList.length,
        files: fileList
      });
    }, 5000);
  }
  
  async createDebugFile(meta: any): Promise<FSStoreFile> {
    const startTime = Date.now();
    
    const file = new FSStoreFile({
      meta,
      fsOptions: { encoding: 'utf8' }
    });
    
    const endTime = Date.now();
    
    this.operationLog.push({
      timestamp: startTime,
      operation: 'createFile',
      details: {
        meta,
        duration: endTime - startTime,
        filePath: file.getFullPath()
      }
    });
    
    return file;
  }
  
  getOperationLog() {
    return this.operationLog;
  }
}
```

## 性能优化

### 文件操作批处理

```typescript
class BatchFileOperations {
  private operations: Array<() => Promise<void>> = [];
  private batchSize = 10;
  
  addOperation(operation: () => Promise<void>) {
    this.operations.push(operation);
    
    if (this.operations.length >= this.batchSize) {
      this.executeBatch();
    }
  }
  
  async executeBatch() {
    const batch = this.operations.splice(0, this.batchSize);
    
    // 并行执行批处理操作
    await Promise.all(batch.map(operation => operation()));
  }
  
  async executeAll() {
    while (this.operations.length > 0) {
      await this.executeBatch();
    }
  }
}

// 使用批处理
const batchOps = new BatchFileOperations();

// 添加多个文件操作
for (let i = 0; i < 100; i++) {
  batchOps.addOperation(async () => {
    const file = FSTextFileFactory.create({ ext: 'txt' });
    await file.write(Buffer.from(`文件 ${i} 的内容`));
  });
}

// 执行剩余操作
await batchOps.executeAll();
```

### 文件缓存策略

```typescript
class CachedFileStore {
  private cache = new Map<string, Buffer>();
  private cacheMaxSize = 50; // 最大缓存文件数
  
  async readWithCache(filePath: string): Promise<Buffer> {
    // 检查缓存
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath)!;
    }
    
    // 从文件系统读取
    const file = new FSStoreFile({
      meta: { fileName: path.basename(filePath) },
      fsOptions: { encoding: 'utf8' }
    });
    
    const content = await file.read();
    
    // 更新缓存
    this.updateCache(filePath, content);
    
    return content;
  }
  
  private updateCache(filePath: string, content: Buffer) {
    // 如果缓存已满，删除最老的项
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(filePath, content);
  }
  
  clearCache() {
    this.cache.clear();
  }
}
```

## 最佳实践

### 1. 文件生命周期管理
- 总是在完成操作后释放文件资源
- 使用事务确保复杂操作的原子性
- 定期清理不再需要的文件

### 2. 并发控制
- 合理设置服务器的线程数量
- 使用文件锁避免并发写入冲突
- 在多进程环境中使用统一的命名策略

### 3. 错误处理
- 实现完善的错误处理和重试机制
- 监控文件操作的性能和成功率
- 记录详细的操作日志便于调试

### 4. 性能优化
- 使用批处理减少频繁的文件操作
- 实现文件内容缓存机制
- 避免不必要的文件锁定

### 5. 资源管理
- 定期清理临时文件
- 监控磁盘使用情况
- 实现文件大小限制和清理策略

## 故障排除

### 常见问题

#### 文件锁定冲突
```bash
Error: impossible to lock
```
解决方案：检查是否有其他进程正在使用文件，等待或强制释放锁。

#### 权限不足
```bash
Error: no access
```
解决方案：检查文件权限，确保进程有读写权限。

#### 文件不存在
```bash
Error: NOEXIST
```
解决方案：确认文件路径正确，检查文件是否已被删除。

#### 服务器未初始化
```bash
Error: Server not initialized
```
解决方案：确保 FSStoreServer 已正确初始化并启动。

### 调试技巧

```typescript
// 启用详细日志
process.env.DEBUG = 'testring:fs-store';

// 创建调试版本的文件存储
const debugServer = new FSStoreServer(5, 'debug-fs');
const debugClient = new FSStoreClient('debug-fs');

// 监控文件操作
debugServer.getHook('ON_RELEASE')?.readHook('debug', (context) => {
  console.log('文件操作完成:', context);
});
```

## 依赖

- `@testring/transport` - 进程间通信
- `@testring/logger` - 日志记录
- `@testring/pluggable-module` - 插件系统
- `@testring/types` - 类型定义
- `@testring/utils` - 工具函数

## 相关模块

- `@testring/plugin-fs-store` - 文件存储插件
- `@testring/test-utils` - 测试工具
- `@testring/cli-config` - 配置管理

## 许可证

MIT License