import { copy } from 'fs-extra';
import fs from 'fs';
import { extname } from 'path';

(async function () {
    try {
        const filterFunc = (src: string) => {
            return extname(src) != '.js' && extname(src) != '.scss' && extname(src) != '.env'; // exclude js and scss files since these will be created by other npm scripts
        };
        await copy('./src/extension', './compressed/extension', { filter: filterFunc }); // copies directory with subdirectories
        fs.rmSync('./compressed/extension/contentscript/url.json', { force: true }); // remove url file
        fs.rmSync('./compressed/extension/.env', { force: true }); // remove secrets
        if (!fs.existsSync('./compressed/gleitzeitkonto-browser-zip')) {
            fs.mkdirSync('./compressed/gleitzeitkonto-browser-zip'); // create folder
        }

        console.log('Copied Extension folder succesfully!');
    } catch (e) {
        console.error(e);
    }
})();
