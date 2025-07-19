# @testring/web-application

Web application testing module that serves as the core browser operation layer for the testring framework, providing comprehensive web application automation testing capabilities. This module encapsulates rich browser operation methods, element location, assertion mechanisms, and debugging features, making it the essential component for end-to-end web testing.

[![npm version](https://badge.fury.io/js/@testring/web-application.svg)](https://www.npmjs.com/package/@testring/web-application)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Overview

The web application testing module is the browser operation core of the testring framework, providing:

- **Complete browser element operations and interactions** with comprehensive DOM manipulation
- **Advanced waiting mechanisms and synchronization strategies** for reliable test execution
- **Built-in assertion system with soft assertion support** for flexible test validation
- **Intelligent element location and path management** using the element-path system
- **Screenshot and debugging tools integration** for test analysis and troubleshooting
- **Multi-window and tab management** for complex application testing
- **Cookie and session management** for authentication and state handling
- **File upload and download support** for comprehensive application testing

## Key Features

### 🎯 Element Operations
- Click, double-click, drag-and-drop, and other interaction operations
- Text input, selection, and clearing with smart handling
- Form element processing (input fields, dropdowns, checkboxes)
- Scrolling and focus management for viewport control
- Element attribute and style retrieval for validation

### ⏱️ Waiting Mechanisms
- Intelligent waiting for element existence, visibility, and clickability
- Conditional waiting with custom logic and predicates
- Timeout control and retry mechanisms for robust testing
- Page load waiting and document ready state detection

### ✅ Assertion System
- Built-in synchronous and asynchronous assertions
- Soft assertion support that doesn't interrupt test execution
- Automatic screenshot capture on assertion success and failure
- Rich assertion methods with custom error messages

### 🔧 Debugging Support
- Element highlighting and location visualization
- Debug breakpoints and step-by-step logging
- Developer tools integration and extension support
- Detailed operation logs and error tracking

## Installation

```bash
# Using npm
npm install @testring/web-application

# Using yarn
yarn add @testring/web-application

# Using pnpm
pnpm add @testring/web-application
```

## Core Architecture

### WebApplication Class

The main web application testing interface, extending `PluggableModule`:

```typescript
class WebApplication extends PluggableModule {
  constructor(
    testUID: string,
    transport: ITransport,
    config: Partial<IWebApplicationConfig>
  )

  // Assertion System
  public assert: AsyncAssertion
  public softAssert: AsyncAssertion

  // Element Path Management
  public root: ElementPathProxy

  // Client and Logging
  public get client(): WebClient
  public get logger(): LoggerClient

  // Core Methods
  public async openPage(url: string): Promise<void>
  public async click(element: ElementPath): Promise<void>
  public async setValue(element: ElementPath, value: string): Promise<void>
  public async getText(element: ElementPath): Promise<string>
  public async waitForExist(element: ElementPath, timeout?: number): Promise<void>
  public async makeScreenshot(force?: boolean): Promise<string>
}
```

### Configuration Options

```typescript
interface IWebApplicationConfig {
  screenshotsEnabled: boolean;      // Enable screenshot capture
  screenshotPath: string;           // Screenshot save path
  devtool: IDevtoolConfig | null;   // Developer tools configuration
  seleniumConfig?: any;             // Selenium configuration
}

interface IDevtoolConfig {
  extensionId: string;              // Browser extension ID
  httpPort: number;                 // HTTP server port
  wsPort: number;                   // WebSocket server port
  host: string;                     // Server host
}
```

## Basic Usage

### Creating a Web Application Instance

```typescript
import { WebApplication } from '@testring/web-application';
import { transport } from '@testring/transport';

// Create a web application test instance
const webApp = new WebApplication(
  'test-001',  // Unique test identifier
  transport,   // Transport layer instance
  {
    screenshotsEnabled: true,
    screenshotPath: './screenshots/',
    devtool: null
  }
);

// Wait for initialization to complete
await webApp.initPromise;
```

### Page Navigation and Basic Operations

```typescript
// Open a page
await webApp.openPage('https://example.com');

// Get page title
const title = await webApp.getTitle();
console.log('Page title:', title);

// Refresh the page
await webApp.refresh();

// Get page source
const source = await webApp.getSource();

// Execute JavaScript
const result = await webApp.execute(() => {
  return document.readyState;
});

// Navigate back and forward
await webApp.back();
await webApp.forward();

// Get current URL
const currentUrl = await webApp.getUrl();
console.log('Current URL:', currentUrl);
```

### Element Location and Interaction

```typescript
// Using element paths
const loginButton = webApp.root.button.contains('Login');
const usernameInput = webApp.root.input.id('username');
const passwordInput = webApp.root.input.type('password');

// Wait for element to exist
await webApp.waitForExist(loginButton);

// Wait for element to be visible
await webApp.waitForVisible(usernameInput);

// Click an element
await webApp.click(loginButton);

// Input text
await webApp.setValue(usernameInput, 'testuser@example.com');
await webApp.setValue(passwordInput, 'password123');

// Clear input
await webApp.clearValue(usernameInput);

// Get element text
const buttonText = await webApp.getText(loginButton);
console.log('Button text:', buttonText);

// Check if element exists
const exists = await webApp.isElementsExist(webApp.root.div.className('error-message'));
console.log('Error message exists:', exists);

// Check if element is visible
const visible = await webApp.isVisible(webApp.root.div.className('success-message'));
console.log('Success message visible:', visible);
```

### Using Assertions

```typescript
// Hard assertions (test stops on failure)
await webApp.assert.equal(
  await webApp.getTitle(),
  'Example Domain',
  'Page title should match expected value'
);

await webApp.assert.isTrue(
  await webApp.isVisible(webApp.root.h1),
  'Heading should be visible'
);

// Soft assertions (test continues on failure)
await webApp.softAssert.contains(
  await webApp.getText(webApp.root.p),
  'for illustrative examples',
  'Paragraph should contain expected text'
);

// Get soft assertion errors at the end of the test
const softErrors = webApp.getSoftAssertionErrors();
if (softErrors.length > 0) {
  console.log('Soft assertion failures:', softErrors);
}
```

## Advanced Element Operations

### Complex Interaction Operations

```typescript
// Double-click element
await webApp.doubleClick(webApp.root.div.className('editable'));

// Drag and drop operation
const sourceElement = webApp.root.div.id('source');
const targetElement = webApp.root.div.id('target');
await webApp.dragAndDrop(sourceElement, targetElement);

// Coordinate click
await webApp.clickCoordinates(webApp.root.canvas, {
  x: 'center',
  y: 'center'
});

// Move to element
await webApp.moveToObject(webApp.root.button.text('Submit'), 10, 10);

// Scroll to element
await webApp.scrollIntoView(webApp.root.footer);
```

### Form Operations

```typescript
// Dropdown operations
const selectElement = webApp.root.select.name('country');

// Select by value
await webApp.selectByValue(selectElement, 'CN');

// Select by visible text
await webApp.selectByVisibleText(selectElement, 'China');

// Select by index
await webApp.selectByIndex(selectElement, 0);

// Get selected text
const selectedText = await webApp.getSelectedText(selectElement);

// Get all options
const allOptions = await webApp.getSelectTexts(selectElement);
console.log('All options:', allOptions);

// Checkbox operations
const checkbox = webApp.root.input.type('checkbox').name('agreement');
await webApp.setChecked(checkbox, true);

// Check if selected
const isChecked = await webApp.isChecked(checkbox);
console.log('Checkbox state:', isChecked);
```

### File Upload

```typescript
// File upload
const fileInput = webApp.root.input.type('file');
await webApp.uploadFile('/path/to/local/file.pdf');

// Wait for upload completion
await webApp.waitForVisible(webApp.root.div.className('upload-success'));
```

## Waiting and Synchronization Mechanisms

### Basic Waiting Methods

```typescript
// Wait for element to exist
await webApp.waitForExist(
  webApp.root.div.className('loading'),
  10000  // Timeout
);

// Wait for element to be visible
await webApp.waitForVisible(
  webApp.root.modal.className('dialog'),
  5000
);

// Wait for element to be invisible
await webApp.waitForNotVisible(
  webApp.root.div.className('spinner'),
  15000
);

// Wait for element to not exist
await webApp.waitForNotExists(
  webApp.root.div.className('error-message'),
  3000
);
```

### Advanced Waiting Conditions

```typescript
// Wait for element to be clickable
await webApp.waitForClickable(
  webApp.root.button.text('Submit'),
  8000
);

// Wait for element to be enabled
await webApp.waitForEnabled(
  webApp.root.input.name('email'),
  5000
);

// Wait for element to be stable (position unchanged)
await webApp.waitForStable(
  webApp.root.div.className('animated'),
  10000
);

// Custom condition waiting
await webApp.waitUntil(
  async () => {
    const count = await webApp.getElementsCount(webApp.root.li.className('item'));
    return count >= 5;
  },
  10000,
  'Failed to wait for list item count to reach 5'
);
```

### State Checking Methods

```typescript
// Check if element exists
const exists = await webApp.isElementsExist(webApp.root.button.text('Delete'));

// Check if element is visible
const visible = await webApp.isVisible(webApp.root.modal);

// Check if element is enabled
const enabled = await webApp.isEnabled(webApp.root.button.text('Submit'));

// Check if element is read-only
const readOnly = await webApp.isReadOnly(webApp.root.input.name('code'));

// Check if element is clickable
const clickable = await webApp.isClickable(webApp.root.a.href('#'));

// Check if element is focused
const focused = await webApp.isFocused(webApp.root.input.name('search'));
```

## Assertion System

### Basic Assertions

```typescript
// Synchronous assertions (stop test immediately on failure)
await webApp.assert.isTrue(
  await webApp.isVisible(webApp.root.h1.text('Welcome')),
  'Home page title should be visible'
);

await webApp.assert.equal(
  await webApp.getText(webApp.root.span.className('username')),
  'testuser@example.com',
  'Username display is correct'
);

// Soft assertions (continue test execution on failure)
await webApp.softAssert.isTrue(
  await webApp.isEnabled(webApp.root.button.text('Save')),
  'Save button should be enabled'
);

await webApp.softAssert.contains(
  await webApp.getText(webApp.root.div.className('message')),
  'Operation successful',
  'Success message should contain correct text'
);

// Get soft assertion errors
const softErrors = webApp.getSoftAssertionErrors();
if (softErrors.length > 0) {
  console.log('Soft assertion failures:', softErrors);
}
```

### Custom Assertion Messages

```typescript
// Assertions with success and failure messages
await webApp.assert.isTrue(
  await webApp.isVisible(webApp.root.div.className('success')),
  'Success prompt display',
  'Success prompt display verification normal'
);

// Complex assertion logic
await webApp.assert.isFalse(
  await webApp.isVisible(webApp.root.div.className('error')),
  'Should not display error message'
);

// Numeric assertions
const itemCount = await webApp.getElementsCount(webApp.root.li.className('product'));
await webApp.assert.greaterThan(itemCount, 0, 'Product list is not empty');
```

## Multi-Window and Tab Management

### Tab Operations

```typescript
// Get all tab IDs
const tabIds = await webApp.getTabIds();
console.log('Tab list:', tabIds);

// Get current tab ID
const currentTab = await webApp.getCurrentTabId();

// Get main tab ID
const mainTab = await webApp.getMainTabId();

// Switch to specified tab
await webApp.switchTab(tabIds[1]);

// Open new window
await webApp.newWindow(
  'https://example.com/help',
  'helpWindow',
  { width: 800, height: 600 }
);

// Close current tab
await webApp.closeCurrentTab();

// Close all other tabs
await webApp.closeAllOtherTabs();

// Switch to main tab
await webApp.switchToMainSiblingTab();
```

### Window Management

```typescript
// Maximize window
await webApp.maximizeWindow();

// Get window size
const windowSize = await webApp.getWindowSize();
console.log('Window size:', windowSize);

// Get window handles
const handles = await webApp.windowHandles();

// Switch window
await webApp.window(handles[0]);
```

## Frame and Popup Handling

### Frame Switching

```typescript
// Switch to specified frame
await webApp.switchToFrame('contentFrame');

// Switch to parent frame
await webApp.switchToParentFrame();

// Operate elements in frame
await webApp.setValue(
  webApp.root.input.name('message'),
  'Enter text in frame'
);
```

### Popup Handling

```typescript
// Wait for popup to appear
await webApp.waitForAlert(5000);

// Check if popup exists
const hasAlert = await webApp.isAlertOpen();

// Get popup text
const alertText = await webApp.alertText();
console.log('Popup content:', alertText);

// Accept popup
await webApp.alertAccept();

// Dismiss popup
await webApp.alertDismiss();
```

## Cookie and Session Management

### Cookie Operations

```typescript
// Set Cookie
await webApp.setCookie({
  name: 'sessionId',
  value: 'abc123def456',
  domain: '.example.com',
  path: '/',
  httpOnly: false,
  secure: true
});

// Get Cookie
const sessionCookie = await webApp.getCookie('sessionId');
console.log('Session Cookie:', sessionCookie);

// Delete Cookie
await webApp.deleteCookie('sessionId');

// Set timezone
await webApp.setTimeZone('Asia/Shanghai');
```

## Element Information Retrieval

### Basic Property Retrieval

```typescript
const element = webApp.root.div.className('product-info');

// Get element text
const text = await webApp.getText(element);

// Get element attributes
const id = await webApp.getAttribute(element, 'id');
const className = await webApp.getAttribute(element, 'class');

// Get element value
const value = await webApp.getValue(webApp.root.input.name('price'));

// Get element HTML
const html = await webApp.getHTML(element);

// Get element size
const size = await webApp.getSize(element);
console.log('Element size:', size);

// Get element location
const location = await webApp.getLocation(element);
console.log('Element location:', location);
```

### CSS Style Retrieval

```typescript
// Get CSS properties
const color = await webApp.getCssProperty(element, 'color');
const fontSize = await webApp.getCssProperty(element, 'font-size');
const display = await webApp.getCssProperty(element, 'display');

console.log('Element styles:', { color, fontSize, display });

// Check if CSS class exists
const hasActiveClass = await webApp.isCSSClassExists(
  webApp.root.button.text('Submit'),
  'active',
  'btn-primary'
);
```

### Element Collection Operations

```typescript
// Get element count
const count = await webApp.getElementsCount(webApp.root.li.className('item'));

// Get text from multiple elements
const texts = await webApp.getTexts(webApp.root.span.className('label'));
console.log('All label texts:', texts);

// Get element list
const elements = await webApp.elements(webApp.root.div.className('card'));
console.log('Found element count:', elements.length);
```

## Keyboard and Mouse Operations

### Keyboard Operations

```typescript
// Send keyboard input
await webApp.keys(['Control', 'a']);  // Select all
await webApp.keys(['Control', 'c']);  // Copy
await webApp.keys(['Control', 'v']);  // Paste

// Send special keys
await webApp.keys('Tab');
await webApp.keys('Enter');
await webApp.keys('Escape');

// Combination key operations
await webApp.keys(['Shift', 'Tab']);
await webApp.keys(['Control', 'Shift', 'I']);  // Developer tools
```

### Advanced Input Operations

```typescript
// Add text to existing content
await webApp.addValue(webApp.root.textarea.name('comment'), '\nAppended text');

// JavaScript simulated input
await webApp.simulateJSFieldChange(
  webApp.root.input.name('dynamic'),
  'Value set via JS'
);

// Clear field
await webApp.simulateJSFieldClear(webApp.root.input.name('temp'));
```

## Screenshots and Debugging

### Screenshot Functionality

```typescript
// Manual screenshot
const screenshotPath = await webApp.makeScreenshot();
console.log('Screenshot save path:', screenshotPath);

// Force screenshot (ignore configuration)
await webApp.makeScreenshot(true);

// Disable screenshots
await webApp.disableScreenshots();

// Enable screenshots
await webApp.enableScreenshots();
```

### Debug Tools

```typescript
// Configuration with debug mode enabled
const webAppWithDebug = new WebApplication('test-debug', transport, {
  screenshotsEnabled: true,
  screenshotPath: './debug-screenshots/',
  devtool: {
    extensionId: 'chrome-extension-id',
    httpPort: 3000,
    wsPort: 3001,
    host: 'localhost'
  }
});

// Element highlighting (automatically works in debug mode)
await webAppWithDebug.waitForExist(webApp.root.button.text('Debug'));
```

## Advanced Features

### PDF Generation

```typescript
// Generate PDF file
await webApp.savePDF({
  filepath: './reports/page.pdf',
  format: 'A4',
  printBackground: true,
  landscape: false,
  margin: {
    top: '1cm',
    bottom: '1cm',
    left: '1cm',
    right: '1cm'
  }
});
```

### Extended Instance

```typescript
// Extend WebApplication instance
const extendedApp = webApp.extendInstance({
  // Custom methods
  async loginUser(username: string, password: string) {
    await this.setValue(this.root.input.name('username'), username);
    await this.setValue(this.root.input.name('password'), password);
    await this.click(this.root.button.type('submit'));
    await this.waitForVisible(this.root.div.className('dashboard'));
  },
  
  // Custom properties
  customTimeout: 15000
});

// Use extended method
await extendedApp.loginUser('admin', 'password123');
```

### Conditional Check Methods

```typescript
// Check if element becomes visible
const becameVisible = await webApp.isBecomeVisible(
  webApp.root.div.className('notification'),
  3000
);

// Check if element becomes hidden
const becameHidden = await webApp.isBecomeHidden(
  webApp.root.div.className('loading'),
  10000
);

console.log('Notification display state:', becameVisible);
console.log('Loading animation hidden state:', becameHidden);
```

## Error Handling and Best Practices

### Error Handling Patterns

```typescript
class WebAppTestCase {
  private webApp: WebApplication;
  
  constructor(webApp: WebApplication) {
    this.webApp = webApp;
  }
  
  async safeClick(element: ElementPath, timeout = 10000) {
    try {
      await this.webApp.waitForClickable(element, timeout);
      await this.webApp.click(element);
      return true;
    } catch (error) {
      console.error('Click failed:', error.message);
      await this.webApp.makeScreenshot(true);  // Force screenshot on error
      return false;
    }
  }
  
  async safeSetValue(element: ElementPath, value: string, timeout = 10000) {
    try {
      await this.webApp.waitForExist(element, timeout);
      await this.webApp.clearValue(element);
      await this.webApp.setValue(element, value);
      
      // Verify value was set successfully
      const actualValue = await this.webApp.getValue(element);
      if (actualValue !== value) {
        throw new Error(`Value setting failed: expected "${value}", actual "${actualValue}"`);
      }
      
      return true;
    } catch (error) {
      console.error('Set value failed:', error.message);
      await this.webApp.makeScreenshot(true);
      return false;
    }
  }
}
```

### Timeout Control

```typescript
// Custom timeout operations
await webApp.waitForExist(webApp.root.div.className('slow-loading'), 30000);

// Quick check (short timeout)
try {
  await webApp.waitForVisible(webApp.root.div.className('popup'), 1000);
  console.log('Popup displayed quickly');
} catch (error) {
  console.log('Popup not displayed quickly, continue with other operations');
}

// Phased waiting
await webApp.waitForExist(webApp.root.button.text('Load More'), 5000);
await webApp.click(webApp.root.button.text('Load More'));
await webApp.waitForVisible(webApp.root.div.className('new-content'), 15000);
```

### Retry Mechanism

```typescript
class RetryHelper {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries) {
          console.log(`Operation failed, retrying in ${delay}ms (${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
}

// Use retry mechanism
await RetryHelper.withRetry(async () => {
  await webApp.click(webApp.root.button.text('Unstable Button'));
  await webApp.waitForVisible(webApp.root.div.className('success'), 3000);
}, 3, 2000);
```

## Performance Optimization

### Batch Operations

```typescript
// Batch check element states
const elements = [
  webApp.root.button.text('Save'),
  webApp.root.button.text('Cancel'),
  webApp.root.button.text('Delete')
];

const statuses = await Promise.all(
  elements.map(async (element) => ({
    element: element.toString(),
    visible: await webApp.isVisible(element),
    enabled: await webApp.isEnabled(element)
  }))
);

console.log('Button states:', statuses);
```

### Selective Screenshots

```typescript
// Only take screenshots at important steps
await webApp.disableScreenshots();

// Execute regular operations
await webApp.setValue(webApp.root.input.name('search'), 'test');
await webApp.click(webApp.root.button.text('Search'));

// Enable screenshots at key verification points
await webApp.enableScreenshots();
await webApp.waitForVisible(webApp.root.div.className('results'));
await webApp.makeScreenshot();
```

### Smart Waiting

```typescript
// Combined wait conditions
async function waitForPageReady(webApp: WebApplication) {
  // Wait for basic page elements
  await webApp.waitForExist(webApp.root, 10000);
  
  // Wait for loading indicator to disappear
  try {
    await webApp.waitForNotVisible(webApp.root.div.className('loading'), 15000);
  } catch {
    // If no loading indicator, ignore error
  }
  
  // Wait for main content to be visible
  await webApp.waitForVisible(webApp.root.main, 10000);
  
  // Ensure page is stable
  await webApp.pause(500);
}

await waitForPageReady(webApp);
```

## Test Modes and Environments

### Session Management

```typescript
// Check session state
if (webApp.isStopped()) {
  console.log('Session stopped');
} else {
  // Execute test operations
  await webApp.openPage('https://example.com');
}

// End session
await webApp.end();
```

### Configuration-Driven Testing

```typescript
// Create instance based on environment configuration
function createWebApp(environment: string) {
  const configs = {
    development: {
      screenshotsEnabled: true,
      screenshotPath: './dev-screenshots/',
      devtool: { /* Development tools configuration */ }
    },
    staging: {
      screenshotsEnabled: true,
      screenshotPath: './staging-screenshots/',
      devtool: null
    },
    production: {
      screenshotsEnabled: false,
      screenshotPath: './prod-screenshots/',
      devtool: null
    }
  };
  
  return new WebApplication(
    `test-${Date.now()}`,
    transport,
    configs[environment] || configs.development
  );
}

const webApp = createWebApp(process.env.NODE_ENV || 'development');
```

## API Reference

### Core Methods

#### Navigation
- `openPage(url: string): Promise<void>` - Navigate to a URL
- `refresh(): Promise<void>` - Refresh the current page
- `back(): Promise<void>` - Navigate back in browser history
- `forward(): Promise<void>` - Navigate forward in browser history
- `getTitle(): Promise<string>` - Get page title
- `getUrl(): Promise<string>` - Get current URL
- `getSource(): Promise<string>` - Get page source

#### Element Interaction
- `click(element: ElementPath): Promise<void>` - Click an element
- `doubleClick(element: ElementPath): Promise<void>` - Double-click an element
- `setValue(element: ElementPath, value: string): Promise<void>` - Set input value
- `clearValue(element: ElementPath): Promise<void>` - Clear input value
- `getText(element: ElementPath): Promise<string>` - Get element text
- `getAttribute(element: ElementPath, attribute: string): Promise<string>` - Get element attribute

#### Waiting Methods
- `waitForExist(element: ElementPath, timeout?: number): Promise<void>` - Wait for element to exist
- `waitForVisible(element: ElementPath, timeout?: number): Promise<void>` - Wait for element to be visible
- `waitForClickable(element: ElementPath, timeout?: number): Promise<void>` - Wait for element to be clickable
- `waitForEnabled(element: ElementPath, timeout?: number): Promise<void>` - Wait for element to be enabled
- `waitUntil(condition: () => Promise<boolean>, timeout?: number, message?: string): Promise<void>` - Wait for custom condition

#### State Checking
- `isElementsExist(element: ElementPath): Promise<boolean>` - Check if element exists
- `isVisible(element: ElementPath): Promise<boolean>` - Check if element is visible
- `isEnabled(element: ElementPath): Promise<boolean>` - Check if element is enabled
- `isClickable(element: ElementPath): Promise<boolean>` - Check if element is clickable
- `isFocused(element: ElementPath): Promise<boolean>` - Check if element is focused

#### Form Operations
- `selectByValue(element: ElementPath, value: string): Promise<void>` - Select option by value
- `selectByVisibleText(element: ElementPath, text: string): Promise<void>` - Select option by text
- `selectByIndex(element: ElementPath, index: number): Promise<void>` - Select option by index
- `setChecked(element: ElementPath, checked: boolean): Promise<void>` - Set checkbox state
- `isChecked(element: ElementPath): Promise<boolean>` - Check if checkbox is checked

#### Screenshots and Debugging
- `makeScreenshot(force?: boolean): Promise<string>` - Take a screenshot
- `enableScreenshots(): Promise<void>` - Enable screenshot capture
- `disableScreenshots(): Promise<void>` - Disable screenshot capture

### Assertion Methods

#### Hard Assertions (AsyncAssertion)
- `assert.equal(actual: any, expected: any, message?: string): Promise<void>`
- `assert.notEqual(actual: any, expected: any, message?: string): Promise<void>`
- `assert.isTrue(value: boolean, message?: string): Promise<void>`
- `assert.isFalse(value: boolean, message?: string): Promise<void>`
- `assert.contains(haystack: string, needle: string, message?: string): Promise<void>`
- `assert.greaterThan(actual: number, expected: number, message?: string): Promise<void>`

#### Soft Assertions
- `softAssert.*` - Same methods as hard assertions but don't stop test execution
- `getSoftAssertionErrors(): Array<Error>` - Get accumulated soft assertion errors

## Best Practices

### 1. Element Location Strategy
- **Use stable locators**: Prefer IDs and data attributes over CSS classes
- **Avoid brittle selectors**: Don't rely on changing text content or structure
- **Use semantic element paths**: Create readable and maintainable selectors
- **Implement Page Object Model**: Encapsulate element location in page objects

### 2. Waiting and Synchronization
- **Set appropriate timeouts**: Avoid too long or too short timeout values
- **Use explicit waits**: Prefer explicit waits over fixed delays
- **Combine wait conditions**: Ensure proper page state with multiple conditions
- **Add strategic waits**: Include appropriate waits before and after critical operations

### 3. Assertions and Verification
- **Use clear assertion messages**: Provide helpful messages for debugging
- **Use soft assertions wisely**: Avoid test interruption when appropriate
- **Capture screenshots on failure**: Automatically document assertion failures
- **Verify results, not just actions**: Check operation outcomes, not just execution

### 4. Error Handling
- **Implement comprehensive error handling**: Catch and handle all possible errors
- **Log detailed error information**: Include context and debugging information
- **Provide helpful error messages**: Give actionable error descriptions
- **Implement retry mechanisms**: Handle intermittent issues gracefully

### 5. Performance Optimization
- **Minimize unnecessary operations**: Avoid excessive screenshots and logging
- **Use batch operations**: Reduce network overhead with bulk operations
- **Optimize element location**: Use efficient selector strategies
- **Control concurrency**: Balance parallel execution with resource constraints

## Common Patterns

### Page Object Model

```typescript
class LoginPage {
  constructor(private webApp: WebApplication) {}

  // Element definitions
  get usernameInput() { return this.webApp.root.input.name('username'); }
  get passwordInput() { return this.webApp.root.input.name('password'); }
  get loginButton() { return this.webApp.root.button.type('submit'); }
  get errorMessage() { return this.webApp.root.div.className('error'); }

  // Page actions
  async login(username: string, password: string) {
    await this.webApp.setValue(this.usernameInput, username);
    await this.webApp.setValue(this.passwordInput, password);
    await this.webApp.click(this.loginButton);
  }

  async waitForError() {
    await this.webApp.waitForVisible(this.errorMessage, 5000);
  }

  async getErrorText() {
    return await this.webApp.getText(this.errorMessage);
  }
}
```

### Test Helper Class

```typescript
class TestHelper {
  constructor(private webApp: WebApplication) {}

  async safeClick(element: ElementPath, timeout = 10000) {
    try {
      await this.webApp.waitForClickable(element, timeout);
      await this.webApp.click(element);
      return true;
    } catch (error) {
      await this.webApp.makeScreenshot(true);
      console.error('Click failed:', error.message);
      return false;
    }
  }

  async waitForPageLoad() {
    await this.webApp.waitUntil(async () => {
      const readyState = await this.webApp.execute(() => document.readyState);
      return readyState === 'complete';
    }, 30000, 'Page failed to load');
  }

  async verifyElementText(element: ElementPath, expectedText: string) {
    await this.webApp.waitForVisible(element);
    const actualText = await this.webApp.getText(element);
    await this.webApp.assert.equal(actualText, expectedText,
      `Element text should be "${expectedText}" but was "${actualText}"`);
  }
}
```

## Troubleshooting

### Common Issues

#### Element Not Found
```bash
Error: Element not found
```
**Solutions:**
- Check element path syntax and selectors
- Increase wait timeout values
- Ensure page has fully loaded
- Verify element exists in DOM

#### Timeout Errors
```bash
Error: Timeout waiting for element
```
**Solutions:**
- Increase timeout values for slow operations
- Optimize wait conditions
- Check network connectivity and page performance
- Use more specific wait conditions

#### Element Not Clickable
```bash
Error: Element is not clickable
```
**Solutions:**
- Wait for element to become clickable
- Scroll element into view
- Check if element is covered by other elements
- Ensure element is enabled and visible

#### Assertion Failures
```bash
AssertionError: Expected true but got false
```
**Solutions:**
- Review assertion logic and expected values
- Check page state and timing
- Add debugging information and screenshots
- Use soft assertions for non-critical checks

### Debug Tips

```typescript
// Enable verbose logging
const webApp = new WebApplication('debug-test', transport, {
  screenshotsEnabled: true,
  screenshotPath: './debug/',
  devtool: {
    extensionId: 'debug-extension',
    httpPort: 3000,
    wsPort: 3001,
    host: 'localhost'
  }
});

// Debug element location
const element = webApp.root.button.text('Submit');
console.log('Element path:', element.toString());

// Check element state
console.log('Element exists:', await webApp.isElementsExist(element));
console.log('Element visible:', await webApp.isVisible(element));
console.log('Element enabled:', await webApp.isEnabled(element));

// Debug page state
console.log('Page title:', await webApp.getTitle());
console.log('Page URL:', await webApp.getUrl());
console.log('Page ready state:', await webApp.execute(() => document.readyState));
```

## Dependencies

- **`@testring/async-assert`** - Asynchronous assertion system
- **`@testring/element-path`** - Element path management
- **`@testring/fs-store`** - File storage for screenshots
- **`@testring/logger`** - Logging functionality
- **`@testring/transport`** - Transport layer communication
- **`@testring/utils`** - Utility functions

## Related Modules

- **`@testring/plugin-selenium-driver`** - Selenium WebDriver plugin
- **`@testring/plugin-playwright-driver`** - Playwright driver plugin
- **`@testring/browser-proxy`** - Browser proxy service
- **`@testring/devtool-extension`** - Developer tools extension

## License

MIT License - see the [LICENSE](https://github.com/ringcentral/testring/blob/master/LICENSE) file for details.