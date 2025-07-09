# @testring/browser-proxy

浏览器代理服务，用于在测试过程中协调浏览器插件与主进程之间的通信。

## 功能概述
- 管理浏览器端插件的生命周期
- 提供 WebSocket 通道转发消息
- 支持在独立进程中运行代理以减少主进程负载

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

