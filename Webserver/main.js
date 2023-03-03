const http = require('http');
const { EventEmitter } = require('events');

// DEBUG=true starts webscraper in foreground and do logging, DEBUG=false in background
const DEBUG = false;

// prevent running multiple downloadCommands of API at the same time
let isRunning = false;
const isRunningEmitter = new EventEmitter(); // allows async/await for isRunning
let lastDownloadStatusCode;

// import and setup gleitzeit-api
const GleitzeitkontoAPI = require("./gleitzeitkonto-api/gleitzeitkonto-api.js").default;
const gzk = new GleitzeitkontoAPI(
    // resolve relative path to absolute path
    require("path").resolve("./gleitzeitkonto-api"),
    "working_times.csv",
    "./gleitzeitkonto-api/gleitzeitconfig.json",
    require('./url.json'),
    DEBUG
);

const manageDownloadWorkingTimes = async (DEBUG) => {

    // start webscraper if its not running already
    if (!isRunning) {
        isRunning = true;
        isRunningEmitter.emit('running');

        if (DEBUG) console.debug('Sending Download request to Gleitzeitkonto-API...')
        statusCode = await gzk.downloadWorkingTimes(DEBUG);
        if (DEBUG) console.debug(`Request finished with Status-Code: "${statusCode}"`);

        isRunning = false;
        isRunningEmitter.emit('stoppedRunning');
        lastDownloadStatusCode = statusCode;

        return String(statusCode);
    } else {
        return "-1"; // StatusCode for Webserver is still running
    }
};


const waitForDownload = async () => {
    if (!isRunning) return; // no need to wait, it already finished

    await new Promise(resolve => isRunningEmitter.once('stoppedRunning', resolve));
    return String(lastDownloadStatusCode);
};


// ===== Webserver =====
const hostname = 'localhost';
const port = 3000;

// webserver stuff
const server = http.createServer(async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*') // since only local allow any client
    response.setHeader('Content-Type', 'application/json');

    switch (request.url.toLocaleLowerCase()) {
        case '/':
            response.setHeader('Content-Type', 'text/html');
            response.end(
                '<html><body><div>Es gibt folgenden Seiten:<br><br>' +
                `<button onclick="window.location.href = 'http://${hostname}:${port}/downloadWorkingTimes'">Download Zeiten</button><br>` +
                `<button onclick="window.location.href = 'http://${hostname}:${port}/calculateFromWorkingTimes'">Zeiten aus Datei berechnen</button> <br>` +
                `<button onclick="window.location.href = 'http://${hostname}:${port}/waitForDownlaod'">Warten bis Download fertig</button></div></body></html>`                
            );
            break;
        case '/downloadworkingtimes':
            response.writeHead(200);
            response.end(JSON.stringify(await manageDownloadWorkingTimes(DEBUG)))
            break;
        case '/calculatefromworkingtimes':
            response.writeHead(200);
            response.end(JSON.stringify(gzk.calculateFromWorkingTimes()));
            break;
        case '/waitfordownload':
            response.writeHead(200);
            response.end(await waitForDownload());
            break;
        default:
            response.writeHead(404);
            response.end();
    }

});


server.listen(port, hostname, (error) => {
    if(!error) console.log(`Gleitzeitkonto-Webserver läuft auf http://${hostname}:${port}`);
    else { 
        console.error("Fehler beim starten des Gleitzeitkonto-Webservers:");
        console.error(error);
    }
});