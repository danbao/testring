# @testring/async-assert

基于 Chai 5.2.1 的异步断言库，为 testring 框架提供完整的异步断言支持。

[![npm version](https://badge.fury.io/js/@testring/async-assert.svg)](https://www.npmjs.com/package/@testring/async-assert)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## 🚀 升级说明

本模块已从 Chai 4.3.10 成功升级到 **Chai 5.2.1**，并引入了多项新特性，同时确保**100% 向后兼容性**。

### 新版本特性
- ✅ **多种断言风格**：支持 Assert、Expect、Should 三种风格
- ✅ **性能监控**：可选的执行时间跟踪
- ✅ **详细错误信息**：增强的错误消息和堆栈跟踪
- ✅ **内存管理**：智能的软断言错误收集限制
- ✅ **自定义格式化**：可自定义错误消息格式
- ✅ **向后兼容**：所有现有 API 保持不变

## 功能概述

该模块是 Chai 断言库的异步包装器，提供了：
- 将所有 Chai 断言方法转换为异步版本
- 支持软断言和硬断言模式
- 错误收集和自定义处理机制
- 完整的 TypeScript 类型支持
- 性能监控和详细错误诊断

## 安装

```bash
npm install @testring/async-assert
```

### 依赖版本
- `chai`: `^5.2.1`
- `@types/chai`: `^5.0.0`

## 🆕 新特性详解

### 1. 多种断言风格

#### Assert 风格（默认，向后兼容）
```typescript
import { createAssertion } from '@testring/async-assert';

const assert = createAssertion();
await assert.equal(1, 1, '值应该相等');
await assert.isString('hello', '值应该是字符串');
```

#### Expect 风格（新增）
```typescript
const expect = createAssertion({ style: 'expect' });
await expect(1).to.equal(1);
await expect('hello').to.be.a('string');
await expect([1, 2, 3]).to.have.lengthOf(3);
```

#### Should 风格（新增）
```typescript
const should = createAssertion({ style: 'should' });
await should(1).should.equal(1);
await should('hello').should.be.a('string');
```

### 2. 性能监控

启用性能监控来追踪断言执行时间：

```typescript
const assert = createAssertion({ 
    enablePerformanceMonitoring: true,
    onSuccess: async (meta) => {
        console.log(`✓ ${meta.originalMethod} 执行时间: ${meta.executionTime}ms`);
    }
});

await assert.equal(1, 1); // 输出执行时间
```

### 3. 详细错误信息

获取更详细的错误信息，包括堆栈跟踪和参数信息：

```typescript
const assert = createAssertion({ 
    verboseErrors: true,
    onError: async (meta) => {
        console.log('详细错误信息:', {
            method: meta.originalMethod,
            args: meta.args,
            actualValue: meta.actualValue,
            expectedValue: meta.expectedValue,
            executionTime: meta.executionTime,
            errorStack: meta.errorStack
        });
    }
});
```

### 4. 增强的软断言

软断言现在支持最大错误数限制，防止内存泄漏：

```typescript
const softAssert = createAssertion({ 
    isSoft: true,
    maxErrorCount: 50 // 最多收集50个错误
});

await softAssert.equal(1, 2); // 不会抛出错误
await softAssert.equal(2, 3); // 继续收集错误
console.log(softAssert._errorMessages.length); // 2
```

### 5. 自定义错误格式化

可以自定义错误消息的格式：

```typescript
const assert = createAssertion({
    errorFormatter: (error, meta) => {
        return `🚨 [${meta.style}] ${meta.originalMethod} 失败: ${error.message}`;
    },
    verboseErrors: true
});
```

## 基本用法

### 创建断言实例

```typescript
import { createAssertion } from '@testring/async-assert';

// 创建默认断言实例（硬断言模式）
const assert = createAssertion();

// 创建软断言实例
const softAssert = createAssertion({ isSoft: true });

// 创建带新特性的实例
const enhancedAssert = createAssertion({
    style: 'assert',
    enablePerformanceMonitoring: true,
    verboseErrors: true,
    maxErrorCount: 100
});
```

### 异步断言示例

```typescript
// 基本断言
await assert.equal(actual, expected, '值应该相等');
await assert.isTrue(condition, '条件应该为真');
await assert.lengthOf(array, 3, '数组长度应该为3');

// 类型断言
await assert.isString(value, '值应该是字符串');
await assert.isNumber(count, '计数应该是数字');
await assert.isArray(list, '应该是数组');

// 包含断言
await assert.include(haystack, needle, '应该包含指定值');
await assert.property(object, 'prop', '对象应该有指定属性');

// 异常断言
await assert.throws(() => {
  throw new Error('测试错误');
}, '应该抛出错误');
```

## 🔧 完整配置选项

```typescript
interface IAssertionOptions {
    // 基础选项
    isSoft?: boolean;                    // 是否使用软断言模式
    plugins?: Array<ChaiPlugin>;        // Chai 插件列表
    
    // 回调函数
    onSuccess?: (meta: IAssertionSuccessMeta) => void | Promise<void>;  // 成功回调
    onError?: (meta: IAssertionErrorMeta) => void | Error | Promise<void | Error>; // 错误回调
    
    // 新增选项
    style?: 'assert' | 'expect' | 'should';  // 断言风格
    enablePerformanceMonitoring?: boolean;   // 性能监控
    verboseErrors?: boolean;                 // 详细错误信息
    maxErrorCount?: number;                  // 最大错误收集数量
    errorFormatter?: (error: Error, meta: IAssertionErrorMeta) => string; // 自定义错误格式化
}
```

### 元数据结构

```typescript
interface IAssertionSuccessMeta {
    isSoft: boolean;                     // 是否软断言
    successMessage?: string;             // 成功消息
    assertMessage?: string;              // 断言消息
    originalMethod: string;              // 原始方法名
    args: any[];                         // 断言参数
    style: AssertionStyle;               // 断言风格
    executionTime?: number;              // 执行时间（毫秒）
}

interface IAssertionErrorMeta extends IAssertionSuccessMeta {
    errorMessage?: string;               // 错误消息
    error?: Error;                       // 错误对象
    errorStack?: string;                 // 错误堆栈
    actualValue?: any;                   // 实际值
    expectedValue?: any;                 // 期望值
    diff?: string;                       // 差异信息
}
```

## 软断言模式

软断言允许测试继续执行，即使某些断言失败：

```typescript
import { createAssertion } from '@testring/async-assert';

const assert = createAssertion({ 
    isSoft: true,
    maxErrorCount: 100  // 防止内存泄漏
});

// 执行多个断言
await assert.equal(user.name, 'John', '用户名检查');
await assert.equal(user.age, 25, '年龄检查');
await assert.isTrue(user.isActive, '激活状态检查');

// 获取所有错误信息
const errors = assert._errorMessages;
if (errors.length > 0) {
  console.log('发现以下断言失败:');
  errors.forEach(error => console.log('- ' + error));
}
```

## 自定义回调处理

```typescript
const assert = createAssertion({
    enablePerformanceMonitoring: true,
    onSuccess: async (meta) => {
        console.log(`✓ ${meta.assertMessage} (${meta.executionTime}ms)`);
        // 记录成功的断言
    },
    
    onError: async (meta) => {
        console.log(`✗ ${meta.assertMessage}`);
        console.log(`  错误: ${meta.errorMessage}`);
        console.log(`  执行时间: ${meta.executionTime}ms`);
        
        // 可以返回自定义错误对象
        return new Error(`自定义错误: ${meta.errorMessage}`);
    }
});

await assert.equal(actual, expected);
```

## 支持的断言方法

### 相等性断言
```typescript
await assert.equal(actual, expected);          // 非严格相等 (==)
await assert.notEqual(actual, expected);       // 非严格不等 (!=)
await assert.strictEqual(actual, expected);    // 严格相等 (===)
await assert.notStrictEqual(actual, expected); // 严格不等 (!==)
await assert.deepEqual(actual, expected);      // 深度相等
await assert.notDeepEqual(actual, expected);   // 深度不等
```

### 真值断言
```typescript
await assert.ok(value);                        // 真值检查
await assert.notOk(value);                     // 假值检查
await assert.isTrue(value);                    // 严格 true
await assert.isFalse(value);                   // 严格 false
await assert.isNotTrue(value);                 // 非 true
await assert.isNotFalse(value);                // 非 false
```

### 类型断言
```typescript
await assert.isString(value);                  // 字符串类型
await assert.isNumber(value);                  // 数字类型
await assert.isBoolean(value);                 // 布尔类型
await assert.isArray(value);                   // 数组类型
await assert.isObject(value);                  // 对象类型
await assert.isFunction(value);                // 函数类型
await assert.typeOf(value, 'string');          // 类型检查
await assert.instanceOf(value, Array);         // 实例检查
```

### 空值断言
```typescript
await assert.isNull(value);                    // null 检查
await assert.isNotNull(value);                 // 非 null 检查
await assert.isUndefined(value);               // undefined 检查
await assert.isDefined(value);                 // 已定义检查
await assert.exists(value);                    // 存在检查
await assert.notExists(value);                 // 不存在检查
```

### 数值断言
```typescript
await assert.isAbove(valueToCheck, valueToBeAbove);      // 大于
await assert.isAtLeast(valueToCheck, valueToBeAtLeast);  // 大于等于
await assert.isBelow(valueToCheck, valueToBeBelow);      // 小于
await assert.isAtMost(valueToCheck, valueToBeAtMost);    // 小于等于
await assert.closeTo(actual, expected, delta);           // 近似相等
```

### 包含断言
```typescript
await assert.include(haystack, needle);        // 包含检查
await assert.notInclude(haystack, needle);     // 不包含检查
await assert.deepInclude(haystack, needle);    // 深度包含
await assert.property(object, 'prop');         // 属性存在
await assert.notProperty(object, 'prop');      // 属性不存在
await assert.propertyVal(object, 'prop', val); // 属性值检查
await assert.lengthOf(object, length);         // 长度检查
```

### 异常断言
```typescript
await assert.throws(() => {
  throw new Error('test');
});                                             // 抛出异常

await assert.doesNotThrow(() => {
  // 正常代码
});                                             // 不抛出异常
```

### 集合断言
```typescript
await assert.sameMembers(set1, set2);          // 相同成员
await assert.sameDeepMembers(set1, set2);      // 深度相同成员
await assert.includeMembers(superset, subset); // 包含成员
await assert.oneOf(value, list);               // 值在列表中
```

### 新增断言方法（Chai 5.2.1）
```typescript
await assert.hasAllKeys(obj, ['a', 'b', 'c']); // 包含所有指定键
await assert.hasAnyKeys(obj, ['a', 'd']);       // 包含任意指定键
await assert.containsAllKeys(obj, keys);        // 包含所有键（新增）
```

## 插件支持

支持 Chai 插件来扩展断言功能：

```typescript
import chaiAsPromised from 'chai-as-promised';

const assert = createAssertion({
  plugins: [chaiAsPromised]
});

// 现在可以使用插件提供的断言
await assert.eventually.equal(promise, expectedValue);
```

## 🔄 向后兼容性

**重要**：升级后所有现有代码无需修改即可使用！

```typescript
// 这些代码完全不需要改变
const assert = createAssertion();
await assert.equal(1, 1);
await assert.isString('hello');

const softAssert = createAssertion({ isSoft: true });
await softAssert.equal(1, 2);
console.log(softAssert._errorMessages);
```

### 回调函数兼容性
现有的回调函数仍然有效，只是元数据中增加了新的字段：

```typescript
const assert = createAssertion({
    onSuccess: async (meta) => {
        // meta 现在包含更多信息：
        // - meta.style: 断言风格
        // - meta.executionTime: 执行时间（如果启用）
        console.log(`成功: ${meta.originalMethod}`);
    }
});
```

## 与 testring 框架集成

在 testring 测试中使用：

```typescript
import { createAssertion } from '@testring/async-assert';

// 在测试文件中
const assert = createAssertion({
    enablePerformanceMonitoring: true,
    verboseErrors: true
});

describe('用户管理测试', () => {
    it('应该能够创建用户', async () => {
        const user = await createUser({ name: 'John', age: 25 });
        
        await assert.equal(user.name, 'John', '用户名应该正确');
        await assert.equal(user.age, 25, '年龄应该正确');
        await assert.property(user, 'id', '应该有用户ID');
        await assert.isString(user.id, 'ID应该是字符串');
    });
});
```

## 性能优化

### 批量断言
```typescript
// 软断言模式下的批量验证
const assert = createAssertion({ 
    isSoft: true,
    maxErrorCount: 100,
    enablePerformanceMonitoring: true
});

const validateUser = async (user) => {
    await assert.isString(user.name, '姓名必须是字符串');
    await assert.isNumber(user.age, '年龄必须是数字');
    await assert.isAbove(user.age, 0, '年龄必须大于0');
    await assert.isBelow(user.age, 150, '年龄必须小于150');
    await assert.match(user.email, /\S+@\S+\.\S+/, '邮箱格式无效');
    
    return assert._errorMessages;
};
```

## 错误处理最佳实践

```typescript
const assert = createAssertion({
    isSoft: true,
    verboseErrors: true,
    enablePerformanceMonitoring: true,
    errorFormatter: (error, meta) => {
        return `🚨 [${meta.style}] ${meta.originalMethod} 失败 (${meta.executionTime}ms): ${error.message}`;
    },
    onError: async (meta) => {
        // 记录详细的断言失败信息
        console.error(`断言失败: ${meta.originalMethod}`);
        console.error(`参数: ${JSON.stringify(meta.args)}`);
        console.error(`错误: ${meta.errorMessage}`);
        console.error(`执行时间: ${meta.executionTime}ms`);
        
        // 可以发送到监控系统
        // await sendToMonitoring(meta);
    }
});
```

## 🛠️ 迁移指南

### 从旧版本升级

1. **更新依赖**
   ```bash
   npm install chai@^5.2.1 @types/chai@^5.0.0
   ```

2. **无需修改代码**（向后兼容）
   ```typescript
   // 现有代码继续工作
   const assert = createAssertion();
   await assert.equal(1, 1);
   ```

3. **可选：使用新特性**
   ```typescript
   // 逐步采用新功能
   const assert = createAssertion({
       style: 'assert',
       enablePerformanceMonitoring: true,
       verboseErrors: true
   });
   ```

## 📚 示例和资源

### 运行测试
```bash
# 运行所有测试
npm test

# 运行向后兼容性测试
npm test -- --grep "Backward Compatibility"

# 运行基本断言测试
npm test -- --grep "assertion functional"
```

### 学习资源
1. `test/backward-compatibility.spec.ts` - 向后兼容性测试
2. `test/assert.spec.ts` - 基本功能测试
3. `src/index.ts` - 核心实现（含详细注释）
4. `src/promisedAssert.ts` - 断言方法定义

## 🔍 故障排除

### 常见问题

1. **类型错误**
   - 确保安装了 `@types/chai@^5.0.0`
   - 检查 TypeScript 配置

2. **插件不兼容**
   - 验证 Chai 插件与 5.2.1 版本兼容
   - 查看插件文档了解升级指南

3. **性能问题**
   - 如果不需要，可以禁用性能监控
   - 调整 `maxErrorCount` 以平衡内存和功能

### 验证升级
```bash
# 检查依赖版本
npm list chai

# 运行兼容性测试
npm test -- --grep "Backward Compatibility"

# 运行所有测试验证功能
npm test
```

## 依赖

- `chai` ^5.2.1 - 底层断言库
- `@testring/types` 0.8.0 - 类型定义

## 相关模块

- `@testring/test-worker` - 测试工作进程
- `@testring/api` - 测试 API 控制器
- `@testring/logger` - 日志系统

## 🎯 总结

本次升级成功实现了：

1. **无缝升级**：所有现有代码无需修改
2. **功能增强**：新增多种断言风格和监控功能
3. **性能改进**：更好的错误处理和内存管理
4. **文档完善**：详细的中文注释和使用指南
5. **类型安全**：完整的 TypeScript 支持

升级是完全安全的，建议所有用户升级以获得更好的开发体验和强大的新功能！

## License

ISC
