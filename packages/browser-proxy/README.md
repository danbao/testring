# @testring/browser-proxy

提供浏览器代理进程，用于在主进程与浏览器插件之间转发消息。该模块会启动独立的 Node
子进程，并通过 `@testring/transport` 与主框架通信。

## 功能概述
- 管理浏览器端插件的生命周期
- 提供 WebSocket 通道转发消息
- 支持在独立进程中运行代理以减少主进程负载
- 支持在不同浏览器环境下运行代理脚本
- 可按插件名称启动多个代理实例
- 代理进程可在调试模式下启动，便于开发

## 安装
```bash
npm install --save-dev @testring/browser-proxy
```
或使用 yarn:
```bash
yarn add @testring/browser-proxy --dev
```

## 基本用法
```typescript
import { browserProxyControllerFactory } from '@testring/browser-proxy';
import { transport } from '@testring/transport';

const controller = browserProxyControllerFactory(transport);
// 在插件中注册或启动浏览器代理
```
该模块通常与浏览器自动化插件一起使用，负责在浏览器与 Node.js 进程之间传递命令和事件。

## 示例
```typescript
import { browserProxyControllerFactory } from '@testring/browser-proxy';

const controller = browserProxyControllerFactory(transport);

// 启动代理并加载自定义插件
const proxy = await controller.start('my-plugin', { debug: true });
```