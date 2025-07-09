# @testring/cli-config

`@testring/cli-config` 模块负责解析命令行参数、读取配置文件并生成最终的运行配置。它
被 `@testring/cli` 和框架的其他核心模块用来统一处理配置逻辑。

## 功能概览

- **命令行解析**：基于 `yargs` 解析传入的参数，支持 `--tests`、`--plugins`、`--workerLimit` 等常用选项，并自动将 `kebab-case` 转为 `camelCase`。
- **默认配置**：提供 `defaultConfiguration`，包含测试文件路径、日志级别、并发数等默认值。
- **配置文件读取**：支持 `.json` 与 `.js` 两种格式的配置文件，`js` 文件可导出对象或函数。
- **配置合并**：按优先级将默认配置、环境配置文件、主配置文件以及命令行参数进行深度合并。
- **调试模式检测**：自动判断当前是否处于 `Node.js` 调试模式并写入 `debug` 选项。

## 基本用法

```typescript
import { getConfig } from '@testring/cli-config';

(async () => {
  const config = await getConfig(process.argv.slice(2));
  console.log('最终配置', config);
})();
```

## 自定义配置文件

`.testringrc` 支持直接导出对象或异步函数：

```javascript
// 异步配置文件示例
module.exports = async (baseConfig, env) => {
  return {
    tests: './tests/**/*.spec.js',
    plugins: ['@testring/plugin-selenium-driver'],
    workerLimit: env.CI ? 1 : 2,
  };
};
```
## 配置优先级
1. 默认配置 `defaultConfiguration`
2. `--envConfig` 指定的环境配置文件
3. `--config` 指定的主配置文件
4. 命令行参数

越靠后的配置会覆盖之前的同名字段。

## 常见选项说明

| 参数            | 说明                         |
|-----------------|------------------------------|
| `tests`         | 测试文件的 glob 模式         |
| `plugins`       | 需要加载的插件列表           |
| `workerLimit`   | 并行运行的工作进程数量       |
| `retryCount`    | 失败重试次数                 |
| `retryDelay`    | 每次重试的等待时间（毫秒）   |
| `logLevel`      | 日志级别，如 `info`、`debug` |

## 依赖
- `yargs` - 命令行参数解析库
- `@testring/logger` - 日志输出
- `@testring/utils` - 通用工具函数
- `@testring/types` - 类型定义

此模块在框架内部使用较多，单独使用时通常不需要直接操作其 API，但阅读其实现有助于
理解 testring 的配置加载流程。
