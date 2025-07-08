# @testring/child-process

子进程管理模块，提供了跨平台的子进程创建和管理功能，支持 JavaScript 和 TypeScript 文件的直接执行。

## 功能概述

该模块提供了增强的子进程管理功能，包括：
- 支持 JavaScript 和 TypeScript 文件的直接执行
- 跨平台兼容性（Windows、Linux、macOS）
- 调试模式支持
- 进程间通信（IPC）
- 自动端口分配
- 进程状态检测

## 主要功能

### fork
增强的子进程创建函数，支持多种文件类型：

```typescript
export async function fork(
  filePath: string,
  args?: Array<string>,
  options?: Partial<IChildProcessForkOptions>
): Promise<IChildProcessFork>
```

### spawn
基本的子进程启动功能：

```typescript
export function spawn(
  command: string,
  args?: Array<string>
): childProcess.ChildProcess
```

### spawnWithPipes
带管道的子进程启动：

```typescript
export function spawnWithPipes(
  command: string,
  args?: Array<string>
): childProcess.ChildProcess
```

### isChildProcess
检查当前进程是否是子进程：

```typescript
export function isChildProcess(argv?: string[]): boolean
```

## 使用方法

### 基本使用

#### 执行 JavaScript 文件
```typescript
import { fork } from '@testring/child-process';

// 执行 JavaScript 文件
const childProcess = await fork('./worker.js');

childProcess.on('message', (data) => {
  console.log('收到消息:', data);
});

childProcess.send({ type: 'start', data: 'hello' });
```

#### 执行 TypeScript 文件
```typescript
import { fork } from '@testring/child-process';

// 直接执行 TypeScript 文件（自动处理 ts-node）
const childProcess = await fork('./worker.ts');

childProcess.on('message', (data) => {
  console.log('收到消息:', data);
});
```

#### 传递参数
```typescript
import { fork } from '@testring/child-process';

// 传递命令行参数
const childProcess = await fork('./worker.js', ['--mode', 'production']);

// 子进程中访问参数
// process.argv 包含传递的参数
```

### 调试模式

#### 启用调试
```typescript
import { fork } from '@testring/child-process';

// 启用调试模式
const childProcess = await fork('./worker.js', [], {
  debug: true
});

// 访问调试端口
console.log('调试端口:', childProcess.debugPort);
// 可以使用 Chrome DevTools 或 VS Code 连接到此端口
```

#### 自定义调试端口范围
```typescript
import { fork } from '@testring/child-process';

const childProcess = await fork('./worker.js', [], {
  debug: true,
  debugPortRange: [9229, 9230, 9231, 9232]
});
```

### 进程间通信

#### 父进程代码
```typescript
import { fork } from '@testring/child-process';

const childProcess = await fork('./worker.js');

// 发送消息到子进程
childProcess.send({
  type: 'task',
  data: { id: 1, action: 'process' }
});

// 监听子进程消息
childProcess.on('message', (message) => {
  if (message.type === 'result') {
    console.log('任务结果:', message.data);
  }
});

// 监听子进程退出
childProcess.on('exit', (code, signal) => {
  console.log(`子进程退出: code=${code}, signal=${signal}`);
});
```

#### 子进程代码 (worker.js)
```javascript
// 监听父进程消息
process.on('message', (message) => {
  if (message.type === 'task') {
    const result = processTask(message.data);
    
    // 发送结果回父进程
    process.send({
      type: 'result',
      data: result
    });
  }
});

function processTask(data) {
  // 处理任务逻辑
  return { id: data.id, status: 'completed' };
}
```

### 进程状态检测

#### 检查是否为子进程
```typescript
import { isChildProcess } from '@testring/child-process';

if (isChildProcess()) {
  console.log('运行在子进程中');
  // 子进程特定的逻辑
} else {
  console.log('运行在主进程中');
  // 主进程特定的逻辑
}
```

#### 检查特定参数
```typescript
import { isChildProcess } from '@testring/child-process';

// 检查自定义参数
const customArgs = ['--testring-parent-pid=12345'];
if (isChildProcess(customArgs)) {
  console.log('这是 testring 子进程');
}
```

### 使用 spawn 功能

#### 基本 spawn
```typescript
import { spawn } from '@testring/child-process';

// 启动基本子进程
const childProcess = spawn('node', ['--version']);

childProcess.stdout.on('data', (data) => {
  console.log(`输出: ${data}`);
});

childProcess.stderr.on('data', (data) => {
  console.error(`错误: ${data}`);
});
```

#### 带管道的 spawn
```typescript
import { spawnWithPipes } from '@testring/child-process';

// 启动带管道的子进程
const childProcess = spawnWithPipes('node', ['script.js']);

// 向子进程发送数据
childProcess.stdin.write('hello\n');
childProcess.stdin.end();

// 读取输出
childProcess.stdout.on('data', (data) => {
  console.log(`输出: ${data}`);
});
```

## 跨平台支持

### Windows 特殊处理
模块自动处理 Windows 平台的差异：

```typescript
// 在 Windows 上会自动使用 'node' 命令
// 在 Unix 系统上会使用 ts-node 或 node 根据文件类型
const childProcess = await fork('./worker.ts');
```

### TypeScript 支持
自动检测和处理 TypeScript 文件：

```typescript
// .ts 文件会自动使用 ts-node 执行
const tsProcess = await fork('./worker.ts');

// .js 文件使用 node 执行
const jsProcess = await fork('./worker.js');

// 无扩展名文件根据环境自动选择
const process = await fork('./worker');
```

## 配置选项

### IChildProcessForkOptions
```typescript
interface IChildProcessForkOptions {
  debug: boolean;                    // 是否启用调试模式
  debugPortRange: Array<number>;     // 调试端口范围
}
```

### 默认配置
```typescript
const DEFAULT_FORK_OPTIONS = {
  debug: false,
  debugPortRange: [9229, 9222, ...getNumberRange(9230, 9240)]
};
```

## 实际应用场景

### 测试工作进程
```typescript
import { fork } from '@testring/child-process';

// 创建测试工作进程
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
        reject(new Error(`工作进程异常退出: ${code}`));
      }
    });
  });
};

// 使用
const result = await createTestWorker('./my-test.spec.js');
```

### 并行任务处理
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
  
  // 清理工作进程
  workers.forEach(worker => worker.kill());
  
  return results;
};
```

### 调试支持
```typescript
import { fork } from '@testring/child-process';

const createDebugWorker = async (script: string) => {
  const worker = await fork(script, [], {
    debug: true,
    debugPortRange: [9229, 9230, 9231]
  });
  
  console.log(`调试端口: ${worker.debugPort}`);
  console.log(`可以使用以下命令连接调试器:`);
  console.log(`chrome://inspect 或 VS Code 连接到 localhost:${worker.debugPort}`);
  
  return worker;
};
```

## 错误处理

### 进程异常处理
```typescript
import { fork } from '@testring/child-process';

const createRobustWorker = async (script: string) => {
  try {
    const worker = await fork(script);
    
    worker.on('error', (error) => {
      console.error('进程错误:', error);
    });
    
    worker.on('exit', (code, signal) => {
      if (code !== 0) {
        console.error(`进程异常退出: code=${code}, signal=${signal}`);
      }
    });
    
    return worker;
  } catch (error) {
    console.error('创建进程失败:', error);
    throw error;
  }
};
```

### 超时处理
```typescript
import { fork } from '@testring/child-process';

const createWorkerWithTimeout = async (script: string, timeout: number) => {
  const worker = await fork(script);
  
  const timeoutId = setTimeout(() => {
    console.log('进程超时，强制终止');
    worker.kill('SIGTERM');
  }, timeout);
  
  worker.on('exit', () => {
    clearTimeout(timeoutId);
  });
  
  return worker;
};
```

## 性能优化

### 进程池管理
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
    
    // 重用现有工作进程
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

### 内存管理
```typescript
import { fork } from '@testring/child-process';

const createManagedWorker = async (script: string) => {
  const worker = await fork(script);
  
  // 监控内存使用
  const memoryCheck = setInterval(() => {
    const usage = process.memoryUsage();
    if (usage.heapUsed > 100 * 1024 * 1024) { // 100MB
      console.warn('内存使用过高，考虑重启进程');
    }
  }, 5000);
  
  worker.on('exit', () => {
    clearInterval(memoryCheck);
  });
  
  return worker;
};
```

## 最佳实践

### 1. 进程生命周期管理
```typescript
// 确保进程正确清理
process.on('exit', () => {
  // 清理所有子进程
  workers.forEach(worker => worker.kill());
});

process.on('SIGTERM', () => {
  // 优雅关闭
  workers.forEach(worker => worker.kill('SIGTERM'));
});
```

### 2. 错误边界
```typescript
// 使用错误边界保护主进程
const safeExecute = async (script: string, data: any) => {
  try {
    const worker = await fork(script);
    
    return await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.kill();
        reject(new Error('执行超时'));
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
    console.error('执行失败:', error);
    throw error;
  }
};
```

### 3. 调试友好
```typescript
// 开发模式下启用调试
const isDevelopment = process.env.NODE_ENV === 'development';

const worker = await fork('./worker.js', [], {
  debug: isDevelopment
});

if (isDevelopment && worker.debugPort) {
  console.log(`🐛 调试端口: ${worker.debugPort}`);
}
```

## 安装

```bash
npm install @testring/child-process
```

## 依赖

- `@testring/utils` - 工具函数（端口检测等）
- `@testring/types` - 类型定义

## 相关模块

- `@testring/test-worker` - 测试工作进程管理
- `@testring/transport` - 进程间通信
- `@testring/utils` - 实用工具函数