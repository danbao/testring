# @testring/child-process

Child process management module that provides cross-platform child process creation and management capabilities, supporting direct execution of JavaScript and TypeScript files.

## Overview

This module provides enhanced child process management features, including:
- Support for direct execution of JavaScript and TypeScript files
- Cross-platform compatibility (Windows, Linux, macOS)
- Debug mode support
- Inter-process communication (IPC)
- Automatic port allocation
- Process state detection

## Main Features

### fork
Enhanced child process creation function supporting multiple file types:

```typescript
export async function fork(
  filePath: string,
  args?: Array<string>,
  options?: Partial<IChildProcessForkOptions>
): Promise<IChildProcessFork>
```

### spawn
Basic child process launch functionality:

```typescript
export function spawn(
  command: string,
  args?: Array<string>
): childProcess.ChildProcess
```

### spawnWithPipes
Child process launch with pipes:

```typescript
export function spawnWithPipes(
  command: string,
  args?: Array<string>
): childProcess.ChildProcess
```

### isChildProcess
Check if the current process is a child process:

```typescript
export function isChildProcess(argv?: string[]): boolean
```

## Usage

### Basic Usage

#### Execute JavaScript Files
```typescript
import { fork } from '@testring/child-process';

// Execute JavaScript file
const childProcess = await fork('./worker.js');

childProcess.on('message', (data) => {
  console.log('Received message:', data);
});

childProcess.send({ type: 'start', data: 'hello' });
```

#### Execute TypeScript Files
```typescript
import { fork } from '@testring/child-process';

// Directly execute TypeScript file (automatically handles ts-node)
const childProcess = await fork('./worker.ts');

childProcess.on('message', (data) => {
  console.log('Received message:', data);
});
```

#### Pass Arguments
```typescript
import { fork } from '@testring/child-process';

// Pass command line arguments
const childProcess = await fork('./worker.js', ['--mode', 'production']);

// Access arguments in child process
// process.argv contains the passed arguments
```

### Debug Mode

#### Enable Debugging
```typescript
import { fork } from '@testring/child-process';

// Enable debug mode
const childProcess = await fork('./worker.js', [], {
  debug: true
});

// Access debug port
console.log('Debug port:', childProcess.debugPort);
// You can use Chrome DevTools or VS Code to connect to this port
```

#### Custom Debug Port Range
```typescript
import { fork } from '@testring/child-process';

const childProcess = await fork('./worker.js', [], {
  debug: true,
  debugPortRange: [9229, 9230, 9231, 9232]
});
```

### Inter-Process Communication

#### Parent Process Code
```typescript
import { fork } from '@testring/child-process';

const childProcess = await fork('./worker.js');

// Send message to child process
childProcess.send({
  type: 'task',
  data: { id: 1, action: 'process' }
});

// Listen for child process messages
childProcess.on('message', (message) => {
  if (message.type === 'result') {
    console.log('Task result:', message.data);
  }
});

// Listen for child process exit
childProcess.on('exit', (code, signal) => {
  console.log(`Child process exited: code=${code}, signal=${signal}`);
});
```

#### Child Process Code (worker.js)
```javascript
// Listen for parent process messages
process.on('message', (message) => {
  if (message.type === 'task') {
    const result = processTask(message.data);
    
    // Send result back to parent process
    process.send({
      type: 'result',
      data: result
    });
  }
});

function processTask(data) {
  // Process task logic
  return { id: data.id, status: 'completed' };
}
```

### Process State Detection

#### Check if Running in Child Process
```typescript
import { isChildProcess } from '@testring/child-process';

if (isChildProcess()) {
  console.log('Running in child process');
  // Child process specific logic
} else {
  console.log('Running in main process');
  // Main process specific logic
}
```

#### Check Specific Parameters
```typescript
import { isChildProcess } from '@testring/child-process';

// Check custom parameters
const customArgs = ['--testring-parent-pid=12345'];
if (isChildProcess(customArgs)) {
  console.log('This is a testring child process');
}
```

### Using spawn Functionality

#### Basic spawn
```typescript
import { spawn } from '@testring/child-process';

// Start basic child process
const childProcess = spawn('node', ['--version']);

childProcess.stdout.on('data', (data) => {
  console.log(`Output: ${data}`);
});

childProcess.stderr.on('data', (data) => {
  console.error(`Error: ${data}`);
});
```

#### spawn with Pipes
```typescript
import { spawnWithPipes } from '@testring/child-process';

// Start child process with pipes
const childProcess = spawnWithPipes('node', ['script.js']);

// Send data to child process
childProcess.stdin.write('hello\n');
childProcess.stdin.end();

// Read output
childProcess.stdout.on('data', (data) => {
  console.log(`Output: ${data}`);
});
```

## Cross-Platform Support

### Windows Special Handling
The module automatically handles Windows platform differences:

```typescript
// On Windows, 'node' command will be used automatically
// On Unix systems, ts-node or node will be used based on file type
const childProcess = await fork('./worker.ts');
```

### TypeScript Support
Automatically detect and handle TypeScript files:

```typescript
// .ts files will automatically use ts-node for execution
const tsProcess = await fork('./worker.ts');

// .js files use node for execution
const jsProcess = await fork('./worker.js');

// Files without extension are automatically selected based on environment
const process = await fork('./worker');
```

## Configuration Options

### IChildProcessForkOptions
```typescript
interface IChildProcessForkOptions {
  debug: boolean;                    // Whether to enable debug mode
  debugPortRange: Array<number>;     // Debug port range
}
```

### Default Configuration
```typescript
const DEFAULT_FORK_OPTIONS = {
  debug: false,
  debugPortRange: [9229, 9222, ...getNumberRange(9230, 9240)]
};
```

## Real-World Application Scenarios

### Test Worker Process
```typescript
import { fork } from '@testring/child-process';

// Create test worker process
const createTestWorker = async (testFile: string) => {
  const worker = await fork('./test-runner.js', [testFile]);
  
  return new Promise((resolve, reject) => {
    worker.on('message', (message) => {
      if (message.type === 'test-result') {
        resolve(message.data);
      } else if (message.type === 'test-error') {
        reject(new Error(message.error));
      }
    });
    
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker process exited abnormally: ${code}`));
      }
    });
  });
};

// Usage
const result = await createTestWorker('./my-test.spec.js');
```

### Parallel Task Processing
```typescript
import { fork } from '@testring/child-process';

const processTasks = async (tasks: any[]) => {
  const workers = await Promise.all(
    tasks.map(task => fork('./task-worker.js'))
  );
  
  const results = await Promise.all(
    workers.map((worker, index) => {
      return new Promise((resolve) => {
        worker.on('message', (result) => {
          resolve(result);
        });
        
        worker.send(tasks[index]);
      });
    })
  );
  
  // Clean up worker processes
  workers.forEach(worker => worker.kill());
  
  return results;
};
```

### Debug Support
```typescript
import { fork } from '@testring/child-process';

const createDebugWorker = async (script: string) => {
  const worker = await fork(script, [], {
    debug: true,
    debugPortRange: [9229, 9230, 9231]
  });
  
  console.log(`Debug port: ${worker.debugPort}`);
  console.log(`You can use the following commands to connect the debugger:`);
  console.log(`chrome://inspect or VS Code connect to localhost:${worker.debugPort}`);
  
  return worker;
};
```

## Error Handling

### Process Exception Handling
```typescript
import { fork } from '@testring/child-process';

const createRobustWorker = async (script: string) => {
  try {
    const worker = await fork(script);
    
    worker.on('error', (error) => {
      console.error('Process error:', error);
    });
    
    worker.on('exit', (code, signal) => {
      if (code !== 0) {
        console.error(`Process exited abnormally: code=${code}, signal=${signal}`);
      }
    });
    
    return worker;
  } catch (error) {
    console.error('Failed to create process:', error);
    throw error;
  }
};
```

### Timeout Handling
```typescript
import { fork } from '@testring/child-process';

const createWorkerWithTimeout = async (script: string, timeout: number) => {
  const worker = await fork(script);
  
  const timeoutId = setTimeout(() => {
    console.log('Process timeout, force termination');
    worker.kill('SIGTERM');
  }, timeout);
  
  worker.on('exit', () => {
    clearTimeout(timeoutId);
  });
  
  return worker;
};
```

## Performance Optimization

### Process Pool Management
```typescript
import { fork } from '@testring/child-process';

class WorkerPool {
  private workers: any[] = [];
  private maxWorkers: number;
  
  constructor(maxWorkers: number = 4) {
    this.maxWorkers = maxWorkers;
  }
  
  async getWorker(script: string) {
    if (this.workers.length < this.maxWorkers) {
      const worker = await fork(script);
      this.workers.push(worker);
      return worker;
    }
    
    // Reuse existing worker process
    return this.workers[this.workers.length - 1];
  }
  
  async cleanup() {
    await Promise.all(
      this.workers.map(worker => 
        new Promise(resolve => {
          worker.on('exit', resolve);
          worker.kill();
        })
      )
    );
    this.workers = [];
  }
}
```

### Memory Management
```typescript
import { fork } from '@testring/child-process';

const createManagedWorker = async (script: string) => {
  const worker = await fork(script);
  
  // Monitor memory usage
  const memoryCheck = setInterval(() => {
    const usage = process.memoryUsage();
    if (usage.heapUsed > 100 * 1024 * 1024) { // 100MB
      console.warn('Memory usage too high, consider restarting process');
    }
  }, 5000);
  
  worker.on('exit', () => {
    clearInterval(memoryCheck);
  });
  
  return worker;
};
```

## Best Practices

### 1. Process Lifecycle Management
```typescript
// Ensure processes are properly cleaned up
process.on('exit', () => {
  // Clean up all child processes
  workers.forEach(worker => worker.kill());
});

process.on('SIGTERM', () => {
  // Graceful shutdown
  workers.forEach(worker => worker.kill('SIGTERM'));
});
```

### 2. Error Boundaries
```typescript
// Use error boundaries to protect main process
const safeExecute = async (script: string, data: any) => {
  try {
    const worker = await fork(script);
    
    return await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.kill();
        reject(new Error('Execution timeout'));
      }, 30000);
      
      worker.on('message', (result) => {
        clearTimeout(timeout);
        resolve(result);
      });
      
      worker.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      
      worker.send(data);
    });
  } catch (error) {
    console.error('Execution failed:', error);
    throw error;
  }
};
```

### 3. Debug-Friendly
```typescript
// Enable debugging in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

const worker = await fork('./worker.js', [], {
  debug: isDevelopment
});

if (isDevelopment && worker.debugPort) {
  console.log(`🐛 Debug port: ${worker.debugPort}`);
}
```

## Installation

```bash
npm install @testring/child-process
```

## Dependencies

- `@testring/utils` - Utility functions (port detection, etc.)
- `@testring/types` - Type definitions

## Related Modules

- `@testring/test-worker` - Test worker process management
- `@testring/transport` - Inter-process communication
- `@testring/utils` - Utility functions