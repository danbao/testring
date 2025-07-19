# @testring/fs-reader

File system reader module that provides test file finding, reading, and parsing functionality.

## Overview

This module handles file system operations for test files, including:
- Finding test files based on glob patterns
- Reading and parsing test file content
- Supporting plugin-based file processing
- Providing file caching and optimization

## Main Components

### FSReader
Main file system reader class:

```typescript
export class FSReader extends PluggableModule implements IFSReader {
  // Find files based on pattern
  find(pattern: string): Promise<IFile[]>

  // Read single file
  readFile(fileName: string): Promise<IFile | null>
}
```

### File Interface
```typescript
interface IFile {
  path: string;           // File path
  content: string;        // File content
  dependencies?: string[]; // Dependency files
}
```

## Main Features

### File Finding
Find test files using glob patterns:

```typescript
import { FSReader } from '@testring/fs-reader';

const fsReader = new FSReader();

// Find all test files
const files = await fsReader.find('./tests/**/*.spec.js');
console.log('Found test files:', files.map(f => f.path));

// Support complex glob patterns
const unitTests = await fsReader.find('./src/**/*.{test,spec}.{js,ts}');
```

### File Reading
Read content of individual files:

```typescript
import { FSReader } from '@testring/fs-reader';

const fsReader = new FSReader();

// Read specific file
const file = await fsReader.readFile('./tests/login.spec.js');
if (file) {
  console.log('File path:', file.path);
  console.log('File content:', file.content);
}
```

## Supported File Formats

### JavaScript Files
```javascript
// tests/example.spec.js
describe('Example Test', () => {
  it('should pass the test', () => {
    expect(true).toBe(true);
  });
});
```

### TypeScript Files
```typescript
// tests/example.spec.ts
describe('Example Test', () => {
  it('should pass the test', () => {
    expect(true).toBe(true);
  });
});
```

### Modular Tests
```javascript
// tests/modular.spec.js
import { helper } from './helper';

describe('Modular Test', () => {
  it('uses helper functions', () => {
    expect(helper.add(1, 2)).toBe(3);
  });
});
```

## Plugin Support

FSReader supports plugins to extend file processing functionality:

### Plugin Hooks
- `beforeResolve` - Pre-file resolution processing
- `afterResolve` - Post-file resolution processing

### Custom File Processing Plugin
```typescript
export default (pluginAPI) => {
  const fsReader = pluginAPI.getFSReader();
  
  if (fsReader) {
    // Pre-file resolution processing
    fsReader.beforeResolve((files) => {
      // Filter out certain files
      return files.filter(file => !file.path.includes('skip'));
    });
    
    // Post-file resolution processing
    fsReader.afterResolve((files) => {
      // Add additional file information
      return files.map(file => ({
        ...file,
        lastModified: fs.statSync(file.path).mtime
      }));
    });
  }
};
```

## Glob Pattern Support

### Basic Patterns
```typescript
// Match all .js files
await fsReader.find('**/*.js');

// Match specific directory
await fsReader.find('./tests/**/*.spec.js');

// Match multiple file types
await fsReader.find('**/*.{js,ts}');
```

### Advanced Patterns
```typescript
// Exclude certain files
await fsReader.find('**/*.spec.js', { ignore: ['**/node_modules/**'] });

// Match specific naming patterns
await fsReader.find('**/*.{test,spec}.{js,ts}');

// Depth limitation
await fsReader.find('**/!(node_modules)/**/*.spec.js');
```

## File Parsing

### Dependency Resolution
Automatically resolve file dependencies:

```typescript
// Main test file
import { helper } from './helper';
import { config } from '../config';

// FSReader will automatically identify dependencies
const files = await fsReader.find('./tests/**/*.spec.js');
// Results include dependency information
// file.dependencies = ['./helper.js', '../config.js']
```

### Content Parsing
Parse file content and extract information:

```typescript
const file = await fsReader.readFile('./tests/example.spec.js');
// file.content contains complete file content
// Can further parse AST or extract test case information
```

## Performance Optimization

### File Caching
- Automatically cache read files
- Monitor file changes, automatically update cache
- Reduce repeated file system access

### Parallel Processing
- Read multiple files in parallel
- Asynchronously process file content
- Optimize performance for large numbers of files

### Memory Management
- Intelligent memory usage
- Timely release of unnecessary file content
- Support for large project file processing

## Error Handling

### File Not Found
```typescript
try {
  const files = await fsReader.find('./nonexistent/**/*.js');
} catch (error) {
  console.error('No matching files found:', error.message);
}
```

### File Read Error
```typescript
const file = await fsReader.readFile('./protected-file.js');
if (!file) {
  console.log('File read failed or file does not exist');
}
```

### Permission Issues
```typescript
try {
  await fsReader.find('./protected-dir/**/*.js');
} catch (error) {
  if (error.code === 'EACCES') {
    console.error('No permission to access file');
  }
}
```

## Configuration Options

### Find Options
```typescript
interface FindOptions {
  ignore?: string[];      // File patterns to ignore
  absolute?: boolean;     // Return absolute paths
  maxDepth?: number;      // Maximum search depth
}
```

### Read Options
```typescript
interface ReadOptions {
  encoding?: string;      // File encoding
  cache?: boolean;        // Whether to use cache
}
```

## Usage Examples

### Basic Usage
```typescript
import { FSReader } from '@testring/fs-reader';

const fsReader = new FSReader();

// Find all test files
const testFiles = await fsReader.find('./tests/**/*.spec.js');

// Process each file
for (const file of testFiles) {
  console.log(`Processing file: ${file.path}`);
  // Execute tests or other processing
}
```

### Integration with Other Modules
```typescript
import { FSReader } from '@testring/fs-reader';
import { TestRunner } from '@testring/test-runner';

const fsReader = new FSReader();
const testRunner = new TestRunner();

// Find and execute tests
const files = await fsReader.find('./tests/**/*.spec.js');
for (const file of files) {
  await testRunner.execute(file);
}
```

## Installation

```bash
npm install @testring/fs-reader
```

## Dependencies

- `@testring/pluggable-module` - Plugin support
- `@testring/logger` - Logging
- `@testring/types` - Type definitions
- `glob` - File pattern matching

## Related Modules

- `@testring/test-run-controller` - Test run controller
- `@testring/dependencies-builder` - Dependency builder
- `@testring/plugin-api` - Plugin API