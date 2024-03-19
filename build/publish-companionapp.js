const fs = require('fs');

(async function() {
    try {
        if (!fs.existsSync('./compressed/companionapp')) fs.mkdirSync('./compressed/companionapp'); // create folder

        if (!fs.existsSync('./compressed/gleitzeitkonto-browser-zip')) fs.mkdirSync('./compressed/gleitzeitkonto-browser-zip'); // create folder

        fs.copyFileSync('./src/companionapp/version.txt', './compressed/companionapp/version.txt');
        fs.copyFileSync('./src/companionapp/main.js', './compressed/companionapp/main.js');
        fs.copyFileSync('./src/companionapp/manifest.json', './compressed/companionapp/manifest.json');
        fs.copyFileSync('./src/companionapp/manifest-chromium.json', './compressed/companionapp/manifest-chromium.json');
        fs.copyFileSync('./src/companionapp/start-companionapp.bat', './compressed/companionapp/start-companionapp.bat');
        // only copy the dependencies into the new package to avoid duplicate npm scripts for developers
        fs.writeFileSync('./compressed/companionapp/package.json', 
            '{ "dependencies": ' +
                JSON.stringify(JSON.parse(fs.readFileSync('./package.json')).dependencies) +
            '}'        
        );

        console.log('Created folder and files for CompanionApp succesfully!');
    }
    catch (e) {
        console.error(e);
    }
})();