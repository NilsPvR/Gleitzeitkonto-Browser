import { config, constStrings } from './utils/constants';
import View from './view/view';
import Floating from './view/floating';
import Inserted from './view/inserted';
import Communication from './utils/communication';
import Navigation from './utils/navigation';
import Data from './utils/format';
import State from './model/state';
import { AccountData, ErrorData } from './types/accountData';
import SettingsSync from './utils/settingsSync';
import { BackgroundCommand } from '../common/enums/command';
import Formater from './utils/format';
import DateManger from './utils/dateManager';

(async () => {
    'use strict';

    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    // ===== Start sending all requests =====
    const state = new State();
    const communication = new Communication();

    const calculatedData = calculateNewAccountData(communication);
    const outdated = communication.checkVersionOutdated(); // preload version

    // ===== Wait for correct page to be opened =====
    await Navigation.continuousMenucheck();
    await Navigation.waitForDOMContentLoaded();

    // ===== Add floating display =====
    Floating.addFloatingDisplay(constStrings.prefixOvertime + constStrings.overtimeLoading, true);

    // register button click for reload
    const realodBtn = document.getElementById(constStrings.buttonID);
    if (realodBtn) {
        realodBtn.addEventListener('click', () => {
            realodAccountData(communication, state);
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
        const headerBar = await Navigation.waitForPageLoad(
            config.pageloadingTimeout,
            config.maxPageloadingLoops,
        );

        updateInsertedDisplayOnChange(headerBar, calculatedData, outdated, communication, state);

        const settingsSync = new SettingsSync();
        settingsSync.updateDisplayOnExtensionStateChange();
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
    calculatedData: Promise<AccountData | ErrorData>,
    outdated: Promise<boolean>,
    communication: Communication,
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
            new Inserted(communication).addInsertedDisplay(
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


// fetches data and sends requests to background script, returns a displayable text in any case
async function calculateNewAccountData(communication: Communication): Promise<AccountData | ErrorData> {
    return new Promise((resolve) => {
        sendTimeStatementData(communication).catch((e) => {
            resolve({
                error: {
                    message: e.message
                }
            })
        }); // pdf
        sendTimeSheetData(communication).catch((e) => {
            resolve({
                error: {
                    message: e.message
                }
            })
        });
        resolve(getAccountData(communication))
    })
}

// throws a displayable error message in case anything goes wrong
async function sendTimeStatementData(communication: Communication) {
    // === Employee ID ===
    let employeeData
    try {
        employeeData = await communication.fetchEmployeeId();
    } catch (e) {
        console.error(e);
        throw new Error(constStrings.errorMsgs.unableToContactAPI);
    }
    
    const employeeIdResponse = await communication.sendMsgToBackground(
        BackgroundCommand.ParseEmployeeId,
        employeeData,
    );

    Formater.checkForErrorMsg(employeeIdResponse);
    if (
        !('employeeId' in employeeIdResponse) ||
        typeof employeeIdResponse.employeeId !== 'string'
    ) {
        console.error('Received response from background without employee ID')
        throw new Error(constStrings.errorMsgs.unexpectedBackgroundResponse);
    }


    // === Time statement a.k.a. PDF file ===
    let rawTimeStatementData;
    try {
        rawTimeStatementData = await communication.fetchTimeStatement(
            employeeIdResponse.employeeId,
            DateManger.calculateTimeStatementStartDate(),
            DateManger.calcualteTimeStatementEndDate(),
        );
    } catch (e) {
        console.error(e);
        throw new Error(constStrings.errorMsgs.unableToContactAPI);
    }
    
    const timeStatementResponse = await communication.sendMsgToBackground(
        BackgroundCommand.CompileTimeSatement,
        Formater.convertArrayBufferToBase64(rawTimeStatementData),
    );

    Formater.checkForErrorMsg(timeStatementResponse);
    // background only sends content if there is an error
} 

// throws a displayable error message in case anything goes wrong
async function sendTimeSheetData(communication: Communication) {
    let timeSheetData;
    try {
        timeSheetData = await communication.fetchWorkingTimes(config.startDate, config.endDate);
    } catch (e) {
        console.error(e);
        throw new Error(constStrings.errorMsgs.unableToContactAPI);
    }
    
    const timeSheetResponse = await communication.sendMsgToBackground(
        BackgroundCommand.ParseTimeSheet,
        timeSheetData
    );

    Formater.checkForErrorMsg(timeSheetResponse);
    // background only sends content if there is an error
}

async function getAccountData(
    communication: Communication,
): Promise<AccountData | ErrorData> {
    const overtimeResponse = await communication.sendMsgToBackground(
        BackgroundCommand.GetOvertime,
    );

    if (
        'error' in overtimeResponse &&
        typeof overtimeResponse.error == 'object' &&
        overtimeResponse.error &&
        'message' in overtimeResponse.error &&
        typeof overtimeResponse.error.message == 'string'
    ) {
        return <ErrorData>overtimeResponse;
    }
    else if ('accountString' in overtimeResponse) {
        return <AccountData>overtimeResponse;
    }

    return { error: { message: constStrings.errorMsgs.unexpectedBackgroundResponse } };
}

// called from the reload btn, recalculates the overtime
export function realodAccountData(communication: Communication, state: State) {
    View.startLoading(); // start loading immediately

    // == Start new requests ==
    state.calculateFinished = false;

    const calculatedData = calculateNewAccountData(communication);

    // == Register actions for promise resolving ==
    calculatedData.then(async () => {
        state.calculateFinished = true;
        View.updateDisplay(
            await Data.getLatestDisplayFormat(calculatedData, Promise.resolve(false), state),
        );
    });
}
