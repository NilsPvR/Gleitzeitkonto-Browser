const http = require('http');

// DEBUG=true starts webscraper in foreground and do logging, DEBUG=false in background
const DEBUG = false;
// getData() will not be called again if it is still running in the background
let isRunning = false;

// import and setup gleitzeit-api
const GleitzeitkontoAPI = require("./gleitzeitkonto-api/gleitzeitkonto-api.js").default;
const gzk = new GleitzeitkontoAPI(
    // resolve relative path to absolute path
    require("path").resolve("./gleitzeitkonto-api"),
    "working_times.csv",
    "./gleitzeitkonto-api/gleitzeitconfig.json",
    "https://bgp.btcsap.btc-ag.com:44300/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-client=300&sap-language=DE#btccatstime-display",
    DEBUG
);

const manageDownloadWorkingTimes = async (DEBUG) => {

    // start webscraper if its not running already
    if (!isRunning) {
        isRunning = true;

        if (DEBUG) console.debug('Sending Download request to Gleitzeitkonto-API...')
        statusCode = await gzk.downloadWorkingTimes(DEBUG);
        if (DEBUG) console.debug(`Request finished with Status-Code: "${statusCode}"`);

        isRunning = false;
        return String(statusCode);
    } else {
        return "-1"; // StatusCode for Webserver is still running
    }
}


// ===== Webserver =====
const hostname = 'localhost';
const port = 3000;

// webserver stuff
const server = http.createServer(async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*') // since only local allow any client
    response.setHeader('Content-Type', 'application/json');

    switch (request.url.toLocaleLowerCase()) {
        case '/downloadworkingtimes':
            response.writeHead(200);
            response.end(JSON.stringify(await manageDownloadWorkingTimes(DEBUG)))
            break;
        case '/calculatefromworkingtimes':
            response.writeHead(200);
            response.end(JSON.stringify(gzk.calculateFromWorkingTimes()));
            break;
        default:
            response.writeHead(404);
            response.end();
    }

});


server.listen(port, hostname, (error) => {
    if(!error) console.log(`Gleitzeitkonto-Webserver läuft über http://${hostname}:${port}`);
    else console.error("Fehler beim starten des Gleitzeitkonto-Webservers");
});