const url = require('./url.json');
const browser = require('webextension-polyfill');

module.exports = class GleitzeitkontoBrowser {
    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Config <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
    constructor() {
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

            loacalServerURL: 'http://localhost:3000',
            maxPageloadingLoops: 20,
        };

        
        // Check if extern or intern Fiori website, since these have different amounts of icons    
        if (window.location.origin == url) { // Internal Fiori
            this.config.siteVersion = 'internal';
            this.config.amountIcons = 4; // amount of icons to wait for to load
            this.config.sideDistance = '11rem'; // css margin from the right for floating display
        }
        else { // extern
            this.config.siteVersion = 'external';
            this.config.amountIcons = 2;
            this.config.sideDistance = '9rem';
        }

        this.constStrings = {
            floatingDisplayID: 'gleitzeitkonto-canvas-headline',
            insertedDisplayID: 'gleitzeitkonto-display',
            prefixOvertime: 'Gleitzeitkonto: ',
            prefixError: 'Fehler: ',
            overtimeLoading: 'Loading...',
            errorMsgs: {
                serverNichtGestartet: 'Der Lokale-Server wurde nicht gestartet!',
                keineDatenVomServer: 'Keine Daten vom Lokalen-Server geladen',
                pageloadingtimeExceeded: 'Die Seite hat zu lange geladen. Das Gleitzeitkonto kann nicht angezeigt werden.',
                stillRunning: 'Erste Abfrage des Gleitzeitkonto\'s lädt noch', // code -1
                incorrectPath: 'Falscher Browser-Pfad für die API. Bitte Einstellungen im Popup anpassen.', // code 1
                notInNetwork: 'Nicht im BTC Netz - Du musst mit LAN oder dem BTC-Office-WLAN verbunden sein', // code 2
                tooManyCSV: 'Zu viele CSV-Dateien im Ordner der API. Bitte Dateien manuell löschen.', // code 3
                unknownAPI: 'Unbekannter Fehler der API', // code 4
                unknown: 'Unbekannter Fehler',
                unknownFetching: 'Unbekannter Fehler beim laden der Daten'
            }
        }

        // Strings defined by external third parties, e.g. Fiori 
        this.givenStrings = {
            gleitzeitHash: '#btccatstime-create',
            headerBarID: 'shell-header-hdr-search-container',
            iconsID: 'sf',
            errorMsgs: {
                networkError: 'NetworkError when attempting to fetch resource.',
                failedError: 'Failed to fetch',
            },
            downloadURL: '/downloadWorkingTimes',
            calcaulteURL: '/calculateFromWorkingTimes',
            waitForDownlodURL: '/waitfordownload',
        };
    }

    /* ==========================================================================================
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Functions <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    // Boolean value weather or not the user is on "Meine Zeiterfassung" page
    checkCorrectMenuIsOpen = () => {
        if (window.location.hash === this.givenStrings.gleitzeitHash) {
            return true;
        }
        return false;
    }

    // Resolves the promise only once the user is on "Meine Zeiterfassung" page
    // This is done by checking the Hash of the URL (the bit after #)
    continuousMenucheck = async () => {
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

    fetchServer = async (path) => {
        try {
            const url = this.config.loacalServerURL + path;
            const data = await (await fetch(url)).json();
            return data;
        }
        catch (e) {
            if (e.message == this.givenStrings.errorMsgs.networkError || e.message == this.givenStrings.errorMsgs.failedError) {
                console.log(e);
                return {error: { message: this.constStrings.errorMsgs.serverNichtGestartet}};
            }
            else {
                console.error(e);
                return {error: { message: this.constStrings.errorMsgs.keineDatenVomServer}};
            }
        }
        
    };

    formatDisplayText = (kontoData) => {
        if (kontoData?.error?.message) return this.constStrings.prefixError + kontoData.error.message; // Error occured
        if (!kontoData || !kontoData.kontoString) return this.constStrings.prefixError + this.constStrings.errorMsgs.keineDatenVomServer; // No Data
        else return this.constStrings.prefixOvertime + kontoData.kontoString;
    }

    getDownloadKontoData = async () => {
        let response = await this.fetchServer(this.givenStrings.downloadURL);
        let kontoData = {};

        // -- Check StatusCode of Download --
        if (response == -1) response = await this.fetchServer(this.givenStrings.waitForDownlodURL); // other request still downloading

        if (response == 1) kontoData.error = { message: this.constStrings.errorMsgs.incorrectPath, statusCode: 1 }
        else if (response == 2) kontoData.error = { message: this.constStrings.errorMsgs.notInNetwork, statusCode: 2 }
        else if (response == 3) kontoData.error = { message: this.constStrings.errorMsgs.tooManyCSV, statusCode: 3 }
        else if (response == 4) kontoData.error = { message: this.constStrings.errorMsgs.unknownAPI, statusCode: 4 }
        else if (response == 0) { // success
            // since download only returns statusCode calculate afterwards
            kontoData = await this.fetchServer(this.givenStrings.calcaulteURL);
        }
        else if (response?.error?.message) kontoData = response // fetchServer gave an error

        
        return kontoData;
    };


    // ---------- Changes on Displays ----------
    // -----------------------------------------    

    // different styling for loading and inserted bools
    getInnerHTMLText = (pDisplayText, loading, inserted) => {
        return  `<button class="reset-button reload-button" style="${inserted ? "align-self: center;" : "" }" onclick="window.location.href = '#'" ${loading ? 'disabled="true"' : ''}>` +
                    `<img id="refresh-icon" src="${browser.runtime.getURL('./Assets/refresh.svg')}"` + 
                    `style="animation-play-state: ${loading ? "running;" : "paused;" }">` +
                `</button>` +
                `<h3 class="gleitzeit-display-line">${pDisplayText ?? this.constStrings.errorMsgs.unknown}</h3>`;
    }

    addFloatingDisplay = (pDisplayText, loading) => {
        const canvas = document.getElementById('canvas'); // main page element is the (almost) only one loaded when DOM is loaded

        canvas.insertAdjacentHTML('beforebegin',
                `<div class="floating-display ${this.config.siteVersion}" id="${this.constStrings.floatingDisplayID}" style="${loading ? ' opacity: 0.5;' : ''}">` +
                    this.getInnerHTMLText(pDisplayText, loading, false) + 
                '</div>');
    };

    getFloatingDisplay = () => {
        return document.getElementById(this.constStrings.floatingDisplayID);
    }

    // remove the display
    removeFloatingDisplay = () => {
        const oldDisplay = this.getFloatingDisplay();
        if (oldDisplay) oldDisplay.remove(); // delete the old display
    };

    // change the contents of the floating display
    // updateFloatingDisplayAsync = async (promiseKontoData, loading) => {
    //     const kontoData = await promiseKontoData; // wait until the promise is resolved

    //     const oldDisplay = this.getFloatingDisplay();
    //     if (oldDisplay && kontoData?.kontoString) { // check if the floating display still exists
    //         oldDisplay.innerHTML = this.getInnerHTMLText(this.formatDisplayText(kontoData), loading, false);
    //     }
    // };



    addInsertedDisplay = (pHeaderBar, pDisplayText, loading) => {
        this.removeFloatingDisplay();

        pHeaderBar.innerHTML += `<div class="inserted-display" id="${this.constStrings.insertedDisplayID}" style="${loading ? ' opacity: 0.5;' : ''}">` +
                                    this.getInnerHTMLText(pDisplayText, loading, true) +
                                '</div>'; // add new display
    };

    // addInsertedDisplayAsync = async (pHeaderBar, pPromiseDisplayText, loading) => {
    //     const displayText = await pPromiseDisplayText;
    //     this.addInsertedDisplay(pHeaderBar, displayText, loading);
    // };

    // moves the old floating display to an inserted display, the styling will also be adjusted accordingly 
    // pDisplayText is optional
    moveFloatingToInsertedDisplay = (pHeaderBar, pOldNode, pDisplayText) => {
        pOldNode.id = this.constStrings.insertedDisplayID;
        pHeaderBar.append(pOldNode); // moves the Node

        const newDisplay = document.getElementById(this.constStrings.insertedDisplayID); // get the newly added display

        document.getElementsByClassName('reset-button').item(0).style.alignSelf = 'center';
        newDisplay.className = 'inserted-display';        
        if (pDisplayText) this.updateDisplayText(pDisplayText);
       
    }

    getInsertedDisplay = () => {
        return document.getElementById(this.constStrings.insertedDisplayID);
    };

    removeInsertedDisplay = () => {
        const previousInsertedDisplay = this.getInsertedDisplay();
        if (previousInsertedDisplay) {
            previousInsertedDisplay.remove();
        }
    };

    startLoading = () => {
        const currentDisplay = document.getElementById(this.constStrings.insertedDisplayID) 
                            ?? document.getElementById(this.constStrings.floatingDisplayID); // get the display;
        if (currentDisplay) currentDisplay.style.opacity = '0.5';

        const refreshIcon = document.getElementById('refresh-icon');
        if (refreshIcon) refreshIcon.style.animationPlayState = 'running';

        const refreshButton = document.getElementsByClassName('reload-button').item(0);
        if (refreshButton) refreshButton.disabled = true;
    }


    stopLoading = () => {
        const currentDisplay = document.getElementById(this.constStrings.insertedDisplayID) 
                            ?? document.getElementById(this.constStrings.floatingDisplayID); // get the display
        if (currentDisplay) currentDisplay.style.opacity = '';

        const refreshIcon = document.getElementById('refresh-icon');
        if (refreshIcon) refreshIcon.style.animationPlayState = 'paused';

        const refreshButton = document.getElementsByClassName('reload-button').item(0);
        if (refreshButton) refreshButton.disabled = false;
    }


    // updates the loading state once the KontoData has loaded and updates display with kontoData
    updateDisplay = async (possiblePromiseKontoData, loading) => {
        const kontoData = await possiblePromiseKontoData; // wait until the promise is resolved

        if (kontoData?.kontoString) {
            this.updateDisplayText(this.formatDisplayText(kontoData));
            if (loading) this.startLoading();
            else this.stopLoading();
        }
    }


    // works for both display
    updateDisplayText = async (possiblePromiseDisplayText) => {
        const displayText = await possiblePromiseDisplayText;
        const display = document.getElementsByClassName('gleitzeit-display-line');

        if (display?.item(0) && displayText) {
            display.item(0).innerHTML = displayText;
        }
    }

    
    // ---------- End Changes on Displays ----------
    // ---------------------------------------------

    // Update the display continuously for as long as the script is loaded
    // It is asumed that the page has already loaded completely
    updateDisplayOnURLChange = (pHeaderBar, pKontoData) => {
        const displayText = this.formatDisplayText(pKontoData);

        window.addEventListener('hashchange', () => {

            // When correct page is open and the display doesn't already exist
            if (this.checkCorrectMenuIsOpen() && !this.getInsertedDisplay()) {
                this.addInsertedDisplay(pHeaderBar, displayText, false);
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
                this.addInsertedDisplay(pHeaderBar, displayText, false);
            }
        });

        observer.observe(pHeaderBar, { 
            // config
            attrtibutes: false,
            childList: true,
            subtree: true,
        });
    };
};