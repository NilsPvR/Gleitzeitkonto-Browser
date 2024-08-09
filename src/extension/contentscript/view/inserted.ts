import { constStrings } from '../utils/constants';
import { reloadGleitzeitKonto } from '../gleitzeitkonto-browser';
import Navigation from '../utils/navigation';
import Common from './common';
import Floating from './floating';

export default class Inserted {
    // ========== inserted display ==========

    public static addInsertedDisplay(
        pHeaderBar: HTMLElement,
        pDisplayText: string,
        loading: boolean,
    ): void {
        Floating.removeFloatingDisplay();

        const HTMLElements = Common.createInnerHTMLElements(pDisplayText, loading, true);

        pHeaderBar.prepend(
            Common.createRichElement(
                'div',
                {
                    class: `inserted-display ${Navigation.getPageVariant().toString().toLowerCase()} ${Common.getLightingMode()}`,
                    id: constStrings.insertedDisplayID,
                    style: loading ? ' opacity: 0.5;' : '',
                },
                ...HTMLElements, // spread syntax to expand array
            ),
        );
        // readd reload event listener
        const refreshIcon = document.getElementById(constStrings.refreshIconID);
        if (!refreshIcon) return; // unable to add event listener
        refreshIcon.addEventListener('click', () => {
            reloadGleitzeitKonto();
        });
    }

    public static getInsertedDisplay(): HTMLElement | null {
        return document.getElementById(constStrings.insertedDisplayID);
    }

    public static removeInsertedDisplay(): void {
        const previousInsertedDisplay = this.getInsertedDisplay();
        if (previousInsertedDisplay) {
            previousInsertedDisplay.remove();
        }
    }
}
