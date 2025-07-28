# Testring Test Fixtures on Cloudflare Workers

这个方案将 `static-fixtures` 部署到 Cloudflare Workers，解决了 VitePress 静态站点无法处理文件上传等动态功能的问题。

## 🎯 解决的问题

- ✅ **文件上传功能** - Worker 可以处理 POST 请求和文件上传
- ✅ **全球可访问** - 不依赖本地测试服务器
- ✅ **零成本部署** - Cloudflare 免费额度足够使用
- ✅ **自动同步** - 当 fixtures 更新时自动重新部署

## 🚀 快速开始

### 1. 本地构建测试

```bash
cd docs
npm run build:worker
```

这会生成 `cloudflare-worker.js` 文件，包含所有测试页面。

### 2. 设置 Cloudflare Workers

1. **注册 Cloudflare 账号**：https://dash.cloudflare.com/sign-up
2. **获取 API Token**：
   - 前往 https://dash.cloudflare.com/profile/api-tokens
   - 点击 "Create Token"
   - 使用 "Custom token" 模板
   - 权限设置：
     - `Zone:Zone:Read`
     - `Zone:Zone Settings:Edit` 
     - `Account:Cloudflare Workers:Edit`

3. **添加 GitHub Secret**：
   - 在 GitHub 仓库设置中添加 `CLOUDFLARE_API_TOKEN`

### 3. 部署到 Cloudflare Workers

```bash
# 手动部署
cd docs
npm run deploy:fixtures

# 或者通过 GitHub Action 自动部署
# 推送到 master 分支时会自动触发
```

### 4. 更新文档链接

部署成功后，更新 `.vitepress/config.js` 中的链接：

```javascript
// 从这个
{ text: 'Test Fixtures', link: '/static-fixtures/', target: '_blank' },

// 改为这个
{ text: 'Test Fixtures', link: 'https://testring-fixtures.your-subdomain.workers.dev/', target: '_blank' },
```

## 📁 支持的功能

### 静态页面
- ✅ 所有 HTML 测试页面直接可用
- ✅ 自动生成美观的索引页面
- ✅ 响应式设计，支持移动端

### 动态功能
- ✅ **文件上传** (`/upload`) - 支持任意文件类型
- ✅ **CORS 支持** - 允许跨域请求
- ✅ **错误处理** - 友好的错误消息

### 扩展性
- 🔄 **自动构建** - 修改 fixtures 时自动重新生成 Worker
- 🌍 **CDN 加速** - 全球边缘节点提供服务
- 📈 **可监控** - Cloudflare 提供详细的分析数据

## 🤖 Mock Web Server 集成

这个 Cloudflare Worker 完全复制了 `packages/e2e-test-app/src/mock-web-server.ts` 的功能，确保与本地测试环境的完全兼容性。

### 🔌 API 端点

#### 1. 文件上传 API
```bash
POST /upload
Content-Type: multipart/form-data

# 响应格式与 mock-web-server 一致
{
  "message": "File received successfully",
  "filename": "example.pdf",
  "size": 12345,
  "type": "application/pdf"
}
```



### 🔄 与本地环境的兼容性

| 功能 | 本地 Mock Server (端口 8080) | Cloudflare Worker |
|------|------------------------------|-------------------|
| 文件上传 | ✅ 完全支持 | ✅ 完全支持 |
| 静态文件服务 | ✅ Express Static | ✅ Worker 静态响应 |
| CORS 支持 | ✅ 支持 | ✅ 支持 |

> *注意：Cloudflare Worker 无状态，无法真正存储请求头，但会返回示例数据用于演示

## 🛠️ 开发指南

### 添加新的测试页面

1. 在 `docs/public/static-fixtures/` 中添加新的 HTML 文件
2. 运行 `npm run build:worker` 重新构建
3. 新页面会自动包含在索引中

### 添加新的 API 端点

编辑 `docs/scripts/build-worker.js`，在 Worker 模板中添加新的路由：

```javascript
// 在 fetch 函数中添加
if (path === '/your-new-api' && request.method === 'POST') {
  // 处理逻辑
  return new Response(JSON.stringify({success: true}), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 自定义域名

在 `wrangler.toml` 中配置：

```toml
[[env.production.routes]]
pattern = "fixtures.your-domain.com/*"
zone_name = "your-domain.com"
```

## 📊 使用统计

Cloudflare 免费方案限制：
- **100,000 请求/天** - 对于文档示例来说绰绰有余
- **10ms CPU 时间** - 静态内容几乎不消耗
- **128MB 内存** - 我们的 Worker 约占用 2-5MB

## 🔧 故障排除

### 构建失败
```bash
# 检查 Node.js 版本 (需要 16+)
node --version

# 重新安装依赖
cd docs && npm install
```

### 部署失败
```bash
# 检查 API Token 权限
# 确保有 Workers:Edit 权限

# 检查 wrangler 配置
npx wrangler whoami
```

### 页面无法访问
- 检查 Worker 是否部署成功
- 验证域名配置
- 查看 Cloudflare 控制台的错误日志

## 🎉 效果预览

部署后你将得到：

1. **美观的索引页面** - 展示所有测试 fixtures
2. **完全功能的上传页面** - 真正可以上传文件
3. **全球快速访问** - 无需启动本地服务器
4. **自动同步** - 修改 fixtures 后自动更新

这个方案让 Testring 的文档更加完整和实用！🚀 