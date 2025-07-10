/**
 * @fileoverview 异步断言库的类型定义
 * 
 * 这个文件定义了async-assert模块中用到的所有接口和类型。
 * 主要包含断言配置选项、成功/失败回调的数据结构等。
 * 
 * 支持 Chai 5.2.1 的新特性：
 * - 多种断言风格：assert, expect, should
 * - 增强的错误处理和消息格式
 * - 新的断言方法和类型检查
 */

import type {use as chaiUse} from 'chai';

/**
 * 提取函数参数类型的第一个参数
 * 用于获取 chai.use() 方法的插件参数类型
 */
type First<T> = T extends [infer A, ...any[]] ? A : never;

/**
 * Chai插件类型定义
 * 从chai库的use方法参数中提取出插件的类型
 */
type ChaiPlugin = First<Parameters<typeof chaiUse>>;

/**
 * 断言风格类型
 * 定义了支持的三种断言风格
 */
export type AssertionStyle = 'assert' | 'expect' | 'should';

/**
 * 断言成功时的元数据接口
 * 当断言执行成功时，会将这些信息传递给onSuccess回调函数
 */
export interface IAssertionSuccessMeta {
    /** 是否为软断言模式 */
    isSoft: boolean;
    /** 成功时的自定义消息 */
    successMessage?: string;
    /** 断言方法的描述消息，包含方法名和参数 */
    assertMessage?: string;
    /** 原始断言方法的名称，如 'equal', 'isTrue' 等 */
    originalMethod: string;
    /** 传递给断言方法的参数数组 */
    args: any[];
    /** 断言风格 */
    style: AssertionStyle;
    /** 执行时间（毫秒）- 可选且可能为 undefined */
    executionTime?: number | undefined;
}

/**
 * 断言失败时的元数据接口
 * 继承自成功元数据，并添加了错误相关的信息
 */
export interface IAssertionErrorMeta extends IAssertionSuccessMeta {
    /** 原始错误消息 */
    errorMessage?: string;
    /** 错误对象实例 */
    error?: Error;
    /** 错误堆栈信息 - 可选且可能为 undefined */
    errorStack?: string | undefined;
    /** 实际值 */
    actualValue?: any;
    /** 期望值 */
    expectedValue?: any;
    /** 差异信息 */
    diff?: string;
}

/**
 * 断言配置选项接口
 * 用于创建断言实例时的配置参数
 */
export interface IAssertionOptions {
    /** 
     * 是否启用软断言模式
     * - true: 软断言，失败时不抛出错误，而是收集错误信息
     * - false: 硬断言，失败时立即抛出错误（默认）
     */
    isSoft?: boolean;
    
    /** 
     * 断言风格
     * - 'assert': 使用 assert 风格（默认）
     * - 'expect': 使用 expect 风格
     * - 'should': 使用 should 风格
     */
    style?: AssertionStyle;
    
    /** 
     * 断言成功时的回调函数
     * 可以用于记录成功的断言或执行其他操作
     */
    onSuccess?: (arg0: IAssertionSuccessMeta) => void | Promise<void>;
    
    /** 
     * 断言失败时的回调函数
     * 可以用于自定义错误处理或返回自定义错误对象
     * 如果返回Error对象，将使用该对象替换原始错误
     */
    onError?: (arg0: IAssertionErrorMeta) => void | Error | Promise<void | Error>;
    
    /** 
     * Chai插件数组
     * 可以扩展断言库的功能
     */
    plugins?: ChaiPlugin[];
    
    /** 
     * 自定义错误消息格式化函数
     * 可以自定义错误消息的显示格式
     */
    errorFormatter?: (error: Error, meta: IAssertionErrorMeta) => string;
    
    /** 
     * 是否启用性能监控
     * 如果启用，会在元数据中包含执行时间
     */
    enablePerformanceMonitoring?: boolean;
    
    /** 
     * 最大错误收集数量（仅在软断言模式下有效）
     * 默认为 100，防止内存泄漏
     */
    maxErrorCount?: number;
    
    /** 
     * 是否启用详细的错误信息
     * 包含更多的调试信息，如堆栈跟踪、差异比较等
     */
    verboseErrors?: boolean;
}
