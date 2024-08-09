import { constStrings } from '../utils/constants';
import { reloadGleitzeitKonto } from '../contentscript';
import Navigation from '../utils/navigation';
import Common from './common';
import Floating from './floating';
import State from '../model/state';

export default class Inserted {
    // ========== inserted display ==========

    public static addInsertedDisplay(
        pHeaderBar: HTMLElement,
        pDisplayText: string,
        loading: boolean,
        state: State
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
            reloadGleitzeitKonto(state);
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
