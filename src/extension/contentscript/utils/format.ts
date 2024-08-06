import { AccountData, ErrorData } from '../types/accountData';
import { DisplayFormat } from '../types/display';
import { constStrings, globalFlags } from './constants';

export default class Communication {
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
     * @param outdated            true if extension is outdated
     */
    public static async getLatestDisplayFormat(
        calcAccountData: Promise<AccountData | ErrorData | Object>,
        downloadAccountData: Promise<AccountData | ErrorData | Object>,
        outdated: Promise<boolean>,
    ): Promise<DisplayFormat> {
        if (globalFlags.versionCheckFinished && (await outdated)) {
            // version outdated has highest priority
            return {
                text: constStrings.prefixError + constStrings.errorMsgs.companionAppOutdated,
                loading: false,
            };
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
