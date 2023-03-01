const fs = require('fs');

(async function() {
    try {
        if (!fs.existsSync('./compressed/webserver')) fs.mkdirSync('./compressed/webserver'); // create folder
        if (!fs.existsSync('./compressed/webserver/gleitzeitkonto-api')) fs.mkdirSync('./compressed/webserver/gleitzeitkonto-api');
        console.log('Created folder succesfully!');
    }
    catch (e) {
        console.error(e);
    }
})();