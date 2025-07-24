# Selenium Grid 测试指南

本文档介绍如何在 Testring 项目中使用 Docker Selenium Grid 进行 E2E 测试。

## 📋 概述

Testring 支持使用 Docker Selenium Grid 来运行 E2E 测试，这样可以：

- 在隔离的环境中运行测试
- 支持多浏览器并行测试
- 在 GitHub Actions 中自动化测试
- 本地开发时提供一致的测试环境

## 🚀 快速开始

### 1. 本地使用

#### 启动 Selenium Grid

```bash
# 启动 Grid
./scripts/start-selenium-grid.sh

# 或者手动启动
cd docker
docker compose -f docker-selenium.yml up -d
```

#### 运行测试

```bash
# 设置环境变量（可选，脚本会提示）
export SELENIUM_GRID_URL=http://localhost:4444/wd/hub

# 运行测试
npm run test:playwright:custom-grid
```

#### 停止 Selenium Grid

```bash
# 停止 Grid
./scripts/stop-selenium-grid.sh

# 或者手动停止
cd docker
docker compose -f docker-selenium.yml down -v
```

### 2. GitHub Actions 使用

测试会在以下情况下自动触发：

- 推送到 `master` 或 `main` 分支
- 创建 Pull Request
- 手动触发（workflow_dispatch）

相关文件变更时也会触发：
- `packages/e2e-test-app/**`
- `packages/plugin-playwright-driver/**`
- `packages/web-application/**`
- `docker/docker-selenium.yml`
- `.github/workflows/selenium-grid-e2e.yml`

## 📁 相关文件

```
testring/
├── docker/
│   └── docker-selenium.yml              # Docker Compose 配置
├── scripts/
│   ├── start-selenium-grid.sh           # 启动脚本
│   └── stop-selenium-grid.sh            # 停止脚本
├── packages/e2e-test-app/
│   ├── test/playwright/
│   │   └── config-custom-grid.js        # 自定义 Grid 配置
│   └── package.json                     # test:playwright:custom-grid 脚本
└── .github/workflows/
    └── selenium-grid-e2e.yml            # GitHub Actions 工作流
```

## ⚙️ 配置说明

### Docker Selenium Grid 配置

位置：`docker/docker-selenium.yml`

主要设置：
- **Hub 端口**: 4444 (Web UI), 4442/4443 (事件总线)
- **Chrome 节点**: 最多 6 个并发会话
- **屏幕分辨率**: 1280x720
- **超时设置**: 连接和会话超时

### 测试配置

位置：`packages/e2e-test-app/test/playwright/config-custom-grid.js`

主要特性：
- **动态 Grid URL**: 通过 `SELENIUM_GRID_URL` 环境变量控制
- **浏览器配置**: Chrome with no-sandbox (适用于容器环境)
- **重试机制**: CI 环境中自动重试失败的测试
- **超时控制**: 可配置的测试和客户端超时

## 🔧 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `SELENIUM_GRID_URL` | `http://aqa01-i01-swa04.int.rclabenv.com:4444/wd/hub` | Grid Hub URL |
| `TESTRING_TEST_TIMEOUT` | `120000` | 测试超时时间 (ms) |
| `TESTRING_HEADLESS` | `false` | 是否使用 headless 模式 |

## 🧪 使用示例

### 基本测试

```bash
# 1. 启动 Grid
./scripts/start-selenium-grid.sh

# 2. 运行所有测试
npm run test:playwright:custom-grid

# 3. 停止 Grid
./scripts/stop-selenium-grid.sh
```

### 使用不同的 Grid

```bash
# 使用外部 Grid
export SELENIUM_GRID_URL=http://your-grid-host:4444/wd/hub
npm run test:playwright:custom-grid
```

### 调试模式

```bash
# 启动 Grid
./scripts/start-selenium-grid.sh

# 在浏览器中查看 Grid 状态
open http://localhost:4444

# 运行单个测试文件
npx ts-node src/test-runner.ts \
  --config ./test/playwright/config-custom-grid.js \
  --env-config=./test/playwright/env.json \
  --tests="test/playwright/test/specific-test.spec.js"
```

## 🐛 故障排除

### 常见问题

#### 1. Grid 启动失败

```bash
# 检查 Docker 状态
docker ps
docker logs selenium-hub-grid4

# 检查端口占用
lsof -i :4444
```

#### 2. 测试连接失败

```bash
# 验证 Grid 状态
curl http://localhost:4444/wd/hub/status

# 检查网络连接
docker network ls
docker network inspect docker_selenium-grid
```

#### 3. 浏览器会话问题

```bash
# 查看活动会话
curl http://localhost:4444/wd/hub/sessions

# 重启 Chrome 节点
docker restart $(docker ps -q --filter "ancestor=selenium/node-chrome:4.34.0-20250717")
```

### 日志查看

```bash
# Hub 日志
docker logs selenium-hub-grid4

# Chrome 节点日志  
docker logs $(docker ps -q --filter "ancestor=selenium/node-chrome:4.34.0-20250717")

# 实时查看日志
docker logs -f selenium-hub-grid4
```

## 📊 性能优化

### 并发设置

可以通过修改 `docker/docker-selenium.yml` 调整并发数：

```yaml
chrome:
  environment:
    - SE_NODE_MAX_SESSIONS=10  # 增加并发会话数
```

### 资源限制

```yaml
chrome:
  deploy:
    resources:
      limits:
        memory: 2G
        cpus: '1.0'
```

## 🔗 相关链接

- [Selenium Grid 官方文档](https://selenium.dev/documentation/grid/)
- [Docker Selenium](https://github.com/SeleniumHQ/docker-selenium)
- [Playwright Selenium Grid](https://playwright.dev/docs/selenium-grid)
- [Testring Playwright Driver](./playwright-driver/)

## 📝 更新日志

- **v0.8.0**: 添加 Docker Selenium Grid 支持
- **v0.8.0**: 添加 GitHub Actions 集成
- **v0.8.0**: 添加本地开发脚本 