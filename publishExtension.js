const { copy, remove } = require('fs-extra');
const { extname } = require('path');

(async function() {
    try {
        const filterFunc = (src, dest) => {
            return extname(src) != '.js'; // exclude js files
        };
        await copy('./extension', './compressed/extension', { filter: filterFunc }); // copies directory with subdirectories

        console.log('Copied folder succesfully!');
    }
    catch (e) {
        console.error(e);
    }
})();