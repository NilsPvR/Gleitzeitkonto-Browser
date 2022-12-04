const { copyFile } = require('fs');

copyFile('./Compressed/t-u_comp.js', 'Extension/t-u_comp.js', (err) => {
    if (err) throw err;
    console.log('Compressed File has been copied!');
});