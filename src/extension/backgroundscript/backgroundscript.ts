import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../common/enums/command';
import Formater from './utils/format';
import { config, constStrings } from './utils/constants';
import TimeData from './model/timeData';
import EmployeeData from './model/employeeData';
import WorkingTimes from './utils/workingTimes';
import PDFManager from './utils/pdfManager';

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
            case BackgroundCommand.ParseEmployeeId:
                sendBackEmployeeId(message);
                break;
            case BackgroundCommand.CompilePDF:
                saveOvertimeFromPDF(message);
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

function sendBackOvertime(message: object) {
    // TODO load publicHolidays from settings
    const controller = new WorkingTimes(config.publicHolidays);

    try {
        if (!('content' in message) || typeof message.content !== 'string') {
            throw new Error('No message or no content received from the content script');
        }
        const jsonObject = Formater.getJSONFromAPIData(message.content);
        const timeData = TimeData.fromObject(jsonObject);

        controller.timeElements = controller.parseTimeDataToTimeElements(timeData);
    } catch (e) {
        console.error(e);
        portFromCS.postMessage({
            command: BackgroundCommand.CalculateOvertime,
            error: { message: constStrings.errorMsgs.unableToParseData },
        });
        return;
    }

    const overtimeInMinutes = controller.calculateOvertime(controller.timeElements);

    portFromCS.postMessage({
        command: BackgroundCommand.CalculateOvertime,
        accountString: Formater.minutesToTimeString(overtimeInMinutes),
    });
}

async function sendBackEmployeeId(message: object) {
    let employeeId: string;

    try {
        if (!('content' in message) || typeof message.content !== 'string') {
            throw new Error('No message or no content received from the content script');
        }
        const jsonObject = Formater.getJSONFromAPIData(message.content);
        const employeeData = EmployeeData.fromObject(jsonObject);
        employeeId = employeeData.d.results[0].employeeId;
        if (!employeeId || employeeId.trim() === '') {
            throw new Error('No employee ID in API data');
        }
    } catch (e) {
        console.error(e);
        portFromCS.postMessage({
            command: BackgroundCommand.ParseEmployeeId,
            error: { message: constStrings.errorMsgs.unableToParseData },
        });
        return;
    }

    portFromCS.postMessage({
        command: BackgroundCommand.ParseEmployeeId,
        employeeId: employeeId,
    });
}

async function saveOvertimeFromPDF(message: object) {
    try {
        const pdfDocument = await PDFManager.compilePDF(message);
        const overtimeString = await PDFManager.getOvertimeFromPDF(pdfDocument);
        const overtime = Formater.getNumberFromString(overtimeString);
        console.log(overtime);

        // TODO save in storage
    } catch (e) {
        console.error(e);
        portFromCS.postMessage({
            command: BackgroundCommand.CompilePDF,
            error: { message: constStrings.errorMsgs.unableToParseData },
        });
        return;
    }
    portFromCS.postMessage({
        command: BackgroundCommand.CompilePDF,
    });
}

// listen for connection opening from the content script
browser.runtime.onConnect.addListener(connectedToContentScript);
