# testring

主入口包，包含命令行工具和可编程的测试 API。

## 功能概述
- 提供 `testring` 命令用于执行测试
- 暴露 `run` API 供脚本中直接调用
- 集成所有核心模块与插件系统

## 安装
```bash
npm install --save-dev testring
```
或使用 yarn:
```bash
yarn add testring --dev
```

## CLI 使用示例
```bash
# 默认运行配置文件中的测试
npx testring

# 指定测试路径
npx testring run --tests "./tests/**/*.spec.js"
```
## API 使用示例
```typescript
import run from 'testring';

await run({
  tests: './tests/**/*.spec.js',
  workerLimit: 2,
});
```

该包仅对外暴露基础启动能力，更多高级功能请参考各子模块文档。

