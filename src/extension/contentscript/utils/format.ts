import { AccountData, ErrorData } from '../types/accountData.js';
import { DisplayFormat } from '../types/display.js';
import { OutdatedIndicator } from '../enums/versionCheck.js';
import { constStrings, globalFlags } from './constants.js';

export class Communication {
    // =============== Data formatting ==================
    // ==================================================

    /**
     * Format the given accountData object to a string which can be displayed. The object is expected to have either accountData
     * or an error message however if neither of those is available a custom error string will be returned.
     * @param accountData   the object which contains the accountString or error messages
     * @returns the formatted string derived from the given accountData object
     */
    public static formatDisplayText(accountData: AccountData | ErrorData | Object): string {
        if ('error' in accountData && 'message' in accountData.error) {
            return constStrings.prefixError + accountData.error.message; // error occured
        }
        if (!accountData || !('accountString' in accountData)) {
            // No Data
            return constStrings.prefixError + constStrings.errorMsgs.keineDatenVonCompanionApp;
        } else {
            return constStrings.prefixOvertime + accountData.accountString;
        }
    }

    /**
     * Using the global flags the method determines the latest data which can be show in the display.
     * This can be a loading placeholder if no data is available.
     * @param calcAccountData     the data from a local calculate
     * @param downloadAccountData the data from a newly fetched download
     * @param outdatedIndicator   the indicator if some part is outdated
     */
    public static async getLatestDisplayFormat(
        calcAccountData: Promise<AccountData | ErrorData | Object>,
        downloadAccountData: Promise<AccountData | ErrorData | Object>,
        outdatedIndicator: Promise<OutdatedIndicator>,
    ): Promise<DisplayFormat> {
        if (
            globalFlags.versionCheckFinished &&
            (await outdatedIndicator) != OutdatedIndicator.UpToDate
        ) {
            // version outdated has highest priority
            if ((await outdatedIndicator) == OutdatedIndicator.ExtensionOutdated) {
                return {
                    text: constStrings.prefixError + constStrings.errorMsgs.extensionOutdated,
                    loading: false,
                };
            } else if ((await outdatedIndicator) == OutdatedIndicator.CompanionAppOutdated) {
                return {
                    text: constStrings.prefixError + constStrings.errorMsgs.companionAppOutdated,
                    loading: false,
                };
            }
        }
        if (globalFlags.downloadFinished) {
            // download availability has higher priority than calculate
            return {
                text: this.formatDisplayText(await downloadAccountData),
                loading: false,
            };
        }
        if (globalFlags.calculateFromCachedFinished) {
            return {
                text: this.formatDisplayText(await calcAccountData),
                loading: true,
            };
        }
        // no data to show
        return {
            text: constStrings.prefixOvertime + constStrings.overtimeLoading,
            loading: true,
        };
    }
}
