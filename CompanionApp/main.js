const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');

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
 * Prints the received output to the console if the given debugging flag
 * is enabled.
 * @param   output  the string to print to the console
 * @param   DEBUG   boolean wheater or not to print the output
 */
function printDebug (output, DEBUG) {
    if (DEBUG) {
        console.debug(output);
    }
}

/**
 * Reads 4-bytes from the standard input. This is intepreted as an
 * 32-bit value in native byte order. The read value describes the lenght of the
 * following message.
 * 
 * When working with browser-extensions native messaging the standard output equals a message to the extension.
 * @returns a promise with the read message lenght as an integer
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#app_side
 */
async function readLengthPrefixFromExtension () {
    const prefixBuffer = await new Promise((resolve) => {
        process.stdin.once('readable', () => {
            const chunk = process.stdin.read(4);
            resolve(chunk);
        });
    });
    return prefixBuffer.readUInt32LE(); // convert 4-byte buffer to integer
}


/**
 * Reads the given lenght in bytes from the standard input. The read bytes will
 * be converted into a string with utf8-encoding.
 * 
 * When working with browser-extensions native messaging the standard input equals a message from the extension.
 * @param length the amount of bytes to read from the standard input
 * @returns a promise with the read message as a string
 */
async function readMessageFromExtension (length) {
    const messageBuffer = await new Promise((resolve) => {
        process.stdin.once('readable', () => {
            const chunk = process.stdin.read(length);
            resolve(chunk);
        });
    });
    return messageBuffer.toString('utf8'); // convert buffer to string with utf-8 encoding
}

/**
 * Sends the given message to the standard output. The given string will be converted
 * to a utf-8 encoded byte stream. Before sending the message a unsigned 32-bit value in native
 * byte order will be sent indicating the length of the message.
 * 
 * When working with browser-extensions native messaging the standard output equals a message to the extension.
 * @param messageString string to send into the standard output
 */
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

/**
 * Takes care of calling the api to download new working times. Prevents multiple downloads happeing at
 * the same time. Also emits events to let waiting callers know new working times have been downloaded.
 * Status will be printed when the debugging flag is true
 * @param DEBUG boolean debugging flag, wheather to print status
 * @returns a promise which resolves to the status code of the download, will be one of [-1, 0, 1, 2, 3, 4]
 */
async function manageDownloadWorkingTimes (DEBUG) {

    // start webscraper if its not running already
    if (!isRunning) {
        isRunning = true;
        isRunningEmitter.emit('running');

        printDebug('Sending Download request to Gleitzeitkonto-API...', DEBUG);
        statusCode = await gzk.downloadWorkingTimes(DEBUG);
        printDebug(`Request finished with Status-Code: "${statusCode}"`, DEBUG);

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
 * @returns a promise which resolves once the last download has finished to the statuscode of that download
 */
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

    // act according to the received command in the message
    switch (parsedMessage?.command) {
        case 'downloadworkingtimes':
            sendMessageToExtension(JSON.stringify(await manageDownloadWorkingTimes(DEBUG)));
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
            sendMessageToExtension(""); // unknown command
    }
}
