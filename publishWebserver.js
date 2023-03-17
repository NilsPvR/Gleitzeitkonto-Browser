const fs = require('fs');

(async function() {
    try {
        if (!fs.existsSync('./compressed/unpackedWebserver')) fs.mkdirSync('./compressed/unpackedWebserver'); // create folder
        if (!fs.existsSync('./compressed/unpackedWebserver/gleitzeitkonto-api')) fs.mkdirSync('./compressed/unpackedWebserver/gleitzeitkonto-api');

        if (!fs.existsSync('./compressed/packedWebserver')) fs.mkdirSync('./compressed/packedWebserver');
        if (!fs.existsSync('./compressed/Gleitzeitkonto-Browser-ZIP')) fs.mkdirSync('./compressed/Gleitzeitkonto-Browser-ZIP'); // create folder

        fs.copyFileSync('./Webserver/start-Gleitzeitkonto-Webserver-p.vbs', './compressed/packedWebserver/start-Gleitzeitkonto-Webserver.vbs');
        fs.copyFileSync('./Webserver/start-Gleitzeitkonto-Webserver-up.vbs', './compressed/unpackedWebserver/start-Gleitzeitkonto-Webserver.vbs');
        fs.copyFileSync('./Webserver/version.txt', './compressed/unpackedWebserver/version.txt');
        fs.copyFileSync('./Webserver/version.txt', './compressed/packedWebserver/version.txt');
        fs.copyFileSync('./Webserver/icon.ico', './compressed/unpackedWebserver/icon.ico');
        fs.copyFileSync('./Webserver/icon.ico', './compressed/packedWebserver/icon.ico');
        fs.copyFileSync('./Webserver/main.js', './compressed/unpackedWebserver/main.js');
        fs.copyFileSync('./Webserver/gleitzeitkonto-api/gleitzeitkonto-api.js', './compressed/unpackedWebserver/gleitzeitkonto-api/gleitzeitkonto-api.js');

        console.log('Created folder succesfully!');
    }
    catch (e) {
        console.error(e);
    }
})();