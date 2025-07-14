import {run} from 'testring';

run(async (api) => {
    const app = api.application;
    
    // Test basic navigation
    await app.url('https://example.com');
    
    // Test title retrieval
    const title = await app.getTitle();
    await app.assert.include(title, 'Example');
    
    // Test simple navigation methods
    await app.url('https://api.wordpress.org/secret-key/1.1/salt/');
    await app.refresh();
    
    // Test basic element methods
    const pageSource = await app.getSource();
    await app.assert.include(pageSource, 'html');
});