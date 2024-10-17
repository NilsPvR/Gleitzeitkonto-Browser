import browser from 'webextension-polyfill';
import { OffscreenCommand } from '../enums/offscreenCommand';
import { OffscreenTarget } from '../enums/offscreenTarget';
// disable this rule since a type checking on the chrome variable would not make much sense
// we just don't have any types for Chromium specific features
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any;

// paths are not relative but start at the extension folder (build output)
const OFFSCREEN_DOCUMENT_PATH = 'backgroundscript/chromium/offscreen.html';

/**
 * Allows easy usage of workers in Firefox and Chromium browsers.
 */
export default class CompatabilityLayer {
    public static creating: Promise<void> | null; // a global promise to avoid concurrency issues

    /**
     * Creates a Worker when available or starts a Worker in an offscreen page alternatively.
     * Messages from the offscreen worker will not respond with full MessageEvents but only the
     * data attribute, e.g. `{ data: 'any data' }`
     * @returns a new Worker or WorkerWrapper
     * @see WorkerWrapper
     */
    public static async CreateWorker(scriptURL: string): Promise<Worker> {
        if (typeof Worker !== 'undefined') {
            // workers are available
            return new Worker(scriptURL);
        }

        // will only happen in a Chromium context
        await this.setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

        return new WorkerWrapper(scriptURL);
    }

    /**
     * Makes sure the offscreen document is created. Should only be called in a Chromium context
     * since the `chrome` variable will be used.
     * @see https://developer.chrome.com/docs/extensions/reference/api/offscreen#maintain_the_lifecycle_of_an_offscreen_document
     */
    public static async setupOffscreenDocument(path: string) {
        // check all windows controlled by the service worker to see if one
        // of them is the offscreen document with the given path
        const offscreenUrl = browser.runtime.getURL(path);

        const existingContexts = await chrome.runtime.getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT'],
            documentUrls: [offscreenUrl],
        });

        if (existingContexts.length > 0) {
            return;
        }

        // create offscreen document
        if (CompatabilityLayer.creating) {
            await CompatabilityLayer.creating;
        } else {
            CompatabilityLayer.creating = chrome.offscreen.createDocument({
                url: path,
                reasons: [chrome.offscreen.Reason.WORKERS],
                justification: 'Create Workers to optimize extension performance.',
            });
            await CompatabilityLayer.creating;
            CompatabilityLayer.creating = null;
        }
    }
}

/**
 * Wraps an offscreen page with a web worker in a way where it is usable as a normal web worker.
 * Should only be used in a Chromium context. The offscreen page has to be initialized before using
 * this class.
 * Not all Worker methods and attributes are fully implemented.
 */
class WorkerWrapper implements Worker {
    /** The onmessage will not receive a full MessageEvent but only the data attribute */
    public onmessage: ((this: Worker, event: MessageEvent) => unknown) | null = null;
    public onerror: ((this: AbstractWorker, event: ErrorEvent) => unknown) | null = null;
    public onmessageerror: ((this: Worker, ev: MessageEvent) => unknown) | null = null;

    /** Used to create the web worker and to send any messages to the correct worker */
    private workerURL: string;

    constructor(workerURL: string) {
        this.workerURL = workerURL;

        // register the event handler for a response
        // bind the `this` context so that it doesn't get lost/deleted
        chrome.runtime.onMessage.addListener(this.handleOffscreenResponse.bind(this));

        // create the new worker in the offscreen page
        chrome.runtime.sendMessage({
            target: OffscreenTarget.Offscreen,
            workerURL: this.workerURL,
            command: OffscreenCommand.CreateWebWorker,
        });
    }

    public postMessage(message: unknown) {
        chrome.runtime.sendMessage({
            target: OffscreenTarget.Offscreen,
            workerURL: this.workerURL,
            command: OffscreenCommand.RelayMessage,
            data: message,
        });
    }

    public terminate() {
        throw new Error('This method is not implemented!');
    }

    // prettier-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public addEventListener<K extends keyof WorkerEventMap>(type: K, listener: (this: Worker, ev: WorkerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    // prettier-ignore
    public addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public addEventListener(type: unknown, listener: unknown, options?: unknown): void {
        throw new Error('This method is not implemented!');
    }

    // prettier-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public removeEventListener<K extends keyof WorkerEventMap>(type: K, listener: (this: Worker, ev: WorkerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    // prettier-ignore
    public removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public removeEventListener(type: unknown, listener: unknown, options?: unknown): void {
        throw new Error('This method is not implemented!');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public dispatchEvent(event: Event): boolean {
        throw new Error('This method is not implemented!');
    }

    private handleOffscreenResponse(message: unknown): undefined {
        if (
            typeof message !== 'object' ||
            !message ||
            !('target' in message) ||
            message.target !== OffscreenTarget.Backgroundscript ||
            !('workerURL' in message) ||
            message.workerURL !== this.workerURL
        ) {
            return; // the message is meant for someone else
        }
        if (!('data' in message) || typeof message.data !== 'object' || !message.data) {
            return; // TODO send error message
        }

        if (this.onmessage) {
            /* TODO Error, messages are sent to often or caught to often which causes the extension to attempt to
             use a disconnected port */

            // we can be quite certain that the data is now a MessageEvent (or at least has the data we want)
            this.onmessage(<MessageEvent>message.data);
        }
        return undefined;
    }
}
