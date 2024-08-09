import { constStrings } from '../utils/constants';
import Navigation from '../utils/navigation';
import Common from './common';

export default class Floating {
    // ========== floating display ==========

    public static addFloatingDisplay(pDisplayText: string, loading = false): void {
        const HTMLElements = Common.createInnerHTMLElements(pDisplayText, loading, false);
        const canvas = document.getElementById('shellLayout') ?? document.getElementById('canvas'); // main page element is the (almost) only one loaded when DOM is loaded
        if (!canvas) return; // unable to insert floating display, when canvas not available

        canvas.insertAdjacentElement(
            'beforebegin',
            Common.createRichElement(
                'div',
                {
                    class: `floating-display ${Navigation.getPageVariant().toString().toLowerCase()} ${Common.getLightingMode()}`,
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
