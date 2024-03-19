const fs = require('fs');

(async function() {
    try {
        if (!fs.existsSync('./compressed/companionApp')) fs.mkdirSync('./compressed/companionApp'); // create folder

        if (!fs.existsSync('./compressed/Gleitzeitkonto-Browser-ZIP')) fs.mkdirSync('./compressed/Gleitzeitkonto-Browser-ZIP'); // create folder

        fs.copyFileSync('./CompanionApp/version.txt', './compressed/companionApp/version.txt');
        fs.copyFileSync('./CompanionApp/main.js', './compressed/companionApp/main.js');
        fs.copyFileSync('./CompanionApp/manifest.json', './compressed/companionApp/manifest.json');
        fs.copyFileSync('./CompanionApp/manifest-chromium.json', './compressed/companionApp/manifest-chromium.json');
        fs.copyFileSync('./CompanionApp/startCompanionApp.bat', './compressed/companionApp/startCompanionApp.bat');
        // only copy the dependencies into the new package to avoid duplicate npm scripts for developers
        fs.writeFileSync('./compressed/companionApp/package.json', 
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