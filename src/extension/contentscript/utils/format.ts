import StatusedPromise from '../model/statusedPromise';
import { DisplayFormat } from '../types/display';
import { constStrings } from './constants';
import { ErrorData, isErrorData } from '../types/errorData';
import { isOvertimeObject, OvertimeData } from '../types/overtimeData';

export default class Formater {
    // =============== Data formatting ==================
    // ==================================================

    /**
     * Format the given OvertimeData to a string which can be displayed. If an ErrorData object is provided
     * the error message will be formatted. If the given obj is invalid a special error message will be returned.
     * @param data   the object which contains the overtime or error messages
     * @returns the formatted string derived from the given data object
     */
    public static formatDisplayText(data: OvertimeData | ErrorData): string {
        if (isOvertimeObject(data)) {
            return constStrings.prefixOvertime + data.overtimeText;
        }
        if (isErrorData(data)) {
            return constStrings.prefixError + data.error.message;
        } else {
            // no Data
            return constStrings.prefixOvertime + constStrings.errorMsgs.noData;
        }
    }

    /**
     * Determines the latest data which can be shown in the display.
     * This can be a loading placeholder if no data is available.
     * @param calcOvertimeData     the data from a calculate
     */
    public static async getLatestDisplayFormat(
        calcOvertimeData: StatusedPromise<Promise<OvertimeData | ErrorData>>,
    ): Promise<DisplayFormat> {
        if (calcOvertimeData.isResolved) {
            return {
                text: this.formatDisplayText(await calcOvertimeData.promise),
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
    public static throwIfErrorMessage(obj: object) {
        if (isErrorData(obj)) {
            throw new Error(obj.error.message);
        }
    }
}
