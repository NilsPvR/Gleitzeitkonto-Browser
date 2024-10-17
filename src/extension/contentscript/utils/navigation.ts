import url from '../url.json';
import { PageVariant } from '../enums/pageVariant';
import { constStrings, givenStrings } from './constants';

export default class Navigation {
    // ========== Checking and waiting for correct page ===========
    // ============================================================

    /**
     * Resolves once the DOMContentLoaded event fires or immediately if it is already loaded.
     */
    public static async waitForDOMContentLoaded() {
        return new Promise<void>((resolve) => {
            if (document.readyState === 'loading') {
                window.addEventListener('DOMContentLoaded', () => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Waits and checks multiple times until the page has fully loaded. This is determined by specific
     * DOM Elements being present.
     * @param timeout   time in ms between each check, will be limited to min. 1 000 when tab is not focused
     *                  (default: `1 000`)
     * @param maxChecks amount of times to check if page loaded (default: `120`)
     * @returns         the found HTMLElement on the page which indicates the page loaded,
     *                  rejects with error message if the maxChecks is exceeded
     */
    public static async waitForPageLoad(
        timeout: number = 1000,
        maxChecks: number = 120,
    ): Promise<HTMLElement> {
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
                } else if (loops > maxChecks) {
                    // page loaded too long
                    clearInterval(checkPageLoaded);
                    reject(constStrings.errorMsgs.pageloadingtimeExceeded);
                }
            }, timeout); // will be limited to min. 1000 when tab not focused
        });
    }

    /**
     * Checks if the user is on the "Meine Zeiterfassung" page. This is possible
     * by checking the hash of the url (the part after #).
     * @returns    true if the user in on "Meine Zeiterfassung" page
     */
    public static checkCorrectMenuIsOpen(): boolean {
        if (window.location.hash.startsWith(givenStrings.gleitzeitHash)) {
            return true;
        }
        return false;
    }

    /**
     * Waits until the user opens the "Meine Zeiterfassung" page.
     * @returns    true once the "Meine Zeiterfassung" page is opened
     */
    public static async continuousMenucheck(): Promise<boolean> {
        if (this.checkCorrectMenuIsOpen()) {
            return true;
        }

        return new Promise((resolve) => {
            const onHashChange = () => {
                if (this.checkCorrectMenuIsOpen()) {
                    window.removeEventListener('hashchange', onHashChange);
                    resolve(true);
                }
                // else nothing happens and we wait for the next change
            };
            window.addEventListener('hashchange', onHashChange);
        });
    }

    /**
     * Check if exteral or internal Fiori website, since these have different styling.
     * @returns the PageVariant of the currently opened page
     */
    public static getPageVariant(): PageVariant {
        if (window.location.origin == url) {
            // internal Fiori
            return PageVariant.Internal;
        } else {
            return PageVariant.External;
        }
    }
}
