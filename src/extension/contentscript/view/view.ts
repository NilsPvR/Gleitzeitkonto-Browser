import { config, constStrings } from '../utils/constants';
import { DisplayFormat } from '../types/display';
import Inserted from './inserted';
import Settings from '../../common/utils/settings';
import Floating from './floating';

export default class View {
    constructor(public inserted: Inserted, public headerBar?: HTMLElement) {}

    /**
     * Will add/update/change a display in the page with the given data. The function will
     * determine the display to use.
     * @param displayState    the data to render
     * @param updateText      if true will update the text even if the display is already added (default: `true`)
     */
    public async renderDisplay(displayState: DisplayFormat, updateText: boolean = true) {
        if (!(await Settings.displayIsEnabled())) {
            View.removeDisplay();
            return;
        }
        if (this.headerBar) { // inserted can be rendered
            Floating.removeFloatingDisplay();
            this.renderInsertedDisplay(displayState, updateText);
        } else {
            Inserted.removeInsertedDisplay();
            this.renderFloatingDisplay(displayState, updateText);
        }
    }

    private renderInsertedDisplay(displayState: DisplayFormat, updateText: boolean) {
        if (!this.headerBar) return;

        if (Inserted.getInsertedDisplay() === null) {
            this.inserted.addInsertedDisplay(this.headerBar, displayState);
        } else if (updateText) {
            View.updateDisplay(displayState);
        }
    }

    private renderFloatingDisplay(displayState: DisplayFormat, updateText: boolean) {
        if (Floating.getFloatingDisplay() === null) {
            Floating.addFloatingDisplay(displayState);
        } else if (updateText) {
            View.updateDisplay(displayState);
        }
    }

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

    public static removeDisplay() {
        if (Inserted.getInsertedDisplay()) {
            Inserted.removeInsertedDisplay();
        } else if (Floating.getFloatingDisplay()) {
            Floating.removeFloatingDisplay();
        }
    }
}
