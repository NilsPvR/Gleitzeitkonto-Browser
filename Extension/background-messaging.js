const browser = require('webextension-polyfill');

// Constants
const applicationName = 'Gleitzeitkonto-Browser CompanionApp';
const errorMsgs = {
    companionAppUnavailable: `Die ${applicationName} konnte nicht erreicht werden.`
}


// returns a promise which will resole to the received message or an error message
// message should be a object which can be sent as JSON
async function sendMessageToCompanionApp (message) {
    try {
        return browser.runtime.sendNativeMessage(applicationName, message);
    } catch (err) {
        return { error: { message: errorMsgs.companionAppUnavailable } };
    }
};


function handleContentScriptMessage(message, sender, sendResponse) {
    // will only receive messages meant to be sent to companion app
    // send command as is to companion app

    sendMessageToCompanionApp(message)
        .then((companionAppResponse) => {
            sendResponse(companionAppResponse);
        });

    return true; // let the browser know that the response will be sent later
};



// Listen for messages from the content script
browser.runtime.onMessage.addListener(handleContentScriptMessage);