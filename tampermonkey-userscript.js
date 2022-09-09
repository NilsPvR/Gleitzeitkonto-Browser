// ==UserScript==
// @name         Fiori-Stunden
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Überstunden einfügen in Fiori
// @author       NilsPvR
// @match        *://*.ondemand.com/*
// @match        *://*.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net

// ==/UserScript==

(function() {
    'use strict';
    // Only DOMContentLoaded event fires when checking if the page fully loaded
    window.addEventListener('DOMContentLoaded', (event) => {
        const canvas = document.getElementById('canvas'); // main page element is the (almost) only one loaded when DOM is loaded
        canvas.insertAdjacentHTML('beforebegin', 
            '<h2 style="float: right; color: red;">Hello here is my text</h2>')
        alert('dom loaded');
    })

})();