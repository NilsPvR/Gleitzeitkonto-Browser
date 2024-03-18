const browser = require('webextension-polyfill');

// Constants
const applicationName = 'gleitzeitkonto_browser_companionapp';
const errorMsgs = {
    errorInCompanionApp: '(intern) Fehler in der CompanionApp.',
    companionAppNotFound: 'Keine Verbindung zur CompanionApp. Bitte erneut installieren.',
    invalidRequest: 'Anfrage von ungültiger extension ID erhalten. Anfrage wird abgelehnt.'
}

let portFromCS; // port form content script


// returns a promise which will resole to the received message or an error message
// message should be a object which can be sent as JSON
async function sendMessageToCompanionApp (message) {
    try {
        return await browser.runtime.sendNativeMessage(applicationName, message);
    } catch (err) {
        console.error(err);

        const command = message?.command.toLowerCase();
        portFromCS.postMessage({ command: command, error: { message: errorMsgs.companionAppNotFound } });
    }
};


function connectedToContentScript(port) {
    portFromCS = port;

    if (portFromCS.sender.id !== browser.runtime.id) { // sender id is not the one of this extension
        // invalid id, incoming request might be malicious
        console.error(errorMsgs.invalidRequest);
        port.disconnect();
    }

    // will only receive messages meant to be sent to companion app
    portFromCS.onMessage.addListener((message) => {

        sendMessageToCompanionApp(message).then((response) => { // send command as is to companion app
            // check for any erros from the companionApp
            if (response?.error?.message) {
                console.error('Error in the Gleitzeitkonto-Browser CompanionApp: ' + response.error.message);

                const command = message?.command.toLowerCase();
                portFromCS.postMessage({ command: message, error: { message: errorMsgs.errorInCompanionApp } });

            } else if (response) { // there is actually a response
                portFromCS.postMessage(response); // send the response as is back to the content script
            }
        });

    });
};



// Listen for connection opening from the content script
browser.runtime.onConnect.addListener(connectedToContentScript);