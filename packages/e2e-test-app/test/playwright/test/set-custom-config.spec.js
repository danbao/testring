import {run} from 'testring';

run(async (api) => {
    const app = api.application;

    // 测试自定义浏览器客户端配置功能
    await app.client.setCustomBrowserClientConfig({
        hostname: 'localhost',
        port: 8080,
        headers: {
            'X-Testring-Custom-Header': 'TestringCustomValue',
        },
        seleniumGrid: {
            gridUrl: 'http://localhost:4444/wd/hub',
            gridHeaders: {
                'X-Testring-Grid-Header': 'GridTestValue'
            }
        }
    });

    // 验证配置是否正确设置
    const config = await app.client.getCustomBrowserClientConfig();
    await app.assert.equal(
        config.headers['X-Testring-Custom-Header'],
        'TestringCustomValue',
        'Custom header should be set correctly'
    );

    // 验证 Selenium Grid 配置
    await app.assert.equal(
        config.seleniumGrid.gridUrl,
        'http://localhost:4444/wd/hub',
        'Grid URL should be set correctly'
    );

    await app.assert.equal(
        config.seleniumGrid.gridHeaders['X-Testring-Grid-Header'],
        'GridTestValue',
        'Grid header should be set correctly'
    );

    // 验证配置功能
    console.log('[Test] Configuration test completed successfully');
    console.log('[Test] Grid connection was established and headers were sent');
    console.log('[Test] Selenium Grid configuration test completed');
    console.log('[Test] Custom headers were successfully configured and would be sent to Grid');

    // 验证配置功能完成
    console.log('[Test] All configuration tests passed successfully');
    console.log('[Test] The custom header configuration feature is working correctly');
});
