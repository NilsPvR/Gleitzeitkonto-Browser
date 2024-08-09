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
        extensionOutdated: 'Bitte die Erweiterung aktualisieren!',
    },
    cssClasses: {
        lightMode: 'gleitzeitkonto-light',
        darkMode: 'gleitzeitkonto-dark',
    },
};

/** Strings defined by external third parties, e.g. Fiori */
export const givenStrings = {
    gleitzeitHash: '#btccatstime-create',
    headerID: 'shell-header',
    headerEndID: 'shell-header-hdr-end',
    githubAPIURL: 'https://api.github.com/repos/NilsPvR/Gleitzeitkonto-Browser/releases/latest',
};
