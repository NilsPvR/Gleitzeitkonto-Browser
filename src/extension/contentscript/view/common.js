const browser = require('webextension-polyfill');
const { constStrings, givenStrings } = require('../utils/constants.js');


module.exports = class Common {
    /**
     * Creates a new HTML Element with the specified attributes and the content placed inside
     * @param tagName       String - The name of the HTML-Tag, e.g: <div> -> 'div'
     * @param attributes    Object - key: attribute name, value: value of the attribute
     * @param content       HTMLElement | String - The nodes or strings to be placed inside of the element
     * @returns     HTMLElement | String - the composed HTMLElement with given attributes and content
     */
    createRichElement(tagName, attributes, ...content) {
        let element = document.createElement(tagName);
        if (attributes) {
            for (const [attr, value] of Object.entries(attributes)) {
                element.setAttribute(attr, value);
            }
        }
        if (content && content.length) {
            element.append(...content);
        }
        return element;
    }

    // different styling for loading and inserted bools
    getInnerHTMLElements(pDisplayText, loading, inserted) {
        const refreshImage = this.createRichElement('img', {
            id: constStrings.refreshIconID,
            src: this.getRefreshIconURL(),
            style: `animation-play-state: ${loading ? 'running;' : 'paused;'}`,
        });

        const button = this.createRichElement(
            'button',
            {
                id: constStrings.buttonID,
                class: 'reset-button reload-button',
                style: inserted ? 'align-self: center;' : '',
                disabled: loading ? 'true' : 'false',
            },
            refreshImage,
        );

        const headline = this.createRichElement(
            'h3',
            { class: 'gleitzeit-display-line' },
            pDisplayText ?? constStrings.errorMsgs.unknown,
        );

        return [button, headline];
    }

    // weather the user has set their page to light or dark mode
    getLightingMode() {
        const header =
            document.getElementById(givenStrings.headerID) ??
            document.getElementsByTagName('body')[0];
        if (!header) return 'gleitzeitkonto-light'; // default to lightmode if header not available

        // the rgb value of the header, is normally either white or dark grey/black
        const rgbColor = window.getComputedStyle(header, null).getPropertyValue('background-color');

        // convert the rgb string representation into the red green and blue values
        const colors = rgbColor
            .replace('rgb(', '')
            .replace('(', '')
            .split(',')
            .map((value) => parseInt(value.trim(), 10));

        // luminance calculation according to: https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-procedure
        const luminance = 0.2126 * colors[0] + 0.7152 * colors[1] + 0.0722 * colors[2];

        if (luminance > 128) return 'gleitzeitkonto-light';
        else return 'gleitzeitkonto-dark';
    }

    // returns the URL for the refresh icon based on the current lightingMode
    getRefreshIconURL() {
        if (this.getLightingMode() == 'gleitzeitkonto-light')
            return browser.runtime.getURL('./assets/refresh-light.svg');
        else return browser.runtime.getURL('./assets/refresh-dark.svg');
    }

}