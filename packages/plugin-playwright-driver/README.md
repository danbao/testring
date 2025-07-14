# @testring/plugin-playwright-driver

Modern browser automation plugin for testring using Playwright.

## Features

- **Fast & Reliable** - Built on Playwright for better performance and stability
- **Multi-browser Support** - Chrome, Firefox, Safari, and Edge
- **Modern APIs** - Auto-waiting, network interception, and mobile emulation
- **Rich Debugging** - Video recording, tracing, and screenshots
- **Coverage Support** - Built-in code coverage collection

## Installation

```bash
npm install @testring/plugin-playwright-driver
```

### 🚀 Automatic Browser Installation

**自动安装模式**：浏览器会在 `npm install` 时自动安装，无需额外步骤！

```bash
# 自动安装所有浏览器 (chromium, firefox, webkit, msedge)
npm install @testring/plugin-playwright-driver

# 跳过浏览器安装
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install @testring/plugin-playwright-driver

# 只安装特定浏览器
PLAYWRIGHT_BROWSERS=chromium,msedge npm install @testring/plugin-playwright-driver

# CI 环境强制安装浏览器
PLAYWRIGHT_INSTALL_IN_CI=1 npm install @testring/plugin-playwright-driver
```

### Manual Browser Management

如果需要手动管理浏览器：

```bash
# 手动安装所有浏览器
npm run install-browsers

# 卸载所有浏览器
npm run uninstall-browsers

# 使用 Playwright 命令安装特定浏览器
npx playwright install msedge  # Microsoft Edge
npx playwright install firefox # Firefox
npx playwright install webkit  # Safari/WebKit
```

### Environment Variables

控制浏览器安装行为的环境变量：

| 环境变量 | 描述 | 示例 |
|---------|------|------|
| `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` | 跳过浏览器安装 | `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` |
| `PLAYWRIGHT_BROWSERS` | 指定要安装的浏览器 | `PLAYWRIGHT_BROWSERS=chromium,firefox` |
| `PLAYWRIGHT_INSTALL_IN_CI` | CI 环境强制安装 | `PLAYWRIGHT_INSTALL_IN_CI=1` |

## Usage

### Basic Configuration

```javascript
// testring.config.js
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            browserName: 'chromium', // 'chromium', 'firefox', 'webkit', or 'msedge'
            launchOptions: {
                headless: true,
                args: ['--no-sandbox']
            }
        }]
    ]
};
```

### Advanced Configuration

```javascript
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            browserName: 'chromium',
            launchOptions: {
                headless: false,
                slowMo: 100
            },
            contextOptions: {
                viewport: { width: 1280, height: 720 },
                locale: 'en-US'
            },
            coverage: true,
            video: true,
            trace: true
        }]
    ]
};
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `browserName` | string | `'chromium'` | Browser to use: `'chromium'`, `'firefox'`, `'webkit'`, or `'msedge'` |
| `launchOptions` | object | `{}` | Playwright launch options |
| `contextOptions` | object | `{}` | Browser context options |
| `coverage` | boolean | `false` | Enable code coverage collection |
| `video` | boolean | `false` | Enable video recording |
| `trace` | boolean | `false` | Enable trace recording |
| `clientTimeout` | number | `900000` | Client timeout in milliseconds |

## Migration from Selenium

This plugin provides the same API as `@testring/plugin-selenium-driver`, making migration straightforward:

```javascript
// Before (Selenium)
['@testring/plugin-selenium-driver', { ... }]

// After (Playwright) 
['@testring/plugin-playwright-driver', { ... }]
```

Most existing tests should work without modification.

## Browser Support

- **Chromium** - Latest stable version
- **Firefox** - Latest stable version  
- **WebKit** - Safari technology preview
- **Microsoft Edge** - Latest stable version (requires `npx playwright install msedge`)

## Debugging

### Video Recording
```javascript
{
    video: true,
    videoDir: './test-results/videos'
}
```

### Trace Recording
```javascript
{
    trace: true,
    traceDir: './test-results/traces'
}
```

### Screenshots
Screenshots are automatically available via the `makeScreenshot()` method.

## Performance Tips

1. Use `headless: true` for CI environments
2. Enable coverage only when needed
3. Limit video recording to failing tests
4. Use viewport settings appropriate for your tests

## License

MIT