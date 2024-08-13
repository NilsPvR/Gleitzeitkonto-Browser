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

        // TODO use model with parsing
        return JSON.parse(jsonString);
    }
}
