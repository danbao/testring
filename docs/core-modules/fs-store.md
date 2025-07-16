# @testring/fs-store

File storage management module that serves as the file system abstraction layer for the testring framework. It provides unified file read/write and caching capabilities in multi-process environments. This module implements concurrent control, permission management, and resource coordination through a client-server architecture, ensuring file operation safety and consistency in multi-process environments.

[![npm version](https://badge.fury.io/js/@testring/fs-store.svg)](https://www.npmjs.com/package/@testring/fs-store)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Overview

The file storage management module is the file system infrastructure of the testring framework, providing:
- File operation coordination and synchronization in multi-process environments
- File locking mechanism and concurrent access control
- Unified file naming and path management
- Factory pattern support for multiple file types
- Plugin-based file operation extension mechanism
- Complete file lifecycle management

## Key Features

### Concurrency Control
- File locking mechanism to prevent concurrent write conflicts
- Permission queue management and access control
- Thread pool limiting the number of simultaneous file operations
- Transaction support ensuring operation atomicity

### Multi-Process Support
- Inter-process communication based on transport
- Server-client architecture supporting multiple worker processes
- Unified file storage directory management
- File sharing mechanism between worker processes

### File Type Support
- Text files (UTF-8 encoding)
- Binary files (Binary encoding)
- Screenshot files (PNG format)
- Custom file type extensions

### Plugin-Based Extensions
- Custom hooks for file naming strategies
- Plugin control for file operation queues
- Listening mechanism for file release events
- Dynamic configuration of storage paths

## Installation

```bash
npm install @testring/fs-store
```

## Core Architecture

### System Architecture
The fs-store module uses a client-server architecture:

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

### Core Components

#### FSStoreServer
Server-side component responsible for coordinating and managing file operations:

```typescript
class FSStoreServer extends PluggableModule {
  constructor(threadCount: number = 10, msgNamePrefix: string)

  // Initialize server
  init(): boolean

  // Get server state
  getState(): number

  // Clean up transport connections
  cleanUpTransport(): void

  // Get file name list
  getNameList(): string[]
}
```

#### FSStoreClient
Client-side component providing file operation interfaces:

```typescript
class FSStoreClient {
  constructor(msgNamePrefix: string)

  // Get file lock
  getLock(meta: requestMeta, cb: Function): string

  // Get file access permission
  getAccess(meta: requestMeta, cb: Function): string

  // Get file deletion permission
  getUnlink(meta: requestMeta, cb: Function): string

  // Release file resources
  release(requestId: string, cb?: Function): boolean

  // Release all worker process operations
  releaseAllWorkerActions(): void
}
```

#### FSStoreFile
Main interface for file operations:

```typescript
class FSStoreFile implements IFSStoreFile {
  constructor(options: FSStoreOptions)

  // File locking operations
  async lock(): Promise<void>
  async unlock(): Promise<boolean>
  async unlockAll(): Promise<boolean>

  // File access operations
  async getAccess(): Promise<void>
  async releaseAccess(): Promise<boolean>

  // File I/O operations
  async read(): Promise<Buffer>
  async write(data: Buffer): Promise<string>
  async append(data: Buffer): Promise<string>
  async stat(): Promise<fs.Stats>
  async unlink(): Promise<boolean>

  // Transaction support
  async transaction(cb: () => Promise<void>): Promise<void>
  async startTransaction(): Promise<void>
  async endTransaction(): Promise<void>

  // Status queries
  isLocked(): boolean
  isValid(): boolean
  getFullPath(): string | null
  getState(): Record<string, any>
}
```

## Basic Usage

### Server-Side Setup

```typescript
import { FSStoreServer } from '@testring/fs-store';

// Create file storage server
const server = new FSStoreServer(
  10,  // Concurrent thread count
  'test-fs-store'  // Message name prefix
);

// Check server status
console.log('Server status:', server.getState());

// Get current managed file list
console.log('File list:', server.getNameList());
```

### Client-Side File Operations

```typescript
import { FSStoreClient } from '@testring/fs-store';

// Create client
const client = new FSStoreClient('test-fs-store');

// Get file lock
const lockId = client.getLock(
  { ext: 'txt' },
  (fullPath, requestId) => {
    console.log('File lock acquired successfully:', fullPath);

    // Perform file operations
    // ...

    // Release lock
    client.release(requestId);
  }
);

// Get file access permission
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

### Using FSStoreFile for File Operations

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

## File Factory Pattern

### Text File Factory

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

### Binary File Factory

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

### Screenshot File Factory

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

## Advanced Usage

### File Transaction Processing

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

### Manual Transaction Control

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

### File Lock Management

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

### Waiting for File Unlock

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

## Static Method Usage

### Quick File Operations

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

## Server-Side Plugin Hooks

### File Name Generation Hooks

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

### Queue Management Hooks

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

### File Release Hooks

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