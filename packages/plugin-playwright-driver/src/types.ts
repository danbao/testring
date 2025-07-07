import type {LaunchOptions} from 'playwright-core';

export interface PlaywrightPluginConfig {
    browser?: 'chromium' | 'firefox' | 'webkit';
    headless?: boolean;
    launchOptions?: LaunchOptions;
}
