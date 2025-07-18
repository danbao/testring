# @testring/test-utils

Test utilities module that serves as the testing assistance core for the testring framework, providing comprehensive test mock objects, file operation tools, and unit testing support capabilities. This module integrates transport layer mocking, test worker simulation, browser proxy mocking, and file system operation tools, delivering a complete solution for test development and test automation.

[![npm version](https://badge.fury.io/js/@testring/test-utils.svg)](https://www.npmjs.com/package/@testring/test-utils)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Overview

The test utilities module is the testing assistance core of the testring framework, providing:

- **Complete transport layer mocking** with message communication simulation
- **Intelligent test worker simulation** with lifecycle management
- **Comprehensive browser proxy controller mocking** for browser automation testing
- **Efficient file system operations** and path resolution tools
- **Plugin compatibility testing tools (PluginCompatibilityTester)** for browser driver validation
- **Complete unit test suite and integration tests** with comprehensive coverage
- **Type-safe TypeScript support** with interface definitions
- **Flexible test scenario configuration** with mock parameters
- **Concurrency safety and error handling** mechanisms
- **Object-oriented mock design** with extensible architecture

## Key Features

### 🚌 Transport Layer Mocking
- Complete ITransport interface implementation and simulation
- Support for various message types and transport modes
- Event-driven message processing and listening mechanisms
- Multi-process inter-communication mocking and testing support

### 👷 Test Worker Simulation
- Complete test worker lifecycle simulation
- Configurable execution delays and failure scenarios
- Detailed execution statistics and state tracking
- Concurrent execution and resource management simulation

### 🌐 Browser Proxy Mocking
- Complete browser proxy controller simulation
- Support for various browser operations and event simulation
- Flexible test scenario configuration with mock parameters
- Error injection and exception scenario testing support

### 📁 File System Tools
- Efficient file reading and path resolution utilities
- Support for asynchronous file operations with error handling
- Flexible path configuration with relative path support
- Cross-platform compatibility and encoding support

### 🔌 Plugin Compatibility Testing
- **PluginCompatibilityTester** - Browser proxy plugin compatibility testing tool
- Support for Selenium and Playwright driver compatibility testing
- Complete IBrowserProxyPlugin interface method verification
- Configurable test skipping and custom timeout settings
- Detailed test result reporting and error handling

### 🧪 Unit Test Suite
- **Complete unit test coverage** - Including all core functionality unit tests
- **Integration test examples** - Demonstrating how to use test utilities
- **Usage examples and documentation** - Detailed usage patterns and best practices
- **Mock toolkit** - Reusable mock objects and testing helper tools

## Installation

```bash
# Using npm
npm install --save-dev @testring/test-utils

# Using yarn
yarn add --dev @testring/test-utils

# Using pnpm
pnpm add --save-dev @testring/test-utils
```

## Core Architecture

### TransportMock Class

Transport layer mock implementation, extending `EventEmitter`:

```typescript
class TransportMock extends EventEmitter implements ITransport {
  // Message Broadcasting Methods
  public broadcast<T>(messageType: string, payload: T): void
  public broadcastFrom<T>(messageType: string, payload: T, processID: string): void
  public broadcastLocal<T>(messageType: string, payload: T): void
  public broadcastUniversally<T>(messageType: string, payload: T): void

  // Message Sending and Listening
  public send<T>(src: string, messageType: string, payload: T): Promise<void>
  public on<T>(messageType: string, callback: (m: T, source?: string) => void): Function
  public once<T>(messageType: string, callback: (m: T, source?: string) => void): Function
  public onceFrom<T>(processID: string, messageType: string, callback: Function): Function

  // Process Management
  public registerChild(processID: string, process: IWorkerEmitter): void
  public isChildProcess(): boolean
}
```

### TestWorkerMock Class

Test worker mock implementation:

```typescript
class TestWorkerMock implements ITestWorker {
  constructor(
    shouldFail?: boolean,     // Whether to simulate failure
    executionDelay?: number   // Execution delay time
  )

  // Core Methods
  public spawn(): ITestWorkerInstance

  // Mock Control Methods
  public $getSpawnedCount(): number
  public $getKillCallsCount(): number
  public $getExecutionCallsCount(): number
  public $getInstanceName(): string
  public $getErrorInstance(): any
}

class TestWorkerMockInstance implements ITestWorkerInstance {
  public getWorkerID(): string
  public execute(): Promise<void>
  public kill(): Promise<void>

  // Test State Queries
  public $getKillCallsCount(): number
  public $getExecuteCallsCount(): number
  public $getErrorInstance(): any
}
```

### File Utility Functions

```typescript
// File Path Resolution Factory
function fileResolverFactory(...root: string[]): (...file: string[]) => string

// File Reading Factory
function fileReaderFactory(...root: string[]): (source: string) => Promise<string>
```

### PluginCompatibilityTester Class

Browser plugin compatibility testing tool:

```typescript
class PluginCompatibilityTester {
  constructor(
    plugin: IBrowserProxyPlugin,
    config?: CompatibilityTestConfig
  )

  // Test Methods
  public testMethodImplementation(): Promise<void>
  public testBasicNavigation(): Promise<void>
  public testElementQueries(): Promise<void>
  public testFormInteractions(): Promise<void>
  public testJavaScriptExecution(): Promise<void>
  public testScreenshots(): Promise<void>
  public testWaitOperations(): Promise<void>
  public testSessionManagement(): Promise<void>
  public testErrorHandling(): Promise<void>

  // Run All Tests
  public runAllTests(): Promise<{
    passed: number;
    failed: number;
    skipped: number;
    results: Array<{
      name: string;
      status: 'passed' | 'failed' | 'skipped';
      error?: Error;
    }>;
  }>
}

interface CompatibilityTestConfig {
  pluginName?: string;
  skipTests?: string[];
  customTimeouts?: {
    waitForExist?: number;
    waitForVisible?: number;
    executeAsync?: number;
    [key: string]: number | undefined;
  };
}
```

## Basic Usage

### Transport Layer Mock Usage

```typescript
import { TransportMock } from '@testring/test-utils';

// Create transport layer mock
const transportMock = new TransportMock();

// Listen to messages
transportMock.on('test.start', (payload, source) => {
  console.log('Test started:', payload, 'Source:', source);
});

transportMock.on('test.complete', (payload) => {
  console.log('Test completed:', payload);
});

// Test message broadcasting
transportMock.broadcast('test.start', {
  testName: 'example-test',
  timestamp: Date.now()
});

// Test directed messages
transportMock.send('worker-1', 'test.execute', {
  testFile: './test/example.test.js'
});

// Test source messages
transportMock.broadcastFrom('test.result', {
  success: true,
  duration: 1500
}, 'worker-1');

// Clean up listeners
const removeListener = transportMock.on('test.error', (error) => {
  console.error('Test error:', error);
});

// Remove listener
removeListener();

// One-time listener
transportMock.once('test.finish', () => {
  console.log('Test finished (triggered only once)');
});

// Source-specific listener
transportMock.onceFrom('worker-2', 'test.status', (status) => {
  console.log('Worker 2 status:', status);
});
```

### Test Worker Mock Usage

```typescript
import { TestWorkerMock } from '@testring/test-utils';

// Create successful test worker mock
const successWorker = new TestWorkerMock(false, 1000); // No failure, 1 second delay

// Create failing test worker mock
const failingWorker = new TestWorkerMock(true, 500); // Failure, 0.5 second delay

// Create instant test worker mock
const instantWorker = new TestWorkerMock(false, 0); // No failure, no delay

// Spawn worker instances
const worker1 = successWorker.spawn();
const worker2 = failingWorker.spawn();
const worker3 = instantWorker.spawn();

console.log('Worker ID:', worker1.getWorkerID());

// Test successful execution
async function testSuccessfulExecution() {
  try {
    console.log('Starting successful test execution...');
    await worker1.execute();
    console.log('Test execution successful');
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

// Test failed execution
async function testFailedExecution() {
  try {
    console.log('Starting failed test execution...');
    await worker2.execute();
    console.log('Unexpected success!');
  } catch (error) {
    console.log('Failed as expected:', error);
  }
}

// Test worker management
async function testWorkerManagement() {
  // Execute multiple tasks
  await worker1.execute();
  await worker3.execute();
  
  // View statistics
  console.log('Spawned instances:', successWorker.$getSpawnedCount());
  console.log('Execution count:', successWorker.$getExecutionCallsCount());
  console.log('Kill count:', successWorker.$getKillCallsCount());
  
  // Kill workers
  await worker1.kill();
  await worker3.kill();
  
  console.log('Statistics after kill:', successWorker.$getKillCallsCount());
}

// Execute tests
testSuccessfulExecution();
testFailedExecution();
testWorkerManagement();
```

### File System Tools Usage

```typescript
import { fileReaderFactory, fileResolverFactory } from '@testring/test-utils';
import * as path from 'path';

// Create path resolvers
const resolveProjectPath = fileResolverFactory(__dirname, '..');
const resolveTestPath = fileResolverFactory(__dirname, '../test');
const resolveSrcPath = fileResolverFactory(__dirname, '../src');

// Use path resolvers
const configPath = resolveProjectPath('tsconfig.json');
const testFile = resolveTestPath('example.test.ts');
const sourceFile = resolveSrcPath('index.ts');

console.log('Config file path:', configPath);
console.log('Test file path:', testFile);
console.log('Source file path:', sourceFile);

// Create file readers
const readProjectFile = fileReaderFactory(__dirname, '..');
const readTestFile = fileReaderFactory(__dirname, '../test');
const readSourceFile = fileReaderFactory(__dirname, '../src');

// Use file readers
async function readFiles() {
  try {
    // Read config file
    const packageJson = await readProjectFile('package.json');
    console.log('package.json content length:', packageJson.length);
    
    // Read test file
    const testContent = await readTestFile('example.test.ts');
    console.log('Test file content length:', testContent.length);
    
    // Read source file
    const sourceContent = await readSourceFile('index.ts');
    console.log('Source file content length:', sourceContent.length);
    
  } catch (error) {
    console.error('File reading failed:', error.message);
  }
}

// Batch read files
async function readMultipleFiles() {
  const files = [
    'package.json',
    'tsconfig.json',
    'README.md'
  ];
  
  const results = await Promise.allSettled(
    files.map(file => readProjectFile(file))
  );
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`${files[index]}: Read successful, length ${result.value.length}`);
    } else {
      console.log(`${files[index]}: Read failed - ${result.reason.message}`);
    }
  });
}

readFiles();
readMultipleFiles();
```

## Advanced Usage and Patterns

### Integrated Test Environment Setup

```typescript
import { TransportMock, TestWorkerMock, fileReaderFactory } from '@testring/test-utils';

// Integrated test environment class
class IntegratedTestEnvironment {
  public transport: TransportMock;
  public workers: Map<string, TestWorkerMock>;
  public fileReader: (source: string) => Promise<string>;
  private messageHistory: Array<{ type: string; payload: any; timestamp: number }> = [];
  
  constructor(projectRoot: string = process.cwd()) {
    this.transport = new TransportMock();
    this.workers = new Map();
    this.fileReader = fileReaderFactory(projectRoot);
    
    this.setupMessageLogging();
  }
  
  // Setup message logging
  private setupMessageLogging() {
    const originalBroadcast = this.transport.broadcast.bind(this.transport);
    
    this.transport.broadcast = <T>(messageType: string, payload: T) => {
      this.messageHistory.push({
        type: messageType,
        payload,
        timestamp: Date.now()
      });
      
      return originalBroadcast(messageType, payload);
    };
  }
  
  // Create test worker
  createTestWorker(name: string, shouldFail = false, delay = 0): TestWorkerMock {
    const worker = new TestWorkerMock(shouldFail, delay);
    this.workers.set(name, worker);
    return worker;
  }
  
  // Get test worker
  getTestWorker(name: string): TestWorkerMock | undefined {
    return this.workers.get(name);
  }
  
  // Create multiple workers
  createMultipleWorkers(configs: Array<{
    name: string;
    shouldFail?: boolean;
    delay?: number;
  }>): Map<string, TestWorkerMock> {
    configs.forEach(config => {
      this.createTestWorker(config.name, config.shouldFail, config.delay);
    });
    
    return this.workers;
  }
  
  // Simulate test execution process
  async simulateTestExecution(workerName: string, testFiles: string[]) {
    const worker = this.getTestWorker(workerName);
    if (!worker) {
      throw new Error(`Worker '${workerName}' does not exist`);
    }
    
    // Broadcast test start
    this.transport.broadcast('test.session.start', {
      workerName,
      testFiles,
      timestamp: Date.now()
    });
    
    const results = [];
    
    for (const testFile of testFiles) {
      // Broadcast test file start
      this.transport.broadcast('test.file.start', {
        workerName,
        testFile,
        timestamp: Date.now()
      });
      
      try {
        // Spawn worker instance and execute
        const instance = worker.spawn();
        await instance.execute();
        
        results.push({ testFile, success: true, error: null });
        
        // Broadcast test file success
        this.transport.broadcast('test.file.success', {
          workerName,
          testFile,
          timestamp: Date.now()
        });
        
      } catch (error) {
        results.push({ testFile, success: false, error });
        
        // Broadcast test file failure
        this.transport.broadcast('test.file.failure', {
          workerName,
          testFile,
          error: error.toString(),
          timestamp: Date.now()
        });
      }
    }
    
    // Broadcast test session end
    this.transport.broadcast('test.session.complete', {
      workerName,
      results,
      timestamp: Date.now()
    });
    
    return results;
  }
  
  // Get test statistics
  getTestStatistics() {
    const stats = {
      totalWorkers: this.workers.size,
      totalSpawned: 0,
      totalExecutions: 0,
      totalKills: 0,
      messageCount: this.messageHistory.length
    };
    
    this.workers.forEach(worker => {
      stats.totalSpawned += worker.$getSpawnedCount();
      stats.totalExecutions += worker.$getExecutionCallsCount();
      stats.totalKills += worker.$getKillCallsCount();
    });
    
    return stats;
  }
  
  // Get message history
  getMessageHistory(messageType?: string) {
    if (messageType) {
      return this.messageHistory.filter(msg => msg.type === messageType);
    }
    return [...this.messageHistory];
  }
  
  // Clean up environment
  async cleanup() {
    // Kill all workers
    for (const [name, worker] of this.workers) {
      for (let i = 0; i < worker.$getSpawnedCount(); i++) {
        const instance = worker.spawn();
        await instance.kill();
      }
    }
    
    // Clear message history
    this.messageHistory = [];
    
    // Clear transport layer listeners
    this.transport.removeAllListeners();
    
    console.log('Test environment cleaned up');
  }
}

// Use integrated test environment
async function runIntegratedTest() {
  const testEnv = new IntegratedTestEnvironment();
  
  // Listen to test events
  testEnv.transport.on('test.session.start', (data) => {
    console.log('Test session started:', data);
  });
  
  testEnv.transport.on('test.file.success', (data) => {
    console.log('Test file success:', data.testFile);
  });
  
  testEnv.transport.on('test.file.failure', (data) => {
    console.log('Test file failure:', data.testFile, data.error);
  });
  
  // Create workers
  testEnv.createMultipleWorkers([
    { name: 'unit-tests', shouldFail: false, delay: 100 },
    { name: 'integration-tests', shouldFail: false, delay: 500 },
    { name: 'e2e-tests', shouldFail: true, delay: 1000 }
  ]);
  
  try {
    // Simulate test execution
    await testEnv.simulateTestExecution('unit-tests', [
      'unit/parser.test.js',
      'unit/validator.test.js'
    ]);
    
    await testEnv.simulateTestExecution('integration-tests', [
      'integration/api.test.js'
    ]);
    
    await testEnv.simulateTestExecution('e2e-tests', [
      'e2e/user-flow.test.js'
    ]);
    
    // Output statistics
    const stats = testEnv.getTestStatistics();
    console.log('Test statistics:', stats);
    
    // Output message history
    const messages = testEnv.getMessageHistory();
    console.log(`Total messages generated: ${messages.length}`);
    
  } finally {
    await testEnv.cleanup();
  }
}

runIntegratedTest().catch(console.error);
```

### Advanced Test Scenario Simulation

```typescript
// Complex test scenario simulator
class AdvancedTestScenarios {
  private testEnv: IntegratedTestEnvironment;
  
  constructor() {
    this.testEnv = new IntegratedTestEnvironment();
  }
  
  // Simulate concurrent test execution
  async simulateConcurrentExecution() {
    console.log('Starting concurrent test simulation...');
    
    // Create multiple workers
    this.testEnv.createMultipleWorkers([
      { name: 'worker-1', shouldFail: false, delay: 200 },
      { name: 'worker-2', shouldFail: false, delay: 300 },
      { name: 'worker-3', shouldFail: true, delay: 150 }
    ]);
    
    // Concurrent test execution
    const concurrentTasks = [
      this.testEnv.simulateTestExecution('worker-1', ['test1.js', 'test2.js']),
      this.testEnv.simulateTestExecution('worker-2', ['test3.js']),
      this.testEnv.simulateTestExecution('worker-3', ['test4.js', 'test5.js'])
    ];
    
    const results = await Promise.allSettled(concurrentTasks);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Worker ${index + 1} execution successful:`, result.value);
      } else {
        console.log(`Worker ${index + 1} execution failed:`, result.reason);
      }
    });
  }
  
  // Simulate network delays and retries
  async simulateNetworkIssues() {
    console.log('Simulating network issue scenarios...');
    
    const unstableWorker = this.testEnv.createTestWorker('unstable', false, 0);
    
    // Simulate unstable network environment
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Attempt ${attempt}...`);
        
        // Random delay to simulate network jitter
        const delay = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const instance = unstableWorker.spawn();
        await instance.execute();
        
        console.log(`Attempt ${attempt} successful`);
        break;
        
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === 3) {
          console.log('All retries failed');
        } else {
          // Exponential backoff retry
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
  }
  
  // Simulate resource constraint scenarios
  async simulateResourceConstraints() {
    console.log('Simulating resource constraint scenarios...');
    
    const maxConcurrentWorkers = 3;
    const totalTasks = 10;
    
    // Create limited worker set
    const workers = [];
    for (let i = 0; i < maxConcurrentWorkers; i++) {
      workers.push(this.testEnv.createTestWorker(`limited-worker-${i}`, false, 100));
    }
    
    // Simulate task queue
    const taskQueue = [];
    for (let i = 0; i < totalTasks; i++) {
      taskQueue.push({
        id: i,
        testFile: `task-${i}.test.js`
      });
    }
    
    // Rate-limited task execution
    const executingTasks = new Set();
    const completedTasks = [];
    
    while (taskQueue.length > 0 || executingTasks.size > 0) {
      // Start new tasks
      while (executingTasks.size < maxConcurrentWorkers && taskQueue.length > 0) {
        const task = taskQueue.shift()!;
        const workerIndex = executingTasks.size;
        const worker = workers[workerIndex];
        
        const execution = this.executeTask(worker, task)
          .then(result => {
            completedTasks.push(result);
            executingTasks.delete(execution);
          })
          .catch(error => {
            console.error(`Task ${task.id} failed:`, error.message);
            executingTasks.delete(execution);
          });
        
        executingTasks.add(execution);
      }
      
      // Wait for at least one task to complete
      if (executingTasks.size > 0) {
        await Promise.race(Array.from(executingTasks));
      }
    }
    
    console.log(`All tasks completed, successful: ${completedTasks.length}/${totalTasks}`);
  }
  
  private async executeTask(worker: TestWorkerMock, task: any) {
    console.log(`Starting task ${task.id}`);
    const instance = worker.spawn();
    await instance.execute();
    console.log(`Task ${task.id} completed`);
    return { taskId: task.id, success: true };
  }
  
  // Clean up resources
  async cleanup() {
    await this.testEnv.cleanup();
  }
}

// Run advanced test scenarios
async function runAdvancedScenarios() {
  const scenarios = new AdvancedTestScenarios();
  
  try {
    await scenarios.simulateConcurrentExecution();
    console.log('\n--- Separator ---\n');
    
    await scenarios.simulateNetworkIssues();
    console.log('\n--- Separator ---\n');
    
    await scenarios.simulateResourceConstraints();
    
  } finally {
    await scenarios.cleanup();
  }
}

runAdvancedScenarios().catch(console.error);
```

## PluginCompatibilityTester Usage Guide

### Basic Usage

```typescript
import { PluginCompatibilityTester, CompatibilityTestConfig } from '../../../test-utils/plugin-compatibility-tester';

// Configure compatibility testing
const config: CompatibilityTestConfig = {
    pluginName: 'my-browser-plugin',
    skipTests: ['screenshots'], // Optional: skip specific tests
    customTimeouts: {           // Optional: custom timeout settings
        waitForExist: 10000,
        waitForVisible: 8000
    }
};

// Create tester instance
const tester = new PluginCompatibilityTester(plugin, config);

// Run individual test methods
await tester.testMethodImplementation();
await tester.testBasicNavigation();
await tester.testElementQueries();

// Or run all tests
const results = await tester.runAllTests();
console.log(`Passed: ${results.passed}, Failed: ${results.failed}, Skipped: ${results.skipped}`);
```

### Available Test Methods

- `testMethodImplementation()` - Verify all required IBrowserProxyPlugin methods are implemented
- `testBasicNavigation()` - Test URL navigation, page title, refresh, and source code retrieval
- `testElementQueries()` - Test element existence and visibility checks
- `testFormInteractions()` - Test form input operations
- `testJavaScriptExecution()` - Test JavaScript execution capabilities
- `testScreenshots()` - Test screenshot functionality
- `testWaitOperations()` - Test wait operations
- `testSessionManagement()` - Test multi-session handling
- `testErrorHandling()` - Test error scenarios

### Configuration Options

#### skipTests Skip Tests
Test names should be lowercase and without spaces:
```typescript
skipTests: [
    'methodimplementation',  // Skip method implementation tests
    'basicnavigation',       // Skip basic navigation tests
    'elementqueries',        // Skip element query tests
    'forminteractions',      // Skip form interaction tests
    'javascriptexecution',   // Skip JavaScript execution tests
    'screenshots',           // Skip screenshot tests
    'waitoperations',        // Skip wait operation tests
    'sessionmanagement',     // Skip session management tests
    'errorhandling'          // Skip error handling tests
]
```

#### customTimeouts Custom Timeouts
```typescript
customTimeouts: {
    waitForExist: 10000,     // Element existence wait timeout (milliseconds)
    waitForVisible: 8000,    // Element visibility wait timeout (milliseconds)
    executeAsync: 15000      // Async execution timeout (milliseconds)
}
```

## Unit Tests

This package now includes complete unit tests for PluginCompatibilityTester:

### Test File Structure

```
test/
├── plugin-compatibility-tester.spec.ts      # PluginCompatibilityTester class unit tests
├── plugin-compatibility-integration.spec.ts # Integration tests using PluginCompatibilityTester
├── plugin-compatibility-usage.spec.ts       # Usage examples and documentation tests
├── mocks/
│   └── browser-proxy-plugin.mock.ts         # Mock implementation for testing
└── setup.ts                                 # Test environment setup
```

### Running Tests

```bash
# Run only this package's tests
cd packages/test-utils
npm test

# Run all project tests (including this package)
npm run test
```

### Test Coverage

Unit tests cover:
- Constructor and configuration handling
- Functionality of individual test methods
- Error handling scenarios
- Skip test functionality
- Integration with actual plugin implementations
- Usage patterns and examples

## Migration Notes

The original `test-utils/plugin-compatibility-tester.ts` file has been converted to appropriate unit tests. Functionality remains unchanged, but is now properly tested and integrated into the project's test suite.

### Changes Made

1. **Added Unit Tests** - Comprehensive unit tests for the PluginCompatibilityTester class
2. **Added Integration Tests** - Tests demonstrating how to use PluginCompatibilityTester with actual plugins
3. **Added Mock Tools** - Reusable mock implementations for testing
4. **Updated Package Configuration** - Added test scripts and dependencies
5. **Integrated with Project Tests** - Tests now run as part of `npm run test`

### Unchanged Content

- PluginCompatibilityTester class API remains unchanged
- All test methods work exactly the same way
- Configuration options are identical
- Original file location (`test-utils/plugin-compatibility-tester.ts`) is preserved

## API Reference

### TransportMock

```typescript
class TransportMock extends EventEmitter implements ITransport {
  // Constructor
  constructor()

  // Broadcasting Methods
  broadcast<T>(messageType: string, payload: T): void
  broadcastFrom<T>(messageType: string, payload: T, processID: string): void
  broadcastLocal<T>(messageType: string, payload: T): void
  broadcastUniversally<T>(messageType: string, payload: T): void

  // Message Sending
  send<T>(src: string, messageType: string, payload: T): Promise<void>

  // Event Listeners
  on<T>(messageType: string, callback: (m: T, source?: string) => void): Function
  once<T>(messageType: string, callback: (m: T, source?: string) => void): Function
  onceFrom<T>(processID: string, messageType: string, callback: Function): Function

  // Process Management
  registerChild(processID: string, process: IWorkerEmitter): void
  isChildProcess(): boolean
}
```

### TestWorkerMock

```typescript
class TestWorkerMock implements ITestWorker {
  // Constructor
  constructor(shouldFail?: boolean, executionDelay?: number)

  // Core Methods
  spawn(): ITestWorkerInstance

  // Mock Control Methods
  $getSpawnedCount(): number
  $getKillCallsCount(): number
  $getExecutionCallsCount(): number
  $getInstanceName(): string
  $getErrorInstance(): any
}

class TestWorkerMockInstance implements ITestWorkerInstance {
  // Core Methods
  getWorkerID(): string
  execute(): Promise<void>
  kill(): Promise<void>

  // Mock Control Methods
  $getKillCallsCount(): number
  $getExecuteCallsCount(): number
  $getErrorInstance(): any
}
```

### File Utilities

```typescript
// File Path Resolution Factory
function fileResolverFactory(...root: string[]): (...file: string[]) => string

// File Reading Factory
function fileReaderFactory(...root: string[]): (source: string) => Promise<string>
```

### PluginCompatibilityTester

```typescript
class PluginCompatibilityTester {
  // Constructor
  constructor(plugin: IBrowserProxyPlugin, config?: CompatibilityTestConfig)

  // Individual Test Methods
  testMethodImplementation(): Promise<void>
  testBasicNavigation(): Promise<void>
  testElementQueries(): Promise<void>
  testFormInteractions(): Promise<void>
  testJavaScriptExecution(): Promise<void>
  testScreenshots(): Promise<void>
  testWaitOperations(): Promise<void>
  testSessionManagement(): Promise<void>
  testErrorHandling(): Promise<void>

  // Run All Tests
  runAllTests(): Promise<{
    passed: number;
    failed: number;
    skipped: number;
    results: Array<{
      name: string;
      status: 'passed' | 'failed' | 'skipped';
      error?: Error;
    }>;
  }>
}

interface CompatibilityTestConfig {
  pluginName?: string;
  skipTests?: string[];
  customTimeouts?: {
    waitForExist?: number;
    waitForVisible?: number;
    executeAsync?: number;
    [key: string]: number | undefined;
  };
}
```

## Best Practices

### 1. Mock Design
- **Use real interface implementations** rather than simple stubs
- **Provide configurable mock behavior** and parameters
- **Implement error injection** and exception scenario testing
- **Simulate realistic time delays** and network conditions

### 2. Test Isolation
- **Ensure independence and repeatability** between tests
- **Clean up test resources and state** promptly
- **Avoid global state** and cross-test dependencies
- **Use appropriate cleanup and reset mechanisms**

### 3. Performance Considerations
- **Use mock objects judiciously** to avoid memory leaks
- **Optimize file operations** and I/O performance
- **Control concurrent test count** and resource usage
- **Monitor test execution time** and resource consumption

### 4. Error Handling
- **Provide clear error messages** and debugging information
- **Implement appropriate error recovery** and retry mechanisms
- **Distinguish between mock errors** and actual test errors
- **Log detailed error information** and context

### 5. Maintainability
- **Provide clear API documentation** and usage examples
- **Use descriptive naming** and comments
- **Implement introspection** and debugging support for mock state
- **Provide version compatibility** and upgrade guides

## Troubleshooting

### Common Issues

#### Mock Object Not Working
```bash
Error: Mock method not implemented
```
**Solution**: Check mock object interface implementation, method calls, and type matching.

#### File Reading Failure
```bash
ENOENT: no such file or directory
```
**Solution**: Check file paths, working directory, file permissions, and path resolution.

#### Memory Leaks
```bash
MaxListenersExceededWarning
```
**Solution**: Check event listener cleanup, object disposal, and memory management.

#### Concurrency Issues
```bash
Race condition in test execution
```
**Solution**: Check concurrency control, state management, and asynchronous operation synchronization.

### Debugging Tips

```typescript
// Enable verbose logging
const transportMock = new TransportMock();

// Listen to all messages
transportMock.on('*', (payload, source) => {
  console.log('Message event:', { payload, source });
});

// Check mock state
const worker = new TestWorkerMock(false, 100);
console.log('Worker statistics:', {
  spawned: worker.$getSpawnedCount(),
  executions: worker.$getExecutionCallsCount(),
  kills: worker.$getKillCallsCount()
});

// File reading debugging
const readFile = fileReaderFactory(__dirname);
readFile('test.txt')
  .then(content => console.log('File content:', content))
  .catch(error => console.error('Reading error:', error));
```

## Integration with Testing Frameworks

### Jest Integration

```typescript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['./test/setup.js']
};

// test/setup.js
const { TransportMock, TestWorkerMock } = require('@testring/test-utils');

// Make mocks available globally
global.TransportMock = TransportMock;
global.TestWorkerMock = TestWorkerMock;

// Setup before each test
beforeEach(() => {
  global.transportMock = new TransportMock();
});

// Cleanup after each test
afterEach(() => {
  global.transportMock.removeAllListeners();
});
```

### Mocha Integration

```typescript
// test/mocha-setup.js
const { TransportMock, TestWorkerMock } = require('@testring/test-utils');

// Setup before each test
beforeEach(function() {
  this.transportMock = new TransportMock();
  this.testWorker = new TestWorkerMock(false, 0);
});

// Cleanup after each test
afterEach(function() {
  this.transportMock.removeAllListeners();
});
```

## Dependencies

- **`@testring/types`** - TypeScript type definitions
- **`events`** - Node.js event system
- **`fs`** - Node.js file system
- **`path`** - Node.js path handling

## Related Modules

- **`@testring/transport`** - Real transport layer implementation
- **`@testring/test-worker`** - Real test worker implementation
- **`@testring/browser-proxy`** - Browser proxy implementation
- **`@testring/test-runner`** - Test runner

## License

MIT License - see the [LICENSE](https://github.com/ringcentral/testring/blob/master/LICENSE) file for details.