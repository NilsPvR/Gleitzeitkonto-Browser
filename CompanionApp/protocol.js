/**
 * This module takes care of sending and receiving messages from a browser extension via
 * the standard input and output as binary data. The module converts outgoing objects into a byte
 * stream and converts the incoming byte stream into an object.
 * When requiring this module a callback function for incoming messages is expected.
 * 
 * 
 * CHANGES from original: Changed var keyword to const and let; (re)moved error handling;
 * changed styling (semicolons + spacing); added comments
 * 
 * @param handleMessage Function(Object: incomingMessage) - A callback function which handles incoming
 * messages
 * @author Simeon Velichkov <simeonvelichkov@gmail.com> (https://simov.github.io)
 * @license 
 * The MIT License (MIT)

  Copyright (c) 2018-present, Simeon Velichkov <simeonvelichkov@gmail.com> (https://github.com/simov/native-messaging)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  @see https://github.com/simov/native-messaging
  @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#app_side
*/
module.exports = (handleMessage) => {

    process.stdin.on('readable', () => {
        let input = [];
        let chunk;
        while (chunk = process.stdin.read()) {
            input.push(chunk);
        }
        input = Buffer.concat(input);

        const msgLen = input.readUInt32LE(0);
        const dataLen = msgLen + 4;

        if (input.length >= dataLen) {
            const content = input.slice(4, dataLen);
            const json = JSON.parse(content.toString());
            handleMessage(json);
        }
    });

    function sendMessage (msg) {
        const buffer = Buffer.from(JSON.stringify(msg));

        const header = Buffer.alloc(4);
        header.writeUInt32LE(buffer.length, 0);

        const data = Buffer.concat([header, buffer]);
        process.stdout.write(data);
    }

    return sendMessage;

}
