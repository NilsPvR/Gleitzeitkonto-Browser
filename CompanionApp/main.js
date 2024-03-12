const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');
const sendMessage = require('./protocol')(messageHandler); // import the protocol for sending and receiving native messages

// ===== Constants and global variables =====
// DEBUG=true starts webscraper in foreground and do logging, DEBUG=false in background
const DEBUG = false;
const version = '2.0.0'; // used to check if the companionApp is outdated

// the following three variables prevent running multiple downloadCommands of API at the same time
let isRunning = false;
const isRunningEmitter = new EventEmitter(); // allows async/await for isRunning
let lastDownloadStatusCode;

// ===== Functions =====

/**
 * Prints the received output to a debug file if the given debugging flag
 * is enabled.
 * @param   output  String - to save into the debug file
 * @param   DEBUG   Boolean - prints the output if true
 */
function printDebug (output, DEBUG) {
    if (DEBUG) {
        const fd = fs.openSync('./debug.log', 'a');
        // Save output in file with datetimestring and new line
        fs.appendFileSync(fd, `[${new Date().toISOString()}]: ${output}\r\n`);

        if (fd !== undefined) fs.closeSync(fd);
    }
}

/**
 * Takes care of calling the api to download new working times. Prevents multiple downloads happeing at
 * the same time. Also emits events to let waiting callers know new working times have been downloaded.
 * Status will be printed when the debugging flag is true
 * @param DEBUG     Boolean - debugging flag, prints status of download when true
 * @returns     Promise<-1, 0, 1, 2, 3, 4> - resolves to the status code of the download
 */
async function manageDownloadWorkingTimes (DEBUG) {

    // start webscraper if its not running already
    if (!isRunning) {
        isRunning = true;
        isRunningEmitter.emit('running');

        printDebug('Sending Download request to Gleitzeitkonto-API...', DEBUG);
        statusCode = await gzk.downloadWorkingTimes(DEBUG);
        printDebug(`Downoad-Request finished with Status-Code: "${statusCode}"`, DEBUG);

        lastDownloadStatusCode = statusCode;
        isRunning = false;
        isRunningEmitter.emit('stoppedRunning');

        return String(statusCode);
    } else {
        return '-1'; // statusCode for download is still running
    }
};

/**
 * Helper function to wait until the currently running download has finished.
 * Once the download has finished the status code of that just executed download will
 * be returned.
 * @returns     Promise<String> - resolves once the last download has finished to the statuscode of that download
 */
async function waitForDownload () {
    if (!isRunning) return String(lastDownloadStatusCode); // no need to wait, it already finished

    await new Promise(resolve => isRunningEmitter.once('stoppedRunning', resolve));
    return String(lastDownloadStatusCode);
};


// ===== Gleitzeitkonto-API Setup =====

// catch any errors and send them back to the background script + log them for debugging
process.on('uncaughtException', (err) => {
    printDebug(err, DEBUG);
    sendMessage({ error: { message: err.message.toString() } });
});

// "%AppData%/Gleitzeitkonto-Browser" Path or similar for other plattforms
const downloadPath = path.join(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share'),
                    'Gleitzeitkonto-Browser', 'gleitzeitkonto-api');

if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath, { recursive: true }); // creates folder if not existant, including parent folders

// import and setup gleitzeit-api
const GleitzeitkontoAPI = require('./gleitzeitkonto-api/gleitzeitkonto-api.js').default;
const gzk = new GleitzeitkontoAPI(
    downloadPath,
    'working_times.csv',
    path.join(downloadPath, 'gleitzeitconfig.json'),
    require('./url.json'),
    false // do not print to console, since this causes issues when using native messaging
);


// ===== Companion App Messaging =====
/**
 * Takes care of incoming messages from the extension. Depending on the received message 
 * gleitzeitkonto-api calls are made or variables are checked. According responses are sent back to 
 * the extension. When parsing the incoming message capitalization is ignored.
 * Accepted commands are one of: ['downloadworkingtimes', 'calculatefromworkingtimes', 'waitfordownload',
 * 'version']
 * 
 * @param incomingMessage Object - holding the received command from the extension in the form of:
 * { command: "commandName" }
 */
function messageHandler (incomingMessage) {
    // act according to the received command in the message
    switch (incomingMessage?.command.toLowerCase()) {
        case 'downloadworkingtimes':
            printDebug('Received command from extension: "downloadworkingtimes"', DEBUG);
            manageDownloadWorkingTimes(DEBUG).then((result) => {
                sendMessage(result);
            });
            break;

        case 'calculatefromworkingtimes':
            printDebug('Received command from extension: "calculatefromworkingtimes"', DEBUG);
            sendMessage(gzk.calculateFromWorkingTimes());
            break;

        case 'waitfordownload':
            printDebug('Received command from extension: "waitfordownload"', DEBUG);
            waitForDownload().then((result) => {
                sendMessage(result);
            });
            break;

        case 'version':
            printDebug('Received command from extension: "version"', DEBUG);
            sendMessage({ version: version });
            break;

        default:
            printDebug(`Received invalid command from extension: "${incomingMessage.command}"`, DEBUG);
            sendMessage({ error: "Ungültiger Befehl."}); // unknown command
    }
}
