# @testring/devtool-frontend

该包是 testring 的前端调试面板，基于 React 构建，为测试过程提供图形化界面。它与
`devtool-backend` 和 `devtool-extension` 配合使用，可实时查看日志、执行步骤及浏览器截
图。

## 功能
- 显示测试运行状态和控制台日志
- 在线查看和编辑测试脚本
- 与浏览器扩展通信，获取页面元素信息
- 支持在调试过程中截屏并展示

## 开发
该包使用 `webpack` 进行构建，源码位于 `src/` 目录。运行 `npm run build` 可生成用于
调试工具的静态文件。
