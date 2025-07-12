/// <reference types="mocha" />

import * as sinon from 'sinon';
import { expect } from 'chai';
import { PlaywrightPlugin } from '../src/plugin/index';
import { MockBrowser, MockBrowserContext, MockPage, MockElement } from './mocks/playwright.mock';

describe('PlaywrightPlugin Core Functionality', () => {
    let plugin: PlaywrightPlugin;
    let sandbox: sinon.SinonSandbox;
    let mockBrowser: MockBrowser;
    let mockContext: MockBrowserContext;
    let mockPage: MockPage;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();
        
        // Mock playwright module
        mockBrowser = new MockBrowser();
        mockContext = await mockBrowser.newContext();
        mockPage = await mockContext.newPage();

        // Stub playwright module
        sandbox.stub(require('playwright'), 'chromium').value({
            launch: async () => mockBrowser
        });
        
        plugin = new PlaywrightPlugin({
            browserName: 'chromium',
            launchOptions: { headless: true }
        });
    });

    afterEach(async () => {
        if (plugin) {
            await plugin.kill();
        }
        sandbox.restore();
    });

    describe('Browser Management', () => {
        it('should create browser client for applicant', async () => {
            const applicant = 'test-applicant';
            
            await plugin.url(applicant, 'https://example.com');
            
            // Browser should have been created
            expect(mockBrowser.contexts().length).to.be.greaterThan(0);
        });

        it('should reuse existing client for same applicant', async () => {
            const applicant = 'test-applicant';
            
            await plugin.url(applicant, 'https://example.com');
            const initialContextCount = mockBrowser.contexts().length;
            
            await plugin.url(applicant, 'https://example2.com');
            
            // Should not create new context
            expect(mockBrowser.contexts().length).to.equal(initialContextCount);
        });

        it('should create separate clients for different applicants', async () => {
            await plugin.url('applicant1', 'https://example.com');
            await plugin.url('applicant2', 'https://example.com');
            
            // Should create separate contexts
            expect(mockBrowser.contexts().length).to.equal(2);
        });
    });

    describe('Navigation Methods', () => {
        const applicant = 'test-applicant';

        beforeEach(async () => {
            // Ensure plugin is initialized with mock page
            await plugin.url(applicant, 'https://test.com');
            await mockPage.setTitle('Test Page');
            
            // Setup mock page with elements
            mockPage._addElement('#button', new MockElement({ text: 'Click me', enabled: true, visible: true }));
            mockPage._addElement('#input', new MockElement({ value: 'initial', enabled: true, visible: true }));
            mockPage._addElement('#text', new MockElement({ text: 'Sample text', enabled: true, visible: true }));
            mockPage._addElement('#element', new MockElement({ text: 'Element', enabled: true, visible: true }));
        });

        it('should navigate to URL', async () => {
            const url = 'https://example.com';
            
            const result = await plugin.url(applicant, url);
            
            expect(result).to.equal(url);
            expect(mockPage.url()).to.equal(url);
        });

        it('should get current URL when no URL provided', async () => {
            await mockPage.goto('https://current.com');
            
            const result = await plugin.url(applicant, '');
            
            expect(result).to.equal('https://current.com');
        });

        it('should refresh page', async () => {
            const spy = sandbox.spy(mockPage, 'reload');
            
            await plugin.refresh(applicant);
            
            expect(spy.calledOnce).to.be.true;
        });

        it('should get page title', async () => {
            await mockPage.setTitle('Test Page');
            
            const title = await plugin.getTitle(applicant);
            
            expect(title).to.equal('Test Page');
        });
    });

    describe('Element Interaction Methods', () => {
        const applicant = 'test-applicant';

        beforeEach(() => {
            mockPage._addElement('#button', new MockElement({ 
                text: 'Click me', 
                enabled: true 
            }));
            mockPage._addElement('#input', new MockElement({ 
                value: 'initial',
                enabled: true 
            }));
            mockPage._addElement('#disabled', new MockElement({ 
                enabled: false 
            }));
            mockPage._addElement('#checkbox', new MockElement({ 
                checked: true 
            }));
        });

        it('should click element', async () => {
            const element = (mockPage as any)._elements.get('#button')!;
            const spy = sandbox.spy(element, 'click');
            
            await plugin.click(applicant, '#button');
            
            expect(spy.calledOnce).to.be.true;
        });

        it('should set element value', async () => {
            await plugin.setValue(applicant, '#input', 'new value');
            
            const value = await plugin.getValue(applicant, '#input');
            expect(value).to.equal('new value');
        });

        it('should clear element value', async () => {
            await plugin.setValue(applicant, '#input', 'some text');
            await plugin.clearValue(applicant, '#input');
            
            const value = await plugin.getValue(applicant, '#input');
            expect(value).to.equal('');
        });

        it('should get element text', async () => {
            const text = await plugin.getText(applicant, '#button');
            
            expect(text).to.equal('Click me');
        });

        it('should check if element is enabled', async () => {
            const enabled = await plugin.isEnabled(applicant, '#button');
            const disabled = await plugin.isEnabled(applicant, '#disabled');
            
            expect(enabled).to.be.true;
            expect(disabled).to.be.false;
        });

        it('should check if element is selected/checked', async () => {
            const checked = await plugin.isSelected(applicant, '#checkbox');
            
            expect(checked).to.be.true;
        });

        it('should check if element exists', async () => {
            const exists = await plugin.isExisting(applicant, '#button');
            const notExists = await plugin.isExisting(applicant, '#nonexistent');
            
            expect(exists).to.be.true;
            expect(notExists).to.be.false;
        });

        it('should check if element is visible', async () => {
            const visible = await plugin.isVisible(applicant, '#button');
            
            expect(visible).to.be.true;
        });
    });

    describe('Wait Methods', () => {
        const applicant = 'test-applicant';

        beforeEach(() => {
            mockPage._addElement('#element', new MockElement({ 
                text: 'Content',
                visible: true 
            }));
        });

        it('should wait for element to exist', async () => {
            await plugin.waitForExist(applicant, '#element', 1000);
            
            // Should not throw
        });

        it('should wait for element to be visible', async () => {
            await plugin.waitForVisible(applicant, '#element', 1000);
            
            // Should not throw
        });

        it('should handle waitUntil condition', async () => {
            const condition = () => true;
            
            await plugin.waitUntil(applicant, condition, 1000);
            
            // Should not throw
        });
    });

    describe('Screenshot and Utilities', () => {
        const applicant = 'test-applicant';

        it('should take screenshot', async () => {
            const screenshot = await plugin.makeScreenshot(applicant);
            
            expect(screenshot).to.be.a('string');
            expect(screenshot.length).to.be.greaterThan(0);
        });

        it('should get page source', async () => {
            const source = await plugin.getSource(applicant);
            
            expect(source).to.include('html');
            expect(source).to.include('body');
        });

        it('should execute JavaScript', async () => {
            const result = await plugin.execute(applicant, 'return 2 + 2', []);
            
            expect(result).to.equal(4);
        });

        it('should execute async JavaScript', async () => {
            const result = await plugin.executeAsync(applicant, 'return Promise.resolve(42)', []);
            
            expect(result).to.equal(42);
        });
    });

    describe('Session Management', () => {
        it('should end session for applicant', async () => {
            const applicant = 'session-test-applicant';
            await plugin.url(applicant, 'https://example.com');
            const initialCount = mockBrowser.contexts().length;
            
            await plugin.end(applicant);
            
            // One context should be removed
            expect(mockBrowser.contexts().length).to.equal(initialCount - 1);
        });

        it('should handle ending non-existent session gracefully', async () => {
            await plugin.end('non-existent');
            
            // Should not throw
        });

        it('should kill all sessions', async () => {
            await plugin.url('applicant1', 'https://example.com');
            await plugin.url('applicant2', 'https://example.com');
            
            await plugin.kill();
            
            // All contexts should be closed
            expect(mockBrowser.contexts().length).to.equal(0);
        });
    });

    describe('Error Handling', () => {
        const applicant = 'test-applicant';

        it('should throw error for non-existent element', async () => {
            try {
                await plugin.click(applicant, '#nonexistent');
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error instanceof Error ? error.message : String(error)).to.include('Element not found');
            }
        });

        it('should handle browser launch failure gracefully', async () => {
            // Create plugin with invalid config to trigger error
            const invalidPlugin = new PlaywrightPlugin({
                browserName: 'invalid' as any
            });

            try {
                await invalidPlugin.url(applicant, 'https://example.com');
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error instanceof Error ? error.message : String(error)).to.include('Unsupported browser');
            }
        });
    });
});