import * as pdfjsLib from 'pdfjs-dist';
// import the worker directly; TODO/FIXME: This is not the intended way! Doing it the intended way
// is copying the file into the build output so that the file is available at runtime and then
// setting the `workerSrc`. Somehow this still generates a fake worker.
// The alternative is to instantiate a worker manually and then setting `workerPort` however this
// results in a never resolving worker (does not send anything back).
import 'pdfjs-dist/build/pdf.worker.min.mjs';
import { givenStrings } from './constants';

export default class PDFManager {
    public static async compilePDF(message: object): Promise<pdfjsLib.PDFDocumentProxy> {
        if (!('content' in message) || typeof message.content !== 'string') {
            throw new Error('No message or no content received from the content script');
        }

        return pdfjsLib.getDocument({ data: atob(message.content) }).promise;
    }

    public static async getOvertimeFromPDF(
        pdfDocument: pdfjsLib.PDFDocumentProxy,
    ): Promise<string> {
        const amountPages = pdfDocument.numPages;

        // loop over all pages in the pdf
        for (let currentPageNum = 1; currentPageNum <= amountPages; currentPageNum++) {
            const page = await pdfDocument.getPage(currentPageNum);
            const textContent = await page.getTextContent();

            // loop over all entries in the page
            for (let i = 0; i < textContent.items.length; i++) {
                const item = textContent.items[i];
                if (!('str' in item)) continue;
                if (
                    item.str !== givenStrings.pdfOvertimeString.de &&
                    item.str !== givenStrings.pdfOvertimeString.en
                ) {
                    continue;
                }

                // the overtime string is not the next element since that is always a space
                const overtimeItem = textContent.items[i + 2];
                if (!('str' in overtimeItem) || overtimeItem.str.trim().length == 0) {
                    throw new Error(
                        'Overtime is not present at expected item. Found instead: ' + overtimeItem,
                    );
                }

                return overtimeItem.str;
            }
        }
        throw new Error(`No matching items found in the PDF on a total of ${amountPages} pages`);
    }
}
