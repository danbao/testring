# @testring/pluggable-module

Pluggable module system that provides powerful plugin mechanisms for the testring framework. Through the Hook system, external plugins can inject custom logic at key points of core functionality, enabling flexible framework extension.

[![npm version](https://badge.fury.io/js/@testring/pluggable-module.svg)](https://www.npmjs.com/package/@testring/pluggable-module)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Feature Overview

This module is the core foundation of the testring framework's plugin system, providing:
- Event-based plugin hook mechanisms
- Flexible lifecycle management
- Asynchronous plugin execution support
- Comprehensive error handling mechanisms
- Data modification and read-only hook support

## Key Features

### Event-Driven Architecture
- Hook-based event system
- Support for multiple plugins registering simultaneously
- Sequential plugin logic execution
- Asynchronous operation support

### Flexible Hook Types
- **Write Hook** - Hooks that can modify data
- **Read Hook** - Read-only monitoring hooks
- Support for chained data processing
- Complete error propagation

### Comprehensive Error Handling
- Plugin-level error isolation
- Detailed error information provision
- Error stack preservation
- Graceful failure handling

## Core Concepts

### Hook
Hook is the core concept of the plugin system, representing an event point where callback functions can be registered:

```typescript
// Write Hook - Can modify incoming data
hook.writeHook('myPlugin', (data) => {
  return modifiedData;
});

// Read Hook - Read-only data access
hook.readHook('myPlugin', (data) => {
  console.log('Processing data:', data);
});
```

### PluggableModule
PluggableModule is the base class for pluggable functionality, internally maintaining a set of named Hooks:

```typescript
class MyModule extends PluggableModule {
  constructor() {
    super(['beforeStart', 'afterStart', 'beforeEnd']);
  }

  async doSomething() {
    // Call hooks at key points
    await this.callHook('beforeStart');
    // Core logic...
    await this.callHook('afterStart');
  }
}
```

## Installation

```bash
npm install @testring/pluggable-module
```

## Basic Usage

### Creating Pluggable Modules

```typescript
import { PluggableModule } from '@testring/pluggable-module';

class FileProcessor extends PluggableModule {
  constructor() {
    // Define hook names
    super([
      'beforeRead',
      'afterRead', 
      'beforeWrite',
      'afterWrite'
    ]);
  }

  async readFile(filePath: string) {
    // Pre-read hook
    const processedPath = await this.callHook('beforeRead', filePath);
    
    // Core logic: read file
    const content = await fs.readFile(processedPath, 'utf8');
    
    // Post-read hook
    const processedContent = await this.callHook('afterRead', content, filePath);
    
    return processedContent;
  }

  async writeFile(filePath: string, content: string) {
    // Pre-write hook
    const { path, data } = await this.callHook('beforeWrite', {
      path: filePath,
      content: content
    });
    
    // Core logic: write file
    await fs.writeFile(path, data);
    
    // Post-write hook
    await this.callHook('afterWrite', path, data);
  }
}
```

### Registering Plugins

```typescript
const fileProcessor = new FileProcessor();

// Get hooks and register plugins
const beforeReadHook = fileProcessor.getHook('beforeRead');
const afterReadHook = fileProcessor.getHook('afterRead');

// Path preprocessing plugin
beforeReadHook?.writeHook('pathNormalizer', (filePath) => {
  return path.resolve(filePath);
});

// Content caching plugin
afterReadHook?.writeHook('contentCache', (content, filePath) => {
  cache.set(filePath, content);
  return content;
});

// Logging plugin
afterReadHook?.readHook('logger', (content, filePath) => {
  console.log(`File read: ${filePath}, size: ${content.length}`);
});
```

## Hook Types Explained

### Write Hook
Write Hook can modify passed data and supports chained processing:

```typescript
import { Hook } from '@testring/pluggable-module';

const hook = new Hook();

// Register multiple Write Hooks
hook.writeHook('plugin1', (data) => {
  return { ...data, processed: true };
});

hook.writeHook('plugin2', (data) => {
  return { ...data, timestamp: Date.now() };
});

hook.writeHook('plugin3', (data) => {
  return { ...data, id: generateId() };
});

// Call hooks - data will be processed by each plugin in sequence
const result = await hook.callHooks({ message: 'hello' });
// Result: { message: 'hello', processed: true, timestamp: 1234567890, id: 'abc123' }
```

### Read Hook
Read Hook can only read data, cannot modify, suitable for monitoring and logging:

```typescript
const hook = new Hook();

// Register read hooks
hook.readHook('monitor', (data) => {
  metrics.increment('data.processed');
  console.log('Processing data:', data);
});

hook.readHook('validator', (data) => {
  if (!data.isValid) {
    throw new Error('Data validation failed');
  }
});

hook.readHook('notifier', (data) => {
  if (data.priority === 'high') {
    sendNotification(data);
  }
});

// Call hooks
await hook.callHooks(inputData);
```

### Mixed Usage
Write Hook and Read Hook can be used together:

```typescript
const hook = new Hook();

// Execute all Write Hooks first (modify data)
hook.writeHook('transformer', (data) => transformData(data));
hook.writeHook('validator', (data) => validateAndFix(data));

// Then execute all Read Hooks (read-only access)
hook.readHook('logger', (data) => logData(data));
hook.readHook('metrics', (data) => recordMetrics(data));

// Execution order: writeHook1 -> writeHook2 -> readHook1 -> readHook2
const result = await hook.callHooks(originalData);
```

## Advanced Usage

### Complex Data Processing Pipeline

```typescript
class DataProcessor extends PluggableModule {
  constructor() {
    super([
      'beforeValidation',
      'afterValidation',
      'beforeTransform',
      'afterTransform',
      'beforeSave',
      'afterSave'
    ]);
  }

  async processData(rawData: any) {
    try {
      // Validation phase
      const validatedData = await this.callHook('beforeValidation', rawData);
      const validationResult = this.validate(validatedData);
      await this.callHook('afterValidation', validationResult);

      // Transformation phase
      const preTransformData = await this.callHook('beforeTransform', validationResult);
      const transformedData = this.transform(preTransformData);
      const postTransformData = await this.callHook('afterTransform', transformedData);

      // Save phase
      const preSaveData = await this.callHook('beforeSave', postTransformData);
      const savedData = await this.save(preSaveData);
      await this.callHook('afterSave', savedData);

      return savedData;
    } catch (error) {
      console.error('Data processing failed:', error);
      throw error;
    }
  }

  private validate(data: any) {
    // Validation logic
    return data;
  }

  private transform(data: any) {
    // Transformation logic
    return data;
  }

  private async save(data: any) {
    // Save logic
    return data;
  }
}
```

### Plugin Management System

```typescript
class PluginManager {
  private modules: Map<string, PluggableModule> = new Map();
  private plugins: Map<string, any> = new Map();

  registerModule(name: string, module: PluggableModule) {
    this.modules.set(name, module);
  }

  registerPlugin(name: string, plugin: any) {
    this.plugins.set(name, plugin);
    this.applyPlugin(name, plugin);
  }

  private applyPlugin(name: string, plugin: any) {
    for (const [moduleName, module] of this.modules) {
      if (plugin[moduleName]) {
        const moduleConfig = plugin[moduleName];
        
        Object.keys(moduleConfig).forEach(hookName => {
          const hook = module.getHook(hookName);
          if (hook) {
            const handlers = moduleConfig[hookName];
            
            if (handlers.write) {
              hook.writeHook(name, handlers.write);
            }
            
            if (handlers.read) {
              hook.readHook(name, handlers.read);
            }
          }
        });
      }
    }
  }

  unregisterPlugin(name: string) {
    this.plugins.delete(name);
    // Reapply all plugins (actual implementation can remove more precisely)
    this.reapplyAllPlugins();
  }

  private reapplyAllPlugins() {
    // Clear all hooks
    for (const module of this.modules.values()) {
      // Actual implementation needs hook clearing methods
    }
    
    // Reapply all plugins
    for (const [name, plugin] of this.plugins) {
      this.applyPlugin(name, plugin);
    }
  }
}
```

## Real-World Application Scenarios

### File System Extension

```typescript
class FileSystem extends PluggableModule {
  constructor() {
    super(['beforeRead', 'afterRead', 'beforeWrite', 'afterWrite']);
  }

  async readFile(path: string) {
    const processedPath = await this.callHook('beforeRead', path);
    const content = await fs.readFile(processedPath, 'utf8');
    return await this.callHook('afterRead', content, processedPath);
  }

  async writeFile(path: string, content: string) {
    const { finalPath, finalContent } = await this.callHook('beforeWrite', { path, content });
    await fs.writeFile(finalPath, finalContent);
    await this.callHook('afterWrite', finalPath, finalContent);
  }
}

// Plugin: File compression
const compressionPlugin = {
  afterRead: {
    write: (content) => decompress(content)
  },
  beforeWrite: {
    write: ({ path, content }) => ({
      path,
      content: compress(content)
    })
  }
};

// Plugin: File encryption
const encryptionPlugin = {
  afterRead: {
    write: (content) => decrypt(content)
  },
  beforeWrite: {
    write: ({ path, content }) => ({
      path,
      content: encrypt(content)
    })
  }
};

// Plugin: Access logging
const loggingPlugin = {
  afterRead: {
    read: (content, path) => console.log(`File read: ${path}`)
  },
  afterWrite: {
    read: (path, content) => console.log(`File written: ${path}`)
  }
};
```

### Test Execution Extension

```typescript
class TestRunner extends PluggableModule {
  constructor() {
    super([
      'beforeTest',
      'afterTest',
      'beforeSuite',
      'afterSuite',
      'onTestPass',
      'onTestFail'
    ]);
  }

  async runSuite(testSuite: TestSuite) {
    await this.callHook('beforeSuite', testSuite);
    
    for (const test of testSuite.tests) {
      await this.runTest(test);
    }
    
    await this.callHook('afterSuite', testSuite);
  }

  async runTest(test: Test) {
    const preparedTest = await this.callHook('beforeTest', test);
    
    try {
      const result = await this.executeTest(preparedTest);
      await this.callHook('onTestPass', result);
      await this.callHook('afterTest', result);
      return result;
    } catch (error) {
      await this.callHook('onTestFail', test, error);
      await this.callHook('afterTest', test, error);
      throw error;
    }
  }

  private async executeTest(test: Test) {
    // Test execution logic
    return { test, status: 'passed' };
  }
}

// Screenshot plugin
const screenshotPlugin = {
  onTestFail: {
    read: async (test, error) => {
      const screenshot = await takeScreenshot();
      await saveScreenshot(`${test.name}-failure.png`, screenshot);
    }
  }
};

// Performance monitoring plugin
const performancePlugin = {
  beforeTest: {
    write: (test) => {
      test.startTime = Date.now();
      return test;
    }
  },
  afterTest: {
    read: (result) => {
      const duration = Date.now() - result.test.startTime;
      console.log(`Test ${result.test.name} duration: ${duration}ms`);
    }
  }
};

// Report generation plugin
const reportPlugin = {
  afterSuite: {
    read: (testSuite) => {
      generateHtmlReport(testSuite.results);
      generateJunitReport(testSuite.results);
    }
  }
};
```

## Error Handling

### Plugin Error Isolation

```typescript
class RobustModule extends PluggableModule {
  constructor() {
    super(['process']);
  }

  async processWithErrorHandling(data: any) {
    try {
      return await this.callHook('process', data);
    } catch (error) {
      console.error('Plugin execution failed:', error);
      
      // Provide fallback behavior
      return this.fallbackProcess(data);
    }
  }

  private fallbackProcess(data: any) {
    // Fallback processing logic
    return { ...data, processed: false, error: true };
  }
}
```

### Error Recovery Strategies

```typescript
class ErrorRecoveryModule extends PluggableModule {
  constructor() {
    super(['process']);
  }

  async processWithRecovery(data: any) {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.callHook('process', data);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // All attempts failed
    throw new Error(`All processing attempts failed. Last error: ${lastError?.message}`);
  }
}
```

## Performance Optimization

### Hook Execution Optimization

```typescript
class OptimizedModule extends PluggableModule {
  private hookCache = new Map<string, any>();

  constructor() {
    super(['process']);
  }

  async processWithCache(data: any) {
    const cacheKey = this.generateCacheKey(data);
    
    if (this.hookCache.has(cacheKey)) {
      return this.hookCache.get(cacheKey);
    }

    const result = await this.callHook('process', data);
    this.hookCache.set(cacheKey, result);
    
    return result;
  }

  private generateCacheKey(data: any): string {
    return JSON.stringify(data);
  }
}
```

### Batch Processing

```typescript
class BatchProcessor extends PluggableModule {
  constructor() {
    super(['process']);
  }

  async processBatch(items: any[]) {
    const results = [];
    
    // Process items in batches
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => this.callHook('process', item))
      );
      results.push(...batchResults);
    }
    
    return results;
  }
}
```

## Best Practices

### 1. Hook Design
- Use descriptive hook names that clearly indicate their purpose
- Separate read and write operations appropriately
- Design hooks to be composable and reusable

### 2. Plugin Development
- Keep plugins focused on single responsibilities
- Implement proper error handling within plugins
- Document plugin interfaces and expected behaviors

### 3. Performance Considerations
- Minimize synchronous operations in hooks
- Use caching for expensive operations
- Implement batch processing for large datasets

### 4. Error Handling
- Implement comprehensive error isolation
- Provide meaningful error messages
- Include fallback mechanisms for critical operations

### 5. Testing
- Test plugins in isolation
- Mock dependencies appropriately
- Verify hook execution order and data flow

## Troubleshooting

### Common Issues

#### Hook Not Executing
```typescript
// Check if hook is properly registered
const hook = module.getHook('myHook');
if (!hook) {
  console.error('Hook "myHook" not found');
}
```

#### Plugin Order Issues
```typescript
// Ensure plugins are registered in correct order
hook.writeHook('plugin1', handler1);
hook.writeHook('plugin2', handler2);
// Execution order: plugin1 -> plugin2
```

#### Memory Leaks
```typescript
// Clean up plugin references when no longer needed
module.removeHook('myHook');
// or
pluginManager.unregisterPlugin('myPlugin');
```

## Dependencies

- `@testring/logger` - Logging functionality
- `@testring/types` - Type definitions
- `@testring/utils` - Utility functions

## Related Modules

- `@testring/plugin-api` - Plugin API management
- `@testring/transport` - Inter-process communication
- `@testring/cli-config` - Configuration management

## License

MIT License
