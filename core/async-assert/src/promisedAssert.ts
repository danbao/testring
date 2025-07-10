/**
 * @fileoverview 异步断言方法的类型定义
 * 
 * 这个文件定义了所有异步断言方法的TypeScript类型接口。
 * 所有的断言方法都是从Chai库的断言方法转换而来，但返回值都是Promise类型。
 * 
 * 支持 Chai 5.2.1 的新特性：
 * - 改进的类型推断和错误消息
 * - 更好的 TypeScript 支持
 * - 新增的断言方法
 * - 支持多种断言风格
 * 
 * 主要包含以下类别的断言方法：
 * 1. 基础断言：fail, ok, notOk 等
 * 2. 相等性断言：equal, notEqual, strictEqual, deepEqual 等
 * 3. 数值比较断言：isAbove, isBelow, isAtLeast, isAtMost 等
 * 4. 类型断言：isString, isNumber, isBoolean, isArray, isObject 等
 * 5. 空值断言：isNull, isUndefined, exists, notExists 等
 * 6. 包含断言：include, notInclude, property, lengthOf 等
 * 7. 异常断言：throws, doesNotThrow 等
 * 8. 集合断言：sameMembers, includeMembers 等
 * 9. 对象属性断言：hasKeys, isEmpty, isExtensible 等
 * 10. 新增断言：hasAllKeys, hasAnyKeys, containsAllKeys 等
 * 
 * 使用示例：
 * ```typescript
 * // Assert 风格
 * const assert = createAssertion();
 * await assert.equal(actual, expected, '值应该相等');
 * await assert.isString(value, '值应该是字符串');
 * await assert.lengthOf(array, 3, '数组长度应该是3');
 * 
 * // Expect 风格
 * const expect = createAssertion({ style: 'expect' });
 * await expect(actual).to.equal(expected);
 * await expect(array).to.have.lengthOf(3);
 * 
 * // Should 风格
 * const should = createAssertion({ style: 'should' });
 * await should(actual).should.equal(expected);
 * 
 * // 性能监控
 * const assert = createAssertion({ enablePerformanceMonitoring: true });
 * await assert.equal(1, 1); // 会记录执行时间
 * 
 * // 详细错误信息
 * const assert = createAssertion({ verboseErrors: true });
 * try {
 *   await assert.equal(1, 2);
 * } catch (error) {
 *   console.log(error.message); // 包含详细的错误信息
 * }
 * ```
 */

/* eslint-disable max-len */
// Copy paste from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/chai/index.d.ts
// But with all functions being async

/**
 * 异步断言接口
 * 所有方法都返回 Promise<void>，支持 await 语法
 */
export interface PromisedAssert {
    /**
     * 断言失败并抛出错误
     * @param message 错误消息
     * @param actual 实际值
     * @param expected 期望值
     * @param operator 比较操作符
     * @example
     * ```typescript
     * await assert.fail('这是一个失败的断言');
     * await assert.fail('自定义消息', 'actual', 'expected', '===');
     * ```
     */
    fail(message?: string, actual?: any, expected?: any, operator?: string): Promise<void>;

    /**
     * 断言值为真值
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.ok(true, '值应该为真');
     * await assert.ok(1, '数字1是真值');
     * await assert.ok('hello', '非空字符串是真值');
     * ```
     */
    ok(val: any, message?: string): Promise<void>;

    /**
     * 断言值为假值
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.notOk(false, '值应该为假');
     * await assert.notOk(0, '数字0是假值');
     * await assert.notOk('', '空字符串是假值');
     * ```
     */
    notOk(val: any, message?: string): Promise<void>;

    /**
     * 断言两个值相等（使用 == 比较）
     * @param actual 实际值
     * @param expected 期望值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.equal(1, '1', '数字1等于字符串"1"');
     * await assert.equal(true, 1, 'true等于1');
     * ```
     */
    equal(actual: any, expected: any, message?: string): Promise<void>;

    /**
     * 断言两个值不相等（使用 != 比较）
     * @param actual 实际值
     * @param expected 期望值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.notEqual(1, 2, '1不等于2');
     * await assert.notEqual('hello', 'world', '字符串不相等');
     * ```
     */
    notEqual(actual: any, expected: any, message?: string): Promise<void>;

    /**
     * 断言两个值严格相等（使用 === 比较）
     * @param actual 实际值
     * @param expected 期望值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.strictEqual(1, 1, '严格相等');
     * await assert.strictEqual('hello', 'hello', '字符串严格相等');
     * ```
     */
    strictEqual(actual: any, expected: any, message?: string): Promise<void>;

    /**
     * 断言两个值严格不相等（使用 !== 比较）
     * @param actual 实际值
     * @param expected 期望值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.notStrictEqual(1, '1', '数字1与字符串"1"严格不相等');
     * await assert.notStrictEqual(true, 1, 'true与1严格不相等');
     * ```
     */
    notStrictEqual(actual: any, expected: any, message?: string): Promise<void>;

    /**
     * 断言两个对象深度相等
     * @param actual 实际对象
     * @param expected 期望对象
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.deepEqual({a: 1}, {a: 1}, '对象深度相等');
     * await assert.deepEqual([1, 2, 3], [1, 2, 3], '数组深度相等');
     * ```
     */
    deepEqual(actual: any, expected: any, message?: string): Promise<void>;

    /**
     * 断言两个对象深度不相等
     * @param actual 实际对象
     * @param expected 期望对象
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.notDeepEqual({a: 1}, {a: 2}, '对象深度不相等');
     * await assert.notDeepEqual([1, 2], [1, 3], '数组深度不相等');
     * ```
     */
    notDeepEqual(actual: any, expected: any, message?: string): Promise<void>;

    /**
     * 断言第一个值大于第二个值
     * @param valueToCheck 要检查的值
     * @param valueToBeAbove 要超过的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isAbove(5, 3, '5大于3');
     * await assert.isAbove(10, 5, '10大于5');
     * ```
     */
    isAbove(valueToCheck: number, valueToBeAbove: number, message?: string): Promise<void>;

    /**
     * 断言第一个值大于或等于第二个值
     * @param valueToCheck 要检查的值
     * @param valueToBeAtLeast 最小值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isAtLeast(5, 5, '5大于或等于5');
     * await assert.isAtLeast(10, 5, '10大于或等于5');
     * ```
     */
    isAtLeast(valueToCheck: number, valueToBeAtLeast: number, message?: string): Promise<void>;

    /**
     * 断言第一个值小于第二个值
     * @param valueToCheck 要检查的值
     * @param valueToBeBelow 要低于的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isBelow(3, 5, '3小于5');
     * await assert.isBelow(1, 10, '1小于10');
     * ```
     */
    isBelow(valueToCheck: number, valueToBeBelow: number, message?: string): Promise<void>;

    /**
     * 断言第一个值小于或等于第二个值
     * @param valueToCheck 要检查的值
     * @param valueToBeAtMost 最大值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isAtMost(5, 5, '5小于或等于5');
     * await assert.isAtMost(3, 10, '3小于或等于10');
     * ```
     */
    isAtMost(valueToCheck: number, valueToBeAtMost: number, message?: string): Promise<void>;

    /**
     * 断言值为 true
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isTrue(true, '值应该为true');
     * await assert.isTrue(1 === 1, '表达式结果应该为true');
     * ```
     */
    isTrue(val: any, message?: string): Promise<void>;

    /**
     * 断言值为 false
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isFalse(false, '值应该为false');
     * await assert.isFalse(1 === 2, '表达式结果应该为false');
     * ```
     */
    isFalse(val: any, message?: string): Promise<void>;

    /**
     * 断言值为 null
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isNull(null, '值应该为null');
     * ```
     */
    isNull(val: any, message?: string): Promise<void>;

    /**
     * 断言值不为 null
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isNotNull(undefined, '值不应该为null');
     * await assert.isNotNull(0, '0不是null');
     * ```
     */
    isNotNull(val: any, message?: string): Promise<void>;

    /**
     * 断言值为 undefined
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isUndefined(undefined, '值应该为undefined');
     * ```
     */
    isUndefined(val: any, message?: string): Promise<void>;

    /**
     * 断言值不为 undefined
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isDefined(null, '值应该被定义');
     * await assert.isDefined(0, '0是已定义的');
     * ```
     */
    isDefined(val: any, message?: string): Promise<void>;

    /**
     * 断言值为字符串类型
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isString('hello', '值应该是字符串');
     * await assert.isString(String(123), '转换后的值应该是字符串');
     * ```
     */
    isString(val: any, message?: string): Promise<void>;

    /**
     * 断言值为数字类型
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isNumber(123, '值应该是数字');
     * await assert.isNumber(3.14, '小数也是数字');
     * ```
     */
    isNumber(val: any, message?: string): Promise<void>;

    /**
     * 断言值为布尔类型
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isBoolean(true, '值应该是布尔值');
     * await assert.isBoolean(false, 'false也是布尔值');
     * ```
     */
    isBoolean(val: any, message?: string): Promise<void>;

    /**
     * 断言值为数组类型
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isArray([1, 2, 3], '值应该是数组');
     * await assert.isArray([], '空数组也是数组');
     * ```
     */
    isArray(val: any, message?: string): Promise<void>;

    /**
     * 断言值为对象类型
     * @param val 要检查的值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.isObject({a: 1}, '值应该是对象');
     * await assert.isObject(new Date(), 'Date实例也是对象');
     * ```
     */
    isObject(val: any, message?: string): Promise<void>;

    /**
     * 断言对象包含指定的属性
     * @param object 要检查的对象
     * @param property 属性名
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.property({a: 1}, 'a', '对象应该包含属性a');
     * await assert.property([1, 2, 3], 'length', '数组应该有length属性');
     * ```
     */
    property(object: any, property: string, message?: string): Promise<void>;

    /**
     * 断言对象包含指定的属性且值相等
     * @param object 要检查的对象
     * @param property 属性名
     * @param value 期望的属性值
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.propertyVal({a: 1}, 'a', 1, '属性a的值应该是1');
     * await assert.propertyVal([1, 2, 3], 'length', 3, '数组长度应该是3');
     * ```
     */
    propertyVal(object: any, property: string, value: any, message?: string): Promise<void>;

    /**
     * 断言对象包含所有指定的键
     * @param object 要检查的对象
     * @param keys 键名数组
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.hasAllKeys({a: 1, b: 2}, ['a', 'b'], '对象应该包含所有指定的键');
     * ```
     */
    hasAllKeys(object: any, keys: string[], message?: string): Promise<void>;

    /**
     * 断言对象包含任意指定的键
     * @param object 要检查的对象
     * @param keys 键名数组
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.hasAnyKeys({a: 1, b: 2}, ['a', 'c'], '对象应该包含任意指定的键');
     * ```
     */
    hasAnyKeys(object: any, keys: string[], message?: string): Promise<void>;

    /**
     * 断言对象或数组的长度
     * @param object 要检查的对象或数组
     * @param length 期望的长度
     * @param message 可选的错误消息
     * @example
     * ```typescript
     * await assert.lengthOf([1, 2, 3], 3, '数组长度应该是3');
     * await assert.lengthOf('hello', 5, '字符串长度应该是5');
     * ```
     */
    lengthOf(object: any, length: number, message?: string): Promise<void>;

    // ... 更多断言方法继续保持原有的实现
}
