// 专门用于测试 Selenium Grid 功能的配置文件
// 导入统一的timeout配置
const TIMEOUTS = require('../../timeout-config.js');

module.exports = async (config) => {
    const local = !config.headless;

    const babelConfig = {
        presets: [
            [
                '@babel/preset-env',
                {
                    targets: {
                        node: 'current',
                    },
                },
            ],
        ],
    };

    if (config.debug) {
        babelConfig.presets[0][1].debug = true;
        babelConfig.sourceMaps = 'inline';
    }

    return {
        screenshotPath: './_tmp/',
        workerLimit: local ? 'local' : 5,
        maxWriteThreadCount: 2,
        screenshots: 'disable',
        retryCount: local ? 0 : 2, // 在 CI 环境中重试失败的测试
        testTimeout: local ? 0 : (config.testTimeout || TIMEOUTS.TEST_EXECUTION),
        tests: 'test/playwright/test/grid-config.spec.js', // 只运行 Grid 配置测试
        plugins: [
            [
                'playwright-driver',
                {
                    browserName: 'chromium',
                    launchOptions: {
                        headless: !local,
                        slowMo: local ? 100 : 0,
                        args: local ? [] : ['--no-sandbox']
                    },
                    clientTimeout: local ? 0 : (config.testTimeout || TIMEOUTS.CLIENT_SESSION),
                    // 启用 mock Selenium Grid 用于测试自定义头信息
                    seleniumGrid: {
                        gridUrl: 'http://localhost:8080/wd/hub',
                        gridCapabilities: {
                            'browserName': 'chrome',
                            'browserVersion': 'latest'
                        },
                        gridHeaders: {
                            'X-Testring-Custom-Header': 'TestringCustomValue'
                        }
                    },
                },
            ],
            ['babel', babelConfig],
        ],
    };
};
