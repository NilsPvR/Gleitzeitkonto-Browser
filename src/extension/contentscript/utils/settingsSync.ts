import browser from 'webextension-polyfill';
import Inserted from '../view/inserted';

export default class SettingsSync {
    public updateDisplayOnExtensionStateChange() {
        browser.storage.local.onChanged.addListener((changes: browser.Storage.StorageChange) => {
            if (
                'extensionIsEnabled' in changes &&
                changes.extensionIsEnabled &&
                typeof changes.extensionIsEnabled == 'object' &&
                'newValue' in changes.extensionIsEnabled &&
                typeof changes.extensionIsEnabled.newValue === 'boolean'
            ) {
                this.addOrRemoveDisplay(changes.extensionIsEnabled.newValue);
            }
        });
    }

    private addOrRemoveDisplay(extensionIsEnabled: boolean) {
        if (extensionIsEnabled) {
            // TODO add display again, more complicated since display state has to be saved
            return;
        }
        Inserted.removeInsertedDisplay();
    }
}
