# testring Utility Scripts Collection

The `utils/` directory contains build and maintenance utility scripts for the testring project, providing complete project automation management, development workflow support, and CI/CD integration capabilities. These utility scripts are core components of testring monorepo management, supporting standardized development and release workflows for multi-package projects.

[![Node.js](https://img.shields.io/badge/Node.js->=14.0.0-brightgreen)](https://nodejs.org/)
[![Lerna](https://img.shields.io/badge/Lerna-Compatible-blue)](https://lerna.js.org/)
[![CI/CD](https://img.shields.io/badge/CI/CD-Ready-success)](https://github.com/features/actions)

## Overview

The utility scripts collection is the automation management core of the testring project, providing:
- Complete package file management and templating system
- Intelligent dependency version checking and validation mechanisms
- Efficient build artifact cleanup and environment reset
- Automated README generation and documentation maintenance
- Batch publishing and version management support
- Flexible CI/CD integration and configuration management
- Templated project structure and configuration files
- Cross-platform compatibility and error handling mechanisms

## Key Features

### Package Management Automation
- Standardized package file addition and configuration management
- Intelligent dependency version checking and conflict detection
- Automated README generation and documentation synchronization
- Templated project structure and configuration file management

### Build and Release Workflow
- Efficient build artifact cleanup and environment reset
- Batch publishing and version management support
- Intelligent package dependency analysis and release ordering
- Complete error handling and rollback mechanisms

### CI/CD Integration
- Complete continuous integration and continuous deployment support
- Configurable release workflows and environment management
- Automated testing and validation workflows
- Flexible package exclusion and inclusion mechanisms

### Cross-Platform Compatibility
- Support for Windows, macOS, and Linux operating systems
- Intelligent path handling and file system operations
- Complete error handling and exception recovery
- Unified command-line interface and parameter processing

## Directory Structure

```
utils/
├── README.md                           # Utility scripts collection documentation
├── add-package-files.js               # Package file addition script
├── check-packages-versions.js         # Dependency version checking script
├── cleanup.js                         # Build artifact cleanup script
├── generate-readme.js                 # README generation script
├── override-eslint-config-ringcentral.js # ESLint configuration override script
├── publish.js                         # Package publishing script
├── ts-mocha.js                        # TypeScript Mocha test script
└── templates/                         # Template files directory
    ├── tsconfig.json                  # TypeScript configuration template
    ├── .mocharc.json                  # Mocha configuration template
    ├── .npmignore                     # npm ignore file template
    └── .npmrc                         # npm configuration template
```

## Core Script Functions

### add-package-files.js - Package File Addition Script

Automatically adds standard project files and configuration templates for new or existing packages.

**Features:**
- Automatically copies template files to target directory
- Intelligently checks if files exist to avoid overwriting existing files
- Supports multiple configuration file types (TypeScript, Mocha, npm, etc.)
- Cross-platform path handling and file system operations

**Core Logic:**
```javascript
// File creation logic
function createFile(filename) {
    const input = path.join(TEMPLATES_FOLDER, filename);
    const output = path.join(cwd, filename);

    // Create only if file doesn't exist
    if (!existsSync(output)) {
        copyFileSync(input, output);
    }
}
```

**Supported Template Files:**
- `tsconfig.json` - TypeScript compilation configuration
- `.mocharc.json` - Mocha test framework configuration
- `.npmignore` - npm publish ignore file
- `.npmrc` - npm configuration file

**Usage Example:**
```bash
# Execute in package directory
node ../utils/add-package-files.js

# Or through npm script
npm run add-package-files
```

### check-packages-versions.js - Dependency Version Checking Script

Checks whether all dependency package version numbers in the project comply with exact version specifications, ensuring build consistency and reproducibility.

**Features:**
- Checks version numbers in dependencies, devDependencies, peerDependencies
- Identifies non-exact version numbers (using ^, ~, <, >, | symbols)
- Supports command-line output and programmatic checking
- Automatic exit code handling for CI/CD pipeline integration

**Version Checking Rules:**
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

**Usage Example:**
```bash
# Check current package versions
node ../utils/check-packages-versions.js

# Will output problematic dependencies on failure
@types/node@^14.0.0
lodash@~4.17.0
```

**Integration with CI/CD:**
```yaml
# GitHub Actions example
- name: Check package versions
  run: node utils/check-packages-versions.js
```

### cleanup.js - Build Artifact Cleanup Script

Cleans build artifacts, dependency files, and temporary files from the project, resetting it to a clean state.

**Features:**
- Clean `node_modules` directory
- Clean `dist` build artifacts directory
- Clean `package-lock.json` lock file
- Use rimraf for cross-platform compatibility
- Safe file system operations and error handling

**Cleanup Logic:**
```javascript
const NODE_MODULES_PATH = path.resolve('./node_modules');
const DIST_DIRECTORY = path.resolve('./dist');
const PACKAGE_LOCK = path.resolve('./package-lock.json');

// Safely clean files and directories
if (fs.existsSync(NODE_MODULES_PATH)) {
    rimraf.sync(NODE_MODULES_PATH);
}
```

**Usage Scenarios:**
```bash
# Clean current package
node ../utils/cleanup.js

# Clean all packages (in root directory)
lerna exec -- node ../utils/cleanup.js

# Reset entire project
npm run cleanup && npm install
```

### generate-readme.js - README Generation Script

Automatically generates standardized README.md files based on package.json information.

**Features:**
- Auto-generate based on package.json name and description
- Standardized README structure and format
- Support for npm and yarn installation commands
- Only generate when README doesn't exist, avoiding overwriting existing documentation

**Generation Template:**
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

**Usage Example:**
```bash
# Generate README for current package
node ../utils/generate-readme.js

# Generate README for all packages
lerna exec -- node ../utils/generate-readme.js
```

### publish.js - Package Publishing Script

Automated package publishing workflow supporting batch publishing and dependency management.

**Features:**
- Lerna-based package management and publishing workflow
- Support for package exclusion and inclusion mechanisms
- Intelligent dependency analysis and publishing order
- Parallel publishing and error handling
- Complete npm publishing integration

**Publishing Configuration:**
```javascript
async function task(pkg) {
    await npmPublish({
        package: path.join(pkg.location, 'package.json'),
        token: process.env.NPM_TOKEN,
        access: 'public'
    });
}
```

**Usage Example:**
```bash
# Publish all packages
NPM_TOKEN=your_token node utils/publish.js

# Exclude specific packages
node utils/publish.js --exclude=@testring/example,@testring/test

# Use in CI/CD
npm run publish:ci
```

## Advanced Usage and Best Practices

### Complete Project Initialization Process

```bash
# 1. Create new package directory
mkdir packages/new-package
cd packages/new-package

# 2. Initialize package.json
npm init -y

# 3. Add standard files
node ../../utils/add-package-files.js

# 4. Generate README
node ../../utils/generate-readme.js

# 5. Check version specifications
node ../../utils/check-packages-versions.js
```

### Automated CI/CD Integration

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
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
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

### Batch Operations and Script Combinations

```bash
# Complete reset and rebuild process
#!/bin/bash

echo "Starting project reset..."

# 1. Clean all packages
echo "Cleaning build artifacts..."
lerna exec -- node ../utils/cleanup.js

# 2. Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# 3. Check package versions
echo "Checking package versions..."
lerna exec -- node ../utils/check-packages-versions.js

# 4. Rebuild
echo "Rebuilding..."
npm run build

# 5. Run tests
echo "Running tests..."
npm test

echo "Project reset completed!"
```

### Custom Template Management

```javascript
// Extend add-package-files.js to support more templates
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

### Advanced Publishing Strategy

```javascript
// Custom publish filter
function shouldPublishPackage(pkg) {
    // Skip private packages
    if (pkg.private) return false;
    
    // Skip example packages
    if (pkg.name.includes('example')) return false;
    
    // Skip test packages
    if (pkg.name.includes('test')) return false;
    
    // Check for changes
    return hasChanges(pkg);
}

// Conditional publishing
async function conditionalPublish() {
    const packages = await getPackages(__dirname);
    const filteredPackages = packages.filter(shouldPublishPackage);
    
    console.log(`Preparing to publish ${filteredPackages.length} packages`);
    
    for (const pkg of filteredPackages) {
        try {
            await publishPackage(pkg);
            console.log(`✓ Published successfully: ${pkg.name}`);
        } catch (error) {
            console.error(`✗ Publish failed: ${pkg.name}`, error.message);
        }
    }
}
```

## Development and Maintenance Guide

### Adding New Utility Scripts

```javascript
#!/usr/bin/env node

// Standard script structure
const fs = require('fs');
const path = require('path');

// 1. Argument parsing
const args = process.argv.slice(2);
const options = parseArguments(args);

// 2. Main functionality implementation
async function main() {
    try {
        // Implement core logic
        await performTask(options);
        
        // Success output
        console.log('Task completed!');
        process.exit(0);
    } catch (error) {
        // Error handling
        console.error('Task failed:', error.message);
        process.exit(1);
    }
}

// 3. Argument parsing function
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

// 4. Execute main function
main().catch(console.error);
```

### Template File Management

```javascript
// templates/manager.js - Template manager
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
        
        // Replace variables
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            content = content.replace(regex, variables[key]);
        });
        
        fs.writeFileSync(outputPath, content);
    }
}
```

### Error Handling and Logging

```javascript
// utils/logger.js - Unified logging
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

// Usage example
const logger = new Logger('PublishScript');

try {
    await publishPackage(pkg);
    logger.success(`Published successfully: ${pkg.name}`);
} catch (error) {
    logger.error(`Publish failed: ${pkg.name}`, error.message);
    throw error;
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. File Permission Issues
```bash
Error: EACCES: permission denied, open '/path/to/file'
```
**Solution:**
- Check file and directory permissions
- Use `sudo` or modify file permissions
- Ensure the running user has sufficient permissions

#### 2. Dependency Version Conflicts
```bash
Found non-exact versions:
@types/node@^14.0.0
lodash@~4.17.0
```
**Solution:**
- Use exact version numbers: `"@types/node": "14.18.0"`
- Run `npm install --package-lock-only` to update lock file
- Check `package-lock.json` to ensure version consistency

#### 3. Publishing Failures
```bash
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@testring/package
```
**Solution:**
- Check if NPM_TOKEN is correctly set
- Verify if package name is already taken
- Confirm publishing permissions and organization settings

#### 4. Missing Template Files
```bash
Error: ENOENT: no such file or directory, open 'templates/tsconfig.json'
```
**Solution:**
- Ensure templates directory exists
- Check if template files are complete
- Verify path resolution is correct

#### 5. Cleanup Script Execution Failures
```bash
Error: Cannot find module 'rimraf'
```
**Solution:**
- Install missing dependencies: `npm install rimraf`
- Check dependency declarations in package.json
- Ensure running scripts in correct directory

### Debugging Techniques

#### 1. Enable Verbose Output
```javascript
// Add debug information to scripts
const DEBUG = process.env.DEBUG || false;

function debug(message, ...args) {
    if (DEBUG) {
        console.log(`[DEBUG] ${message}`, ...args);
    }
}

// Usage
debug('Processing package:', pkg.name);
```

#### 2. Step Tracking
```javascript
// Add step tracking
let step = 0;
function logStep(message) {
    console.log(`[${++step}] ${message}`);
}

logStep('Start cleaning build artifacts');
logStep('Clean node_modules');
logStep('Clean dist directory');
logStep('Cleanup completed');
```

#### 3. Error Context
```javascript
// Enhanced error information
function enhancedError(message, context = {}) {
    const error = new Error(message);
    error.context = context;
    return error;
}

// Usage
try {
    await publishPackage(pkg);
} catch (error) {
    throw enhancedError(`Publish failed: ${pkg.name}`, {
        packageName: pkg.name,
        packagePath: pkg.location,
        originalError: error.message
    });
}
```

## Performance Optimization

### 1. Parallel Processing
```javascript
// Parallel cleanup task execution
async function parallelCleanup(packages) {
    const tasks = packages.map(pkg => cleanupPackage(pkg));
    const results = await Promise.allSettled(tasks);
    
    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(`Cleanup failed: ${packages[index].name}`, result.reason);
        }
    });
}
```

### 2. Cache Optimization
```javascript
// File status cache
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

### 3. Incremental Operations
```javascript
// Only process changed packages
function getChangedPackages(packages) {
    return packages.filter(pkg => {
        const packageJsonPath = path.join(pkg.location, 'package.json');
        return isFileModified(packageJsonPath);
    });
}
```

## Integration and Extensions

### 1. Integration with Other Tools
```javascript
// Integration with ESLint
function runESLint(packagePath) {
    const { ESLint } = require('eslint');
    const eslint = new ESLint({
        baseConfig: require('./eslint.config.js'),
        cwd: packagePath
    });
    
    return eslint.lintFiles(['src/**/*.ts']);
}

// Integration with Prettier
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

### 2. Custom Hook System
```javascript
// Hook system
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

// Use hooks
const hooks = new HookSystem();

hooks.addHook('before-publish', async (pkg) => {
    console.log(`Preparing to publish: ${pkg.name}`);
    await runTests(pkg);
});

hooks.addHook('after-publish', async (pkg) => {
    console.log(`Publish completed: ${pkg.name}`);
    await notifySlack(pkg);
});
```

## Best Practices Summary

### 1. Script Development Principles
- **Single Responsibility**: Each script is responsible for only one specific task
- **Idempotency**: Multiple executions of the same script should produce the same result
- **Error Handling**: Provide clear error messages and recovery mechanisms
- **Logging**: Record detailed operation logs and status information

### 2. Version Management
- **Exact Versions**: Use exact version numbers instead of range versions
- **Lock Files**: Maintain package-lock.json to ensure consistency
- **Dependency Review**: Regularly review and update dependency packages

### 3. Automation Workflows
- **CI/CD Integration**: Integrate scripts into continuous integration workflows
- **Automated Testing**: Ensure script correctness and stability
- **Monitoring and Alerts**: Monitor script execution status and performance

### 4. Security Considerations
- **Permission Control**: Minimize script execution permissions
- **Sensitive Information**: Use environment variables to manage sensitive information
- **Input Validation**: Validate user input and parameters

### 5. Maintenance and Documentation
- **Code Comments**: Provide clear code comments and documentation
- **Version Records**: Record script change history
- **Usage Examples**: Provide detailed usage examples and best practices

## Related Resources

### Dependency Tools
- **[Lerna](https://lerna.js.org/)** - Multi-package management tool
- **[npm-publish](https://www.npmjs.com/package/@jsdevtools/npm-publish)** - npm publishing tool
- **[rimraf](https://www.npmjs.com/package/rimraf)** - Cross-platform file deletion tool

### Further Reading
- **[Monorepo Best Practices](https://monorepo.tools/)**
- **[npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)**
- **[CI/CD Integration Patterns](https://docs.github.com/en/actions)**

### Community Resources
- **[testring Project Homepage](https://github.com/ringcentral/testring)**
- **[Issue Feedback](https://github.com/ringcentral/testring/issues)**
- **[Contribution Guide](https://github.com/ringcentral/testring/blob/master/CONTRIBUTING.md)**

## License

MIT License 