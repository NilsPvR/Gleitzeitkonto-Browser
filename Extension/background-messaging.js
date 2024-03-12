const browser = require('webextension-polyfill');

// Constants
const applicationName = 'gleitzeitkonto_browser_companionapp';

let portFromCS; // port form content script


// returns a promise which will resole to the received message or an error message
// message should be a object which can be sent as JSON
async function sendMessageToCompanionApp (message) {
    try {
        return await browser.runtime.sendNativeMessage(applicationName, message);
    } catch (err) {
        throw err; // the error needs to be thrown to show up in the brwoser console   
    }
};


function connectedToContentScript(port) {
    portFromCS = port;

    if (portFromCS.sender.id !== browser.runtime.id) { // sender id is not the one of this extension
        // invalid id, incoming request might be malicious
        console.error('Anfrage von ungültiger extension ID erhalten. Anfrage wird abgelehnt.');
        port.disconnect();
    }

    // will only receive messages meant to be sent to companion app
    portFromCS.onMessage.addListener((message) => {
        console.log('backgrond received message: ' + message);
        sendMessageToCompanionApp(message).then((response) => { // send command as is to companion app
            portFromCS.postMessage(response); // send the response as is back to the content script
        });
    });
};



// Listen for connection opening from the content script
browser.runtime.onConnect.addListener(connectedToContentScript);