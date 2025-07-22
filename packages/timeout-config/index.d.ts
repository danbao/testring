declare const TIMEOUTS: {
  // 快速操作
  CLICK: number;
  HOVER: number;
  FILL: number;
  KEY: number;
  
  // 中等操作
  WAIT_FOR_ELEMENT: number;
  WAIT_FOR_VISIBLE: number;
  WAIT_FOR_CLICKABLE: number;
  WAIT_FOR_ENABLED: number;
  WAIT_FOR_STABLE: number;
  CONDITION: number;
  
  // 慢速操作
  PAGE_LOAD: number;
  NAVIGATION: number;
  NETWORK_REQUEST: number;
  WAIT_FOR_VALUE: number;
  WAIT_FOR_SELECTED: number;
  
  // 非常慢的操作
  TEST_EXECUTION: number;
  CLIENT_SESSION: number;
  PAGE_LOAD_MAX: number;
  GLOBAL_TEST: number;
  
  // 清理操作
  TRACE_STOP: number;
  COVERAGE_STOP: number;
  CONTEXT_CLOSE: number;
  SESSION_CLOSE: number;
  BROWSER_CLOSE: number;
  
  // 兼容性别名
  WAIT_TIMEOUT: number;
  TICK_TIMEOUT: number;
  
  // 工具函数
  custom: (category: string, operation: string, baseValue?: number) => number;
  isLocal: boolean;
  isCI: boolean;
  isDebug: boolean;
};

export = TIMEOUTS; 