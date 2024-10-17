import { constStrings } from '../utils/constants';
import { reloadOvertimeData } from '../contentscript';
import Navigation from '../utils/navigation';
import Common from './common';
import Floating from './floating';
import Settings from '../../common/utils/settings';
import Communication from '../utils/communication';

export default class Inserted {
    // ========== Inserted display ==========

    constructor(public communication: Communication) {}

    public async addInsertedDisplay(
        pHeaderBar: HTMLElement,
        pDisplayText: string,
        loading: boolean,
    ) {
        Floating.removeFloatingDisplay();

        if (!(await Settings.displayIsEnabled())) return;

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
            reloadOvertimeData(this.communication);
        });
    }

    public static getInsertedDisplay(): HTMLElement | null {
        return document.getElementById(constStrings.insertedDisplayID);
    }

    public static removeInsertedDisplay() {
        const previousInsertedDisplay = this.getInsertedDisplay();
        if (previousInsertedDisplay) {
            previousInsertedDisplay.remove();
        }
    }
}
