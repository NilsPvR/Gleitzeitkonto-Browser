const { copy } = require('fs-extra');
const fs = require('fs');
const { extname } = require('path');

(async function() {
    try {
        const filterFunc = (src, dest) => {
            return extname(src) != '.js' && extname(src) != '.scss'; // exclude js and scss files
        };
        await copy('./extension', './compressed/extension', { filter: filterFunc }); // copies directory with subdirectories
        if (!fs.existsSync('./compressed/Gleitzeitkonto-Browser')) fs.mkdirSync('./compressed/Gleitzeitkonto-Browser'); // create folder

        console.log('Copied folder succesfully!');
    }
    catch (e) {
        console.error(e);
    }
})();