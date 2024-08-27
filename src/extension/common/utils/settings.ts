import browser from 'webextension-polyfill';

export default class Settings {
    public static async extensionIsEnabled(): Promise<boolean> {
        try {
            const result = await browser.storage.local.get({ extensionIsEnabled: true });
            if (result.extensionIsEnabled == null) {
                return true; // default to true
            }

            return Boolean(result.extensionIsEnabled);
        } catch {
            return true; // default to true even on error
        }
    }

    public static async setExtensionState(state: boolean): Promise<void> {
        return await browser.storage.local.set({ extensionIsEnabled: state });
    }
}
