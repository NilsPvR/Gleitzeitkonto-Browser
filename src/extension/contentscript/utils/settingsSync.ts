import browser from 'webextension-polyfill';
import { DisplayFormat } from '../types/display';
import View from '../view/view';

export default class SettingsSync {
    constructor(public view: View) {}

    public updateDisplayOnDisplayEnabledChange(displayState: DisplayFormat) {
        browser.storage.local.onChanged.addListener((changes: browser.Storage.StorageChange) => {
            if (isDisplayEnabledChange(changes)) {
                this.addOrRemoveDisplay(displayState, changes.displayIsEnabled.newValue);
            }
        });
    }

    private async addOrRemoveDisplay(displayState: DisplayFormat, displayIsEnabled: boolean) {
        if (displayIsEnabled) {
            this.view.renderDisplay(displayState)
            return;
        }
        View.removeDisplay();
    }
}

interface DisplayEnabledChange {
    displayIsEnabled: {
        newValue: boolean;
    };
}

function isDisplayEnabledChange(
    displayEnabledChange: unknown,
): displayEnabledChange is DisplayEnabledChange {
    return (
        typeof displayEnabledChange === 'object' &&
        displayEnabledChange !== null &&
        'displayIsEnabled' in displayEnabledChange &&
        displayEnabledChange.displayIsEnabled !== null &&
        typeof displayEnabledChange.displayIsEnabled == 'object' &&
        'newValue' in displayEnabledChange.displayIsEnabled &&
        typeof displayEnabledChange.displayIsEnabled.newValue === 'boolean'
    );
}
