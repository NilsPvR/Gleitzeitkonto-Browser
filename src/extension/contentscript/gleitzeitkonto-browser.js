const { constStrings, givenStrings, globalFlags } = require('./utils/constants.js');
const View = require('./view/view.js');
const Floating = require('./view/floating.js');
const Inserted = require('./view/inserted.js');
const Communication = require('./utils/communication.js');
const Navigation = require('./utils/navigation.js');
const Data = require('./utils/format.js');

(async () => {
    'use strict';

    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    View.addCustomCSS('./gleitzeitkonto-browser.css');

    // ===== start sending all requests =====
    globalFlags.calculateFromCachedFinished = false;
    const promiseCalcKontoData = Communication.sendMsgToBackgroundS(givenStrings.calcaulteCommand);
    promiseCalcKontoData.then(() => (globalFlags.calculateFromCachedFinished = true));

    const promiseDownloadKontoData = Communication.getDownloadKontoData(); // preload display to save time
    const promiseOutdatedIndex = Communication.checkVersionOutdated(); // preload version

    // ===== Wait for correct page to be opened =====
    await Navigation.continuousMenucheck();

    // ===== Add floating display =====
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        Floating.addFloatingDisplay(
            constStrings.prefixOvertime + constStrings.overtimeLoading,
            true,
        );
    } else if (Navigation.getPageVariant() == 'external') {
        window.addEventListener('DOMContentLoaded', () => {
            Floating.addFloatingDisplay(
                constStrings.prefixOvertime + constStrings.overtimeLoading,
                true,
            );
        });
    }
    // register button click for reload
    document.getElementById(constStrings.buttonID).addEventListener('click', () => {
        reloadGleitzeitKonto();
    });


    // ===== Register actions for promises resolving =====
    // update the display as soon as new data is available
    promiseCalcKontoData.then(async () =>
        View.updateDisplay(
            await Data.getLatestDisplayFormat(
                promiseCalcKontoData,
                promiseDownloadKontoData,
                promiseOutdatedIndex,
            ),
        ),
    );
    promiseDownloadKontoData.then(async () =>
        View.updateDisplay(
            await Data.getLatestDisplayFormat(
                promiseCalcKontoData,
                promiseDownloadKontoData,
                promiseOutdatedIndex,
            ),
        ),
    );
    promiseOutdatedIndex.then(async () =>
        View.updateDisplay(
            await Data.getLatestDisplayFormat(
                promiseCalcKontoData,
                promiseDownloadKontoData,
                promiseOutdatedIndex,
            ),
        ),
    );

    try {
        const headerBar = await Navigation.waitForPageLoad();

        updateInsertedDisplayOnChange(
            headerBar,
            promiseCalcKontoData,
            promiseDownloadKontoData,
            promiseOutdatedIndex,
        );
    } catch (e) {
        Floating.removeFloatingDisplay(); // TODO show error in popup
        console.error(e);
    }
})();

// ============ Main action taking functions =============
// =======================================================

// Update the display continuously for as long as the script is loaded
// It is asumed that the page has already loaded completely
async function updateInsertedDisplayOnChange(
    pHeaderBar,
    promiseCalcKontoData,
    promiseDownloadKontoData,
    promiseOutdatedIndex,
) {
    const placeOrRemoveInsertedDisplay = async () => {
        // When correct page is open and the display doesn't already exist
        if (Navigation.checkCorrectMenuIsOpen() && !Floating.getInsertedDisplay()) {
            const latestDisplayFormat = await Data.getLatestDisplayFormat(
                promiseCalcKontoData,
                promiseDownloadKontoData,
                promiseOutdatedIndex,
            );
            Inserted.addInsertedDisplay(
                pHeaderBar,
                latestDisplayFormat.text,
                latestDisplayFormat.loading,
            );
        } else if (!Navigation.checkCorrectMenuIsOpen()) {
            // This will also be removed by Fiori but keep remove just in case this behaviour gets changed
            Inserted.removeInsertedDisplay();
        }
    };

    window.addEventListener('hashchange', async () => {
        await placeOrRemoveInsertedDisplay();
    });

    // Check if the HeaderBar is being manipulated -> Fiori does sometimes remove the inserted display
    const observer = new MutationObserver(async () => {
        await placeOrRemoveInsertedDisplay();
    });

    // add the display to make sure the observer can actually observe something and the display isn't already removed
    await placeOrRemoveInsertedDisplay();

    observer.observe(pHeaderBar, {
        // config
        attrtibutes: false,
        childList: true,
        subtree: true,
    });
}

// called from the reload btn, recalculates the Gleitzeitkontos
function reloadGleitzeitKonto() {
    View.startLoading(); // start loading immediately

    // == Start new requests ==
    globalFlags.calculateFromCachedFinished = false;
    const promiseCalcKontoData = Communication.sendMsgToBackgroundS(givenStrings.calcaulteCommand);
    promiseCalcKontoData.then(() => (globalFlags.calculateFromCachedFinished = true));
    const promiseDownloadKontoData = Communication.getDownloadKontoData();

    // == Register actions for promises resolving ==
    promiseCalcKontoData.then(async () =>
        View.updateDisplay(
            await Data.getLatestDisplayFormat(promiseCalcKontoData, promiseDownloadKontoData),
        ),
    );
    promiseDownloadKontoData.then(async () =>
        View.updateDisplay(
            await Data.getLatestDisplayFormat(promiseCalcKontoData, promiseDownloadKontoData),
        ),
    );
}
