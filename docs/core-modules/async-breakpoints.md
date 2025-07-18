# @testring/async-breakpoints

Asynchronous breakpoint system module that provides pause point control and debugging functionality during test execution.

## Overview

This module provides an event-based asynchronous breakpoint system for:
- Setting pause points during test execution
- Controlling test flow execution timing
- Supporting debugging and test coordination
- Providing breakpoint control before and after instructions

## Main Components

### AsyncBreakpoints
The main breakpoint management class that extends EventEmitter:

```typescript
export class AsyncBreakpoints extends EventEmitter {
  // Before instruction breakpoints
  addBeforeInstructionBreakpoint(): void
  waitBeforeInstructionBreakpoint(callback?: HasBreakpointCallback): Promise<void>
  resolveBeforeInstructionBreakpoint(): void
  isBeforeInstructionBreakpointActive(): boolean
  
  // After instruction breakpoints
  addAfterInstructionBreakpoint(): void
  waitAfterInstructionBreakpoint(callback?: HasBreakpointCallback): Promise<void>
  resolveAfterInstructionBreakpoint(): void
  isAfterInstructionBreakpointActive(): boolean
  
  // Breakpoint control
  breakStack(): void  // Break all breakpoints
}
```

### BreakStackError
Breakpoint break error class for handling forced breakpoint interruptions:

```typescript
export class BreakStackError extends Error {
  constructor(message: string)
}
```

## Breakpoint Types

### BreakpointsTypes
```typescript
export enum BreakpointsTypes {
  beforeInstruction = 'beforeInstruction',  // Before instruction breakpoint
  afterInstruction = 'afterInstruction'     // After instruction breakpoint
}
```

### BreakpointEvents
```typescript
export enum BreakpointEvents {
  resolverEvent = 'resolveEvent',    // Breakpoint resolution event
  breakStackEvent = 'breakStack'     // Breakpoint break event
}
```

## Usage

### Basic Usage
```typescript
import { AsyncBreakpoints } from '@testring/async-breakpoints';

const breakpoints = new AsyncBreakpoints();

// Set before-instruction breakpoint
breakpoints.addBeforeInstructionBreakpoint();

// Wait for breakpoint
await breakpoints.waitBeforeInstructionBreakpoint();

// Resolve breakpoint elsewhere
breakpoints.resolveBeforeInstructionBreakpoint();
```

### Using Default Instance
```typescript
import { asyncBreakpoints } from '@testring/async-breakpoints';

// Use global default instance
asyncBreakpoints.addBeforeInstructionBreakpoint();
await asyncBreakpoints.waitBeforeInstructionBreakpoint();
asyncBreakpoints.resolveBeforeInstructionBreakpoint();
```

### Before-Instruction Breakpoints
```typescript
import { asyncBreakpoints } from '@testring/async-breakpoints';

// Set before-instruction breakpoint
asyncBreakpoints.addBeforeInstructionBreakpoint();

// Check breakpoint status
if (asyncBreakpoints.isBeforeInstructionBreakpointActive()) {
  console.log('Before-instruction breakpoint activated');
}

// Wait for breakpoint (blocks until breakpoint is resolved)
await asyncBreakpoints.waitBeforeInstructionBreakpoint();

// Resolve breakpoint (usually in another execution flow)
asyncBreakpoints.resolveBeforeInstructionBreakpoint();
```

### After-Instruction Breakpoints
```typescript
import { asyncBreakpoints } from '@testring/async-breakpoints';

// Set after-instruction breakpoint
asyncBreakpoints.addAfterInstructionBreakpoint();

// Wait for breakpoint
await asyncBreakpoints.waitAfterInstructionBreakpoint();

// Resolve breakpoint
asyncBreakpoints.resolveAfterInstructionBreakpoint();
```

### Breakpoint Callbacks
```typescript
import { asyncBreakpoints } from '@testring/async-breakpoints';

asyncBreakpoints.addBeforeInstructionBreakpoint();

// Wait for breakpoint with callback
await asyncBreakpoints.waitBeforeInstructionBreakpoint(async (hasBreakpoint) => {
  if (hasBreakpoint) {
    console.log('Breakpoint set, waiting for resolution...');
  } else {
    console.log('No breakpoint, continuing execution');
  }
});
```

## Breakpoint Control

### Interrupting Breakpoints
```typescript
import { asyncBreakpoints, BreakStackError } from '@testring/async-breakpoints';

asyncBreakpoints.addBeforeInstructionBreakpoint();

// Wait for breakpoint
asyncBreakpoints.waitBeforeInstructionBreakpoint()
  .catch((error) => {
    if (error instanceof BreakStackError) {
      console.log('Breakpoint interrupted');
    }
  });

// Interrupt all breakpoints
asyncBreakpoints.breakStack();
```

### Concurrent Breakpoint Handling
```typescript
import { asyncBreakpoints } from '@testring/async-breakpoints';

// Set multiple breakpoints simultaneously
asyncBreakpoints.addBeforeInstructionBreakpoint();
asyncBreakpoints.addAfterInstructionBreakpoint();

// Concurrent waiting
const promises = Promise.all([
  asyncBreakpoints.waitBeforeInstructionBreakpoint(),
  asyncBreakpoints.waitAfterInstructionBreakpoint()
]);

// Resolve breakpoints in sequence
setTimeout(() => {
  asyncBreakpoints.resolveBeforeInstructionBreakpoint();
  asyncBreakpoints.resolveAfterInstructionBreakpoint();
}, 1000);

await promises;
```

## Real-World Application Scenarios

### Test Coordination
```typescript
import { asyncBreakpoints } from '@testring/async-breakpoints';

// Set breakpoint before test execution
asyncBreakpoints.addBeforeInstructionBreakpoint();

// Test execution flow
async function runTest() {
  console.log('Preparing to execute test');
  
  // Wait for breakpoint resolution
  await asyncBreakpoints.waitBeforeInstructionBreakpoint();
  
  console.log('Starting test execution');
  // Actual test logic
}

// Control flow
async function controlFlow() {
  setTimeout(() => {
    console.log('Resolving breakpoint, allowing test to continue');
    asyncBreakpoints.resolveBeforeInstructionBreakpoint();
  }, 2000);
}

// Concurrent execution
Promise.all([runTest(), controlFlow()]);
```

### Debug Support
```typescript
import { asyncBreakpoints } from '@testring/async-breakpoints';

// Breakpoints in debug mode
if (process.env.DEBUG_MODE) {
  asyncBreakpoints.addBeforeInstructionBreakpoint();
  
  // Wait for user input or debugger connection
  await asyncBreakpoints.waitBeforeInstructionBreakpoint(async (hasBreakpoint) => {
    if (hasBreakpoint) {
      console.log('Debug breakpoint activated, waiting for debugger...');
    }
  });
}
```

### Multi-Process Synchronization
```typescript
import { asyncBreakpoints } from '@testring/async-breakpoints';

// Set breakpoint in child process
asyncBreakpoints.addAfterInstructionBreakpoint();

// Perform some operations
performSomeOperation();

// Wait for main process signal
await asyncBreakpoints.waitAfterInstructionBreakpoint();

// Continue execution
continueExecution();
```

## Error Handling

### BreakStackError Handling
```typescript
import { asyncBreakpoints, BreakStackError } from '@testring/async-breakpoints';

try {
  asyncBreakpoints.addBeforeInstructionBreakpoint();
  await asyncBreakpoints.waitBeforeInstructionBreakpoint();
} catch (error) {
  if (error instanceof BreakStackError) {
    console.log('Breakpoint forcibly interrupted:', error.message);
    // Handle interruption logic
  } else {
    console.error('Other error:', error);
  }
}
```

### Timeout Handling
```typescript
import { asyncBreakpoints } from '@testring/async-breakpoints';

asyncBreakpoints.addBeforeInstructionBreakpoint();

// Set timeout
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Breakpoint timeout')), 5000);
});

try {
  await Promise.race([
    asyncBreakpoints.waitBeforeInstructionBreakpoint(),
    timeoutPromise
  ]);
} catch (error) {
  console.log('Breakpoint handling failed:', error.message);
  // Force interrupt breakpoint
  asyncBreakpoints.breakStack();
}
```

## Event Listening

### Custom Event Handling
```typescript
import { asyncBreakpoints, BreakpointEvents } from '@testring/async-breakpoints';

// Listen for breakpoint resolution events
asyncBreakpoints.on(BreakpointEvents.resolverEvent, (type) => {
  console.log(`Breakpoint type ${type} resolved`);
});

// Listen for breakpoint interruption events
asyncBreakpoints.on(BreakpointEvents.breakStackEvent, () => {
  console.log('Breakpoint stack interrupted');
});
```

## Best Practices

### 1. Breakpoint Lifecycle Management
```typescript
// Ensure breakpoints are properly cleaned up
try {
  asyncBreakpoints.addBeforeInstructionBreakpoint();
  await asyncBreakpoints.waitBeforeInstructionBreakpoint();
} finally {
  // Ensure breakpoints are cleaned up
  if (asyncBreakpoints.isBeforeInstructionBreakpointActive()) {
    asyncBreakpoints.resolveBeforeInstructionBreakpoint();
  }
}
```

### 2. Avoid Deadlocks
```typescript
// Use timeouts to avoid infinite waiting
const waitWithTimeout = (breakpointPromise, timeout = 5000) => {
  return Promise.race([
    breakpointPromise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Breakpoint timeout')), timeout)
    )
  ]);
};
```

### 3. Debug Information
```typescript
// Add debug information
const debugBreakpoint = async (name: string) => {
  console.log(`[DEBUG] Setting breakpoint: ${name}`);
  asyncBreakpoints.addBeforeInstructionBreakpoint();
  
  await asyncBreakpoints.waitBeforeInstructionBreakpoint(async (hasBreakpoint) => {
    console.log(`[DEBUG] Breakpoint ${name} status: ${hasBreakpoint ? 'active' : 'inactive'}`);
  });
  
  console.log(`[DEBUG] Breakpoint ${name} resolved`);
};
```

## Installation

```bash
npm install @testring/async-breakpoints
```

## Type Definitions

```typescript
type HasBreakpointCallback = (state: boolean) => Promise<void> | void;

interface AsyncBreakpoints extends EventEmitter {
  addBeforeInstructionBreakpoint(): void;
  waitBeforeInstructionBreakpoint(callback?: HasBreakpointCallback): Promise<void>;
  resolveBeforeInstructionBreakpoint(): void;
  isBeforeInstructionBreakpointActive(): boolean;
  
  addAfterInstructionBreakpoint(): void;
  waitAfterInstructionBreakpoint(callback?: HasBreakpointCallback): Promise<void>;
  resolveAfterInstructionBreakpoint(): void;
  isAfterInstructionBreakpointActive(): boolean;
  
  breakStack(): void;
}
```

## Related Modules

- `@testring/api` - Test API, uses breakpoints for flow control
- `@testring/test-worker` - Test worker processes, uses breakpoints for process synchronization
- `@testring/devtool-backend` - Devtool backend, uses breakpoints for debugging
