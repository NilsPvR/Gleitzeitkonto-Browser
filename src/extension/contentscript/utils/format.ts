const { constStrings, globalFlags } = require('./constants.js');

module.exports = class Communication {
    // =============== Data formatting ==================
    // ==================================================

    /**
     * Format the given kontoData object to a string which can be displayed. The object is expected to have either kontoData
     * or an error message however if neither of those is available a custom error string will be returned.
     * @param kontoData     Object - holding the kontostring or an error message, expected to have a form of:
     * { kontoString: "string"} or { error: { message: "errorMessage" } }
     * @returns     String - the formatted string derived from the given kontoData object
     */
    static formatDisplayText(kontoData) {
        if (kontoData?.error?.message) {
            return constStrings.prefixError + kontoData.error.message; // Error occured
        }
        if (!kontoData || !kontoData.kontoString) {
            return constStrings.prefixError + constStrings.errorMsgs.keineDatenVonCompanionApp;
        } else {
            // No Data
            return constStrings.prefixOvertime + kontoData.kontoString;
        }
    }

    // using the global flags the function detemines the latest data which can be shown in the display
    // returns { text: string, laoding: boolean }
    // promiseOutdatedIndex is optional
    static async getLatestDisplayFormat(
        promiseCalcKontoData,
        promiseDownloadKontoData,
        promiseOutdatedIndex,
    ) {
        if (globalFlags.versionCheckFinished && (await promiseOutdatedIndex) != 0) {
            // version outdated has highest priority
            if ((await promiseOutdatedIndex) == 1) {
                return {
                    text: constStrings.prefixError + constStrings.errorMsgs.extensionOutdated,
                    loading: false,
                };
            } else if ((await promiseOutdatedIndex) == 2) {
                return {
                    text: constStrings.prefixError + constStrings.errorMsgs.companionAppOutdated,
                    loading: false,
                };
            }
        }
        if (globalFlags.downloadFinished) {
            // download availability has higher priority than calculate
            return { text: this.formatDisplayText(await promiseDownloadKontoData), loading: false };
        }
        if (globalFlags.calculateFromCachedFinished) {
            return { text: this.formatDisplayText(await promiseCalcKontoData), loading: true };
        }
        // no data to show
        return {
            text: constStrings.prefixOvertime + constStrings.overtimeLoading,
            loading: true,
        };
    }
};
