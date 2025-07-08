import {
    IBrowserProxyPlugin,
    WindowFeaturesConfig,
} from '@testring/types';
import { loggerClient, LoggerClient } from '@testring/logger';
import { Page } from 'playwright';
import { BrowserManager } from './browser-manager';
import { PlaywrightPluginConfig } from './index'; // Import the actual config type

export class PlaywrightPlugin implements IBrowserProxyPlugin {
    private logger: LoggerClient;
    private config: PlaywrightPluginConfig; // Use the actual config type
    private browserManager: BrowserManager;
    private activePages: Map<string, Page> = new Map();
    private dialogInfo: { [applicant: string]: { message: string; type: string } | null } = {};

    constructor(config: PlaywrightPluginConfig) { // Use the actual config type
        this.config = {
            browserType: 'chromium',
            headless: true,
            ...config,
        };
        this.logger = loggerClient.withPrefix('[playwright-driver]');
        this.logger.info('PlaywrightPlugin instance created with config:', this.config);
        this.browserManager = new BrowserManager(this.config, this.logger);
    }

    private async getPage(applicant: string): Promise<Page> {
        if (this.activePages.has(applicant)) {
            const existingPage = this.activePages.get(applicant) as Page;
            if (!existingPage.isClosed()) {
                return existingPage;
            }
            this.logger.info(`Page for applicant ${applicant} was closed. Requesting a new one.`);
        }
        const page = await this.browserManager.getPage(applicant);
        if (!this.activePages.has(applicant) || this.activePages.get(applicant)?.isClosed() || this.activePages.get(applicant) !== page) {
            await this.setupDialogListener(page, applicant);
            this.activePages.set(applicant, page);
        }
        return page;
    }

    private async getNewPage(applicant: string, windowFeatures?:any): Promise<Page> {
        const page = await this.browserManager.newPage(applicant, windowFeatures);
        this.activePages.set(applicant, page);
        await this.setupDialogListener(page, applicant);
        return page;
    }

    private async setupDialogListener(page: Page, applicant: string) {
        page.on('dialog', async (dialog) => {
            this.logger.info(`EVENT: Dialog opened for applicant ${applicant}: type=${dialog.type()}, message=${dialog.message()}`);
            this.dialogInfo[applicant] = { message: dialog.message(), type: dialog.type() };
        });
    }

    async kill(): Promise<void> {
        this.logger.info('Kill command received. Closing all browser contexts and the browser.');
        await this.browserManager.kill();
        this.activePages.clear();
        this.dialogInfo = {};
    }

    async end(applicant: string): Promise<any> {
        this.logger.info(`End command received for applicant: ${applicant}. Closing browser context.`);
        await this.browserManager.closeContext(applicant);
        this.activePages.delete(applicant);
        delete this.dialogInfo[applicant];
    }

    async refresh(applicant: string): Promise<any> {
        this.logger.debug(`Refresh command received for applicant: ${applicant}`);
        const page = await this.getPage(applicant);
        return page.reload();
    }

    async click(applicant: string, selector: string, options?: any): Promise<any> {
        this.logger.debug(`Click command received for applicant: ${applicant}, selector: ${selector}, options: ${JSON.stringify(options)}`);
        const page = await this.getPage(applicant);
        const playwrightOptions: { button?: 'left' | 'right' | 'middle'; clickCount?: number; delay?: number; position?: { x: number; y: number }; modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>; force?: boolean; noWaitAfter?: boolean; timeout?: number; trial?: boolean; } = {};
        if (options) {
            if (options.button === 0) playwrightOptions.button = 'left';
            else if (options.button === 1) playwrightOptions.button = 'middle';
            else if (options.button === 2) playwrightOptions.button = 'right';
            if (options.x && options.y) {
                this.logger.warn('WebdriverIO x/y click offsets are not directly mapped to Playwright position. Click will be at center.');
            }
        }
        return page.click(selector, playwrightOptions);
    }

    async url(applicant: string, val: string): Promise<any> {
        this.logger.debug(`URL command received for applicant: ${applicant}, value: ${val}`);
        const page = await this.getPage(applicant);
        if (val === undefined || val === null || val === '') {
            return page.url();
        }
        return page.goto(val);
    }

    async newWindow(
        applicant: string,
        url: string,
        windowName: string,
        windowFeatures: WindowFeaturesConfig,
    ): Promise<any> {
        this.logger.debug(`NewWindow command for applicant: ${applicant}, URL: ${url}, Name: ${windowName}, Features: ${JSON.stringify(windowFeatures)}`);
        const newPage = await this.getNewPage(applicant, windowFeatures);
        await newPage.goto(url);
        return (newPage as any).guid;
    }

    async waitForExist(
        applicant: string,
        selector: string,
        timeout: number,
    ): Promise<any> {
        this.logger.debug(`WaitForExist command for applicant: ${applicant}, selector: ${selector}, timeout: ${timeout}`);
        const page = await this.getPage(applicant);
        return page.waitForSelector(selector, { state: 'attached', timeout });
    }

    async waitForVisible(
        applicant: string,
        selector: string,
        timeout: number,
    ): Promise<any> {
        this.logger.debug(`WaitForVisible command for applicant: ${applicant}, selector: ${selector}, timeout: ${timeout}`);
        const page = await this.getPage(applicant);
        return page.waitForSelector(selector, { state: 'visible', timeout });
    }

    async isVisible(applicant: string, selector: string): Promise<boolean> {
        this.logger.debug(`IsVisible command for applicant: ${applicant}, selector: ${selector}`);
        const page = await this.getPage(applicant);
        return page.isVisible(selector);
    }

    async moveToObject(
        applicant: string,
        selector: string,
        x: number,
        y: number,
    ): Promise<any> {
        this.logger.debug(`MoveToObject command for applicant: ${applicant}, selector: ${selector}, x: ${x}, y: ${y}`);
        const page = await this.getPage(applicant);
        await page.hover(selector, { position: { x, y } });
        return Promise.resolve();
    }

    async execute(applicant: string, script: string | ((...args: any[]) => any), args: Array<any>): Promise<any> {
        this.logger.debug(`Execute command for applicant: ${applicant}, script: ${script.toString()}, args: ${JSON.stringify(args)}`);
        const page = await this.getPage(applicant);
        return page.evaluate(script, args);
    }

    async executeAsync(applicant: string, script: string | ((...args: any[]) => any), args: Array<any>): Promise<any> {
        this.logger.debug(`ExecuteAsync command for applicant: ${applicant}, script: ${script.toString()}, args: ${JSON.stringify(args)}`);
        const page = await this.getPage(applicant);
        return page.evaluate(script, args);
    }

    /**
     * Switches focus to a frame identified by a selector or ID.
     * IMPORTANT: Unlike WebdriverIO, Playwright's frame interactions are typically done via `page.frameLocator()`,
     * which returns a locator that can then be used to interact with elements within the frame.
     * This method attempts to find a frame but does NOT change the global command context to that frame
     * for subsequent actions in the same way WebdriverIO does. Tests relying on stateful frame switching
     * will likely need significant adaptation.
     *
     * @param applicant The applicant identifier.
     * @param frameSelectorOrId A selector string for the frame, or its name/ID. If null, attempts to switch to the main frame.
     * @returns A Promise that resolves if the frame is found, otherwise rejects.
     */
    async frame(applicant: string, frameSelectorOrId: string | null): Promise<any> {
        this.logger.debug(`Frame command for applicant: ${applicant}, frameSelectorOrId: ${frameSelectorOrId}`);
        const page = await this.getPage(applicant);
        if (frameSelectorOrId === null) {
            this.logger.info('Switching to main frame (default page context). In Playwright, subsequent commands on the Page object are already in the main frame.');
            // No actual "switch" is needed if current context is already the page.
            // If a frame was previously "active" conceptually, this would reset that idea.
            return Promise.resolve();
        }
        // Attempt to find the frame. Playwright's page.frame() can find by name or URL.
        // For selector-based finding, page.frameLocator(selector) is common, but that returns a FrameLocator, not a Frame to switch to.
        const frame = page.frame(frameSelectorOrId); // This looks up by name or id attribute
        if (frame) {
            this.logger.warn("Found frame. However, Playwright's model doesn't involve 'switching' the global context to this frame for subsequent commands like WebdriverIO. Interactions with this frame should ideally use `page.frameLocator()` or operate on the returned Frame object if the plugin's architecture supported it.");
            // This plugin currently doesn't store the 'current frame' to redirect subsequent commands.
            // Returning the frame object itself might be an option if Testring core could use it, but it's not per IBrowserProxyPlugin.
            return Promise.resolve(); // Placeholder: Acknowledges frame found, but context not globally switched.
        }
        // Try with frameLocator as a common way to identify frames, though we can't "switch" to it.
        const frameLocator = page.frameLocator(frameSelectorOrId);
        if (await frameLocator.count() > 0) {
             this.logger.warn(`Frame found using frameLocator("${frameSelectorOrId}"). Note: Context is not globally switched. Use frame-specific locators for interactions.`);
             return Promise.resolve();
        }
        throw new Error(`Frame with selector/ID/name "${frameSelectorOrId}" not found.`);
    }

    /**
     * Switches focus to the parent frame of the currently focused frame.
     * IMPORTANT: This command has limitations similar to `frame()`. It assumes a conceptual "current frame"
     * which is not robustly managed by this plugin in a way that mirrors WebdriverIO's stateful parent switching.
     * If the current context is the main page, this is a no-op.
     *
     * @param applicant The applicant identifier.
     * @returns A Promise that resolves.
     */
    async frameParent(applicant: string): Promise<any> {
        this.logger.debug(`FrameParent command for applicant: ${applicant}`);
        await this.getPage(applicant); // Ensures page exists
        this.logger.warn('FrameParent requires robust tracking of current frame context, which is not fully implemented. If not in a sub-frame, this is a no-op.');
        // If we were tracking the current frame (e.g., this.currentFramePerApplicant.get(applicant)):
        // const currentFrame = this.currentFramePerApplicant.get(applicant);
        // if (currentFrame && currentFrame.parentFrame()) {
        //   this.currentFramePerApplicant.set(applicant, currentFrame.parentFrame());
        // } else {
        //   this.currentFramePerApplicant.delete(applicant); // Switched to main page
        // }
        return Promise.resolve();
    }

    async getTitle(applicant: string): Promise<string> {
        this.logger.debug(`GetTitle command for applicant: ${applicant}`);
        const page = await this.getPage(applicant);
        return page.title();
    }

    async clearValue(applicant: string, selector: string): Promise<void> {
        this.logger.debug(`ClearValue command for applicant: ${applicant}, selector: ${selector}`);
        const page = await this.getPage(applicant);
        await page.fill(selector, '');
    }

    async keys(applicant: string, value: string | string[]): Promise<void> {
        this.logger.debug(`Keys command for applicant: ${applicant}, value: ${JSON.stringify(value)}`);
        const page = await this.getPage(applicant);
        if (Array.isArray(value)) {
            for (const key of value) {
                await page.keyboard.press(key);
            }
        } else {
            await page.keyboard.press(value);
            this.logger.warn("Playwright's `keys` handling is different from WebdriverIO. Complex sequences or specific WebDriver protocol key codes may not map directly. Consider using Playwright's `page.keyboard.press('Control+A')` style for combinations.");
        }
    }

    /**
     * @deprecated Due to differences in Playwright's element handling, this method assumes `selectorOrElementId` is a selector string.
     * It does not support WebdriverIO's element ID protocol for fetching text.
     * Consider using `getText(selector)` instead for better Playwright compatibility.
     *
     * Retrieves the text content of an element identified by a selector.
     * @param applicant The applicant identifier.
     * @param selectorOrElementId Assumed to be a selector string.
     * @returns The text content of the element, or null if not found.
     */
    async elementIdText(applicant: string, selectorOrElementId: string): Promise<string | null> {
        this.logger.debug(`ElementIdText command for applicant: ${applicant}, selectorOrElementId: ${selectorOrElementId}`);
        this.logger.warn("`elementIdText` in Playwright context assumes the 'elementId' (first arg) is a selector. True element ID chaining like WebdriverIO is not directly supported by this mapping. Consider using `getText(selector)`.");
        const page = await this.getPage(applicant);
        return page.textContent(selectorOrElementId);
    }

    /**
     * Finds multiple elements on the page matching the selector.
     * IMPORTANT: The returned "ELEMENT" IDs are pseudo-IDs specific to this plugin's instance for structural compatibility
     * and are NOT directly usable with Playwright's native API or guaranteed to work with other low-level
     * `elementId*` commands in this plugin due to Playwright's stateless element interaction model.
     * Tests should prefer using selectors with high-level commands (e.g., `getText`, `click`) over relying on these pseudo-IDs.
     *
     * @param applicant The applicant identifier.
     * @param selector The selector string to find elements.
     * @returns An array of objects, each mimicking WebdriverIO's element structure with a pseudo 'ELEMENT' ID.
     */
    async elements(applicant: string, selector: string): Promise<Array<{ ELEMENT: string, [key: string]: string }>> {
        this.logger.debug(`Elements command for applicant: ${applicant}, selector: ${selector}`);
        const page = await this.getPage(applicant);
        const elements = await page.$$(selector);
        this.logger.warn("Mapping Playwright ElementHandles to WebdriverIO's `ELEMENT` ID format is problematic for subsequent low-level commands. Tests should ideally use selectors with high-level commands.");
        return elements.map((el, index) => {
            const pseudoId = `playwright-element-${index}-${Math.random().toString(36).substring(7)}`;
            return { ELEMENT: pseudoId, "element-6066-11e4-a52e-4f735466cecf": pseudoId };
        });
    }

    async getValue(applicant: string, selector: string): Promise<string | null> {
        this.logger.debug(`GetValue command for applicant: ${applicant}, selector: ${selector}`);
        const page = await this.getPage(applicant);
        return page.inputValue(selector);
    }

    async setValue(applicant: string, selector: string, value: any): Promise<void> {
        this.logger.debug(`SetValue command for applicant: ${applicant}, selector: ${selector}, value: ${value}`);
        const page = await this.getPage(applicant);
        await page.fill(selector, String(value));
    }

    async selectByIndex(applicant: string, selector: string, index: number): Promise<void> {
        this.logger.debug(`SelectByIndex command for applicant: ${applicant}, selector: ${selector}, index: ${index}`);
        const page = await this.getPage(applicant);
        await page.selectOption(selector, { index });
    }

    async selectByValue(applicant: string, selector: string, value: string): Promise<void> {
        this.logger.debug(`SelectByValue command for applicant: ${applicant}, selector: ${selector}, value: ${value}`);
        const page = await this.getPage(applicant);
        await page.selectOption(selector, { value });
    }

    async selectByVisibleText(
        applicant: string,
        selector: string,
        text: string,
    ): Promise<void> {
        this.logger.debug(`SelectByVisibleText command for applicant: ${applicant}, selector: ${selector}, text: ${text}`);
        const page = await this.getPage(applicant);
        await page.selectOption(selector, { label: text });
    }

    async getAttribute(applicant: string, selector: string, attributeName: string): Promise<string | null> {
        this.logger.debug(`GetAttribute command for applicant: ${applicant}, selector: ${selector}, attribute: ${attributeName}`);
        const page = await this.getPage(applicant);
        return page.getAttribute(selector, attributeName);
    }

    async windowHandleMaximize(applicant: string): Promise<void> {
        this.logger.debug(`WindowHandleMaximize command for applicant: ${applicant}`);
        const page = await this.getPage(applicant);
        this.logger.warn("Playwright doesn't directly support maximizing a window. This command will attempt to set a large viewport, which might not be equivalent to user-initiated maximize. Consider configuring viewport size at browser launch.");
        await page.setViewportSize({ width: 1920, height: 1080 });
    }

    async isEnabled(applicant: string, selector: string): Promise<boolean> {
        this.logger.debug(`IsEnabled command for applicant: ${applicant}, selector: ${selector}`);
        const page = await this.getPage(applicant);
        return page.isEnabled(selector);
    }

    async scroll(
        applicant: string,
        selector: string,
        x: number,
        y: number,
    ): Promise<any> {
        this.logger.debug(`Scroll command for applicant: ${applicant}, selector: ${selector}, x: ${x}, y: ${y}`);
        const page = await this.getPage(applicant);
        const element = await page.$(selector);
        if (element) {
            await element.evaluate((node, { x, y }) => {
                node.scrollLeft += x;
                node.scrollTop += y;
            }, { x, y });
            return Promise.resolve();
        }
        throw new Error(`Element with selector "${selector}" not found for scroll.`);
    }

    async scrollIntoView(
        applicant: string,
        selector: string,
        scrollIntoViewOptions?: boolean | { block?: 'start' | 'center' | 'end' | 'nearest', inline?: 'start' | 'center' | 'end' | 'nearest' },
    ): Promise<any> {
        this.logger.debug(`ScrollIntoView command for applicant: ${applicant}, selector: ${selector}, options: ${JSON.stringify(scrollIntoViewOptions)}`);
        const page = await this.getPage(applicant);
        const element = await page.$(selector);
        if (element) {
            if (typeof scrollIntoViewOptions === 'boolean') {
                await element.scrollIntoViewIfNeeded();
            } else if (typeof scrollIntoViewOptions === 'object') {
                await element.scrollIntoViewIfNeeded();
                this.logger.warn("Complex scrollIntoView options (block/inline) are not directly mapped. Using Playwright's default scrollIntoViewIfNeeded behavior.");
            } else {
                await element.scrollIntoViewIfNeeded();
            }
            return Promise.resolve();
        }
        throw new Error(`Element with selector "${selector}" not found for scrollIntoView.`);
    }

    async isAlertOpen(applicant: string): Promise<boolean> {
        this.logger.debug(`IsAlertOpen command for applicant: ${applicant}`);
        const isOpen = !!this.dialogInfo[applicant];
        this.logger.info(`IsAlertOpen check: ${isOpen} based on captured dialog info.`);
        return isOpen;
    }

    async alertAccept(applicant: string): Promise<void> {
        this.logger.debug(`AlertAccept command for applicant: ${applicant}`);
        const page = await this.getPage(applicant);
        page.once('dialog', dialog => {
            this.logger.info(`Accepting dialog for ${applicant}: ${dialog.message()}`);
            dialog.accept().catch(e => this.logger.error(`Error accepting dialog for ${applicant}:`, e));
            delete this.dialogInfo[applicant];
        });
        this.logger.warn("AlertAccept sets up a listener for the *next* dialog. If an alert is already open from a previous action, this might not catch it unless another interaction triggers Playwright's event loop for dialogs.");
    }

    async alertDismiss(applicant: string): Promise<void> {
        this.logger.debug(`AlertDismiss command for applicant: ${applicant}`);
        const page = await this.getPage(applicant);
        page.once('dialog', dialog => {
            this.logger.info(`Dismissing dialog for ${applicant}: ${dialog.message()}`);
            dialog.dismiss().catch(e => this.logger.error(`Error dismissing dialog for ${applicant}:`, e));
            delete this.dialogInfo[applicant];
        });
        this.logger.warn("AlertDismiss sets up a listener for the *next* dialog. If an alert is already open, this might not catch it.");
    }

    async alertText(applicant: string): Promise<string | null> {
        this.logger.debug(`AlertText command for applicant: ${applicant}`);
        const dialog = this.dialogInfo[applicant];
        if (dialog) {
            return dialog.message;
        }
        this.logger.warn("AlertText relies on previously captured dialog information. No dialog info found.");
        return null;
    }

    async dragAndDrop(
        applicant: string,
        sourceSelector: string,
        destinationSelector: string,
    ): Promise<void> {
        this.logger.debug(`DragAndDrop command for applicant: ${applicant}, source: ${sourceSelector}, destination: ${destinationSelector}`);
        const page = await this.getPage(applicant);
        await page.dragAndDrop(sourceSelector, destinationSelector);
    }

    async setCookie(applicant: string, cookie: { name: string; value: string; url?: string; domain?: string; path?: string; expires?: number; httpOnly?: boolean; secure?: boolean; sameSite?: 'Strict' | 'Lax' | 'None' }): Promise<void> {
        this.logger.debug(`SetCookie command for applicant: ${applicant}, cookie: ${JSON.stringify(cookie)}`);
        const page = await this.getPage(applicant);
        const context = page.context();
        await context.addCookies([cookie]);
    }

    async getCookie(applicant: string, cookieName?: string): Promise<any> {
        this.logger.debug(`GetCookie command for applicant: ${applicant}, cookieName: ${cookieName}`);
        const page = await this.getPage(applicant);
        const context = page.context();
        const cookies = await context.cookies();
        if (cookieName) {
            const foundCookie = cookies.find(c => c.name === cookieName);
            return foundCookie ? foundCookie.value : undefined;
        }
        return cookies;
    }

    async deleteCookie(applicant: string, cookieName?: string): Promise<void> {
        this.logger.debug(`DeleteCookie command for applicant: ${applicant}, cookieName: ${cookieName}`);
        const page = await this.getPage(applicant);
        const context = page.context();
        const allCookies = await context.cookies();
        if (cookieName) {
            const cookiesToKeep = allCookies.filter(c => c.name !== cookieName);
            await context.clearCookies();
            if (cookiesToKeep.length > 0) {
                await context.addCookies(cookiesToKeep);
            }
        } else {
            await context.clearCookies();
        }
    }

    async getHTML(applicant: string, selector: string, includeSelectorTag?: boolean): Promise<string> {
        this.logger.debug(`GetHTML command for applicant: ${applicant}, selector: ${selector}, includeSelectorTag: ${includeSelectorTag}`);
        const page = await this.getPage(applicant);
        const element = await page.$(selector);
        if (!element) {
            throw new Error(`Element with selector "${selector}" not found.`);
        }
        if (includeSelectorTag) {
            return element.outerHTML();
        }
        return element.innerHTML();
    }

    async getSize(applicant: string, selector: string): Promise<{ width: number; height: number } | null> {
        this.logger.debug(`GetSize command for applicant: ${applicant}, selector: ${selector}`);
        const page = await this.getPage(applicant);
        const element = await page.$(selector);
        const boundingBox = await element?.boundingBox();
        if (boundingBox) {
            return { width: boundingBox.width, height: boundingBox.height };
        }
        return null;
    }

    async getCurrentTabId(applicant: string): Promise<string> {
        this.logger.debug(`GetCurrentTabId command for applicant: ${applicant}`);
        const page = await this.getPage(applicant);
        return (page as any).guid;
    }

    async switchTab(applicant: string, tabId: string): Promise<void> {
        this.logger.debug(`SwitchTab command for applicant: ${applicant}, tabId: ${tabId}`);
        this.logger.warn("SwitchTab is not fully supported with the current one-page-per-applicant model. This command may not behave as expected if 'tabId' refers to a page not currently active for the applicant.");
        const currentPage = await this.getPage(applicant);
        if ((currentPage as any).guid === tabId) {
            return Promise.resolve();
        }
        throw new Error('SwitchTab: True multi-tab switching per applicant is not yet implemented.');
    }

    async close(applicant: string, tabId?: string): Promise<void> {
        this.logger.debug(`Close command for applicant: ${applicant}, tabId: ${tabId}`);
        const currentPage = await this.getPage(applicant);
        if (!tabId || (currentPage as any).guid === tabId) {
            this.logger.info(`Closing current page/context for applicant: ${applicant}`);
            await this.browserManager.closeContext(applicant);
            this.activePages.delete(applicant);
            delete this.dialogInfo[applicant];
        } else {
            this.logger.warn("Close(tabId) for a non-current tab is not fully supported. This will only close the applicant's currently active page if tabId matches.");
            throw new Error('Close(tabId): True multi-tab closing is not yet implemented for non-current tabs.');
        }
    }

    async getTabIds(applicant: string): Promise<string[]> {
        this.logger.debug(`GetTabIds command for applicant: ${applicant}`);
        const page = await this.getPage(applicant);
        return [(page as any).guid];
    }

    async window(applicant: string, tabIdOrName: string): Promise<any> {
        this.logger.warn("`window(tabIdOrName)` is deprecated, use `switchTab(tabId)`. Mapping to switchTab.");
        return this.switchTab(applicant, tabIdOrName);
    }

    async windowHandles(applicant: string): Promise<string[]> {
        this.logger.warn("`windowHandles()` is deprecated, use `getTabIds()`. Mapping to getTabIds.");
        return this.getTabIds(applicant);
    }

    async getTagName(applicant: string, selector: string): Promise<string | null> {
        this.logger.debug(`GetTagName command for applicant: ${applicant}, selector: ${selector}`);
        const page = await this.getPage(applicant);
        const element = await page.$(selector);
        if (element) {
            const tagName = await element.evaluate(node => node.tagName.toLowerCase());
            return tagName;
        }
        return null;
    }

    async isSelected(applicant: string, selector: string): Promise<boolean> {
        this.logger.debug(`IsSelected command for applicant: ${applicant}, selector: ${selector}`);
        const page = await this.getPage(applicant);
        return page.isChecked(selector);
    }

    async getText(applicant: string, selector: string): Promise<string | null> {
        this.logger.debug(`GetText command for applicant: ${applicant}, selector: ${selector}`);
        const page = await this.getPage(applicant);
        return page.innerText(selector);
    }

    /**
     * @deprecated Due to differences in Playwright's element handling, this method assumes `selectorOrElementId` is a selector string.
     * It does not support WebdriverIO's element ID protocol for checking if an element is selected.
     * Consider using `isSelected(selector)` instead for better Playwright compatibility.
     *
     * Checks if an element (e.g., checkbox, radio button) identified by a selector is selected/checked.
     * @param applicant The applicant identifier.
     * @param selectorOrElementId Assumed to be a selector string.
     * @returns True if the element is selected/checked, false otherwise.
     */
    async elementIdSelected(applicant: string, selectorOrElementId: string): Promise<boolean> {
        this.logger.debug(`ElementIdSelected command for applicant: ${applicant}, selectorOrElementId: ${selectorOrElementId}`);
        this.logger.warn("`elementIdSelected` in Playwright context assumes the 'elementId' (first arg) is a selector. True element ID chaining like WebdriverIO is not directly supported. Consider using `isSelected(selector)`.");
        const page = await this.getPage(applicant);
        return page.isChecked(selectorOrElementId);
    }

    async makeScreenshot(applicant: string): Promise<string | Buffer> {
        this.logger.debug(`MakeScreenshot command for applicant: ${applicant}`);
        const page = await this.getPage(applicant);
        const buffer = await page.screenshot();
        return buffer.toString('base64');
    }

    /**
     * Uploads a file to a file input element.
     * NOTE: This command's signature has been adapted for Playwright.
     * Unlike some WebdriverIO setups where `uploadFile` might work without a selector (e.g. for remote uploads),
     * this Playwright implementation requires a `selector` for the file input element (`<input type="file">`).
     * Test code using this command MUST be updated to provide the selector as the first argument after `applicant`.
     *
     * @param applicant The applicant identifier.
     * @param selector The selector for the file input element.
     * @param filePath The local path to the file to be uploaded.
     * @returns A Promise that resolves when the file paths are set.
     */
    async uploadFile(applicant: string, selector: string, filePath: string): Promise<void> {
        this.logger.debug(`UploadFile command for applicant: ${applicant}, selector: ${selector}, filePath: ${filePath}`);
        const page = await this.getPage(applicant);
        await page.setInputFiles(selector, filePath);
    }

    async getCssProperty(
        applicant: string,
        selector: string,
        cssProperty: string,
    ): Promise<string | null> {
        this.logger.debug(`GetCssProperty command for applicant: ${applicant}, selector: ${selector}, cssProperty: ${cssProperty}`);
        const page = await this.getPage(applicant);
        const element = await page.$(selector);
        if (element) {
            const value = await element.evaluate((node, { prop }) => {
                return getComputedStyle(node).getPropertyValue(prop);
            }, { prop: cssProperty });
            return value;
        }
        return null;
    }

    async getSource(applicant: string): Promise<string> {
        this.logger.debug(`GetSource command for applicant: ${applicant}`);
        const page = await this.getPage(applicant);
        return page.content();
    }

    async isExisting(applicant: string, selector: string): Promise<boolean> {
        this.logger.debug(`IsExisting command for applicant: ${applicant}, selector: ${selector}`);
        const page = await this.getPage(applicant);
        const element = await page.$(selector);
        return !!element;
    }

    async waitForValue(
        applicant: string,
        selector: string,
        timeout: number,
        reverse: boolean,
    ): Promise<any> {
        this.logger.debug(`WaitForValue command for applicant: ${applicant}, selector: ${selector}, timeout: ${timeout}, reverse: ${reverse}`);
        const page = await this.getPage(applicant);
        return page.waitForFunction(
            (params) => {
                const { sel, rev } = params;
                const element = document.querySelector(sel) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                const value = element ? element.value : null;
                return rev ? !value : !!value;
            },
            { sel: selector, rev: reverse },
            { timeout }
        );
    }

    async waitForSelected(
        applicant: string,
        selector: string,
        timeout: number,
        reverse: boolean,
    ): Promise<any> {
        this.logger.debug(`WaitForSelected command for applicant: ${applicant}, selector: ${selector}, timeout: ${timeout}, reverse: ${reverse}`);
        const page = await this.getPage(applicant);
        return page.waitForFunction(
            (params) => {
                const { sel, rev } = params;
                const element = document.querySelector(sel) as HTMLInputElement | HTMLOptionElement;
                let isSelected = false;
                if (element) {
                    if ((element as HTMLInputElement).checked !== undefined) {
                        isSelected = (element as HTMLInputElement).checked;
                    } else if ((element as HTMLOptionElement).selected !== undefined) {
                        isSelected = (element as HTMLOptionElement).selected;
                    }
                }
                return rev ? !isSelected : isSelected;
            },
            { sel: selector, rev: reverse },
            { timeout }
        );
    }

    /**
     * Waits until a condition (a function) returns true or a truthy value.
     * IMPORTANT: WebdriverIO's `waitUntil` executes the `condition` function in the Node.js context,
     * allowing it to contain other WebdriverIO commands and complex Node.js logic.
     * This Playwright plugin maps `waitUntil` to Playwright's `page.waitForFunction()`,
     * which executes the provided function in the **browser's context**.
     * This means the `condition` function:
     * 1. CANNOT use any Node.js scope (variables, modules) unless passed as arguments.
     * 2. CANNOT make other Testring/WebdriverIO browser commands.
     * 3. Must be a self-contained script executable in the browser.
     * Tests relying on Node.js-context conditions for `waitUntil` will need significant refactoring.
     * Consider using Playwright's more specific wait methods like `waitForSelector`, `waitForEvent`, etc.,
     * or implement polling loops in your test code if complex Node.js-side logic is needed.
     *
     * @param applicant The applicant identifier.
     * @param condition A function to be evaluated in the browser context. It should return a truthy value when the condition is met.
     * @param timeout Maximum time in milliseconds to wait for the condition to be true.
     * @param timeoutMsg (Not directly supported by Playwright's `waitForFunction`) A message to display if the timeout is reached.
     * @param interval Polling interval in milliseconds for checking the condition.
     * @returns A Promise that resolves when the condition is true, or rejects on timeout.
     */
    async waitUntil(
        applicant: string,
        condition: () => boolean | Promise<boolean>,
        timeout?: number,
        timeoutMsg?: string,
        interval?: number,
    ): Promise<any> {
        this.logger.debug(`WaitUntil command for applicant: ${applicant}, timeout: ${timeout}, interval: ${interval}`);
        const page = await this.getPage(applicant);
        this.logger.warn("WebdriverIO's `waitUntil` executes the condition in Node.js context. Playwright's `page.waitForFunction` executes in browser context. This is a direct call to `page.waitForFunction` assuming the condition is browser-compatible. True `waitUntil` behavior (Node.js context polling) is not replicated here.");
        if (typeof condition !== 'function') {
            throw new Error('WaitUntil condition must be a function.');
        }
        return page.waitForFunction(condition as any, null, { timeout: timeout, polling: interval });
    }

    async selectByAttribute(
        applicant: string,
        selector: string,
        attribute: string,
        value: string,
    ): Promise<void> {
        this.logger.debug(`SelectByAttribute command for applicant: ${applicant}, selector: ${selector}, attribute: ${attribute}, value: ${value}`);
        const page = await this.getPage(applicant);
        const optionSelector = `${selector} option[${attribute}="${value}"]`;
        const optionElement = await page.$(optionSelector);
        if (!optionElement) {
            throw new Error(`Option with ${attribute}="${value}" not found within ${selector}`);
        }
        const optionValue = await optionElement.getAttribute('value');
        if (optionValue === null) {
            throw new Error(`Option found by ${attribute}="${value}" does not have a value attribute.`);
        }
        await page.selectOption(selector, { value: optionValue });
    }

    async gridTestSession(applicant: string): Promise<any> {
        this.logger.info(`GridTestSession command for applicant: ${applicant}`);
        const page = await this.getPage(applicant);
        return Promise.resolve({
            sessionId: (page as any).guid + '-playwright',
            host: this.config.browserType,
            port: null,
            type: 'playwright',
            browserName: this.config.browserType,
            browserVersion: (await page.context().browser()?.version()) || 'unknown',
        });
    }

    async getHubConfig(applicant: string): Promise<any> {
        this.logger.info(`GetHubConfig command for applicant: ${applicant}`);
        await this.getPage(applicant); // Ensure browser is launched for context
        return Promise.resolve({
            type: 'playwright',
            host: null,
            port: null,
            newSessionCapabilityInstance: false,
            status: 0,
            value: {
                ready: true,
                message: 'Playwright is running locally, not connected to a Selenium Hub.',
                build: {
                    version: (await this.getPage(applicant).context().browser()?.version()) || 'unknown',
                },
                os: {
                    arch: process.arch,
                    name: process.platform,
                    version: process.version,
                },
                java: {
                    version: null,
                }
            }
        });
    }
}

export default function playwrightProxy(config: PlaywrightPluginConfig): IBrowserProxyPlugin { // Use actual config type
   return new PlaywrightPlugin(config);
}
