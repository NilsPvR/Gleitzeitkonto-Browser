import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../common/enums/command';
import Formater from './utils/format';
import { constStrings } from './utils/constants';
import StorageManager from '../common/utils/storageManager';

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

function saveOvertimeFromTimeSheet(message: object) {
    const timeSheetWorker = new Worker(TIME_SHEET_WORKER_FILE);

    timeSheetWorker.onmessage = (workerMessage: MessageEvent) => {
        if ('error' in workerMessage.data) {
            printPossibleError(workerMessage.data);
            // the worker caught an error, forward the message
            portFromCS.postMessage(workerMessage.data);
            return;
        }
        if (!('overtime' in workerMessage.data)) {
            // should not happen
            console.error('Received an unexpected response from time sheet worker:');
            console.error(workerMessage);
            postWorkerError(BackgroundCommand.ParseTimeSheet);
            return;
        }

        StorageManager.saveTimeSheetOvertime(workerMessage.data.overtime);
        portFromCS.postMessage({ command: BackgroundCommand.ParseTimeSheet });
    };
    timeSheetWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        postWorkerError(BackgroundCommand.ParseTimeSheet);
    };
    timeSheetWorker.postMessage(message);
}

function sendBackEmployeeId(message: object) {
    const employeeIdWorker = new Worker(EMPLOYEE_ID_WORKER_FILE);

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

function saveOvertimeFromPDF(message: object) {
    const timeStatementWorker = new Worker(TIME_STATEMENT_WORKER_FILE);

    timeStatementWorker.onmessage = (workerMessage: MessageEvent) => {
        if ('error' in workerMessage.data) {
            printPossibleError(workerMessage.data);
            // the worker caught an error, forward the message
            portFromCS.postMessage(workerMessage.data);
            return;
        }
        if ('action' in workerMessage.data) {
            // the pdf worker sends a ready message which is caught by this check
            if (workerMessage.data.action !== 'ready') {
                console.error('A message with action was sent which is not the ready action:');
                console.error(workerMessage);
                postWorkerError(BackgroundCommand.ParseTimeSheet);
            }
            return; // pdf worker only notified that it is ready, nothing to do
        }
        if (!('overtime' in workerMessage.data)) {
            // should not happen
            console.error('Received an unexpected response from time time statement worker:');
            console.error(workerMessage);
            postWorkerError(BackgroundCommand.CompileTimeSatement);
            return;
        }

        StorageManager.saveTimeStatementOvertime(workerMessage.data.overtime);
        portFromCS.postMessage({ command: BackgroundCommand.CompileTimeSatement });
    };
    timeStatementWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        postWorkerError(BackgroundCommand.CompileTimeSatement);
    };
    timeStatementWorker.postMessage(message);
}

// posts a messaage to the content script with an error message about an unexpected error in the worker
function postWorkerError(command: BackgroundCommand) {
    portFromCS.postMessage({
        command: command,
        error: { message: constStrings.errorMsgs.unexpectedWorkerError },
    });
}

// checks if the given data has an original error message and prints it
function printPossibleError(data: object) {
    if ('originalError' in data) {
        console.error(data.originalError);
    }
}

// listen for connection opening from the content script
browser.runtime.onConnect.addListener(connectedToContentScript);
