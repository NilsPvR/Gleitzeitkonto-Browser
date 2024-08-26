import { constStrings } from '../utils/constants';
import { realodAccountData } from '../contentscript';
import Navigation from '../utils/navigation';
import Common from './common';
import Floating from './floating';
import State from '../model/state';
import Settings from '../../common/utils/settings';

export default class Inserted {
    // ========== Inserted display ==========

    public static async addInsertedDisplay(
        pHeaderBar: HTMLElement,
        pDisplayText: string,
        loading: boolean,
        state: State,
    ): Promise<void> {
        Floating.removeFloatingDisplay();

        if (!(await Settings.extensionIsEnabled())) return;

        const HTMLElements = Common.createInnerHTMLElements(pDisplayText, loading, true);

        pHeaderBar.prepend(
            Common.createRichElement(
                'div',
                {
                    class:
                        `${constStrings.cssClasses.insertedDisplay} ${Navigation.getPageVariant().toString().toLowerCase()} ` +
                        Common.getLightingClassName(Common.getLightingMode()),
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
            realodAccountData(state);
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
