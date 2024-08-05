const browser = require('webextension-polyfill');
const { constStrings, givenStrings, globalFlags } = require('./constants.js');

module.exports = class Communication {
    // =========== Communication with backend ===========
    // ==================================================

    portToBackground = null;

    /**
     * Sends a message to the background script which will normally be forwarded to the CompanionApp.
     * The response from the background script will be returned. Depending on the command this can
     * be an object or a string with different content.
     * @param command   String - the command to send to the background script, one of ['downloadworkingtimes',
     * 'calculatefromworkingtimes', 'waitfordownload', 'version']
     * @returns     Promise<Object | String> - resolves to a object or string with the response for the command
     */
    async sendMsgToBackgroundS(command) {
        return new Promise((resolve) => {
            if (!this.portToBackground) {
                this.portToBackground = browser.runtime.connect(); // buid connection if not already established

                this.portToBackground.onDisconnect.addListener(() => {
                    // delete when connnection gets disconnected
                    this.portToBackground = null;
                });
            }

            // connection has been established
            this.portToBackground.onMessage.addListener((response) => {
                // check if the response is a response for this request
                if (response?.command === command.toLowerCase()) {
                    // resolve as reformated response including any errors or with the reponsecontent at top level
                    response?.error ? resolve(response) : resolve(response.response);
                }
            });
            this.portToBackground.postMessage({ command: command });
        });
    }

    /**
     * Contacts the CompanionApp via the background script to download the latest working times and calculate
     * the resulting kontoData. A kontoData object will be returned containing the working times data or an error with
     * messsage and status code.
     * @returns Promise<Obejct> - Resolves to object containing informationen about the Gleitzeitkonto in the form of:
     * { kontoString: "1h 15min", kontoInMin: "75", lastDate: "DD.MM.YYYY"} or if something went wrong
     * { error: { message: "errorMessage", statusCode?: INT } }
     * StatusCodes are  1 - 4 and based on gleitzeitkonto-api.downloadWorkingTimes()
     */
    async getDownloadKontoData() {
        globalFlags.downloadFinished = false;

        let response = await this.sendMsgToBackgroundS(givenStrings.downloadCommand);
        let kontoData = {};

        // -- Check StatusCode of Download --
        if (response == -1) {
            response = await this.sendMsgToBackgroundS(givenStrings.waitForDownlodCommand); // other request still downloading
        }

        if (response == 1) {
            kontoData.error = { message: constStrings.errorMsgs.incorrectPath, statusCode: 1 };
        } else if (response == 2) {
            kontoData.error = { message: constStrings.errorMsgs.notInNetwork, statusCode: 2 };
        } else if (response == 3) {
            kontoData.error = { message: constStrings.errorMsgs.tooManyCSV, statusCode: 3 };
        } else if (response == 4) {
            kontoData.error = { message: constStrings.errorMsgs.unknownAPI, statusCode: 4 };
        } else if (response == 0) {
            // success
            // since download only returns statusCode calculate afterwards
            kontoData = await this.sendMsgToBackgroundS(givenStrings.calcaulteCommand);
        } else if (response?.error?.message) kontoData = response; // sendMsgToBackgroundS gave an error

        globalFlags.downloadFinished = true;
        return kontoData;
    }

    // returns promise - int <0, 1, 2>
    // 0 version not outdated or couldn't check
    // 1 browser extension outdated
    // 2 companionapp outdated
    async checkVersionOutdated() {
        globalFlags.versionCheckFinished = false;
        const localBrowserVersion = browser.runtime.getManifest().version;

        let localCompanionAppVersion = await this.sendMsgToBackgroundS(
            givenStrings.versionCommand,
        ); // get version obj
        if (localCompanionAppVersion?.version) {
            localCompanionAppVersion = localCompanionAppVersion.version; // get version string out of object
        }

        let onlineVersion;
        try {
            onlineVersion = await fetch(givenStrings.githubAPIURL); // get latest release data from github
            onlineVersion = await onlineVersion.json();
        } catch (e) {
            console.log(e);
            globalFlags.versionCheckFinished = true;
            return 0; // don't compare versions since online version not available
        }
        if (onlineVersion?.tag_name) {
            onlineVersion = onlineVersion.tag_name.toLowerCase().replace('v', ''); // get only the number string
        }

        // one of the versions is not available
        if (
            typeof onlineVersion != 'string' ||
            !localBrowserVersion ||
            typeof localCompanionAppVersion != 'string'
        )
            return 0;

        // compare strings to compare version numbers
        const resultBrowser = localBrowserVersion.localeCompare(onlineVersion, undefined, {
            numeric: true,
            sensitivity: 'base',
        });
        const resultCompanionApp = localCompanionAppVersion.localeCompare(
            onlineVersion,
            undefined,
            { numeric: true, sensitivity: 'base' },
        );

        if (resultBrowser == -1) {
            // browser extension version is outdated
            globalFlags.versionCheckFinished = true;
            return 1;
        } else if (resultCompanionApp == -1) {
            // companionapp version is outdated
            globalFlags.versionCheckFinished = true;
            return 2;
        }

        globalFlags.versionCheckFinished = true;
        return 0;
    }
}