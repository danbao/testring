# @testring/browser-proxy

提供浏览器代理进程，用于在主进程与浏览器插件之间转发消息。该模块会启动独立的 Node
子进程，并通过 `@testring/transport` 与主框架通信。

## 特性
- 支持在不同浏览器环境下运行代理脚本
- 可按插件名称启动多个代理实例
- 代理进程可在调试模式下启动，便于开发

## 示例
```typescript
import { browserProxyControllerFactory } from '@testring/browser-proxy';

const controller = browserProxyControllerFactory(transport);

// 启动代理并加载自定义插件
const proxy = await controller.start('my-plugin', { debug: true });
```