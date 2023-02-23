(async () => {
    'use strict';

    // TODO change browser to chrome for chrome and opera browser, firefox and edge use 'browser'
    const source = browser.runtime.getURL('./Gleitzeitkonto-Browser_func.js'); // use WebExtension API to get the file URL
    const fioriStundenModule = await import(source); // load script
    const time = new fioriStundenModule.default();

    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    const promiseDisplayText = time.getDisplayText(); // preload display to save time

    // Only load the rest of the script once the page for 'Zeiterfassung' ist opened
    await time.continuousMenucheck();

    // Double check, if a different menu is opened no floating display will be added
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
        time.updateFloatingDisplay(promiseDisplayText);
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
                time.addInsertedDisplay(headerBar, await promiseDisplayText); // make sure DisplayText loaded
            }
            
            time.updateDisplayOnURLChange(headerBar, await promiseDisplayText);
        }
        else if (loops > time.config.maxPageloadingLoops) { // page loaded too long or html got changed
            clearInterval(waitForPageLoad);
            time.removeFloatingDisplay(); // TODO show error in popup
            console.error(time.constStrings.errorMsgs.pageloadingtimeExceeded);
        }
    }, 1000); // will be limited to min. 1000 when tab not focused
})();