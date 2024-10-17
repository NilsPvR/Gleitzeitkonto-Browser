import { config, constStrings } from '../utils/constants';
import { DisplayFormat } from '../types/display';

export default class View {
    // ========= Changes on Gleitzeitkonto-Display ========
    // ====================================================

    public static startLoading() {
        const currentDisplay =
            document.getElementById(constStrings.insertedDisplayID) ??
            document.getElementById(constStrings.floatingDisplayID); // get the display;
        if (currentDisplay) currentDisplay.style.opacity = config.loadingOpacity;

        const refreshIcon = document.getElementById(constStrings.refreshIconID);
        if (refreshIcon) refreshIcon.style.animationPlayState = 'running';

        const refreshButton = document.getElementById(constStrings.buttonID);
        if (refreshButton) {
            // the only element having that id will be the button so casting is safe
            (refreshButton as HTMLButtonElement).disabled = true;
        }
    }

    public static stopLoading() {
        const currentDisplay =
            document.getElementById(constStrings.insertedDisplayID) ??
            document.getElementById(constStrings.floatingDisplayID); // get the display
        if (currentDisplay) currentDisplay.style.opacity = '';

        const refreshIcon = document.getElementById(constStrings.refreshIconID);
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
    public static updateDisplay(displayFormat: DisplayFormat) {
        if (displayFormat.text) {
            this.updateDisplayText(displayFormat.text);

            if (displayFormat.loading) this.startLoading();
            else this.stopLoading();
        }
    }

    public static async updateDisplayText(displayText: Promise<string> | string) {
        const text = await displayText;
        const displayList = document.getElementsByClassName(constStrings.cssClasses.displayLine);
        if (!displayList) return;

        const display = displayList.item(0);
        if (display) {
            display.replaceChildren(text);
        }
    }
}
