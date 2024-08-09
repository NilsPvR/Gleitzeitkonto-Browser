import browser from 'webextension-polyfill';
import { constStrings } from '../utils/constants';
import { DisplayFormat } from '../types/display';

export default class View {
    public static addCustomCSS(cssURL: string): void {
        if (!document.getElementById(constStrings.cssID)) {
            // if not already added
            const link = document.createElement('link');
            link.id = constStrings.cssID;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.media = 'all';
            link.href = browser.runtime.getURL(cssURL);

            document.head.appendChild(link);
        }
    }

    // ========= Changes on Gleitzeitkonto-Display ========
    // ====================================================

    public static startLoading(): void {
        const currentDisplay =
            document.getElementById(constStrings.insertedDisplayID) ??
            document.getElementById(constStrings.floatingDisplayID); // get the display;
        if (currentDisplay) currentDisplay.style.opacity = '0.5';

        const refreshIcon = document.getElementById('refresh-icon');
        if (refreshIcon) refreshIcon.style.animationPlayState = 'running';

        const refreshButton = document.getElementById(constStrings.buttonID);
        if (refreshButton) {
            // the only element having that id will be the button so casting is safe
            (refreshButton as HTMLButtonElement).disabled = true;
        }
    }

    public static stopLoading(): void {
        const currentDisplay =
            document.getElementById(constStrings.insertedDisplayID) ??
            document.getElementById(constStrings.floatingDisplayID); // get the display
        if (currentDisplay) currentDisplay.style.opacity = '';

        const refreshIcon = document.getElementById('refresh-icon');
        if (refreshIcon) refreshIcon.style.animationPlayState = 'paused';

        const refreshButton = document.getElementById(constStrings.buttonID);
        if (refreshButton) {
            // the only element having that id will be the button so casting is safe
            (refreshButton as HTMLButtonElement).disabled = false;
        }
    }

    /**
     * Updates the text and loading state of the display.
     * @param displayFormat text and loading state to update the display with
     */
    public static updateDisplay(displayFormat: DisplayFormat): void {
        if (displayFormat.text) {
            this.updateDisplayText(displayFormat.text);

            if (displayFormat.loading) this.startLoading();
            else this.stopLoading();
        }
    }

    public static async updateDisplayText(displayText: Promise<string> | string): Promise<void> {
        const text = await displayText;
        const displayList = document.getElementsByClassName('gleitzeit-display-line');
        if (!displayList) return;

        const display = displayList.item(0);
        if (display) {
            display.replaceChildren(text);
        }
    }
}
