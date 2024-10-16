import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../../common/enums/command';
import { constStrings } from './constants';
import { OvertimeData } from '../../common/types/overtimeData';
import { ErrorData } from '../../common/types/errorData';
import { BackgroundResponse } from '../../common/types/backgroundResponse';

export default class Communication {
    public constructor(public portToCs: browser.Runtime.Port) {}

    /**
     * Posts a message with an error message. The error message is for unexpected worker errors.
     * @param command    the command to send along side the error message
     */
    public postWorkerError(command: BackgroundCommand) {
        const message: BackgroundResponse = {
            command: command,
            content: { error: { message: constStrings.errorMsgs.unexpectedWorkerError } },
        };
        this.portToCs.postMessage(message);
    }

    /**
     * Posts a message to the content script.
     * @param command   the command to send to the content script
     * @param data      the data to send to the content script
     */
    public postCsMessage(command: BackgroundCommand, data?: OvertimeData | ErrorData) {
        const message: BackgroundResponse = { command: command, content: data };
        this.portToCs.postMessage(message);
    }
}
