import { createSharedApp } from './shared-routes';

// 创建共享的应用程序实例
const app = createSharedApp();

// Cloudflare Workers 特定的配置可以在这里添加
// 例如 CORS、额外的中间件等

// 默认导出，用于 Cloudflare Workers
export default app; 