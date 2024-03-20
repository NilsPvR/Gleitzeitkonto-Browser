const url = require('./url.json');
const browser = require('webextension-polyfill');

module.exports = class GleitzeitkontoBrowser {
    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Config <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
    constructor () {
        this.config = {
            primaryColors: {
                "dunkelblau":   "#003869",
                "mittelblau":   "#5aa6e7",
                "gelb":         "#fbd200",
                "grau":         "#f5f5f5",
            },
            gleitzeitKontoColors: {
                blue: "#00aab4",
                grey: "#222222",
            },
            maxPageloadingLoops: 120, // 2 minutes
        };

        
        // Check if extern or intern Fiori website, since these have different amounts of icons    
        if (window.location.origin == url) { // Internal Fiori
            this.config.siteVersion = 'internal';
            this.config.sideDistance = '11rem'; // css margin from the right for floating display
        }
        else { // extern
            this.config.siteVersion = 'external';
            this.config.sideDistance = '9rem';
        }

        this.constStrings = {
            floatingDisplayID: 'gleitzeitkonto-canvas-headline',
            insertedDisplayID: 'gleitzeitkonto-display',
            cssID: 'gleitzeitkonto-css',
            buttonID: 'gleitzeitkonto-reload-button',
            refreshIconID: 'refresh-icon',
            prefixOvertime: 'Gleitzeitkonto: ',
            prefixError: 'Fehler: ',
            overtimeLoading: 'Loading...',
            errorMsgs: {
                keineDatenVonCompanionApp: 'Keine Daten von der CompanionApp erhalten.',
                pageloadingtimeExceeded: 'Die Seite hat zu lange geladen. Das Gleitzeitkonto kann nicht angezeigt werden.',
                incorrectPath: 'Falscher Browser-Pfad für die API. Bitte Einstellungen im Popup anpassen.', // code 1
                notInNetwork: 'Nicht im BTC Netz - Du musst mit LAN oder dem BTC-Office-WLAN verbunden sein.', // code 2
                tooManyCSV: 'Zu viele CSV-Dateien im Ordner der API. Bitte Dateien manuell löschen.', // code 3
                unknownAPI: 'Unbekannter Fehler der API.', // code 4
                unknown: 'Unbekannter Fehler.',
                extensionOutdated: 'Bitte die Erweiterung aktualisieren!',
                companionAppOutdated: 'Bitte die CompanionApp aktualisieren!'
            }
        };

        // Strings defined by external third parties, e.g. Fiori 
        this.givenStrings = {
            gleitzeitHash: '#btccatstime-create',
            headerID: 'shell-header',
            headerEndID: 'shell-header-hdr-end',
            downloadCommand: 'downloadWorkingTimes',
            calcaulteCommand: 'calculateFromWorkingTimes',
            waitForDownlodCommand: 'waitfordownload',
            versionCommand: 'version',
            githubAPIURL: 'https://api.github.com/repos/NilsPvR/Gleitzeitkonto-Browser/releases/latest',
        };

        this.portToBackground = null;

        this.globalFlags = {
            calculateFromCachedFinished: false,
            downloadFinished: false,
            versionCheckFinished: false
        }
    }

    /* ==========================================================================================
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Functions <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */


    // ============ Main action taking funcitons =============
    // =======================================================

    // Update the display continuously for as long as the script is loaded
    // It is asumed that the page has already loaded completely
    async updateInsertedDisplayOnChange (pHeaderBar, promiseCalcKontoData, promiseDownloadKontoData, promiseOutdatedIndex) {

        const placeOrRemoveInsertedDisplay = async () => {
            // When correct page is open and the display doesn't already exist
            if (this.checkCorrectMenuIsOpen() && !this.getInsertedDisplay()) {
                const latestDisplayFormat = await this.getLatestDisplayFormat(promiseCalcKontoData, promiseDownloadKontoData, promiseOutdatedIndex);
                this.addInsertedDisplay(pHeaderBar, latestDisplayFormat.text, latestDisplayFormat.loading);
            }
            else if (!this.checkCorrectMenuIsOpen()) {
                // This will also be removed by Fiori but keep remove just in case this behaviour gets changed
                this.removeInsertedDisplay();
            }
        }

        window.addEventListener('hashchange', async () => {
            await placeOrRemoveInsertedDisplay();
        });

        // Check if the HeaderBar is being manipulated -> Fiori does sometimes remove the inserted display
        const observer = new MutationObserver(async () => {
            await placeOrRemoveInsertedDisplay();
        });

        // add the display to make sure the observer can actually observe something and the display isn't already removed
        await placeOrRemoveInsertedDisplay();

        observer.observe(pHeaderBar, { 
            // config
            attrtibutes: false,
            childList: true,
            subtree: true,
        });
    };

    // called from the reload btn, recalculates the Gleitzeitkontos
    reloadGleitzeitKonto () {
        this.startLoading(); // start loading immediately

        // == Start new requests ==
        this.globalFlags.calculateFromCachedFinished = false;
        const promiseCalcKontoData = this.sendMsgToBackgroundS(this.givenStrings.calcaulteCommand);
        promiseCalcKontoData.then(() => this.globalFlags.calculateFromCachedFinished = true);
        const promiseDownloadKontoData = this.getDownloadKontoData();

        // == Register actions for promises resolving ==
        promiseCalcKontoData.then(async () => this.updateDisplay(await this.getLatestDisplayFormat(promiseCalcKontoData, promiseDownloadKontoData)));
        promiseDownloadKontoData.then(async () => this.updateDisplay(await this.getLatestDisplayFormat(promiseCalcKontoData, promiseDownloadKontoData)));
    };


    // ========== Checking and waiting for correct page ===========
    // ============================================================

    // promise resolves with headerbar html object when page 'fully' loaded
    // promise rejects with error message when page couldn't load after timeout
    async waitForPageLoad () {
        return new Promise((resolve, reject) => {
            let loops = 0; // track how often checkPageLoaded ran

            // loop to check once the page has actually loaded
            // -> this is determined by checking if the headerbar of the page is available
            const checkPageLoaded = setInterval(async () => {
                loops++;
                const headerBar = document.getElementById(this.givenStrings.headerEndID); // the conatiner in which to place the inserted display
    
                if (headerBar) {
                    clearInterval(checkPageLoaded);
                    resolve(headerBar);
                }
                else if (loops > this.config.maxPageloadingLoops) { // page loaded too long
                    clearInterval(checkPageLoaded);
                    reject(this.constStrings.errorMsgs.pageloadingtimeExceeded);
                }
            }, 1000); // will be limited to min. 1000 when tab not focused
        })
    };

    /**
     * Checks if the user is on the "Meine Zeiterfassung" page. This is possible
     * by checking the hash or the url (the part after #)
     * @returns     Boolean - true if the user in on "Meine Zeiterfassung" page
     */
    checkCorrectMenuIsOpen () {
        if (window.location.hash.startsWith(this.givenStrings.gleitzeitHash)) {
            return true;
        }
        return false;
    };

    /**
     * Waits until the user opens the "Meine Zeiterfassung" page. The promise will
     * resolve with no data once the site is opened. 
     * @returns     Promise<> - resolves once the "Meine Zeiterfassung" page is opened
    */
    async continuousMenucheck () {
        if (this.checkCorrectMenuIsOpen()) {
            return true;
        }

        return new Promise((resolve) => {
            const onHashChange = window.addEventListener('hashchange', () => {

                if (this.checkCorrectMenuIsOpen()) {
                    window.removeEventListener('hashchange', onHashChange);
                    resolve(true);
                }
                // else nothing happens and we wait for the next change
            });
        });
    };


    // =========== Communication with backend ===========
    // ==================================================

    /**
     * Sends a message to the background script which will normally be forwarded to the CompanionApp.
     * The response from the background script will be returned. Depending on the command this can 
     * be an object or a string with different content.
     * @param command   String - the command to send to the background script, one of ['downloadworkingtimes', 
     * 'calculatefromworkingtimes', 'waitfordownload', 'version']
     * @returns     Promise<Object | String> - resolves to a object or string with the response for the command
     */
    async sendMsgToBackgroundS (command) {
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
    };

    /**
     * Contacts the CompanionApp via the background script to download the latest working times and calculate
     * the resulting kontoData. A kontoData object will be returned containing the working times data or an error with 
     * messsage and status code.
     * @returns Promise<Obejct> - Resolves to object containing informationen about the Gleitzeitkonto in the form of: 
     * { kontoString: "1h 15min", kontoInMin: "75", lastDate: "DD.MM.YYYY"} or if something went wrong
     * { error: { message: "errorMessage", statusCode?: INT } }
     * StatusCodes are  1 - 4 and based on gleitzeitkonto-api.downloadWorkingTimes()
     */
    async getDownloadKontoData () {
        this.globalFlags.downloadFinished = false;

        let response = await this.sendMsgToBackgroundS(this.givenStrings.downloadCommand);
        let kontoData = {};

        // -- Check StatusCode of Download --
        if (response == -1) response = await this.sendMsgToBackgroundS(this.givenStrings.waitForDownlodCommand); // other request still downloading

        if (response == 1) kontoData.error = { message: this.constStrings.errorMsgs.incorrectPath, statusCode: 1 }
        else if (response == 2) kontoData.error = { message: this.constStrings.errorMsgs.notInNetwork, statusCode: 2 }
        else if (response == 3) kontoData.error = { message: this.constStrings.errorMsgs.tooManyCSV, statusCode: 3 }
        else if (response == 4) kontoData.error = { message: this.constStrings.errorMsgs.unknownAPI, statusCode: 4 }
        else if (response == 0) { // success
            // since download only returns statusCode calculate afterwards
            kontoData = await this.sendMsgToBackgroundS(this.givenStrings.calcaulteCommand);
        }
        else if (response?.error?.message) kontoData = response // sendMsgToBackgroundS gave an error

        this.globalFlags.downloadFinished = true;
        return kontoData;
    };

    // returns promise - int <0, 1, 2>
    // 0 version not outdated or couldn't check
    // 1 browser extension outdated
    // 2 companionapp outdated
    async checkVersionOutdated () {
        this.globalFlags.versionCheckFinished = false;
        const localBrowserVersion = browser.runtime.getManifest().version;

        let localCompanionAppVersion = await this.sendMsgToBackgroundS(this.givenStrings.versionCommand); // get version obj
        if (localCompanionAppVersion?.version) localCompanionAppVersion = localCompanionAppVersion.version; // get version string out of object

        let onlineVersion;
        try {
            onlineVersion = await fetch(this.givenStrings.githubAPIURL); // get latest release data from github
            onlineVersion = await onlineVersion.json();
        } catch (e) {
            console.log(e);
            this.globalFlags.versionCheckFinished = true;
            return 0; // don't compare versions since online version not available
        }
        if (onlineVersion?.tag_name) onlineVersion = onlineVersion.tag_name.toLowerCase().replace('v', ''); // get only the number string

        // one of the versions is not available
        if (typeof onlineVersion != 'string' || !localBrowserVersion  || typeof localCompanionAppVersion != 'string') return 0;

        // compare strings to compare version numbers
        const resultBrowser = localBrowserVersion.localeCompare(onlineVersion, undefined, { numeric: true, sensitivity: 'base' });
        const resultCompanionApp = localCompanionAppVersion.localeCompare(onlineVersion, undefined, { numeric: true, sensitivity: 'base' });

        if (resultBrowser == -1 ) { // browser extension version is outdated
            this.globalFlags.versionCheckFinished = true;
            return 1;
        } else if (resultCompanionApp == -1) { // companionapp version is outdated
            this.globalFlags.versionCheckFinished = true;
            return 2;
        }
        
        this.globalFlags.versionCheckFinished = true;
        return 0;
    };


    // =============== Data formatting ==================
    // ==================================================

    /**
     * Format the given kontoData object to a string which can be displayed. The object is expected to have either kontoData
     * or an error message however if neither of those is available a custom error string will be returned.
     * @param kontoData     Object - holding the kontostring or an error message, expected to have a form of:
     * { kontoString: "string"} or { error: { message: "errorMessage" } }
     * @returns     String - the formatted string derived from the given kontoData object
     */
    formatDisplayText (kontoData) {
        if (kontoData?.error?.message) return this.constStrings.prefixError + kontoData.error.message; // Error occured
        if (!kontoData || !kontoData.kontoString) return this.constStrings.prefixError + this.constStrings.errorMsgs.keineDatenVonCompanionApp; // No Data
        else return this.constStrings.prefixOvertime + kontoData.kontoString;
    };

    // using the global flags the function detemines the latest data which can be shown in the display
    // returns { text: string, laoding: boolean }
    // promiseOutdatedIndex is optional
    async getLatestDisplayFormat (promiseCalcKontoData, promiseDownloadKontoData, promiseOutdatedIndex) {
        if (this.globalFlags.versionCheckFinished && await promiseOutdatedIndex != 0) { // version outdated has highest priority
            if (await promiseOutdatedIndex == 1) {
                return { text: this.constStrings.prefixError + this.constStrings.errorMsgs.extensionOutdated, loading: false }
            }
            else if (await promiseOutdatedIndex == 2) {
                return { text: this.constStrings.prefixError + this.constStrings.errorMsgs.companionAppOutdated, loading: false };
            }
        }
        if (this.globalFlags.downloadFinished) { // download availability has higher priority than calculate
            return  { text: this.formatDisplayText(await promiseDownloadKontoData), loading: false };
        }
        if (this.globalFlags.calculateFromCachedFinished) {
            return { text: this.formatDisplayText(await promiseCalcKontoData), loading: true };
        }
         // no data to show
        return { text: this.constStrings.prefixOvertime + this.constStrings.overtimeLoading, loading: true };
    };


    // ========= Changes on Gleitzeitkonto-Display ========
    // ====================================================

    // ========== floating display ==========
    
    addFloatingDisplay (pDisplayText, loading) {
        const HTMLElements = this.getInnerHTMLElements(pDisplayText, loading, false);
        const canvas = document.getElementById('canvas'); // main page element is the (almost) only one loaded when DOM is loaded

        canvas.insertAdjacentElement('beforebegin',
            this.createRichElement('div', {
                class: `floating-display ${this.config.siteVersion} ${this.getLightingMode()}`,
                id: this.constStrings.floatingDisplayID,
                style: loading ? ' opacity: 0.5;' : ''
                },
                ...HTMLElements, // spread syntax to expand array
            )
        );
    };

    getFloatingDisplay () {
        return document.getElementById(this.constStrings.floatingDisplayID);
    };

    // remove the display
    removeFloatingDisplay () {
        const oldDisplay = this.getFloatingDisplay();
        if (oldDisplay) oldDisplay.remove(); // delete the old display
    };

    // ========== inserted display ==========

    addInsertedDisplay (pHeaderBar, pDisplayText, loading) {
        this.removeFloatingDisplay();

        const HTMLElements = this.getInnerHTMLElements(pDisplayText, loading, true);

        pHeaderBar.prepend(this.createRichElement('div', {
            class: `inserted-display ${this.config.siteVersion} ${this.getLightingMode()}`,
            id: this.constStrings.insertedDisplayID,
            style: loading ? ' opacity: 0.5;' : ''
            },
            ...HTMLElements, // spread syntax to expand array
        ));
        // readd reload event listener
        document.getElementById(this.constStrings.refreshIconID).addEventListener('click', () => { this.reloadGleitzeitKonto() });
    };

    getInsertedDisplay () {
        return document.getElementById(this.constStrings.insertedDisplayID);
    };

    removeInsertedDisplay () {
        const previousInsertedDisplay = this.getInsertedDisplay();
        if (previousInsertedDisplay) {
            previousInsertedDisplay.remove();
        }
    };

    // ========== For both displays ==========

    /**
     * Creates a new HTML Element with the specified attributes and the content placed inside
     * @param tagName       String - The name of the HTML-Tag, e.g: <div> -> 'div'
     * @param attributes    Object - key: attribute name, value: value of the attribute
     * @param content       HTMLElement | String - The nodes or strings to be placed inside of the element
     * @returns     HTMLElement | String - the composed HTMLElement with given attributes and content
     */
    createRichElement (tagName, attributes, ...content) {
        let element = document.createElement(tagName);
        if (attributes) {
            for (const [attr, value] of Object.entries(attributes)) {
                element.setAttribute(attr, value);
            }
        }
        if (content && content.length) {
            element.append(...content);
        }
        return element;
    };

    // different styling for loading and inserted bools
    getInnerHTMLElements (pDisplayText, loading, inserted) {
        const refreshImage = this.createRichElement('img', {
            id: this.constStrings.refreshIconID,
            src: this.getRefreshIconURL(),
            style: `animation-play-state: ${loading ? "running;" : "paused;" }` 
        });

        const button = this.createRichElement('button', {
            id: this.constStrings.buttonID,
            class: 'reset-button reload-button',
            style: inserted ? "align-self: center;" : "",
            disabled: loading ? 'true' : 'false' 
            },
            refreshImage);

        const headline = this.createRichElement('h3',{ class: 'gleitzeit-display-line' }, pDisplayText ?? this.constStrings.errorMsgs.unknown);

        return [ button, headline ];
    };

    startLoading () {
        const currentDisplay = document.getElementById(this.constStrings.insertedDisplayID) 
                            ?? document.getElementById(this.constStrings.floatingDisplayID); // get the display;
        if (currentDisplay) currentDisplay.style.opacity = '0.5';

        const refreshIcon = document.getElementById('refresh-icon');
        if (refreshIcon) refreshIcon.style.animationPlayState = 'running';

        const refreshButton = document.getElementById(this.constStrings.buttonID);
        if (refreshButton) refreshButton.disabled = true;
    };

    stopLoading () {
        const currentDisplay = document.getElementById(this.constStrings.insertedDisplayID) 
                            ?? document.getElementById(this.constStrings.floatingDisplayID); // get the display
        if (currentDisplay) currentDisplay.style.opacity = '';

        const refreshIcon = document.getElementById('refresh-icon');
        if (refreshIcon) refreshIcon.style.animationPlayState = 'paused';

        const refreshButton = document.getElementById(this.constStrings.buttonID);
        if (refreshButton) refreshButton.disabled = false;
    };

    // updates the loading state once and updates display with the displayFormat object
    // { text: string, loading: boolean }
    updateDisplay (displayFormat) {
        if (displayFormat.text) {
            this.updateDisplayText(displayFormat.text);
            if (displayFormat.loading) this.startLoading();
            else this.stopLoading();
        }
    };

    async updateDisplayText (possiblePromiseDisplayText) {
        const displayText = await possiblePromiseDisplayText;
        const display = document.getElementsByClassName('gleitzeit-display-line');

        if (display?.item(0) && displayText) {
            display.item(0).replaceChildren(displayText);
        }
    };

    
    // ============ Utility functions ===========
    // ==========================================

    // weather the user has set their page to light or dark mode
    getLightingMode () {
        const header = document.getElementById(this.givenStrings.headerID);
        if (!header) return 'gleitzeitkonto-light'; // default to lightmode if header not available

        // the rgb value of the header, is normally either white or dark grey/black
        const rgbColor = window.getComputedStyle(header, null)
            .getPropertyValue('background-color');

        // convert the rgb string representation into the red green and blue values
        const colors = rgbColor
            .replace('rgb(', '')
            .replace('(', '')
            .split(',')
            .map(value => parseInt(value.trim(), 10));

        // luminance calculation according to: https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-procedure
        const luminance = (0.2126 * colors[0] + 0.7152 * colors[1] + 0.0722 * colors[2]);
        
        if (luminance > 128)
            return 'gleitzeitkonto-light'
        else
            return 'gleitzeitkonto-dark';
    };

    // returns the URL for the refresh icon based on the current lightingMode
    getRefreshIconURL () {
        if (this.getLightingMode() == 'gleitzeitkonto-light')
            return browser.runtime.getURL('./assets/refresh-light.svg');
        else
            return browser.runtime.getURL('./assets/refresh-dark.svg');
    }
};