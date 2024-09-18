import Formater from '../utils/format';
import PDFManager from '../utils/pdfManager';
import { BackgroundCommand } from '../../common/enums/command';
import { constStrings } from '../utils/constants';

async function saveOvertimeFromPDF(message: MessageEvent) {
    let overtime;
    try {
        const pdfDocument = await PDFManager.compilePDF(message);
        const overtimeString = await PDFManager.getOvertimeFromPDF(pdfDocument);
        overtime = Formater.getNumberFromString(overtimeString);
    } catch (e) {
        postMessage({
            command: BackgroundCommand.CompileTimeSatement,
            error: { message: constStrings.errorMsgs.unableToParseData },
            originalError: e,
        });
        return;
    }

    const overtimeMinutesRounded = Formater.roundHoursToNearest5Minutes(overtime);
    postMessage({
        // send overtime to backgroundscript since worker has no access to storage api
        overtime: overtimeMinutesRounded,
    });
}

onmessage = saveOvertimeFromPDF;
