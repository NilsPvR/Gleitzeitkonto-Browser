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
    maxPageloadingLoops: 120, // 2 minutes
    internal: {
        // config for the internal page
        sideDistance: '11rem', // css margin from the right for floating display
    },
    external: {
        sideDistance: '9rem',
    },
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
        keineDatenVonCompanionApp: 'Keine Daten von der CompanionApp erhalten.',
        pageloadingtimeExceeded: 'Die Seite hat zu lange geladen. Das Gleitzeitkonto kann nicht angezeigt werden.',
        incorrectPath: 'Falscher Browser-Pfad für die API. Bitte Einstellungen im Popup anpassen.', // code 1
        notInNetwork: 'Nicht im BTC Netz - Du musst mit LAN oder dem BTC-Office-WLAN verbunden sein.', // code 2
        tooManyCSV: 'Zu viele CSV-Dateien im Ordner der API. Bitte Dateien manuell löschen.', // code 3
        unknownAPI: 'Unbekannter Fehler der API.', // code 4
        unknown: 'Unbekannter Fehler.',
        extensionOutdated: 'Bitte die Erweiterung aktualisieren!',
        companionAppOutdated: 'Bitte die CompanionApp aktualisieren!'
    },
};

/** Strings defined by external third parties, e.g. Fiori */
export const givenStrings = {
    gleitzeitHash: '#btccatstime-create',
    headerID: 'shell-header',
    headerEndID: 'shell-header-hdr-end',
    downloadCommand: 'downloadWorkingTimes',
    calcaulteCommand: 'calculateFromWorkingTimes',
    waitForDownlodCommand: 'waitfordownload',
    versionCommand: 'version',
    githubAPIURL: 'https://api.github.com/repos/NilsPvR/Gleitzeitkonto-Browser/releases/latest',
};

export const globalFlags = {
    calculateFromCachedFinished: false,
    downloadFinished: false,
    versionCheckFinished: false,
};
