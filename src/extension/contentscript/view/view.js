const { constStrings } = require('./constants.js');

module.exports = class View {
    // ========= Changes on Gleitzeitkonto-Display ========
    // ====================================================

    static startLoading() {
        const currentDisplay =
            document.getElementById(constStrings.insertedDisplayID) ??
            document.getElementById(constStrings.floatingDisplayID); // get the display;
        if (currentDisplay) currentDisplay.style.opacity = '0.5';

        const refreshIcon = document.getElementById('refresh-icon');
        if (refreshIcon) refreshIcon.style.animationPlayState = 'running';

        const refreshButton = document.getElementById(constStrings.buttonID);
        if (refreshButton) refreshButton.disabled = true;
    }

    static stopLoading() {
        const currentDisplay =
            document.getElementById(constStrings.insertedDisplayID) ??
            document.getElementById(constStrings.floatingDisplayID); // get the display
        if (currentDisplay) currentDisplay.style.opacity = '';

        const refreshIcon = document.getElementById('refresh-icon');
        if (refreshIcon) refreshIcon.style.animationPlayState = 'paused';

        const refreshButton = document.getElementById(constStrings.buttonID);
        if (refreshButton) refreshButton.disabled = false;
    }

    // updates the loading state once and updates display with the displayFormat object
    // { text: string, loading: boolean }
    static updateDisplay(displayFormat) {
        if (displayFormat.text) {
            this.updateDisplayText(displayFormat.text);
            if (displayFormat.loading) this.startLoading();
            else this.stopLoading();
        }
    }

    static async updateDisplayText(possiblePromiseDisplayText) {
        const displayText = await possiblePromiseDisplayText;
        const display = document.getElementsByClassName('gleitzeit-display-line');

        if (display?.item(0) && displayText) {
            display.item(0).replaceChildren(displayText);
        }
    }
};
