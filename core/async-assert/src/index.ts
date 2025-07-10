/**
 * @fileoverview 异步断言库的主要实现
 * 
 * 这个文件实现了异步断言库的核心功能，包括：
 * 1. 将Chai的同步断言方法转换为异步版本
 * 2. 支持软断言和硬断言两种模式
 * 3. 提供成功/失败回调处理机制
 * 4. 使用Proxy代理来动态创建断言方法
 * 5. 支持多种断言风格（assert、expect、should）
 * 6. 增强的错误处理和性能监控
 */

import * as chai from 'chai';
import {IAssertionOptions, AssertionStyle} from '@testring/types';
import {PromisedAssert} from './promisedAssert';

/**
 * 用于存储错误消息的字段名
 * 在软断言模式下，失败的断言错误会被存储在这个字段中
 */
const errorMessagesField = '_errorMessages';

/**
 * 断言API类型定义
 * 扩展了chai.assert，并添加了错误消息存储字段
 */
type AssertionAPI = typeof chai['assert'] & {
    [errorMessagesField]: Array<string>;
};

/**
 * 包装后的Promise断言API类型
 * 结合了PromisedAssert接口、错误消息字段和原始AssertionAPI
 */
type WrappedPromisedAssertionApi = PromisedAssert & {
    [errorMessagesField]: Array<string>;
} & AssertionAPI;

/**
 * 性能监控工具类
 * 用于记录断言执行时间
 */
class PerformanceMonitor {
    private startTime: number = 0;
    
    start(): void {
        this.startTime = Date.now();
    }
    
    getExecutionTime(): number {
        return Date.now() - this.startTime;
    }
}

/**
 * 错误格式化工具
 * 用于格式化错误消息和提取有用信息
 */
class ErrorFormatter {
    /**
     * 格式化错误消息
     * @param error 错误对象
     * @param meta 错误元数据
     * @returns 格式化后的错误消息
     */
    static formatError(error: Error, meta: any): string {
        let message = error.message;
        
        // 如果有自定义格式化函数，使用它
        if (meta.errorFormatter) {
            return meta.errorFormatter(error, meta);
        }
        
        // 默认格式化
        if (meta.verboseErrors) {
            const parts = [
                `Error: ${message}`,
                `Method: ${meta.originalMethod}`,
                `Style: ${meta.style}`,
                `Args: ${JSON.stringify(meta.args)}`,
            ];
            
            if (meta.actualValue !== undefined) {
                parts.push(`Actual: ${JSON.stringify(meta.actualValue)}`);
            }
            
            if (meta.expectedValue !== undefined) {
                parts.push(`Expected: ${JSON.stringify(meta.expectedValue)}`);
            }
            
            if (meta.executionTime !== undefined) {
                parts.push(`Execution Time: ${meta.executionTime}ms`);
            }
            
            return parts.join('\n');
        }
        
        return message;
    }
    
    /**
     * 提取错误中的实际值和期望值
     * @param error 错误对象
     * @param args 断言参数
     * @returns 提取的值
     */
    static extractValues(error: Error, args: any[]): { actual?: any; expected?: any } {
        const result: { actual?: any; expected?: any } = {};
        
        // 基于参数推断实际值和期望值
        if (args.length >= 2) {
            result.actual = args[0];
            result.expected = args[1];
        } else if (args.length === 1) {
            result.actual = args[0];
        }
        
        return result;
    }
}

/**
 * 创建 expect 风格的断言实例
 * @param options 断言配置选项
 * @returns expect 风格的断言函数
 */
function createExpectStyleAssertion(options: IAssertionOptions = {}) {
    // 加载插件
    for (const plugin of options.plugins || []) {
        chai.use(plugin);
    }
    
    return function expectAsync(value: any) {
        const expectChain = chai.expect(value);
        
        // 创建异步包装器
        return new Proxy(expectChain, {
            get(target, prop) {
                const originalMethod = (target as any)[prop];
                
                if (typeof originalMethod === 'function') {
                    return async function(...args: any[]) {
                        const monitor = new PerformanceMonitor();
                        if (options.enablePerformanceMonitoring) {
                            monitor.start();
                        }
                        
                        try {
                            const result = originalMethod.apply(target, args);
                            
                            if (options.onSuccess) {
                                await options.onSuccess({
                                    isSoft: options.isSoft || false,
                                    successMessage: args[args.length - 1],
                                    assertMessage: `expect(${JSON.stringify(value)}).${String(prop)}`,
                                    originalMethod: String(prop),
                                    args: [value, ...args],
                                    style: 'expect',
                                    executionTime: options.enablePerformanceMonitoring ? monitor.getExecutionTime() : undefined,
                                });
                            }
                            
                            return result;
                        } catch (error) {
                            const errorMeta = {
                                isSoft: options.isSoft || false,
                                successMessage: args[args.length - 1],
                                assertMessage: `expect(${JSON.stringify(value)}).${String(prop)}`,
                                originalMethod: String(prop),
                                args: [value, ...args],
                                style: 'expect' as AssertionStyle,
                                errorMessage: (error as Error).message,
                                error: error as Error,
                                errorStack: (error as Error).stack,
                                executionTime: options.enablePerformanceMonitoring ? monitor.getExecutionTime() : undefined,
                                ...ErrorFormatter.extractValues(error as Error, [value, ...args]),
                            };
                            
                            let handleError: void | Error | null = null;
                            
                            if (options.onError) {
                                handleError = await options.onError(errorMeta);
                            }
                            
                            if (!handleError) {
                                handleError = error as Error;
                            }
                            
                            // 格式化错误消息
                            if (handleError instanceof Error) {
                                handleError.message = ErrorFormatter.formatError(handleError, { ...errorMeta, errorFormatter: options.errorFormatter, verboseErrors: options.verboseErrors });
                            }
                            
                            throw handleError;
                        }
                    };
                }
                
                return originalMethod;
            }
        });
    };
}

/**
 * 创建 should 风格的断言实例
 * @param options 断言配置选项
 * @returns should 风格的断言对象
 */
function createShouldStyleAssertion(options: IAssertionOptions = {}) {
    // 加载插件
    for (const plugin of options.plugins || []) {
        chai.use(plugin);
    }
    
    // 启用 should 风格
    chai.should();
    
    // 返回一个代理对象，拦截对 should 属性的访问
    return new Proxy({}, {
        get(target, prop) {
            if (prop === 'should') {
                return function(value: any) {
                    const shouldChain = (value as any).should;
                    
                    return new Proxy(shouldChain, {
                        get(target, prop) {
                            const originalMethod = (target as any)[prop];
                            
                            if (typeof originalMethod === 'function') {
                                return async function(...args: any[]) {
                                    const monitor = new PerformanceMonitor();
                                    if (options.enablePerformanceMonitoring) {
                                        monitor.start();
                                    }
                                    
                                    try {
                                        const result = originalMethod.apply(target, args);
                                        
                                        if (options.onSuccess) {
                                            await options.onSuccess({
                                                isSoft: options.isSoft || false,
                                                successMessage: args[args.length - 1],
                                                assertMessage: `should.${String(prop)}`,
                                                originalMethod: String(prop),
                                                args: [value, ...args],
                                                style: 'should',
                                                executionTime: options.enablePerformanceMonitoring ? monitor.getExecutionTime() : undefined,
                                            });
                                        }
                                        
                                        return result;
                                    } catch (error) {
                                        const errorMeta = {
                                            isSoft: options.isSoft || false,
                                            successMessage: args[args.length - 1],
                                            assertMessage: `should.${String(prop)}`,
                                            originalMethod: String(prop),
                                            args: [value, ...args],
                                            style: 'should' as AssertionStyle,
                                            errorMessage: (error as Error).message,
                                            error: error as Error,
                                            errorStack: (error as Error).stack,
                                            executionTime: options.enablePerformanceMonitoring ? monitor.getExecutionTime() : undefined,
                                            ...ErrorFormatter.extractValues(error as Error, [value, ...args]),
                                        };
                                        
                                        let handleError: void | Error | null = null;
                                        
                                        if (options.onError) {
                                            handleError = await options.onError(errorMeta);
                                        }
                                        
                                        if (!handleError) {
                                            handleError = error as Error;
                                        }
                                        
                                        // 格式化错误消息
                                        if (handleError instanceof Error) {
                                            handleError.message = ErrorFormatter.formatError(handleError, { ...errorMeta, errorFormatter: options.errorFormatter, verboseErrors: options.verboseErrors });
                                        }
                                        
                                        throw handleError;
                                    }
                                };
                            }
                            
                            return originalMethod;
                        }
                    });
                };
            }
            
            return (target as any)[prop];
        }
    });
}

/**
 * 创建异步断言实例的工厂函数
 * 
 * @param options - 断言配置选项
 * @returns 返回一个异步断言实例，支持所有chai断言方法的异步版本
 * 
 * @example
 * ```typescript
 * // 创建硬断言实例
 * const assert = createAssertion();
 * await assert.equal(actual, expected);
 * 
 * // 创建软断言实例  
 * const softAssert = createAssertion({ isSoft: true });
 * await softAssert.equal(actual, expected);
 * console.log(softAssert._errorMessages); // 查看收集的错误
 * 
 * // 创建 expect 风格的断言
 * const expect = createAssertion({ style: 'expect' });
 * await expect(value).to.equal(expected);
 * ```
 */
export function createAssertion(options: IAssertionOptions = {}) {
    const style = options.style || 'assert';
    
    // 根据风格创建不同的断言实例
    if (style === 'expect') {
        return createExpectStyleAssertion(options);
    } else if (style === 'should') {
        return createShouldStyleAssertion(options);
    }
    
    // 默认使用 assert 风格
    return createAssertStyleAssertion(options);
}

/**
 * 创建 assert 风格的断言实例（默认）
 * @param options 断言配置选项
 * @returns assert 风格的断言实例
 */
function createAssertStyleAssertion(options: IAssertionOptions = {}) {
    /** 是否为软断言模式 */
    const isSoft = options.isSoft === true;
    /** 最大错误收集数量 */
    const maxErrorCount = options.maxErrorCount || 100;
    
    // 加载用户提供的chai插件
    for (const plugin of options.plugins || []) {
        chai.use(plugin);
    }
    
    /**
     * Proxy代理的getter处理函数
     * 当访问断言方法时，会动态创建对应的异步包装函数
     * 
     * @param target - 目标对象（断言API）
     * @param fieldName - 要访问的字段名
     * @returns 返回包装后的异步断言方法或错误消息数组
     */
    // eslint-disable-next-line sonarjs/cognitive-complexity
    const proxyGetter = (target: AssertionAPI, fieldName: string) => {
        // 如果访问的是错误消息字段，直接返回
        if (fieldName === errorMessagesField) {
            return target[errorMessagesField];
        }

        /** 断言类型描述，用于日志记录 */
        const typeOfAssert = isSoft ? 'softAssert' : 'assert';

        /** 获取chai中的原始断言方法 */
        const originalMethod = (chai.assert as any)[fieldName];
        
        /** 
         * 通过解析方法的字符串形式来获取参数名
         * 这里移除了注释，然后提取参数列表
         */
        const methodAsString = (target as any)[fieldName]
            .toString()
            .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, '');
        const stringStart = methodAsString.indexOf('(') + 1;
        const stringEnd = methodAsString.indexOf(')');
        const methodArgs =
            methodAsString.slice(stringStart, stringEnd).match(/([^\s,]+)/g) ||
            [];

        /**
         * 返回包装后的异步断言方法
         * 这个方法会处理参数，执行断言，并根据结果调用相应的回调
         */
        return async (...args: any[]) => {
            /** 性能监控器 */
            const monitor = new PerformanceMonitor();
            if (options.enablePerformanceMonitoring) {
                monitor.start();
            }
            
            /** 
             * 提取成功消息
             * 如果参数数量与原方法参数数量匹配，最后一个参数通常是消息
             */
            const successMessage =
                originalMethod.length === args.length ? args.pop() : '';
            
            /** 用于构建断言描述信息的参数数组 */
            const assertArguments: Array<any> = [];

            /** 构建断言描述信息，格式：[断言类型] 方法名(参数) */
            let assertMessage = `[${typeOfAssert}] ${fieldName}`;

            // 构建参数描述字符串
            for (let index = 0; index < methodArgs.length; index++) {
                if (index === args.length) {
                    break;
                }

                /** 
                 * JSON序列化参数值，特殊处理正则表达式
                 * 正则表达式会被转换为字符串形式
                 */
                const replacer = (_k: any, v: any) =>
                    Object.prototype.toString.call(v) === '[object RegExp]'
                        ? v.toString()
                        : v;
                const argsString =
                    typeof args[index] !== 'undefined'
                        ? JSON.stringify(args[index], replacer)
                        : 'undefined';

                assertArguments.push(methodArgs[index] + ' = ' + argsString);
            }

            // 完成断言消息的构建
            assertMessage += `(${assertArguments.join(', ')})`;

            try {
                // 执行原始的chai断言方法
                originalMethod(...args);

                // 如果断言成功且配置了成功回调，则调用回调
                if (options.onSuccess) {
                    await options.onSuccess({
                        isSoft,
                        successMessage,
                        assertMessage,
                        args,
                        originalMethod: fieldName,
                        style: 'assert',
                        executionTime: options.enablePerformanceMonitoring ? monitor.getExecutionTime() : undefined,
                    });
                }
            } catch (error) {
                /** 原始错误消息 */
                const errorMessage = (error as Error).message;
                /** 处理后的错误对象 */
                let handleError: void | Error | null = null;

                // 构建错误元数据
                const errorMeta = {
                    isSoft,
                    successMessage,
                    assertMessage,
                    errorMessage,
                    error: (error instanceof Error) ? error : new Error(String(error)),
                    errorStack: (error as Error).stack,
                    args,
                    originalMethod: fieldName,
                    style: 'assert' as AssertionStyle,
                    executionTime: options.enablePerformanceMonitoring ? monitor.getExecutionTime() : undefined,
                    ...ErrorFormatter.extractValues(error as Error, args),
                };

                // 使用自定义消息或断言描述信息覆盖错误消息
                (error as Error).message = successMessage || assertMessage || errorMessage;

                // 如果配置了错误回调，则调用回调处理错误
                if (options.onError) {
                    handleError = await options.onError(errorMeta);
                }

                // 如果回调没有返回自定义错误，使用原始错误
                if (!handleError) {
                    handleError = error as Error;
                }

                // 格式化错误消息
                if (handleError instanceof Error) {
                    handleError.message = ErrorFormatter.formatError(handleError, { ...errorMeta, errorFormatter: options.errorFormatter, verboseErrors: options.verboseErrors });
                }

                if (isSoft) {
                    // 软断言模式：收集错误信息而不抛出
                    // 检查是否超过最大错误数量
                    if (target[errorMessagesField].length < maxErrorCount) {
                        target[errorMessagesField].push(
                            (handleError as Error).message,
                        );
                    }
                } else {
                    // 硬断言模式：立即抛出错误
                    throw handleError;
                }
            }
        };
    };

    /** 
     * 创建根断言对象
     * 复制chai.assert的所有方法，并添加错误消息收集字段
     */
    const root: AssertionAPI = Object.assign({}, chai.assert, {
        [errorMessagesField]: [],
    });

    /**
     * 返回Proxy代理对象
     * 当访问断言方法时，会通过proxyGetter动态创建异步包装版本
     */
    return new Proxy<WrappedPromisedAssertionApi>(root as any, {
        get: proxyGetter,
    });
}

/**
 * 导出便捷函数
 */
export { createExpectStyleAssertion as createExpect, createShouldStyleAssertion as createShould };

/**
 * 导出默认的断言创建函数
 */
export default createAssertion;
