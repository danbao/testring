# 🕸️ Selenium Grid 集成指南

本指南详细说明如何在 `@testring/plugin-playwright-driver` 中使用 Selenium Grid 进行分布式测试。

## 📋 概述

Playwright 可以连接到 Selenium Grid Hub 来运行 Google Chrome 或 Microsoft Edge 浏览器，实现分布式测试。这对于以下场景非常有用：

- **并行测试**: 在多台机器上同时运行测试
- **跨平台测试**: 在不同操作系统上运行测试
- **资源管理**: 集中管理浏览器资源
- **隔离环境**: 在容器化环境中运行测试

## 🚀 快速开始

### 基本配置

```javascript
// testring.config.js
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            browserName: 'chromium', // 只有 chromium 和 msedge 支持 Selenium Grid
            seleniumGrid: {
                gridUrl: 'http://selenium-hub:4444'
            }
        }]
    ]
};
```

### 环境变量配置

```bash
export SELENIUM_REMOTE_URL=http://selenium-hub:4444
export SELENIUM_REMOTE_CAPABILITIES='{"browserName":"chrome","browserVersion":"latest"}'
export SELENIUM_REMOTE_HEADERS='{"Authorization":"Bearer your-token"}'
```

## 🔧 详细配置

### 配置选项

| 选项 | 类型 | 描述 |
|------|------|------|
| `seleniumGrid.gridUrl` | `string` | Selenium Grid Hub 的 URL |
| `seleniumGrid.gridCapabilities` | `object` | 传递给 Grid 的额外能力配置 |
| `seleniumGrid.gridHeaders` | `object` | 传递给 Grid 请求的额外头部 |

### 高级配置示例

```javascript
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            browserName: 'chromium',
            seleniumGrid: {
                gridUrl: 'https://your-selenium-grid.com:4444',
                gridCapabilities: {
                    'browserName': 'chrome',
                    'browserVersion': '120.0',
                    'platformName': 'linux',
                    'se:options': {
                        'args': ['--disable-web-security', '--disable-dev-shm-usage'],
                        'prefs': {
                            'profile.default_content_setting_values.notifications': 2
                        }
                    },
                    // 自定义标签，用于标识测试
                    'testName': 'E2E Test Suite',
                    'buildNumber': process.env.BUILD_NUMBER || 'local',
                    'projectName': 'My Application'
                },
                gridHeaders: {
                    'Authorization': 'Bearer your-auth-token',
                    'X-Test-Environment': 'staging',
                    'X-Team': 'qa-team'
                }
            },
            // 其他 Playwright 配置仍然有效
            contextOptions: {
                viewport: { width: 1920, height: 1080 },
                locale: 'en-US',
                timezoneId: 'America/New_York'
            },
            video: true,
            trace: true
        }]
    ]
};
```

## 🌐 浏览器支持

### 支持的浏览器

✅ **Chromium** - 使用 Chrome 节点
```javascript
{
    browserName: 'chromium',
    seleniumGrid: {
        gridCapabilities: {
            'browserName': 'chrome'
        }
    }
}
```

✅ **Microsoft Edge** - 使用 Edge 节点  
```javascript
{
    browserName: 'msedge',
    seleniumGrid: {
        gridCapabilities: {
            'browserName': 'edge'
        }
    }
}
```

### 不支持的浏览器

❌ **Firefox** - Selenium Grid 不支持
❌ **WebKit** - Selenium Grid 不支持

## 🐳 Docker 环境设置

### Docker Compose 示例

创建 `selenium-grid.yml`:

```yaml
version: '3.8'

services:
  selenium-hub:
    image: selenium/hub:4.15.0
    container_name: selenium-hub
    ports:
      - "4442:4442"  # Event bus
      - "4443:4443"  # Event bus
      - "4444:4444"  # Web interface
    environment:
      - GRID_MAX_SESSION=16
      - GRID_BROWSER_TIMEOUT=300
      - GRID_TIMEOUT=300
      - GRID_NEW_SESSION_WAIT_TIMEOUT=10

  chrome:
    image: selenium/node-chrome:4.15.0
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - HUB_HOST=selenium-hub
      - HUB_PORT=4444
      - NODE_MAX_INSTANCES=4
      - NODE_MAX_SESSION=4
      - START_XVFB=false
    scale: 2  # 启动 2 个 Chrome 节点

  edge:
    image: selenium/node-edge:4.15.0
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - HUB_HOST=selenium-hub
      - HUB_PORT=4444
      - NODE_MAX_INSTANCES=2
      - NODE_MAX_SESSION=2
      - START_XVFB=false
    scale: 1  # 启动 1 个 Edge 节点

  # 可选: Selenium Grid UI
  selenium-ui:
    image: selenium/grid-ui:4.15.0
    depends_on:
      - selenium-hub
    ports:
      - "7900:7900"
    environment:
      - HUB_HOST=selenium-hub
      - HUB_PORT=4444
```

### 启动和使用

```bash
# 启动 Selenium Grid
docker-compose -f selenium-grid.yml up -d

# 检查 Grid 状态
curl http://localhost:4444/wd/hub/status

# 运行测试
npm test

# 停止 Grid
docker-compose -f selenium-grid.yml down
```

## 🔧 配置优先级

配置的优先级顺序（从高到低）：

1. **环境变量** (最高优先级)
   - `SELENIUM_REMOTE_URL`
   - `SELENIUM_REMOTE_CAPABILITIES`
   - `SELENIUM_REMOTE_HEADERS`

2. **配置文件**
   - `seleniumGrid.gridUrl`
   - `seleniumGrid.gridCapabilities`
   - `seleniumGrid.gridHeaders`

3. **默认值** (最低优先级)

## 📊 使用场景

### 场景 1: 本地开发环境

```javascript
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            browserName: 'chromium',
            seleniumGrid: {
                gridUrl: 'http://localhost:4444',
                gridCapabilities: {
                    'browserName': 'chrome',
                    'platformName': 'linux'
                }
            }
        }]
    ]
};
```

### 场景 2: CI/CD 环境

```javascript
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            browserName: 'chromium',
            seleniumGrid: {
                gridUrl: process.env.SELENIUM_GRID_URL || 'http://selenium-hub:4444',
                gridCapabilities: {
                    'browserName': 'chrome',
                    'browserVersion': 'latest',
                    'platformName': 'linux',
                    'build': process.env.BUILD_NUMBER,
                    'name': process.env.TEST_NAME
                },
                gridHeaders: {
                    'Authorization': `Bearer ${process.env.GRID_TOKEN}`
                }
            }
        }]
    ]
};
```

### 场景 3: 云端 Selenium Grid 服务

```javascript
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            browserName: 'chromium',
            seleniumGrid: {
                gridUrl: 'https://your-cloud-grid.com:4444',
                gridCapabilities: {
                    'browserName': 'chrome',
                    'browserVersion': 'latest',
                    'platformName': 'Windows 10',
                    // 云服务特定配置
                    'sauce:options': {
                        'username': process.env.SAUCE_USERNAME,
                        'accessKey': process.env.SAUCE_ACCESS_KEY
                    }
                }
            }
        }]
    ]
};
```

## 📝 最佳实践

### 1. 资源管理

```javascript
// 设置合适的并发数，避免资源耗尽
module.exports = {
    workerLimit: 4, // 根据 Grid 容量调整
    plugins: [
        ['@testring/plugin-playwright-driver', {
            // ... Grid 配置
        }]
    ]
};
```

### 2. 错误处理

```javascript
// 使用重试机制处理网络问题
module.exports = {
    retryCount: 2,
    retryDelay: 1000,
    plugins: [
        ['@testring/plugin-playwright-driver', {
            seleniumGrid: {
                // ... Grid 配置
            }
        }]
    ]
};
```

### 3. 超时配置

```javascript
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            clientTimeout: 30 * 60 * 1000, // 30 分钟
            seleniumGrid: {
                gridCapabilities: {
                    'se:options': {
                        'sessionTimeout': 1800 // 30 分钟
                    }
                }
            }
        }]
    ]
};
```

### 4. 调试配置

```javascript
// 开发环境下的调试配置
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            seleniumGrid: {
                gridCapabilities: {
                    'se:options': {
                        'args': process.env.NODE_ENV === 'development' 
                            ? ['--no-sandbox', '--disable-dev-shm-usage'] 
                            : ['--headless', '--no-sandbox']
                    }
                }
            },
            video: process.env.NODE_ENV === 'development',
            trace: process.env.NODE_ENV === 'development'
        }]
    ]
};
```

## 🐛 故障排除

### 常见问题

#### 1. 连接失败
```
Error: getaddrinfo ENOTFOUND selenium-hub
```

**解决方案**:
- 检查 Grid URL 是否正确
- 确认 Selenium Grid 服务正在运行
- 检查网络连接

#### 2. 浏览器不支持
```
Error: Selenium Grid is not supported for Firefox
```

**解决方案**:
- 只使用 `chromium` 或 `msedge` 浏览器
- Firefox 和 WebKit 不支持 Selenium Grid

#### 3. 会话创建失败
```
Error: Could not start a new session
```

**解决方案**:
- 检查 Grid 节点是否有可用容量
- 验证 capabilities 配置是否正确
- 检查认证信息是否正确

### 调试技巧

#### 1. 查看 Grid 状态

```bash
# 检查 Grid Hub 状态
curl http://localhost:4444/wd/hub/status

# 查看可用节点
curl http://localhost:4444/grid/api/hub/status

# 查看活动会话
curl http://localhost:4444/grid/api/sessions
```

#### 2. 启用详细日志

```javascript
module.exports = {
    plugins: [
        ['@testring/plugin-playwright-driver', {
            seleniumGrid: {
                gridCapabilities: {
                    'se:options': {
                        'logLevel': 'DEBUG'
                    }
                }
            }
        }]
    ]
};
```

#### 3. 查看浏览器控制台

在 Grid UI 中 (http://localhost:4444) 可以看到：
- 活动会话
- 节点状态
- 测试执行视频

## 🔗 相关资源

- [Playwright Selenium Grid 文档](https://playwright.dev/docs/selenium-grid)
- [Selenium Grid 4 文档](https://selenium-grid.github.io/selenium-grid/)
- [Docker Selenium 镜像](https://github.com/SeleniumHQ/docker-selenium)
- [Selenium Grid UI](https://github.com/SeleniumHQ/selenium/wiki/Grid2)

## 💡 提示

1. **性能优化**: 使用 `headless` 模式以提高性能
2. **资源限制**: 合理设置并发数，避免资源耗尽
3. **网络稳定性**: 在网络不稳定的环境中增加重试次数
4. **监控**: 定期监控 Grid 节点的健康状况
5. **清理**: 及时清理失效的会话和日志文件 