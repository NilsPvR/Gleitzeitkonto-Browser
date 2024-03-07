const fs = require('fs');

(async function() {
    try {
        if (!fs.existsSync('./compressed/companionApp')) fs.mkdirSync('./compressed/companionApp'); // create folder
        if (!fs.existsSync('./compressed/companionApp/gleitzeitkonto-api')) fs.mkdirSync('./compressed/companionApp/gleitzeitkonto-api');

        if (!fs.existsSync('./compressed/Gleitzeitkonto-Browser-ZIP')) fs.mkdirSync('./compressed/Gleitzeitkonto-Browser-ZIP'); // create folder

        fs.copyFileSync('./CompanionApp/start-Gleitzeitkonto-Browser CompanionApp.vbs', './compressed/companionApp/start-Gleitzeitkonto-Browser CompanionApp.vbs');
        fs.copyFileSync('./CompanionApp/version.txt', './compressed/companionApp/version.txt');
        fs.copyFileSync('./CompanionApp/url.json', './compressed/companionApp/url.json');
        fs.copyFileSync('./CompanionApp/main.js', './compressed/companionApp/main.js');
        fs.copyFileSync('./CompanionApp/gleitzeitkonto-api/gleitzeitkonto-api.js', './compressed/companionApp/gleitzeitkonto-api/gleitzeitkonto-api.js');
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