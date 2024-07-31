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

    // ===== Proof of Concept Fetching API directly =====
    const urlPath = '/sap/opu/odata/sap/HCM_TIMESHEET_MAN_SRV/$batch?sap-client=300';
    const csrfResponse = await fetch(new Request(window.location.origin + urlPath, {
        method: 'HEAD',
        credentials: 'include',
        headers: {
            'x-csrf-token': 'Fetch'
        }
    }));
    const csrfToken = csrfResponse.headers.get('x-csrf-token');
    
    const result = await fetch(new Request(window.location.origin + urlPath, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'x-csrf-token': csrfToken,
            'Priority': 'u=4',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Content-Type': 'multipart/mixed;boundary=batch',
        },
        body: `--batch
Content-Type: application/http
Content-Transfer-Encoding: binary

GET TimeDataList?sap-client=300&$filter=StartDate%20eq%20%2720240729%27%20and%20EndDate%20eq%20%2720240731%27 HTTP/1.1
Accept: application/json
X-CSRF-Token: ${csrfToken}
DataServiceVersion: 2.0
MaxDataServiceVersion: 2.0
X-Requested-With: XMLHttpRequest


--batch--`
    }));
    console.log(result);



    // ===== Register actions for promises resolving =====
    // update the display as soon as new data is available
    promiseCalcKontoData.then(async () => time.updateDisplay(await time.getLatestDisplayFormat(promiseCalcKontoData, promiseDownloadKontoData, promiseOutdatedIndex)));
    promiseDownloadKontoData.then(async () => time.updateDisplay(await time.getLatestDisplayFormat(promiseCalcKontoData, promiseDownloadKontoData, promiseOutdatedIndex)));
    promiseOutdatedIndex.then(async () => time.updateDisplay(await time.getLatestDisplayFormat(promiseCalcKontoData, promiseDownloadKontoData, promiseOutdatedIndex)));


    try {
        const headerBar = await time.waitForPageLoad();

        time.updateInsertedDisplayOnChange(headerBar, promiseCalcKontoData, promiseDownloadKontoData, promiseOutdatedIndex);

    } catch (e) {
        time.removeFloatingDisplay(); // TODO show error in popup
        console.error(e);
    }
       
})();