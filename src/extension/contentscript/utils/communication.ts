import * as browser from 'webextension-polyfill';
import { Runtime } from 'webextension-polyfill';
import { BackgroundCommand } from '../../common/enums/command';
import { givenStrings, globalFlags } from './constants.js';

export class Communication {
    // =========== Communication with backend ===========
    // ==================================================

    private static portToBackground: Runtime.Port | undefined;

    /**
     * Sends a message to the background script. The response from the background script will be returned.
     * Depending on the command this will be a string with different content.
     * @param command    the command to send to the background script
     * @param content    the content to send to the background script
     * @returns string with the response for the command
     */
    public static async sendMsgToBackground(command: BackgroundCommand): Promise<string> {
        return new Promise((resolve) => {
            if (this.portToBackground == undefined) {
                this.portToBackground = browser.runtime.connect(); // buid connection if not already established

                this.portToBackground.onDisconnect.addListener(() => {
                    // delete when connnection gets disconnected
                    this.portToBackground = undefined;
                });
            }

            // connection has been established
            this.portToBackground.onMessage.addListener((response) => {
                // check if the response is a response for this request
                if (response?.command === command) {
                    // resolve as reformated response including any errors or with the reponsecontent at top level
                    response?.error ? resolve(response) : resolve(response.response);
                }
            });
            this.portToBackground.postMessage({ command: command });
        });
    }

    /**
     * Contacts the Github API to check if there are newer versions online. The version is compared to
     * the browser extension version.
     * @returns true if the extension is outdated
     */
    public static async checkVersionOutdated(): Promise<boolean> {
        globalFlags.versionCheckFinished = false;
        const localBrowserVersion = browser.runtime.getManifest().version;

        let onlineVersion;
        try {
            onlineVersion = await fetch(givenStrings.githubAPIURL); // get latest release data from github
            onlineVersion = await onlineVersion.json();
        } catch (e) {
            console.log(e);
            globalFlags.versionCheckFinished = true;
            return false; // don't compare versions since online version not available
        }
        if (onlineVersion?.tag_name) {
            onlineVersion = onlineVersion.tag_name.toLowerCase().replace('v', ''); // get only the number string
        }

        // one of the versions is not available
        if (typeof onlineVersion != 'string' || !localBrowserVersion) {
            globalFlags.versionCheckFinished = true;
            return false;
        } 

        // compare strings to compare version numbers
        const resultBrowser = localBrowserVersion.localeCompare(onlineVersion, undefined, {
            numeric: true,
            sensitivity: 'base',
        });

        if (resultBrowser == -1) {
            // browser extension version is outdated
            globalFlags.versionCheckFinished = true;
            return true;
        }

        globalFlags.versionCheckFinished = true;
        return false;
    }
};
