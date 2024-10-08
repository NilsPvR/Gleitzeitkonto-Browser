import StatusedPromise from '../model/statusedPromise';
import { AccountData, ErrorData } from '../types/accountData';
import { DisplayFormat } from '../types/display';
import { constStrings } from './constants';

export default class Formater {
    // =============== Data formatting ==================
    // ==================================================

    /**
     * Format the given AccountData object to a string which can be displayed. If an ErrorData object is provided
     * the error message will be formatted. If the AccountData is invalid a special error message will be returned.
     * @param accountData   the object which contains the accountString or error messages
     * @returns the formatted string derived from the given AccountData object
     */
    public static formatDisplayText(accountData: AccountData | ErrorData): string {
        if ('error' in accountData) {
            return constStrings.prefixError + accountData.error.message; // error occured
        }
        if (!accountData || !('accountString' in accountData)) {
            // no Data
            return constStrings.prefixError + constStrings.errorMsgs.noData;
        } else {
            return constStrings.prefixOvertime + accountData.accountString;
        }
    }

    /**
     * Determines the latest data which can be shown in the display.
     * This can be a loading placeholder if no data is available.
     * @param calcAccountData     the data from a calculate
     */
    public static async getLatestDisplayFormat(
        calcAccountData: StatusedPromise<Promise<AccountData | ErrorData>>,
    ): Promise<DisplayFormat> {
        if (calcAccountData.isResolved) {
            return {
                text: this.formatDisplayText(await calcAccountData.promise),
                loading: false,
            };
        }
        // no data to show
        return {
            text: constStrings.prefixOvertime + constStrings.overtimeLoading,
            loading: true,
        };
    }

    /**
     * Takes the given date and returns the date in the format YYYYMMDD. The method uses local time since
     * the date created is in local time and the day should therefore also be determined with local time!
     * @param date    the date to be formatted
     * @returns the formatted date string
     */
    public static formatDateToYYYYMMDD(date: Date): string {
        // 0 indexed month to normal number, add leading 0 if necessary
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // add leading 0 if necessary
        const day = String(date.getDate()).padStart(2, '0');

        return `${date.getFullYear()}${month}${day}`;
    }

    public static convertArrayBufferToBase64(buffer: ArrayBuffer): string {
        const byteArray = new Uint8Array(buffer);
        let binaryString = '';
        for (let i = 0; i < byteArray.byteLength; i++) {
            binaryString += String.fromCharCode(byteArray[i]);
        }

        return btoa(binaryString);
    }

    /**
     * @throws if the given object implements the `ErrorData` interface with the contained message
     */
    public static checkForErrorMsg(obj: object) {
        if (
            'error' in obj &&
            typeof obj.error == 'object' &&
            obj.error &&
            'message' in obj.error &&
            typeof obj.error.message == 'string'
        ) {
            throw new Error(obj.error.message);
        }
    }
}
