import * as browser from 'webextension-polyfill';
import { Runtime } from 'webextension-polyfill';
import { BackgroundCommand } from '../../common/enums/command';
import { givenStrings, globalFlags } from './constants.js';

export default class Communication {
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

    // TODO use constants module, allow custom time, better body formatting
    public static async downloadWorkingTimes(): Promise<void> {
        // ===== Proof of Concept Fetching API directly =====
        const urlPath = '/sap/opu/odata/sap/HCM_TIMESHEET_MAN_SRV/$batch?sap-client=300';
        const csrfResponse = await fetch(
            new Request(window.location.origin + urlPath, {
                method: 'HEAD',
                credentials: 'include',
                headers: {
                    'x-csrf-token': 'Fetch',
                },
            }),
        );
        const possibleCsrfToken = csrfResponse.headers.get('x-csrf-token');
        let csrfToken: string;
        if (possibleCsrfToken) csrfToken = possibleCsrfToken;
        else return;

        const result = await fetch(
            new Request(window.location.origin + urlPath, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'x-csrf-token': csrfToken,
                    Priority: 'u=4',
                    Pragma: 'no-cache',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'multipart/mixed;boundary=batch',
                },
                body: `--batch
Content-Type: application/http
Content-Transfer-Encoding: binary

GET TimeDataList?sap-client=300&$filter=StartDate%20eq%20%2720240729%27%20and%20EndDate%20eq%20%2720240731%27 HTTP/1.1
Accept: application/json
X-CSRF-Token: ${csrfToken}
DataServiceVersion: 2.0
MaxDataServiceVersion: 2.0
X-Requested-With: XMLHttpRequest


--batch--`,
            }),
        );
        console.log(result);
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
