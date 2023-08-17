import * as fs from 'fs';
import * as resedit from 'resedit';

(async function() {
    const exePathOut = './compressed/packedWebserver/Gleitzeitkonto-Webserver.exe'

    try {
        fs.renameSync('./compressed/packedWebserver/main.exe', exePathOut);
    }
    catch (e) {
        console.error(e);
    }

    // Update the exe data
    try {
        
        const language = 1033 // 1033 = 'en-US'

        const data = fs.readFileSync(exePathOut);

        const exe = resedit.NtExecutable.from(data);
        const res = resedit.NtExecutableResource.from(exe);

        // -- Update icon --
        const iconFile = resedit.Data.IconFile.from(fs.readFileSync('./Webserver/icon.ico'));
        resedit.Resource.IconGroupEntry.replaceIconsForResource(
            res.entries, // destination entries
            1, // icon ID for ressource data, overwrite the current icongroup which for nodejs/pkg is 1
            language,
            iconFile.icons.map((item) => item.data) // the icons to replace
        );


        // -- Update file details --

        // retrieve the version info object
        const vi = resedit.Resource.VersionInfo.fromEntries(res.entries)[0];

        // update versions
        vi.setFileVersion(1, 1, 0, 0, language); // current version 1.1.0
        vi.setProductVersion(1, 1, 0, 0, language);

        // remove originalFileName entry
        vi.removeStringValue({lang: language, codepage: 1200}, 'OriginalFilename');

        // change file description and filename
        vi.setStringValues(
            { lang: language, codepage: 1200}, // codepage 1200 is default
            {
                FileDescription: 'Gleitzeitkonto-Webserver',
                ProductName: 'Gleitzeitkonto-Browser',
                LegalCopyright: 'MIT license'
            }
        );
        vi.outputToResourceEntries(res.entries); // save the new entries


        // write to exe again
        res.outputResource(exe);
        fs.writeFileSync(exePathOut, Buffer.from(exe.generate()));
        
        console.log('Details und Icon für Gleitzeitkonto-Webserver.exe erfolgreich angepasst.');
    }
    catch (e) {
        console.error(e);
    }
})();