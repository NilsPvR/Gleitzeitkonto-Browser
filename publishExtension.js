const { copy, remove } = require('fs-extra');


try {
    await copy('/extension', '/compressed/extension'); // copies directory with subdirectories
    await remove('/compressed/extension/script.js'); // remove file
    console.log('Copied folder succesfully!');
}
catch (e) {
    console.error(e);
}