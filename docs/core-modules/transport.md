# @testring/transport

Transport layer module that provides communication mechanisms and message passing functionality in multi-process environments.

## Overview

This module is the core communication layer of the testring framework, responsible for:
- Inter-Process Communication (IPC) management
- Message routing and delivery
- Broadcast and point-to-point communication
- Child process registration and management

## Main Components

### Transport
The main transport layer class that provides complete communication functionality:

```typescript
export class Transport implements ITransport {
  // Point-to-point communication
  send<T>(processID: string, messageType: string, payload: T): Promise<void>
  
  // Broadcast communication
  broadcast<T>(messageType: string, payload: T): void
  broadcastLocal<T>(messageType: string, payload: T): void
  broadcastUniversally<T>(messageType: string, payload: T): void
  
  // Event listening
  on<T>(messageType: string, callback: TransportMessageHandler<T>): void
  once<T>(messageType: string, callback: TransportMessageHandler<T>): void
  onceFrom<T>(processID: string, messageType: string, callback: TransportMessageHandler<T>): void
  
  // Process management
  registerChild(processID: string, child: IWorkerEmitter): void
  getProcessesList(): Array<string>
}
```

### DirectTransport
Direct transport for point-to-point communication:

```typescript
export class DirectTransport {
  send<T>(processID: string, messageType: string, payload: T): Promise<void>
  registerChild(processID: string, child: IWorkerEmitter): void
  getProcessesList(): Array<string>
}
```

### BroadcastTransport
Broadcast transport for broadcast communication:

```typescript
export class BroadcastTransport {
  broadcast<T>(messageType: string, payload: T): void
  broadcastLocal<T>(messageType: string, payload: T): void
}
```

## Communication Patterns

### Point-to-Point Communication
Used to send messages to specific processes:

```typescript
import { transport } from '@testring/transport';

// Send message to specified process
await transport.send('worker-1', 'execute-test', {
  testFile: 'test.spec.js',
  config: {...}
});
```

### Broadcast Communication
Used to send messages to all processes:

```typescript
import { transport } from '@testring/transport';

// Broadcast to all child processes
transport.broadcast('config-updated', newConfig);

// Broadcast to local process
transport.broadcastLocal('shutdown', null);

// Universal broadcast (automatically selected based on environment)
transport.broadcastUniversally('status-update', status);
```

### Event Listening
Listen for messages from other processes:

```typescript
import { transport } from '@testring/transport';

// Listen for specific message types
transport.on('test-result', (result, processID) => {
  console.log(`Received test result from ${processID}:`, result);
});

// One-time listening
transport.once('init-complete', (data) => {
  console.log('Initialization complete');
});

// Listen for messages from specific process
transport.onceFrom('worker-1', 'ready', () => {
  console.log('Worker-1 is ready');
});
```

## Process Management

### Child Process Registration
```typescript
import { transport } from '@testring/transport';

// Register child process
const childProcess = fork('./worker.js');
transport.registerChild('worker-1', childProcess);

// Get all registered processes
const processes = transport.getProcessesList();
console.log('Registered processes:', processes);
```

### Process Detection
```typescript
import { transport } from '@testring/transport';

// Check if running in child process
if (transport.isChildProcess()) {
  console.log('Running in child process');
} else {
  console.log('Running in main process');
}
```

## Message Format

### Standard Message Format
```typescript
interface ITransportDirectMessage {
  type: string;    // Message type
  payload: any;    // Message content
}
```

### Message Handler
```typescript
type TransportMessageHandler<T> = (message: T, processID?: string) => void;
```

## Usage Scenarios

### Test Execution Coordination
```typescript
// Main process: Distribute test tasks
transport.send('worker-1', 'execute-test', {
  testFile: 'login.spec.js',
  config: testConfig
});

// Child process: Listen for test tasks
transport.on('execute-test', async (task) => {
  const result = await executeTest(task.testFile, task.config);
  transport.send('main', 'test-result', result);
});
```

### Log Collection
```typescript
// Child process: Send logs
transport.send('main', 'log', {
  level: 'info',
  message: 'Test execution started'
});

// Main process: Collect logs
transport.on('log', (logEntry, processID) => {
  console.log(`[${processID}] ${logEntry.level}: ${logEntry.message}`);
});
```

### Configuration Synchronization
```typescript
// Main process: Broadcast configuration updates
transport.broadcast('config-update', newConfig);

// All child processes: Receive configuration updates
transport.on('config-update', (config) => {
  updateLocalConfig(config);
});
```

## Error Handling

### Communication Errors
```typescript
try {
  await transport.send('worker-1', 'test-command', data);
} catch (error) {
  console.error('Failed to send message:', error);
  // Handle communication error
}
```

### Timeout Handling
```typescript
// Set timeout listener
const timeout = setTimeout(() => {
  console.error('Message response timeout');
}, 5000);

transport.onceFrom('worker-1', 'response', (data) => {
  clearTimeout(timeout);
  console.log('Response received:', data);
});
```

## Performance Optimization

### Message Caching
- Automatically cache undelivered messages
- Automatically send cached messages when processes are ready
- Prevent message loss

### Connection Pool Management
- Reuse process connections
- Automatically clean up disconnected connections
- Optimize memory usage

## Debugging Features

### Message Tracing
```typescript
// Enable debug mode
process.env.DEBUG = 'testring:transport';

// Will output detailed message delivery logs
transport.send('worker-1', 'test-message', data);
// Output: [DEBUG] Sending message test-message to worker-1
```

### Connection Status Monitoring
```typescript
// Monitor process connection status
transport.on('process-connected', (processID) => {
  console.log(`Process ${processID} connected`);
});

transport.on('process-disconnected', (processID) => {
  console.log(`Process ${processID} disconnected`);
});
```

## Installation

```bash
npm install @testring/transport
```

## Dependencies

- `@testring/child-process` - Child process management
- `@testring/types` - Type definitions
- `events` - Node.js events module

## Related Modules

- `@testring/test-worker` - Test worker processes
- `@testring/logger` - Logging system
- `@testring/child-process` - Child process management