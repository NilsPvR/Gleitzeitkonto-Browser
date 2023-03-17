const fs = require('fs');

(async function() {
    try {
        fs.renameSync('./compressed/packedWebserver/main.exe', './compressed/packedWebserver/Gleitzeitkonto-Webserver.exe');
    }
    catch (e) {
        console.error(e);
    }
})();