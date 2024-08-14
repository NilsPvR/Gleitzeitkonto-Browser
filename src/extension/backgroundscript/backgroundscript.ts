import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../common/enums/command';
import Formater from './util/format';
import { constStrings } from './util/constants';

let portFromCS: browser.Runtime.Port; // port from content script

function connectedToContentScript(port: browser.Runtime.Port) {
    portFromCS = port;

    if (portFromCS.sender?.id !== browser.runtime.id) {
        // sender id is not the one of this extension
        // invalid id, incoming request might be malicious
        console.error(constStrings.errorMsgs.invalidRequest);
        port.disconnect();
    }

    portFromCS.onMessage.addListener((message) => {
        switch (message?.command) {
            case BackgroundCommand.CalculateOvertime:
                try {
                    Formater.getJSONFromAPIData(message.content);
                } catch (e) {
                    console.error(e);
                    portFromCS.postMessage({
                        command: BackgroundCommand.CalculateOvertime,
                        error: { message: constStrings.errorMsgs.unableToParseJSON },
                    });
                    break;
                }

                // TODO actually calculate the overtime from the received data
                window.setTimeout(() => {
                    portFromCS.postMessage({
                        command: BackgroundCommand.CalculateOvertime,
                        accountString: '100h',
                    });
                }, 1000);

                break;

            default:
                portFromCS.postMessage({
                    error: {
                        command: BackgroundCommand.CalculateOvertime,
                        message: constStrings.errorMsgs.invalidCommand,
                    },
                });
                break;
        }
    });
}

// listen for connection opening from the content script
browser.runtime.onConnect.addListener(connectedToContentScript);
