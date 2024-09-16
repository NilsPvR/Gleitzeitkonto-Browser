import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../common/enums/command';
import Formater from './utils/format';
import { config, constStrings } from './utils/constants';
import TimeData from './model/timeData';
import EmployeeData from './model/employeeData';
import WorkingTimes from './utils/workingTimes';
import PDFManager from './utils/pdfManager';
import StorageManager from '../common/utils/storageManager';

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
            case BackgroundCommand.ParseTimeSheet:
                saveOvertimeFromTimeSheet(message);
                break;
            case BackgroundCommand.ParseEmployeeId:
                sendBackEmployeeId(message);
                break;
            case BackgroundCommand.CompileTimeSatement:
                saveOvertimeFromPDF(message);
                break;
            case BackgroundCommand.GetOvertime:
                sendBackOvertime();
                break;
            default:
                portFromCS.postMessage({
                    error: {
                        command: BackgroundCommand.ParseTimeSheet,
                        message: constStrings.errorMsgs.invalidCommand,
                    },
                });
                break;
        }
    });
}

async function sendBackOvertime() {
    let totalOvertime;
    try {
        const timeSheetOvertime = Number(await StorageManager.getTimeSheetOvertime());
        const timeStatementOvertime = Number(await StorageManager.getTimeStatementOvertime());
        if (Number.isNaN(timeSheetOvertime) || Number.isNaN(timeStatementOvertime)) {
            throw new Error('Overtime in storage is not a number');
        }

        totalOvertime = timeSheetOvertime + timeStatementOvertime;
    } catch (e) {
        console.error(e);
        portFromCS.postMessage({
            error: {
                command: BackgroundCommand.GetOvertime,
                message: constStrings.errorMsgs.unableToParseData,
            },
        });
        return;
    }

    portFromCS.postMessage({
        command: BackgroundCommand.GetOvertime,
        accountString: Formater.minutesToTimeString(totalOvertime),
    });
}

function saveOvertimeFromTimeSheet(message: object) {
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
            command: BackgroundCommand.ParseTimeSheet,
            error: { message: constStrings.errorMsgs.unableToParseData },
        });
        return;
    }

    const overtimeInMinutes = controller.calculateOvertime(controller.timeElements);
    StorageManager.saveTimeSheetOvertime(overtimeInMinutes);

    portFromCS.postMessage({
        command: BackgroundCommand.ParseTimeSheet,
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
        const overtimeMinutesRounded = Formater.roundHoursToNearest5Minutes(overtime);

        StorageManager.saveTimeStatementOvertime(overtimeMinutesRounded);
    } catch (e) {
        console.error(e);
        portFromCS.postMessage({
            command: BackgroundCommand.CompileTimeSatement,
            error: { message: constStrings.errorMsgs.unableToParseData },
        });
        return;
    }
    portFromCS.postMessage({
        command: BackgroundCommand.CompileTimeSatement,
    });
}

// listen for connection opening from the content script
browser.runtime.onConnect.addListener(connectedToContentScript);
