const http = require('http');
const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs');

// DEBUG=true starts webscraper in foreground and do logging, DEBUG=false in background
const DEBUG = false;

// "%AppData%/Gleitzeitkonto-Browser" Path or similar for other plattforms
const downloadPath = path.join(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share'),
                    'Gleitzeitkonto-Browser', 'gleitzeitkonto-api');

if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath, { recursive: true }); // creates folder if not existant, including parent folders

// prevent running multiple downloadCommands of API at the same time
let isRunning = false;
const isRunningEmitter = new EventEmitter(); // allows async/await for isRunning
let lastDownloadStatusCode;

// import and setup gleitzeit-api
const GleitzeitkontoAPI = require('./gleitzeitkonto-api/gleitzeitkonto-api.js').default;
const gzk = new GleitzeitkontoAPI(
    downloadPath,
    'working_times.csv',
    path.join(downloadPath, 'gleitzeitconfig.json'),
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
const port = 35221;
const version = '1.1.2';

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
                `<button onclick="window.location.href = 'http://${hostname}:${port}/waitForDownload'">Warten bis Download fertig</button> <br>` +
                `<button onclick="window.location.href = 'http://${hostname}:${port}/version'">Version anzeigen</button> <br>` +
                `<button onclick="window.location.href = 'http://${hostname}:${port}/kill'">Webserver stoppen</button> <br></div></body></html>`
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
        case '/version':
            response.writeHead(200);
            response.end(JSON.stringify({ version: version }));
            break;
        case '/kill':
            response.writeHead(200);
            response.end();
            if (DEBUG) console.debug('Server über /kill aufruf gestoppt.');
            process.exit();
        default:
            response.writeHead(404);
            response.end();
    }

});


server.listen(port, hostname, (error) => {
    if(!error) {
        process.title = 'Gleitzeitkonto-Webserver'; // rename the process (is not the main process visable in taskmanaer or similar)

        console.log(`Gleitzeitkonto-Webserver läuft auf http://${hostname}:${port}`);
    }
    else { 
        console.error('Fehler beim starten des Gleitzeitkonto-Webservers:');
        console.error(error);
    }
});