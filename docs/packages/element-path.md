# @testring/element-path

Element path management module that serves as the core element location system for the testring framework, providing powerful element selectors and XPath generation capabilities. This module implements flexible element location strategies, intelligent query parsing, fluent chaining syntax, and dynamic proxy mechanisms for precise element location and manipulation.

[![npm version](https://badge.fury.io/js/@testring/element-path.svg)](https://www.npmjs.com/package/@testring/element-path)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Overview

The element path management module is the element location core of the testring framework, providing:

- **Rich element selector syntax** with multiple query patterns and matching modes
- **Intelligent XPath generation** with automatic optimization and complex condition support
- **Fluent chaining syntax** for readable and maintainable element location expressions
- **Dynamic proxy mechanism** for flexible property access and runtime path construction
- **Text content and attribute queries** with powerful combination capabilities
- **Sub-queries and hierarchical relationships** for complex element location scenarios
- **Index selection and precise targeting** for specific element instances
- **Extensible Flow system** for custom element interaction patterns

## Key Features

### 🎯 Element Selectors
- Multiple matching modes: exact, prefix, suffix, contains, and wildcard patterns
- Custom attribute names and query rules for different testing frameworks
- Text content matching with exact and partial comparison
- Pattern combination support for complex selection criteria

### 🔧 XPath Generation
- Automatic XPath expression building with intelligent optimization
- Complex condition combinations and nested query support
- XPath 1.0 standard compatibility with function simulation
- Efficient element location path generation for fast DOM queries

### ⛓️ Fluent Chaining Syntax
- Method chaining interface for readable element path construction
- Dynamic property access with TypeScript type safety
- Element navigation with intuitive dot notation
- Highly readable element path expressions

### 🔄 Dynamic Proxy Mechanism
- Intelligent property interception and runtime processing
- Flexible extension and customization capabilities
- Backward-compatible API design
- Runtime element path construction with lazy evaluation

## Installation

```bash
# Using npm
npm install @testring/element-path

# Using yarn
yarn add @testring/element-path

# Using pnpm
pnpm add @testring/element-path
```

## Core Architecture

### ElementPath Class

The main element path management interface providing complete path construction and query functionality:

```typescript
class ElementPath {
  constructor(options?: {
    flows?: FlowsObject;
    searchMask?: SearchMaskPrimitive | null;
    searchOptions?: SearchObject;
    attributeName?: string;
    parent?: ElementPath | null;
  })

  // Path Generation Methods
  public toString(allowMultipleNodesInResult?: boolean): string
  public getElementPathChain(): NodePath[]
  public getReversedChain(withRoot?: boolean): string

  // Child Element Generation
  public generateChildElementsPath(key: string | number): ElementPath
  public generateChildByXpath(element: { id: string; xpath: string }): ElementPath

  // Query Configuration
  public getSearchOptions(): SearchObject
  public getElementType(): string | symbol
}
```

### ElementPathProxy Type

Enhanced proxy interface providing dynamic property access:

```typescript
type ElementPathProxy = ElementPath & {
  xpath: (id: string, xpath: string) => ElementPathProxy;
  __getInstance: () => ElementPath;
  __getReversedChain: ElementPath['getReversedChain'];
  [key: string]: ElementPathProxy; // Dynamic property access
};
```

### Search Configuration

```typescript
interface SearchObject {
  // Mask Matching
  anyKey?: boolean;           // Wildcard matching (*)
  prefix?: string;            // Prefix matching (foo*)
  suffix?: string;            // Suffix matching (*foo)
  exactKey?: string;          // Exact matching (foo)
  containsKey?: string;       // Contains matching (*foo*)
  parts?: string[];           // Segment matching (foo*bar)

  // Text Matching
  containsText?: string;      // Contains text {text}
  equalsText?: string;        // Equals text ={text}

  // Advanced Options
  subQuery?: SearchMaskObject & SearchTextObject; // Sub-query
  index?: number;             // Index selection
  xpath?: string;             // Custom XPath
  id?: string;                // Element identifier
}
```

## Basic Usage

### Creating Element Paths

```typescript
import { createElementPath } from '@testring/element-path';

// Create root element path
const root = createElementPath();

// Create with configuration options
const rootWithOptions = createElementPath({
  flows: {}, // Custom flow configuration
  strictMode: true // Strict mode
});

// Get the underlying instance
const elementPath = root.__getInstance();
console.log('Element type:', elementPath.getElementType());
```

### Basic Element Selection

```typescript
// Exact matching
const loginButton = root.button;
const submitBtn = root.submit;
const userPanel = root.userPanel;

// Using custom property access
const customElement = root['my-custom-element'];
const dynamicElement = root['element-' + Date.now()];

// Check generated XPath
console.log('Login button XPath:', loginButton.toString());
// Output: (//*[@data-test-automation-id='button'])[1]

console.log('Submit button XPath:', submitBtn.toString());
// Output: (//*[@data-test-automation-id='submit'])[1]
```

### Chained Element Navigation

```typescript
// Multi-level element paths
const userMenu = root.header.navigation.userMenu;
const profileLink = root.sidebar.userPanel.profileLink;
const settingsButton = root.main.content.settings.button;

// Get complete element path chain
const pathChain = userMenu.__getInstance().getElementPathChain();
console.log('Path chain:', pathChain);

// Get reversed chain representation
const reversedChain = userMenu.__getReversedChain();
console.log('Reversed chain:', reversedChain);
// Output: root.header.navigation.userMenu
```

## Advanced Query Syntax

### Wildcard and Pattern Matching

```typescript
// Wildcard matching (*)
const anyButton = root['*'];
console.log('Wildcard XPath:', anyButton.toString());
// Output: (//*[@data-test-automation-id])[1]

// Prefix matching (btn*)
const btnElements = root['btn*'];
console.log('Prefix matching XPath:', btnElements.toString());
// Output: (//*[starts-with(@data-test-automation-id, 'btn')])[1]

// Suffix matching (*button)
const buttonElements = root['*button'];
console.log('Suffix matching XPath:', buttonElements.toString());
// Output: (//*[substring(@data-test-automation-id, string-length(@data-test-automation-id) - string-length('button') + 1) = 'button'])[1]

// Contains matching (*menu*)
const menuElements = root['*menu*'];
console.log('Contains matching XPath:', menuElements.toString());
// Output: (//*[contains(@data-test-automation-id,'menu')])[1]

// Segment matching (user*panel)
const userPanelElements = root['user*panel'];
console.log('Segment matching XPath:', userPanelElements.toString());
// Output: (//*[substring(@data-test-automation-id, string-length(@data-test-automation-id) - string-length('panel') + 1) = 'panel' and starts-with(@data-test-automation-id, 'user') and string-length(@data-test-automation-id) > 9])[1]
```

### Text Content Queries

```typescript
// Elements containing specific text {text}
const submitButton = root['button{Submit}'];
console.log('Contains text XPath:', submitButton.toString());
// Output: (//*[@data-test-automation-id='button' and contains(., "Submit")])[1]

// Elements with exact text match ={text}
const exactTextButton = root['button={Login}'];
console.log('Exact text XPath:', exactTextButton.toString());
// Output: (//*[@data-test-automation-id='button' and . = "Login"])[1]

// Text-only queries (no attribute restriction)
const anyElementWithText = root['{Click here}'];
const anyElementExactText = root['={Confirm}'];

// Combined queries: prefix + text
const prefixTextElement = root['btn*{Save}'];
const suffixTextElement = root['*button{Cancel}'];
const containsTextElement = root['*menu*{Settings}'];
```

### Sub-queries and Hierarchical Relationships

```typescript
// Sub-query syntax: parent-element(child-element-condition)
const formWithSubmit = root['form(button{Submit})'];
console.log('Sub-query XPath:', formWithSubmit.toString());
// Output: (//*[@data-test-automation-id='form' and descendant::*[@data-test-automation-id='button' and contains(., "Submit")]])[1]

// Complex sub-queries
const complexSubQuery = root['panel(input*{Username})'];
const nestedSubQuery = root['container(form(button{Submit}))'];

// Sub-query with wildcards
const anyPanelWithButton = root['*(button)'];
const prefixPanelWithInput = root['user*(input)'];

// Sub-query with text
const panelWithTextAndButton = root['panel{User Info}(button{Edit})'];
```

## Index Selection and Precise Positioning

### Array Index Access

```typescript
// Index selection (starting from 0)
const firstButton = root.button[0];
const secondInput = root.input[1];
const thirdListItem = root.listItem[2];

console.log('First button XPath:', firstButton.toString());
// Output: (//*[@data-test-automation-id='button'])[1]

console.log('Second input XPath:', secondInput.toString());
// Output: (//*[@data-test-automation-id='input'])[2]

// Complex path index selection
const secondMenuButton = root.navigation.menu[1].button;
const thirdFormInput = root.form.fieldset[2].input;

// Index combined with query
const secondSubmitButton = root['button{Submit}'][1];
const firstPrefixElement = root['btn*'][0];
```

### Multiple Element Result Handling

```typescript
// XPath allowing multiple results (no [1] suffix added)
const allButtons = root.button.__getInstance().toString(true);
console.log('All buttons XPath:', allButtons);
// Output: //*[@data-test-automation-id='button']

// Get paths for all matching elements
const allMenuItems = root.menuItem.__getInstance().toString(true);
const allInputFields = root['input*'].__getInstance().toString(true);
```

## Custom XPath and Element Location

### Direct XPath Definition

```typescript
// Use custom XPath
const customElement = root.xpath('custom-1', '//div[@class="special"]');
console.log('Custom XPath:', customElement.toString());
// Output: (//div[@class="special"])[1]

// Complex XPath expression
const complexXPath = root.xpath(
  'complex-query',
  '//form[contains(@class, "login")]//input[@type="password"]'
);

// Combine XPath with chaining
const xpathElement = root.panel.xpath('custom', '//button[@disabled]');
const chainedXPath = root.xpath('form', '//form').input.submit;
```

### Element Locator

```typescript
// Use element locator (recommended to use xpath method)
const elementByLocator = root.xpathByElement({
  id: 'special-button',
  xpath: '//button[@data-special="true"]'
});

// Locator combined with index
const indexedLocator = root.xpath('indexed', '//div[@class="item"]')[2];
```

## Flow System

### Custom Flow Configuration

```typescript
import { createElementPath, FlowsObject } from '@testring/element-path';

// Define custom flows
const customFlows: FlowsObject = {
  'loginForm': {
    'quickLogin': () => {
      console.log('Execute quick login flow');
      return 'quick-login-completed';
    },
    'socialLogin': () => {
      console.log('Execute social login flow');
      return 'social-login-completed';
    }
  },
  'userPanel': {
    'showProfile': () => {
      console.log('Show user profile');
      return 'profile-shown';
    },
    'editSettings': () => {
      console.log('Edit user settings');
      return 'settings-edited';
    }
  }
};

// Create element path with flows
const rootWithFlows = createElementPath({ flows: customFlows });

// Check if flow exists
const loginForm = rootWithFlows.loginForm;
const hasQuickLogin = loginForm.__getInstance().hasFlow('quickLogin');
console.log('Has quick login flow:', hasQuickLogin);

// Get and execute flow
if (hasQuickLogin) {
  const quickLoginFlow = loginForm.__getInstance().getFlow('quickLogin');
  if (quickLoginFlow) {
    const result = quickLoginFlow();
    console.log('Flow execution result:', result);
  }
}

// Get all available flows
const allFlows = loginForm.__getInstance().getFlows();
console.log('Available flows:', Object.keys(allFlows));
```

### Dynamic Flow Registration

```typescript
class FlowManager {
  private flows: FlowsObject = {};
  
  // Register flow
  registerFlow(elementKey: string, flowName: string, flowFn: () => any) {
    if (!this.flows[elementKey]) {
      this.flows[elementKey] = {};
    }
    this.flows[elementKey][flowName] = flowFn;
  }
  
  // Get flow configuration
  getFlows(): FlowsObject {
    return this.flows;
  }
  
  // Execute flow
  executeFlow(elementPath: ElementPath, flowName: string): any {
    const flow = elementPath.getFlow(flowName);
    if (flow) {
      return flow();
    }
    throw new Error(`Flow "${flowName}" does not exist`);
  }
}

// Use flow manager
const flowManager = new FlowManager();

// Register business flows
flowManager.registerFlow('orderForm', 'submitOrder', () => {
  console.log('Submit order flow');
  return { orderId: '12345', status: 'submitted' };
});

flowManager.registerFlow('productCard', 'addToCart', () => {
  console.log('Add to cart flow');
  return { cartItems: 1, totalPrice: 99.99 };
});

// Create element path with dynamic flows
const dynamicRoot = createElementPath({ flows: flowManager.getFlows() });

// Execute business flow
const orderForm = dynamicRoot.orderForm;
const submitResult = flowManager.executeFlow(
  orderForm.__getInstance(),
  'submitOrder'
);
console.log('Order submission result:', submitResult);
```

## Advanced Features and Extensions

### Custom Attribute Name

```typescript
import { ElementPath } from '@testring/element-path';

// Use custom attribute name
const customAttrElement = new ElementPath({
  attributeName: 'data-qa-id', // Use data-qa-id instead of default data-test-automation-id
  searchMask: 'submitButton'
});

console.log('Custom attribute XPath:', customAttrElement.toString());
// Output: (//*[@data-qa-id='submitButton'])[1]

// Create proxy for custom attribute
function createCustomElementPath(attributeName: string) {
  const customPath = new ElementPath({ attributeName });
  return require('./proxify').proxify(customPath, false);
}

const qaRoot = createCustomElementPath('data-qa');
const seleniumRoot = createCustomElementPath('data-selenium');
```

### Path Chain Analysis and Debugging

```typescript
class ElementPathAnalyzer {
  static analyzeElementPath(elementPath: ElementPath) {
    const pathChain = elementPath.getElementPathChain();
    const searchOptions = elementPath.getSearchOptions();
    const elementType = elementPath.getElementType();
    
    return {
      pathLength: pathChain.length,
      hasRoot: pathChain.some(node => node.isRoot),
      searchOptions,
      elementType,
      xpath: elementPath.toString(),
      reversedChain: elementPath.getReversedChain(),
      pathChain: pathChain.map(node => ({
        isRoot: node.isRoot,
        name: node.name,
        query: node.query,
        xpath: node.xpath
      }))
    };
  }
  
  static debugElementPath(elementPath: ElementPath, label: string) {
    console.group(`🔍 Element Path Analysis: ${label}`);
    
    const analysis = this.analyzeElementPath(elementPath);
    
    console.log('📏 Path length:', analysis.pathLength);
    console.log('🏠 Has root node:', analysis.hasRoot);
    console.log('🔤 Element type:', analysis.elementType.toString());
    console.log('🎯 XPath expression:', analysis.xpath);
    console.log('🔗 Reversed chain:', analysis.reversedChain);
    console.log('⚙️ Search options:', analysis.searchOptions);
    
    console.group('🌳 Path Chain Details:');
    analysis.pathChain.forEach((node, index) => {
      console.log(`${index + 1}. ${node.isRoot ? '[Root]' : '[Node]'}`, {
        name: node.name,
        query: node.query,
        xpath: node.xpath
      });
    });
    console.groupEnd();
    
    console.groupEnd();
  }
}

// Use analyzer
const complexPath = root.header.navigation.userMenu.dropdown.profileLink;
ElementPathAnalyzer.debugElementPath(
  complexPath.__getInstance(),
  'Complex user menu path'
);

const queryPath = root['form{Login}(input*{Username})'][1];
ElementPathAnalyzer.debugElementPath(
  queryPath.__getInstance(),
  'Complex query path'
);
```

### Element Path Validation and Testing

```typescript
class ElementPathValidator {
  // Validate XPath syntax
  static validateXPath(xpath: string): { valid: boolean; error?: string } {
    try {
      // Here you can integrate an XPath parsing library for validation
      // Simple basic validation
      if (!xpath || xpath.trim() === '') {
        return { valid: false, error: 'XPath cannot be empty' };
      }
      
      if (!xpath.startsWith('/') && !xpath.startsWith('(')) {
        return { valid: false, error: 'XPath syntax is incorrect' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  // Validate element path configuration
  static validateSearchOptions(options: SearchObject): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check conflicting options
    const maskOptions = ['anyKey', 'prefix', 'suffix', 'exactKey', 'containsKey', 'parts'];
    const activeMaskOptions = maskOptions.filter(opt => options[opt] !== undefined);
    
    if (activeMaskOptions.length > 1) {
      errors.push(`Mask options conflict: ${activeMaskOptions.join(', ')}`);
    }
    
    // Check text options
    const textOptions = ['containsText', 'equalsText'];
    const activeTextOptions = textOptions.filter(opt => options[opt] !== undefined);
    
    if (activeTextOptions.length > 1) {
      errors.push(`Text options conflict: ${activeTextOptions.join(', ')}`);
    }
    
    // Check index value
    if (options.index !== undefined && (!Number.isInteger(options.index) || options.index < 0)) {
      errors.push('Index must be a non-negative integer');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  // Test element path generation
  static testElementPath(elementPath: ElementPath): {
    success: boolean;
    xpath: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let xpath = '';
    
    try {
      // Validate search options
      const searchValidation = this.validateSearchOptions(elementPath.getSearchOptions());
      if (!searchValidation.valid) {
        errors.push(...searchValidation.errors);
      }
      
      // Generate XPath
      xpath = elementPath.toString();
      
      // Validate generated XPath
      const xpathValidation = this.validateXPath(xpath);
      if (!xpathValidation.valid) {
        errors.push(`XPath validation failed: ${xpathValidation.error}`);
      }
      
    } catch (error) {
      errors.push(`Path generation exception: ${error.message}`);
    }
    
    return {
      success: errors.length === 0,
      xpath,
      errors
    };
  }
}

// Use validator
const paths = [
  root.button,
  root['btn*{Submit}'],
  root['form(input{Username})'][0],
  root.xpath('custom', '//invalid xpath')
];

paths.forEach((path, index) => {
  const result = ElementPathValidator.testElementPath(path.__getInstance());
  console.log(`Path ${index + 1} validation result:`, result);
});
```

## Actual Application Scenarios

### Page Object Pattern

```typescript
class LoginPageElements {
  private root = createElementPath();
  
  // Form elements
  get usernameInput() { return this.root.loginForm.usernameInput; }
  get passwordInput() { return this.root.loginForm.passwordInput; }
  get rememberCheckbox() { return this.root.loginForm.rememberMe; }
  get submitButton() { return this.root.loginForm.submitButton; }
  
  // Validation messages
  get errorMessage() { return this.root.errorPanel.message; }
  get successMessage() { return this.root.successPanel.message; }
  
  // Social login
  get googleLoginButton() { return this.root.socialLogin.googleButton; }
  get facebookLoginButton() { return this.root.socialLogin.facebookButton; }
  
  // Links
  get forgotPasswordLink() { return this.root.footer.forgotPasswordLink; }
  get registerLink() { return this.root.footer.registerLink; }
  
  // Combined query example
  get visibleErrorMessage() { return this.root['errorPanel{Error}']; }
  get enabledSubmitButton() { return this.root['submitButton{Login}'][0]; }
  
  // Debug method
  debugElements() {
    const elements = {
      usernameInput: this.usernameInput.toString(),
      passwordInput: this.passwordInput.toString(),
      submitButton: this.submitButton.toString(),
      errorMessage: this.errorMessage.toString()
    };
    
    console.table(elements);
  }
}

// Use page object
const loginPage = new LoginPageElements();
loginPage.debugElements();
```

### Component Library Element Location

```typescript
class ComponentLibraryElements {
  private root = createElementPath();
  
  // Button component
  primaryButton(text?: string) {
    return text 
      ? this.root[`primary-button{${text}}`]
      : this.root.primaryButton;
  }
  
  secondaryButton(text?: string) {
    return text 
      ? this.root[`secondary-button{${text}}`]
      : this.root.secondaryButton;
  }
  
  // Input component
  textInput(label?: string) {
    return label
      ? this.root[`text-input(label{${label}})`]
      : this.root.textInput;
  }
  
  selectInput(label?: string) {
    return label
      ? this.root[`select-input(label{${label}})`]
      : this.root.selectInput;
  }
  
  // Modal component
  modal(title?: string) {
    return title
      ? this.root[`modal(header{${title}})`]
      : this.root.modal;
  }
  
  modalCloseButton(modalTitle?: string) {
    const modal = modalTitle ? this.modal(modalTitle) : this.root.modal;
    return modal.closeButton;
  }
  
  // Table component
  tableRow(index: number) {
    return this.root.dataTable.tableBody.tableRow[index];
  }
  
  tableCell(rowIndex: number, columnIndex: number) {
    return this.tableRow(rowIndex).tableCell[columnIndex];
  }
  
  tableCellWithText(text: string) {
    return this.root.dataTable[`tableCell{${text}}`];
  }
  
  // Navigation component
  navItem(text: string) {
    return this.root.navigation[`navItem{${text}}`];
  }
  
  breadcrumb(text: string) {
    return this.root.breadcrumb[`breadcrumbItem{${text}}`];
  }
}

// Use component locator
const components = new ComponentLibraryElements();

// Get specific buttons
const saveButton = components.primaryButton('Save');
const cancelButton = components.secondaryButton('Cancel');

// Get form inputs
const emailInput = components.textInput('Email Address');
const countrySelect = components.selectInput('Country');

// Get modal elements
const confirmModal = components.modal('Confirm Delete');
const confirmModalClose = components.modalCloseButton('Confirm Delete');

// Get table elements
const firstRowSecondCell = components.tableCell(0, 1);
const cellWithUserName = components.tableCellWithText('Zhang San');

console.log('Component XPath example:');
console.log('Save button:', saveButton.toString());
console.log('Email input:', emailInput.toString());
console.log('Confirm modal:', confirmModal.toString());
console.log('Table cell:', firstRowSecondCell.toString());
```

### Dynamic Element Factory

```typescript
class DynamicElementFactory {
  private root = createElementPath();
  
  // Create element by attribute
  byAttribute(attributeName: string, value: string) {
    const customPath = new ElementPath({
      attributeName,
      searchMask: value
    });
    return require('./proxify').proxify(customPath, false);
  }
  
  // Create element by class name
  byClassName(className: string) {
    return this.root.xpath('by-class', `//*[@class='${className}']`);
  }
  
  // Create element by tag and attribute combination
  byTagAndAttribute(tagName: string, attributeName: string, value: string) {
    return this.root.xpath(
      'by-tag-attr',
      `//${tagName}[@${attributeName}='${value}']`
    );
  }
  
  // Create element by text content
  byText(text: string, exact = false) {
    return exact 
      ? this.root[`={${text}}`]
      : this.root[`{${text}}`];
  }
  
  // Create element by text and index combination
  byTextAndIndex(text: string, index: number) {
    return this.root[`{${text}}`][index];
  }
  
  // Complex condition combination
  complex(conditions: {
    tag?: string;
    attributes?: Record<string, string>;
    text?: string;
    exactText?: boolean;
    index?: number;
    parent?: any;
  }) {
    let xpath = '';
    
    // Build base XPath
    if (conditions.tag) {
      xpath += `//${conditions.tag}`;
    } else {
      xpath += '//*';
    }
    
    // Add attribute conditions
    const attrConditions: string[] = [];
    if (conditions.attributes) {
      Object.entries(conditions.attributes).forEach(([attr, value]) => {
        attrConditions.push(`@${attr}='${value}'`);
      });
    }
    
    // Add text conditions
    if (conditions.text) {
      if (conditions.exactText) {
        attrConditions.push(`. = "${conditions.text}"`);
      } else {
        attrConditions.push(`contains(., "${conditions.text}")`);
      }
    }
    
    // Combine conditions
    if (attrConditions.length > 0) {
      xpath += `[${attrConditions.join(' and ')}]`;
    }
    
    // Add index
    if (typeof conditions.index === 'number') {
      xpath += `[${conditions.index + 1}]`;
    }
    
    // Create element
    const element = (conditions.parent || this.root).xpath('complex', xpath);
    return element;
  }
}

// Use dynamic factory
const factory = new DynamicElementFactory();

// Various dynamic creation methods
const qaElement = factory.byAttribute('data-qa', 'submit-button');
const classElement = factory.byClassName('btn btn-primary');
const tagAttrElement = factory.byTagAndAttribute('input', 'type', 'email');
const textElement = factory.byText('Click here');
const indexedTextElement = factory.byTextAndIndex('Submit', 1);

// Complex condition creation
const complexElement = factory.complex({
  tag: 'button',
  attributes: {
    'type': 'submit',
    'class': 'btn-primary'
  },
  text: 'Confirm Submit',
  exactText: false,
  index: 0
});

console.log('Dynamic element XPath:');
console.log('QA element:', qaElement.toString());
console.log('Class name element:', classElement.toString());
console.log('Complex element:', complexElement.toString());
```

## Best Practices

### 1. Selector Design
- **Prefer stable identifiers**: Use `data-test-automation-id` over CSS classes or structure-dependent selectors
- **Avoid deep nesting**: Keep element paths reasonably shallow for maintainability
- **Use meaningful names**: Choose descriptive element identifiers that reflect their purpose
- **Establish naming conventions**: Maintain consistent naming patterns across your test suite

### 2. Path Management
- **Organize with Page Objects**: Use page object pattern to group related elements
- **Avoid excessive deep nesting**: Keep element paths reasonably shallow for maintainability
- **Use index selection wisely**: Use index only on the final element in the chain
- **Regularly validate and update element paths**: Track changes to element identifiers

### 3. Performance Optimization
- **Avoid generating overly complex XPath**: Generate precise XPath expressions
- **Use exact matching when possible**: Exact matching is faster than fuzzy search
- **Use sub-queries wisely**: Sub-queries are powerful but can impact performance
- **Cache frequently used paths**: Store commonly used element paths in variables

### 4. Maintainability
- **Organize with Page Objects**: Use page object pattern to group related elements
- **Document complex queries**: Add comments for non-obvious selector patterns
- **Validate XPath output**: Regularly check generated XPath expressions
- **Version control element maps**: Track changes to element identifiers

### 5. Debugging and Troubleshooting
- **Use analysis tools to check path structure**: Analyze element paths for debugging
- **Validate XPath syntax**: Regularly check generated XPath expressions
- **Record changes to element location**: Track changes to element identifiers
- **Implement error handling and retries**: Handle element not found scenarios

## Troubleshooting

### Common Issues

1. **Invalid query syntax**:
   ```
   TypeError: Invalid query key
   ```
   - Check bracket matching and special character escaping
   - Verify text query syntax `{text}` or `={text}`

2. **XPath generation errors**:
   ```
   Error: Both start and end parts must be defined
   ```
   - Ensure segment matching syntax is correct
   - Check wildcard usage in pattern matching

3. **Index out of range**:
   ```
   Error: Can not select index element from already sliced element
   ```
   - Avoid using index on already indexed elements
   - Use index only on the final element in the chain

4. **Flow not found**:
   ```
   TypeError: Flow xxx is not a function
   ```
   - Verify flow configuration and naming
   - Check that flows are properly registered

### Debug Tips

```typescript
// Enable detailed debugging
const debugElement = root.complexElement;
console.log('Element info:', {
  xpath: debugElement.toString(),
  searchOptions: debugElement.__getInstance().getSearchOptions(),
  elementType: debugElement.__getInstance().getElementType(),
  pathChain: debugElement.__getInstance().getElementPathChain()
});

// Validate query syntax
try {
  const testElement = root['valid{syntax}'][0];
  console.log('Query valid:', testElement.toString());
} catch (error) {
  console.error('Query syntax error:', error.message);
}
```

## Dependencies

- **`@testring/types`** - TypeScript type definitions
- **`@testring/utils`** - Utility functions and helpers

## Related Modules

- **`@testring/web-application`** - Web application testing utilities
- **`@testring/plugin-selenium-driver`** - Selenium WebDriver integration
- **`@testring/plugin-playwright-driver`** - Playwright integration

## License

MIT License - see the [LICENSE](https://github.com/ringcentral/testring/blob/master/LICENSE) file for details.