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


    /* ==========================================================================================
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Functions <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    const fetchServer = async () => {
        try {
            console.log('debugging');
            const url = 'http://localhost:3000';
            const data = await (await fetch(url)).json();
            console.log(data);
            // const data = rawdata.json()
            console.log('no e caught');
            return data
        }
        catch (e) {
            if (e.message == 'NetworkError when attempting to fetch resource.') {
                console.log(e);
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

    // remove the display once it is no longer needed
    const removeFloatingDisplay = () => {
        const oldDisplay = document.getElementById('gleitzeitkonto-canvas-headline');
        if (oldDisplay) oldDisplay.remove(); // delete the old display
    }

    const addInsertedDisplay = (pHeaderBar, pDisplayText) => {
        removeFloatingDisplay();

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
        console.log('running' + loops);
        loops++;
        headerBar = document.getElementById('shell-header-hdr-search-container'); // top bar, empty part
        const icons = document.getElementById('sf');

        console.log(headerBar);
        console.log(icons);

        if (headerBar && icons) {
            clearInterval(findHeaderBar);
            addInsertedDisplay(headerBar, await promiseDisplayText); // make sure DisplayText loaded
        }
        else if (loops > 10) { // page loaded too long or html got changed
            clearInterval(findHeaderBar); 
            removeFloatingDisplay(); // remove display, probably better to change text to an error to @TODO
        }
    }, 1000); // will be limited to min. 1000 when tab not focused

})();