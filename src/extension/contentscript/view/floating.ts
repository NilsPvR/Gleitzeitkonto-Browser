import { constStrings, givenStrings } from '../utils/constants';
import Navigation from '../utils/navigation';
import Common from './common';
import Settings from '../../common/utils/settings';

export default class Floating {
    // ========== Floating display ==========

    public static async addFloatingDisplay(pDisplayText: string, loading = false): Promise<void> {
        if (!(await Settings.extensionIsEnabled())) {
            return;
        }

        const HTMLElements = Common.createInnerHTMLElements(pDisplayText, loading, false);

        // main page element is the (almost) only one loaded when DOM is loaded
        const canvas =
            document.getElementById(givenStrings.mainPageElement1) ??
            document.getElementById(givenStrings.mainPageElement2);
        if (!canvas) return; // unable to insert floating display, when canvas not available

        canvas.insertAdjacentElement(
            'beforebegin',
            Common.createRichElement(
                'div',
                {
                    class:
                        `${constStrings.cssClasses.floatingDisplay} ${Navigation.getPageVariant().toString().toLowerCase()} ` +
                        Common.getLightingClassName(Common.getLightingMode()),
                    id: constStrings.floatingDisplayID,
                    style: loading ? ' opacity: 0.5;' : '',
                },
                ...HTMLElements, // spread syntax to expand array
            ),
        );
    }

    public static getFloatingDisplay(): HTMLElement | null {
        return document.getElementById(constStrings.floatingDisplayID);
    }

    public static removeFloatingDisplay(): void {
        const oldDisplay = this.getFloatingDisplay();
        if (oldDisplay) oldDisplay.remove(); // delete the old display
    }
}
