# 🚀 自动浏览器安装指南

## 概述

从 v0.8.0 版本开始，`@testring/plugin-playwright-driver` 支持在 `npm install` 时自动安装所有必需的浏览器，无需手动执行额外的命令。

## 🎯 快速开始

### 默认安装（推荐）

```bash
npm install @testring/plugin-playwright-driver
```

这会自动安装以下浏览器：
- ✅ Chromium (Chrome)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Microsoft Edge

### 跳过浏览器安装

如果你不想自动安装浏览器：

```bash
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install @testring/plugin-playwright-driver
```

### 安装特定浏览器

只安装你需要的浏览器：

```bash
PLAYWRIGHT_BROWSERS=chromium,msedge npm install @testring/plugin-playwright-driver
```

## 🔧 环境变量控制

| 环境变量 | 作用 | 默认值 | 示例 |
|---------|------|-------|------|
| `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` | 跳过浏览器安装 | `false` | `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` |
| `PLAYWRIGHT_BROWSERS` | 指定要安装的浏览器 | `chromium,firefox,webkit,msedge` | `PLAYWRIGHT_BROWSERS=chromium,firefox` |
| `PLAYWRIGHT_INSTALL_IN_CI` | CI 环境强制安装 | `false` | `PLAYWRIGHT_INSTALL_IN_CI=1` |

## 🔨 手动管理浏览器

如果你需要手动管理浏览器：

```bash
# 安装所有浏览器
npm run install-browsers

# 卸载所有浏览器
npm run uninstall-browsers

# 使用 Playwright 命令安装特定浏览器
npx playwright install msedge
npx playwright install firefox
npx playwright install webkit
```

## 🌐 CI/CD 环境

### GitHub Actions

```yaml
- name: Install dependencies
  run: npm install
  env:
    PLAYWRIGHT_INSTALL_IN_CI: 1  # 强制在 CI 中安装浏览器

# 或者跳过自动安装，手动控制
- name: Install dependencies  
  run: npm install
  env:
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: 1

- name: Install specific browsers
  run: npx playwright install chromium firefox
```

### Docker

```dockerfile
# 跳过自动安装
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npm install

# 手动安装系统依赖和浏览器
RUN npx playwright install-deps
RUN npx playwright install chromium firefox
```

## 📋 常见场景

### 开发环境

```bash
# 完整安装，包含所有浏览器
npm install @testring/plugin-playwright-driver
```

### 测试环境

```bash
# 只安装 Chromium 和 Firefox
PLAYWRIGHT_BROWSERS=chromium,firefox npm install @testring/plugin-playwright-driver
```

### 生产构建

```bash
# 跳过浏览器安装
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install @testring/plugin-playwright-driver
```

## 🐛 故障排除

### 1. 浏览器安装失败

```bash
# 手动重新安装浏览器
npm run install-browsers

# 或者强制重新安装
npx playwright install --force
```

### 2. Microsoft Edge 安装问题

```bash
# 强制重新安装 Edge
npx playwright install --force msedge
```

### 3. 权限问题

```bash
# 确保脚本有执行权限
chmod +x node_modules/@testring/plugin-playwright-driver/scripts/install-browsers.js
```

### 4. CI 环境中的问题

```bash
# 在 CI 中强制安装浏览器
PLAYWRIGHT_INSTALL_IN_CI=1 npm install

# 或者安装系统依赖
npx playwright install-deps
```

## 📊 验证安装

安装完成后，可以验证浏览器是否正确安装：

```bash
# 检查已安装的浏览器
npx playwright install --list

# 运行测试验证
npm test
```

## 🎨 自定义配置

你可以在项目的 `.npmrc` 文件中设置默认行为：

```ini
# .npmrc
playwright-skip-browser-download=1
playwright-browsers=chromium,firefox
```

## 🚀 升级指南

从旧版本升级时：

```bash
# 卸载旧版本的浏览器
npm run uninstall-browsers

# 重新安装
npm install

# 验证安装
npm run install-browsers
```

## 💡 最佳实践

1. **开发环境**：使用默认安装，获得完整的浏览器支持
2. **CI/CD**：根据测试需求选择特定浏览器
3. **Docker**：跳过自动安装，手动控制浏览器安装
4. **团队协作**：使用 `.npmrc` 文件统一团队配置

## 🔗 相关链接

- [Playwright 官方文档](https://playwright.dev)
- [浏览器支持列表](https://playwright.dev/docs/browsers)
- [CI 环境配置指南](https://playwright.dev/docs/ci)

## 📞 支持

如果遇到问题，请查看：
1. 本文档的故障排除部分
2. 项目的 GitHub Issues
3. Playwright 官方文档 