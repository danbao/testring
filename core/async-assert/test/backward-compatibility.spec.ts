/// <reference types="mocha" />

import * as chai from 'chai';
import { createAssertion } from '..';

describe('Backward Compatibility Tests', () => {
    describe('基本向后兼容性', () => {
        it('should work with original assertion methods', async () => {
            const assert = createAssertion() as any;
            
            // 测试原有的断言方法
            await assert.equal(1, 1, '相等断言');
            await assert.notEqual(1, 2, '不相等断言');
            await assert.strictEqual('hello', 'hello', '严格相等断言');
            await assert.notStrictEqual(1, '1', '严格不相等断言');
            
            chai.expect(assert._errorMessages.length).to.equal(0);
        });
        
        it('should work with deep equality assertions', async () => {
            const assert = createAssertion() as any;
            
            // 测试深度比较
            await assert.deepEqual({a: 1}, {a: 1}, '深度相等断言');
            await assert.notDeepEqual({a: 1}, {a: 2}, '深度不相等断言');
            
            chai.expect(assert._errorMessages.length).to.equal(0);
        });
        
        it('should work with type assertions', async () => {
            const assert = createAssertion() as any;
            
            // 测试类型断言
            await assert.isString('hello', '字符串类型断言');
            await assert.isNumber(42, '数字类型断言');
            await assert.isBoolean(true, '布尔类型断言');
            await assert.isArray([1, 2, 3], '数组类型断言');
            await assert.isObject({}, '对象类型断言');
            
            chai.expect(assert._errorMessages.length).to.equal(0);
        });
        
        it('should work with null/undefined assertions', async () => {
            const assert = createAssertion() as any;
            
            // 测试空值断言
            await assert.isNull(null, 'null断言');
            await assert.isUndefined(undefined, 'undefined断言');
            await assert.isDefined(42, '已定义断言');
            
            chai.expect(assert._errorMessages.length).to.equal(0);
        });
    });
    
    describe('软断言向后兼容性', () => {
        it('should collect errors in soft assertion mode', async () => {
            const softAssert = createAssertion({ isSoft: true }) as any;
            
            // 执行一些会失败的断言
            await softAssert.equal(1, 2, '故意失败的断言1');
            await softAssert.equal(2, 3, '故意失败的断言2');
            await softAssert.equal(1, 1, '成功的断言');
            
            // 检查错误收集
            const errors = softAssert._errorMessages;
            chai.expect(errors.length).to.equal(2);
        });
        
        it('should not throw errors in soft mode', async () => {
            const softAssert = createAssertion({ isSoft: true }) as any;
            
            let didThrow = false;
            try {
                await softAssert.equal(1, 2, '故意失败的断言');
            } catch (error) {
                didThrow = true;
            }
            
            chai.expect(didThrow).to.be.false;
            chai.expect(softAssert._errorMessages.length).to.equal(1);
        });
    });
    
    describe('回调功能向后兼容性', () => {
        it('should call success callback with correct metadata', async () => {
            let successCallbackCalled = false;
            let capturedMeta: any;
            
            const assert = createAssertion({
                onSuccess: async (meta) => {
                    successCallbackCalled = true;
                    capturedMeta = meta;
                }
            }) as any;
            
            await assert.equal(1, 1, '成功的断言');
            
            chai.expect(successCallbackCalled).to.be.true;
            chai.expect(capturedMeta).to.not.be.undefined;
            chai.expect(capturedMeta.originalMethod).to.equal('equal');
            chai.expect(capturedMeta.isSoft).to.be.false;
        });
        
        it('should call error callback in soft mode', async () => {
            let errorCallbackCalled = false;
            let capturedMeta: any;
            
            const assert = createAssertion({
                isSoft: true,
                onError: async (meta) => {
                    errorCallbackCalled = true;
                    capturedMeta = meta;
                    return new Error(`自定义错误: ${meta.errorMessage}`);
                }
            }) as any;
            
            await assert.equal(1, 2, '失败的断言');
            
            chai.expect(errorCallbackCalled).to.be.true;
            chai.expect(capturedMeta).to.not.be.undefined;
            chai.expect(capturedMeta.originalMethod).to.equal('equal');
            chai.expect(capturedMeta.isSoft).to.be.true;
        });
    });
    
    describe('插件兼容性', () => {
        it('should work with empty plugins array', async () => {
            const assert = createAssertion({
                plugins: []
            }) as any;
            
            await assert.equal(1, 1, '插件测试');
            
            chai.expect(assert._errorMessages.length).to.equal(0);
        });
        
        it('should work without plugins option', async () => {
            const assert = createAssertion() as any;
            
            await assert.equal(1, 1, '无插件测试');
            
            chai.expect(assert._errorMessages.length).to.equal(0);
        });
    });
    
    describe('新特性向后兼容性', () => {
        it('should work with all new configuration options', async () => {
            let successCount = 0;
            let errorCount = 0;
            
            const assert = createAssertion({
                style: 'assert',
                enablePerformanceMonitoring: true,
                verboseErrors: true,
                maxErrorCount: 50,
                isSoft: true,
                onSuccess: async (meta) => {
                    successCount++;
                },
                onError: async (meta) => {
                    errorCount++;
                }
            }) as any;
            
            await assert.equal(1, 1, '新特性测试');
            await assert.equal(1, 2, '故意失败的断言');
            
            chai.expect(successCount).to.equal(1);
            chai.expect(errorCount).to.equal(1);
            
            const errors = assert._errorMessages;
            chai.expect(errors.length).to.equal(1);
        });
        
        it('should work with default options (empty config)', async () => {
            const assert = createAssertion({}) as any;
            
            await assert.equal(1, 1, '默认配置测试');
            
            chai.expect(assert._errorMessages.length).to.equal(0);
        });
    });
    
    describe('错误消息字段兼容性', () => {
        it('should have _errorMessages field available', async () => {
            const assert = createAssertion() as any;
            
            // 检查错误消息字段存在
            chai.expect(assert._errorMessages).to.be.an('array');
            chai.expect(assert._errorMessages.length).to.equal(0);
        });
        
        it('should populate _errorMessages in soft mode', async () => {
            const softAssert = createAssertion({ isSoft: true }) as any;
            
            await softAssert.equal(1, 2, '错误消息测试');
            
            chai.expect(softAssert._errorMessages).to.be.an('array');
            chai.expect(softAssert._errorMessages.length).to.equal(1);
            chai.expect(softAssert._errorMessages[0]).to.be.a('string');
        });
    });
    
    describe('异常处理兼容性', () => {
        it('should throw errors in hard mode (default)', async () => {
            const assert = createAssertion() as any;
            
            let didThrow = false;
            let thrownError: Error;
            
            try {
                await assert.equal(1, 2, '应该抛出错误');
            } catch (error) {
                didThrow = true;
                thrownError = error as Error;
            }
            
            chai.expect(didThrow).to.be.true;
            chai.expect(thrownError!).to.be.an.instanceOf(Error);
        });
        
        it('should not throw errors in soft mode', async () => {
            const softAssert = createAssertion({ isSoft: true }) as any;
            
            let didThrow = false;
            
            try {
                await softAssert.equal(1, 2, '不应该抛出错误');
            } catch (error) {
                didThrow = true;
            }
            
            chai.expect(didThrow).to.be.false;
        });
    });
}); 