import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../common/enums/command';
import Formater from './utils/format';
import { constStrings } from './utils/constants';
import StorageManager from '../common/utils/storageManager';
import Communication from './utils/communication';
import CompatabilityLayer from './chromium/compatabilityLayer';

let portFromCS: browser.Runtime.Port; // port from content script

// paths are not relative but start at the extension folder (build output)
const TIME_STATEMENT_WORKER_FILE = 'backgroundscript/webWorker/timeStatementWorker.js';
const TIME_SHEET_WORKER_FILE = 'backgroundscript/webWorker/timeSheetWorker.js';
const EMPLOYEE_ID_WORKER_FILE = 'backgroundscript/webWorker/employeeIdWorker.js';

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

async function saveOvertimeFromTimeSheet(message: object) {
    const timeSheetWorker = await CompatabilityLayer.CreateWorker(TIME_SHEET_WORKER_FILE);

    timeSheetWorker.onmessage = (workerMessage: MessageEvent) => {
        checkForOvertime(
            workerMessage,
            BackgroundCommand.ParseTimeSheet,
            (overtime: number) => StorageManager.saveTimeSheetOvertime(overtime),
            portFromCS,
        );
    };
    timeSheetWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        Communication.postWorkerError(portFromCS, BackgroundCommand.ParseTimeSheet);
    };
    timeSheetWorker.postMessage(message);
}

async function sendBackEmployeeId(message: object) {
    const employeeIdWorker = await CompatabilityLayer.CreateWorker(EMPLOYEE_ID_WORKER_FILE);

    employeeIdWorker.onmessage = (workerMessage: MessageEvent) => {
        printPossibleError(workerMessage.data);
        portFromCS.postMessage(workerMessage.data);
    };
    employeeIdWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        portFromCS.postMessage({
            command: BackgroundCommand.ParseEmployeeId,
            error: { message: constStrings.errorMsgs.unexpectedWorkerError },
        });
    };
    employeeIdWorker.postMessage(message);
}

async function saveOvertimeFromPDF(message: object) {
    const timeStatementWorker = await CompatabilityLayer.CreateWorker(TIME_STATEMENT_WORKER_FILE);

    timeStatementWorker.onmessage = (workerMessage: MessageEvent) => {
        checkForOvertime(
            workerMessage,
            BackgroundCommand.CompileTimeSatement,
            (overtime: number) => StorageManager.saveTimeStatementOvertime(overtime),
            portFromCS,
        );
    };
    timeStatementWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        Communication.postWorkerError(portFromCS, BackgroundCommand.CompileTimeSatement);
    };
    timeStatementWorker.postMessage(message);
}

/**
 * Makes multiple checks on the MessageEvent data and calls the callback function with the overtime.
 * The given MessageEvent can contain an error message in the form of `error: { message: string }`
 * in which case any `originalError`s will be printed and an error response will be sent on the port.
 * If the MessageEvent data has the `action` attribute the callback function wont be called either.
 * If the overtime is in the data then the callback will be called with the overtime.
 * @param message     the message which to check for errors and the overtime
 * @param command     the command to send as a response on the port
 * @param callback    will be called once the overtime was found in the MessageEvent data
 * @param port        the port on which to send messages
 */
function checkForOvertime(
    message: MessageEvent,
    command: BackgroundCommand,
    callback: (overtime: number) => void,
    port: browser.Runtime.Port,
) {
    if ('error' in message.data) {
        // an error was caught, forward the message
        port.postMessage(message.data);
        printPossibleError(message.data);
        return;
    }
    if ('action' in message.data) {
        // the pdf worker sends a ready message which is caught by this check
        if (message.data.action !== 'ready') {
            console.error('A message with action was sent which is not the ready action:');
            console.error(message);
            Communication.postWorkerError(port, command);
        }
        return; // pdf worker only notified that it is ready, nothing to do
    }
    if (!('overtime' in message.data)) {
        // should not happen
        console.error('Received an unexpected response from time time statement worker:');
        console.error(message);
        Communication.postWorkerError(port, command);
        return;
    }

    callback(message.data.overtime);
    port.postMessage({ command: command });
}

/**
 * Checks if the the given data has the `originalError` attribute and prints it.
 */
function printPossibleError(data: object) {
    if ('originalError' in data) {
        console.error(data.originalError);
    }
}

// listen for connection opening from the content script
browser.runtime.onConnect.addListener(connectedToContentScript);
