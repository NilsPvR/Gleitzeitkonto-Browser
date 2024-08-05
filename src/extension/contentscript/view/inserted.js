const { constStrings } = require('../utils/constants.js');
const { reloadGleitzeitKonto } = require('../gleitzeitkonto-browser.js');
const Navigation = require('../utils/navigation.js');
const Common = require('./common.js');

module.exports = class Inserted {
    // ========== inserted display ==========

    addInsertedDisplay(pHeaderBar, pDisplayText, loading) {
        this.removeFloatingDisplay();

        const HTMLElements = Common.getInnerHTMLElements(pDisplayText, loading, true);

        pHeaderBar.prepend(
            Common.createRichElement(
                'div',
                {
                    class: `inserted-display ${Navigation.getPageVariant()} ${Common.getLightingMode()}`,
                    id: constStrings.insertedDisplayID,
                    style: loading ? ' opacity: 0.5;' : '',
                },
                ...HTMLElements, // spread syntax to expand array
            ),
        );
        // readd reload event listener
        document.getElementById(constStrings.refreshIconID).addEventListener('click', () => {
            reloadGleitzeitKonto();
        });
    }

    getInsertedDisplay() {
        return document.getElementById(constStrings.insertedDisplayID);
    }

    removeInsertedDisplay() {
        const previousInsertedDisplay = this.getInsertedDisplay();
        if (previousInsertedDisplay) {
            previousInsertedDisplay.remove();
        }
    }
}