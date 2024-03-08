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

            loacalServerURL: 'http://localhost:35221',
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
                serverNichtGestartet: 'Der Lokale-Server wurde nicht gestartet!',
                keineDatenVonCompanionApp: 'Keine Daten von der CompanionApp erhalten.',
                errorConnectingToBackend: 'Keine Verbindung zur CompanionApp möglich.',
                pageloadingtimeExceeded: 'Die Seite hat zu lange geladen. Das Gleitzeitkonto kann nicht angezeigt werden.',
                stillRunning: 'Erste Abfrage des Gleitzeitkonto\'s lädt noch', // code -1
                incorrectPath: 'Falscher Browser-Pfad für die API. Bitte Einstellungen im Popup anpassen.', // code 1
                notInNetwork: 'Nicht im BTC Netz - Du musst mit LAN oder dem BTC-Office-WLAN verbunden sein', // code 2
                tooManyCSV: 'Zu viele CSV-Dateien im Ordner der API. Bitte Dateien manuell löschen.', // code 3
                unknownAPI: 'Unbekannter Fehler der API', // code 4
                unknown: 'Unbekannter Fehler',
                unknownFetching: 'Unbekannter Fehler beim laden der Daten',
                versionOutdated: 'Bitte die Erweiterung aktualisieren!'
            }
        };

        // Strings defined by external third parties, e.g. Fiori 
        this.givenStrings = {
            gleitzeitHash: '#btccatstime-create',
            headerID: 'shell-header',
            headerEndID: 'shell-header-hdr-end',
            searchBarID: 'searchFieldInShell-input',
            errorMsgs: {
                networkError: 'NetworkError when attempting to fetch resource.',
                failedError: 'Failed to fetch',
            },
            downloadCommand: 'downloadWorkingTimes',
            calcaulteCommand: 'calculateFromWorkingTimes',
            waitForDownlodCommand: 'waitfordownload',
            versionCommand: 'version',
            githubAPIURL: 'https://api.github.com/repos/NilsPvR/Gleitzeitkonto-Browser/releases/latest',
        };
    }

    /* ==========================================================================================
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Functions <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    // Boolean value weather or not the user is on "Meine Zeiterfassung" page
    checkCorrectMenuIsOpen () {
        if (window.location.hash.startsWith(this.givenStrings.gleitzeitHash)) {
            return true;
        }
        return false;
    };

    // Resolves the promise only once the user is on "Meine Zeiterfassung" page
    // This is done by checking the Hash of the URL (the bit after #)
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

    /**
     * Sends a message to the background script which will normally be forwarded to the CompanionApp.
     * The response from the background script will be returned. Depending on the command this can 
     * be a string with different content.
     * @param command the command to send to the background script, one of ['downloadworkingtimes', 
     * 'calculatefromworkingtimes', 'waitfordownload', 'version']
     * @returns a promise which resolves to a string with the response for the command
     */
    async sendMsgToBackgroundS (command) {
        try {
            return await browser.runtime.sendMessage(command) // send the command to the background script
        }
        catch (e) {
            console.error(e);
            return {error: { message: this.constStrings.errorMsgs.errorConnectingToBackend}};
        }
        
    };

    formatDisplayText (kontoData) {
        if (kontoData?.error?.message) return this.constStrings.prefixError + kontoData.error.message; // Error occured
        if (!kontoData || !kontoData.kontoString) return this.constStrings.prefixError + this.constStrings.errorMsgs.keineDatenVonCompanionApp; // No Data
        else return this.constStrings.prefixOvertime + kontoData.kontoString;
    };

    async getDownloadKontoData () {
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
        else if (response?.error?.message) kontoData = response // fetchServer gave an error

        
        return kontoData;
    };


    // ---------- Changes on Displays ----------
    // -----------------------------------------    

    /**
     * Creates a new HTML Element with the specified attributes and the content placed inside
     * @param tagName       String - The name of the HTML-Tag, e.g: <div> -> 'div'
     * @param attributes    Object - key: attribute name, value: value of the attribute
     * @param content       HTMLElement | String - The nodes or strings to be placed inside of the element
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
    };

    // moves the old floating display to an inserted display, the styling will also be adjusted accordingly 
    // pDisplayText is optional
    moveFloatingToInsertedDisplay (pHeaderBar, pOldNode, pDisplayText) {
        pOldNode.id = this.constStrings.insertedDisplayID;
        pHeaderBar.prepend(pOldNode); // moves the Node

        const newDisplay = this.getInsertedDisplay(); // get the newly added display

        document.getElementById(this.constStrings.buttonID).style.alignSelf = 'center';
        // update the refresh icon
        document.getElementById(this.constStrings.refreshIconID).src = this.getRefreshIconURL()

        newDisplay.className = `inserted-display ${this.config.siteVersion} ${this.getLightingMode()}`;
        if (pDisplayText) this.updateDisplayText(pDisplayText);
       
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

    // ---------- For both displays ----------

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


    // updates the loading state once the KontoData has loaded and updates display with kontoData
    async updateDisplay (possiblePromiseKontoData, loading) {
        const kontoData = await possiblePromiseKontoData; // wait until the promise is resolved

        if (kontoData) {
            this.updateDisplayText(this.formatDisplayText(kontoData));
            if (loading) this.startLoading();
            else this.stopLoading();
        }
    };


    // works for both display
    async updateDisplayText (possiblePromiseDisplayText) {
        const displayText = await possiblePromiseDisplayText;
        const display = document.getElementsByClassName('gleitzeit-display-line');

        if (display?.item(0) && displayText) {
            display.item(0).replaceChildren(displayText);
        }
    };

    
    // ---------- End Changes on Displays ----------
    // ---------------------------------------------

    // Update the display continuously for as long as the script is loaded
    // It is asumed that the page has already loaded completely
    updateDisplayOnURLChange (pHeaderBar, pKontoData, loading, versionOutdated) {
        let displayText = this.formatDisplayText(pKontoData);
        if (versionOutdated) displayText = this.constStrings.prefixError + this.constStrings.errorMsgs.versionOutdated;

        window.addEventListener('hashchange', () => {

            // When correct page is open and the display doesn't already exist
            if (this.checkCorrectMenuIsOpen() && !this.getInsertedDisplay()) {
                this.addInsertedDisplay(pHeaderBar, displayText, loading);
            }
            else if (!this.checkCorrectMenuIsOpen()) {
                // This will also be removed by Fiori but keep remove just in case this behaviour gets changed
                this.removeInsertedDisplay();
            }
        });

        // Check if the HeaderBar is being manipulated -> display getting removed by Fiori
        // Without this additonal check the display will be added and then fiori resets the headerBar
        const observer = new MutationObserver(() => {
            // When correct page is open and the display doesn't already exist
            if (this.checkCorrectMenuIsOpen() && !this.getInsertedDisplay()) {
                this.addInsertedDisplay(pHeaderBar, displayText, loading);
            }
        });

        // add the display to make sure the observer can actually observe something and the display isn't already removed
        if (this.checkCorrectMenuIsOpen() && !this.getInsertedDisplay()) {
            this.addInsertedDisplay(pHeaderBar, displayText, loading);
        }

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
        const promiseCalcKontoData = this.sendMsgToBackgroundS(this.givenStrings.calcaulteCommand);
        const promiseDownloadKontoData = this.getDownloadKontoData();

        this.updateDisplay(promiseCalcKontoData, true);
        this.updateDisplay(promiseDownloadKontoData, false);
    };


    async checkVersionOutdated () {
        const localBrowserVersion = browser.runtime.getManifest().version;

        let localWebserverVersion = await this.sendMsgToBackgroundS(this.givenStrings.versionCommand); // get version obj
        if (localWebserverVersion?.version) localWebserverVersion = localWebserverVersion.version; // get version string out of object

        let onlineVersion;
        try {
            onlineVersion = await fetch(this.givenStrings.githubAPIURL); // get latest release data from github
            onlineVersion = await onlineVersion.json();
        } catch (e) {
            console.log(e);
            return false; // don't compare versions since online version not available
        }
        if (onlineVersion?.tag_name) onlineVersion = onlineVersion.tag_name.toLowerCase().replace('v', ''); // get only the number string

        // one of the versions is not available
        if (typeof onlineVersion != 'string' || !localBrowserVersion  || typeof localWebserverVersion != 'string') return false;

        // compare strings to compare version numbers
        const resultBrowser = localBrowserVersion.localeCompare(onlineVersion, undefined, { numeric: true, sensitivity: 'base' });
        const resultWebserver = localWebserverVersion.localeCompare(onlineVersion, undefined, { numeric: true, sensitivity: 'base' });

        if (resultBrowser == -1 || resultWebserver == -1) { // version is outdated
            return true;
        }
        
        return false;
    };


    // weather the user has set their page to light or dark mode
    getLightingMode () {
        const header = document.getElementById(this.givenStrings.headerID);
        if (!header) return 'gleitzeitkonto-light' // default to lightmode if header not available

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
            return browser.runtime.getURL('./Assets/refresh-light.svg');
        else
            return browser.runtime.getURL('./Assets/refresh-dark.svg');
    }
};