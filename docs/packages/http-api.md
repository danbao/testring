# @testring/http-api

HTTP API testing module that serves as the core network request layer for the testring framework, providing comprehensive HTTP/HTTPS interface testing capabilities. This module encapsulates rich HTTP operation methods, cookie management, request queuing, and error handling mechanisms, making it the essential component for API automation testing.

[![npm version](https://badge.fury.io/js/@testring/http-api.svg)](https://www.npmjs.com/package/@testring/http-api)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Overview

The HTTP API testing module is the network request core of the testring framework, providing:

- **Complete HTTP method support** (GET, POST, PUT, DELETE, etc.) with full REST API capabilities
- **Intelligent request queuing and throttling** for controlled API testing
- **Cookie session management** with automatic handling and persistence
- **Request/response interceptors** for preprocessing and postprocessing
- **Error handling and retry mechanisms** for robust API testing
- **Request parameter validation** and automatic formatting
- **Flexible response handling** with full response or body-only options
- **Transport layer integration** for distributed testing environments

## Key Features

### 🌐 HTTP Request Support
- All standard HTTP methods with comprehensive options
- Automatic request parameter validation and formatting
- Flexible request configuration with headers, body, and query parameters
- Complete request/response lifecycle management

### 🍪 Cookie Management
- Automatic cookie storage and transmission across requests
- Cross-request cookie session persistence
- Manual cookie manipulation support
- URL-based cookie scope management with domain handling

### 📋 Request Queuing
- Intelligent request queuing mechanism for controlled execution
- Configurable request throttling to prevent server overload
- Concurrent request management with customizable limits
- Queue status monitoring and debugging capabilities

### 🔄 Transport Layer Integration
- Built on testring's transport layer architecture
- Inter-process message communication support
- Unified message broadcasting mechanism
- Detailed request logging and monitoring

## Installation

```bash
# Using npm
npm install @testring/http-api

# Using yarn
yarn add @testring/http-api

# Using pnpm
pnpm add @testring/http-api
```

## Core Architecture

### HttpClient Class

The main HTTP client interface, extending `AbstractHttpClient`:

```typescript
class HttpClient extends AbstractHttpClient {
  constructor(
    transport: ITransport,
    params?: Partial<HttpClientParams>
  )

  // HTTP Methods
  public get(options: IHttpRequest, cookieJar?: IHttpCookieJar): Promise<any>
  public post(options: IHttpRequest, cookieJar?: IHttpCookieJar): Promise<any>
  public put(options: IHttpRequest, cookieJar?: IHttpCookieJar): Promise<any>
  public delete(options: IHttpRequest, cookieJar?: IHttpCookieJar): Promise<any>
  public send(options: IHttpRequest, cookieJar?: IHttpCookieJar): Promise<any>

  // Cookie Management
  public createCookieJar(): IHttpCookieJar
}
```

### Configuration Options

```typescript
interface HttpClientParams {
  httpThrottle: number;  // Request throttling interval (milliseconds)
}

interface IHttpRequest {
  url: string;                    // Request URL
  method?: string;                // HTTP method
  headers?: Record<string, any>;  // Request headers
  body?: any;                     // Request body
  json?: boolean;                 // JSON format flag
  form?: Record<string, any>;     // Form data
  qs?: Record<string, any>;       // Query parameters
  timeout?: number;               // Timeout duration
  resolveWithFullResponse?: boolean;  // Return full response
  simple?: boolean;               // Simple mode
  cookies?: string[];             // Cookie list
}
```

### Cookie Management

```typescript
interface IHttpCookieJar {
  setCookie(cookie: string | Cookie, url: string): void;
  getCookies(url: string): Cookie[];
  createCookie(options: CookieOptions): Cookie;
}

interface CookieOptions {
  key: string;
  value: string;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  maxAge?: number;
}
```

## Basic Usage

### Creating HTTP Client

```typescript
import { HttpClient } from '@testring/http-api';
import { transport } from '@testring/transport';

// Create HTTP client instance
const httpClient = new HttpClient(transport, {
  httpThrottle: 100  // Request interval 100ms
});

// Create cookie session
const cookieJar = httpClient.createCookieJar();
```

### GET Requests

```typescript
// Simple GET request
const response = await httpClient.get({
  url: 'https://api.example.com/users'
});

console.log('User list:', response);

// GET request with query parameters
const users = await httpClient.get({
  url: 'https://api.example.com/users',
  qs: {
    page: 1,
    limit: 10,
    status: 'active'
  }
});

// GET request with headers
const userData = await httpClient.get({
  url: 'https://api.example.com/user/profile',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Accept': 'application/json',
    'User-Agent': 'TestString/1.0'
  }
}, cookieJar);

// Get full response information
const fullResponse = await httpClient.get({
  url: 'https://api.example.com/status',
  resolveWithFullResponse: true
});

console.log('Status code:', fullResponse.statusCode);
console.log('Response headers:', fullResponse.headers);
console.log('Response body:', fullResponse.body);
```

### POST Requests

```typescript
// JSON data POST request
const newUser = await httpClient.post({
  url: 'https://api.example.com/users',
  json: true,
  body: {
    name: 'Zhang San',
    email: 'zhangsan@example.com',
    role: 'user'
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  }
}, cookieJar);

console.log('Created user:', newUser);

// Form data POST request
const loginResult = await httpClient.post({
  url: 'https://api.example.com/auth/login',
  form: {
    username: 'testuser',
    password: 'password123',
    remember: true
  }
}, cookieJar);

// File upload POST request
const uploadResult = await httpClient.post({
  url: 'https://api.example.com/upload',
  formData: {
    file: {
      value: fileBuffer,
      options: {
        filename: 'document.pdf',
        contentType: 'application/pdf'
      }
    },
    description: 'User document'
  }
});
```

### PUT and DELETE Requests

```typescript
// PUT request to update user information
const updatedUser = await httpClient.put({
  url: 'https://api.example.com/users/123',
  json: true,
  body: {
    name: 'Li Si',
    email: 'lisi@example.com',
    status: 'active'
  },
  headers: {
    'Authorization': 'Bearer token123'
  }
}, cookieJar);

// DELETE request to delete user
const deleteResult = await httpClient.delete({
  url: 'https://api.example.com/users/123',
  headers: {
    'Authorization': 'Bearer token123'
  }
}, cookieJar);

console.log('Delete result:', deleteResult);

// PATCH request (using send method)
const patchResult = await httpClient.send({
  url: 'https://api.example.com/users/123',
  method: 'PATCH',
  json: true,
  body: {
    status: 'inactive'
  }
});
```

## Cookie Session Management

### Basic Cookie Operations

```typescript
import { HttpCookieJar } from '@testring/http-api';

// Create cookie session
const cookieJar = httpClient.createCookieJar();

// Manually set cookie
cookieJar.setCookie('sessionId=abc123def456', 'https://api.example.com');

// Create complex cookie
const customCookie = cookieJar.createCookie({
  key: 'authToken',
  value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  domain: '.example.com',
  path: '/api',
  httpOnly: true,
  secure: true,
  maxAge: 3600
});

cookieJar.setCookie(customCookie, 'https://api.example.com');

// Get all cookies for specified URL
const cookies = cookieJar.getCookies('https://api.example.com/users');
console.log('Current cookies:', cookies);
```

### Session Persistence Example

```typescript
class ApiTestSession {
  private httpClient: HttpClient;
  private cookieJar: IHttpCookieJar;
  private authToken: string | null = null;
  
  constructor(transport: ITransport) {
    this.httpClient = new HttpClient(transport, { httpThrottle: 50 });
    this.cookieJar = this.httpClient.createCookieJar();
  }
  
  // Login and maintain session
  async login(username: string, password: string) {
    const loginResponse = await this.httpClient.post({
      url: 'https://api.example.com/auth/login',
      json: true,
      body: { username, password }
    }, this.cookieJar);
    
    this.authToken = loginResponse.token;
    
    // Cookies are automatically saved in cookieJar
    console.log('Login successful, Token:', this.authToken);
    return loginResponse;
  }
  
  // Authenticated API requests
  async getProfile() {
    return await this.httpClient.get({
      url: 'https://api.example.com/user/profile',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    }, this.cookieJar);
  }
  
  // Create resource
  async createResource(data: any) {
    return await this.httpClient.post({
      url: 'https://api.example.com/resources',
      json: true,
      body: data,
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    }, this.cookieJar);
  }
  
  // Logout
  async logout() {
    await this.httpClient.post({
      url: 'https://api.example.com/auth/logout',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    }, this.cookieJar);
    
    this.authToken = null;
  }
}

// Usage example
const session = new ApiTestSession(transport);
await session.login('testuser', 'password123');
const profile = await session.getProfile();
const newResource = await session.createResource({ name: 'Test Resource' });
await session.logout();
```

## Advanced Configuration and Options

### Request Timeout and Retry

```typescript
// Set request timeout
const timeoutResponse = await httpClient.get({
  url: 'https://slow-api.example.com/data',
  timeout: 30000  // 30 second timeout
});

// Custom retry logic
class RetryableHttpClient {
  constructor(private httpClient: HttpClient) {}
  
  async requestWithRetry(
    requestOptions: IHttpRequest,
    maxRetries = 3,
    delay = 1000,
    cookieJar?: IHttpCookieJar
  ) {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await this.httpClient.send(requestOptions, cookieJar);
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries) {
          console.log(`Request failed, retrying in ${delay}ms (${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }
}

const retryClient = new RetryableHttpClient(httpClient);
const result = await retryClient.requestWithRetry({
  url: 'https://unreliable-api.example.com/data'
}, 3, 1000, cookieJar);
```

### Request Interception and Processing

```typescript
class InterceptingHttpClient {
  constructor(
    private httpClient: HttpClient,
    private baseUrl: string = '',
    private defaultHeaders: Record<string, string> = {}
  ) {}
  
  // Request preprocessing
  private preprocessRequest(options: IHttpRequest): IHttpRequest {
    return {
      ...options,
      url: options.url.startsWith('http') ? options.url : `${this.baseUrl}${options.url}`,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    };
  }
  
  // Response postprocessing
  private postprocessResponse(response: any): any {
    // Unified error handling
    if (response && response.error) {
      throw new Error(`API Error: ${response.error.message}`);
    }
    
    // Data transformation
    if (response && response.data) {
      return response.data;
    }
    
    return response;
  }
  
  async get(options: IHttpRequest, cookieJar?: IHttpCookieJar) {
    const processedOptions = this.preprocessRequest(options);
    const response = await this.httpClient.get(processedOptions, cookieJar);
    return this.postprocessResponse(response);
  }
  
  async post(options: IHttpRequest, cookieJar?: IHttpCookieJar) {
    const processedOptions = this.preprocessRequest(options);
    const response = await this.httpClient.post(processedOptions, cookieJar);
    return this.postprocessResponse(response);
  }
}

// Usage example
const apiClient = new InterceptingHttpClient(
  httpClient,
  'https://api.example.com',
  {
    'User-Agent': 'TestString-API-Client/1.0',
    'Accept': 'application/json'
  }
);

const users = await apiClient.get({ url: '/users' }, cookieJar);
```

## Request Queue and Throttling

### Throttling Control

```typescript
// Create client with throttling
const throttledClient = new HttpClient(transport, {
  httpThrottle: 500  // 500ms interval between requests
});

// Concurrent requests will be automatically queued
const requests = [
  throttledClient.get({ url: 'https://api.example.com/users/1' }),
  throttledClient.get({ url: 'https://api.example.com/users/2' }),
  throttledClient.get({ url: 'https://api.example.com/users/3' }),
  throttledClient.get({ url: 'https://api.example.com/users/4' }),
  throttledClient.get({ url: 'https://api.example.com/users/5' })
];

// These requests will execute in queue order with 500ms intervals
const results = await Promise.all(requests);
console.log('All user data:', results);
```

### Batch Request Processing

```typescript
class BatchHttpClient {
  constructor(
    private httpClient: HttpClient,
    private batchSize: number = 5,
    private batchDelay: number = 1000
  ) {}
  
  async processBatch<T>(
    requests: IHttpRequest[],
    cookieJar?: IHttpCookieJar
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += this.batchSize) {
      const batch = requests.slice(i, i + this.batchSize);
      
      console.log(`Processing batch ${Math.floor(i / this.batchSize) + 1}, requests: ${batch.length}`);
      
      const batchPromises = batch.map(request => 
        this.httpClient.send(request, cookieJar)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Delay between batches
      if (i + this.batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, this.batchDelay));
      }
    }
    
    return results;
  }
}

// Usage example
const batchClient = new BatchHttpClient(httpClient, 3, 2000);

const userRequests = Array.from({ length: 10 }, (_, i) => ({
  url: `https://api.example.com/users/${i + 1}`
}));

const allUsers = await batchClient.processBatch(userRequests, cookieJar);
console.log('Batch retrieved users:', allUsers);
```

## Error Handling and Debugging

### Comprehensive Error Handling

```typescript
class RobustApiClient {
  constructor(private httpClient: HttpClient) {}
  
  async safeRequest(
    options: IHttpRequest,
    cookieJar?: IHttpCookieJar
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const data = await this.httpClient.send(options, cookieJar);
      return { success: true, data };
    } catch (error) {
      console.error('Request failed:', {
        url: options.url,
        method: options.method || 'GET',
        error: error.message
      });
      
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }
  
  private formatError(error: any): string {
    if (error.code === 'ECONNREFUSED') {
      return 'Connection refused, please check server status';
    }
    
    if (error.code === 'ETIMEDOUT') {
      return 'Request timeout, please check network connection';
    }
    
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          return 'Request parameter error';
        case 401:
          return 'Authentication failed, please check credentials';
        case 403:
          return 'Insufficient permissions';
        case 404:
          return 'Resource not found';
        case 429:
          return 'Too many requests, please try again later';
        case 500:
          return 'Internal server error';
        default:
          return `HTTP ${error.statusCode}: ${error.message || 'Unknown error'}`;
      }
    }
    
    return error.message || 'Unknown error';
  }
  
  async validateResponse(response: any, schema: any): Promise<boolean> {
    // Implement response validation logic
    try {
      // Can integrate JSON Schema validation here
      return true;
    } catch (error) {
      console.error('Response validation failed:', error.message);
      return false;
    }
  }
}

// Usage example
const robustClient = new RobustApiClient(httpClient);

const result = await robustClient.safeRequest({
  url: 'https://api.example.com/users',
  timeout: 10000
}, cookieJar);

if (result.success) {
  console.log('Request successful:', result.data);
} else {
  console.error('Request failed:', result.error);
}
```

### Request Logging and Monitoring

```typescript
class LoggingHttpClient {
  constructor(
    private httpClient: HttpClient,
    private enableLogging: boolean = true
  ) {}
  
  private logRequest(options: IHttpRequest, startTime: number) {
    if (!this.enableLogging) return;
    
    console.log(`[HTTP] ${options.method || 'GET'} ${options.url}`, {
      timestamp: new Date().toISOString(),
      startTime,
      headers: options.headers,
      body: options.body ? 'Has request body' : 'No request body'
    });
  }
  
  private logResponse(
    options: IHttpRequest,
    response: any,
    startTime: number,
    error?: Error
  ) {
    if (!this.enableLogging) return;
    
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error(`[HTTP] ${options.method || 'GET'} ${options.url} FAILED`, {
        duration: `${duration}ms`,
        error: error.message
      });
    } else {
      console.log(`[HTTP] ${options.method || 'GET'} ${options.url} SUCCESS`, {
        duration: `${duration}ms`,
        statusCode: response.statusCode || 'N/A',
        responseSize: JSON.stringify(response).length
      });
    }
  }
  
  async request(
    method: 'get' | 'post' | 'put' | 'delete',
    options: IHttpRequest,
    cookieJar?: IHttpCookieJar
  ) {
    const startTime = Date.now();
    this.logRequest(options, startTime);
    
    try {
      const response = await this.httpClient[method](options, cookieJar);
      this.logResponse(options, response, startTime);
      return response;
    } catch (error) {
      this.logResponse(options, null, startTime, error as Error);
      throw error;
    }
  }
  
  get(options: IHttpRequest, cookieJar?: IHttpCookieJar) {
    return this.request('get', options, cookieJar);
  }
  
  post(options: IHttpRequest, cookieJar?: IHttpCookieJar) {
    return this.request('post', options, cookieJar);
  }
}

const loggingClient = new LoggingHttpClient(httpClient);
```

## Test Scenario Examples

### API Integration Testing

```typescript
class ApiIntegrationTest {
  private httpClient: HttpClient;
  private cookieJar: IHttpCookieJar;
  private baseUrl: string;
  
  constructor(transport: ITransport, baseUrl: string) {
    this.httpClient = new HttpClient(transport, { httpThrottle: 100 });
    this.cookieJar = this.httpClient.createCookieJar();
    this.baseUrl = baseUrl;
  }
  
  // Complete user management test flow
  async testUserManagement() {
    console.log('Starting user management integration test...');
    
    // 1. Admin login
    const loginResponse = await this.httpClient.post({
      url: `${this.baseUrl}/auth/login`,
      json: true,
      body: {
        username: 'admin',
        password: 'admin123'
      }
    }, this.cookieJar);
    
    console.log('✓ Admin login successful');
    
    // 2. Create new user
    const newUser = await this.httpClient.post({
      url: `${this.baseUrl}/users`,
      json: true,
      body: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      },
      headers: {
        'Authorization': `Bearer ${loginResponse.token}`
      }
    }, this.cookieJar);
    
    console.log('✓ New user created successfully:', newUser.id);
    
    // 3. Get user list
    const users = await this.httpClient.get({
      url: `${this.baseUrl}/users`,
      qs: { page: 1, limit: 10 },
      headers: {
        'Authorization': `Bearer ${loginResponse.token}`
      }
    }, this.cookieJar);
    
    console.log('✓ User list retrieved successfully, user count:', users.length);
    
    // 4. Update user information
    const updatedUser = await this.httpClient.put({
      url: `${this.baseUrl}/users/${newUser.id}`,
      json: true,
      body: {
        name: 'Updated Test User',
        status: 'active'
      },
      headers: {
        'Authorization': `Bearer ${loginResponse.token}`
      }
    }, this.cookieJar);
    
    console.log('✓ User information updated successfully');
    
    // 5. Delete user
    await this.httpClient.delete({
      url: `${this.baseUrl}/users/${newUser.id}`,
      headers: {
        'Authorization': `Bearer ${loginResponse.token}`
      }
    }, this.cookieJar);
    
    console.log('✓ User deleted successfully');
    
    // 6. Logout
    await this.httpClient.post({
      url: `${this.baseUrl}/auth/logout`,
      headers: {
        'Authorization': `Bearer ${loginResponse.token}`
      }
    }, this.cookieJar);
    
    console.log('✓ Admin logout successful');
    console.log('User management integration test completed!');
  }
  
  // Performance test
  async performanceTest(concurrency: number = 10, requests: number = 100) {
    console.log(`Starting performance test: ${concurrency} concurrent, ${requests} requests...`);
    
    const startTime = Date.now();
    const requestPromises: Promise<any>[] = [];
    
    for (let i = 0; i < requests; i++) {
      const promise = this.httpClient.get({
        url: `${this.baseUrl}/health`,
        timeout: 5000
      });
      
      requestPromises.push(promise);
      
      // Control concurrency
      if (requestPromises.length >= concurrency) {
        await Promise.all(requestPromises.splice(0, concurrency));
      }
    }
    
    // Process remaining requests
    if (requestPromises.length > 0) {
      await Promise.all(requestPromises);
    }
    
    const duration = Date.now() - startTime;
    const rps = Math.round((requests / duration) * 1000);
    
    console.log(`Performance test completed: ${duration}ms, ${rps} RPS`);
  }
}

// Usage example
const apiTest = new ApiIntegrationTest(transport, 'https://api.example.com');
await apiTest.testUserManagement();
await apiTest.performanceTest(5, 50);
```

## HttpServer Server Side

### Server Creation and Configuration

```typescript
import { createHttpServer } from '@testring/http-api';

// Create HTTP server
const httpServer = createHttpServer(transport);

// Server automatically handles HTTP requests from clients
// and uses built-in request function to execute actual network requests
```

## Best Practices

### 1. Connection Management
- Reasonably use cookie sessions to maintain connection state
- Avoid creating too many HttpClient instances
- Clean up unnecessary cookies promptly
- Set appropriate request timeout times

### 2. Error Handling
- Implement comprehensive error capture and classification
- Provide clear error messages and handling suggestions
- Establish retry mechanisms to handle network intermittent issues
- Record detailed request and response logs

### 3. Performance Optimization
- Use request throttling to avoid server overload
- Reasonably set concurrency and batch sizes
- Reuse cookie sessions to reduce authentication overhead
- Selectively return full response or response body only

### 4. Security Considerations
- Avoid logging sensitive information
- Use HTTPS for sensitive data transmission
- Properly handle authentication tokens and cookies
- Validate response data format and content

### 5. Test Organization
- Establish clear test session management
- Use page object pattern to encapsulate API interfaces
- Implement reusable test tools and helper methods
- Separate configuration and test logic

## Troubleshooting

### Common Issues

#### Connection Errors
```bash
Error: ECONNREFUSED
```
Solution: Check target server status, network connectivity, firewall settings.

#### Timeout Errors
```bash
Error: ETIMEDOUT
```
Solution: Increase timeout time, check network latency, optimize server response speed.

#### Authentication Failures
```bash
Error: 401 Unauthorized
```
Solution: Check authentication credentials, cookie session state, token validity.

#### Request Format Errors
```bash
Error: 400 Bad Request
```
Solution: Validate request parameters, Content-Type headers, data format.

### Debugging Tips

```typescript
// Enable detailed logging
const debugClient = new HttpClient(transport, { httpThrottle: 0 });

// Check cookie state
console.log('Current cookies:', cookieJar.getCookies('https://api.example.com'));

// Use full response mode for debugging
const fullResponse = await debugClient.get({
  url: 'https://api.example.com/debug',
  resolveWithFullResponse: true
});

console.log('Full response:', {
  statusCode: fullResponse.statusCode,
  headers: fullResponse.headers,
  body: fullResponse.body
});
```

## Dependencies

- **`@testring/logger`** - Logging functionality
- **`@testring/transport`** - Transport layer communication
- **`@testring/types`** - TypeScript type definitions
- **`@testring/utils`** - Utility functions
- **`request`** - HTTP request library
- **`request-promise-native`** - Promise-based HTTP requests
- **`tough-cookie`** - Cookie management

## Related Modules

- **`@testring/web-application`** - Web application testing utilities
- **`@testring/client-ws-transport`** - WebSocket transport layer
- **`@testring/test-utils`** - Testing utility functions

## License

MIT License - see the [LICENSE](https://github.com/ringcentral/testring/blob/master/LICENSE) file for details.