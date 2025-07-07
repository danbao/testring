import {chromium, firefox, webkit, Browser, BrowserContext, Page} from 'playwright-core';
import {IBrowserProxyPlugin} from '@testring/types';
import {PlaywrightPluginConfig} from '../types';

interface BrowserItem {
    browser: Browser;
    context: BrowserContext;
    page: Page;
}

export class PlaywrightPlugin implements IBrowserProxyPlugin {
    private clients = new Map<string, BrowserItem>();

    constructor(private config: PlaywrightPluginConfig = {}) {}

    async kill() {
        for (const applicant of Array.from(this.clients.keys())) {
            await this.end(applicant);
        }
    }

    private async createClient(applicant: string) {
        if (this.clients.has(applicant)) {
            return;
        }
        const {browser = 'chromium', headless = true, launchOptions = {}} = this.config;
        const launcher = browser === 'firefox' ? firefox : browser === 'webkit' ? webkit : chromium;
        const br = await launcher.launch({headless, ...(launchOptions as any)});
        const context = await br.newContext();
        const page = await context.newPage();
        this.clients.set(applicant, {browser: br, context, page});
    }

    private getPage(applicant: string): Page {
        const data = this.clients.get(applicant);
        if (!data) {
            throw new Error(`No browser for ${applicant}`);
        }
        return data.page;
    }

    async end(applicant: string) {
        const data = this.clients.get(applicant);
        if (data) {
            await data.browser.close();
            this.clients.delete(applicant);
        }
    }

    async refresh(applicant: string) {
        await this.createClient(applicant);
        await this.getPage(applicant).reload();
    }

    async click(applicant: string, selector: string) {
        await this.createClient(applicant);
        await this.getPage(applicant).click(selector);
    }

    async url(applicant: string, val: string) {
        await this.createClient(applicant);
        const page = this.getPage(applicant);
        if (val) {
            await page.goto(val);
            return;
        }
        return page.url();
    }

    async newWindow(applicant: string, val: string) {
        await this.createClient(applicant);
        const item = this.clients.get(applicant)!;
        const page = await item.context.newPage();
        if (val) {
            await page.goto(val);
        }
        item.page = page;
        return page;
    }

    async waitForExist(applicant: string, selector: string, timeout: number) {
        await this.createClient(applicant);
        await this.getPage(applicant).waitForSelector(selector, {timeout});
    }

    async waitForVisible(applicant: string, selector: string, timeout: number) {
        await this.createClient(applicant);
        await this.getPage(applicant).waitForSelector(selector, {timeout, state: 'visible'});
    }

    async isVisible(applicant: string, selector: string) {
        await this.createClient(applicant);
        const el = await this.getPage(applicant).$(selector);
        return el ? await el.isVisible() : false;
    }

    async moveToObject(applicant: string, selector: string, x = 0, y = 0) {
        await this.createClient(applicant);
        const box = await this.getPage(applicant).locator(selector).boundingBox();
        if (box) {
            await this.getPage(applicant).mouse.move(box.x + x, box.y + y);
        }
    }

    async execute(applicant: string, fn: any, args: Array<any>) {
        await this.createClient(applicant);
        return this.getPage(applicant).evaluate(fn, ...(args || []));
    }

    async executeAsync(applicant: string, fn: any, args: Array<any>) {
        return this.execute(applicant, fn, args);
    }

    async getTitle(applicant: string) {
        await this.createClient(applicant);
        return this.getPage(applicant).title();
    }

    async clearValue(applicant: string, selector: string) {
        await this.createClient(applicant);
        await this.getPage(applicant).fill(selector, '');
    }

    async keys(applicant: string, value: any) {
        await this.createClient(applicant);
        await this.getPage(applicant).keyboard.type(String(value));
    }

    async elementIdText(applicant: string, elementId: string) {
        return undefined;
    }

    async elements(applicant: string, selector: string) {
        await this.createClient(applicant);
        const els = await this.getPage(applicant).$$(selector);
        return els.map((e) => ({ELEMENT: (e as any)._guid || ''}));
    }

    async getValue(applicant: string, selector: string) {
        await this.createClient(applicant);
        return this.getPage(applicant).inputValue(selector);
    }

    async setValue(applicant: string, selector: string, value: any) {
        await this.createClient(applicant);
        await this.getPage(applicant).fill(selector, String(value));
    }

    async selectByIndex(applicant: string, selector: string, index: number) {
        // not implemented
    }

    async selectByValue(applicant: string, selector: string, value: any) {
        // not implemented
    }

    async selectByVisibleText(applicant: string, selector: string, str: string) {
        // not implemented
    }

    async getAttribute(applicant: string, selector: string, attr: string) {
        await this.createClient(applicant);
        const el = await this.getPage(applicant).$(selector);
        if (el) {
            return el.getAttribute(attr);
        }
        return null;
    }

    async windowHandleMaximize(applicant: string) {
        // not implemented
    }

    async isEnabled(applicant: string, selector: string) {
        await this.createClient(applicant);
        const el = await this.getPage(applicant).$(selector);
        if (!el) return false;
        return !(await el.isDisabled());
    }

    async scroll(applicant: string, selector: string, x: number, y: number) {
        await this.createClient(applicant);
        await this.getPage(applicant).evaluate(
            ([sel, xPos, yPos]) => {
                const el = document.querySelector(sel as string);
                if (el) el.scrollBy(xPos as number, yPos as number);
            },
            [selector, x, y],
        );
    }

    async scrollIntoView(applicant: string, selector: string) {
        await this.createClient(applicant);
        await this.getPage(applicant).evaluate((sel) => {
            const el = document.querySelector(sel);
            if (el) el.scrollIntoView();
        }, selector);
    }

    async isAlertOpen(applicant: string) {
        return false;
    }

    async alertAccept(applicant: string) {}

    async alertDismiss(applicant: string) {}

    async alertText(applicant: string) {
        return '';
    }

    async dragAndDrop(applicant: string, source: string, destination: string) {
        await this.createClient(applicant);
        await this.getPage(applicant).dragAndDrop(source, destination);
    }

    async setCookie(applicant: string, cookieObj: any) {
        await this.createClient(applicant);
        await this.getPage(applicant).context().addCookies([cookieObj]);
    }

    async getCookie(applicant: string, cookieName?: string) {
        await this.createClient(applicant);
        const cookies = await this.getPage(applicant).context().cookies();
        if (cookieName) {
            const c = cookies.find((i) => i.name === cookieName);
            return c ? c.value : undefined;
        }
        return cookies;
    }

    async deleteCookie(applicant: string, cookieName?: string) {
        await this.createClient(applicant);
        const context = this.getPage(applicant).context();
        if (cookieName) {
            await context.clearCookies();
        } else {
            await context.clearCookies();
        }
    }

    async getHTML(applicant: string, selector: string) {
        await this.createClient(applicant);
        const el = await this.getPage(applicant).$(selector);
        return el ? el.innerHTML() : '';
    }

    async getCurrentTabId(applicant: string) {
        // Playwright does not expose tab ids
        return undefined;
    }

    async switchTab(applicant: string, tabId: string) {
        // not implemented
    }

    async close(applicant: string, tabId: string) {
        await this.end(applicant);
    }

    async getTabIds(applicant: string) {
        return [];
    }

    async window(applicant: string, fn: any) {
        // not implemented
    }

    async windowHandles(applicant: string) {
        return [];
    }

    async getTagName(applicant: string, selector: string) {
        await this.createClient(applicant);
        const el = await this.getPage(applicant).$(selector);
        return el ? el.evaluate((e) => e.tagName.toLowerCase()) : '';
    }

    async isSelected(applicant: string, selector: string) {
        await this.createClient(applicant);
        const el = await this.getPage(applicant).$(selector);
        if (!el) return false;
        return el.isChecked();
    }

    async getText(applicant: string, selector: string) {
        await this.createClient(applicant);
        const el = await this.getPage(applicant).$(selector);
        return el ? el.textContent() : '';
    }

    async elementIdSelected(applicant: string, id: string) {
        return false;
    }

    async makeScreenshot(applicant: string): Promise<string | void> {
        await this.createClient(applicant);
        const buf = await this.getPage(applicant).screenshot({type: 'png'});
        return buf.toString('base64');
    }

    async uploadFile(applicant: string, filePath: string) {
        // not implemented
    }

    async getCssProperty(applicant: string, selector: string, cssProperty: string) {
        await this.createClient(applicant);
        const el = await this.getPage(applicant).$(selector);
        if (!el) return undefined;
        return el.evaluate((e, prop) => {
            return window.getComputedStyle(e).getPropertyValue(prop as string);
        }, cssProperty);
    }

    async getSource(applicant: string) {
        await this.createClient(applicant);
        return this.getPage(applicant).content();
    }

    async isExisting(applicant: string, selector: string) {
        await this.createClient(applicant);
        const el = await this.getPage(applicant).$(selector);
        return !!el;
    }

    async waitForValue(applicant: string, selector: string, timeout: number, reverse: boolean) {
        await this.createClient(applicant);
        const page = this.getPage(applicant);
        await page.waitForFunction(
            ([sel, rev]) => {
                const el: any = document.querySelector(sel as string);
                return rev ? !el?.value : !!el?.value;
            },
            [selector, reverse],
            {timeout},
        );
    }

    async waitForSelected(applicant: string, selector: string, timeout: number, reverse: boolean) {
        await this.createClient(applicant);
        const page = this.getPage(applicant);
        await page.waitForFunction(
            ([sel, rev]) => {
                const el: any = document.querySelector(sel as string);
                return rev ? !el?.selected : !!el?.selected;
            },
            [selector, reverse],
            {timeout},
        );
    }

    async waitUntil(applicant: string, condition: () => Promise<boolean>, timeout?: number) {
        await this.createClient(applicant);
        const start = Date.now();
        while (true) {
            if (await condition()) return;
            if (timeout && Date.now() - start > timeout) {
                throw new Error('Timeout');
            }
            await new Promise((r) => setTimeout(r, 100));
        }
    }

    async selectByAttribute(applicant: string, selector: string, attribute: string, value: string) {
        // not implemented
    }

    async gridTestSession(applicant: string) {}

    async getHubConfig(applicant: string) {}

    async back(applicant: string) {
        await this.createClient(applicant);
        await this.getPage(applicant).goBack();
    }

    async forward(applicant: string) {
        await this.createClient(applicant);
        await this.getPage(applicant).goForward();
    }

    async getActiveElement(applicant: string) {
        // not implemented
    }

    async getLocation(applicant: string, selector: string) {
        await this.createClient(applicant);
        const box = await this.getPage(applicant).locator(selector).boundingBox();
        return box ? {x: box.x, y: box.y} : {x: 0, y: 0};
    }

    async setTimeZone(applicant: string, timeZone: string) {}

    async getWindowSize(applicant: string) {
        await this.createClient(applicant);
        const size = await this.getPage(applicant).viewportSize();
        return size || {width: 0, height: 0};
    }

    async savePDF(applicant: string, options: any) {
        // not implemented
    }

    async addValue(applicant: string, selector: string, value: string | number) {
        await this.createClient(applicant);
        await this.getPage(applicant).type(selector, String(value));
    }

    async doubleClick(applicant: string, selector: string) {
        await this.createClient(applicant);
        await this.getPage(applicant).dblclick(selector);
    }

    async isClickable(applicant: string, selector: string) {
        await this.createClient(applicant);
        const el = await this.getPage(applicant).$(selector);
        return !!el;
    }

    async waitForClickable(applicant: string, selector: string, timeout: number) {
        await this.createClient(applicant);
        await this.getPage(applicant).waitForSelector(selector, {timeout});
    }

    async isFocused(applicant: string, selector: string) {
        await this.createClient(applicant);
        const el = await this.getPage(applicant).$(selector);
        if (!el) return false;
        return el.evaluate((e) => e === document.activeElement);
    }

    async isStable(applicant: string, selector: string) {
        return true;
    }

    async waitForEnabled(applicant: string, selector: string, timeout: number) {
        await this.createClient(applicant);
        const page = this.getPage(applicant);
        await page.waitForFunction(
            (sel) => {
                const el: any = document.querySelector(sel as string);
                return !el?.disabled;
            },
            selector,
            {timeout},
        );
    }

    async waitForStable(applicant: string, selector: string, timeout: number) {
        // not implemented
    }
}

export default function playwrightProxy(config: PlaywrightPluginConfig) {
    return new PlaywrightPlugin(config);
}
