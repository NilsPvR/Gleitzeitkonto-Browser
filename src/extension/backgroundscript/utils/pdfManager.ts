import * as pdfjsLib from 'pdfjs-dist';
// import the worker directly; TODO/FIXME: This is not the intended way! Doing it the intended way
// is copying the file into the build output so that the file is available at runtime and then
// setting the `workerSrc`. Somehow this still generates a fake worker.
// The alternative is to instantiate a worker manually and then setting `workerPort` however this
// results in a never resolving worker (does not send anything back).
import 'pdfjs-dist/build/pdf.worker.min.mjs';

export default class PDFManager {
    public static async demoPDFCompile(message: unknown) {
        if (
            typeof message !== 'object' ||
            !message ||
            !('content' in message) ||
            typeof message.content !== 'string'
        ) {
            throw new Error('No message or no content received from the content script');
        }

        const pdfDocument = await pdfjsLib.getDocument({ data: atob(message.content) }).promise;

        const numPages = pdfDocument.numPages;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            console.log(await page.getTextContent());
        }
    }
}
