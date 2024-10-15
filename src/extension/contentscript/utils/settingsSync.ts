import browser from 'webextension-polyfill';
import Inserted from '../view/inserted';
import { getOvertimeData } from '../contentscript';
import Communication from './communication';
import Data from './format';
import StatusedPromise from '../model/statusedPromise';
import View from '../view/view';

export default class SettingsSync {
    constructor(public communication: Communication) {}

    public updateDisplayOnDisplayStateChange(headerBar: HTMLElement) {
        browser.storage.local.onChanged.addListener((changes: browser.Storage.StorageChange) => {
            if (isDisplayStateChange(changes)) {
                this.addOrRemoveDisplay(headerBar, changes.displayIsEnabled.newValue);
            }
        });
    }

    private async addOrRemoveDisplay(headerBar: HTMLElement, displayIsEnabled: boolean) {
        if (displayIsEnabled) {
            const overtimeData = new StatusedPromise(getOvertimeData(this.communication));
            const latestDisplayFormat = await Data.getLatestDisplayFormat(overtimeData);

            new Inserted(this.communication).addInsertedDisplay(
                headerBar,
                latestDisplayFormat.text,
                latestDisplayFormat.loading,
            );

            // update the display as soon as new data is available
            overtimeData.promise.then(async () => {
                View.updateDisplay(await Data.getLatestDisplayFormat(overtimeData));
            });
            return;
        }
        Inserted.removeInsertedDisplay();
    }
}

interface DisplayStateChange {
    displayIsEnabled: {
        newValue: boolean;
    };
}

function isDisplayStateChange(
    displayStateChange: unknown,
): displayStateChange is DisplayStateChange {
    return (
        typeof displayStateChange === 'object' &&
        displayStateChange !== null &&
        'displayIsEnabled' in displayStateChange &&
        displayStateChange.displayIsEnabled !== null &&
        typeof displayStateChange.displayIsEnabled == 'object' &&
        'newValue' in displayStateChange.displayIsEnabled &&
        typeof displayStateChange.displayIsEnabled.newValue === 'boolean'
    );
}
