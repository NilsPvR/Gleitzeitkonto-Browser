import { OffscreenCommand } from '../enums/offscreenCommand';
import { OffscreenTarget } from '../enums/offscreenTarget';
// disable this rule since a type checking on the chrome variable would not make much sense
// we just don't have any types for Chromium specific features
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any;

const workerMap: Map<string, Worker> = new Map();
/**
 * Worker URLs are given as a root path but the offscreen script is located two folders
 * down which would result in invalid relative paths. Prepend this to correct the path.
 */
const RELATIVE_TO_ROOT_PATH = '../../';

async function handleBackgroundMessage(message: unknown) {
    if (
        typeof message !== 'object' ||
        !message ||
        !('target' in message) ||
        message.target !== OffscreenTarget.Offscreen
    ) {
        return; // the message is meant for someone else
    }

    if (
        !('command' in message) ||
        !('workerURL' in message) ||
        typeof message.workerURL !== 'string'
    ) {
        return; // TODO send error response
    }
    switch (message.command) {
        case OffscreenCommand.CreateWebWorker:
            await tryCreateWebWorker(message.workerURL);
            break;

        case OffscreenCommand.RelayMessage:
            if (!('data' in message)) {
                return; // TODO send error response
            }
            relayMessage(message.workerURL, message.data);
            break;

        default:
            // TODO send error response
            break;
    }
}

async function handleWorkerMessage(workerURL: string, message: MessageEvent) {
    chrome.runtime.sendMessage({
        target: OffscreenTarget.Backgroundscript,
        workerURL: workerURL,
        // wrap the message data in a new object since the MessageEvent can't be serialized
        // this will cause the backgroundscript to not receive a full MessageEvent, but the
        // backgroundscript is only using the data
        data: { data: message.data },
    });
}

async function tryCreateWebWorker(workerURL: string) {
    if (workerMap.has(workerURL)) {
        // already exists -> don't create a new one
        return;
    }

    const newWorker = new Worker(RELATIVE_TO_ROOT_PATH + workerURL);
    workerMap.set(workerURL, newWorker); // save worker for later
    newWorker.onmessage = (workerMessage: MessageEvent) => {
        handleWorkerMessage(workerURL, workerMessage); // register listener
    };
}

async function relayMessage(workerURL: string, message: unknown) {
    if (!workerMap.has(workerURL)) {
        // TODO send error response, message can't be relayed to non existant worker
        return;
    }

    const currentWorker = workerMap.get(workerURL);
    if (!currentWorker || typeof currentWorker !== 'object') {
        return; // TODO send error message
    }
    currentWorker.postMessage(message);
}

chrome.runtime.onMessage.addListener(handleBackgroundMessage);
