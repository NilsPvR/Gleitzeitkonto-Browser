// ==UserScript==
// @name         Fiori-Stunden
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       NilsPvR
// @description  Überstunden einfügen in Fiori
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @match        *://*.ondemand.com/*

// ==/UserScript==

(function() {
    'use strict';

    const addFloatingDisplay = () => {
        const canvas = document.getElementById('canvas'); // main page element is the (almost) only one loaded when DOM is loaded
        canvas.insertAdjacentHTML('beforebegin',
            '<h3 id="gleitzeitkonto-canvas-headline"style="float: right; margin-top: 11px; margin-right: 9rem; color: rgb(1, 56, 105);">Gleitzeitkonto: 31min</h3>');
    };

    const addInsertedDisplay = (pHeaderBar) => {
        const oldDisplay = document.getElementById('gleitzeitkonto-canvas-headline');
        if (oldDisplay) oldDisplay.remove(); // delete the old display

        pHeaderBar.innerHTML += '<h3 style="display:flex; align-self: center; color: rgb(1, 56, 105);">Gleitzeitkonto: 31min</h3>'; // add new display
    };

    if (document.readyState === 'interactive') {
        console.log('already ready');
        addFloatingDisplay();
    }
    else {
        // Load event fires too early so no point using that
        window.addEventListener('DOMContentLoaded', (event) => {
            addFloatingDisplay();
        })
    }

    let headerBar;
    let loops = 0; // track how often findHeaderBar ran

    // disgusting loop to check once the page has actually loaded
    const findHeaderBar = setInterval(() => {
        loops++;
        headerBar = document.getElementById('shell-header-hdr-search-container'); // top bar, empty part
        const icons = document.getElementsByClassName('sapUshellShellHeadItmCntnt');

        if (headerBar && icons.length == 3) {
            clearInterval(findHeaderBar);
            addInsertedDisplay(headerBar);
        }
        else if (loops > 10) clearInterval(findHeaderBar); // page loaded too long or html got changed
    }, 2000); // will be limited to min. 1000 when tab not focused

})();