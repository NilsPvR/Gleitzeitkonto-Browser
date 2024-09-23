import { config, constStrings } from './utils/constants';
import View from './view/view';
import Floating from './view/floating';
import Inserted from './view/inserted';
import Communication from './utils/communication';
import Navigation from './utils/navigation';
import Data from './utils/format';
import { AccountData, ErrorData } from './types/accountData';
import SettingsSync from './utils/settingsSync';
import { BackgroundCommand } from '../common/enums/command';
import Formater from './utils/format';
import DateManger from './utils/dateManager';
import StatusedPromise from './model/statusedPromise';

(async () => {
    'use strict';

    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    // ===== Start sending all requests =====
    const communication = new Communication();

    const calculatedData = new StatusedPromise(calculateNewAccountData(communication));

    // ===== Wait for correct page to be opened =====
    await Navigation.continuousMenucheck();
    await Navigation.waitForDOMContentLoaded();

    // ===== Add floating display =====
    Floating.addFloatingDisplay(constStrings.prefixOvertime + constStrings.overtimeLoading, true);

    // register button click for reload
    const realodBtn = document.getElementById(constStrings.buttonID);
    if (realodBtn) {
        realodBtn.addEventListener('click', () => {
            realodAccountData(communication);
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

        const settingsSync = new SettingsSync();
        settingsSync.updateDisplayOnExtensionStateChange(); // TODO rename to DisplayState
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
    calculatedData: StatusedPromise<Promise<AccountData | ErrorData>>,
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
async function calculateNewAccountData(
    communication: Communication,
): Promise<AccountData | ErrorData> {
    try {
        const timeStatement = sendTimeStatementData(communication);
        const timeSheet = sendTimeSheetData(communication);

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
    return getAccountData(communication);
}

// throws a displayable error message in case anything goes wrong
async function sendTimeStatementData(communication: Communication) {
    // === Employee ID ===
    let employeeData;
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
        console.error('Received response from background without employee ID');
        throw new Error(constStrings.errorMsgs.unexpectedBackgroundResponse);
    }

    // === Time statement a.k.a. PDF file ===
    let rawTimeStatementData;
    try {
        rawTimeStatementData = await communication.fetchTimeStatement(
            employeeIdResponse.employeeId,
            DateManger.calculateTimeStatementStartDate(config.monthsToCalculateManually),
            DateManger.calcualteTimeStatementEndDate(config.monthsToCalculateManually),
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
        timeSheetData = await communication.fetchWorkingTimes(
            DateManger.calculateTimeSheetStartDate(config.monthsToCalculateManually),
            DateManger.calculateTimeSheetEndDate(),
        );
    } catch (e) {
        console.error(e);
        throw new Error(constStrings.errorMsgs.unableToContactAPI);
    }

    const timeSheetResponse = await communication.sendMsgToBackground(
        BackgroundCommand.ParseTimeSheet,
        timeSheetData,
    );

    Formater.checkForErrorMsg(timeSheetResponse);
    // background only sends content if there is an error
}

async function getAccountData(communication: Communication): Promise<AccountData | ErrorData> {
    const overtimeResponse = await communication.sendMsgToBackground(BackgroundCommand.GetOvertime);

    if (
        'error' in overtimeResponse &&
        typeof overtimeResponse.error == 'object' &&
        overtimeResponse.error &&
        'message' in overtimeResponse.error &&
        typeof overtimeResponse.error.message == 'string'
    ) {
        return <ErrorData>overtimeResponse;
    } else if ('accountString' in overtimeResponse) {
        return <AccountData>overtimeResponse;
    }

    return { error: { message: constStrings.errorMsgs.unexpectedBackgroundResponse } };
}

// called from the reload btn, recalculates the overtime
export function realodAccountData(communication: Communication) {
    View.startLoading(); // start loading immediately

    // == Start new request ==
    const calculatedData = new StatusedPromise(calculateNewAccountData(communication));

    // == Register action for promise resolving ==
    calculatedData.promise.then(async () => {
        View.updateDisplay(await Data.getLatestDisplayFormat(calculatedData));
    });
}
