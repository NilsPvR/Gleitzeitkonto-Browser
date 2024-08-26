import Settings from '../common/utils/settings';

async function onReady() {
    initializeEnabledCheck();
}

async function initializeEnabledCheck() {
    const checkbox = document.querySelector('input[name=on-off-switch]');

    if (checkbox && 'checked' in checkbox) {
        checkbox.addEventListener('change', async () => {
            if (checkbox.checked) {
                await Settings.setExtensionState(true);
            } else {
                await Settings.setExtensionState(false);
            }
        });

        if (!(await Settings.extensionIsEnabled())) {
            checkbox.checked = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', onReady);
