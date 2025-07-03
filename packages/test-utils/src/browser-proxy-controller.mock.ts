import {IBrowserProxyController, IBrowserProxyCommand} from '@testring/types';

export class BrowserProxyControllerMock implements IBrowserProxyController {
    private callStack: Array<IBrowserProxyCommand> = [];

    init() {
        return Promise.resolve();
    }

    execute(_applicant: string, command: IBrowserProxyCommand) {
        this.callStack.push(command);

        return Promise.resolve(1);
    }

    kill() {
        return Promise.resolve();
    }

    $getCommands() {
        return this.callStack;
    }
}
