# @testring/fs-store

`fs-store` 模块在多进程环境下提供统一的文件读写与缓存能力，包括截图、文本、二进制文
件的存储。模块分为 `FSStoreServer` 和 `FSStoreClient` 两部分，依赖 `@testring/transport`
 进行进程间通信。

## 核心组件

### FSStoreServer
- 维护文件操作队列，避免并发写入冲突
- 根据请求生成唯一文件名，支持自定义命名策略
- 提供文件锁池，限制同时执行的文件操作数量
- 通过事件钩子允许插件在文件创建、释放时介入

### FSStoreClient
- 向服务器发送文件读写、删除等请求
- 支持 `FSBinaryFileFactory`、`FSTextFileFactory`、`FSScreenshotFileFactory` 三种工厂
 便捷创建不同类型的文件
- 提供 `FS_CONSTANTS` 常量集定义消息名称等

## 简单示例

```typescript
import { FSStoreServer, FSStoreClient } from '@testring/fs-store';

const server = new FSStoreServer();
const client = new FSStoreClient();

// 创建临时文本文件并写入内容
const file = await client.createTextFile({ ext: 'txt' });
await file.write('hello');
console.log(file.fullPath);

// 释放文件占用
await file.release();
```

## 配置项

- `threadCount`：并发执行的文件操作数，默认 `10`
- `msgNamePrefix`：消息名前缀，用于隔离多实例通讯

## 典型场景

- 在测试中保存截图或日志文件
- 多工作进程共享统一的文件存储目录
- 通过插件自定义文件命名和存储位置

此模块在 `plugin-fs-store` 插件以及核心测试流程中均有使用，是文件管理的基础设施。
