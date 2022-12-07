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
        config.amountIcons = 2;
        config.sideDistance = '9rem';
    }


    config.primaer = {
        "dunkelblau":   "#003869",
        "mittelblau":   "#5aa6e7",
        "gelb":         "#fbd200",
        "grau":         "#f5f5f5",
    }
    config.sekundaer = {
        "1": "#00508c",
        "2": "0078be",
        "3": "9ccaf1",
        "4": "cee4f8",
    }



    /* ==========================================================================================
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Functions <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    const fetchServer = async () => {
        try {
            const url = 'http://localhost:3000';
            const data = await (await fetch(url)).json();
            return data
        }
        catch (e) {
            if (e.message == 'NetworkError when attempting to fetch resource.' || e.message == 'Failed to fetch') {
                console.log(e);
                return {errorMessage: 'Der Lokale-Server wurde nicht gestartet!'}
            }
            else {
                console.error(e);;
                return {errorMessage: 'Unbekannter Fehler'}
            }
        }
        
    };

    const getDisplayText = async () => {
        const res = await fetchServer();
        if (res.errorMessage) return `Fehler: ${res.errorMessage}`;
        else if (!res || !res.konto) return 'Fehler: Keine Daten vom Lokalen-Server geladen';
        else return `Gleitzeitkonto: ${res.konto}`;
    };
    

    const addFloatingDisplay = (pDisplayText) => {
        const canvas = document.getElementById('canvas'); // main page element is the (almost) only one loaded when DOM is loaded

        if (config.siteVersion == 'external') {
            canvas.insertAdjacentHTML('beforebegin',
                `<h3 id="gleitzeitkonto-canvas-headline"style="float: right; margin-top: 11px; margin-right: ${config.sideDistance}; color: ${config.primaer.dunkelblau};">${pDisplayText ?? 'unknown error'}</h3>`);

        }

        if  (config.siteVersion == 'internal') { // internal site needs different styling, which is less 'nice'
            canvas.insertAdjacentHTML('beforebegin',
                `<h3 id="gleitzeitkonto-canvas-headline"style="position: absolute;  right: ${config.sideDistance}; margin-top: 11px; z-index: 1; color: ${config.primaer.dunkelblau};">${pDisplayText ?? 'unknown error'}</h3>`);
        }
    };

    // remove the display once it is no longer needed
    const removeFloatingDisplay = () => {
        const oldDisplay = document.getElementById('gleitzeitkonto-canvas-headline');
        if (oldDisplay) oldDisplay.remove(); // delete the old display
    }

    // change the contents of the floating display
    // displayText is a promise
    const updateFloatingDisplay = async (promiseDisplayText) => {
        await promiseDisplayText; // wait until the promise is resolved

        const oldDisplay = document.getElementById('gleitzeitkonto-canvas-headline');
        if (oldDisplay) { // check if the floating display still exists
            oldDisplay.innerHTML = await promiseDisplayText;
        }
    }

    const addInsertedDisplay = (pHeaderBar, pDisplayText) => {
        removeFloatingDisplay();
        
        pHeaderBar.innerHTML += `<h3 style="display:flex; align-self: center; color: ${config.primaer.dunkelblau};">${pDisplayText ?? 'unknown error'}</h3>`; // add new display
    };

    /* ==========================================================================================
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
    const promiseDisplayText = getDisplayText(); // preload display to save time

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        addFloatingDisplay('Gleitzeitkonto: Loading...');
    }
    else if (config.siteVersion == 'external') {
        // Load event fires too early so no point using that
        window.addEventListener('DOMContentLoaded', (event) => {
            addFloatingDisplay('Gleitzeitkonto: Loading...');
        })
    }

    let updatedFloatingDisplay = false; // boolean value: if the floating Display has been updated
    let headerBar;
    let loops = 0; // track how often findHeaderBar ran
    
    

    // disgusting loop to check once the page has actually loaded
    const findHeaderBar = setInterval(async () => {
        loops++;
        headerBar = document.getElementById('shell-header-hdr-search-container'); // top bar, empty part
        const icons = document.getElementById('sf');


        if (headerBar && icons) {
            clearInterval(findHeaderBar);
            addInsertedDisplay(headerBar, await promiseDisplayText); // make sure DisplayText loaded
        }
        else if (!updatedFloatingDisplay) { // only update floating display once
             // don't await 'promiseDisplayText' even tho we want to change this as soon as the promiseDisplayText is fullfilled,
             // but if the page has loaded before the promise is resolved then just use addInsertedDisplay()
                // so therefore we shouldn't wait for the 'promiseDisplayText' but rather let this happen asynchronously
            updateFloatingDisplay(promiseDisplayText);

            updatedFloatingDisplay = true; // now it got updated
        }
        else if (loops > 10) { // page loaded too long or html got changed
            clearInterval(findHeaderBar); 
            removeFloatingDisplay(); // remove display, probably better to change text to an error to @TODO
        }
    }, 1000); // will be limited to min. 1000 when tab not focused

})();