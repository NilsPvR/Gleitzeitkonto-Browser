const browser = require('webextension-polyfill');
const GleitzeitkontoBrowser = require('./gleitzeitkonto-browser-func'); // load script
const time = new GleitzeitkontoBrowser();

(async () => {
    'use strict';   

    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    if (!document.getElementById(time.constStrings.cssID)) { // if not already added
        const link = document.createElement('link');
        link.id = time.constStrings.cssID;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.media = 'all';
        link.href = browser.runtime.getURL('./gleitzeitkonto-browser.css');
        document.head.appendChild(link);
    }


    // ===== start sending all requests =====
    time.globalFlags.calculateFromCachedFinished = false;
    const promiseCalcKontoData = time.sendMsgToBackgroundS(time.givenStrings.calcaulteCommand);
    promiseCalcKontoData.then(() => time.globalFlags.calculateFromCachedFinished = true);

    const promiseDownloadKontoData = time.getDownloadKontoData(); // preload display to save time
    const promiseOutdatedIndex = time.checkVersionOutdated(); // preload version


    // ===== Wait for correct page to be opened =====
    await time.continuousMenucheck();


    // ===== Add floating display =====
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        time.addFloatingDisplay(time.constStrings.prefixOvertime + time.constStrings.overtimeLoading, true);
    }
    else if (config.siteVersion == 'external') {
        window.addEventListener('DOMContentLoaded', () => {
            time.addFloatingDisplay(time.constStrings.prefixOvertime + time.constStrings.overtimeLoading, true);
        });
    }
    // register button click for reload
    document.getElementById(time.constStrings.buttonID).addEventListener('click', () => { time.reloadGleitzeitKonto() });


    // ===== Register actions for promises resolving =====
    // update the display as soon as new data is available
    promiseCalcKontoData.then(async () => time.updateDisplay(await time.getLatestDisplayFormat(promiseCalcKontoData, promiseDownloadKontoData, promiseOutdatedIndex)));
    promiseDownloadKontoData.then(async () => time.updateDisplay(await time.getLatestDisplayFormat(promiseCalcKontoData, promiseDownloadKontoData, promiseOutdatedIndex)));
    promiseOutdatedIndex.then(async () => time.updateDisplay(await time.getLatestDisplayFormat(promiseCalcKontoData, promiseDownloadKontoData, promiseOutdatedIndex)));


    try {
        const headerBar = await time.waitForPageLoad();

        // Only add display when user is still on Zeiterfassung page
        if (time.checkCorrectMenuIsOpen()) {
            time.moveFloatingToInsertedDisplay(headerBar, document.getElementById(time.constStrings.floatingDisplayID));
        }
        
        time.updateInsertedDisplayOnChange(headerBar, promiseCalcKontoData, promiseDownloadKontoData, promiseOutdatedIndex);

    } catch (e) {
        time.removeFloatingDisplay(); // TODO show error in popup
        console.error(e);
    }
       
})();