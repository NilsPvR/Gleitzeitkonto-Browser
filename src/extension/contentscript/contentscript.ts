import { constStrings } from './utils/constants';
import View from './view/view';
import Floating from './view/floating';
import Inserted from './view/inserted';
import Communication from './utils/communication';
import Navigation from './utils/navigation';
import Data from './utils/format';
import State from './model/state';
import { BackgroundCommand } from '../common/enums/command';
import { PageVariant } from './enums/pageVariant';
import { AccountData, ErrorData } from './types/accountData';

(async () => {
    'use strict';

    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    View.addCustomCSS('./contentscript/gleitzeitkonto-browser.css');

    // ===== Start sending all requests =====
    const state = new State();

    const calculatedData = Communication.downloadWorkingTimes().then(async (/* data: string */) => {
        const data = 'TEST DUMMY DATA'; // TODO send actual data

        state.downloadFinished = true;
        return await Communication.sendMsgToBackground(BackgroundCommand.calculateOvertime, data);
    });

    const outdated = Communication.checkVersionOutdated(); // preload version

    // ===== Wait for correct page to be opened =====
    await Navigation.continuousMenucheck();

    // ===== Add floating display =====
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        Floating.addFloatingDisplay(
            constStrings.prefixOvertime + constStrings.overtimeLoading,
            true,
        );
    } else if (Navigation.getPageVariant() == PageVariant.External) {
        window.addEventListener('DOMContentLoaded', () => {
            Floating.addFloatingDisplay(
                constStrings.prefixOvertime + constStrings.overtimeLoading,
                true,
            );
        });
    }
    // register button click for reload
    const realodBtn = document.getElementById(constStrings.buttonID);
    if (realodBtn) {
        realodBtn.addEventListener('click', () => {
            reloadGleitzeitKonto(state);
        });
    }

    // ===== Register actions for promises resolving =====
    // update the display as soon as new data is available
    calculatedData.then(async () => {
        state.calculateFinished = true;
        View.updateDisplay(await Data.getLatestDisplayFormat(calculatedData, outdated, state));
    });
    outdated.then(async () => {
        state.versionCheckFinished = true;
        View.updateDisplay(await Data.getLatestDisplayFormat(calculatedData, outdated, state));
    });

    try {
        const headerBar = await Navigation.waitForPageLoad();

        updateInsertedDisplayOnChange(headerBar, calculatedData, outdated, state);
    } catch (e) {
        Floating.removeFloatingDisplay(); // TODO show error in popup
        console.error(e);
    }
})();

// ============ Main action taking functions =============
// =======================================================

// update the display continuously for as long as the script is loaded
// it is assumed that the page has already loaded completely
async function updateInsertedDisplayOnChange(
    headerBar: HTMLElement,
    calculatedData: Promise<AccountData | ErrorData | Object>,
    outdated: Promise<boolean>,
    state: State,
) {
    const placeOrRemoveInsertedDisplay = async () => {
        // when correct page is open and the display doesn't already exist
        if (Navigation.checkCorrectMenuIsOpen() && !Inserted.getInsertedDisplay()) {
            const latestDisplayFormat = await Data.getLatestDisplayFormat(
                calculatedData,
                outdated,
                state,
            );
            Inserted.addInsertedDisplay(
                headerBar,
                latestDisplayFormat.text,
                latestDisplayFormat.loading,
                state,
            );
        } else if (!Navigation.checkCorrectMenuIsOpen()) {
            // this will also be removed by Fiori but keep remove just in case this behaviour gets changed
            Inserted.removeInsertedDisplay();
        }
    };

    window.addEventListener('hashchange', async () => {
        await placeOrRemoveInsertedDisplay();
    });

    // check if the HeaderBar is being manipulated -> Fiori does sometimes remove the inserted display
    const observer = new MutationObserver(async () => {
        await placeOrRemoveInsertedDisplay();
    });

    // add the display to make sure the observer can actually observe something and the display isn't already removed
    await placeOrRemoveInsertedDisplay();

    observer.observe(headerBar, {
        // config
        attributes: false,
        childList: true,
        subtree: true,
    });
}

// called from the reload btn, recalculates the Gleitzeitkontos
export function reloadGleitzeitKonto(state: State) {
    View.startLoading(); // start loading immediately

    // == Start new requests ==
    state.downloadFinished = false;
    state.calculateFinished = false;

    let calculatedData = new Promise<Object>(() => {});
    Communication.downloadWorkingTimes().then((/* data: string */) => {
        const data = 'TEST DUMMY DATA'; // TODO send actual data

        state.downloadFinished = true;
        calculatedData = Communication.sendMsgToBackground(
            BackgroundCommand.calculateOvertime,
            data,
        );
    });

    // == Register actions for promise resolving ==
    calculatedData.then(async () => {
        state.calculateFinished = true;
        View.updateDisplay(
            await Data.getLatestDisplayFormat(calculatedData, Promise.resolve(false), state),
        );
    });
}
