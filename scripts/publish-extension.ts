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

        // remove sourcemap files from development
        if (fs.existsSync('./build/extension/backgroundscript/backgroundscript.js.map')) {
            fs.rmSync('./build/extension/backgroundscript/backgroundscript.js.map');
        }
        if (fs.existsSync('./build/extension/contentscript/gleitzeitkonto-browser.js.map')) {
            fs.rmSync('./build/extension/contentscript/gleitzeitkonto-browser.js.map');
        }

        // create folders
        if (!fs.existsSync('./build/extension/backgroundscript')) {
            fs.mkdirSync('./build/extension/backgroundscript');
        }
        if (!fs.existsSync('./build/extension/contentscript')) {
            fs.mkdirSync('./build/extension/contentscript');
        }
        if (!fs.existsSync('./build/extension-chromium/backgroundscript/chromium')) {
            fs.mkdirSync('./build/extension-chromium/backgroundscript/chromium', {
                recursive: true,
            });
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
        // copy pdf.js worker file, necessary for pdf analysis
        fs.copyFileSync(
            './node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
            './build/extension/backgroundscript/pdf.worker.min.mjs',
        );

        // copy Chromium specific files only to Chromium output
        fs.copyFileSync(
            'src/extension/backgroundscript/chromium/offscreen.html',
            './build/extension-chromium/backgroundscript/chromium/offscreen.html',
        );

        if (!fs.existsSync('./build/gleitzeitkonto-browser-zip')) {
            fs.mkdirSync('./build/gleitzeitkonto-browser-zip'); // create folder
        }

        console.log('\x1b[32m%s\x1b[0m', 'Copied extension folder succesfully!');
    } catch (e) {
        console.error(e);
    }
})();
