import { config, constStrings } from './utils/constants';
import View from './view/view';
import Floating from './view/floating';
import Inserted from './view/inserted';
import Communication from './utils/communication';
import Navigation from './utils/navigation';
import Data from './utils/format';
import { ErrorData, isErrorData } from '../common/types/errorData';
import SettingsSync from './utils/settingsSync';
import { BackgroundCommand } from '../common/enums/command';
import StatusedPromise from './model/statusedPromise';
import TimeStatementManager from './utils/timeStatementManager';
import TimeSheetManager from './utils/timeSheetManager';
import { isOvertimeObject, OvertimeData } from '../common/types/overtimeData';

(async () => {
    'use strict';

    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    // ===== Start sending all requests =====
    const communication = new Communication();

    const calculatedData = new StatusedPromise(calculateNewOvertimeData(communication));

    // ===== Wait for correct page to be opened =====
    await Navigation.continuousMenucheck();
    await Navigation.waitForDOMContentLoaded();

    // ===== Add floating display =====
    Floating.addFloatingDisplay(constStrings.prefixOvertime + constStrings.overtimeLoading, true);

    // register button click for reload
    const realodBtn = document.getElementById(constStrings.buttonID);
    if (realodBtn) {
        realodBtn.addEventListener('click', () => {
            reloadOvertimeData(communication);
        });
    }

    // ===== Register actions for promises resolving =====
    // update the display as soon as new data is available
    calculatedData.promise.then(async () => {
        View.updateDisplay(await Data.getLatestDisplayFormat(calculatedData));
    });

    try {
        const headerBar = await Navigation.waitForPageLoad(
            config.pageloadingTimeout,
            config.maxPageloadingLoops,
        );

        updateInsertedDisplayOnChange(headerBar, calculatedData, communication);

        const settingsSync = new SettingsSync(communication);
        settingsSync.updateDisplayOnDisplayEnabledChange(headerBar);
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
    calculatedData: StatusedPromise<Promise<OvertimeData | ErrorData>>,
    communication: Communication,
) {
    const placeOrRemoveInsertedDisplay = async () => {
        // when correct page is open and the display doesn't already exist
        if (Navigation.checkCorrectMenuIsOpen() && !Inserted.getInsertedDisplay()) {
            const latestDisplayFormat = await Data.getLatestDisplayFormat(calculatedData);
            new Inserted(communication).addInsertedDisplay(
                headerBar,
                latestDisplayFormat.text,
                latestDisplayFormat.loading,
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

// fetches data and sends requests to background script, returns a displayable text in any case
async function calculateNewOvertimeData(
    communication: Communication,
): Promise<OvertimeData | ErrorData> {
    try {
        const timeStatement = new TimeStatementManager(communication).sendTimeStatementData();
        const timeSheet = new TimeSheetManager(communication).sendTimeSheetData();

        // wait until both requests finished before calculating total overtime
        await timeStatement;
        await timeSheet;
    } catch (e) {
        if (typeof e !== 'object' || !e || !('message' in e) || typeof e.message !== 'string') {
            // should never happen but in case we didn't catch an Error object but something else
            console.error(e);
            return {
                error: {
                    message: constStrings.errorMsgs.unknown,
                },
            };
        }
        return {
            error: {
                message: e.message,
            },
        };
    }
    return getOvertimeData(communication);
}

export async function getOvertimeData(
    communication: Communication,
): Promise<OvertimeData | ErrorData> {
    const overtimeResponse = await communication.sendMsgToBackground(BackgroundCommand.GetOvertime);

    if (!isOvertimeObject(overtimeResponse) && !isErrorData(overtimeResponse)) {
        return { error: { message: constStrings.errorMsgs.unexpectedBackgroundResponse } };
    }
    return overtimeResponse;
}

// called from the reload btn, recalculates the overtime
export function reloadOvertimeData(communication: Communication) {
    View.startLoading(); // start loading immediately

    // == Start new request ==
    const calculatedData = new StatusedPromise(calculateNewOvertimeData(communication));

    // == Register action for promise resolving ==
    calculatedData.promise.then(async () => {
        View.updateDisplay(await Data.getLatestDisplayFormat(calculatedData));
    });
}
