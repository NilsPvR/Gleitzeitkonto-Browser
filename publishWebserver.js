const fs = require('fs');

(async function() {
    try {
        if (!fs.existsSync('./compressed/webserver')) fs.mkdirSync('./compressed/webserver'); // create folder
        if (!fs.existsSync('./compressed/webserver/gleitzeitkonto-api')) fs.mkdirSync('./compressed/webserver/gleitzeitkonto-api');
        fs.copyFileSync('./Webserver/url.json', './compressed/webserver/url.json');
        console.log('Created folder succesfully!');
    }
    catch (e) {
        console.error(e);
    }
})();