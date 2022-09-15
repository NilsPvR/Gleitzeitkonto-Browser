// ==UserScript==
// @name         Fiori-Stunden
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       NilsPvR
// @description  Überstunden einfügen in Fiori
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @match        *://*.ondemand.com/*
// @match        https://bgp.btcsap.btc-ag.com:44300/*

// ==/UserScript==

(async function() {
    'use strict';
    /* ==========================================================================================
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Config <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
    const config = {};

    // Check if extern or intern Fiori website, since these have different amounts of icons    
    if (window.location.origin == 'https://bgp.btcsap.btc-ag.com:44300') { // Intern Fiori
        config.siteVersion = 'internal';
        config.amountIcons = 4; // amount of icons to wait for to load
        config.sideDistance = '11rem'; // css margin from the right for floating display
    }    
    else { // extern
        config.siteVersion = 'external';
        config.amountIcons = 3;
        config.sideDistance = '9rem';
    }


    /* ==========================================================================================
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Functions <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    const fetchServer = async () => {
        try {
            let url = 'http://127.0.0.1:3000';
            let data = await (await fetch(url)).json();
            return data
        }
        catch (e) {
            console.log(e.message);
            console.log(e.message == 'NetworkError when attempting to fetch resource.')
            if (e.message == 'NetworkError when attempting to fetch resource.') {
                console.log('whoops\n' + e);
                return {errorMessage: 'Der Lokale-Server wurde nicht gestartet!'}
                
            }
            console.error(e);
        }
        
    };
    const getDisplayText = async () => {
        const res = await fetchServer();
        if (res.errorMessage) return `Fehler: ${res.errorMessage}`;
        else if (!res || !res.konto) return 'Fehler: Keine Daten vom Lokalen-Server geladen';
        else return `Gleitzeitkonto: ${res.konto}`;
    };
    
    // CSS doens't work on intern site
        // would have to be after canvas but this get's changed dynamically and therefore the h3 would be removed
    const addFloatingDisplay = (pDisplayText) => {
        const canvas = document.getElementById('canvas'); // main page element is the (almost) only one loaded when DOM is loaded
        canvas.insertAdjacentHTML('beforebegin',
            `<h3 id="gleitzeitkonto-canvas-headline"style="float: right; margin-top: 11px; margin-right: ${config.sideDistance}; color: rgb(1, 56, 105);">${pDisplayText ?? 'unknown error'}</h3>`);
    };

    const addInsertedDisplay = (pHeaderBar, pDisplayText) => {
        const oldDisplay = document.getElementById('gleitzeitkonto-canvas-headline');
        if (oldDisplay) oldDisplay.remove(); // delete the old display

        pHeaderBar.innerHTML += `<h3 style="display:flex; align-self: center; color: rgb(1, 56, 105);">${pDisplayText ?? 'unknown error'}</h3>`; // add new display
    };

    /* ==========================================================================================
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
    const promiseDisplayText = getDisplayText(); // preload display to save time

    if (config.siteVersion == 'external' && (document.readyState === 'interactive' || document.readyState === 'complete')) {
        addFloatingDisplay('Gleitzeitkonto: Loading...');
    }
    else if (config.siteVersion == 'external') {
        // Load event fires too early so no point using that
        window.addEventListener('DOMContentLoaded', (event) => {
            addFloatingDisplay('Gleitzeitkonto: Loading...');
        })
    }

    let headerBar;
    let loops = 0; // track how often findHeaderBar ran
    
    

    // disgusting loop to check once the page has actually loaded
    const findHeaderBar = setInterval(async () => {
        loops++;
        headerBar = document.getElementById('shell-header-hdr-search-container'); // top bar, empty part
        const icons = document.getElementsByClassName('sapUshellShellHeadItmCntnt');

        if (headerBar && icons.length == config.amountIcons) {
            clearInterval(findHeaderBar);
            addInsertedDisplay(headerBar, await promiseDisplayText); // make sure DisplayText loaded
        }
        else if (loops > 10) clearInterval(findHeaderBar); // page loaded too long or html got changed
    }, 1000); // will be limited to min. 1000 when tab not focused

})();