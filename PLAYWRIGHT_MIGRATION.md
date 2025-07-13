# Playwright 插件迁移指南

本文档提供了从 Selenium 迁移到 Playwright 的指南，以及相关的兼容性信息。

## 概述

testring 框架现在支持 Playwright 作为浏览器自动化驱动，作为 Selenium 的替代方案。Playwright 插件提供了与 Selenium 高度兼容的 API，使迁移过程尽可能平滑。

## 主要改进

### 🔧 资源管理
- **改进的进程清理**: 修复了 Chromium 进程可能不正确结束的问题
- **超时保护**: 所有清理操作都有超时保护，防止无限等待
- **强制清理**: 如果正常清理失败，会尝试强制终止相关进程
- **启动时清理**: 自动检测并清理历史遗留的孤儿进程

### 🆔 Tab ID 管理
- **一致的 Tab ID**: 使用 WeakMap 确保页面实例与 Tab ID 的一对一映射
- **导航兼容**: 页面导航后 Tab ID 保持不变，与 Selenium 行为一致

### ⚡ 异步执行
- **executeAsync 兼容性**: 完全支持 Selenium 风格的异步 JavaScript 执行
- **浏览器脚本支持**: 支持 `getOptionsPropertyScript` 等框架内置脚本
- **回调转换**: 自动将回调风格的函数转换为 Promise 风格

### 🚨 对话框处理
- **Alert 兼容性**: 与 Selenium 一致的 alert/confirm/prompt 处理行为
- **序列化安全**: 修复了异步函数序列化导致的进程间通信问题

## 使用方法

### 配置 Playwright 插件

在你的 testring 配置文件中，使用 `playwright-driver` 插件：

```javascript
module.exports = {
    plugins: ['playwright-driver', 'babel'],
    
    // Playwright 特定配置
    'playwright-driver': {
        browserName: 'chromium', // 或 'firefox', 'webkit'
        launchOptions: {
            headless: true,
            args: []
        },
        contextOptions: {},
        clientTimeout: 15 * 60 * 1000,
        video: false,
        trace: false
    }
};
```

### 环境变量

支持以下环境变量：

- `PLAYWRIGHT_DEBUG=1`: 启用调试模式（非 headless，慢动作）

### 清理僵尸进程

如果遇到 Chromium 进程没有正确结束的情况，可以使用：

```bash
npm run cleanup:playwright
```

## 兼容性

### ✅ 完全兼容的功能

- 所有基本的浏览器操作 (click, type, navigate 等)
- 元素查找和操作
- 窗口/标签页管理
- Alert/Dialog 处理
- 文件上传
- 截图功能
- JavaScript 执行
- Cookie 管理
- 表单操作

### ⚠️ 部分兼容的功能

- **Frame 操作**: 基本功能可用，但某些高级 frame 操作可能有差异
- **移动设备模拟**: 支持基本的设备模拟，但可能与 Selenium 的实现有差异

### ❌ 不兼容的功能

目前没有已知的完全不兼容的功能。如果遇到问题，请参考故障排除部分。

## 性能对比

| 特性 | Selenium | Playwright |
|------|----------|------------|
| 启动速度 | 较慢 | 快 |
| 稳定性 | 一般 | 高 |
| 调试能力 | 基本 | 强大 |
| 浏览器支持 | 广泛 | Chrome/Firefox/Safari |
| 资源消耗 | 高 | 中等 |

## 故障排除

### 进程清理问题

如果发现 Chromium 进程没有正确结束：

1. 运行清理命令：
   ```bash
   npm run cleanup:playwright
   ```

2. 手动检查残留进程：
   ```bash
   pgrep -fla "playwright.*chrom"
   ```

3. 如果仍有残留，手动清理：
   ```bash
   pkill -f "playwright.*chrom"
   ```

### 序列化错误

如果遇到 "await is only valid in async functions" 错误：

1. 确保使用的是最新版本的插件
2. 检查是否在回调函数中误用了 async/await
3. 重启测试进程

### Tab ID 不一致

如果测试中遇到 Tab ID 不匹配的问题：

1. 确保没有手动操作浏览器窗口
2. 检查测试代码中的窗口切换逻辑
3. 使用 `app.getCurrentTabId()` 获取当前 Tab ID

## 最佳实践

### 1. 资源清理
```javascript
// 测试结束后确保清理
afterEach(async () => {
    await app.end();
});
```

### 2. 错误处理
```javascript
try {
    await app.click(selector);
} catch (error) {
    // 记录错误信息
    console.error('Click failed:', error.message);
    throw error;
}
```

### 3. 等待策略
```javascript
// 使用适当的等待
await app.waitForVisible(selector, 5000);
await app.click(selector);
```

### 4. 调试模式
```javascript
// 开发时启用调试模式
if (process.env.NODE_ENV === 'development') {
    process.env.PLAYWRIGHT_DEBUG = '1';
}
```

## 迁移检查清单

- [ ] 更新配置文件使用 `playwright-driver`
- [ ] 测试基本的浏览器操作
- [ ] 验证 Alert/Dialog 处理
- [ ] 检查窗口/标签页管理
- [ ] 测试文件上传功能
- [ ] 验证异步 JavaScript 执行
- [ ] 运行完整的测试套件
- [ ] 检查进程清理是否正常

## 支持

如果在迁移过程中遇到问题，请：

1. 查阅本文档的故障排除部分
2. 检查 GitHub Issues
3. 运行 `npm run cleanup:playwright` 清理可能的残留进程
4. 提供详细的错误信息和复现步骤

## 版本历史

- **v0.8.1**: 增强资源管理
  - 启动时自动清理孤儿进程
  - 改进的进程生命周期管理
  - 更强的清理机制
- **v0.8.0**: 初始 Playwright 插件发布
  - 基本浏览器操作支持
  - Tab ID 管理系统
  - 进程清理改进
  - executeAsync 兼容性