let checkbox = document.querySelector('input[name=on-off-switch]');

checkbox.addEventListener('change', () => {
    if (this.checked) {
        // local storage on
    }
    else {
        // local storage off
    }
});