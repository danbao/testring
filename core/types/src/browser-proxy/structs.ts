import {BrowserProxyActions} from './enums';

export interface IBrowserProxyCommand {
    action: BrowserProxyActions;
    args: Array<any>;
}

export interface IBrowserProxyMessage {
    uid: string;
    applicant: string;
    command: IBrowserProxyCommand;
}

export interface IBrowserProxyCommandResponse {
    uid: string;
    response: any;
    error: Error | null;
}

export interface IBrowserProxyPendingCommand {
    resolve: (data?: any) => void;
    reject: (exception: Error) => void;
    command: IBrowserProxyCommand;
    applicant: string;
    uid: string;
}

export interface IBrowserProxyWorkerConfig {
    plugin: string;
    config: any;
}
