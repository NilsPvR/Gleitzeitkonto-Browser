export const config = {
    primaryColors: {
        dunkelblau: '#003869',
        mittelblau: '#5aa6e7',
        gelb: '#fbd200',
        grau: '#f5f5f5',
    },
    gleitzeitKontoColors: {
        blue: '#00aab4',
        grey: '#222222',
    },
    maxPageloadingLoops: 120, // 1s * 120 = 2 minutes
    pageloadingTimeout: 1000, // 1 s
    loadingOpacity: '0.5',
    startDate: new Date(2000, 0, 1), // month is 0-indexed
    endDate: new Date(2099, 11, 31),
};

export const constStrings = {
    floatingDisplayID: 'gleitzeitkonto-canvas-headline',
    insertedDisplayID: 'gleitzeitkonto-display',
    cssID: 'gleitzeitkonto-css',
    buttonID: 'gleitzeitkonto-reload-button',
    refreshIconID: 'refresh-icon',
    prefixOvertime: 'Gleitzeitkonto: ',
    prefixError: 'Fehler: ',
    overtimeLoading: 'Loading...',
    // prettier-ignore
    errorMsgs: {
        pageloadingtimeExceeded: 'Die Seite hat zu lange geladen. Das Gleitzeitkonto kann nicht angezeigt werden.',
        unknown: 'Unbekannter Fehler.',
        noData: 'Keine Daten erhalten.',
        unableToContactAPI: 'Nicht mehr eingeloggt. Bitte Seite neu laden!',
        unexpectedBackgroundResponse: 'Datenverarbeitung fehlgeschlagen.',
        extensionOutdated: 'Bitte die Erweiterung aktualisieren!',
    },
    cssClasses: {
        lightMode: 'gleitzeitkonto-light',
        darkMode: 'gleitzeitkonto-dark',
        displayLine: 'gleitzeit-display-line',
        insertedDisplay: 'inserted-display',
        floatingDisplay: 'floating-display',
        button: 'reset-button reload-button',
    },
};

/** Strings defined by external third parties, e.g. Fiori */
export const givenStrings = {
    gleitzeitHash: '#btccatstime-create',
    mainPageElement1: 'shellLayout',
    mainPageElement2: 'canvas',
    headerID: 'shell-header',
    headerEndID: 'shell-header-hdr-end',
    githubAPIURL: 'https://api.github.com/repos/NilsPvR/Gleitzeitkonto-Browser/releases/latest',
    timesheetURLPath: '/sap/opu/odata/sap/HCM_TIMESHEET_MAN_SRV/$batch?sap-client=300',
    /** This parts needs to be inserted into the external URL when not present */
    externalURLInsert: '-sapdelim-fesruntime',
    /** The string after which the `externalURLInsert` needs to be inserted */
    externalURLInsertAfter: 'xvixnuoa',
};
