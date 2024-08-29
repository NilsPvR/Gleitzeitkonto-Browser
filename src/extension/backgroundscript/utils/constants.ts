export const config = {
    publicHolidays: [
        { day: 24, month: 11, freeTimeFactor: 0.5 }, // Christmas Eve
        { day: 31, month: 11, freeTimeFactor: 0.5 }, // New Year's Eve
    ],
};

export const constStrings = {
    // prettier-ignore
    errorMsgs: {
        invalidRequest: 'Anfrage von ungültiger extension ID erhalten. Anfrage wird abgelehnt.',
        invalidCommand: 'Interner Fehler: ungültiger Befehl!',
        unableToParseData: 'Ungültige Daten erhalten.',
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
    pdfOvertimeString: {
        en: 'Total Flextime Balance',
        de: 'GLZ-Saldo aktuell',
    },
};
