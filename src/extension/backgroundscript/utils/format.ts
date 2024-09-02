import { givenStrings } from './constants';

export default class Formater {
    /**
     * Retreives the JSON object holding the working times from the API data. Unecessary extra inforamtion
     * is removed and the JSON extracted.
     * @param data    the unformatted API data holding the working times
     * @returns the retreived JSON object
     * @throws if the data can't be parsed for any reason
     */
    public static getJSONFromAPIData(data: string): object {
        const startIndex = data.indexOf(givenStrings.jsonStartString);
        if (startIndex === -1) {
            throw new Error('Unable to find start of working times JSON');
        }

        const endIndex = data.indexOf(givenStrings.jsonEndString);
        if (endIndex === -1) {
            throw new Error('Unable to find end of working times JSON');
        }

        // + length to include the closing brackets
        const jsonString = data.slice(startIndex, endIndex + givenStrings.jsonEndString.length);

        return JSON.parse(jsonString);
    }

    public static getDateFromYYYYMMDD(date: string): Date {
        return new Date(`${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`);
    }

    /**
     * Gets a Datetime object from the provided date and time.
     * @param date    the date or more precise the day to use
     * @param time    the time in the format HHMMSS
     */
    public static getDateFromDateAndTime(date: Date, time: string): Date {
        return new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            Number(time.substring(0, 2)),
            Number(time.substring(2, 4)),
            Number(time.substring(4)),
        );
    }

    /**
     * Checks whether or not the provided Date objects reference the same day while
     * ignoring the time.
     * @returns true if both Date objects reference the same day
     */
    public static isSameDay(date1: Date, date2: Date) {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }

    public static getMinutesBetween(date1: Date, date2: Date) {
        const diffInMs = Math.abs(date1.getTime() - date2.getTime());
        // convert milliseconds to seconds
        return diffInMs / (1000 * 60);
    }

    /**
     * Formats the given minutes into a human readable string of hours and minutes.
     * For example 80 -> 1h 20min
     * @param minutes can be positive or negative
     * @returns the formatted time string
     */
    public static minutesToTimeString(minutes: number): string {
        const remainingMinutes = Math.abs(minutes) % 60;
        const wholeHours = (Math.abs(minutes) - remainingMinutes) / 60;

        let result = minutes < 0 ? '-' : '';
        if (wholeHours > 0) {
            result += wholeHours + 'h';
            if (remainingMinutes > 0) {
                result += ' ';
            } else {
                return result;
            }
        }
        return result + remainingMinutes + 'min';
    }

    /**
     * Takes a string which will be converted into a number. The string maybe an empty or whitespace only
     * string then 0 will be returned. The string may use `,` or `.` as a decimal point.
     * @returns the number or 0
     * @throws if the input is not a number
     */
    public static getNumberFromString(input: string): number {
        if (input.trim().length == 0) {
            return 0;
        }
        const number = Number(input.trim().replace(',', '.'));
        if (Number.isNaN(number)) {
            throw new Error(
                'Invalid input string which does not represent a number. Received: ' + input,
            );
        }
        return number;
    }
}
