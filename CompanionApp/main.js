const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');

// ===== Constants and global variables =====
// DEBUG=true starts webscraper in foreground and do logging, DEBUG=false in background
const DEBUG = false;
const version = '2.0.0';

// prevent running multiple downloadCommands of API at the same time
let isRunning = false;
const isRunningEmitter = new EventEmitter(); // allows async/await for isRunning
let lastDownloadStatusCode;

// ===== Functions =====

function printDebug (output) {
    if (DEBUG) {
        console.debug(output);
    }
}

// Function to read 4-byte length prefix from standard input
async function readLengthPrefixFromExtension () {
    const prefixBuffer = await new Promise((resolve) => {
        process.stdin.once('readable', () => {
            const chunk = process.stdin.read(4);
            resolve(chunk);
        });
    });
    return prefixBuffer.readUInt32LE(); // convert 4-byte buffer to integer
}

// Function to read message from standard input
async function readMessageFromExtension (length) {
    const messageBuffer = await new Promise((resolve) => {
        process.stdin.once('readable', () => {
            const chunk = process.stdin.read(length);
            resolve(chunk);
        });
    });
    return messageBuffer.toString('utf8') // convert buffer to string with utf-8 encoding
}

async function sendMessageToExtension (messageString) {
    // encode the message to UTF-8
    const encodedMessage = Buffer.from(messageString, 'utf8');
    // create a buffer for the length prefix
    const lengthPrefix = Buffer.alloc(4);

    // write the message length as a 32-bit unsigned integer
    lengthPrefix.writeUInt32LE(encodedMessage.length);

    // write both to standard-output
    process.stdout.write(lengthPrefix);
    process.stdout.write(encodedMessage);
}


async function manageDownloadWorkingTimes (DEBUG) {

    // start webscraper if its not running already
    if (!isRunning) {
        isRunning = true;
        isRunningEmitter.emit('running');

        printDebug('Sending Download request to Gleitzeitkonto-API...')
        statusCode = await gzk.downloadWorkingTimes(DEBUG);
        printDebug(`Request finished with Status-Code: "${statusCode}"`);

        lastDownloadStatusCode = statusCode;
        isRunning = false;
        isRunningEmitter.emit('stoppedRunning');

        return String(statusCode);
    } else {
        return '-1'; // StatusCode for Webserver is still running
    }
};


async function waitForDownload () {
    if (!isRunning) return String(lastDownloadStatusCode); // no need to wait, it already finished

    await new Promise(resolve => isRunningEmitter.once('stoppedRunning', resolve));
    return String(lastDownloadStatusCode);
};


// ===== Gleitzeitkonto-API Setup =====

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
    DEBUG
);


// ===== Companion App Messaging =====
while (true) {
    let parsedMessage;
    try {
        // retrieve new message from extension via std input
        const length = await readLengthPrefixFromExtension();
        const message = await readMessageFromExtension(length);
        // parse JSON message
        parsedMessage = JSON.parse(message);
    } catch (error) {
        console.error('Error reading message from standard input:', error);
    }

    switch (parsedMessage?.command) {
        case 'downloadworkingtimes':
            sendMessageToExtension(JSON.stringify(await manageDownloadWorkingTimes(DEBUG)))
            break;

        case 'calculatefromworkingtimes':
            sendMessageToExtension(JSON.stringify(gzk.calculateFromWorkingTimes()));
            break;

        case 'waitfordownload':
            sendMessageToExtension(await waitForDownload());
            break;

        case 'version':
            sendMessageToExtension(JSON.stringify({ version: version }));
            break;

        default:
            sendMessageToExtension("5") // unknown command
    }
}
