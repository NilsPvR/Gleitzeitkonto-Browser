import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../../common/enums/command';
import { constStrings } from './constants';

export default class Communication {
    /**
     * Posts a message on the given port with an error message. The error message is for unexpected worker errors.
     * @param port       the port on which to post the error message
     * @param command    the command to send along side the error message
     */
    public static postWorkerError(port: browser.Runtime.Port, command: BackgroundCommand) {
        port.postMessage({
            command: command,
            error: { message: constStrings.errorMsgs.unexpectedWorkerError },
        });
    }
}
