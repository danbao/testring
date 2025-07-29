# testring

[![license](https://img.shields.io/github/license/ringcentral/testring.svg)](https://github.com/ringcentral/testring/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/testring.svg)](https://www.npmjs.com/package/testring)
[![Node.js CI](https://github.com/ringcentral/testring/actions/workflows/node.js.yml/badge.svg)](https://github.com/ringcentral/testring/actions/workflows/node.js.yml)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ringcentral_testring&metric=coverage)](https://sonarcloud.io/summary/new_code?id=ringcentral_testring)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=ringcentral_testring&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=ringcentral_testring)

A simple, powerful automated UI testing framework based on Node.js.

## Project Overview

testring is a modern testing framework specifically designed for automated testing of web applications. It provides:

- 🚀 **High Performance** - Multi-process parallel test execution
- 🔧 **Extensible** - Rich plugin system architecture
- 🌐 **Multi-Browser** - Support for Chrome, Firefox, Safari, Edge
- 📱 **Modern** - Support for both Selenium and Playwright drivers
- 🛠️ **Developer Friendly** - Complete development toolchain

## Project Structure

```
testring/
├── core/              # Core modules - Framework foundation
│   ├── api/           # Test API controllers
│   ├── cli/           # Command line interface
│   ├── logger/        # Distributed logging system
│   ├── transport/     # Inter-process communication
│   ├── test-worker/   # Test worker processes
│   └── ...           # Other core modules
├── packages/          # Extension packages - Plugins and tools
│   ├── plugin-selenium-driver/    # Selenium driver plugin
│   ├── plugin-playwright-driver/  # Playwright driver plugin
│   ├── web-application/           # Web application testing
│   ├── devtool-frontend/          # Developer tools frontend
│   └── ...                       # Other extension packages
├── docs/              # Documentation directory
├── utils/             # Build and maintenance tools
└── README.md          # Project documentation
```

### Core Modules (core/)

Core modules provide the framework's foundational functionality:

- **API Layer** - Test execution and control interfaces
- **CLI Tools** - Command line interface and argument processing
- **Process Management** - Multi-process test execution and communication
- **File System** - Test file discovery and reading
- **Logging System** - Distributed logging and management
- **Plugin System** - Extensible plugin architecture

### Extension Packages (packages/)

Extension packages provide additional functionality and tools:

- **Browser Drivers** - Selenium and Playwright support
- **Web Testing** - Web application-specific testing features
- **Developer Tools** - Debugging and monitoring tools
- **Network Communication** - WebSocket and HTTP support
- **File Handling** - File upload, download, and storage

## Quick Start

### Installation

```bash
# Install the main framework
npm install testring

# Install Selenium driver (recommended)
npm install @testring/plugin-selenium-driver

# Or install Playwright driver
npm install @testring/plugin-playwright-driver
```

### Basic Configuration

Create a `.testringrc` configuration file:

```json
{
  "tests": "./tests/**/*.spec.js",
  "plugins": [
    "@testring/plugin-selenium-driver"
  ],
  "workerLimit": 2,
  "retryCount": 3
}
```

### Writing Tests

```javascript
// tests/example.spec.js
describe('Example Test', () => {
  it('should be able to access the homepage', async () => {
    await browser.url('https://example.com');

    const title = await browser.getTitle();
    expect(title).toBe('Example Domain');
  });
});
```

### Running Tests

```bash
# Run all tests
testring run

# Run specific tests
testring run --tests "./tests/login.spec.js"

# Set parallel execution
testring run --workerLimit 4

# Debug mode
testring run --logLevel debug
```

## Documentation

For detailed documentation, please refer to:

- [API Reference](docs/api/README.md) - Framework API documentation
- [Configuration Reference](docs/configuration/README.md) - Complete configuration options
- [Plugin Development Guide](docs/guides/plugin-development.md) - Plugin development guide
- [Complete Documentation](docs/README.md) - Full documentation index

## Key Features

### Multi-Process Parallel Execution
- Support for running multiple tests simultaneously
- Process isolation to prevent test interference
- Intelligent load balancing

### Multi-Browser Support
- Chrome, Firefox, Safari, Edge
- Headless mode support
- Mobile browser testing

### Plugin System
- Rich official plugins
- Simple plugin development API
- Community plugin support

### Development Tools
- Visual debugging interface
- Real-time test monitoring
- Detailed test reports

## Development

### Project Setup
```bash
# Clone the project
git clone https://github.com/ringcentral/testring.git

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project
2. Create a feature branch
3. Submit your changes
4. Create a Pull Request

## License

MIT License - See the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Reporting](https://github.com/ringcentral/testring/issues)
- 💬 [Discussions](https://github.com/ringcentral/testring/discussions)
## 🌍 Cloudflare Worker for Test Fixtures

这个项目包含一个独立的 Cloudflare Worker，提供在线测试环境：

```
cloudflare-worker/
├── build.js          # 构建脚本
├── wrangler.toml      # Worker 配置
├── package.json       # 依赖管理
├── static-fixtures/   # 测试页面源文件 (24个)
├── worker.js          # 生成的代码 (gitignored)
└── README.md          # 详细文档
```

### 快速开始

```bash
cd cloudflare-worker
npm install
npm run build
npm run deploy
```

详细信息请查看 [cloudflare-worker/README.md](cloudflare-worker/README.md)
