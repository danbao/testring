import { LoggerClient } from '@testring/logger';
import { PlaywrightPluginConfig } from './index'; // Assuming this is the correct path
import playwright, { Browser, BrowserContext, Page } from 'playwright';

export class BrowserManager {
    private browser: Browser | null = null;
    private contexts: Map<string, BrowserContext> = new Map();
    private pages: Map<string, Page> = new Map();
    private config: PlaywrightPluginConfig;
    private logger: LoggerClient;

    constructor(config: PlaywrightPluginConfig, logger: LoggerClient) {
        this.config = config;
        this.logger = logger;
    }

    private async launchBrowser(): Promise<Browser> {
        if (!this.browser) {
            this.logger.info(`Launching ${this.config.browserType} browser...`);
            const browserType = this.config.browserType || 'chromium';
            this.browser = await playwright[browserType].launch({
                headless: this.config.headless,
            });
            this.logger.info('Browser launched successfully.');
        }
        return this.browser;
    }

    public async getPage(applicant: string): Promise<Page> {
        if (this.pages.has(applicant)) {
            return this.pages.get(applicant) as Page;
        }

        await this.launchBrowser();
        if (!this.browser) {
            throw new Error('Browser could not be launched.');
        }

        this.logger.info(`Creating new browser context and page for applicant: ${applicant}`);
        const context = await this.browser.newContext();
        const page = await context.newPage();
        await this.setupDialogListenerForPage(page, applicant); // Added dialog listener setup

        this.contexts.set(applicant, context);
        this.pages.set(applicant, page);

        this.logger.info(`Page created for applicant: ${applicant}`);
        return page;
    }

    public async newPage(applicant: string, windowFeatures?: any): Promise<Page> {
        await this.launchBrowser();
        if (!this.browser) {
            throw new Error('Browser could not be launched.');
        }

        // Close existing context for this applicant if it exists, to ensure a fresh start
        if (this.contexts.has(applicant)) {
            this.logger.warn(`Applicant ${applicant} already has a page. Closing existing context before creating a new one.`);
            await this.closeContext(applicant, false); // Don't close browser if other contexts exist
        }

        this.logger.info(`Creating new browser context and page for applicant: ${applicant} with features: ${JSON.stringify(windowFeatures)}`);
        // TODO: Map windowFeatures to Playwright's context options (e.g., viewport, userAgent)
        const contextOptions: playwright.BrowserContextOptions = {};
        if (windowFeatures) {
            if (windowFeatures.width && windowFeatures.height) {
                contextOptions.viewport = { width: windowFeatures.width, height: windowFeatures.height };
            }
            // Add more mappings as needed
        }

        const context = await this.browser.newContext(contextOptions);
        const page = await context.newPage();

        this.contexts.set(applicant, context);
        this.pages.set(applicant, page);

        this.logger.info(`New page created for applicant: ${applicant}`);
        return page;
    }

    public async closeContext(applicant: string, closeBrowserIfLast?: boolean): Promise<void> {
        // `closeBrowserIfLast` defaults to true if not provided
        const shouldCloseBrowser = closeBrowserIfLast === undefined ? true : closeBrowserIfLast;

        if (this.contexts.has(applicant)) {
            this.logger.info(`Closing browser context for applicant: ${applicant}`);
            const context = this.contexts.get(applicant);
            await context?.close();
            this.contexts.delete(applicant);
            this.pages.delete(applicant); // Also remove page association
            this.logger.info(`Browser context closed for applicant: ${applicant}`);
        }

        if (this.contexts.size === 0 && this.browser) {
            this.logger.info('All contexts closed. Closing the browser.');
            await this.browser.close();
            this.browser = null;
        }
    }

    public async kill(): Promise<void> {
        this.logger.info('Kill called. Closing all contexts and the browser.');
        for (const applicant of this.contexts.keys()) {
            await this.closeContext(applicant);
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
        this.contexts.clear();
        this.pages.clear();
        this.logger.info('All resources released.');
    }
}
