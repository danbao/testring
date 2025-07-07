import * as path from 'path';
import {PluginAPI} from '@testring/plugin-api';
import {PlaywrightPluginConfig} from './types';

export default function playwrightPlugin(
    pluginAPI: PluginAPI,
    userConfig: PlaywrightPluginConfig,
): void {
    const pluginPath = path.join(__dirname, './plugin');
    const browserProxy = pluginAPI.getBrowserProxy();

    browserProxy.proxyPlugin(pluginPath, userConfig || {});
}
