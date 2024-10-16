import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../common/enums/command';
import Formater from './utils/format';
import { constStrings } from './utils/constants';
import StorageManager from '../common/utils/storageManager';
import Communication from './utils/communication';
import CompatabilityLayer from './chromium/compatabilityLayer';
import { isMessageObject } from '../common/types/messageObject';
import { isErrorData } from '../common/types/errorData';

// paths are not relative but start at the extension folder (build output)
const TIME_STATEMENT_WORKER_FILE = 'backgroundscript/webWorker/timeStatementWorker.js';
const TIME_SHEET_WORKER_FILE = 'backgroundscript/webWorker/timeSheetWorker.js';
const EMPLOYEE_ID_WORKER_FILE = 'backgroundscript/webWorker/employeeIdWorker.js';

function connectedToContentScript(port: browser.Runtime.Port) {
    if (port.sender?.id !== browser.runtime.id) {
        // sender id is not the one of this extension
        // invalid id, incoming request might be malicious
        console.error(constStrings.errorMsgs.invalidRequest);
        port.disconnect();
        return;
    }
    const communication = new Communication(port);
    communication.portToCs.onMessage.addListener((message) => {
        if (!isMessageObject(message)) {
            sendBackUnknownCmdError(communication);
            return;
        }
        switch (message.command) {
            case BackgroundCommand.ParseTimeSheet:
                saveOvertimeFromTimeSheet(communication, message);
                break;
            case BackgroundCommand.ParseEmployeeId:
                sendBackEmployeeId(communication, message);
                break;
            case BackgroundCommand.CompileTimeSatement:
                saveOvertimeFromPDF(communication, message);
                break;
            case BackgroundCommand.GetOvertime:
                sendBackOvertime(communication);
                break;
            default:
                sendBackUnknownCmdError(communication);
                break;
        }
    });
}

/**
 * Calculate the total overtime and send it back to the content script. Sends an error message
 * if overtime can't be calculated.
 */
async function sendBackOvertime(communication: Communication) {
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
        communication.postCsMessage(BackgroundCommand.GetOvertime, {
            error: {
                message: constStrings.errorMsgs.unableToParseData,
            },
        });
        return;
    }

    communication.postCsMessage(BackgroundCommand.GetOvertime, {
        overtimeText: Formater.minutesToTimeString(totalOvertime),
    });
}

async function saveOvertimeFromTimeSheet(communication: Communication, message: object) {
    const timeSheetWorker = await CompatabilityLayer.CreateWorker(TIME_SHEET_WORKER_FILE);

    timeSheetWorker.onmessage = (workerMessage: MessageEvent) => {
        checkForOvertime(
            communication,
            workerMessage,
            BackgroundCommand.ParseTimeSheet,
            (overtime: number) => StorageManager.saveTimeSheetOvertime(overtime),
        );
    };
    timeSheetWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        communication.postWorkerError(BackgroundCommand.ParseTimeSheet);
    };
    timeSheetWorker.postMessage(message);
}

async function sendBackEmployeeId(communication: Communication, message: object) {
    const employeeIdWorker = await CompatabilityLayer.CreateWorker(EMPLOYEE_ID_WORKER_FILE);

    employeeIdWorker.onmessage = (workerMessage: MessageEvent) => {
        printPossibleError(workerMessage.data);
        communication.postCsMessage(BackgroundCommand.ParseEmployeeId, workerMessage.data);
    };
    employeeIdWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        communication.postWorkerError(BackgroundCommand.ParseEmployeeId);
    };
    employeeIdWorker.postMessage(message);
}

async function saveOvertimeFromPDF(communication: Communication, message: object) {
    const timeStatementWorker = await CompatabilityLayer.CreateWorker(TIME_STATEMENT_WORKER_FILE);

    timeStatementWorker.onmessage = (workerMessage: MessageEvent) => {
        checkForOvertime(
            communication,
            workerMessage,
            BackgroundCommand.CompileTimeSatement,
            (overtime: number) => StorageManager.saveTimeStatementOvertime(overtime),
        );
    };
    timeStatementWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        communication.postWorkerError(BackgroundCommand.CompileTimeSatement);
    };
    timeStatementWorker.postMessage(message);
}

function sendBackUnknownCmdError(communication: Communication) {
    // explicitly break the messaging contract since, there is no command to send back
    communication.portToCs.postMessage({
        error: {
            message: constStrings.errorMsgs.invalidCommand,
        },
    });
}

/**
 * Makes multiple checks on the MessageEvent data and calls the callback function with the overtime.
 * The given MessageEvent can contain an error message in the form of `error: { message: string }`
 * in which case any `originalError`s will be printed and an error response will be sent on the port.
 * If the MessageEvent data has the `action` attribute the callback function wont be called either.
 * If the overtime is in the data then the callback will be called with the overtime.
 * @param communication    the communication instance to send messages with
 * @param message          the message which to check for errors and the overtime
 * @param command          the command to send as a response on the port
 * @param callback         will be called once the overtime was found in the MessageEvent data
 * @TODO reevaluate if this message/communication can't use the message object type
 */
function checkForOvertime(
    communication: Communication,
    message: MessageEvent,
    command: BackgroundCommand,
    callback: (overtime: number) => void,
) {
    const receivedData: unknown = message.data;

    if (isErrorData(receivedData)) {
        // an error was caught, forward the message
        communication.postCsMessage(command, receivedData);
        printPossibleError(receivedData);
        return;
    }
    if (typeof receivedData === 'object' && receivedData !== null && 'action' in receivedData) {
        // the pdf worker sends a ready message which is caught by this check
        if (receivedData.action !== 'ready') {
            console.error('A message with action was sent which is not the ready action:');
            console.error(message);
            communication.postWorkerError(command);
        }
        return; // pdf worker only notified that it is ready, nothing to do
    }
    if (
        typeof receivedData !== 'object' ||
        receivedData === null ||
        !('overtime' in receivedData) ||
        typeof receivedData.overtime !== 'number'
    ) {
        // should not happen
        console.error('Received an unexpected response from time time statement worker:');
        console.error(message);
        communication.postWorkerError(command);
        return;
    }

    callback(receivedData.overtime);
    communication.postCsMessage(command);
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
