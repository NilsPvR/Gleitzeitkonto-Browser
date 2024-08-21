export const constStrings = {
    // prettier-ignore
    errorMsgs: {
        invalidRequest: 'Anfrage von ungültiger extension ID erhalten. Anfrage wird abgelehnt.',
        invalidCommand: 'Interner Fehler: ungültiger Befehl!',
        unableToParseJSON: 'Ungültige Daten erhalten.',
    },
    internalErrorMsgs: {
        unableToParseObj: 'Object is not in form of expected class',
    },
};

/** Strings defined by external third parties, e.g. Fiori */
export const givenStrings = {
    /**
     * The start of the JSON for the working times. The JSON is expected to start with
     * an object 'd' holding an object 'results' which holds an array.
     */
    jsonStartString: '{"d":{"results":[',
    /**
     * The end of the JSON for the working times. The JSON is expected to end with
     * closing the previously openend array and objects, followed by a newline (CRLF).
     */
    jsonEndString: ']}}\r\n',
    flexDayAttendanceType: 9003,
};
