const GleitzeitkontoBrowser = require('./Gleitzeitkonto-Browser_func'); // load script
const time = new GleitzeitkontoBrowser();

(async () => {
    'use strict';   
    
    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    const promiseCalcText = time.fetchServer(time.givenStrings.calcaulteURL);
    const promiseDownloadText = time.getDownloadDisplayText(); // preload display to save time

    // Only load the rest of the script once the page for 'Zeiterfassung' ist opened
    await time.continuousMenucheck();

    // Double check; if a different menu is opened no floating display will be added
    if (time.checkCorrectMenuIsOpen()) {
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            time.addFloatingDisplay(time.constStrings.prefixOvertime + time.constStrings.overtimeLoading);
        }
        else if (config.siteVersion == 'external') {
            // Load event fires too early so no point using that
            window.addEventListener('DOMContentLoaded', (event) => {
                time.addFloatingDisplay(time.constStrings.prefixOvertime + time.constStrings.overtimeLoading);
            })
        }

        // don't await 'promiseDisplayText' even tho we want to change this as soon as the promiseDisplayText is fullfilled,
        // but if the page has loaded before the promise is resolved then just use addInsertedDisplay()
        // so therefore we shouldn't wait for the 'promiseDisplayText' but rather let this happen asynchronously
        time.updateFloatingDisplayAsync(promiseCalcText);
        time.updateFloatingDisplayAsync(promiseDownloadText); // TODO currently just hoping that download finishes after calc
            // if download finished earlier -> calcText (which might be old, even tho unlikly) will overwrite
            // maybe add some tag or so
    };


    let headerBar;
    let loops = 0; // track how often findHeaderBar ran

    // loop to check once the page has actually loaded
    // -> this is determined by checking if the headerbar of the page and the icons in the headerbar are available
    const waitForPageLoad = setInterval(async () => {
        loops++;
        headerBar = document.getElementById(time.givenStrings.headerBarID); // top bar, empty part
        const icons = document.getElementById(time.givenStrings.iconsID);


        if (headerBar && icons) {
            clearInterval(waitForPageLoad);

            // Only add display when user is still on Zeiterfassung page
            if (time.checkCorrectMenuIsOpen()) {
                time.addInsertedDisplay(headerBar, await promiseDownloadText); // make sure DisplayText loaded
            }
            
            time.updateDisplayOnURLChange(headerBar, await promiseDownloadText);
        }
        else if (loops > time.config.maxPageloadingLoops) { // page loaded too long or html got changed
            clearInterval(waitForPageLoad);
            time.removeFloatingDisplay(); // TODO show error in popup
            console.error(time.constStrings.errorMsgs.pageloadingtimeExceeded);
        }
    }, 1000); // will be limited to min. 1000 when tab not focused
})();