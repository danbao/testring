# @testring/fs-store

File storage management module that serves as the file system abstraction layer for the testring framework. It provides unified file read/write and caching capabilities in multi-process environments. This module implements concurrent control, permission management, and resource coordination through a client-server architecture, ensuring file operation safety and consistency in multi-process environments.

[![npm version](https://badge.fury.io/js/@testring/fs-store.svg)](https://www.npmjs.com/package/@testring/fs-store)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Overview

The file storage management module is the file system infrastructure of the testring framework, providing:
- File operation coordination and synchronization in multi-process environments
- File locking mechanism and concurrent access control
- Unified file naming and path management
- Factory pattern support for multiple file types
- Plugin-based file operation extension mechanism
- Complete file lifecycle management

## Key Features

### Concurrency Control
- File locking mechanism to prevent concurrent write conflicts
- Permission queue management and access control
- Thread pool limiting the number of simultaneous file operations
- Transaction support ensuring operation atomicity

### Multi-Process Support
- Inter-process communication based on transport
- Server-client architecture supporting multiple worker processes
- Unified file storage directory management
- File sharing mechanism between worker processes

### File Type Support
- Text files (UTF-8 encoding)
- Binary files (Binary encoding)
- Screenshot files (PNG format)
- Custom file type extensions

### Plugin-Based Extensions
- Custom hooks for file naming strategies
- Plugin control for file operation queues
- Listening mechanism for file release events
- Dynamic configuration of storage paths

## Installation

```bash
npm install @testring/fs-store
```

## Core Architecture

### System Architecture
The fs-store module uses a client-server architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Worker 1      │    │   Worker 2      │    │   Worker N      │
│  FSStoreClient  │    │  FSStoreClient  │    │  FSStoreClient  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  FSStoreServer  │
                    │   (Main Process)│
                    └─────────────────┘
                             │
                    ┌─────────────────┐
                    │  File System    │
                    │   (Disk)        │
                    └─────────────────┘
```

### Core Components

#### FSStoreServer
Server-side component responsible for coordinating and managing file operations:

```typescript
class FSStoreServer extends PluggableModule {
  constructor(threadCount: number = 10, msgNamePrefix: string)

  // Initialize server
  init(): boolean

  // Get server state
  getState(): number

  // Clean up transport connections
  cleanUpTransport(): void

  // Get file name list
  getNameList(): string[]
}
```

#### FSStoreClient
Client-side component providing file operation interfaces:

```typescript
class FSStoreClient {
  constructor(msgNamePrefix: string)

  // Get file lock
  getLock(meta: requestMeta, cb: Function): string

  // Get file access permission
  getAccess(meta: requestMeta, cb: Function): string

  // Get file deletion permission
  getUnlink(meta: requestMeta, cb: Function): string

  // Release file resources
  release(requestId: string, cb?: Function): boolean

  // Release all worker process operations
  releaseAllWorkerActions(): void
}
```

#### FSStoreFile
Main interface for file operations:

```typescript
class FSStoreFile implements IFSStoreFile {
  constructor(options: FSStoreOptions)

  // File locking operations
  async lock(): Promise<void>
  async unlock(): Promise<boolean>
  async unlockAll(): Promise<boolean>

  // File access operations
  async getAccess(): Promise<void>
  async releaseAccess(): Promise<boolean>

  // File I/O operations
  async read(): Promise<Buffer>
  async write(data: Buffer): Promise<string>
  async append(data: Buffer): Promise<string>
  async stat(): Promise<fs.Stats>
  async unlink(): Promise<boolean>

  // Transaction support
  async transaction(cb: () => Promise<void>): Promise<void>
  async startTransaction(): Promise<void>
  async endTransaction(): Promise<void>

  // Status queries
  isLocked(): boolean
  isValid(): boolean
  getFullPath(): string | null
  getState(): Record<string, any>
}
```

## Basic Usage

### Server-Side Setup

```typescript
import { FSStoreServer } from '@testring/fs-store';

// Create file storage server
const server = new FSStoreServer(
  10,  // Concurrent thread count
  'test-fs-store'  // Message name prefix
);

// Check server status
console.log('Server status:', server.getState());

// Get current managed file list
console.log('File list:', server.getNameList());
```

### Client-Side File Operations

```typescript
import { FSStoreClient } from '@testring/fs-store';

// Create client
const client = new FSStoreClient('test-fs-store');

// Get file lock
const lockId = client.getLock(
  { ext: 'txt' },
  (fullPath, requestId) => {
    console.log('File lock acquired successfully:', fullPath);

    // Perform file operations
    // ...

    // Release lock
    client.release(requestId);
  }
);

// Get file access permission
const accessId = client.getAccess(
  { ext: 'log' },
  (fullPath, requestId) => {
    console.log('File access permission obtained successfully:', fullPath);
    
    // Perform file read/write operations
    // ...
    
    // Release file access
    client.release(requestId);
  }
);
```

### Using FSStoreFile for File Operations

```typescript
import { FSStoreFile } from '@testring/fs-store';

// Create file object
const file = new FSStoreFile({
  meta: { ext: 'txt' },
  fsOptions: { encoding: 'utf8' }
});

// Write to file
await file.write(Buffer.from('Hello World'));
console.log('File path:', file.getFullPath());

// Read file
const content = await file.read();
console.log('File content:', content.toString());

// Append content
await file.append(Buffer.from('\nAppended content'));

// Get file status
const stats = await file.stat();
console.log('File size:', stats.size);

// Delete file
await file.unlink();
```

## File Factory Pattern

### Text File Factory

```typescript
import { FSTextFileFactory } from '@testring/fs-store';

// Create text file
const textFile = FSTextFileFactory.create(
  { ext: 'txt' },  // File metadata
  { fsOptions: { encoding: 'utf8' } }  // File options
);

// Write text content
await textFile.write(Buffer.from('Text content'));

// Read text content
const content = await textFile.read();
console.log('Text content:', content.toString());
```

### Binary File Factory

```typescript
import { FSBinaryFileFactory } from '@testring/fs-store';

// Create binary file
const binaryFile = FSBinaryFileFactory.create(
  { ext: 'bin' },
  { fsOptions: { encoding: 'binary' } }
);

// Write binary data
const binaryData = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
await binaryFile.write(binaryData);

// Read binary data
const data = await binaryFile.read();
console.log('Binary data:', data);
```

### Screenshot File Factory

```typescript
import { FSScreenshotFileFactory } from '@testring/fs-store';

// Create screenshot file
const screenshotFile = FSScreenshotFileFactory.create(
  { ext: 'png' },
  { fsOptions: { encoding: 'binary' } }
);

// Save screenshot data
const screenshotData = Buffer.from(/* Screenshot data */);
await screenshotFile.write(screenshotData);

console.log('Screenshot file path:', screenshotFile.getFullPath());
```

## Advanced Usage

### File Transaction Processing

```typescript
import { FSStoreFile } from '@testring/fs-store';

const file = new FSStoreFile({
  meta: { ext: 'log' },
  fsOptions: { encoding: 'utf8' }
});

// Use transactions to ensure atomicity of operations
await file.transaction(async () => {
  // Execute multiple operations within transaction
  await file.write(Buffer.from('Start recording\n'));
  await file.append(Buffer.from('Operation 1 completed\n'));
  await file.append(Buffer.from('Operation 2 completed\n'));
  await file.append(Buffer.from('Recording ended\n'));
});

console.log('Transaction completed, file path:', file.getFullPath());
```

### Manual Transaction Control

```typescript
const file = new FSStoreFile({
  meta: { ext: 'data' },
  fsOptions: { encoding: 'utf8' }
});

try {
  // Start transaction
  await file.startTransaction();
  
  // Execute multiple operations
  await file.write(Buffer.from('Data header\n'));
  
  for (let i = 0; i < 10; i++) {
    await file.append(Buffer.from(`Data row ${i}\n`));
  }
  
  await file.append(Buffer.from('Data footer\n'));
  
  // Commit transaction
  await file.endTransaction();
  
  console.log('Manual transaction completed');
} catch (error) {
  // Transaction will automatically end
  console.error('Transaction failed:', error);
}
```

### File Lock Management

```typescript
const file = new FSStoreFile({
  meta: { ext: 'shared' },
  fsOptions: { encoding: 'utf8' },
  lock: true  // Auto-lock on creation
});

// Check lock status
if (file.isLocked()) {
  console.log('File is locked');
}

// Manual lock
await file.lock();

// Execute operations that need lock protection
await file.write(Buffer.from('Protected data'));

// Unlock
await file.unlock();

// Unlock all locks
await file.unlockAll();
```

### Waiting for File Unlock

```typescript
const file = new FSStoreFile({
  meta: { fileName: 'shared-file.txt' },
  fsOptions: { encoding: 'utf8' }
});

// Wait for file unlock
await file.waitForUnlock();

// Now can safely operate on file
await file.write(Buffer.from('File is now writable'));
```

## Static Method Usage

### Quick File Operations

```typescript
import { FSStoreFile } from '@testring/fs-store';

// Quick file write
const filePath = await FSStoreFile.write(
  Buffer.from('Quick write content'),
  {
    meta: { ext: 'txt' },
    fsOptions: { encoding: 'utf8' }
  }
);

// Quick file append
await FSStoreFile.append(
  Buffer.from('Appended content'),
  {
    meta: { fileName: 'existing-file.txt' },
    fsOptions: { encoding: 'utf8' }
  }
);

// Quick file read
const content = await FSStoreFile.read({
  meta: { fileName: 'existing-file.txt' },
  fsOptions: { encoding: 'utf8' }
});

// Quick file delete
await FSStoreFile.unlink({
  meta: { fileName: 'file-to-delete.txt' }
});
```

## Server-Side Plugin Hooks

### File Name Generation Hooks

```typescript
import { FSStoreServer, fsStoreServerHooks } from '@testring/fs-store';

const server = new FSStoreServer();

// Custom file naming strategy
server.getHook(fsStoreServerHooks.ON_FILENAME)?.writeHook(
  'customNaming',
  (fileName, context) => {
    const { workerId, requestId, meta } = context;
    
    // Generate custom filename based on worker ID and request info
    const timestamp = Date.now();
    const customName = `${workerId}-${timestamp}-${fileName}`;
    
    return path.join('/custom/path', customName);
  }
);
```

### Queue Management Hooks

```typescript
server.getHook(fsStoreServerHooks.ON_QUEUE)?.writeHook(
  'customQueue',
  (defaultQueue, meta, context) => {
    const { workerId } = context;
    
    // Provide dedicated queue for specific worker process
    if (workerId === 'high-priority-worker') {
      return new CustomHighPriorityQueue();
    }
    
    return defaultQueue;
  }
);
```

### File Release Hooks

```typescript
server.getHook(fsStoreServerHooks.ON_RELEASE)?.readHook(
  'releaseLogger',
  (context) => {
    const { workerId, requestId, fullPath, fileName, action } = context;
    
    console.log(`File released: ${fileName} (${action}) by ${workerId}`);
    
    // Record file operation statistics
    recordFileOperationStats(workerId, action, fullPath);
  }
);
```

## Configuration and Customization

### Server Configuration

```typescript
const server = new FSStoreServer(
  20,  // Increase concurrent thread count to 20
  'production-fs-store'  // Production environment message prefix
);
```

### Client Configuration

```typescript
const client = new FSStoreClient('production-fs-store');

// Configure file options
const fileOptions = {
  meta: {
    ext: 'log',
    type: 'application/log',
    uniqPolicy: 'global'
  },
  fsOptions: {
    encoding: 'utf8',
    flag: 'a'  // Append mode
  },
  lock: true  // Auto-lock
};

const file = new FSStoreFile(fileOptions);
```

### Custom File Type Factory

```typescript
import { FSStoreFile, FSStoreType, FSFileUniqPolicy } from '@testring/fs-store';

// Create custom JSON file factory
export function createJSONFileFactory(
  extraMeta?: requestMeta,
  extraData?: FSStoreDataOptions
) {
  const baseMeta = {
    type: FSStoreType.text,
    ext: 'json',
    uniqPolicy: FSFileUniqPolicy.global
  };
  
  const data = {
    fsOptions: { encoding: 'utf8' as BufferEncoding }
  };
  
  return new FSStoreFile({
    ...data,
    ...extraData,
    meta: { ...baseMeta, ...extraMeta }
  });
}

// Use custom factory
const jsonFile = createJSONFileFactory({ fileName: 'config.json' });
await jsonFile.write(Buffer.from(JSON.stringify({ test: true })));
```

## Multi-Process File Sharing

### Main Process Setup

```typescript
// main.js
import { FSStoreServer } from '@testring/fs-store';

const server = new FSStoreServer(10, 'shared-fs');

// Start server
console.log('File storage server started');
```

### Worker Process Usage

```typescript
// worker.js
import { FSStoreClient, FSTextFileFactory } from '@testring/fs-store';

const client = new FSStoreClient('shared-fs');

// Create file in worker process
const file = FSTextFileFactory.create({ ext: 'log' });

// Write worker process specific content
await file.write(Buffer.from(`Worker process ${process.pid} log\n`));

// Append timestamp
await file.append(Buffer.from(`Time: ${new Date().toISOString()}\n`));

console.log('Worker process file path:', file.getFullPath());
```

## Error Handling and Debugging

### Error Handling Patterns

```typescript
import { FSStoreFile } from '@testring/fs-store';

class SafeFileOperations {
  async safeWrite(data: Buffer, options: FSStoreOptions): Promise<string | null> {
    try {
      const file = new FSStoreFile(options);
      const filePath = await file.write(data);
      return filePath;
    } catch (error) {
      console.error('File write failed:', error.message);
      
      if (error.message.includes('permission')) {
        console.error('Insufficient permissions, please check file permissions');
      } else if (error.message.includes('space')) {
        console.error('Insufficient disk space');
      } else if (error.message.includes('lock')) {
        console.error('File is locked, please try again later');
      }
      
      return null;
    }
  }
  
  async safeTransaction(file: FSStoreFile, operations: Function[]): Promise<boolean> {
    try {
      await file.transaction(async () => {
        for (const operation of operations) {
          await operation();
        }
      });
      return true;
    } catch (error) {
      console.error('Transaction failed:', error.message);
      return false;
    }
  }
}
```

### Debugging and Monitoring

```typescript
import { FSStoreServer, FSStoreClient } from '@testring/fs-store';

class DebuggableFileStore {
  private server: FSStoreServer;
  private client: FSStoreClient;
  private operationLog: Array<{
    timestamp: number;
    operation: string;
    details: any;
  }> = [];
  
  constructor() {
    this.server = new FSStoreServer(10, 'debug-fs');
    this.client = new FSStoreClient('debug-fs');
    
    this.setupDebugging();
  }
  
  private setupDebugging() {
    // Monitor server status
    setInterval(() => {
      const fileList = this.server.getNameList();
      const serverState = this.server.getState();
      
      console.log('Server status:', {
        state: serverState,
        managedFiles: fileList.length,
        files: fileList
      });
    }, 5000);
  }
  
  async createDebugFile(meta: any): Promise<FSStoreFile> {
    const startTime = Date.now();
    
    const file = new FSStoreFile({
      meta,
      fsOptions: { encoding: 'utf8' }
    });
    
    const endTime = Date.now();
    
    this.operationLog.push({
      timestamp: startTime,
      operation: 'createFile',
      details: {
        meta,
        duration: endTime - startTime,
        filePath: file.getFullPath()
      }
    });
    
    return file;
  }
  
  getOperationLog() {
    return this.operationLog;
  }
}
```

## Performance Optimization

### File Operation Batching

```typescript
class BatchFileOperations {
  private operations: Array<() => Promise<void>> = [];
  private batchSize = 10;
  
  addOperation(operation: () => Promise<void>) {
    this.operations.push(operation);
    
    if (this.operations.length >= this.batchSize) {
      this.executeBatch();
    }
  }
  
  async executeBatch() {
    const batch = this.operations.splice(0, this.batchSize);
    
    // Execute batch operations in parallel
    await Promise.all(batch.map(operation => operation()));
  }
  
  async executeAll() {
    while (this.operations.length > 0) {
      await this.executeBatch();
    }
  }
}

// Use batching
const batchOps = new BatchFileOperations();

// Add multiple file operations
for (let i = 0; i < 100; i++) {
  batchOps.addOperation(async () => {
    const file = FSTextFileFactory.create({ ext: 'txt' });
    await file.write(Buffer.from(`File ${i} content`));
  });
}

// Execute remaining operations
await batchOps.executeAll();
```

### File Caching Strategy

```typescript
class CachedFileStore {
  private cache = new Map<string, Buffer>();
  private cacheMaxSize = 50; // Maximum cached files
  
  async readWithCache(filePath: string): Promise<Buffer> {
    // Check cache
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath)!;
    }
    
    // Read from file system
    const file = new FSStoreFile({
      meta: { fileName: path.basename(filePath) },
      fsOptions: { encoding: 'utf8' }
    });
    
    const content = await file.read();
    
    // Update cache
    this.updateCache(filePath, content);
    
    return content;
  }
  
  private updateCache(filePath: string, content: Buffer) {
    // If cache is full, remove oldest item
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(filePath, content);
  }
  
  clearCache() {
    this.cache.clear();
  }
}
```

## Best Practices

### 1. File Lifecycle Management
- Always release file resources after completing operations
- Use transactions to ensure atomicity of complex operations
- Regularly clean up files that are no longer needed

### 2. Concurrency Control
- Set server thread count appropriately
- Use file locks to avoid concurrent write conflicts
- Use unified naming strategies in multi-process environments

### 3. Error Handling
- Implement comprehensive error handling and retry mechanisms
- Monitor file operation performance and success rates
- Record detailed operation logs for debugging

### 4. Performance Optimization
- Use batching to reduce frequent file operations
- Implement file content caching mechanisms
- Avoid unnecessary file locking

### 5. Resource Management
- Regularly clean up temporary files
- Monitor disk usage
- Implement file size limits and cleanup strategies

## Troubleshooting

### Common Issues

#### File Lock Conflicts
```bash
Error: impossible to lock
```
Solution: Check if other processes are using the file, wait or force release the lock.

#### Insufficient Permissions
```bash
Error: no access
```
Solution: Check file permissions, ensure the process has read/write permissions.

#### File Does Not Exist
```bash
Error: NOEXIST
```
Solution: Confirm the file path is correct, check if the file has been deleted.

#### Server Not Initialized
```bash
Error: Server not initialized
```
Solution: Ensure FSStoreServer has been properly initialized and started.

### Debugging Tips

```typescript
// Enable detailed logging
process.env.DEBUG = 'testring:fs-store';

// Create debug version of file storage
const debugServer = new FSStoreServer(5, 'debug-fs');
const debugClient = new FSStoreClient('debug-fs');

// Monitor file operations
debugServer.getHook('ON_RELEASE')?.readHook('debug', (context) => {
  console.log('File operation completed:', context);
});
```

## Dependencies

- `@testring/transport` - Inter-process communication
- `@testring/logger` - Logging functionality
- `@testring/pluggable-module` - Plugin system
- `@testring/types` - Type definitions
- `@testring/utils` - Utility functions

## Related Modules

- `@testring/plugin-fs-store` - File storage plugin
- `@testring/test-utils` - Testing utilities
- `@testring/cli-config` - Configuration management

## License

MIT License