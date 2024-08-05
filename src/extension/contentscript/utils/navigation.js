const url = require('./url.json');
const { config, constStrings, givenStrings } = require('./constants.js');

module.exports = class Navigation {
    // ========== Checking and waiting for correct page ===========
    // ============================================================

    // promise resolves with headerbar html object when page 'fully' loaded
    // promise rejects with error message when page couldn't load after timeout
    static async waitForPageLoad() {
        return new Promise((resolve, reject) => {
            let loops = 0; // track how often checkPageLoaded ran

            // loop to check once the page has actually loaded
            // -> this is determined by checking if the headerbar of the page is available
            const checkPageLoaded = setInterval(async () => {
                loops++;
                const headerBar = document.getElementById(givenStrings.headerEndID); // the conatiner in which to place the inserted display

                if (headerBar) {
                    clearInterval(checkPageLoaded);
                    resolve(headerBar);
                } else if (loops > config.maxPageloadingLoops) {
                    // page loaded too long
                    clearInterval(checkPageLoaded);
                    reject(constStrings.errorMsgs.pageloadingtimeExceeded);
                }
            }, 1000); // will be limited to min. 1000 when tab not focused
        });
    }

    /**
     * Checks if the user is on the "Meine Zeiterfassung" page. This is possible
     * by checking the hash or the url (the part after #)
     * @returns     Boolean - true if the user in on "Meine Zeiterfassung" page
     */
    static checkCorrectMenuIsOpen() {
        if (window.location.hash.startsWith(givenStrings.gleitzeitHash)) {
            return true;
        }
        return false;
    }

    /**
     * Waits until the user opens the "Meine Zeiterfassung" page. The promise will
     * resolve with no data once the site is opened.
     * @returns     Promise<> - resolves once the "Meine Zeiterfassung" page is opened
     */
    static async continuousMenucheck() {
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
    }

    // @returns string  'internal' or 'external'
    getPageVariant() {
        // Check if extern or intern Fiori website, since these have different amounts of icons
        if (window.location.origin == url) {
            // Internal Fiori
            return 'internal';
        } else {
            return 'external';
        }
    }
};
