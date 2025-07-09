# @testring/pluggable-module

该模块提供了简易的插件框架，通过 Hook 机制允许外部插件扩展核心功能。大部分核心模块
都继承自 `PluggableModule`，以便在合适的时机触发插件逻辑。

## 主要概念

- **Hook**：事件钩子，可注册多个回调函数按顺序执行。
- **PluggableModule**：插件化基类，内部维护一组命名 Hook，并提供 `callHook`
  与 `getHook` 方法。

## 快速上手

```typescript
import { PluggableModule } from '@testring/pluggable-module';

class MyModule extends PluggableModule {
  constructor() {
    super(['beforeStart', 'afterEnd']);
  }

  async start() {
    await this.callHook('beforeStart');
    // ...核心逻辑
    await this.callHook('afterEnd');
  }
}
```

插件只需获取指定模块的 Hook 后注册回调即可：

```typescript
myModule.getHook('beforeStart')?.addHook(async () => {
  console.log('插件处理');
});
```
## 应用场景
- 扩展文件读写流程（如 `fs-store`）
- 在测试执行前后插入自定义逻辑
- 根据 Hook 名称解耦模块之间的依赖

该模块实现简单，但为整个框架提供了灵活的扩展能力。
