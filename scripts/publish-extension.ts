import { copy } from 'fs-extra';
import fs from 'fs';
import { extname } from 'path';

(async function () {
    try {
        console.log('Copying extension folder...');

        const filterFunc = (src: string) => {
            return extname(src) != '.ts' && extname(src) != '.scss' && extname(src) != '.env'; // exclude ts and scss files since these will be transpiled/compiled by other scripts
        };
        await copy('./src/extension/assets', './build/extension/assets'); // copies assets folder with all files
        await copy('./src/extension/popup', './build/extension/popup', { filter: filterFunc });

        // create folders
        if (!fs.existsSync('./build/extension/backgroundscript')) {
            fs.mkdirSync('./build/extension/backgroundscript');
        }
        if (!fs.existsSync('./build/extension/contentscript')) {
            fs.mkdirSync('./build/extension/contentscript');
        }

        // copy necessary files
        fs.copyFileSync(
            './src/extension/contentscript/gleitzeitkonto-browser.css',
            './build/extension/contentscript/gleitzeitkonto-browser.css',
        );
        fs.copyFileSync('./src/extension/manifest.json', './build/extension/manifest.json');
        fs.copyFileSync(
            './src/extension/manifest-chromium.json',
            './build/extension/manifest-chromium.json',
        );

        if (!fs.existsSync('./build/gleitzeitkonto-browser-zip')) {
            fs.mkdirSync('./build/gleitzeitkonto-browser-zip'); // create folder
        }

        console.log('\x1b[32m%s\x1b[0m', 'Copied extension folder succesfully!');
    } catch (e) {
        console.error(e);
    }
})();
