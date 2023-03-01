export default class GleitzeitkontoBrowser {
    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Config <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
    constructor() {
        this.config = {
            primaer: {
                "dunkelblau":   "#003869",
                "mittelblau":   "#5aa6e7",
                "gelb":         "#fbd200",
                "grau":         "#f5f5f5",
            },
            sekundaer: {
                "1": "#00508c",
                "2": "0078be",
                "3": "9ccaf1",
                "4": "cee4f8",
            },

            loacalServerURL: 'http://localhost:3000',
            maxPageloadingLoops: 20,
        };

        // Check if extern or intern Fiori website, since these have different amounts of icons    
        if (window.location.origin == 'https://bgp.btcsap.btc-ag.com:44300') { // Intern Fiori
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

    fetchServer = async () => {
        try {
            const url = this.config.loacalServerURL;
            const data = await (await fetch(url)).json();
            return data;
        }
        catch (e) {
            if (e.message == this.givenStrings.errorMsgs.networkError || e.message == this.givenStrings.errorMsgs.failedError) {
                console.log(e);
                return {errorMessage: this.constStrings.errorMsgs.serverNichtGestartet};
            }
            else {
                console.error(e);
                return {errorMessage: this.constStrings.errorMsgs.keineDatenVomServer};
            }
        }
        
    };

    getDisplayText = async () => {
        const res = await this.fetchServer();

        if (res.errorMessage) return this.constStrings.prefixError + res.errorMessage; // Error occured
        else if (!res || !res.konto) return this.constStrings.errorMsgs.keineDatenVomServer; // No Data
        else return this.constStrings.prefixOvertime + res.konto;
    };


    // ---------- Changes on Displays ----------
    // -----------------------------------------    

    addFloatingDisplay = (pDisplayText) => {
        const canvas = document.getElementById('canvas'); // main page element is the (almost) only one loaded when DOM is loaded

        if (this.config.siteVersion == 'external') {
            canvas.insertAdjacentHTML('beforebegin',
                `<h3 id="${this.constStrings.floatingDisplayID}"style="float: right; margin-top: 11px; margin-right: ${this.config.sideDistance}; `
                + `color: ${this.config.primaer.dunkelblau};">${pDisplayText ?? this.constStrings.errorMsgs.unknown}</h3>`);

        }

        if  (this.config.siteVersion == 'internal') { // internal site needs different styling, which is less 'nice'
            canvas.insertAdjacentHTML('beforebegin',
                `<h3 id="${this.constStrings.floatingDisplayID}"style="position: absolute; right: ${this.config.sideDistance}; margin-top: 11px; z-index: 1; `
                + `color: ${this.config.primaer.dunkelblau};">${pDisplayText ?? this.constStrings.errorMsgs.unknown}</h3>`);
        }
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
    // displayText is a promise
    updateFloatingDisplay = async (promiseDisplayText) => {
        await promiseDisplayText; // wait until the promise is resolved

        const oldDisplay = this.getFloatingDisplay();
        if (oldDisplay) { // check if the floating display still exists
            oldDisplay.innerHTML = await promiseDisplayText;
        }
    };



    addInsertedDisplay = (pHeaderBar, pDisplayText) => {
        this.removeFloatingDisplay();

        pHeaderBar.innerHTML += `<h3 id=${this.constStrings.insertedDisplayID} style="display:flex; align-self: center; color: ${this.config.primaer.dunkelblau};">${pDisplayText ?? 'unknown error'}</h3>`; // add new display
    };

    getInsertedDisplay = () => {
        return document.getElementById(this.constStrings.insertedDisplayID);
    };

    removeInsertedDisplay = () => {
        const previousInsertedDisplay = this.getInsertedDisplay();
        if (previousInsertedDisplay) {
            previousInsertedDisplay.remove();
        }
    };

    
    // ---------- End Changes on Displays ----------
    // ---------------------------------------------

    // Update the display continuously for as long as the script is loaded
    // It is asumed that the page has already loaded completely
    updateDisplayOnURLChange = (pHeaderBar, pDisplayText) => {
        window.addEventListener('hashchange', () => {

            // When correct page is open and the display doesn't already exist
            if (this.checkCorrectMenuIsOpen() && !this.getInsertedDisplay()) {
                this.addInsertedDisplay(pHeaderBar, pDisplayText);
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
                this.addInsertedDisplay(pHeaderBar, pDisplayText);
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