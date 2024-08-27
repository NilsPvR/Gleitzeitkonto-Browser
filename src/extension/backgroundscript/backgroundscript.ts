import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../common/enums/command';
import Formater from './util/format';
import { constStrings } from './util/constants';
import TimeData from './model/timeData';
import WorkingTimes from './util/workingTimes';
import { config } from '../contentscript/utils/constants';

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
        if (typeof message !== 'object' || !message || !('command' in message)) {
            return;
        }
        switch (message.command) {
            case BackgroundCommand.CalculateOvertime:
                sendBackOvertime(message);
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

function sendBackOvertime(message: unknown) {
    // TODO load publicHolidays from settings
    const controller = new WorkingTimes(config.publicHolidays);

    try {
        if (
            typeof message !== 'object' ||
            !message ||
            !('content' in message) ||
            typeof message.content !== 'string'
        ) {
            throw new Error('No message or no content received from the content script');
        }
        const jsonObject = Formater.getJSONFromAPIData(message.content);
        const timeData = TimeData.fromObject(jsonObject);

        controller.timeElements = controller.parseTimeDataToTimeElements(timeData);
    } catch (e) {
        console.error(e);
        portFromCS.postMessage({
            command: BackgroundCommand.CalculateOvertime,
            error: { message: constStrings.errorMsgs.unableToParseJSON },
        });
        return;
    }

    const overtimeInMinutes = controller.calculateOvertime(controller.timeElements);

    portFromCS.postMessage({
        command: BackgroundCommand.CalculateOvertime,
        accountString: Formater.minutesToTimeString(overtimeInMinutes),
    });
}

// listen for connection opening from the content script
browser.runtime.onConnect.addListener(connectedToContentScript);
