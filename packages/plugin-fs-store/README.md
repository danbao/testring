# @testring/plugin-fs-store

该插件用于在测试流程中接入 `@testring/fs-store` 模块，主要扩展文件命名策略，便于根据
工作进程或文件类型组织输出目录。

## 使用方法

在 `.testringrc` 中配置插件并指定需要的静态路径：

```json
{
  "plugins": [
    ["@testring/plugin-fs-store", { "staticPaths": { "screenshot": "./screens" } }]
  ]
}
```

插件会在 `FSStoreServer` 创建文件时执行 `onFileNameAssign` 钩子，根据请求信息生成唯一
文件名。
