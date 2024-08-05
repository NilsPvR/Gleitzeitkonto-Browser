const { constStrings } = require('../utils/constants.js');
const Navigation = require('../utils/navigation.js');
const Common = require('./common.js');

module.exports = class Floating {
    // ========== floating display ==========

    addFloatingDisplay(pDisplayText, loading) {
        const HTMLElements = Common.getInnerHTMLElements(pDisplayText, loading, false);
        const canvas = document.getElementById('shellLayout') ?? document.getElementById('canvas'); // main page element is the (almost) only one loaded when DOM is loaded

        canvas.insertAdjacentElement(
            'beforebegin',
            Common.createRichElement(
                'div',
                {
                    class: `floating-display ${Navigation.getPageVariant()} ${Common.getLightingMode()}`,
                    id: constStrings.floatingDisplayID,
                    style: loading ? ' opacity: 0.5;' : '',
                },
                ...HTMLElements, // spread syntax to expand array
            ),
        );
    }

    getFloatingDisplay() {
        return document.getElementById(constStrings.floatingDisplayID);
    }

    // remove the display
    removeFloatingDisplay() {
        const oldDisplay = this.getFloatingDisplay();
        if (oldDisplay) oldDisplay.remove(); // delete the old display
    }
}