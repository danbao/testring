# testring 工具脚本集

`utils/` 目录包含了 testring 项目的构建和维护工具脚本，提供完整的项目自动化管理、开发流程支持和 CI/CD 集成能力。这些工具脚本是 testring 单体仓库（monorepo）管理的核心组件，支持多包项目的标准化开发和发布流程。

[![Node.js](https://img.shields.io/badge/Node.js->=14.0.0-brightgreen)](https://nodejs.org/)
[![Lerna](https://img.shields.io/badge/Lerna-Compatible-blue)](https://lerna.js.org/)
[![CI/CD](https://img.shields.io/badge/CI/CD-Ready-success)](https://github.com/features/actions)

## 功能概述

工具脚本集是 testring 项目的自动化管理核心，提供了：
- 完整的包文件管理和模板化系统
- 智能的依赖版本检查和验证机制
- 高效的构建产物清理和环境重置
- 自动化的 README 生成和文档维护
- 批量发布和版本管理支持
- 灵活的 CI/CD 集成和配置管理
- 模板化的项目结构和配置文件
- 跨平台兼容性和错误处理机制

## 主要特性

### 包管理自动化
- 标准化的包文件添加和配置管理
- 智能的依赖版本检查和冲突检测
- 自动化的 README 生成和文档同步
- 模板化的项目结构和配置文件管理

### 构建和发布流程
- 高效的构建产物清理和环境重置
- 批量发布和版本管理支持
- 智能的包依赖关系分析和发布顺序
- 完整的错误处理和回滚机制

### CI/CD 集成
- 完整的持续集成和持续部署支持
- 可配置的发布流程和环境管理
- 自动化的测试和验证流程
- 灵活的包排除和包含机制

### 跨平台兼容性
- 支持 Windows、macOS 和 Linux 操作系统
- 智能的路径处理和文件系统操作
- 完整的错误处理和异常恢复
- 统一的命令行接口和参数处理

## 目录结构

```
utils/
├── README.md                           # 工具脚本集说明文档
├── add-package-files.js               # 包文件添加脚本
├── check-packages-versions.js         # 依赖版本检查脚本
├── cleanup.js                         # 构建产物清理脚本
├── generate-readme.js                 # README 生成脚本
├── override-eslint-config-ringcentral.js # ESLint 配置覆盖脚本
├── publish.js                         # 包发布脚本
├── ts-mocha.js                        # TypeScript Mocha 测试脚本
└── templates/                         # 模板文件目录
    ├── tsconfig.json                  # TypeScript 配置模板
    ├── .mocharc.json                  # Mocha 配置模板
    ├── .npmignore                     # npm 忽略文件模板
    └── .npmrc                         # npm 配置模板
```

## 核心脚本功能

### add-package-files.js - 包文件添加脚本

自动为新包或现有包添加标准的项目文件和配置模板。

**功能特性：**
- 自动复制模板文件到目标目录
- 智能检查文件是否存在，避免覆盖现有文件
- 支持多种配置文件类型（TypeScript、Mocha、npm 等）
- 跨平台路径处理和文件系统操作

**核心逻辑：**
```javascript
// 文件创建逻辑
function createFile(filename) {
    const input = path.join(TEMPLATES_FOLDER, filename);
    const output = path.join(cwd, filename);
    
    // 仅在文件不存在时创建
    if (!existsSync(output)) {
        copyFileSync(input, output);
    }
}
```

**支持的模板文件：**
- `tsconfig.json` - TypeScript 编译配置
- `.mocharc.json` - Mocha 测试框架配置
- `.npmignore` - npm 发布忽略文件
- `.npmrc` - npm 配置文件

**使用示例：**
```bash
# 在包目录中执行
node ../utils/add-package-files.js

# 或通过 npm script
npm run add-package-files
```

### check-packages-versions.js - 依赖版本检查脚本

检查项目中所有依赖包的版本号是否符合精确版本规范，确保构建的一致性和可重现性。

**功能特性：**
- 检查 dependencies、devDependencies、peerDependencies 中的版本号
- 识别非精确版本号（使用 ^、~、<、>、| 等符号）
- 支持命令行输出和程序化检查
- 自动退出码处理，集成 CI/CD 流程

**版本检查规则：**
```javascript
const regex = /\^|~|<|>|\||( - )/;

function checkDependencies(deps) {
    let notExact = [];
    if (!deps) return notExact;
    
    for (let pack in deps) {
        let version = deps[pack];
        if (regex.test(version)) {
            notExact.push(pack + '@' + version);
        }
    }
    return notExact;
}
```

**使用示例：**
```bash
# 检查当前包的版本
node ../utils/check-packages-versions.js

# 检查失败时会输出问题依赖
@types/node@^14.0.0
lodash@~4.17.0
```

**集成到 CI/CD：**
```yaml
# GitHub Actions 示例
- name: Check package versions
  run: node utils/check-packages-versions.js
```

### cleanup.js - 构建产物清理脚本

清理项目的构建产物、依赖文件和临时文件，重置项目到干净状态。

**功能特性：**
- 清理 `node_modules` 目录
- 清理 `dist` 构建产物目录
- 清理 `package-lock.json` 锁定文件
- 使用 rimraf 确保跨平台兼容性
- 安全的文件系统操作和错误处理

**清理逻辑：**
```javascript
const NODE_MODULES_PATH = path.resolve('./node_modules');
const DIST_DIRECTORY = path.resolve('./dist');
const PACKAGE_LOCK = path.resolve('./package-lock.json');

// 安全清理文件和目录
if (fs.existsSync(NODE_MODULES_PATH)) {
    rimraf.sync(NODE_MODULES_PATH);
}
```

**使用场景：**
```bash
# 清理当前包
node ../utils/cleanup.js

# 清理所有包（在根目录）
lerna exec -- node ../utils/cleanup.js

# 重置整个项目
npm run cleanup && npm install
```

### generate-readme.js - README 生成脚本

根据 package.json 信息自动生成标准化的 README.md 文件。

**功能特性：**
- 基于 package.json 的 name 和 description 自动生成
- 标准化的 README 结构和格式
- 支持 npm 和 yarn 安装命令
- 仅在 README 不存在时生成，避免覆盖现有文档

**生成模板：**
```javascript
const content = `
# \`${pkg.name}\`

${pkg.description ? `> ${pkg.description}` : ''}

## Install
Using npm:

\`\`\`
npm install --save-dev ${pkg.name}
\`\`\`

or using yarn:

\`\`\`
yarn add ${pkg.name} --dev
\`\`\`
`;
```

**使用示例：**
```bash
# 为当前包生成 README
node ../utils/generate-readme.js

# 为所有包生成 README
lerna exec -- node ../utils/generate-readme.js
```

### publish.js - 包发布脚本

自动化的包发布流程，支持批量发布和依赖关系管理。

**功能特性：**
- 基于 Lerna 的包管理和发布流程
- 支持包排除和包含机制
- 智能的依赖关系分析和发布顺序
- 并行发布和错误处理
- 完整的 npm 发布集成

**发布配置：**
```javascript
async function task(pkg) {
    await npmPublish({
        package: path.join(pkg.location, 'package.json'),
        token: process.env.NPM_TOKEN,
        access: 'public'
    });
}
```

**使用示例：**
```bash
# 发布所有包
NPM_TOKEN=your_token node utils/publish.js

# 排除特定包
node utils/publish.js --exclude=@testring/example,@testring/test

# 在 CI/CD 中使用
npm run publish:ci
```

## 高级用法和最佳实践

### 完整的项目初始化流程

```bash
# 1. 创建新包目录
mkdir packages/new-package
cd packages/new-package

# 2. 初始化 package.json
npm init -y

# 3. 添加标准文件
node ../../utils/add-package-files.js

# 4. 生成 README
node ../../utils/generate-readme.js

# 5. 检查版本规范
node ../../utils/check-packages-versions.js
```

### 自动化的 CI/CD 集成

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check package versions
        run: node utils/check-packages-versions.js
      
      - name: Run tests
        run: npm test
      
      - name: Build packages
        run: npm run build
  
  publish:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Publish packages
        run: node utils/publish.js
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 批量操作和脚本组合

```bash
# 完整的重置和重建流程
#!/bin/bash

echo "开始项目重置..."

# 1. 清理所有包
echo "清理构建产物..."
lerna exec -- node ../utils/cleanup.js

# 2. 重新安装依赖
echo "重新安装依赖..."
npm install

# 3. 检查版本规范
echo "检查包版本..."
lerna exec -- node ../utils/check-packages-versions.js

# 4. 重新构建
echo "重新构建..."
npm run build

# 5. 运行测试
echo "运行测试..."
npm test

echo "项目重置完成！"
```

### 自定义模板管理

```javascript
// 扩展 add-package-files.js 支持更多模板
const CUSTOM_TEMPLATES = {
    'jest.config.js': 'jest.config.template.js',
    'webpack.config.js': 'webpack.config.template.js',
    'babel.config.js': 'babel.config.template.js'
};

function createCustomFile(templateName, outputName) {
    const template = CUSTOM_TEMPLATES[templateName];
    if (!template) {
        throw new Error(`Template ${templateName} not found`);
    }
    
    const input = path.join(TEMPLATES_FOLDER, template);
    const output = path.join(cwd, outputName);
    
    if (!existsSync(output)) {
        copyFileSync(input, output);
        console.log(`Created ${outputName} from ${template}`);
    }
}
```

### 高级发布策略

```javascript
// 自定义发布过滤器
function shouldPublishPackage(pkg) {
    // 跳过私有包
    if (pkg.private) return false;
    
    // 跳过示例包
    if (pkg.name.includes('example')) return false;
    
    // 跳过测试包
    if (pkg.name.includes('test')) return false;
    
    // 检查是否有更新
    return hasChanges(pkg);
}

// 条件发布
async function conditionalPublish() {
    const packages = await getPackages(__dirname);
    const filteredPackages = packages.filter(shouldPublishPackage);
    
    console.log(`准备发布 ${filteredPackages.length} 个包`);
    
    for (const pkg of filteredPackages) {
        try {
            await publishPackage(pkg);
            console.log(`✓ 发布成功: ${pkg.name}`);
        } catch (error) {
            console.error(`✗ 发布失败: ${pkg.name}`, error.message);
        }
    }
}
```

## 开发和维护指南

### 添加新的工具脚本

```javascript
#!/usr/bin/env node

// 标准的脚本结构
const fs = require('fs');
const path = require('path');

// 1. 参数解析
const args = process.argv.slice(2);
const options = parseArguments(args);

// 2. 主要功能实现
async function main() {
    try {
        // 实现核心逻辑
        await performTask(options);
        
        // 成功输出
        console.log('任务完成！');
        process.exit(0);
    } catch (error) {
        // 错误处理
        console.error('任务失败:', error.message);
        process.exit(1);
    }
}

// 3. 参数解析函数
function parseArguments(args) {
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            options[key] = value || true;
        }
    }
    
    return options;
}

// 4. 执行主函数
main().catch(console.error);
```

### 模板文件管理

```javascript
// templates/manager.js - 模板管理器
class TemplateManager {
    constructor(templatesDir) {
        this.templatesDir = templatesDir;
        this.templates = this.loadTemplates();
    }
    
    loadTemplates() {
        const templates = {};
        const files = fs.readdirSync(this.templatesDir);
        
        files.forEach(file => {
            if (file.endsWith('.template')) {
                const name = file.replace('.template', '');
                templates[name] = path.join(this.templatesDir, file);
            }
        });
        
        return templates;
    }
    
    applyTemplate(templateName, outputPath, variables = {}) {
        const templatePath = this.templates[templateName];
        if (!templatePath) {
            throw new Error(`Template ${templateName} not found`);
        }
        
        let content = fs.readFileSync(templatePath, 'utf8');
        
        // 替换变量
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            content = content.replace(regex, variables[key]);
        });
        
        fs.writeFileSync(outputPath, content);
    }
}
```

### 错误处理和日志记录

```javascript
// utils/logger.js - 统一的日志记录
class Logger {
    constructor(name) {
        this.name = name;
    }
    
    info(message, ...args) {
        console.log(`[${this.name}] INFO: ${message}`, ...args);
    }
    
    warn(message, ...args) {
        console.warn(`[${this.name}] WARN: ${message}`, ...args);
    }
    
    error(message, ...args) {
        console.error(`[${this.name}] ERROR: ${message}`, ...args);
    }
    
    success(message, ...args) {
        console.log(`[${this.name}] SUCCESS: ${message}`, ...args);
    }
}

// 使用示例
const logger = new Logger('PublishScript');

try {
    await publishPackage(pkg);
    logger.success(`发布成功: ${pkg.name}`);
} catch (error) {
    logger.error(`发布失败: ${pkg.name}`, error.message);
    throw error;
}
```

## 故障排除

### 常见问题和解决方案

#### 1. 文件权限问题
```bash
Error: EACCES: permission denied, open '/path/to/file'
```
**解决方案：**
- 检查文件和目录权限
- 使用 `sudo` 或修改文件权限
- 确保运行用户有足够的权限

#### 2. 依赖版本冲突
```bash
Found non-exact versions:
@types/node@^14.0.0
lodash@~4.17.0
```
**解决方案：**
- 使用精确版本号：`"@types/node": "14.18.0"`
- 运行 `npm install --package-lock-only` 更新锁定文件
- 检查 `package-lock.json` 确保版本一致

#### 3. 发布失败
```bash
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@testring/package
```
**解决方案：**
- 检查 NPM_TOKEN 是否正确设置
- 验证包名是否已被占用
- 确认发布权限和组织设置

#### 4. 模板文件缺失
```bash
Error: ENOENT: no such file or directory, open 'templates/tsconfig.json'
```
**解决方案：**
- 确保 templates 目录存在
- 检查模板文件是否完整
- 验证路径解析是否正确

#### 5. 清理脚本执行失败
```bash
Error: Cannot find module 'rimraf'
```
**解决方案：**
- 安装缺失的依赖：`npm install rimraf`
- 检查 package.json 中的依赖声明
- 确保在正确的目录中运行脚本

### 调试技巧

#### 1. 启用详细输出
```javascript
// 在脚本中添加调试信息
const DEBUG = process.env.DEBUG || false;

function debug(message, ...args) {
    if (DEBUG) {
        console.log(`[DEBUG] ${message}`, ...args);
    }
}

// 使用
debug('Processing package:', pkg.name);
```

#### 2. 步骤追踪
```javascript
// 添加步骤追踪
let step = 0;
function logStep(message) {
    console.log(`[${++step}] ${message}`);
}

logStep('开始清理构建产物');
logStep('清理 node_modules');
logStep('清理 dist 目录');
logStep('清理完成');
```

#### 3. 错误上下文
```javascript
// 增强错误信息
function enhancedError(message, context = {}) {
    const error = new Error(message);
    error.context = context;
    return error;
}

// 使用
try {
    await publishPackage(pkg);
} catch (error) {
    throw enhancedError(`发布失败: ${pkg.name}`, {
        packageName: pkg.name,
        packagePath: pkg.location,
        originalError: error.message
    });
}
```

## 性能优化

### 1. 并行处理
```javascript
// 并行执行清理任务
async function parallelCleanup(packages) {
    const tasks = packages.map(pkg => cleanupPackage(pkg));
    const results = await Promise.allSettled(tasks);
    
    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(`清理失败: ${packages[index].name}`, result.reason);
        }
    });
}
```

### 2. 缓存优化
```javascript
// 文件状态缓存
const fileCache = new Map();

function isFileModified(filePath) {
    const stats = fs.statSync(filePath);
    const cached = fileCache.get(filePath);
    
    if (cached && cached.mtime === stats.mtime.getTime()) {
        return false;
    }
    
    fileCache.set(filePath, {
        mtime: stats.mtime.getTime(),
        size: stats.size
    });
    
    return true;
}
```

### 3. 增量操作
```javascript
// 只处理变更的包
function getChangedPackages(packages) {
    return packages.filter(pkg => {
        const packageJsonPath = path.join(pkg.location, 'package.json');
        return isFileModified(packageJsonPath);
    });
}
```

## 集成和扩展

### 1. 与其他工具集成
```javascript
// 与 ESLint 集成
function runESLint(packagePath) {
    const { ESLint } = require('eslint');
    const eslint = new ESLint({
        baseConfig: require('./eslint.config.js'),
        cwd: packagePath
    });
    
    return eslint.lintFiles(['src/**/*.ts']);
}

// 与 Prettier 集成
function runPrettier(packagePath) {
    const prettier = require('prettier');
    const glob = require('glob');
    
    const files = glob.sync('src/**/*.{ts,js}', { cwd: packagePath });
    
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const formatted = prettier.format(content, {
            parser: 'typescript',
            ...require('./prettier.config.js')
        });
        
        fs.writeFileSync(file, formatted);
    });
}
```

### 2. 自定义钩子系统
```javascript
// 钩子系统
class HookSystem {
    constructor() {
        this.hooks = {};
    }
    
    addHook(name, callback) {
        if (!this.hooks[name]) {
            this.hooks[name] = [];
        }
        this.hooks[name].push(callback);
    }
    
    async runHooks(name, context) {
        if (!this.hooks[name]) return;
        
        for (const hook of this.hooks[name]) {
            await hook(context);
        }
    }
}

// 使用钩子
const hooks = new HookSystem();

hooks.addHook('before-publish', async (pkg) => {
    console.log(`准备发布: ${pkg.name}`);
    await runTests(pkg);
});

hooks.addHook('after-publish', async (pkg) => {
    console.log(`发布完成: ${pkg.name}`);
    await notifySlack(pkg);
});
```

## 最佳实践总结

### 1. 脚本开发原则
- **单一职责**：每个脚本只负责一个特定的任务
- **幂等性**：多次执行相同的脚本应该产生相同的结果
- **错误处理**：提供清晰的错误信息和恢复机制
- **日志记录**：记录详细的操作日志和状态信息

### 2. 版本管理
- **精确版本**：使用精确的版本号而非范围版本
- **锁定文件**：维护 package-lock.json 确保一致性
- **依赖审查**：定期审查和更新依赖包

### 3. 自动化流程
- **CI/CD 集成**：将脚本集成到持续集成流程中
- **自动化测试**：确保脚本的正确性和稳定性
- **监控和告警**：监控脚本执行状态和性能

### 4. 安全考虑
- **权限控制**：最小化脚本运行权限
- **敏感信息**：使用环境变量管理敏感信息
- **输入验证**：验证用户输入和参数

### 5. 维护和文档
- **代码注释**：提供清晰的代码注释和文档
- **版本记录**：记录脚本的变更历史
- **使用示例**：提供详细的使用示例和最佳实践

## 相关资源

### 依赖工具
- **[Lerna](https://lerna.js.org/)** - 多包管理工具
- **[npm-publish](https://www.npmjs.com/package/@jsdevtools/npm-publish)** - npm 发布工具
- **[rimraf](https://www.npmjs.com/package/rimraf)** - 跨平台文件删除工具

### 扩展阅读
- **[Monorepo 最佳实践](https://monorepo.tools/)**
- **[npm 发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)**
- **[CI/CD 集成模式](https://docs.github.com/en/actions)**

### 社区资源
- **[testring 项目主页](https://github.com/ringcentral/testring)**
- **[问题反馈](https://github.com/ringcentral/testring/issues)**
- **[贡献指南](https://github.com/ringcentral/testring/blob/master/CONTRIBUTING.md)**

## 许可证

MIT License 