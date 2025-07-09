# Core 核心模块

`core/` 目录包含了 testring 测试框架的核心模块，提供了框架的基础功能和核心服务。这些模块实现了测试运行、进程管理、文件系统操作、日志记录等关键功能。

## 目录结构

### 核心运行模块
- **`api/`** - 测试 API 控制器，提供测试运行的主要接口
- **`cli/`** - 命令行界面，处理命令行参数和用户交互
- **`testring/`** - 主要的 testring 入口模块

### 测试执行模块
- **`test-worker/`** - 测试工作进程，负责在独立进程中执行测试
- **`test-run-controller/`** - 测试运行控制器，管理测试队列和执行流程
- **`sandbox/`** - 沙箱环境，为测试提供隔离的执行环境

### 进程和通信模块
- **`child-process/`** - 子进程管理，提供进程创建和管理功能
- **`transport/`** - 传输层，处理进程间通信

### 文件系统模块
- **`fs-reader/`** - 文件系统读取器，负责查找和读取测试文件
- **`fs-store/`** - 文件系统存储，提供文件存储和缓存功能

### 配置和工具模块
- **`cli-config/`** - 命令行配置解析器，处理配置文件和参数
- **`logger/`** - 日志系统，提供分布式日志记录功能
- **`types/`** - TypeScript 类型定义，为整个框架提供类型支持
- **`utils/`** - 实用工具函数集合

### 插件和扩展模块
- **`plugin-api/`** - 插件 API，为插件开发提供接口
- **`pluggable-module/`** - 可插拔模块基类，支持钩子和插件机制

### 开发和调试模块
- **`async-assert/`** - 异步断言库，提供测试断言功能
- **`async-breakpoints/`** - 异步断点，用于调试和流程控制
- **`dependencies-builder/`** - 依赖构建器，管理模块依赖关系

## 主要特性

1. **模块化设计** - 每个核心功能都独立为一个模块，便于维护和扩展
2. **插件支持** - 通过插件 API 支持功能扩展
3. **异步处理** - 全面支持异步操作和并发执行
4. **进程管理** - 完整的子进程管理和通信机制
5. **配置灵活** - 支持多种配置方式和环境参数
6. **日志记录** - 分布式日志系统，支持多进程日志聚合

## 使用说明

这些核心模块主要供框架内部使用，开发者通常不需要直接使用这些模块。如果需要扩展框架功能，建议通过插件 API 来实现。

## 模块间依赖关系

### 架构概览

Core 模块采用分层架构设计，共分为 10 个层次，从底层的基础类型定义到顶层的入口模块，形成清晰的依赖层次：

### 详细分层架构

#### 🔷 基础层（Layer 0）
- **types** - 最基础的 TypeScript 类型定义，只依赖 Node.js 类型，为整个框架提供类型支持
- **async-breakpoints** - 异步断点系统，独立模块，用于调试和流程控制

#### 🔶 工具层（Layer 1）
- **utils** - 通用工具函数集合，依赖 `types`
- **pluggable-module** - 插件框架基础，依赖 `types`
- **async-assert** - 异步断言库，依赖 `types`

#### 🔷 基础设施层（Layer 2）
- **child-process** - 子进程管理，依赖 `types` + `utils`
- **transport** - 传输层，依赖 `child-process` + `types` + `utils`
- **dependencies-builder** - 依赖分析构建，依赖 `types` + `utils`

#### 🔶 中间层（Layer 3）
- **logger** - 分布式日志系统，依赖 `pluggable-module` + `transport` + `types` + `utils`
- **fs-reader** - 文件读取器，依赖 `logger` + `pluggable-module` + `types`

#### 🔷 配置存储层（Layer 4）
- **cli-config** - 配置管理，依赖 `logger` + `types` + `utils`
- **fs-store** - 文件存储系统，依赖 `cli-config` + `logger` + `pluggable-module` + `transport` + `types` + `utils`

#### 🔶 API 层（Layer 5）
- **api** - 测试 API 控制器，依赖 `async-breakpoints` + `logger` + `transport` + `types` + `utils`
- **plugin-api** - 插件 API 接口，依赖 `fs-store` + `logger` + `types` + `utils`

#### 🔷 高级功能层（Layer 6）
- **sandbox** - 代码沙箱，依赖 `api` + `types` + `utils`
- **test-run-controller** - 测试运行控制器，依赖 `fs-store` + `logger` + `pluggable-module` + `types` + `utils`

#### 🔶 执行层（Layer 7）
- **test-worker** - 测试工作进程（最复杂的包），几乎依赖所有其他核心包：
  - `api` + `async-breakpoints` + `child-process` + `dependencies-builder`
  - `fs-reader` + `fs-store` + `logger` + `pluggable-module`
  - `sandbox` + `transport` + `types` + `utils`

#### 🔷 接口层（Layer 8）
- **cli** - 命令行接口，集成多个高层包：
  - `cli-config` + `fs-reader` + `fs-store` + `logger` + `plugin-api`
  - `test-run-controller` + `test-worker` + `transport` + `types`

#### 🔶 入口层（Layer 9）
- **testring** - 主入口包，依赖 `api` + `cli`，作为整个框架的统一入口

### 关键依赖特点

1. **严格分层**: 依赖关系呈现清晰的分层结构，每层只依赖下层模块，避免循环依赖
2. **types 基础**: `types` 包是最基础的依赖，被几乎所有包引用，确保类型安全
3. **核心集成**: `test-worker` 是最复杂的包，集成了大部分核心功能，负责实际测试执行
4. **接口统一**: `cli` 包作为主要接口，整合了测试执行所需的各种组件
5. **模块化设计**: 每个包职责单一，接口清晰，便于独立开发、测试和维护
6. **插件友好**: 通过 `pluggable-module` 和 `plugin-api` 提供完整的插件扩展机制

### 依赖关系图

```
testring (入口)
├── api
└── cli
    ├── cli-config
    ├── fs-reader
    ├── fs-store
    ├── logger
    ├── plugin-api
    ├── test-run-controller
    ├── test-worker (最复杂)
    │   ├── api
    │   ├── async-breakpoints
    │   ├── child-process
    │   ├── dependencies-builder
    │   ├── fs-reader
    │   ├── fs-store
    │   ├── logger
    │   ├── pluggable-module
    │   ├── sandbox
    │   ├── transport
    │   ├── types
    │   └── utils
    ├── transport
    └── types
```

这种分层架构确保了代码的可维护性和可扩展性，同时避免了循环依赖的问题，为 testring 框架提供了稳定可靠的基础架构。 