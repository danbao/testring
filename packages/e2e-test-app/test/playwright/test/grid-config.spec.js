import {run} from 'testring';

run(async (api) => {
    const app = api.application;
    
    // 测试 Selenium Grid 配置功能
    await app.client.setCustomBrowserClientConfig({
        hostname: 'localhost',
        port: 8080,
        headers: {
            'X-Testring-Custom-Header': 'TestringCustomValue',
        },
        seleniumGrid: {
            gridUrl: 'http://localhost:8080/wd/hub',
            gridHeaders: {
                'X-Testring-Grid-Header': 'GridTestValue'
            }
        }
    });
    
    // 验证基本配置
    const config = await app.client.getCustomBrowserClientConfig();
    await app.assert.equal(
        config.headers['X-Testring-Custom-Header'],
        'TestringCustomValue',
        'Custom header should be set correctly'
    );
    
    // 验证 Selenium Grid 配置
    await app.assert.equal(
        config.seleniumGrid.gridUrl,
        'http://localhost:8080/wd/hub',
        'Grid URL should be set correctly'
    );
    
    await app.assert.equal(
        config.seleniumGrid.gridHeaders['X-Testring-Grid-Header'],
        'GridTestValue',
        'Grid header should be set correctly'
    );
    
    console.log('[Test] Selenium Grid configuration test completed successfully');
    console.log('[Test] Custom headers were successfully configured for Grid');
});
