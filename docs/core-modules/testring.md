# testring

Main entry package for the testring framework, providing command-line tools and programmable test API, serving as the unified entry point for the entire testing framework.

[![npm version](https://badge.fury.io/js/testring.svg)](https://www.npmjs.com/package/testring)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Overview

The testring main package serves as the entry point for the entire testing framework, responsible for:
- Providing the `testring` command-line tool for test execution
- Exposing a unified `run` API for direct script invocation
- Integrating all core modules with the plugin system
- Managing test execution lifecycle
- Handling configuration files and command-line parameters

## Key Features

### Command Line Interface
- Simple and easy-to-use command-line tool
- Support for multiple configuration methods
- Rich command-line parameters
- Intelligent error prompts

### Programmable API
- Flexible programming interface
- Support for asynchronous operations
- Complete lifecycle management
- Plugin system integration

### Multi-Process Support
- Parallel test execution
- Inter-process communication
- Load balancing
- Error isolation

## Installation

### Using npm
```bash
npm install --save-dev testring
```

### Using yarn
```bash
yarn add testring --dev
```

### Using pnpm
```bash
pnpm add testring --dev
```

## Quick Start

### 1. Create Configuration File

Create `.testringrc` file:

```json
{
  "tests": "./tests/**/*.spec.js",
  "plugins": [
    "@testring/plugin-selenium-driver"
  ],
  "workerLimit": 2,
  "retryCount": 3,
  "logLevel": "info"
}
```

### 2. Write Test File

Create `tests/example.spec.js`:

```javascript
describe('Example Test', () => {
  it('should pass basic test', async () => {
    await browser.url('https://example.com');
    const title = await browser.getTitle();
    expect(title).toBe('Example Domain');
  });
});
```

### 3. Run Tests

```bash
npx testring
```

## Command Line Usage

### Basic Commands

```bash
# Run tests (using default configuration)
testring

# Explicitly run tests
testring run

# Show help information
testring --help

# Show version information
testring --version
```

### Common Parameters

#### Test File Configuration
```bash
# Specify test file path
testring run --tests "./tests/**/*.spec.js"

# Specify multiple test paths
testring run --tests "./unit/**/*.test.js" --tests "./e2e/**/*.spec.js"

# Use configuration file
testring run --config ./custom-config.json
```

#### Concurrency Control
```bash
# Set parallel worker process count
testring run --workerLimit 4

# Single process run (useful for debugging)
testring run --workerLimit 1
```

#### Retry Mechanism
```bash
# Set retry count
testring run --retryCount 3

# Set retry delay (milliseconds)
testring run --retryDelay 2000
```

#### Log Control
```bash
# Set log level
testring run --logLevel debug

# Silent mode
testring run --logLevel silent

# Verbose output
testring run --logLevel verbose
```

#### Plugin Configuration
```bash
# Use plugins
testring run --plugins @testring/plugin-selenium-driver

# Use multiple plugins
testring run --plugins @testring/plugin-selenium-driver --plugins @testring/plugin-babel
```

#### Environment Configuration
```bash
# Use environment configuration file
testring run --envConfig ./env/staging.json

# Use both main config and environment config
testring run --config ./base-config.json --envConfig ./env/production.json
```

### Advanced Parameters

```bash
# Stop immediately after test failure
testring run --bail

# Enable debug mode
testring run --debug

# Set timeout
testring run --timeout 30000

# Filter test files
testring run --grep "login"

# Exclude certain tests
testring run --exclude "**/skip/**"
```

## Programming API

### Basic Usage

```typescript
import { run } from 'testring';

// Run tests with default configuration
await run();

// Run with custom configuration
await run({
  tests: './tests/**/*.spec.js',
  workerLimit: 2,
  retryCount: 3,
  logLevel: 'info'
});
```

### Advanced Configuration

```typescript
import { run } from 'testring';

await run({
  // Test file configuration
  tests: [
    './tests/unit/**/*.spec.js',
    './tests/integration/**/*.spec.js'
  ],
  
  // Plugin configuration
  plugins: [
    '@testring/plugin-selenium-driver',
    '@testring/plugin-babel',
    './custom-plugin.js'
  ],
  
  // Execution configuration
  workerLimit: 4,
  retryCount: 3,
  retryDelay: 2000,
  timeout: 30000,
  bail: false,
  
  // Log configuration
  logLevel: 'info',
  silent: false,
  
  // Browser configuration
  browserOptions: {
    headless: true,
    width: 1920,
    height: 1080
  },
  
  // Environment configuration
  envConfig: './env/staging.json'
});
```

### Asynchronous Operations

```typescript
import { run } from 'testring';

async function runTests() {
  try {
    const result = await run({
      tests: './tests/**/*.spec.js',
      workerLimit: 2
    });
    
    console.log('Test run completed:', result);
  } catch (error) {
    console.error('Test run failed:', error);
    process.exit(1);
  }
}

runTests();
```

### Lifecycle Hooks

```typescript
import { run } from 'testring';

await run({
  tests: './tests/**/*.spec.js',
  
  // Before test starts
  beforeRun: async () => {
    console.log('Preparing to start tests');
    await setupTestData();
  },
  
  // After test completion
  afterRun: async () => {
    console.log('Test execution completed');
    await cleanupTestData();
  },
  
  // On test failure
  onError: async (error) => {
    console.error('Test execution failed:', error);
    await sendFailureNotification(error);
  }
});
```

## Configuration Files

### JSON Configuration File

`.testringrc`:
```json
{
  "tests": "./tests/**/*.spec.js",
  "plugins": [
    "@testring/plugin-selenium-driver",
    "@testring/plugin-babel"
  ],
  "workerLimit": 2,
  "retryCount": 3,
  "retryDelay": 2000,
  "logLevel": "info",
  "bail": false,
  "timeout": 30000,
  "browserOptions": {
    "headless": true,
    "width": 1920,
    "height": 1080
  }
}
```

### JavaScript Configuration File

`.testringrc.js`:
```javascript
module.exports = {
  tests: './tests/**/*.spec.js',
  plugins: [
    '@testring/plugin-selenium-driver'
  ],
  workerLimit: process.env.CI ? 1 : 2,
  retryCount: process.env.CI ? 1 : 3,
  logLevel: process.env.DEBUG ? 'debug' : 'info',
  
  // Dynamic configuration
  browserOptions: {
    headless: !process.env.SHOW_BROWSER,
    width: parseInt(process.env.BROWSER_WIDTH) || 1920,
    height: parseInt(process.env.BROWSER_HEIGHT) || 1080
  }
};
```

### Asynchronous Configuration File

```javascript
module.exports = async () => {
  const config = await loadConfigFromAPI();
  
  return {
    tests: './tests/**/*.spec.js',
    plugins: config.plugins,
    workerLimit: config.workerLimit,
    
    // Get configuration from external service
    browserOptions: await getBrowserConfig()
  };
};
```

### Environment-Specific Configuration

Main configuration file `config.json`:
```json
{
  "tests": "./tests/**/*.spec.js",
  "plugins": ["@testring/plugin-selenium-driver"],
  "logLevel": "info"
}
```

Development environment config `env/dev.json`:
```json
{
  "workerLimit": 1,
  "logLevel": "debug",
  "browserOptions": {
    "headless": false
  }
}
```

Production environment config `env/prod.json`:
```json
{
  "workerLimit": 4,
  "retryCount": 1,
  "browserOptions": {
    "headless": true
  }
}
```

Using environment configuration:
```bash
# Development environment
testring run --config config.json --envConfig env/dev.json

# Production environment
testring run --config config.json --envConfig env/prod.json
```

## Plugin System

### Using Existing Plugins

```bash
# Install Selenium driver plugin
npm install @testring/plugin-selenium-driver

# Use in configuration
testring run --plugins @testring/plugin-selenium-driver
```

### Custom Plugins

Create custom plugin `my-plugin.js`:
```javascript
module.exports = (pluginAPI) => {
  const logger = pluginAPI.getLogger();
  
  // Execute before test starts
  pluginAPI.beforeRun(() => {
    logger.info('Custom plugin: Test starting');
  });
  
  // Execute after test completion
  pluginAPI.afterRun(() => {
    logger.info('Custom plugin: Test completed');
  });
};
```

Using custom plugin:
```json
{
  "plugins": ["./my-plugin.js"]
}
```

## Real-World Application Scenarios

### CI/CD Integration

```yaml
# GitHub Actions example
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npx testring run --workerLimit 2 --retryCount 1
```

### Docker Environment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Run tests
CMD ["npx", "testring", "run", "--workerLimit", "1"]
```

### Multi-Environment Testing

```javascript
// test-runner.js
import { run } from 'testring';

const environments = ['dev', 'staging', 'prod'];

for (const env of environments) {
  console.log(`Running ${env} environment tests`);
  
  await run({
    tests: './tests/**/*.spec.js',
    envConfig: `./env/${env}.json`,
    workerLimit: env === 'prod' ? 4 : 2
  });
}
```

### Distributed Testing

```javascript
// Master node
import { run } from 'testring';

await run({
  tests: './tests/**/*.spec.js',
  workerLimit: 8,
  
  // Distributed configuration
  cluster: {
    nodes: ['node1:3000', 'node2:3000', 'node3:3000'],
    master: true
  }
});
```

## Performance Optimization

### Concurrency Control

```typescript
// Adjust concurrency based on CPU cores
import os from 'os';

const workerLimit = Math.min(os.cpus().length, 4);

await run({
  tests: './tests/**/*.spec.js',
  workerLimit
});
```

### Memory Management

```typescript
await run({
  tests: './tests/**/*.spec.js',
  
  // Limit memory usage
  memoryLimit: '2GB',
  
  // Garbage collection configuration
  gcOptions: {
    maxOldSpaceSize: 4096,
    maxSemiSpaceSize: 256
  }
});
```

### Cache Optimization

```typescript
await run({
  tests: './tests/**/*.spec.js',
  
  // Enable file caching
  cache: {
    enabled: true,
    directory: './.test-cache',
    maxAge: 3600000 // 1 hour
  }
});
```

## Error Handling

### Common Errors

#### Configuration File Error
```bash
Error: Configuration file not found: .testringrc
```
Solution: Create configuration file or use `--config` parameter to specify configuration file path.

#### Test Files Not Found
```bash
Error: No test files found matching pattern: ./tests/**/*.spec.js
```
Solution: Check if test file path is correct, confirm files exist.

#### Plugin Loading Failure
```bash
Error: Plugin not found: @testring/plugin-selenium-driver
```
Solution: Install missing plugin package.

### Error Recovery

```typescript
import { run } from 'testring';

async function runWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await run({
        tests: './tests/**/*.spec.js',
        workerLimit: 2
      });
      
      console.log('Test run successful');
      return;
    } catch (error) {
      console.error(`Test run failed (attempt ${i + 1}/${maxRetries}):`, error);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
```

### Debug Mode

```bash
# Enable detailed logging
testring run --logLevel debug

# Single process run (for debugging)
testring run --workerLimit 1

# Keep browser window open
testring run --browserOptions.headless=false
```

## Monitoring and Reporting

### Test Reports

```typescript
await run({
  tests: './tests/**/*.spec.js',
  
  // Generate reports
  reporters: [
    'console',
    'html',
    'junit',
    'allure'
  ],
  
  // Report configuration
  reporterOptions: {
    html: {
      outputDir: './reports/html'
    },
    junit: {
      outputFile: './reports/junit.xml'
    }
  }
});
```

### Performance Monitoring

```typescript
await run({
  tests: './tests/**/*.spec.js',
  
  // Performance monitoring
  monitoring: {
    enabled: true,
    
    // Collect performance metrics
    metrics: ['memory', 'cpu', 'duration'],
    
    // Report thresholds
    thresholds: {
      memory: '1GB',
      duration: 300000 // 5 minutes
    }
  }
});
```

## Best Practices

### 1. Project Structure
```
project/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── config/
│   ├── base.json
│   ├── dev.json
│   └── prod.json
├── .testringrc
└── package.json
```

### 2. Configuration Management
- Use environment-specific configuration files
- Store sensitive information in environment variables
- Use configuration validation to ensure correctness

### 3. Performance Optimization
- Adjust concurrency based on hardware resources
- Use appropriate retry strategies
- Enable caching mechanisms

### 4. Error Handling
- Implement comprehensive error capture mechanisms
- Provide detailed error information
- Use appropriate exit codes

### 5. Maintainability
- Use meaningful test file naming
- Keep configuration files concise
- Regularly update plugins and dependencies

## Troubleshooting

### Performance Issues
- Check memory usage
- Adjust concurrent process count
- Optimize test file size

### Compatibility Issues
- Confirm Node.js version compatibility
- Check plugin version compatibility
- Verify browser driver versions

### Network Issues
- Configure proxy settings
- Adjust timeout values
- Use retry mechanisms

## Dependencies

### Core Dependencies
- `@testring/api` - Test API controller
- `@testring/cli` - Command line interface

### Optional Plugins
- `@testring/plugin-selenium-driver` - Selenium WebDriver support
- `@testring/plugin-playwright-driver` - Playwright support
- `@testring/plugin-babel` - Babel transpilation support

## Installation

```bash
npm install testring
```

## License

MIT License

