import { PlaywrightPluginConfig, BrowserClientItem } from '../types';
import {
    IBrowserProxyPlugin,
    WindowFeaturesConfig
} from '@testring/types';

import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright';
import { loggerClient } from '@testring/logger';

const DEFAULT_CONFIG: PlaywrightPluginConfig = {
    browserName: 'chromium',
    launchOptions: {
        headless: true,
        args: []
    },
    contextOptions: {},
    clientCheckInterval: 5 * 1000,
    clientTimeout: 15 * 60 * 1000,
    disableClientPing: false,
    coverage: false,
    video: false,
    trace: false,
};

function delay(timeout: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(() => resolve(), timeout));
}

// function stringifyWindowFeatures(windowFeatures: WindowFeaturesConfig): string {
//     if (typeof windowFeatures === 'string') {
//         return windowFeatures;
//     }
//     const features = windowFeatures as IWindowFeatures;
//     return Object.keys(features)
//         .map((key) => `${key}=${features[key as keyof IWindowFeatures]}`)
//         .join(',');
// }

export class PlaywrightPlugin implements IBrowserProxyPlugin {
    private logger = loggerClient.withPrefix('[playwright-browser-process]');
    private clientCheckInterval: NodeJS.Timeout | undefined;
    private expiredBrowserClients: Set<string> = new Set();
    private browserClients: Map<string, BrowserClientItem> = new Map();
    private config: PlaywrightPluginConfig;
    private browser: Browser | undefined;
    private incrementWinId = 0;

    constructor(config: Partial<PlaywrightPluginConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.initIntervals();
    }

    private initIntervals() {
        if (this.config.workerLimit !== 'local' && !this.config.disableClientPing) {
            if (this.config.clientCheckInterval && this.config.clientCheckInterval > 0) {
                this.clientCheckInterval = setInterval(
                    () => this.checkClientsTimeout(),
                    this.config.clientCheckInterval,
                );
            }

            process.on('exit', () => {
                if (this.clientCheckInterval) {
                    clearInterval(this.clientCheckInterval);
                }
                this.stopAllSessions().catch((err) => {
                    this.logger.error('Clean process exit failed', err);
                });
            });
        }
    }

    private async getBrowser(): Promise<Browser> {
        if (this.browser) {
            return this.browser;
        }

        const browserName = this.config.browserName || 'chromium';
        const launchOptions = this.config.launchOptions || {};

        switch (browserName) {
            case 'chromium':
                this.browser = await chromium.launch(launchOptions);
                break;
            case 'firefox':
                this.browser = await firefox.launch(launchOptions);
                break;
            case 'webkit':
                this.browser = await webkit.launch(launchOptions);
                break;
            default:
                throw new Error(`Unsupported browser: ${browserName}`);
        }

        return this.browser;
    }

    private async createClient(applicant: string): Promise<void> {
        const clientData = this.browserClients.get(applicant);

        if (clientData) {
            this.browserClients.set(applicant, {
                ...clientData,
                initTime: Date.now(),
            });
            return;
        }

        if (this.expiredBrowserClients.has(applicant)) {
            throw new Error(`This session expired in ${this.config.clientTimeout}ms`);
        }

        const browser = await this.getBrowser();
        const contextOptions = { ...this.config.contextOptions };
        
        if (this.config.video) {
            contextOptions.recordVideo = {
                dir: this.config.videoDir || './test-results/videos',
            };
        }

        const context = await browser.newContext(contextOptions);
        
        if (this.config.trace) {
            await context.tracing.start({ screenshots: true, snapshots: true });
        }

        const page = await context.newPage();
        
        let coverage = null;
        if (this.config.coverage) {
            await page.coverage.startJSCoverage();
            await page.coverage.startCSSCoverage();
            coverage = page.coverage;
        }

        this.browserClients.set(applicant, {
            context,
            page,
            initTime: Date.now(),
            coverage,
        });

        this.logger.debug(`Started session for applicant: ${applicant}`);
    }

    private getBrowserClient(applicant: string): { context: BrowserContext; page: Page } {
        const item = this.browserClients.get(applicant);
        if (!item) {
            throw new Error('Browser client is not found');
        }
        return { context: item.context, page: item.page };
    }

    private hasBrowserClient(applicant: string): boolean {
        return this.browserClients.has(applicant);
    }

    private async stopAllSessions(): Promise<void> {
        const clientsRequests: Promise<any>[] = [];

        for (const [applicant] of this.browserClients) {
            this.logger.debug(`Stopping sessions before process exit for applicant ${applicant}.`);
            clientsRequests.push(
                this.end(applicant).catch((err) => {
                    this.logger.error(`Session stop before process exit error for applicant ${applicant}:`, err);
                }),
            );
        }

        await Promise.all(clientsRequests);
    }

    private async checkClientsTimeout(): Promise<void> {
        if (this.config.clientTimeout === 0) {
            await this.pingClients();
        } else {
            await this.closeExpiredClients();
        }
    }

    private async pingClients(): Promise<void> {
        for (const [applicant] of this.browserClients) {
            try {
                await this.execute(applicant, '(function () {})()', []);
            } catch (e) {
                // ignore
            }
        }
    }

    private async closeExpiredClients(): Promise<void> {
        const timeLimit = Date.now() - (this.config.clientTimeout || DEFAULT_CONFIG.clientTimeout!);

        for (const [applicant, clientData] of this.browserClients) {
            if (clientData.initTime < timeLimit) {
                this.logger.warn(`Session applicant ${applicant} marked as expired`);
                try {
                    await this.end(applicant);
                } catch (e) {
                    this.logger.error(`Session applicant ${applicant} failed to stop`, e);
                }
                this.expiredBrowserClients.add(applicant);
            }
        }
    }

    // IBrowserProxyPlugin implementation
    public async end(applicant: string): Promise<void> {
        if (!this.hasBrowserClient(applicant)) {
            this.logger.warn(`No ${applicant} is registered`);
            return;
        }

        const { context } = this.getBrowserClient(applicant);
        const clientData = this.browserClients.get(applicant);

        try {
            if (this.config.trace && clientData) {
                await context.tracing.stop({
                    path: `${this.config.traceDir || './test-results/traces'}/${applicant}-trace.zip`,
                });
            }

            if (this.config.coverage && clientData?.coverage) {
                await clientData.coverage.stopJSCoverage();
                await clientData.coverage.stopCSSCoverage();
            }

            await context.close();
            this.logger.debug(`Stopped session for applicant ${applicant}`);
        } catch (err) {
            this.logger.error(`Error stopping session for applicant ${applicant}:`, err);
        }

        if (this.config.delayAfterSessionClose) {
            await delay(this.config.delayAfterSessionClose);
        }

        this.browserClients.delete(applicant);
    }

    public async kill(): Promise<void> {
        this.logger.debug('Kill command is called');

        for (const applicant of this.browserClients.keys()) {
            try {
                await this.end(applicant);
            } catch (e) {
                this.logger.error(e);
            }
        }

        if (this.browser) {
            await this.browser.close();
            this.browser = undefined;
        }

        if (this.clientCheckInterval) {
            clearInterval(this.clientCheckInterval);
        }
    }

    public async refresh(applicant: string): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.reload();
    }

    public async url(applicant: string, val: string): Promise<string> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);

        if (!val) {
            return page.url();
        }

        await page.goto(val);
        return page.url();
    }

    public async click(applicant: string, selector: string, options?: any): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.click(selector, options);
    }

    public async newWindow(applicant: string, url: string, _windowName: string, _windowFeatures: WindowFeaturesConfig): Promise<any> {
        await this.createClient(applicant);
        const { context } = this.getBrowserClient(applicant);
        const page = await context.newPage();
        if (url) {
            await page.goto(url);
        }
        return page;
    }

    public async waitForExist(applicant: string, selector: string, timeout: number): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.waitForSelector(selector, { timeout });
    }

    public async waitForVisible(applicant: string, selector: string, timeout: number): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.waitForSelector(selector, { state: 'visible', timeout });
    }

    public async isVisible(applicant: string, selector: string): Promise<boolean> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        const element = await page.$(selector);
        return element ? await element.isVisible() : false;
    }

    public async moveToObject(applicant: string, selector: string, _x: number, _y: number): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.hover(selector);
    }

    public async execute(applicant: string, fn: any, args: any[]): Promise<any> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.evaluate(fn, ...args);
    }

    public async executeAsync(applicant: string, fn: any, args: any[]): Promise<any> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.evaluate(fn, ...args);
    }

    public async frame(applicant: string, frameID: any): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        const frame = frameID ? page.frame(frameID) : page.mainFrame();
        if (!frame) {
            throw new Error(`Frame ${frameID} not found`);
        }
    }

    public async frameParent(applicant: string): Promise<void> {
        await this.createClient(applicant);
        // Playwright automatically handles frame context
    }

    public async getTitle(applicant: string): Promise<string> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.title();
    }

    public async clearValue(applicant: string, selector: string): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.fill(selector, '');
    }

    public async keys(applicant: string, value: any): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.keyboard.type(value);
    }

    public async elementIdText(applicant: string, elementId: string): Promise<string> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        const element = await page.locator(`[data-testid="${elementId}"]`);
        return await element.textContent() || '';
    }

    public async elements(applicant: string, selector: string): Promise<any[]> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        const elements = await page.$$(selector);
        return elements.map((_, index) => ({ ELEMENT: `element-${index}` }));
    }

    public async getValue(applicant: string, selector: string): Promise<string> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.inputValue(selector);
    }

    public async setValue(applicant: string, selector: string, value: any): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.fill(selector, value);
    }

    public async selectByIndex(applicant: string, selector: string, index: number): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.selectOption(selector, { index });
    }

    public async selectByValue(applicant: string, selector: string, value: any): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.selectOption(selector, { value });
    }

    public async selectByVisibleText(applicant: string, selector: string, text: string): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.selectOption(selector, { label: text });
    }

    public async getAttribute(applicant: string, selector: string, attr: string): Promise<string | null> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.getAttribute(selector, attr);
    }

    public async windowHandleMaximize(applicant: string): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.setViewportSize({ width: 1920, height: 1080 });
    }

    public async isEnabled(applicant: string, selector: string): Promise<boolean> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.isEnabled(selector);
    }

    public async scroll(applicant: string, selector: string, _x: number, _y: number): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.locator(selector).scrollIntoViewIfNeeded();
    }

    public async scrollIntoView(applicant: string, selector: string, _options?: boolean): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.locator(selector).scrollIntoViewIfNeeded();
    }

    public async isAlertOpen(_applicant: string): Promise<boolean> {
        // Playwright handles alerts automatically, so we return false
        return false;
    }

    public async alertAccept(_applicant: string): Promise<void> {
        // Playwright handles alerts automatically
    }

    public async alertDismiss(_applicant: string): Promise<void> {
        // Playwright handles alerts automatically
    }

    public async alertText(_applicant: string): Promise<string> {
        // Playwright handles alerts automatically
        return '';
    }

    public async dragAndDrop(applicant: string, sourceSelector: string, targetSelector: string): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.dragAndDrop(sourceSelector, targetSelector);
    }

    public async setCookie(applicant: string, cookie: any): Promise<void> {
        await this.createClient(applicant);
        const { context } = this.getBrowserClient(applicant);
        await context.addCookies([cookie]);
    }

    public async getCookie(applicant: string, cookieName: string): Promise<any> {
        await this.createClient(applicant);
        const { context } = this.getBrowserClient(applicant);
        const cookies = await context.cookies();
        return cookies.find(cookie => cookie.name === cookieName);
    }

    public async deleteCookie(applicant: string, _cookieName: string): Promise<void> {
        await this.createClient(applicant);
        const { context } = this.getBrowserClient(applicant);
        await context.clearCookies();
    }

    public async getHTML(applicant: string, selector: string, outerHTML: boolean): Promise<string> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        const element = await page.$(selector);
        if (!element) return '';
        return outerHTML ? await element.innerHTML() : await element.innerHTML();
    }

    public async getSize(applicant: string, selector: string): Promise<{ width: number; height: number } | null> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        const element = await page.$(selector);
        if (!element) return null;
        return await element.boundingBox();
    }

    public async getCurrentTabId(applicant: string): Promise<string> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return page.url();
    }

    public async switchTab(applicant: string, tabId: string): Promise<void> {
        await this.createClient(applicant);
        const { context } = this.getBrowserClient(applicant);
        const pages = context.pages();
        const targetPage = pages.find(p => p.url() === tabId);
        if (targetPage) {
            await targetPage.bringToFront();
        }
    }

    public async close(applicant: string, tabId: string): Promise<void> {
        await this.createClient(applicant);
        const { context } = this.getBrowserClient(applicant);
        const pages = context.pages();
        const targetPage = pages.find(p => p.url() === tabId);
        if (targetPage) {
            await targetPage.close();
        }
    }

    public async getTabIds(applicant: string): Promise<string[]> {
        await this.createClient(applicant);
        const { context } = this.getBrowserClient(applicant);
        const pages = context.pages();
        return pages.map(p => p.url());
    }

    public async window(applicant: string, tabId: string): Promise<void> {
        await this.switchTab(applicant, tabId);
    }

    public async windowHandles(applicant: string): Promise<string[]> {
        return await this.getTabIds(applicant);
    }

    public async getTagName(applicant: string, selector: string): Promise<string> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.evaluate(selector => {
            const element = document.querySelector(selector);
            return element ? element.tagName.toLowerCase() : '';
        }, selector);
    }

    public async isSelected(applicant: string, selector: string): Promise<boolean> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.isChecked(selector);
    }

    public async getText(applicant: string, selector: string): Promise<string> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.textContent(selector) || '';
    }

    public async elementIdSelected(applicant: string, elementId: string): Promise<boolean> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.isChecked(`[data-testid="${elementId}"]`);
    }

    public async makeScreenshot(applicant: string): Promise<string> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        const screenshot = await page.screenshot();
        return screenshot.toString('base64');
    }

    public async uploadFile(applicant: string, filePath: string): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        const fileChooser = await page.waitForEvent('filechooser');
        await fileChooser.setFiles(filePath);
    }

    public async getCssProperty(applicant: string, selector: string, cssProperty: string): Promise<string> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.evaluate(({ selector, cssProperty }) => {
            const element = document.querySelector(selector);
            if (!element) return '';
            return window.getComputedStyle(element).getPropertyValue(cssProperty);
        }, { selector, cssProperty });
    }

    public async getSource(applicant: string): Promise<string> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        return await page.content();
    }

    public async isExisting(applicant: string, selector: string): Promise<boolean> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        const element = await page.$(selector);
        return element !== null;
    }

    public async waitForValue(applicant: string, selector: string, timeout: number, reverse: boolean): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.waitForFunction(
            ({ selector, reverse }) => {
                const element = document.querySelector(selector) as HTMLInputElement;
                const hasValue = element && element.value !== '';
                return reverse ? !hasValue : hasValue;
            },
            { selector, reverse },
            { timeout }
        );
    }

    public async waitForSelected(applicant: string, selector: string, timeout: number, reverse: boolean): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.waitForFunction(
            ({ selector, reverse }) => {
                const element = document.querySelector(selector) as HTMLInputElement;
                const isSelected = element && element.checked;
                return reverse ? !isSelected : isSelected;
            },
            { selector, reverse },
            { timeout }
        );
    }

    public async waitUntil(applicant: string, condition: () => boolean | Promise<boolean>, timeout?: number, _timeoutMsg?: string, _interval?: number): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.waitForFunction(condition, {}, { timeout: timeout || 5000 });
    }

    public async selectByAttribute(applicant: string, selector: string, _attribute: string, value: string): Promise<void> {
        await this.createClient(applicant);
        const { page } = this.getBrowserClient(applicant);
        await page.selectOption(selector, { value });
    }

    public async gridTestSession(applicant: string): Promise<any> {
        await this.createClient(applicant);
        return {
            sessionId: applicant,
            localPlaywright: true,
        };
    }

    public async getHubConfig(applicant: string): Promise<any> {
        await this.createClient(applicant);
        return {
            sessionId: applicant,
            localPlaywright: true,
        };
    }

    generateWinId(): string {
        this.incrementWinId++;
        return `window-${this.incrementWinId}`;
    }
}

export default function playwrightProxy(config: PlaywrightPluginConfig) {
    return new PlaywrightPlugin(config);
}