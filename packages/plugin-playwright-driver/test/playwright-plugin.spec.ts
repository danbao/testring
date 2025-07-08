import { PlaywrightPlugin, PlaywrightPluginConfig } from '../src/index';
import { PluginAPI } from '@testring/types';
import { loggerClient } from '@testring/logger';
import { BrowserManager } from '../src/browser-manager';
import { Page, Browser, BrowserContext } from 'playwright';

// Mock BrowserManager
jest.mock('../src/browser-manager');

// Mock Playwright's Page, Browser, BrowserContext if necessary for deeper testing,
// but BrowserManager mock should cover most direct interactions.
const mockPage = {
    goto: jest.fn(),
    url: jest.fn(),
    reload: jest.fn(),
    click: jest.fn(),
    title: jest.fn(),
    context: jest.fn(() => mockContext),
    isClosed: jest.fn(() => false),
    on: jest.fn(), // For dialog listener
    once: jest.fn(), // For dialog accept/dismiss
    guid: 'test-page-guid',
} as unknown as Page;

const mockContext = {
    addCookies: jest.fn(),
    cookies: jest.fn().mockResolvedValue([]),
    clearCookies: jest.fn(),
    browser: jest.fn(() => mockBrowser),
} as unknown as BrowserContext;

const mockBrowser = {
    version: jest.fn(() => 'x.y.z'),
} as unknown as Browser;


describe('PlaywrightPlugin', () => {
    let plugin: PlaywrightPlugin;
    let mockPluginAPI: PluginAPI;
    let mockBrowserManagerInstance: jest.Mocked<BrowserManager>;

    beforeEach(() => {
        // Reset mocks for BrowserManager constructor and methods
        (BrowserManager as jest.Mock).mockClear();


        mockPluginAPI = {
            getLogger: jest.fn(() => loggerClient.withPrefix('[test-api]')), // Use actual logger or a simpler mock
            getBrowserProxy: jest.fn(),
            setPluginExport: jest.fn(),
            getHttpClient: jest.fn(),
            getFSReader: jest.fn(),
            getTestWorker: jest.fn(),
            getTestRunController: jest.fn(),
            getHttpServer: jest.fn(),
            getFSStoreServer: jest.fn(),
            logger: loggerClient.withPrefix('[test-api]'), // direct logger
        };

        const config: PlaywrightPluginConfig = {
            browserType: 'chromium',
            headless: true,
        };

        plugin = new PlaywrightPlugin(mockPluginAPI, config);

        // Get the instance of the mocked BrowserManager
        // The constructor of PlaywrightPlugin creates an instance of BrowserManager.
        // We need to access this instance to mock its methods like getPage, newPage, kill, closeContext.
        // This assumes BrowserManager constructor is called once.
        expect(BrowserManager).toHaveBeenCalledTimes(1);
        mockBrowserManagerInstance = (BrowserManager as jest.Mock).mock.instances[0] as jest.Mocked<BrowserManager>;

        // Setup mock implementations for BrowserManager methods
        mockBrowserManagerInstance.getPage = jest.fn().mockResolvedValue(mockPage);
        mockBrowserManagerInstance.newPage = jest.fn().mockResolvedValue(mockPage);
        mockBrowserManagerInstance.kill = jest.fn().mockResolvedValue(undefined);
        mockBrowserManagerInstance.closeContext = jest.fn().mockResolvedValue(undefined);

        // Reset Playwright page mocks
        (mockPage.goto as jest.Mock).mockClear().mockResolvedValue(undefined);
        (mockPage.url as jest.Mock).mockClear().mockReturnValue('http://mock.url');
        (mockPage.reload as jest.Mock).mockClear().mockResolvedValue(undefined);
        (mockPage.click as jest.Mock).mockClear().mockResolvedValue(undefined);
        (mockPage.title as jest.Mock).mockClear().mockResolvedValue('Mock Title');
        (mockPage.on as jest.Mock).mockClear();
        (mockPage.once as jest.Mock).mockClear();


        // Reset context mocks
        (mockContext.addCookies as jest.Mock).mockClear().mockResolvedValue(undefined);
        (mockContext.cookies as jest.Mock).mockClear().mockResolvedValue([]);
        (mockContext.clearCookies as jest.Mock).mockClear().mockResolvedValue(undefined);
    });

    describe('Initialization', () => {
        it('should create a BrowserManager instance with the given config', () => {
            expect(BrowserManager).toHaveBeenCalledWith(
                expect.objectContaining({
                    browserType: 'chromium',
                    headless: true,
                }),
                expect.any(Object) // Logger instance
            );
        });
    });

    describe('Browser Lifecycle', () => {
        it('kill() should call browserManager.kill()', async () => {
            await plugin.kill();
            expect(mockBrowserManagerInstance.kill).toHaveBeenCalledTimes(1);
        });

        it('end() should call browserManager.closeContext() for the applicant', async () => {
            const applicant = 'testApplicant';
            await plugin.end(applicant);
            expect(mockBrowserManagerInstance.closeContext).toHaveBeenCalledWith(applicant);
        });
    });

    describe('Navigation', () => {
        const applicant = 'navApplicant';

        it('url(applicant, urlValue) should navigate the page', async () => {
            const urlValue = 'http://example.com';
            await plugin.url(applicant, urlValue);
            expect(mockBrowserManagerInstance.getPage).toHaveBeenCalledWith(applicant);
            expect(mockPage.goto).toHaveBeenCalledWith(urlValue);
        });

        it('url(applicant, "") should return the current URL', async () => {
            const currentUrl = await plugin.url(applicant, '');
            expect(mockBrowserManagerInstance.getPage).toHaveBeenCalledWith(applicant);
            expect(mockPage.url).toHaveBeenCalledTimes(1);
            expect(currentUrl).toBe('http://mock.url');
        });

        it('refresh(applicant) should reload the page', async () => {
            await plugin.refresh(applicant);
            expect(mockBrowserManagerInstance.getPage).toHaveBeenCalledWith(applicant);
            expect(mockPage.reload).toHaveBeenCalledTimes(1);
        });
    });

    describe('Interactions', () => {
        const applicant = 'interactionApplicant';
        const selector = '.my-button';

        it('click(applicant, selector) should click the element', async () => {
            await plugin.click(applicant, selector);
            expect(mockBrowserManagerInstance.getPage).toHaveBeenCalledWith(applicant);
            expect(mockPage.click).toHaveBeenCalledWith(selector, expect.any(Object));
        });

        it('click(applicant, selector, options) should pass mapped options', async () => {
            await plugin.click(applicant, selector, { button: 2 }); // Right click
            expect(mockPage.click).toHaveBeenCalledWith(selector, { button: 'right' });
        });
    });

    describe('Dialog Handling', () => {
        const applicant = 'dialogApplicant';

        it('getPage should setup a dialog listener on a new page', async () => {
            await plugin.getPage(applicant); // Call getPage to trigger listener setup
            expect(mockPage.on).toHaveBeenCalledWith('dialog', expect.any(Function));
        });

        it('alertAccept should setup a one-time dialog listener to accept', async () => {
            await plugin.alertAccept(applicant);
            expect(mockPage.once).toHaveBeenCalledWith('dialog', expect.any(Function));
            // Simulate dialog event
            const dialogHandler = (mockPage.once as jest.Mock).mock.calls[0][1];
            const mockDialog = { accept: jest.fn().mockResolvedValue(undefined), message: 'Test Dialog' };
            await dialogHandler(mockDialog);
            expect(mockDialog.accept).toHaveBeenCalled();
        });

        it('alertDismiss should setup a one-time dialog listener to dismiss', async () => {
            await plugin.alertDismiss(applicant);
            expect(mockPage.once).toHaveBeenCalledWith('dialog', expect.any(Function));
             // Simulate dialog event
            const dialogHandler = (mockPage.once as jest.Mock).mock.calls[0][1];
            const mockDialog = { dismiss: jest.fn().mockResolvedValue(undefined), message: 'Test Dialog' };
            await dialogHandler(mockDialog);
            expect(mockDialog.dismiss).toHaveBeenCalled();
        });

        // isAlertOpen and alertText are harder to test in isolation without controlling the dialogInfo state,
        // which is internal to PlaywrightPlugin. We could make dialogInfo protected for testing or add test methods.
        // For now, focusing on methods that set up listeners.
    });

    // TODO: Add more tests for other methods:
    // - Element interactions (getValue, setValue, getText, etc.)
    // - Cookie management (setCookie, getCookie, deleteCookie)
    // - Waits (waitForExist, waitForVisible, etc.)
    // - Screenshot
    // - Tricky ones like frame handling, uploadFile, execute/executeAsync, waitUntil
});

// Minimal mock for loggerClient if not using the actual one
// jest.mock('@testring/logger', () => ({
//     loggerClient: {
//         withPrefix: jest.fn(() => ({
//             info: jest.fn(),
//             warn: jest.fn(),
//             error: jest.fn(),
//             debug: jest.fn(),
//             verbose: jest.fn(),
//         })),
//     },
// }));
