import { copy } from 'fs-extra';
import fs from 'fs';
import { extname } from 'path';

(async function () {
    try {
        const filterFunc = (src: string) => {
            return extname(src) != '.ts' && extname(src) != '.scss' && extname(src) != '.env'; // exclude ts and scss files since these will be transpiled/compiled by other scripts
        };
        await copy('./src/extension/assets', './compressed/extension/assets'); // copies assets folder with all files
        await copy('./src/extension/popup', './compressed/extension/popup', { filter: filterFunc });

        // create folders
        if (!fs.existsSync('./compressed/extension/backgroundscript')) {
            fs.mkdirSync('./compressed/extension/backgroundscript');
        }
        if (!fs.existsSync('./compressed/extension/contentscript')) {
            fs.mkdirSync('./compressed/extension/contentscript');
        }

        // copy necessary files
        fs.copyFileSync(
            './src/extension/contentscript/gleitzeitkonto-browser.css',
            './compressed/extension/contentscript/gleitzeitkonto-browser.css',
        );
        fs.copyFileSync('./src/extension/manifest.json', './compressed/extension/manifest.json');
        fs.copyFileSync(
            './src/extension/manifest-chromium.json',
            './compressed/extension/manifest-chromium.json',
        );

        if (!fs.existsSync('./compressed/gleitzeitkonto-browser-zip')) {
            fs.mkdirSync('./compressed/gleitzeitkonto-browser-zip'); // create folder
        }

        console.log('\x1b[32m%s\x1b[0m', 'Copied Extension folder succesfully!');
    } catch (e) {
        console.error(e);
    }
})();
