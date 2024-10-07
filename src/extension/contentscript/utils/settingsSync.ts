import browser from 'webextension-polyfill';
import Inserted from '../view/inserted';
import { getAccountData } from '../contentscript';
import Communication from './communication';
import Data from './format';
import StatusedPromise from '../model/statusedPromise';
import View from '../view/view';

export default class SettingsSync {
    constructor(public communication: Communication) {}

    public updateDisplayOnDisplayStateChange(headerBar: HTMLElement) {
        browser.storage.local.onChanged.addListener((changes: browser.Storage.StorageChange) => {
            if (
                'displayIsEnabled' in changes &&
                changes.displayIsEnabled &&
                typeof changes.displayIsEnabled == 'object' &&
                'newValue' in changes.displayIsEnabled &&
                typeof changes.displayIsEnabled.newValue === 'boolean'
            ) {
                this.addOrRemoveDisplay(headerBar, changes.displayIsEnabled.newValue);
            }
        });
    }

    private async addOrRemoveDisplay(headerBar: HTMLElement, displayIsEnabled: boolean) {
        if (displayIsEnabled) {
            const accountData = new StatusedPromise(getAccountData(this.communication));
            const latestDisplayFormat = await Data.getLatestDisplayFormat(accountData);

            new Inserted(this.communication).addInsertedDisplay(
                headerBar,
                latestDisplayFormat.text,
                latestDisplayFormat.loading,
            );

            // update the display as soon as new data is available
            accountData.promise.then(async () => {
                'updated';
                View.updateDisplay(await Data.getLatestDisplayFormat(accountData));
            });
            return;
        }
        Inserted.removeInsertedDisplay();
    }
}
