import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../common/enums/command';

// Constants
const errorMsgs = {
    invalidRequest: 'Anfrage von ungültiger extension ID erhalten. Anfrage wird abgelehnt.',
    invalidCommand: 'Interner Fehler: ungültiger Befehl!',
};

let portFromCS: browser.Runtime.Port; // port form content script

function connectedToContentScript(port: browser.Runtime.Port) {
    portFromCS = port;

    if (portFromCS.sender?.id !== browser.runtime.id) {
        // sender id is not the one of this extension
        // invalid id, incoming request might be malicious
        console.error(errorMsgs.invalidRequest);
        port.disconnect();
    }

    portFromCS.onMessage.addListener((message) => {
        switch (message?.command) {
            case BackgroundCommand.CalculateOvertime:
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
