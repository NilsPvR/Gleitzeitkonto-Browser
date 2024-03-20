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

    time.globalFlags.calculateFromCachedFinished = false;
    const promiseCalcKontoData = time.sendMsgToBackgroundS(time.givenStrings.calcaulteCommand);
    promiseCalcKontoData.then(() => time.globalFlags.calculateFromCachedFinished = true);

    const promiseDownloadKontoData = time.getDownloadKontoData(); // preload display to save time
    const versionOutdatedIndex = time.checkVersionOutdated(); // preload version

    // Only load the rest of the script once the page for 'Zeiterfassung' ist opened
    await time.continuousMenucheck();

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        time.addFloatingDisplay(time.constStrings.prefixOvertime + time.constStrings.overtimeLoading, true);
    }
    else if (config.siteVersion == 'external') {
        window.addEventListener('DOMContentLoaded', () => {
            time.addFloatingDisplay(time.constStrings.prefixOvertime + time.constStrings.overtimeLoading, true);
        });
    }
    // Load event fires too early so no point using that

    // register button click for reload
    document.getElementById(time.constStrings.buttonID).addEventListener('click', () => { time.reloadGleitzeitKonto() });

    // don't await 'promiseDisplayText' even tho we want to change this as soon as the promiseDisplayText is fullfilled,
    // but if the page loads before the promise resolves then the display should be movedToInserted asap
    // -> let this happen asynchronously
    
    time.updateDisplay(promiseCalcKontoData, true);
    time.updateDisplay(promiseDownloadKontoData, false);


    try {
        const headerBar = await time.waitForPageLoad();

        // Only add display when user is still on Zeiterfassung page
        if (time.checkCorrectMenuIsOpen()) {
            time.moveFloatingToInsertedDisplay(headerBar, document.getElementById(time.constStrings.floatingDisplayID));
        }
        
        time.updateInsertedDisplayOnChange(headerBar, promiseCalcKontoData, promiseDownloadKontoData, versionOutdatedIndex);

        await promiseCalcKontoData; // wait until the text has been added
        if (await versionOutdatedIndex != 0) { // version is outdated
            if (await versionOutdatedIndex == 1) time.updateDisplayText(time.constStrings.prefixError + time.constStrings.errorMsgs.extensionOutdated);
            else if (await versionOutdatedIndex == 2) time.updateDisplayText(time.constStrings.prefixError + time.constStrings.errorMsgs.companionAppOutdated);

            const refreshButton = document.getElementById(time.constStrings.buttonID);
            if (refreshButton) refreshButton.disabled = true; // disable button
        }

    } catch (e) {
        time.removeFloatingDisplay(); // TODO show error in popup
        console.error(e);
    }
       
})();