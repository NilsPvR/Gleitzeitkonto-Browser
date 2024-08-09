import fs from 'fs';
import { copy } from 'fs-extra';

(async function () {
    try {
        await copy('./compressed/extension', './compressed/extension-chromium'); // copies directory with subdirectories
        // Swap the firefox manifest for the chromium manifest
        fs.rmSync('./compressed/extension/manifest-chromium.json', { force: true });
        fs.rmSync('./compressed/extension-chromium/manifest.json', { force: true });
        fs.renameSync(
            './compressed/extension-chromium/manifest-chromium.json',
            './compressed/extension-chromium/manifest.json',
        );

        console.log('Successfully adjusted manifest files and manifest file names.');
    } catch (e) {
        console.error(e);
    }
})();
