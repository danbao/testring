# @testring/web-application

Web 应用测试模块，作为 testring 框架的核心浏览器操作层，提供完整的 Web 应用自动化测试能力。该模块封装了丰富的浏览器操作方法、元素定位、断言机制和调试功能，是进行端到端 Web 测试的核心组件。

[![npm version](https://badge.fury.io/js/@testring/web-application.svg)](https://www.npmjs.com/package/@testring/web-application)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## 功能概述

Web 应用测试模块是 testring 框架的浏览器操作核心，提供了：
- 完整的浏览器元素操作和交互
- 高级的等待机制和同步策略
- 内置断言系统和软断言支持
- 智能的元素定位和路径管理
- 截图和调试工具集成
- 多窗口和标签页管理
- Cookie 和会话管理
- 文件上传和下载支持

## 主要特性

### 元素操作
- 点击、双击、拖拽等交互操作
- 文本输入、选择和清除
- 表单元素处理（输入框、下拉框、复选框）
- 滚动和焦点管理
- 元素属性和样式获取

### 等待机制
- 智能等待元素存在、可见、可点击
- 条件等待和自定义等待逻辑
- 超时控制和重试机制
- 页面加载等待和文档就绪检测

### 断言系统
- 内置同步和异步断言
- 软断言支持，不中断测试执行
- 断言成功和失败的自动截图
- 丰富的断言方法和自定义消息

### 调试支持
- 元素高亮和定位可视化
- 调试断点和步骤日志
- 开发工具集成和扩展支持
- 详细的操作日志和错误追踪

## 安装

```bash
npm install @testring/web-application
```

## 核心架构

### WebApplication 类
主要的 Web 应用测试接口，继承自 `PluggableModule`：

```typescript
class WebApplication extends PluggableModule {
  constructor(
    testUID: string,
    transport: ITransport,
    config: Partial<IWebApplicationConfig>
  )
  
  // 断言系统
  public assert: AsyncAssertion
  public softAssert: AsyncAssertion
  
  // 元素路径管理
  public root: ElementPathProxy
  
  // 客户端和日志
  public get client(): WebClient
  public get logger(): LoggerClient
}
```

### 配置选项
```typescript
interface IWebApplicationConfig {
  screenshotsEnabled: boolean;      // 是否启用截图
  screenshotPath: string;           // 截图保存路径
  devtool: IDevtoolConfig | null;   // 开发工具配置
  seleniumConfig?: any;             // Selenium 配置
}
```

## 基本用法

### 创建 Web 应用实例

```typescript
import { WebApplication } from '@testring/web-application';
import { transport } from '@testring/transport';

// 创建 Web 应用测试实例
const webApp = new WebApplication(
  'test-001',  // 测试唯一标识
  transport,   // 传输层实例
  {
    screenshotsEnabled: true,
    screenshotPath: './screenshots/',
    devtool: null
  }
);

// 等待初始化完成
await webApp.initPromise;
```

### 页面导航和基本操作

```typescript
// 打开页面
await webApp.openPage('https://example.com');

// 获取页面标题
const title = await webApp.getTitle();
console.log('页面标题:', title);

// 刷新页面
await webApp.refresh();

// 获取页面源码
const source = await webApp.getSource();

// 执行 JavaScript
const result = await webApp.execute(() => {
  return document.readyState;
});
```

### 元素定位和操作

```typescript
// 使用元素路径
const loginButton = webApp.root.button.contains('登录');
const usernameInput = webApp.root.input.id('username');
const passwordInput = webApp.root.input.type('password');

// 等待元素存在
await webApp.waitForExist(loginButton);

// 等待元素可见
await webApp.waitForVisible(usernameInput);

// 点击元素
await webApp.click(loginButton);

// 输入文本
await webApp.setValue(usernameInput, 'testuser@example.com');
await webApp.setValue(passwordInput, 'password123');

// 清除输入
await webApp.clearValue(usernameInput);

// 获取元素文本
const buttonText = await webApp.getText(loginButton);
console.log('按钮文本:', buttonText);
```

## 高级元素操作

### 复杂交互操作

```typescript
// 双击元素
await webApp.doubleClick(webApp.root.div.className('editable'));

// 拖拽操作
const sourceElement = webApp.root.div.id('source');
const targetElement = webApp.root.div.id('target');
await webApp.dragAndDrop(sourceElement, targetElement);

// 坐标点击
await webApp.clickCoordinates(webApp.root.canvas, {
  x: 'center',
  y: 'center'
});

// 移动到元素
await webApp.moveToObject(webApp.root.button.text('提交'), 10, 10);

// 滚动到元素
await webApp.scrollIntoView(webApp.root.footer);
```

### 表单操作

```typescript
// 下拉框操作
const selectElement = webApp.root.select.name('country');

// 按值选择
await webApp.selectByValue(selectElement, 'CN');

// 按可见文本选择
await webApp.selectByVisibleText(selectElement, '中国');

// 按索引选择
await webApp.selectByIndex(selectElement, 0);

// 获取选中的文本
const selectedText = await webApp.getSelectedText(selectElement);

// 获取所有选项
const allOptions = await webApp.getSelectTexts(selectElement);
console.log('所有选项:', allOptions);

// 复选框操作
const checkbox = webApp.root.input.type('checkbox').name('agreement');
await webApp.setChecked(checkbox, true);

// 检查是否选中
const isChecked = await webApp.isChecked(checkbox);
console.log('复选框状态:', isChecked);
```

### 文件上传

```typescript
// 文件上传
const fileInput = webApp.root.input.type('file');
await webApp.uploadFile('/path/to/local/file.pdf');

// 等待上传完成
await webApp.waitForVisible(webApp.root.div.className('upload-success'));
```

## 等待和同步机制

### 基础等待方法

```typescript
// 等待元素存在
await webApp.waitForExist(
  webApp.root.div.className('loading'),
  10000  // 超时时间
);

// 等待元素可见
await webApp.waitForVisible(
  webApp.root.modal.className('dialog'),
  5000
);

// 等待元素不可见
await webApp.waitForNotVisible(
  webApp.root.div.className('spinner'),
  15000
);

// 等待元素不存在
await webApp.waitForNotExists(
  webApp.root.div.className('error-message'),
  3000
);
```

### 高级等待条件

```typescript
// 等待元素可点击
await webApp.waitForClickable(
  webApp.root.button.text('提交'),
  8000
);

// 等待元素启用
await webApp.waitForEnabled(
  webApp.root.input.name('email'),
  5000
);

// 等待元素稳定（位置不变）
await webApp.waitForStable(
  webApp.root.div.className('animated'),
  10000
);

// 自定义条件等待
await webApp.waitUntil(
  async () => {
    const count = await webApp.getElementsCount(webApp.root.li.className('item'));
    return count >= 5;
  },
  10000,
  '等待列表项数量达到5个失败'
);
```

### 状态检查方法

```typescript
// 检查元素是否存在
const exists = await webApp.isElementsExist(webApp.root.button.text('删除'));

// 检查元素是否可见
const visible = await webApp.isVisible(webApp.root.modal);

// 检查元素是否启用
const enabled = await webApp.isEnabled(webApp.root.button.text('提交'));

// 检查元素是否只读
const readOnly = await webApp.isReadOnly(webApp.root.input.name('code'));

// 检查元素是否可点击
const clickable = await webApp.isClickable(webApp.root.a.href('#'));

// 检查元素是否聚焦
const focused = await webApp.isFocused(webApp.root.input.name('search'));
```

## 断言系统

### 基础断言

```typescript
// 同步断言（失败时立即停止测试）
await webApp.assert.isTrue(
  await webApp.isVisible(webApp.root.h1.text('欢迎')),
  '首页标题应该可见'
);

await webApp.assert.equal(
  await webApp.getText(webApp.root.span.className('username')),
  'testuser@example.com',
  '用户名显示正确'
);

// 软断言（失败时不停止测试，继续执行）
await webApp.softAssert.isTrue(
  await webApp.isEnabled(webApp.root.button.text('保存')),
  '保存按钮应该启用'
);

await webApp.softAssert.contains(
  await webApp.getText(webApp.root.div.className('message')),
  '操作成功',
  '成功消息应该包含正确文本'
);

// 获取软断言错误
const softErrors = webApp.getSoftAssertionErrors();
if (softErrors.length > 0) {
  console.log('软断言失败:', softErrors);
}
```

### 自定义断言消息

```typescript
// 带成功和失败消息的断言
await webApp.assert.isTrue(
  await webApp.isVisible(webApp.root.div.className('success')),
  '操作成功提示显示',
  '验证成功提示显示正常'
);

// 复杂断言逻辑
await webApp.assert.isFalse(
  await webApp.isVisible(webApp.root.div.className('error')),
  '不应该显示错误信息'
);

// 数值断言
const itemCount = await webApp.getElementsCount(webApp.root.li.className('product'));
await webApp.assert.greaterThan(itemCount, 0, '产品列表不为空');
```

## 多窗口和标签页管理

### 标签页操作

```typescript
// 获取所有标签页ID
const tabIds = await webApp.getTabIds();
console.log('标签页列表:', tabIds);

// 获取当前标签页ID
const currentTab = await webApp.getCurrentTabId();

// 获取主标签页ID
const mainTab = await webApp.getMainTabId();

// 切换到指定标签页
await webApp.switchTab(tabIds[1]);

// 打开新窗口
await webApp.newWindow(
  'https://example.com/help',
  'helpWindow',
  { width: 800, height: 600 }
);

// 关闭当前标签页
await webApp.closeCurrentTab();

// 关闭所有其他标签页
await webApp.closeAllOtherTabs();

// 切换到主标签页
await webApp.switchToMainSiblingTab();
```

### 窗口管理

```typescript
// 最大化窗口
await webApp.maximizeWindow();

// 获取窗口大小
const windowSize = await webApp.getWindowSize();
console.log('窗口尺寸:', windowSize);

// 获取窗口句柄
const handles = await webApp.windowHandles();

// 切换窗口
await webApp.window(handles[0]);
```

## 框架和弹窗处理

### 框架切换

```typescript
// 切换到指定框架
await webApp.switchToFrame('contentFrame');

// 切换到父框架
await webApp.switchToParentFrame();

// 在框架中操作元素
await webApp.setValue(
  webApp.root.input.name('message'),
  '在框架中输入文本'
);
```

### 弹窗处理

```typescript
// 等待弹窗出现
await webApp.waitForAlert(5000);

// 检查是否有弹窗
const hasAlert = await webApp.isAlertOpen();

// 获取弹窗文本
const alertText = await webApp.alertText();
console.log('弹窗内容:', alertText);

// 接受弹窗
await webApp.alertAccept();

// 取消弹窗
await webApp.alertDismiss();
```

## Cookie 和会话管理

### Cookie 操作

```typescript
// 设置 Cookie
await webApp.setCookie({
  name: 'sessionId',
  value: 'abc123def456',
  domain: '.example.com',
  path: '/',
  httpOnly: false,
  secure: true
});

// 获取 Cookie
const sessionCookie = await webApp.getCookie('sessionId');
console.log('会话Cookie:', sessionCookie);

// 删除 Cookie
await webApp.deleteCookie('sessionId');

// 设置时区
await webApp.setTimeZone('Asia/Shanghai');
```

## 元素信息获取

### 基础属性获取

```typescript
const element = webApp.root.div.className('product-info');

// 获取元素文本
const text = await webApp.getText(element);

// 获取元素属性
const id = await webApp.getAttribute(element, 'id');
const className = await webApp.getAttribute(element, 'class');

// 获取元素值
const value = await webApp.getValue(webApp.root.input.name('price'));

// 获取元素HTML
const html = await webApp.getHTML(element);

// 获取元素尺寸
const size = await webApp.getSize(element);
console.log('元素尺寸:', size);

// 获取元素位置
const location = await webApp.getLocation(element);
console.log('元素位置:', location);
```

### CSS 样式获取

```typescript
// 获取CSS属性
const color = await webApp.getCssProperty(element, 'color');
const fontSize = await webApp.getCssProperty(element, 'font-size');
const display = await webApp.getCssProperty(element, 'display');

console.log('元素样式:', { color, fontSize, display });

// 检查CSS类是否存在
const hasActiveClass = await webApp.isCSSClassExists(
  webApp.root.button.text('提交'),
  'active',
  'btn-primary'
);
```

### 元素集合操作

```typescript
// 获取元素数量
const count = await webApp.getElementsCount(webApp.root.li.className('item'));

// 获取多个元素的文本
const texts = await webApp.getTexts(webApp.root.span.className('label'));
console.log('所有标签文本:', texts);

// 获取元素列表
const elements = await webApp.elements(webApp.root.div.className('card'));
console.log('找到的元素数量:', elements.length);
```

## 键盘和鼠标操作

### 键盘操作

```typescript
// 发送键盘输入
await webApp.keys(['Control', 'a']);  // 全选
await webApp.keys(['Control', 'c']);  // 复制
await webApp.keys(['Control', 'v']);  // 粘贴

// 发送特殊键
await webApp.keys('Tab');
await webApp.keys('Enter');
await webApp.keys('Escape');

// 组合键操作
await webApp.keys(['Shift', 'Tab']);
await webApp.keys(['Control', 'Shift', 'I']);  // 开发者工具
```

### 高级输入操作

```typescript
// 添加文本到现有内容
await webApp.addValue(webApp.root.textarea.name('comment'), '\n追加的文本');

// JavaScript模拟输入
await webApp.simulateJSFieldChange(
  webApp.root.input.name('dynamic'),
  '通过JS设置的值'
);

// 清除字段
await webApp.simulateJSFieldClear(webApp.root.input.name('temp'));
```

## 截图和调试

### 截图功能

```typescript
// 手动截图
const screenshotPath = await webApp.makeScreenshot();
console.log('截图保存路径:', screenshotPath);

// 强制截图（忽略配置）
await webApp.makeScreenshot(true);

// 禁用截图
await webApp.disableScreenshots();

// 启用截图
await webApp.enableScreenshots();
```

### 调试工具

```typescript
// 启用调试模式的配置
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

// 元素高亮（在调试模式下自动工作）
await webAppWithDebug.waitForExist(webApp.root.button.text('调试'));
```

## 高级功能

### PDF 生成

```typescript
// 生成PDF文件
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

### 扩展实例

```typescript
// 扩展WebApplication实例
const extendedApp = webApp.extendInstance({
  // 自定义方法
  async loginUser(username: string, password: string) {
    await this.setValue(this.root.input.name('username'), username);
    await this.setValue(this.root.input.name('password'), password);
    await this.click(this.root.button.type('submit'));
    await this.waitForVisible(this.root.div.className('dashboard'));
  },
  
  // 自定义属性
  customTimeout: 15000
});

// 使用扩展方法
await extendedApp.loginUser('admin', 'password123');
```

### 条件检查方法

```typescript
// 检查元素是否变为可见
const becameVisible = await webApp.isBecomeVisible(
  webApp.root.div.className('notification'),
  3000
);

// 检查元素是否变为隐藏
const becameHidden = await webApp.isBecomeHidden(
  webApp.root.div.className('loading'),
  10000
);

console.log('通知显示状态:', becameVisible);
console.log('加载动画隐藏状态:', becameHidden);
```

## 错误处理和最佳实践

### 错误处理模式

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
      console.error('点击失败:', error.message);
      await this.webApp.makeScreenshot(true);  // 错误时强制截图
      return false;
    }
  }
  
  async safeSetValue(element: ElementPath, value: string, timeout = 10000) {
    try {
      await this.webApp.waitForExist(element, timeout);
      await this.webApp.clearValue(element);
      await this.webApp.setValue(element, value);
      
      // 验证值是否设置成功
      const actualValue = await this.webApp.getValue(element);
      if (actualValue !== value) {
        throw new Error(`值设置失败: 期望 "${value}", 实际 "${actualValue}"`);
      }
      
      return true;
    } catch (error) {
      console.error('设置值失败:', error.message);
      await this.webApp.makeScreenshot(true);
      return false;
    }
  }
}
```

### 超时控制

```typescript
// 自定义超时时间的操作
await webApp.waitForExist(webApp.root.div.className('slow-loading'), 30000);

// 快速检查（短超时）
try {
  await webApp.waitForVisible(webApp.root.div.className('popup'), 1000);
  console.log('弹窗快速显示');
} catch (error) {
  console.log('弹窗未快速显示，继续其他操作');
}

// 分阶段等待
await webApp.waitForExist(webApp.root.button.text('加载更多'), 5000);
await webApp.click(webApp.root.button.text('加载更多'));
await webApp.waitForVisible(webApp.root.div.className('new-content'), 15000);
```

### 重试机制

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
          console.log(`操作失败，${delay}ms后重试 (${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
}

// 使用重试机制
await RetryHelper.withRetry(async () => {
  await webApp.click(webApp.root.button.text('不稳定的按钮'));
  await webApp.waitForVisible(webApp.root.div.className('success'), 3000);
}, 3, 2000);
```

## 性能优化

### 批量操作

```typescript
// 批量检查元素状态
const elements = [
  webApp.root.button.text('保存'),
  webApp.root.button.text('取消'),
  webApp.root.button.text('删除')
];

const statuses = await Promise.all(
  elements.map(async (element) => ({
    element: element.toString(),
    visible: await webApp.isVisible(element),
    enabled: await webApp.isEnabled(element)
  }))
);

console.log('按钮状态:', statuses);
```

### 选择性截图

```typescript
// 只在重要步骤截图
await webApp.disableScreenshots();

// 执行常规操作
await webApp.setValue(webApp.root.input.name('search'), 'test');
await webApp.click(webApp.root.button.text('搜索'));

// 在关键验证点启用截图
await webApp.enableScreenshots();
await webApp.waitForVisible(webApp.root.div.className('results'));
await webApp.makeScreenshot();
```

### 智能等待

```typescript
// 组合等待条件
async function waitForPageReady(webApp: WebApplication) {
  // 等待页面基础元素
  await webApp.waitForExist(webApp.root, 10000);
  
  // 等待加载指示器消失
  try {
    await webApp.waitForNotVisible(webApp.root.div.className('loading'), 15000);
  } catch {
    // 如果没有加载指示器，忽略错误
  }
  
  // 等待主要内容可见
  await webApp.waitForVisible(webApp.root.main, 10000);
  
  // 确保页面稳定
  await webApp.pause(500);
}

await waitForPageReady(webApp);
```

## 测试模式和环境

### 会话管理

```typescript
// 检查会话状态
if (webApp.isStopped()) {
  console.log('会话已停止');
} else {
  // 执行测试操作
  await webApp.openPage('https://example.com');
}

// 结束会话
await webApp.end();
```

### 配置驱动测试

```typescript
// 根据环境配置创建实例
function createWebApp(environment: string) {
  const configs = {
    development: {
      screenshotsEnabled: true,
      screenshotPath: './dev-screenshots/',
      devtool: { /* 开发工具配置 */ }
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

## 最佳实践

### 1. 元素定位策略
- 优先使用稳定的定位器（ID、数据属性）
- 避免依赖易变的CSS类名和文本内容
- 使用语义化的元素路径
- 建立页面对象模型封装元素定位

### 2. 等待和同步
- 合理设置超时时间，避免过长或过短
- 使用显式等待而非固定延迟
- 组合多种等待条件确保页面状态
- 在关键操作前后添加适当的等待

### 3. 断言和验证
- 使用明确的断言消息便于调试
- 合理使用软断言避免测试中断
- 在断言失败时自动截图
- 验证操作结果而非仅仅操作过程

### 4. 错误处理
- 实现全面的错误捕获和处理
- 在错误发生时记录详细信息
- 提供友好的错误消息和解决建议
- 建立重试机制处理间歇性问题

### 5. 性能优化
- 避免不必要的截图和日志
- 使用批量操作减少网络开销
- 合理使用并发操作
- 优化元素定位策略

## 故障排除

### 常见问题

#### 元素未找到
```bash
Error: Element not found
```
解决方案：检查元素路径、增加等待时间、确认页面加载完成。

#### 超时错误
```bash
Error: Timeout waiting for element
```
解决方案：增加超时时间、优化等待条件、检查网络状况。

#### 元素不可交互
```bash
Error: Element is not clickable
```
解决方案：等待元素可点击、滚动到元素位置、检查元素是否被遮挡。

#### 断言失败
```bash
AssertionError: Expected true but got false
```
解决方案：检查断言逻辑、确认页面状态、增加调试信息。

### 调试技巧

```typescript
// 启用详细日志
const webApp = new WebApplication('debug-test', transport, {
  screenshotsEnabled: true,
  screenshotPath: './debug/',
  devtool: { /* 调试配置 */ }
});

// 调试元素定位
console.log('元素路径:', webApp.root.button.text('提交').toString());

// 检查元素状态
const element = webApp.root.input.name('email');
console.log('元素存在:', await webApp.isElementsExist(element));
console.log('元素可见:', await webApp.isVisible(element));
console.log('元素启用:', await webApp.isEnabled(element));
```

## 依赖

- `@testring/async-assert` - 异步断言系统
- `@testring/element-path` - 元素路径管理
- `@testring/fs-store` - 文件存储（截图）
- `@testring/logger` - 日志记录
- `@testring/transport` - 传输层通信
- `@testring/utils` - 工具函数

## 相关模块

- `@testring/plugin-selenium-driver` - Selenium WebDriver 插件
- `@testring/browser-proxy` - 浏览器代理
- `@testring/devtool-extension` - 调试工具扩展

## 许可证

MIT License