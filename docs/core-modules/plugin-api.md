# @testring/plugin-api

Plugin API interface module that provides unified plugin development interfaces and plugin management functionality for the testring framework.

## Feature Overview

This module is the core of the testring plugin system, providing:
- Unified plugin API interfaces
- Plugin lifecycle management
- Communication bridges between modules
- Plugin initialization and configuration functionality

## Main Components

### PluginAPI
Main plugin API class that provides plugins with unified interfaces to access various framework modules:

```typescript
export class PluginAPI {
  constructor(pluginName: string, modules: IPluginModules)
  
  // Core module access interfaces
  getLogger(): LoggerAPI
  getFSReader(): FSReaderAPI | null
  getTestWorker(): TestWorkerAPI
  getTestRunController(): TestRunControllerAPI
  getBrowserProxy(): BrowserProxyAPI
  getHttpServer(): HttpServerAPI
  getHttpClient(): IHttpClient
  getFSStoreServer(): FSStoreServerAPI
}
```

### applyPlugins
Plugin application function responsible for initializing and applying plugins:

```typescript
const applyPlugins = (
  pluginsDestinations: IPluginModules,
  config: IConfig
): void
```

## Installation

```bash
npm install --save-dev @testring/plugin-api
```

Or using yarn:

```bash
yarn add @testring/plugin-api --dev
```

## Plugin Development

### Basic Plugin Structure
```typescript
// my-plugin.ts
export default (pluginAPI: PluginAPI) => {
  const logger = pluginAPI.getLogger();
  const testWorker = pluginAPI.getTestWorker();
  
  // Execute before test run
  testWorker.beforeRun(async () => {
    await logger.info('Plugin: Test preparation starting');
  });
  
  // Execute after test run
  testWorker.afterRun(async () => {
    await logger.info('Plugin: Test execution completed');
  });
};
```

### Plugin Configuration
```json
{
  "plugins": [
    "./plugins/my-plugin",
    "@my-org/testring-plugin-custom"
  ]
}
```

## Module API Details

### Logger API
For logging and output:

```typescript
const logger = pluginAPI.getLogger();

// Basic logging
await logger.verbose('Detailed information');
await logger.debug('Debug information');
await logger.info('General information');
await logger.warn('Warning information');
await logger.error('Error information');
```

### FS Reader API
For file system operations:

```typescript
const fsReader = pluginAPI.getFSReader();

if (fsReader) {
  // Pre-file resolution processing
  fsReader.beforeResolve(async (files) => {
    // Filter or modify file list
    return files.filter(file => !file.path.includes('temp'));
  });
  
  // Post-file resolution processing
  fsReader.afterResolve(async (files) => {
    // Add additional file information
    return files.map(file => ({
      ...file,
      processed: true
    }));
  });
}
```

### Test Worker API
For test worker process management:

```typescript
const testWorker = pluginAPI.getTestWorker();

// Test execution lifecycle hooks
testWorker.beforeRun(async () => {
  console.log('Preparing to execute tests');
});

testWorker.afterRun(async () => {
  console.log('Test execution completed');
});

testWorker.beforeTest(async (testPath) => {
  console.log(`Starting test execution: ${testPath}`);
});

testWorker.afterTest(async (testPath) => {
  console.log(`Test execution completed: ${testPath}`);
});
```

### Test Run Controller API
For test run control:

```typescript
const controller = pluginAPI.getTestRunController();

// Pre-run preparation
controller.beforeRun(async (files) => {
  console.log(`Preparing to run ${files.length} test files`);
});

// Pre-single test processing
controller.beforeTest(async (test) => {
  console.log(`Starting test: ${test.path}`);
});

// Test retry processing
controller.beforeTestRetry(async (test, attempt) => {
  console.log(`Retrying test: ${test.path}, attempt ${attempt}`);
});

// Control whether tests should execute
controller.shouldNotExecute(async (files) => {
  // Return true to skip all tests
  return process.env.SKIP_TESTS === 'true';
});

controller.shouldNotStart(async (test) => {
  // Return true to skip specific test
  return test.path.includes('.skip.');
});

controller.shouldNotRetry(async (test, error, attempt) => {
  // Return true to not retry failed tests
  return attempt >= 3;
});
```

### Browser Proxy API
For browser proxy control:

```typescript
const browserProxy = pluginAPI.getBrowserProxy();

// Pre-browser start processing
browserProxy.beforeStart(async () => {
  console.log('Preparing to start browser');
});

// Post-browser stop processing
browserProxy.afterStop(async () => {
  console.log('Browser has stopped');
});
```

### HTTP Server API
For HTTP server management:

```typescript
const httpServer = pluginAPI.getHttpServer();

// Pre-server start processing
httpServer.beforeStart(async () => {
  console.log('Preparing to start HTTP server');
});

// Post-server stop processing
httpServer.afterStop(async () => {
  console.log('HTTP server has stopped');
});
```

### HTTP Client
For HTTP requests:

```typescript
const httpClient = pluginAPI.getHttpClient();

// Send HTTP requests
const response = await httpClient.get('/api/status');
const data = await httpClient.post('/api/data', { key: 'value' });
```

### FS Store Server API
For file storage service:

```typescript
const fsStore = pluginAPI.getFSStoreServer();

// File creation processing
fsStore.onFileCreated(async (file) => {
  console.log(`File created: ${file.path}`);
});

// File release processing
fsStore.onFileReleased(async (file) => {
  console.log(`File released: ${file.path}`);
});
```

## Real Plugin Examples

### Test Reporter Plugin
```typescript
// plugins/test-reporter.ts
export default (pluginAPI) => {
  const logger = pluginAPI.getLogger();
  const controller = pluginAPI.getTestRunController();
  
  let startTime: number;
  let testResults: Array<any> = [];
  
  // Test start
  controller.beforeRun(async (files) => {
    startTime = Date.now();
    testResults = [];
    await logger.info(`Starting execution of ${files.length} test files`);
  });
  
  // Single test completion
  controller.afterTest(async (test, result) => {
    testResults.push({
      path: test.path,
      success: !result.error,
      duration: result.duration,
      error: result.error
    });
  });
  
  // All tests completed
  controller.afterRun(async () => {
    const duration = Date.now() - startTime;
    const passed = testResults.filter(r => r.success).length;
    const failed = testResults.length - passed;
    
    await logger.info(`Test Report:`);
    await logger.info(`  Total: ${testResults.length}`);
    await logger.info(`  Passed: ${passed}`);
    await logger.info(`  Failed: ${failed}`);
    await logger.info(`  Duration: ${duration}ms`);
  });
};
```

### Screenshot Plugin
```typescript
// plugins/screenshot.ts
export default (pluginAPI) => {
  const browserProxy = pluginAPI.getBrowserProxy();
  const fsStore = pluginAPI.getFSStoreServer();
  const logger = pluginAPI.getLogger();
  
  // Auto-screenshot on test failure
  browserProxy.onTestFailure(async (test, error) => {
    try {
      const screenshot = await browserProxy.takeScreenshot();
      const file = await fsStore.createFile({
        content: screenshot,
        ext: 'png',
        name: `failure-${test.name}-${Date.now()}`
      });
      
      await logger.info(`Test failure screenshot saved: ${file.path}`);
    } catch (screenshotError) {
      await logger.error('Screenshot save failed:', screenshotError);
    }
  });
};
```

### Environment Setup Plugin
```typescript
// plugins/env-setup.ts
export default (pluginAPI) => {
  const testWorker = pluginAPI.getTestWorker();
  const httpClient = pluginAPI.getHttpClient();
  const logger = pluginAPI.getLogger();
  
  // Prepare environment before tests
  testWorker.beforeRun(async () => {
    await logger.info('Preparing test environment...');
    
    // Clean test data
    await httpClient.delete('/api/test-data');
    
    // Initialize test data
    await httpClient.post('/api/test-data/init', {
      users: ['testuser1', 'testuser2'],
      settings: { debug: true }
    });
    
    await logger.info('Test environment preparation completed');
  });
  
  // Clean environment after tests
  testWorker.afterRun(async () => {
    await logger.info('Cleaning test environment...');
    await httpClient.delete('/api/test-data');
    await logger.info('Test environment cleanup completed');
  });
};
```

## Plugin Management

### Plugin Configuration
```javascript
// .testringrc
module.exports = {
  plugins: [
    // Local plugins
    './plugins/test-reporter',
    './plugins/screenshot',
    
    // NPM package plugins
    '@testring/plugin-selenium-driver',
    '@mycompany/testring-plugin-custom',
    
    // Plugin with configuration
    {
      name: './plugins/env-setup',
      config: {
        apiUrl: 'http://localhost:3000',
        timeout: 5000
      }
    }
  ]
};
```

### Plugin Loading Order
Plugins are loaded and initialized in the order specified in the configuration. Hook function execution order follows:
- `before*` hooks: Execute in plugin loading order
- `after*` hooks: Execute in reverse plugin loading order

## Best Practices

### Plugin Naming Conventions
- Use descriptive plugin names
- Follow `testring-plugin-*` naming convention
- Use meaningful log prefixes within plugins

### Error Handling
```typescript
export default (pluginAPI) => {
  const logger = pluginAPI.getLogger();
  
  // Always handle errors in async operations
  controller.beforeTest(async (test) => {
    try {
      await setupTest(test);
    } catch (error) {
      await logger.error(`Plugin error: ${error.message}`);
      throw error; // Re-throw to stop test
    }
  });
};
```

### Resource Cleanup
```typescript
export default (pluginAPI) => {
  let resources: any[] = [];
  
  // Create resources
  controller.beforeRun(async () => {
    resources = await createResources();
  });
  
  // Ensure resources are cleaned up
  controller.afterRun(async () => {
    try {
      await cleanupResources(resources);
    } catch (error) {
      // Log cleanup failure but don't affect test results
      await logger.warn(`Resource cleanup failed: ${error.message}`);
    }
  });
};
```

## Type Definitions

Main types used in plugin development:

```typescript
interface IPluginModules {
  logger: ILogger;
  fsReader?: IFSReader;
  testWorker: ITestWorker;
  testRunController: ITestRunController;
  browserProxy: IBrowserProxy;
  httpServer: IHttpServer;
  httpClientInstance: IHttpClient;
  fsStoreServer: IFSStoreServer;
}

type PluginFunction = (api: PluginAPI) => void | Promise<void>;
```

## Installation

```bash
npm install @testring/plugin-api
```

## Dependencies

- `@testring/logger` - Logging functionality
- `@testring/pluggable-module` - Plugin system foundation
- `@testring/types` - Type definitions

## Related Modules

- `@testring/plugins` - Plugin collection
- `@testring/cli-config` - Configuration management
- `@testring/transport` - Inter-process communication

## License

MIT License