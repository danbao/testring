# @testring/element-path

元素路径管理模块，作为 testring 框架的核心元素定位系统，提供强大的元素选择器和 XPath 生成能力。该模块实现了灵活的元素定位策略、智能的查询解析、链式调用语法和动态代理机制，是进行精确元素定位和操作的基础组件。

[![npm version](https://badge.fury.io/js/@testring/element-path.svg)](https://www.npmjs.com/package/@testring/element-path)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## 功能概述

元素路径管理模块是 testring 框架的元素定位核心，提供了：
- 丰富的元素选择器语法和查询模式
- 智能的 XPath 自动生成和优化
- 链式调用语法支持流畅的元素定位
- 动态代理机制实现灵活的属性访问
- 文本内容和属性组合查询能力
- 子查询和层级关系定位支持
- 索引选择和精确定位功能
- 可扩展的流程（Flow）系统

## 主要特性

### 元素选择器
- 精确匹配、前缀、后缀、包含等多种匹配模式
- 通配符和模式组合支持
- 自定义属性名称和查询规则
- 文本内容匹配和等值比较

### XPath 生成
- 自动 XPath 表达式构建和优化
- 复杂条件组合和嵌套查询
- 兼容 XPath 1.0 标准的函数模拟
- 高效的元素定位路径生成

### 链式语法
- 流畅的方法链调用接口
- 动态属性访问和元素导航
- 类型安全的 TypeScript 支持
- 可读性强的元素路径表达式

### 代理机制
- 智能的属性拦截和处理
- 运行时元素路径构建
- 灵活的扩展和自定义能力
- 向后兼容的 API 设计

## 安装

```bash
npm install @testring/element-path
```

或使用 yarn：

```bash
yarn add @testring/element-path
```

## 核心架构

### ElementPath 类
主要的元素路径管理接口，提供完整的路径构建和查询功能：

```typescript
class ElementPath {
  constructor(options?: {
    flows?: FlowsObject;
    searchMask?: SearchMaskPrimitive | null;
    searchOptions?: SearchObject;
    attributeName?: string;
    parent?: ElementPath | null;
  })
  
  // 路径生成方法
  public toString(allowMultipleNodesInResult?: boolean): string
  public getElementPathChain(): NodePath[]
  public getReversedChain(withRoot?: boolean): string
  
  // 子元素生成
  public generateChildElementsPath(key: string | number): ElementPath
  public generateChildByXpath(element: { id: string; xpath: string }): ElementPath
  
  // 查询配置
  public getSearchOptions(): SearchObject
  public getElementType(): string | symbol
}
```

### ElementPathProxy 类型
增强的代理接口，提供动态属性访问：

```typescript
type ElementPathProxy = ElementPath & {
  xpath: (id: string, xpath: string) => ElementPathProxy;
  __getInstance: () => ElementPath;
  __getReversedChain: ElementPath['getReversedChain'];
  [key: string]: ElementPathProxy; // 动态属性访问
};
```

### 查询配置
```typescript
interface SearchObject {
  // 掩码匹配
  anyKey?: boolean;           // 通配符匹配 (*)
  prefix?: string;            // 前缀匹配 (foo*)
  suffix?: string;            // 后缀匹配 (*foo)
  exactKey?: string;          // 精确匹配 (foo)
  containsKey?: string;       // 包含匹配 (*foo*)
  parts?: string[];           // 分段匹配 (foo*bar)
  
  // 文本匹配
  containsText?: string;      // 包含文本 {text}
  equalsText?: string;        // 等于文本 ={text}
  
  // 高级选项
  subQuery?: SearchMaskObject & SearchTextObject; // 子查询
  index?: number;             // 索引选择
  xpath?: string;             // 自定义 XPath
  id?: string;                // 元素标识
}
```

## 基本用法

### 创建元素路径

```typescript
import { createElementPath } from '@testring/element-path';

// 创建根元素路径
const root = createElementPath();

// 带配置选项的创建
const rootWithOptions = createElementPath({
  flows: {}, // 自定义流程配置
  strictMode: true // 严格模式
});

// 获取原始实例
const elementPath = root.__getInstance();
console.log('元素类型:', elementPath.getElementType());
```

### 基础元素选择

```typescript
// 精确匹配
const loginButton = root.button;
const submitBtn = root.submit;
const userPanel = root.userPanel;

// 使用自定义属性访问
const customElement = root['my-custom-element'];
const dynamicElement = root['element-' + Date.now()];

// 检查生成的 XPath
console.log('登录按钮 XPath:', loginButton.toString());
// 输出: (//*[@data-test-automation-id='button'])[1]

console.log('提交按钮 XPath:', submitBtn.toString());
// 输出: (//*[@data-test-automation-id='submit'])[1]
```

### 链式元素导航

```typescript
// 多级元素路径
const userMenu = root.header.navigation.userMenu;
const profileLink = root.sidebar.userPanel.profileLink;
const settingsButton = root.main.content.settings.button;

// 获取完整的元素路径链
const pathChain = userMenu.__getInstance().getElementPathChain();
console.log('路径链:', pathChain);

// 获取反向链式表示
const reversedChain = userMenu.__getReversedChain();
console.log('反向链:', reversedChain);
// 输出: root.header.navigation.userMenu
```

## 高级查询语法

### 通配符和模式匹配

```typescript
// 通配符匹配 (*)
const anyButton = root['*'];
console.log('通配符 XPath:', anyButton.toString());
// 输出: (//*[@data-test-automation-id])[1]

// 前缀匹配 (btn*)
const btnElements = root['btn*'];
console.log('前缀匹配 XPath:', btnElements.toString());
// 输出: (//*[starts-with(@data-test-automation-id, 'btn')])[1]

// 后缀匹配 (*button)
const buttonElements = root['*button'];
console.log('后缀匹配 XPath:', buttonElements.toString());
// 输出: (//*[substring(@data-test-automation-id, string-length(@data-test-automation-id) - string-length('button') + 1) = 'button'])[1]

// 包含匹配 (*menu*)
const menuElements = root['*menu*'];
console.log('包含匹配 XPath:', menuElements.toString());
// 输出: (//*[contains(@data-test-automation-id,'menu')])[1]

// 分段匹配 (user*panel)
const userPanelElements = root['user*panel'];
console.log('分段匹配 XPath:', userPanelElements.toString());
// 输出: (//*[substring(@data-test-automation-id, string-length(@data-test-automation-id) - string-length('panel') + 1) = 'panel' and starts-with(@data-test-automation-id, 'user') and string-length(@data-test-automation-id) > 9])[1]
```

### 文本内容查询

```typescript
// 包含指定文本的元素 {text}
const submitButton = root['button{提交}'];
console.log('包含文本 XPath:', submitButton.toString());
// 输出: (//*[@data-test-automation-id='button' and contains(., "提交")])[1]

// 文本完全匹配的元素 ={text}
const exactTextButton = root['button={登录}'];
console.log('精确文本 XPath:', exactTextButton.toString());
// 输出: (//*[@data-test-automation-id='button' and . = "登录"])[1]

// 仅文本查询（不限制属性）
const anyElementWithText = root['{点击这里}'];
const anyElementExactText = root['={确认}'];

// 组合查询：前缀 + 文本
const prefixTextElement = root['btn*{保存}'];
const suffixTextElement = root['*button{取消}'];
const containsTextElement = root['*menu*{设置}'];
```

### 子查询和层级关系

```typescript
// 子查询语法：父元素(子元素条件)
const formWithSubmit = root['form(button{提交})'];
console.log('子查询 XPath:', formWithSubmit.toString());
// 输出: (//*[@data-test-automation-id='form' and descendant::*[@data-test-automation-id='button' and contains(., "提交")]])[1]

// 复杂子查询
const complexSubQuery = root['panel(input*{用户名})'];
const nestedSubQuery = root['container(form(button{提交}))'];

// 子查询与通配符结合
const anyPanelWithButton = root['*(button)'];
const prefixPanelWithInput = root['user*(input)'];

// 子查询与文本结合
const panelWithTextAndButton = root['panel{用户信息}(button{编辑})'];
```

## 索引选择和精确定位

### 数组索引访问

```typescript
// 索引选择（从0开始）
const firstButton = root.button[0];
const secondInput = root.input[1];
const thirdListItem = root.listItem[2];

console.log('第一个按钮 XPath:', firstButton.toString());
// 输出: (//*[@data-test-automation-id='button'])[1]

console.log('第二个输入框 XPath:', secondInput.toString());
// 输出: (//*[@data-test-automation-id='input'])[2]

// 复杂路径的索引选择
const secondMenuButton = root.navigation.menu[1].button;
const thirdFormInput = root.form.fieldset[2].input;

// 索引与查询组合
const secondSubmitButton = root['button{提交}'][1];
const firstPrefixElement = root['btn*'][0];
```

### 多元素结果处理

```typescript
// 允许多个结果的 XPath（不添加 [1] 后缀）
const allButtons = root.button.__getInstance().toString(true);
console.log('所有按钮 XPath:', allButtons);
// 输出: //*[@data-test-automation-id='button']

// 获取所有匹配元素的路径
const allMenuItems = root.menuItem.__getInstance().toString(true);
const allInputFields = root['input*'].__getInstance().toString(true);
```

## 自定义 XPath 和元素定位

### 直接 XPath 定义

```typescript
// 使用自定义 XPath
const customElement = root.xpath('custom-1', '//div[@class="special"]');
console.log('自定义 XPath:', customElement.toString());
// 输出: (//div[@class="special"])[1]

// 复杂 XPath 表达式
const complexXPath = root.xpath(
  'complex-query',
  '//form[contains(@class, "login")]//input[@type="password"]'
);

// XPath 与链式调用结合
const xpathElement = root.panel.xpath('custom', '//button[@disabled]');
const chainedXPath = root.xpath('form', '//form').input.submit;
```

### 元素定位器

```typescript
// 使用元素定位器（推荐使用 xpath 方法）
const elementByLocator = root.xpathByElement({
  id: 'special-button',
  xpath: '//button[@data-special="true"]'
});

// 定位器与索引结合
const indexedLocator = root.xpath('indexed', '//div[@class="item"]')[2];
```

## 流程（Flow）系统

### 自定义流程配置

```typescript
import { createElementPath, FlowsObject } from '@testring/element-path';

// 定义自定义流程
const customFlows: FlowsObject = {
  'loginForm': {
    'quickLogin': () => {
      console.log('执行快速登录流程');
      return 'quick-login-completed';
    },
    'socialLogin': () => {
      console.log('执行社交登录流程');
      return 'social-login-completed';
    }
  },
  'userPanel': {
    'showProfile': () => {
      console.log('显示用户资料');
      return 'profile-shown';
    },
    'editSettings': () => {
      console.log('编辑用户设置');
      return 'settings-edited';
    }
  }
};

// 创建带流程的元素路径
const rootWithFlows = createElementPath({ flows: customFlows });

// 检查流程是否存在
const loginForm = rootWithFlows.loginForm;
const hasQuickLogin = loginForm.__getInstance().hasFlow('quickLogin');
console.log('是否有快速登录流程:', hasQuickLogin);

// 获取并执行流程
if (hasQuickLogin) {
  const quickLoginFlow = loginForm.__getInstance().getFlow('quickLogin');
  if (quickLoginFlow) {
    const result = quickLoginFlow();
    console.log('流程执行结果:', result);
  }
}

// 获取所有可用流程
const allFlows = loginForm.__getInstance().getFlows();
console.log('可用流程:', Object.keys(allFlows));
```

### 动态流程注册

```typescript
class FlowManager {
  private flows: FlowsObject = {};
  
  // 注册流程
  registerFlow(elementKey: string, flowName: string, flowFn: () => any) {
    if (!this.flows[elementKey]) {
      this.flows[elementKey] = {};
    }
    this.flows[elementKey][flowName] = flowFn;
  }
  
  // 获取流程配置
  getFlows(): FlowsObject {
    return this.flows;
  }
  
  // 执行流程
  executeFlow(elementPath: ElementPath, flowName: string): any {
    const flow = elementPath.getFlow(flowName);
    if (flow) {
      return flow();
    }
    throw new Error(`流程 "${flowName}" 不存在`);
  }
}

// 使用流程管理器
const flowManager = new FlowManager();

// 注册业务流程
flowManager.registerFlow('orderForm', 'submitOrder', () => {
  console.log('提交订单流程');
  return { orderId: '12345', status: 'submitted' };
});

flowManager.registerFlow('productCard', 'addToCart', () => {
  console.log('添加到购物车流程');
  return { cartItems: 1, totalPrice: 99.99 };
});

// 创建带动态流程的元素路径
const dynamicRoot = createElementPath({ flows: flowManager.getFlows() });

// 执行业务流程
const orderForm = dynamicRoot.orderForm;
const submitResult = flowManager.executeFlow(
  orderForm.__getInstance(),
  'submitOrder'
);
console.log('订单提交结果:', submitResult);
```

## 高级功能和扩展

### 自定义属性名称

```typescript
import { ElementPath } from '@testring/element-path';

// 使用自定义属性名称
const customAttrElement = new ElementPath({
  attributeName: 'data-qa-id', // 使用 data-qa-id 而非默认的 data-test-automation-id
  searchMask: 'submitButton'
});

console.log('自定义属性 XPath:', customAttrElement.toString());
// 输出: (//*[@data-qa-id='submitButton'])[1]

// 创建自定义属性的代理
function createCustomElementPath(attributeName: string) {
  const customPath = new ElementPath({ attributeName });
  return require('./proxify').proxify(customPath, false);
}

const qaRoot = createCustomElementPath('data-qa');
const seleniumRoot = createCustomElementPath('data-selenium');
```

### 路径链分析和调试

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
    console.group(`🔍 元素路径分析: ${label}`);
    
    const analysis = this.analyzeElementPath(elementPath);
    
    console.log('📏 路径长度:', analysis.pathLength);
    console.log('🏠 包含根节点:', analysis.hasRoot);
    console.log('🔤 元素类型:', analysis.elementType.toString());
    console.log('🎯 XPath 表达式:', analysis.xpath);
    console.log('🔗 反向链:', analysis.reversedChain);
    console.log('⚙️ 搜索选项:', analysis.searchOptions);
    
    console.group('🌳 路径链详情:');
    analysis.pathChain.forEach((node, index) => {
      console.log(`${index + 1}. ${node.isRoot ? '[根]' : '[节点]'}`, {
        name: node.name,
        query: node.query,
        xpath: node.xpath
      });
    });
    console.groupEnd();
    
    console.groupEnd();
  }
}

// 使用分析器
const complexPath = root.header.navigation.userMenu.dropdown.profileLink;
ElementPathAnalyzer.debugElementPath(
  complexPath.__getInstance(),
  '复杂用户菜单路径'
);

const queryPath = root['form{登录}(input*{用户名})'][1];
ElementPathAnalyzer.debugElementPath(
  queryPath.__getInstance(),
  '复杂查询路径'
);
```

### 元素路径验证和测试

```typescript
class ElementPathValidator {
  // 验证 XPath 语法
  static validateXPath(xpath: string): { valid: boolean; error?: string } {
    try {
      // 这里可以集成 XPath 解析库进行验证
      // 简单的基础验证
      if (!xpath || xpath.trim() === '') {
        return { valid: false, error: 'XPath 不能为空' };
      }
      
      if (!xpath.startsWith('/') && !xpath.startsWith('(')) {
        return { valid: false, error: 'XPath 格式不正确' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  // 验证元素路径配置
  static validateSearchOptions(options: SearchObject): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 检查互斥选项
    const maskOptions = ['anyKey', 'prefix', 'suffix', 'exactKey', 'containsKey', 'parts'];
    const activeMaskOptions = maskOptions.filter(opt => options[opt] !== undefined);
    
    if (activeMaskOptions.length > 1) {
      errors.push(`掩码选项冲突: ${activeMaskOptions.join(', ')}`);
    }
    
    // 检查文本选项
    const textOptions = ['containsText', 'equalsText'];
    const activeTextOptions = textOptions.filter(opt => options[opt] !== undefined);
    
    if (activeTextOptions.length > 1) {
      errors.push(`文本选项冲突: ${activeTextOptions.join(', ')}`);
    }
    
    // 检查索引值
    if (options.index !== undefined && (!Number.isInteger(options.index) || options.index < 0)) {
      errors.push('索引必须是非负整数');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  // 测试元素路径生成
  static testElementPath(elementPath: ElementPath): {
    success: boolean;
    xpath: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let xpath = '';
    
    try {
      // 验证搜索选项
      const searchValidation = this.validateSearchOptions(elementPath.getSearchOptions());
      if (!searchValidation.valid) {
        errors.push(...searchValidation.errors);
      }
      
      // 生成 XPath
      xpath = elementPath.toString();
      
      // 验证生成的 XPath
      const xpathValidation = this.validateXPath(xpath);
      if (!xpathValidation.valid) {
        errors.push(`XPath 验证失败: ${xpathValidation.error}`);
      }
      
    } catch (error) {
      errors.push(`路径生成异常: ${error.message}`);
    }
    
    return {
      success: errors.length === 0,
      xpath,
      errors
    };
  }
}

// 使用验证器
const paths = [
  root.button,
  root['btn*{提交}'],
  root['form(input{用户名})'][0],
  root.xpath('custom', '//invalid xpath')
];

paths.forEach((path, index) => {
  const result = ElementPathValidator.testElementPath(path.__getInstance());
  console.log(`路径 ${index + 1} 验证结果:`, result);
});
```

## 实际应用场景

### 页面对象模式（Page Object）

```typescript
class LoginPageElements {
  private root = createElementPath();
  
  // 表单元素
  get usernameInput() { return this.root.loginForm.usernameInput; }
  get passwordInput() { return this.root.loginForm.passwordInput; }
  get rememberCheckbox() { return this.root.loginForm.rememberMe; }
  get submitButton() { return this.root.loginForm.submitButton; }
  
  // 验证消息
  get errorMessage() { return this.root.errorPanel.message; }
  get successMessage() { return this.root.successPanel.message; }
  
  // 社交登录
  get googleLoginButton() { return this.root.socialLogin.googleButton; }
  get facebookLoginButton() { return this.root.socialLogin.facebookButton; }
  
  // 链接
  get forgotPasswordLink() { return this.root.footer.forgotPasswordLink; }
  get registerLink() { return this.root.footer.registerLink; }
  
  // 组合查询示例
  get visibleErrorMessage() { return this.root['errorPanel{error}']; }
  get enabledSubmitButton() { return this.root['submitButton{登录}'][0]; }
  
  // 调试方法
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

// 使用页面对象
const loginPage = new LoginPageElements();
loginPage.debugElements();
```

### 组件库元素定位

```typescript
class ComponentLibraryElements {
  private root = createElementPath();
  
  // 按钮组件
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
  
  // 输入组件
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
  
  // 模态框组件
  modal(title?: string) {
    return title
      ? this.root[`modal(header{${title}})`]
      : this.root.modal;
  }
  
  modalCloseButton(modalTitle?: string) {
    const modal = modalTitle ? this.modal(modalTitle) : this.root.modal;
    return modal.closeButton;
  }
  
  // 表格组件
  tableRow(index: number) {
    return this.root.dataTable.tableBody.tableRow[index];
  }
  
  tableCell(rowIndex: number, columnIndex: number) {
    return this.tableRow(rowIndex).tableCell[columnIndex];
  }
  
  tableCellWithText(text: string) {
    return this.root.dataTable[`tableCell{${text}}`];
  }
  
  // 导航组件
  navItem(text: string) {
    return this.root.navigation[`navItem{${text}}`];
  }
  
  breadcrumb(text: string) {
    return this.root.breadcrumb[`breadcrumbItem{${text}}`];
  }
}

// 使用组件库定位器
const components = new ComponentLibraryElements();

// 获取特定按钮
const saveButton = components.primaryButton('保存');
const cancelButton = components.secondaryButton('取消');

// 获取表单输入框
const emailInput = components.textInput('邮箱地址');
const countrySelect = components.selectInput('国家');

// 获取模态框元素
const confirmModal = components.modal('确认删除');
const confirmModalClose = components.modalCloseButton('确认删除');

// 获取表格元素
const firstRowSecondCell = components.tableCell(0, 1);
const cellWithUserName = components.tableCellWithText('张三');

console.log('组件 XPath 示例:');
console.log('保存按钮:', saveButton.toString());
console.log('邮箱输入框:', emailInput.toString());
console.log('确认模态框:', confirmModal.toString());
console.log('表格单元格:', firstRowSecondCell.toString());
```

### 动态元素定位工厂

```typescript
class DynamicElementFactory {
  private root = createElementPath();
  
  // 按属性创建元素
  byAttribute(attributeName: string, value: string) {
    const customPath = new ElementPath({
      attributeName,
      searchMask: value
    });
    return require('./proxify').proxify(customPath, false);
  }
  
  // 按类名创建元素
  byClassName(className: string) {
    return this.root.xpath('by-class', `//*[@class='${className}']`);
  }
  
  // 按标签和属性组合创建
  byTagAndAttribute(tagName: string, attributeName: string, value: string) {
    return this.root.xpath(
      'by-tag-attr',
      `//${tagName}[@${attributeName}='${value}']`
    );
  }
  
  // 按文本内容创建
  byText(text: string, exact = false) {
    return exact 
      ? this.root[`={${text}}`]
      : this.root[`{${text}}`];
  }
  
  // 按索引和文本组合创建
  byTextAndIndex(text: string, index: number) {
    return this.root[`{${text}}`][index];
  }
  
  // 复杂条件组合
  complex(conditions: {
    tag?: string;
    attributes?: Record<string, string>;
    text?: string;
    exactText?: boolean;
    index?: number;
    parent?: any;
  }) {
    let xpath = '';
    
    // 构建基础 XPath
    if (conditions.tag) {
      xpath += `//${conditions.tag}`;
    } else {
      xpath += '//*';
    }
    
    // 添加属性条件
    const attrConditions: string[] = [];
    if (conditions.attributes) {
      Object.entries(conditions.attributes).forEach(([attr, value]) => {
        attrConditions.push(`@${attr}='${value}'`);
      });
    }
    
    // 添加文本条件
    if (conditions.text) {
      if (conditions.exactText) {
        attrConditions.push(`. = "${conditions.text}"`);
      } else {
        attrConditions.push(`contains(., "${conditions.text}")`);
      }
    }
    
    // 组合条件
    if (attrConditions.length > 0) {
      xpath += `[${attrConditions.join(' and ')}]`;
    }
    
    // 添加索引
    if (typeof conditions.index === 'number') {
      xpath += `[${conditions.index + 1}]`;
    }
    
    // 创建元素
    const element = (conditions.parent || this.root).xpath('complex', xpath);
    return element;
  }
}

// 使用动态工厂
const factory = new DynamicElementFactory();

// 各种动态创建方式
const qaElement = factory.byAttribute('data-qa', 'submit-button');
const classElement = factory.byClassName('btn btn-primary');
const tagAttrElement = factory.byTagAndAttribute('input', 'type', 'email');
const textElement = factory.byText('点击这里');
const indexedTextElement = factory.byTextAndIndex('提交', 1);

// 复杂条件创建
const complexElement = factory.complex({
  tag: 'button',
  attributes: {
    'type': 'submit',
    'class': 'btn-primary'
  },
  text: '确认提交',
  exactText: false,
  index: 0
});

console.log('动态元素 XPath:');
console.log('QA 元素:', qaElement.toString());
console.log('类名元素:', classElement.toString());
console.log('复杂元素:', complexElement.toString());
```

## 最佳实践

### 1. 选择器设计
- 优先使用稳定的元素标识符
- 避免依赖易变的类名和结构
- 合理使用通配符和模式匹配
- 建立一致的命名约定

### 2. 路径管理
- 使用页面对象模式组织元素
- 避免过深的元素路径嵌套
- 合理使用索引选择
- 定期验证和更新元素路径

### 3. 性能优化
- 避免生成过于复杂的 XPath
- 使用精确匹配而非模糊搜索
- 合理使用子查询避免全局搜索
- 缓存常用的元素路径

### 4. 可维护性
- 建立清晰的元素命名规范
- 使用类型化的接口定义
- 添加必要的注释和文档
- 实现元素路径的自动化测试

### 5. 调试和故障排除
- 使用分析工具检查路径结构
- 验证生成的 XPath 语法
- 记录元素定位的变更历史
- 建立错误处理和重试机制

## 故障排除

### 常见问题

#### 元素路径语法错误
```bash
TypeError: Invalid query key
```
解决方案：检查查询语法、括号匹配、特殊字符转义。

#### XPath 生成错误
```bash
Error: Both start and end parts must be defined
```
解决方案：确保分段匹配语法正确，检查通配符使用。

#### 索引超出范围
```bash
Error: Can not select index element from already sliced element
```
解决方案：避免在已索引的元素上再次使用索引。

#### 流程不存在
```bash
TypeError: Flow xxx is not a function
```
解决方案：检查流程配置、确认流程名称正确。

### 调试技巧

```typescript
// 启用详细调试
const debugElement = root.complexElement;
console.log('元素信息:', {
  xpath: debugElement.toString(),
  searchOptions: debugElement.__getInstance().getSearchOptions(),
  elementType: debugElement.__getInstance().getElementType(),
  pathChain: debugElement.__getInstance().getElementPathChain()
});

// 验证查询语法
try {
  const testElement = root['invalid{syntax'][0];
  console.log('查询正常:', testElement.toString());
} catch (error) {
  console.error('查询语法错误:', error.message);
}
```

## 许可证

MIT License