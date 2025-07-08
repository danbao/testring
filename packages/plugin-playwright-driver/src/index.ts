import * as path from 'path';
import { PluginAPI, PluginConfig } from '@testring/types';

// Define and export the configuration interface for users of the plugin
export interface PlaywrightPluginConfig extends PluginConfig {
    browserType?: 'chromium' | 'firefox' | 'webkit';
    headless?: boolean;
    slowMo?: number;
    args?: string[];
    viewport?: { width: number; height: number } | null;
    // Add other Playwright-specific launch or context options here
}

export default function playwrightPlugin(
    pluginAPI: PluginAPI,
    userConfig: PluginConfig, // This is the generic PluginConfig from Testring core
): void {
    const pluginPath = path.join(__dirname, './playwright-plugin-impl');
    const browserProxy = pluginAPI.getBrowserProxy();

    // Ensure userConfig is cast or validated as PlaywrightPluginConfig if necessary
    // proxyPlugin will pass this config to the factory function in playwright-plugin-impl
    browserProxy.proxyPlugin(pluginPath, userConfig as PlaywrightPluginConfig || {});

    pluginAPI.logger.info('Playwright driver plugin registered via proxyPlugin.');
}
