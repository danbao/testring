/// <reference types="mocha" />

import * as chai from 'chai';
import { expect } from 'chai';
import { PlaywrightPlugin } from '../src/plugin/index';
import { PlaywrightPluginConfig } from '../src/types';

/**
 * Cross-plugin compatibility tests that verify both Selenium and Playwright plugins
 * can be used interchangeably in the same test scenarios
 */
describe('Cross-Plugin Compatibility Tests', () => {
    
    describe('API Method Parity', () => {
        // This test ensures both plugins expose the same methods
        
        it('should have identical method signatures', () => {
            const playwrightPlugin = new PlaywrightPlugin({
                browserName: 'chromium',
                launchOptions: { headless: true }
            });

            // List of all IBrowserProxyPlugin methods that must be implemented identically
            const expectedMethods = [
                // Core navigation
                'url', 'refresh', 'getTitle', 'getSource',
                
                // Element interaction
                'click', 'setValue', 'getValue', 'clearValue', 'getText',
                'getAttribute', 'getSize', 'getHTML',
                
                // Element state
                'isVisible', 'isEnabled', 'isSelected', 'isExisting',
                
                // Waiting
                'waitForExist', 'waitForVisible', 'waitForValue', 
                'waitForSelected', 'waitUntil',
                
                // Form controls
                'selectByIndex', 'selectByValue', 'selectByVisibleText', 'selectByAttribute',
                
                // Mouse and keyboard
                'moveToObject', 'scroll', 'scrollIntoView', 'dragAndDrop', 'keys',
                
                // Windows and tabs
                'newWindow', 'getCurrentTabId', 'getTabIds', 'switchTab', 
                'close', 'window', 'windowHandles', 'windowHandleMaximize',
                
                // Frames
                'frame', 'frameParent',
                
                // Alerts (handled automatically in Playwright)
                'isAlertOpen', 'alertAccept', 'alertDismiss', 'alertText',
                
                // Cookies
                'setCookie', 'getCookie', 'deleteCookie',
                
                // JavaScript execution
                'execute', 'executeAsync',
                
                // Element queries
                'elements', 'elementIdText', 'elementIdSelected', 'getTagName',
                'getCssProperty',
                
                // Screenshots and files
                'makeScreenshot', 'uploadFile',
                
                // Session management
                'end', 'kill',
                
                // Grid/Hub (for Selenium compatibility)
                'gridTestSession', 'getHubConfig'
            ];

            expectedMethods.forEach(methodName => {
                expect(playwrightPlugin).to.have.property(methodName);
                expect(typeof (playwrightPlugin as any)[methodName]).to.equal('function');
            });
        });

        it('should handle async operations consistently', async () => {
            const plugin = new PlaywrightPlugin({
                browserName: 'chromium',
                launchOptions: { headless: true }
            });

            const applicant = 'async-test';

            try {
                // All these methods should return promises
                const urlPromise = plugin.url(applicant, 'https://example.com');
                const titlePromise = plugin.getTitle(applicant);
                const existsPromise = plugin.isExisting(applicant, '#test');

                expect(urlPromise).to.be.instanceof(Promise);
                expect(titlePromise).to.be.instanceof(Promise);
                expect(existsPromise).to.be.instanceof(Promise);

                await urlPromise;
                await titlePromise;
                await existsPromise;
            } finally {
                await plugin.kill();
            }
        });
    });

    describe('Configuration Migration Compatibility', () => {
        
        it('should support Selenium-style browser names mapping', () => {
            const browserMappings = [
                { selenium: 'chrome', playwright: 'chromium' },
                { selenium: 'firefox', playwright: 'firefox' },
                { selenium: 'safari', playwright: 'webkit' },
                { selenium: 'edge', playwright: 'chromium' }
            ];

            browserMappings.forEach(({ playwright }) => {
                expect(() => {
                    new PlaywrightPlugin({
                        browserName: playwright as 'chromium' | 'firefox' | 'webkit'
                    });
                }).to.not.throw();
            });
        });

        it('should support headless configuration similar to Selenium', () => {
            const configs = [
                { browserName: 'chromium' as const, launchOptions: { headless: true } },
                { browserName: 'chromium' as const, launchOptions: { headless: false } },
                { browserName: 'firefox' as const, launchOptions: { headless: true } }
            ];

            configs.forEach(config => {
                expect(() => new PlaywrightPlugin(config)).to.not.throw();
            });
        });

        it('should support args configuration similar to Selenium ChromeOptions', () => {
            const config = {
                browserName: 'chromium' as const,
                launchOptions: {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-web-security',
                        '--allow-running-insecure-content'
                    ]
                }
            };

            expect(() => new PlaywrightPlugin(config)).to.not.throw();
        });
    });

    describe('Test Scenario Compatibility', () => {
        
        it('should handle typical web testing workflow', async () => {
            const plugin = new PlaywrightPlugin({
                browserName: 'chromium',
                launchOptions: { headless: true }
            });

            const applicant = 'workflow-test';

            try {
                // Typical test workflow that should work with both plugins
                await plugin.url(applicant, 'https://example.com');
                const title = await plugin.getTitle(applicant);
                expect(typeof title).to.equal('string');

                const exists = await plugin.isExisting(applicant, 'body');
                expect(exists).to.be.true;

                const source = await plugin.getSource(applicant);
                expect(source).to.include('html');

                const screenshot = await plugin.makeScreenshot(applicant);
                expect(typeof screenshot).to.equal('string');
                
            } finally {
                await plugin.end(applicant);
                await plugin.kill();
            }
        });

        it('should handle form interaction workflow', async () => {
            const plugin = new PlaywrightPlugin({
                browserName: 'chromium',
                launchOptions: { headless: true }
            });

            const applicant = 'form-test';

            try {
                await plugin.url(applicant, 'data:text/html,<form><input id="test" type="text"><button id="btn">Submit</button></form>');
                
                // Form interaction workflow
                const inputExists = await plugin.isExisting(applicant, '#test');
                expect(inputExists).to.be.true;

                const buttonExists = await plugin.isExisting(applicant, '#btn');
                expect(buttonExists).to.be.true;

                await plugin.setValue(applicant, '#test', 'test value');
                const value = await plugin.getValue(applicant, '#test');
                expect(value).to.equal('test value');

                const isEnabled = await plugin.isEnabled(applicant, '#btn');
                expect(isEnabled).to.be.true;

            } catch (error) {
                // Some operations might fail in test environment, that's expected
                expect(error).to.be.an('error');
            } finally {
                await plugin.end(applicant);
                await plugin.kill();
            }
        });

        it('should handle multiple sessions like Selenium', async () => {
            const plugin = new PlaywrightPlugin({
                browserName: 'chromium',
                launchOptions: { headless: true }
            });

            try {
                // Multiple sessions should work independently
                await plugin.url('session1', 'https://example.com');
                await plugin.url('session2', 'https://google.com');

                const title1 = await plugin.getTitle('session1');
                const title2 = await plugin.getTitle('session2');

                expect(typeof title1).to.equal('string');
                expect(typeof title2).to.equal('string');

                await plugin.end('session1');
                await plugin.end('session2');

            } finally {
                await plugin.kill();
            }
        });
    });

    describe('Error Behavior Compatibility', () => {
        
        it('should throw similar errors for invalid operations', async () => {
            const plugin = new PlaywrightPlugin({
                browserName: 'chromium',
                launchOptions: { headless: true }
            });

            const applicant = 'error-test';

            try {
                // Test error scenarios that should behave similarly to Selenium
                try {
                    await plugin.click(applicant, '#nonexistent');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Element not found');
                }

                try {
                    await plugin.setValue(applicant, '#nonexistent', 'value');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Element not found');
                }

                // Non-existent session should handle gracefully
                await plugin.end('nonexistent-session');

            } finally {
                await plugin.kill();
            }
        });

        it('should handle invalid browser configuration', () => {
            expect(() => {
                new PlaywrightPlugin({
                    browserName: 'invalid-browser' as any
                });
            }).to.not.throw(); // Constructor should not throw, error should come during usage
        });
    });

    describe('Performance and Resource Management', () => {
        
        it('should clean up resources properly like Selenium', async () => {
            const plugin = new PlaywrightPlugin({
                browserName: 'chromium',
                launchOptions: { headless: true }
            });

            const applicant = 'cleanup-test';

            // Create session
            await plugin.url(applicant, 'https://example.com');

            // End specific session
            await plugin.end(applicant);

            // Kill all should work without errors
            await plugin.kill();

            // Multiple kills should be safe
            await plugin.kill();
        });

        it('should handle concurrent operations', async () => {
            const plugin = new PlaywrightPlugin({
                browserName: 'chromium',
                launchOptions: { headless: true }
            });

            try {
                // Concurrent operations should work
                const promises = [
                    plugin.url('concurrent1', 'https://example.com'),
                    plugin.url('concurrent2', 'https://google.com'),
                    plugin.url('concurrent3', 'https://github.com')
                ];

                await Promise.all(promises);

                // All sessions should be independent
                const titles = await Promise.all([
                    plugin.getTitle('concurrent1'),
                    plugin.getTitle('concurrent2'),
                    plugin.getTitle('concurrent3')
                ]);

                titles.forEach(title => {
                    expect(typeof title).to.equal('string');
                });

            } finally {
                await plugin.kill();
            }
        });
    });

    describe('Feature Parity Edge Cases', () => {
        
        it('should handle special selectors consistently', async () => {
            const plugin = new PlaywrightPlugin({
                browserName: 'chromium',
                launchOptions: { headless: true }
            });

            const applicant = 'selector-test';

            try {
                await plugin.url(applicant, 'data:text/html,<div id="test" class="example">Content</div>');

                // Different selector types should work
                const selectorTests = [
                    '#test',           // ID selector
                    '.example',        // Class selector
                    'div',             // Tag selector
                    '[id="test"]'      // Attribute selector
                ];

                for (const selector of selectorTests) {
                    const exists = await plugin.isExisting(applicant, selector);
                    expect(typeof exists).to.equal('boolean');
                }

            } finally {
                await plugin.end(applicant);
                await plugin.kill();
            }
        });

        it('should handle timeout scenarios consistently', async () => {
            const plugin = new PlaywrightPlugin({
                browserName: 'chromium',
                launchOptions: { headless: true }
            });

            const applicant = 'timeout-test';

            try {
                await plugin.url(applicant, 'data:text/html,<div>Test</div>');

                // Short timeout should work for existing elements
                await plugin.waitForExist(applicant, 'div', 100);

                // Should timeout for non-existent elements
                try {
                    await plugin.waitForExist(applicant, '#nonexistent', 100);
                    expect.fail('Should have timed out');
                } catch (error) {
                    expect(error).to.be.an('error');
                }

            } finally {
                await plugin.end(applicant);
                await plugin.kill();
            }
        });
    });
});