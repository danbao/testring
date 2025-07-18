# @testring/devtool-backend

Developer tools backend service module that serves as the core debugging and development tool for the testring framework, providing comprehensive test debugging, recording, playback, and real-time monitoring capabilities. This module integrates a web server, WebSocket communication, message proxy, and frontend interface to provide a complete solution for test development and debugging.

[![npm version](https://badge.fury.io/js/@testring/devtool-backend.svg)](https://www.npmjs.com/package/@testring/devtool-backend)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Overview

The developer tools backend service module is the debugging center of the testring framework, providing:

- **Complete test debugging and recording server** for test development
- **Express-based web service and routing system** for HTTP endpoints
- **WebSocket real-time communication and message proxy** for bidirectional data flow
- **Frontend interface integration and static resource serving** for UI components
- **Test process lifecycle management** for controlling test execution
- **Multi-process coordination and message relay** for distributed testing
- **Extensible plugin system and hook mechanisms** for customization
- **Real-time monitoring of test execution state** for observability

## Key Features

### 🖥️ Server Management
- Automated child process creation and management
- Inter-process message passing and synchronization
- Integrated logging system and error handling
- Graceful server startup and shutdown management

### 📡 Communication System
- Unified message transport layer interface
- Real-time bidirectional message proxy mechanism
- Multi-channel message broadcasting and directed sending
- Comprehensive error handling and reconnection mechanisms

### 🎨 Interface Integration
- Built-in frontend interface and routing system
- Multiple interface modes (editor, popup, homepage)
- Static resource serving and cache management
- Responsive design and cross-platform compatibility

### 🧩 Extensibility
- Complete plugin system and lifecycle hooks
- Flexible configuration system and customizable options
- Multi-module integration and coordination capabilities
- Backward-compatible API design

## Installation

```bash
# Using npm
npm install @testring/devtool-backend

# Using yarn
yarn add @testring/devtool-backend

# Using pnpm
pnpm add @testring/devtool-backend
```

## Core Architecture

### DevtoolServerController Class

The main developer tools service controller, extending `PluggableModule`:

```typescript
class DevtoolServerController extends PluggableModule implements IDevtoolServerController {
  constructor(transport: ITransport)

  // Server Management
  public async init(): Promise<void>
  public async kill(): Promise<void>

  // Configuration Management
  public getRuntimeConfiguration(): IDevtoolRuntimeConfiguration

  // Lifecycle Hooks
  private callHook<T>(hook: DevtoolPluginHooks, data?: T): Promise<T>
}
```

### Configuration Types

```typescript
interface IDevtoolServerConfig {
  host: string;                 // Server host address
  httpPort: number;             // HTTP service port
  wsPort: number;               // WebSocket service port
  router: RouterConfig[];       // Route configuration
  staticRoutes: StaticRoutes;   // Static route configuration
}

interface IDevtoolRuntimeConfiguration {
  extensionId: string;  // Browser extension ID
  httpPort: number;     // HTTP service port
  wsPort: number;       // WebSocket service port
  host: string;         // Server host address
}

interface RouterConfig {
  method: 'get' | 'post' | 'put' | 'delete'; // HTTP method
  mask: string;         // Route pattern
  handler: string;      // Handler path
}
```

### Plugin Hooks

```typescript
enum DevtoolPluginHooks {
  beforeStart = 'beforeStart',      // Before server starts
  afterStart = 'afterStart',        // After server starts
  beforeStop = 'beforeStop',        // Before server stops
  afterStop = 'afterStop'           // After server stops
}
```

## Basic Usage

### Creating a Developer Tools Server

```typescript
import { DevtoolServerController } from '@testring/devtool-backend';
import { transport } from '@testring/transport';

// Create developer tools server
const devtoolServer = new DevtoolServerController(transport);

// Initialize and start the server
try {
  await devtoolServer.init();
  console.log('Developer tools server started successfully');

  // Get runtime configuration
  const runtimeConfig = devtoolServer.getRuntimeConfiguration();
  console.log('Runtime configuration:', runtimeConfig);

  // Developer tools available at the following addresses
  console.log(`Developer Tools UI: http://${runtimeConfig.host}:${runtimeConfig.httpPort}`);
  console.log(`WebSocket Endpoint: ws://${runtimeConfig.host}:${runtimeConfig.wsPort}`);

} catch (error) {
  console.error('Failed to start developer tools server:', error);
}

// Shutdown server when appropriate
process.on('SIGINT', async () => {
  console.log('Shutting down developer tools server...');
  await devtoolServer.kill();
  console.log('Developer tools server has been shut down');
  process.exit(0);
});
```

### Integration with Test Processes

```typescript
import { DevtoolServerController } from '@testring/devtool-backend';
import { transport } from '@testring/transport';
import { TestRunner } from '@testring/test-runner';

class TestEnvironment {
  private devtoolServer: DevtoolServerController;
  private testRunner: TestRunner;
  
  constructor() {
    this.devtoolServer = new DevtoolServerController(transport);
    this.testRunner = new TestRunner(/* Test runner configuration */);
  }
  
  async setupDevelopmentEnvironment() {
    console.log('Setting up development environment...');
    
    // Start devtools server
    await this.devtoolServer.init();
    
    const config = this.devtoolServer.getRuntimeConfiguration();
    console.log(`Devtools started: http://${config.host}:${config.httpPort}`);
    
    // Configure test runner to use devtools
    this.testRunner.configure({
      devtool: {
        extensionId: config.extensionId,
        httpPort: config.httpPort,
        wsPort: config.wsPort,
        host: config.host
      }
    });
    
    console.log('Development environment setup complete');
  }
  
  async runTestsWithDebugging() {
    try {
      await this.setupDevelopmentEnvironment();
      
      console.log('Running tests (debug mode enabled)...');
      const results = await this.testRunner.run();
      
      console.log('Test results:', results);
      return results;
      
    } catch (error) {
      console.error('Test execution failed:', error);
      throw error;
    }
  }
  
  async teardown() {
    console.log('Cleaning up development environment...');
    
    if (this.devtoolServer) {
      await this.devtoolServer.kill();
    }
    
    console.log('Development environment cleaned up');
  }
}

// Usage example
const testEnv = new TestEnvironment();

// Run tests with debugging
testEnv.runTestsWithDebugging()
  .then(results => {
    console.log('Tests completed:', results);
  })
  .catch(error => {
    console.error('Tests failed:', error);
  })
  .finally(() => {
    return testEnv.teardown();
  });
```

## Plugin System and Extensions

### Custom Plugin Development

```typescript
import {
  DevtoolServerController,
  DevtoolPluginHooks,
  IDevtoolServerConfig
} from '@testring/devtool-backend';

class CustomDevtoolPlugin {
  private name = 'CustomDevtoolPlugin';
  
  // Configuration modification before server start
  async beforeStart(config: IDevtoolServerConfig): Promise<IDevtoolServerConfig> {
    console.log(`[${this.name}] Server configuration before start:`, config);
    
    // Modify default configuration
    return {
      ...config,
      host: process.env.DEVTOOL_HOST || config.host,
      httpPort: parseInt(process.env.DEVTOOL_HTTP_PORT || config.httpPort.toString()),
      wsPort: parseInt(process.env.DEVTOOL_WS_PORT || config.wsPort.toString()),
      router: [
        ...config.router,
        // Add custom routes
        {
          method: 'get',
          mask: '/api/custom',
          handler: this.getCustomApiHandler()
        }
      ]
    };
  }
  
  // Initialization after server start
  async afterStart(): Promise<void> {
    console.log(`[${this.name}] Server start complete, executing custom initialization...`);
    
    // Execute custom initialization logic
    await this.initializeCustomFeatures();
  }
  
  // Cleanup before server stop
  async beforeStop(): Promise<void> {
    console.log(`[${this.name}] Before server stop, executing cleanup...`);
    
    // Execute cleanup logic
    await this.cleanup();
  }
  
  // Finalization after server stop
  async afterStop(): Promise<void> {
    console.log(`[${this.name}] Server stopped, executing final cleanup...`);
    
    // Execute final cleanup logic
    await this.finalCleanup();
  }
  
  private getCustomApiHandler(): string {
    // Return custom API handler path
    return require.resolve('./custom-api-handler');
  }
  
  private async initializeCustomFeatures(): Promise<void> {
    // Initialize custom features
    console.log('Initializing custom features...');
    
    // Example: Set up scheduled tasks
    setInterval(() => {
      console.log('Custom scheduled task executing...');
    }, 10000);
  }
  
  private async cleanup(): Promise<void> {
    // Clean up resources
    console.log('Cleaning up custom resources...');
  }
  
  private async finalCleanup(): Promise<void> {
    // Final cleanup
    console.log('Final cleanup completed');
  }
}

// Use custom plugin
const customPlugin = new CustomDevtoolPlugin();
const devtoolServer = new DevtoolServerController(transport);

// Register plugin hooks
devtoolServer.registerPluginHook(DevtoolPluginHooks.beforeStart, customPlugin.beforeStart.bind(customPlugin));
devtoolServer.registerPluginHook(DevtoolPluginHooks.afterStart, customPlugin.afterStart.bind(customPlugin));
devtoolServer.registerPluginHook(DevtoolPluginHooks.beforeStop, customPlugin.beforeStop.bind(customPlugin));
devtoolServer.registerPluginHook(DevtoolPluginHooks.afterStop, customPlugin.afterStop.bind(customPlugin));

// Start server with plugins
await devtoolServer.init();
```

### Configuration Manager

```typescript
class DevtoolConfigManager {
  private defaultConfig: IDevtoolServerConfig;
  private runtimeConfig: IDevtoolServerConfig;
  
  constructor() {
    this.defaultConfig = this.loadDefaultConfig();
  }
  
  // Load default configuration
  private loadDefaultConfig(): IDevtoolServerConfig {
    return {
      host: 'localhost',
      httpPort: 3000,
      wsPort: 3001,
      router: [
        {
          method: 'get',
          mask: '/',
          handler: this.getRouterPath('index-page')
        },
        {
          method: 'get',
          mask: '/editor',
          handler: this.getRouterPath('editor-page')
        },
        {
          method: 'get',
          mask: '/api/health',
          handler: this.getRouterPath('health-check')
        }
      ],
      staticRoutes: {
        'assets': {
          rootPath: '/assets',
          directory: './public/assets'
        }
      }
    };
  }
  
  // Load configuration from environment variables
  loadFromEnvironment(): IDevtoolServerConfig {
    const config = { ...this.defaultConfig };
    
    if (process.env.DEVTOOL_HOST) {
      config.host = process.env.DEVTOOL_HOST;
    }
    
    if (process.env.DEVTOOL_HTTP_PORT) {
      config.httpPort = parseInt(process.env.DEVTOOL_HTTP_PORT);
    }
    
    if (process.env.DEVTOOL_WS_PORT) {
      config.wsPort = parseInt(process.env.DEVTOOL_WS_PORT);
    }
    
    return config;
  }
  
  // Load configuration from file
  loadFromFile(configPath: string): IDevtoolServerConfig {
    try {
      const fileConfig = require(configPath);
      return this.mergeConfigs(this.defaultConfig, fileConfig);
    } catch (error) {
      console.warn(`Unable to load configuration file ${configPath}:`, error.message);
      return this.defaultConfig;
    }
  }
  
  // Merge configurations
  private mergeConfigs(base: IDevtoolServerConfig, override: Partial<IDevtoolServerConfig>): IDevtoolServerConfig {
    return {
      ...base,
      ...override,
      router: [
        ...base.router,
        ...(override.router || [])
      ],
      staticRoutes: {
        ...base.staticRoutes,
        ...(override.staticRoutes || {})
      }
    };
  }
  
  // Validate configuration
  validateConfig(config: IDevtoolServerConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.host) {
      errors.push('Host address cannot be empty');
    }
    
    if (!config.httpPort || config.httpPort <= 0 || config.httpPort > 65535) {
      errors.push('HTTP port must be in range 1-65535');
    }
    
    if (!config.wsPort || config.wsPort <= 0 || config.wsPort > 65535) {
      errors.push('WebSocket port must be in range 1-65535');
    }
    
    if (config.httpPort === config.wsPort) {
      errors.push('HTTP port and WebSocket port cannot be the same');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  // Get router path
  private getRouterPath(filename: string): string {
    return require.resolve(`./routes/${filename}`);
  }
  
  // Get final configuration
  getConfig(): IDevtoolServerConfig {
    if (!this.runtimeConfig) {
      // Priority: File config > Environment variables > Default config
      let config = this.loadFromEnvironment();
      
      const configFile = process.env.DEVTOOL_CONFIG_FILE;
      if (configFile) {
        config = this.loadFromFile(configFile);
      }
      
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }
      
      this.runtimeConfig = config;
    }
    
    return this.runtimeConfig;
  }
}

// Use configuration manager
const configManager = new DevtoolConfigManager();

// Custom configuration loading plugin
class ConfigurableDevtoolPlugin {
  async beforeStart(config: IDevtoolServerConfig): Promise<IDevtoolServerConfig> {
    // Use configuration manager to load configuration
    const managedConfig = configManager.getConfig();
    
    console.log('Using managed configuration:', managedConfig);
    
    return managedConfig;
  }
}

// Integrate configuration manager
const configurablePlugin = new ConfigurableDevtoolPlugin();
const devtoolServer = new DevtoolServerController(transport);

devtoolServer.registerPluginHook(
  DevtoolPluginHooks.beforeStart,
  configurablePlugin.beforeStart.bind(configurablePlugin)
);

await devtoolServer.init();
```

## Message Proxy and Communication

### Message Proxy System

```typescript
class DevtoolMessageProxy {
  private transport: ITransport;
  private proxyHandlers: Map<string, Function> = new Map();
  
  constructor(transport: ITransport) {
    this.transport = transport;
    this.initializeProxyHandlers();
  }
  
  // Initialize proxy handlers
  private initializeProxyHandlers() {
    // Test process message proxy
    this.registerProxyHandler('test.register', this.proxyTestRegister.bind(this));
    this.registerProxyHandler('test.unregister', this.proxyTestUnregister.bind(this));
    this.registerProxyHandler('test.updateState', this.proxyTestUpdateState.bind(this));
    
    // Web application message proxy
    this.registerProxyHandler('webApp.register', this.proxyWebAppRegister.bind(this));
    this.registerProxyHandler('webApp.unregister', this.proxyWebAppUnregister.bind(this));
    this.registerProxyHandler('webApp.action', this.proxyWebAppAction.bind(this));
    
    // Custom message proxy
    this.registerProxyHandler('custom.debug', this.proxyCustomDebug.bind(this));
  }
  
  // Register proxy handler
  private registerProxyHandler(messageType: string, handler: Function) {
    this.proxyHandlers.set(messageType, handler);
    
    // Listen for messages and proxy
    this.transport.on(messageType, (messageData: any, processID?: string) => {
      this.proxyMessage(messageType, messageData, processID);
    });
  }
  
  // Proxy message
  private proxyMessage(messageType: string, messageData: any, processID?: string) {
    const handler = this.proxyHandlers.get(messageType);
    if (handler) {
      handler(messageData, processID);
    } else {
      console.warn(`Unknown message type: ${messageType}`);
    }
  }
  
  // Test registration proxy
  private proxyTestRegister(messageData: any, processID?: string) {
    console.log(`Test registration: ${processID}`, messageData);
    
    // Forward to devtool frontend
    this.sendToDevtoolFrontend({
      type: 'test.register',
      data: {
        processID,
        ...messageData
      }
    });
  }
  
  // Test state update proxy
  private proxyTestUpdateState(messageData: any, processID?: string) {
    console.log(`Test state update: ${processID}`, messageData);
    
    // Forward to devtool frontend
    this.sendToDevtoolFrontend({
      type: 'test.stateUpdate',
      data: {
        processID,
        ...messageData
      }
    });
  }
  
  // Web application registration proxy
  private proxyWebAppRegister(messageData: any, processID?: string) {
    console.log(`Web application registration: ${processID}`, messageData);
    
    // Forward to devtool frontend
    this.sendToDevtoolFrontend({
      type: 'webApp.register',
      data: {
        processID,
        ...messageData
      }
    });
  }
  
  // Web application action proxy
  private proxyWebAppAction(messageData: any, processID?: string) {
    console.log(`Web application action: ${processID}`, messageData);
    
    // Forward to devtool frontend
    this.sendToDevtoolFrontend({
      type: 'webApp.action',
      data: {
        processID,
        action: messageData.action,
        element: messageData.element,
        timestamp: Date.now()
      }
    });
  }
  
  // Custom debug proxy
  private proxyCustomDebug(messageData: any, processID?: string) {
    console.log(`Custom debug: ${processID}`, messageData);
    
    // Forward to devtool frontend
    this.sendToDevtoolFrontend({
      type: 'custom.debug',
      data: {
        processID,
        debugInfo: messageData,
        timestamp: Date.now()
      }
    });
  }
  
  // Cleanup proxy handler
  private proxyTestUnregister(messageData: any, processID?: string) {
    console.log(`Test cleanup: ${processID}`, messageData);
    
    // Forward to devtool frontend
    this.sendToDevtoolFrontend({
      type: 'test.unregister',
      data: {
        processID,
        ...messageData
      }
    });
  }
  
  // Send message to devtool frontend
  private sendToDevtoolFrontend(message: any) {
    // This will actually send to frontend via WebSocket
    this.transport.send('devtool-frontend', 'devtool.message', message);
  }
  
  // Send command to test process
  sendCommandToProcess(processID: string, command: string, data?: any) {
    this.transport.send(processID, command, data);
  }
  
  // Broadcast message to all processes
  broadcastMessage(messageType: string, messageData: any) {
    this.transport.broadcastLocal(messageType, messageData);
  }
}

// Use message proxy
const messageProxy = new DevtoolMessageProxy(transport);

// Send commands to specific processes
messageProxy.sendCommandToProcess('test-process-1', 'pause');
messageProxy.sendCommandToProcess('test-process-2', 'resume');
messageProxy.sendCommandToProcess('web-app-1', 'takeScreenshot');

// Broadcast messages
messageProxy.broadcastMessage('global.pause', { reason: 'User requested pause' });
messageProxy.broadcastMessage('global.resume', { reason: 'User requested resume' });
```

## Routing and Static Resources

### Custom Route Handlers

```typescript
// routes/custom-api-handler.ts
module.exports = (req, res) => {
  const { method, url, query, body } = req;
  
  console.log(`Custom API request: ${method} ${url}`);
  
  switch (method) {
    case 'GET':
      // Get test status
      if (url === '/api/test/status') {
        res.json({
          status: 'running',
          activeTests: 3,
          completedTests: 15,
          timestamp: new Date().toISOString()
        });
      }
      // Get system information
      else if (url === '/api/system/info') {
        res.json({
          version: '1.0.0',
          platform: process.platform,
          nodeVersion: process.version,
          memory: process.memoryUsage(),
          uptime: process.uptime()
        });
      }
      // Get test results
      else if (url.startsWith('/api/test/results/')) {
        const testId = url.split('/').pop();
        res.json({
          testId,
          results: {
            passed: 8,
            failed: 2,
            skipped: 1,
            details: [
              { name: 'login test', status: 'passed', duration: 1200 },
              { name: 'navigation test', status: 'failed', duration: 800 },
              { name: 'form test', status: 'passed', duration: 1500 }
            ]
          }
        });
      }
      else {
        res.status(404).json({ error: 'API path does not exist' });
      }
      break;
      
    case 'POST':
      // Control test execution
      if (url === '/api/test/control') {
        const { action, testId } = body;
        
        console.log(`Test control action: ${action} for ${testId}`);
        
        // Can integrate communication with test processes here
        // messageProxy.sendCommandToProcess(testId, action);
        
        res.json({
          success: true,
          message: `Action ${action} executed`,
          timestamp: new Date().toISOString()
        });
      }
      // Save test configuration
      else if (url === '/api/config/save') {
        const config = body;
        
        console.log('Saving test configuration:', config);
        
        // Can actually save configuration to file or database here
        
        res.json({
          success: true,
          message: 'Configuration saved successfully'
        });
      }
      else {
        res.status(404).json({ error: 'API path does not exist' });
      }
      break;
      
    default:
      res.status(405).json({ error: 'HTTP method not supported' });
  }
};

// routes/health-check.ts
module.exports = (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
};

// routes/index-page.ts
module.exports = (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Testring Developer Tools</title>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 2em; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 1em; background: #f0f0f0; border-radius: 5px; }
        .links { margin-top: 2em; }
        .links a { display: block; margin: 0.5em 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Testring Developer Tools</h1>
        <div class="status">
          <h2>Status Information</h2>
          <p><strong>Status:</strong> Running normally</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds</p>
        </div>
        <div class="links">
          <h2>Quick Links</h2>
          <a href="/editor">Test Editor</a>
          <a href="/popup">Popup Debugger</a>
          <a href="/api/system/info">System Info API</a>
          <a href="/api/test/status">Test Status API</a>
          <a href="/static">Static Resources</a>
        </div>
      </div>
    </body>
    </html>
  `);
};
```

## Best Practices

### 1. Server Management
- Use appropriate port configuration to avoid conflicts
- Implement graceful server shutdown and resource cleanup
- Monitor server status and performance metrics
- Implement health checks and automatic restart mechanisms

### 2. Message Handling
- Reasonably design message proxy and routing strategies
- Implement error handling and retry mechanisms for messages
- Use appropriate message serialization and deserialization
- Implement message throttling and debouncing

### 3. Security Considerations
- Implement appropriate authentication and authorization mechanisms
- Restrict debug tools to development environments only
- Avoid exposing sensitive system information and test data
- Implement request throttling and abuse prevention mechanisms

### 4. Performance Optimization
- Reasonably use caching and static resource compression
- Optimize message transmission performance and latency
- Implement appropriate connection pooling and resource management
- Monitor memory usage and prevent memory leaks

### 5. Development Experience
- Provide clear error messages and debugging information
- Implement real-time status feedback and progress display
- Provide rich logging and debugging information
- Implement user-friendly configuration and customization options

## Troubleshooting

### Common Issues

#### Server Startup Failure
```bash
Error: listen EADDRINUSE: address already in use
```
Solution: Check port usage, modify port numbers in configuration.

#### Child Process Communication Failure
```bash
Error: Worker process communication failed
```
Solution: Check transport layer configuration, child process status, message format.

#### Frontend Resource Loading Failure
```bash
Error: Cannot find module '@testring/devtool-frontend'
```
Solution: Check frontend module installation, static resource path configuration.

#### Message Proxy Error
```bash
Error: Message proxy handler not found
```
Solution: Check message type registration, handler configuration, transport layer status.

### Debugging Tips

```typescript
// Enable detailed debug logging
process.env.DEBUG = 'testring:devtool*';

// Check server status
const devtoolServer = new DevtoolServerController(transport);

// Debug configuration
console.log('Default configuration:', devtoolServer.getConfig());

// Debug runtime configuration
try {
  const runtimeConfig = devtoolServer.getRuntimeConfiguration();
  console.log('Runtime configuration:', runtimeConfig);
} catch (error) {
  console.error('Configuration not initialized:', error.message);
}

// Debug child process communication
transport.on('*', (messageType, messageData, sourceId) => {
  console.log(`Message [${messageType}] from [${sourceId}]:`, messageData);
});
```

## API Reference

### DevtoolServerController

#### Methods

- **`init(): Promise<void>`** - Initialize and start the developer tools server
- **`kill(): Promise<void>`** - Stop the server and cleanup resources
- **`getRuntimeConfiguration(): IDevtoolRuntimeConfiguration`** - Get current server configuration

#### Plugin Hooks

- **`beforeStart`** - Called before server initialization
- **`afterStart`** - Called after server starts successfully
- **`beforeStop`** - Called before server shutdown
- **`afterStop`** - Called after server stops

## Dependencies

- **`@testring/pluggable-module`** - Pluggable module system
- **`@testring/transport`** - Transport layer communication
- **`@testring/logger`** - Logging system
- **`@testring/devtool-frontend`** - Frontend interface
- **`@testring/devtool-extension`** - Browser extension
- **`express`** - Web server framework
- **`ws`** - WebSocket communication
- **`redux`** - State management

## Related Modules

- **`@testring/devtool-frontend`** - Developer tools frontend interface
- **`@testring/devtool-extension`** - Browser extension
- **`@testring/web-application`** - Web application testing
- **`@testring/test-run-controller`** - Test run controller

## License

MIT License - see the [LICENSE](https://github.com/ringcentral/testring/blob/master/LICENSE) file for details.
