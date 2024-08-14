import * as browser from 'webextension-polyfill';
import { Runtime } from 'webextension-polyfill';
import { BackgroundCommand } from '../../common/enums/command';
import { constStrings, givenStrings } from './constants';
import Formater from './format';
import { AccountData, ErrorData } from '../types/accountData';

export default class Communication {
    // =========== Communication with backend ===========
    // ==================================================

    private static portToBackground: Runtime.Port | undefined;

    /**
     * Sends a message to the background script. The response from the background script will be returned.
     * Depending on the command this will be a string with different content.
     * @param command    the command to send to the background script
     * @param content    the content to send to the background script
     * @returns a response for the command
     */
    public static async sendMsgToBackground(
        command: BackgroundCommand,
        content: string,
    ): Promise<object> {
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
                    resolve(response);
                }
            });
            this.portToBackground.postMessage({ command: command, content: content });
        });
    }

    /**
     * Sends the given data to the background script to calculate the overtime.
     * @param data    the data to calculate overtime from, is expected to be in the format received by the API
     * @returns the calculated account data or an error message object
     */
    public static async calculateOvertime(data: string): Promise<AccountData | ErrorData> {
        const response = await this.sendMsgToBackground(BackgroundCommand.CalculateOvertime, data);

        if (
            'error' in response &&
            typeof response.error == 'object' &&
            response.error &&
            'message' in response.error
        ) {
            return <ErrorData>response;
        }
        if ('accountString' in response) {
            return <AccountData>response;
        }

        return { error: { message: constStrings.errorMsgs.unexpectedBackgroundResponse } };
    }

    /**
     * Contacts the API to get the current CSRF token. The token can be used to
     * make future POST requests to the API.
     * @returns the CSRF token
     * @throws if the token is not sent by the API
     */
    private static async fetchCSRFToken(): Promise<string> {
        const csrfResponse = await fetch(
            new Request(window.location.origin + givenStrings.timesheetURLPath, {
                method: 'HEAD',
                credentials: 'include',
                headers: {
                    'x-csrf-token': 'Fetch',
                },
            }),
        );
        const csrfToken = csrfResponse.headers.get('x-csrf-token');
        if (csrfToken) return csrfToken;

        throw new Error('Unable to fetch CSRF-Token');
    }

    /**
     * Contacts the API to get the working times response string. The given start- and enddate
     * will be used for the request. The response string will be the data returned by the api. This data
     * contains the working times but has to be formatted to be able to use them.
     * @param startDate    the first day to fetch working times for (time is ignored)
     * @param endDate      the last date to fetch working times for, has to be after `startDate` (time is ignored)
     * @returns an unformatted response string with the working times
     * @throws if the endDate is not after the startDate
     * @throws if communication error with api occurs
     */
    public static async fetchWorkingTimes(startDate: Date, endDate: Date): Promise<string> {
        if (startDate >= endDate || startDate.getDate() >= endDate.getDate()) {
            throw new Error('End date is not after start date');
        }
        const csrfToken = this.fetchCSRFToken();

        const start = Formater.formatDateToYYYYMMDD(startDate);
        const end = Formater.formatDateToYYYYMMDD(endDate);
        const requestBody =
            '--batch\n' +
            'Content-Type: application/http\n' +
            'Content-Transfer-Encoding: binary\n' +
            '\n' +
            `GET TimeDataList?sap-client=300&$filter=StartDate%20eq%20%27${start}%27%20and%20EndDate%20eq%20%27${end}%27 HTTP/1.1\n` +
            'Accept: application/json\n' +
            `X-CSRF-Token: ${await csrfToken}\n` +
            'DataServiceVersion: 2.0\n' +
            'MaxDataServiceVersion: 2.0\n' +
            'X-Requested-With: XMLHttpRequest\n' +
            '\n\n' +
            '--batch--';

        const result = await fetch(
            new Request(window.location.origin + givenStrings.timesheetURLPath, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'x-csrf-token': await csrfToken,
                    Priority: 'u=4',
                    Pragma: 'no-cache',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'multipart/mixed;boundary=batch',
                },
                body: requestBody,
            }),
        );

        if (!result.ok) {
            throw new Error('Unexpected API response! Received status code: ' + result.status);
        }
        return result.text();
    }

    /**
     * Contacts the Github API to check if there are newer versions online. The version is compared to
     * the browser extension version.
     * @returns true if the extension is outdated
     */
    public static async checkVersionOutdated(): Promise<boolean> {
        const localBrowserVersion = browser.runtime.getManifest().version;

        let onlineVersion;
        try {
            onlineVersion = await fetch(givenStrings.githubAPIURL); // get latest release data from github
            onlineVersion = await onlineVersion.json();
        } catch (e) {
            console.log(e);
            return false; // don't compare versions since online version not available
        }
        if (onlineVersion?.tag_name) {
            onlineVersion = onlineVersion.tag_name.toLowerCase().replace('v', ''); // get only the number string
        }

        // one of the versions is not available
        if (typeof onlineVersion != 'string' || !localBrowserVersion) {
            return false;
        }

        // compare strings to compare version numbers
        const resultBrowser = localBrowserVersion.localeCompare(onlineVersion, undefined, {
            numeric: true,
            sensitivity: 'base',
        });

        if (resultBrowser == -1) {
            // browser extension version is outdated
            return true;
        }

        return false;
    }
}
