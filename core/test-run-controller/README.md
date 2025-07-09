# @testring/test-run-controller

测试运行控制器，负责调度测试文件并管理测试工作进程。该模块是 testring 核心的一部分，
通过队列的方式顺序或并行执行测试，同时提供重试和插件钩子等功能。

## 功能概述
- 按队列依次执行测试文件
- 支持本地进程或多子进程并行执行
- 测试失败的重试及延迟控制
- 通过插件钩子扩展测试流程
- 统一管理测试运行产生的错误

## 安装
```bash
npm install --save-dev @testring/test-run-controller
```
或使用 yarn:
```bash
yarn add @testring/test-run-controller --dev
```

## 基本使用
```typescript
import { TestRunController } from '@testring/test-run-controller';
import { TestWorker } from '@testring/test-worker';
import { loggerClient } from '@testring/logger';

const controller = new TestRunController(config, new TestWorker(config));

const errors = await controller.runQueue(testFiles);
if (errors) {
  loggerClient.error('测试失败数量:', errors.length);
}
```
## 配置要点
- **workerLimit**: `number | 'local'` 指定并发的工作进程数，`local` 表示在当前进程运行。
- **retryCount**: 测试失败时的最大重试次数。
- **retryDelay**: 重试前的等待时间（毫秒）。
- **bail**: 一旦出现失败是否立即终止所有测试。
- **testTimeout**: 单个测试的超时时间。

## 插件钩子
`TestRunController` 继承自 `PluggableModule`，暴露以下钩子供插件使用：
- `beforeRun` / `afterRun` 运行队列前后触发
- `beforeTest` / `afterTest` 单个测试开始与结束
- `beforeTestRetry` 测试重试之前
- `shouldNotExecute` 决定是否整体跳过队列
- `shouldNotStart` 控制某个测试是否跳过
- `shouldNotRetry` 控制某个失败测试是否重试

## 错误处理与重试
执行过程中产生的错误会被收集到内部数组中。若配置了重试，当测试失败且未超过
`retryCount` 时会在 `retryDelay` 后再次加入队列执行。

## 与其它模块配合
通常与 `@testring/test-worker`、`@testring/logger` 以及 `@testring/fs-store` 等模块配合
使用。可通过插件机制接入自定义逻辑，例如截图、环境准备或自定义报告等。

