# @testring/cli-config

Command-line configuration management module that serves as the configuration center for the testring framework. It handles parsing command-line arguments, reading configuration files, and generating the final runtime configuration. This module provides a flexible configuration management mechanism with priority-based merging from multiple configuration sources, ensuring precise test environment configuration.

[![npm version](https://badge.fury.io/js/@testring/cli-config.svg)](https://www.npmjs.com/package/@testring/cli-config)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Overview

The command-line configuration management module is the configuration foundation of the testring framework, providing:
- Intelligent command-line argument parsing and processing
- Multi-format configuration file support (JSON, JavaScript)
- Layered configuration merging mechanism and priority management
- Automatic detection of environment variables and debug state
- Special handling logic for plugin configurations
- Configuration file inheritance and extension mechanism

## Key Features

### Command-Line Parsing
- Powerful argument parsing capabilities based on yargs
- Automatic kebab-case to camelCase conversion
- Support for complex nested parameter structures
- Parameter type validation and normalization

### Configuration File Support
- JSON format static configuration files
- JavaScript format dynamic configuration files
- Asynchronous configuration function support
- Configuration file inheritance (@extend syntax)

### Configuration Merging
- Multi-level configuration priority management
- Deep merge algorithms
- Special handling for plugin configurations
- Environment-aware configuration selection

### Debug and Environment Detection
- Automatic detection of Node.js debug mode
- Environment variable passing and processing
- Detailed logging of configuration loading process

## Installation

```bash
npm install @testring/cli-config
```

## Core Architecture

### getConfig Function
The main configuration retrieval function that provides complete configuration parsing and merging:

```typescript
async function getConfig(argv: Array<string> = []): Promise<IConfig>
```

### Configuration Processing Flow
1. **Command-line argument parsing** - Parse input parameters using yargs
2. **Debug state detection** - Automatically detect Node.js debug mode
3. **Temporary configuration generation** - Merge default configuration and command-line arguments
4. **Environment configuration loading** - Read environment-specific configuration files
5. **Main configuration loading** - Read main configuration files
6. **Final configuration merging** - Merge all configuration sources by priority

## Basic Usage

### Simple Configuration Retrieval

```typescript
import { getConfig } from '@testring/cli-config';

// Get default configuration
const config = await getConfig();
console.log('Default configuration:', config);

// Get configuration from command-line arguments
const config = await getConfig(process.argv.slice(2));
console.log('Command-line configuration:', config);
```

### Usage in CLI Applications

```typescript
import { getConfig } from '@testring/cli-config';

async function main() {
  try {
    const config = await getConfig(process.argv.slice(2));

    console.log('Test file pattern:', config.tests);
    console.log('Worker limit:', config.workerLimit);
    console.log('Retry count:', config.retryCount);
    console.log('Plugin list:', config.plugins);

    // Start tests using configuration
    await startTests(config);
  } catch (error) {
    console.error('Configuration loading failed:', error.message);
    process.exit(1);
  }
}

main();
```

### Integration in Test Framework

```typescript
import { getConfig } from '@testring/cli-config';
import { TestRunner } from '@testring/test-runner';

class TestFramework {
  private config: IConfig;

  async initialize(argv: string[]) {
    this.config = await getConfig(argv);

    // Initialize components based on configuration
    this.setupLogger(this.config.logLevel);
    this.setupWorkers(this.config.workerLimit);
    this.setupPlugins(this.config.plugins);
  }

  async run() {
    const runner = new TestRunner(this.config);
    return await runner.execute();
  }
}
```

## Configuration File Formats

### JSON Configuration File

```json
// .testringrc.json
{
  "tests": "./tests/**/*.spec.js",
  "plugins": [
    "@testring/plugin-selenium-driver",
    ["@testring/plugin-babel", {
      "presets": ["@babel/preset-env"]
    }]
  ],
  "workerLimit": 2,
  "retryCount": 3,
  "retryDelay": 2000,
  "logLevel": "info",
  "screenshots": "afterError",
  "screenshotPath": "./screenshots/"
}
```

### JavaScript Configuration File

```javascript
// .testringrc.js - Static configuration object
module.exports = {
  tests: './tests/**/*.spec.js',
  plugins: ['@testring/plugin-selenium-driver'],
  workerLimit: 2,
  retryCount: 3,
  logLevel: 'info',
  envParameters: {
    baseUrl: 'http://localhost:3000'
  }
};
```

### Dynamic Configuration Function

```javascript
// .testringrc.js - Asynchronous configuration function
module.exports = async (baseConfig, env) => {
  // Dynamic configuration based on environment variables
  const isCI = env.CI === 'true';
  const isDev = env.NODE_ENV === 'development';

  return {
    tests: './tests/**/*.spec.js',
    plugins: [
      '@testring/plugin-selenium-driver',
      ...(isDev ? ['@testring/plugin-devtools'] : [])
    ],
    workerLimit: isCI ? 1 : 4,
    retryCount: isCI ? 1 : 3,
    retryDelay: isCI ? 1000 : 2000,
    logLevel: isDev ? 'debug' : 'info',
    screenshots: isCI ? 'disable' : 'afterError',
    envParameters: {
      baseUrl: env.BASE_URL || 'http://localhost:3000',
      timeout: parseInt(env.TIMEOUT) || 30000
    }
  };
};
```

### Configuration File Inheritance

```javascript
// base.config.js
module.exports = {
  tests: './tests/**/*.spec.js',
  plugins: ['@testring/plugin-selenium-driver'],
  workerLimit: 2,
  retryCount: 3,
  logLevel: 'info'
};
```

```json
// .testringrc.json
{
  "@extend": "./base.config.js",
  "workerLimit": 4,
  "retryCount": 5,
  "envParameters": {
    "baseUrl": "https://staging.example.com"
  }
}
```

## Command-Line Arguments

### Basic Arguments

```bash
# Specify test files
--tests "./tests/**/*.spec.js"

# Set worker process count
--worker-limit 4

# Configure retry
--retry-count 3
--retry-delay 2000

# Log level
--log-level debug

# Debug mode
--debug
```

### Configuration File Arguments

```bash
# Specify main configuration file
--config ./custom.config.js

# Specify environment configuration file
--env-config ./env.staging.js

# Merge multiple configuration sources
--config ./base.config.js --env-config ./env.local.js --worker-limit 2
```

### Plugin Arguments

```bash
# Specify plugins
--plugins @testring/plugin-selenium-driver

# Multiple plugins
--plugins @testring/plugin-selenium-driver --plugins @testring/plugin-babel

# Complex parameter structure
--plugins.0 @testring/plugin-selenium-driver
--plugins.1.0 @testring/plugin-babel
--plugins.1.1.presets.0 @babel/preset-env
```

### Environment Parameters

```bash
# Pass environment parameters
--env-parameters.baseUrl "https://api.example.com"
--env-parameters.timeout 30000
--env-parameters.apiKey "your-api-key"
```

## Configuration Priority

Configuration merging follows the following priority (later ones override earlier ones):

1. **Default configuration** (`defaultConfiguration`)
2. **Environment configuration file** (file specified by `--envConfig`)
3. **Main configuration file** (file specified by `--config`)
4. **Command-line arguments** (directly passed parameters)
5. **Debug state** (automatically detected debug mode)

### Priority Example

```typescript
// 1. Default configuration
const defaultConfig = {
  workerLimit: 1,
  retryCount: 3,
  logLevel: 'info'
};

// 2. Environment configuration file (env.config.js)
const envConfig = {
  workerLimit: 2,
  retryCount: 5
};

// 3. Main configuration file (.testringrc.js)
const mainConfig = {
  workerLimit: 4,
  screenshots: 'afterError'
};

// 4. Command-line arguments
const cliArgs = {
  retryCount: 2,
  logLevel: 'debug'
};

// 5. Debug state
const debugInfo = {
  debug: true
};

// Final merged result
const finalConfig = {
  workerLimit: 4,      // From main configuration file
  retryCount: 2,       // From command-line arguments
  logLevel: 'debug',   // From command-line arguments
  screenshots: 'afterError',  // From main configuration file
  debug: true          // From debug detection
};
```

## Default Configuration

```typescript
export const defaultConfiguration: IConfig = {
  devtool: false,                    // Do not enable dev tools
  tests: './tests/**/*.js',          // Test file pattern
  restartWorker: false,              // Do not restart worker processes
  screenshots: 'disable',           // Disable screenshots
  screenshotPath: './_tmp/',         // Screenshot save path
  config: '.testringrc',             // Default configuration file
  debug: false,                      // Debug mode
  silent: false,                     // Non-silent mode
  bail: false,                       // Do not fail fast
  workerLimit: 1,                    // Single worker process
  maxWriteThreadCount: 2,            // Maximum write thread count
  plugins: [],                       // Empty plugin list
  retryCount: 3,                     // Retry 3 times
  retryDelay: 2000,                  // Retry delay 2 seconds
  testTimeout: 15 * 60 * 1000,       // Test timeout 15 minutes
  logLevel: LogLevel.info,           // Info level logging
  envParameters: {},                 // Empty environment parameters
  httpThrottle: 0,                   // No HTTP request throttling
};
```

## Advanced Usage

### Environment-Specific Configuration

```typescript
// Create multi-environment configuration manager
class ConfigManager {
  private configs = new Map<string, IConfig>();
  
  async loadEnvironmentConfig(env: string, argv: string[]) {
    if (this.configs.has(env)) {
      return this.configs.get(env);
    }
    
    // Set configuration file path based on environment
    const envConfigPath = `./config/${env}.config.js`;
    const argsWithEnvConfig = [...argv, '--env-config', envConfigPath];
    
    const config = await getConfig(argsWithEnvConfig);
    this.configs.set(env, config);
    
    return config;
  }
  
  async getConfig(env: string = 'development', argv: string[] = []) {
    return await this.loadEnvironmentConfig(env, argv);
  }
}

// Usage example
const configManager = new ConfigManager();

// Development environment configuration
const devConfig = await configManager.getConfig('development', process.argv.slice(2));

// Production environment configuration
const prodConfig = await configManager.getConfig('production', process.argv.slice(2));

// Test environment configuration
const testConfig = await configManager.getConfig('test', process.argv.slice(2));
```

### Configuration Validation and Normalization

```typescript
import { getConfig } from '@testring/cli-config';

class ConfigValidator {
  async validateAndNormalizeConfig(argv: string[]) {
    const config = await getConfig(argv);
    
    // Validate required fields
    this.validateRequiredFields(config);
    
    // Normalize configuration values
    this.normalizeConfig(config);
    
    // Validate configuration logic
    this.validateConfigLogic(config);
    
    return config;
  }
  
  private validateRequiredFields(config: IConfig) {
    if (!config.tests) {
      throw new Error('Test file pattern (tests) is required');
    }
    
    if (typeof config.workerLimit !== 'number' && config.workerLimit !== 'local') {
      throw new Error('Worker process count (workerLimit) must be a number or "local"');
    }
  }
  
  private normalizeConfig(config: IConfig) {
    // Normalize paths
    if (config.screenshotPath && !config.screenshotPath.endsWith('/')) {
      config.screenshotPath += '/';
    }
    
    // Normalize values
    if (config.retryCount < 0) {
      config.retryCount = 0;
    }
    
    if (config.retryDelay < 0) {
      config.retryDelay = 0;
    }
    
    // Normalize plugin configuration
    config.plugins = config.plugins.map(plugin => {
      if (typeof plugin === 'string') {
        return plugin;
      }
      return [plugin[0], plugin[1] || {}];
    });
  }
  
  private validateConfigLogic(config: IConfig) {
    // Validate worker process count reasonableness
    if (typeof config.workerLimit === 'number' && config.workerLimit > 16) {
      console.warn('Too many worker processes may cause performance issues');
    }
    
    // Validate timeout
    if (config.testTimeout < 1000) {
      console.warn('Test timeout too short may cause false positives');
    }
    
    // Validate retry configuration
    if (config.retryCount > 5) {
      console.warn('Too many retry attempts may extend test time');
    }
  }
}
```

### Dynamic Configuration Modification

```typescript
import { getConfig } from '@testring/cli-config';

class DynamicConfigManager {
  private baseConfig: IConfig;
  
  async initialize(argv: string[]) {
    this.baseConfig = await getConfig(argv);
  }
  
  // Dynamically adjust configuration based on test phase
  getPhaseConfig(phase: 'smoke' | 'regression' | 'performance') {
    const config = { ...this.baseConfig };
    
    switch (phase) {
      case 'smoke':
        config.tests = './tests/smoke/**/*.spec.js';
        config.workerLimit = 1;
        config.retryCount = 1;
        config.screenshots = 'disable';
        break;
        
      case 'regression':
        config.tests = './tests/**/*.spec.js';
        config.workerLimit = 4;
        config.retryCount = 3;
        config.screenshots = 'afterError';
        break;
        
      case 'performance':
        config.tests = './tests/performance/**/*.spec.js';
        config.workerLimit = 1;
        config.retryCount = 0;
        config.screenshots = 'disable';
        config.testTimeout = 5 * 60 * 1000; // 5 minutes
        break;
    }
    
    return config;
  }
  
  // Dynamically adjust based on resource availability
  getResourceOptimizedConfig() {
    const config = { ...this.baseConfig };
    const totalMem = process.memoryUsage().heapTotal;
    const cpuCount = require('os').cpus().length;
    
    // Adjust worker process count based on memory
    if (totalMem < 1024 * 1024 * 1024) { // Less than 1GB
      config.workerLimit = 1;
    } else if (totalMem < 2048 * 1024 * 1024) { // Less than 2GB
      config.workerLimit = Math.min(2, cpuCount);
    } else {
      config.workerLimit = Math.min(4, cpuCount);
    }
    
    return config;
  }
}
```

## Plugin Configuration Handling

### Plugin Configuration Format

```typescript
// Simple plugin configuration
const plugins = [
  '@testring/plugin-selenium-driver',
  '@testring/plugin-babel'
];

// Complex plugin configuration
const plugins = [
  '@testring/plugin-selenium-driver',
  ['@testring/plugin-babel', {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-transform-runtime']
  }],
  ['@testring/plugin-custom', {
    option1: 'value1',
    option2: {
      nested: 'value'
    }
  }]
];
```

### Plugin Merge Logic

```typescript
// Plugin configuration before merging
const basePlugins = [
  '@testring/plugin-selenium-driver',
  ['@testring/plugin-babel', { presets: ['@babel/preset-env'] }]
];

const additionalPlugins = [
  ['@testring/plugin-babel', { plugins: ['@babel/plugin-transform-runtime'] }],
  '@testring/plugin-custom'
];

// Merged result
const mergedPlugins = [
  '@testring/plugin-selenium-driver',
  ['@testring/plugin-babel', {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-transform-runtime']
  }],
  '@testring/plugin-custom'
];
```

### Plugin Configuration Validation

```typescript
class PluginConfigValidator {
  validatePluginConfig(plugins: any[]) {
    return plugins.map(plugin => {
      if (typeof plugin === 'string') {
        return this.validatePluginName(plugin);
      }
      
      if (Array.isArray(plugin)) {
        const [name, config] = plugin;
        return [
          this.validatePluginName(name),
          this.validatePluginOptions(name, config)
        ];
      }
      
      throw new Error(`Invalid plugin configuration: ${JSON.stringify(plugin)}`);
    });
  }
  
  private validatePluginName(name: string) {
    if (!name || typeof name !== 'string') {
      throw new Error('Plugin name must be a non-empty string');
    }
    
    if (!name.startsWith('@testring/')) {
      console.warn(`Plugin ${name} is not an official plugin`);
    }
    
    return name;
  }
  
  private validatePluginOptions(name: string, options: any) {
    if (options === null || options === undefined) {
      return {};
    }
    
    if (typeof options !== 'object') {
      throw new Error(`Plugin ${name} configuration must be an object`);
    }
    
    return options;
  }
}
```

## Error Handling

### Configuration Loading Errors

```typescript
import { getConfig } from '@testring/cli-config';

async function safeGetConfig(argv: string[]) {
  try {
    return await getConfig(argv);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Configuration file syntax error:', error.message);
      console.error('Please check if the configuration file syntax is correct');
    } else if (error.message.includes('not found')) {
      console.error('Configuration file not found:', error.message);
      console.error('Please confirm if the configuration file path is correct');
    } else {
      console.error('Configuration loading failed:', error.message);
    }
    
    // Return default configuration
    return await getConfig([]);
  }
}
```

### Configuration Validation Errors

```typescript
class ConfigErrorHandler {
  handleConfigError(error: Error, argv: string[]) {
    console.error('Configuration error:', error.message);
    
    if (error.message.includes('Config file') && error.message.includes('can\'t be parsed')) {
      console.error('Configuration file parsing failed, please check syntax');
      console.error('Supported formats: JSON (.json) and JavaScript (.js)');
      
      // Provide fix suggestions
      this.suggestConfigFix(argv);
    } else if (error.message.includes('not supported')) {
      console.error('Unsupported configuration file format');
      console.error('Please use .json or .js format configuration files');
    } else {
      console.error('Detailed error information:', error.stack);
    }
  }
  
  private suggestConfigFix(argv: string[]) {
    console.log('\nFix suggestions:');
    console.log('1. Check if the configuration file syntax is correct');
    console.log('2. Confirm if the JSON file format is valid');
    console.log('3. Confirm if the JavaScript file correctly exports configuration');
    console.log('4. Use --config parameter to specify correct configuration file path');
    
    // Try to find configuration file
    const configArg = argv.find(arg => arg.startsWith('--config'));
    if (configArg) {
      const configPath = configArg.split('=')[1] || argv[argv.indexOf(configArg) + 1];
      console.log(`Current configuration file path: ${configPath}`);
    }
  }
}
```

## Performance Optimization

### Configuration Caching

```typescript
class ConfigCache {
  private cache = new Map<string, IConfig>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  async getCachedConfig(argv: string[]): Promise<IConfig> {
    const key = this.generateCacheKey(argv);
    const cached = this.cache.get(key);
    
    if (cached && this.isCacheValid(key)) {
      return cached;
    }
    
    const config = await getConfig(argv);
    this.cache.set(key, config);
    this.setCacheTimestamp(key);
    
    return config;
  }
  
  private generateCacheKey(argv: string[]): string {
    return Buffer.from(argv.join('|')).toString('base64');
  }
  
  private isCacheValid(key: string): boolean {
    const timestamp = this.getCacheTimestamp(key);
    return timestamp && (Date.now() - timestamp) < this.cacheTimeout;
  }
  
  private setCacheTimestamp(key: string): void {
    this.cache.set(`${key}:timestamp`, Date.now() as any);
  }
  
  private getCacheTimestamp(key: string): number | null {
    return this.cache.get(`${key}:timestamp`) as number || null;
  }
}
```

### Asynchronous Configuration Loading

```typescript
class AsyncConfigLoader {
  private loadingPromises = new Map<string, Promise<IConfig>>();
  
  async loadConfig(argv: string[]): Promise<IConfig> {
    const key = this.generateKey(argv);
    
    if (this.loadingPromises.has(key)) {
      return await this.loadingPromises.get(key);
    }
    
    const promise = this.performConfigLoad(argv);
    this.loadingPromises.set(key, promise);
    
    try {
      const result = await promise;
      this.loadingPromises.delete(key);
      return result;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }
  
  private async performConfigLoad(argv: string[]): Promise<IConfig> {
    // Simulate async configuration loading
    await new Promise(resolve => setTimeout(resolve, 100));
    return await getConfig(argv);
  }
  
  private generateKey(argv: string[]): string {
    return argv.join('|');
  }
}
```

## Installation

```bash
npm install @testring/cli-config
```

## Dependencies

- `@testring/utils` - Utility functions (path resolution, etc.)
- `@testring/types` - Type definitions
- `yargs` - Command-line argument parsing

## Related Modules

- `@testring/test-runner` - Test execution engine
- `@testring/plugins` - Plugin system
- `@testring/utils` - Utility functions
