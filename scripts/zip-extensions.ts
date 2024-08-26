import AdmZip from 'adm-zip';

async function createFirefoxZip() {
    const zip = new AdmZip();
    const outputFile = './build/gleitzeitkonto-browser-zip/gleitzeitkonto-browser-firefox.zip';

    try {
        zip.addLocalFolder('./build/extension');
        zip.writeZip(outputFile);
        console.log('\x1b[32m%s\x1b[0m', 'Created Firefox zip succesfully!');
    } catch (e) {
        console.error(e);
    }
}

async function createChromiumZip() {
    const zip = new AdmZip();
    const outputFile = './build/gleitzeitkonto-browser-zip/gleitzeitkonto-browser-chromium.zip';

    try {
        zip.addLocalFolder('./build/extension-chromium');
        zip.writeZip(outputFile);
        console.log('\x1b[32m%s\x1b[0m', 'Created Chromium zip succesfully!');
    } catch (e) {
        console.error(e);
    }
}

await createFirefoxZip();
await createChromiumZip();
