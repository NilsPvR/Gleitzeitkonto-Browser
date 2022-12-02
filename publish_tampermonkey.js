const {writeFileSync} = require('fs');
const lineReader = require('line-reader');
const {isString} = require('util');

let headerComments = '';

(async function() {// read each line one by one
    const getHeaderComments = async () => {
        lineReader.eachLine('tampermonkey-userscript.js', (line) => {
            headerComments += line;
            console.log('header:'+ headerComments);
            console.log(isString(line));
        
            // stop reading at the end of header comments
            if (line == '// ==/UserScript==') return false;
        });
    }
    await getHeaderComments();
    console.log('test');
    console.log(headerComments);

});