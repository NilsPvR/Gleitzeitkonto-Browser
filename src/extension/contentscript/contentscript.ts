import { config, constStrings } from './utils/constants';
import View from './view/view';
import Inserted from './view/inserted';
import Communication from './utils/communication';
import Navigation from './utils/navigation';
import Formater from './utils/format';
import SettingsSync from './utils/settingsSync';
import StatusedPromise from './model/statusedPromise';
import { DisplayFormat } from './types/display';
import OvertimeManager from './utils/overtimeManager';

(async () => {
    'use strict';

    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    // ===== Start sending all requests =====
    const communication = new Communication();
    const overtimeManager = new OvertimeManager(communication)

    const calculatedData = new StatusedPromise(overtimeManager.calculateNewOvertimeData());

    // ===== Wait for correct page to be opened =====
    await Navigation.continuousMenucheck();
    await Navigation.waitForDOMContentLoaded();

    // ===== Add floating display =====
    const displayState: DisplayFormat = { text: constStrings.prefixOvertime + constStrings.overtimeLoading, loading: true }
    const inserted = new Inserted(overtimeManager);
    const view = new View(inserted);
    view.renderDisplay(displayState); // render initial floating, loading display

    // register button click for reload
    overtimeManager.view = view;
    const realodBtn = document.getElementById(constStrings.buttonID);
    if (realodBtn) {
        realodBtn.addEventListener('click', () => {
            overtimeManager.reloadOvertimeData(displayState);
        });
    }

    // ===== Register actions for promises resolving =====
    // update the display as soon as new data is available
    calculatedData.promise.then(async () => {
        updateDisplayState(displayState, await Formater.getLatestDisplayFormat(calculatedData));
        view.renderDisplay(displayState);
    });

    try {
        const headerBar = await Navigation.waitForPageLoad(
            config.pageloadingTimeout,
            config.maxPageloadingLoops,
        );
        view.headerBar = headerBar;
        view.renderDisplay(displayState);
        updateDisplayOnChange(headerBar, displayState, view);

        const settingsSync = new SettingsSync(view);
        settingsSync.updateDisplayOnDisplayEnabledChange(displayState);
    } catch (e) {
        View.removeDisplay(); // TODO show error in popup
        console.error(e);
    }
})();

// ============ Main action taking functions =============
// =======================================================

// update the display continuously for as long as the script is loaded
async function updateDisplayOnChange(
    headerBar: HTMLElement,
    displayState: DisplayFormat,
    view: View,
) {
    const placeOrRemoveDisplay = async () => {
        if (Navigation.checkCorrectMenuIsOpen()) {
            view.renderDisplay(displayState, false);             
        } else if (!Navigation.checkCorrectMenuIsOpen()) {
            // this will also be removed by Fiori but keep remove just in case this behaviour gets changed
            View.removeDisplay();
        }
    };

    window.addEventListener('hashchange', async () => {
        await placeOrRemoveDisplay();
    });

    // check if the HeaderBar is being manipulated -> Fiori does sometimes remove the inserted display
    const observer = new MutationObserver(async () => {
        await placeOrRemoveDisplay();
    });
    observer.observe(headerBar, {
        // config
        attributes: false,
        childList: true,
        subtree: true,
    });
}

export function updateDisplayState(displayState: DisplayFormat, newDisplay: DisplayFormat) {
    displayState.text = newDisplay.text;
    displayState.loading = newDisplay.loading;
}