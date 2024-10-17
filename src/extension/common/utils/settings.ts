import browser from 'webextension-polyfill';

export default class Settings {
    public static async displayIsEnabled(): Promise<boolean> {
        try {
            const result = await browser.storage.local.get({ displayIsEnabled: true });
            if (result.displayIsEnabled == null) {
                return true; // default to true
            }

            return Boolean(result.displayIsEnabled);
        } catch {
            return true; // default to true even on error
        }
    }

    public static async setDisplayEnabled(state: boolean) {
        return await browser.storage.local.set({ displayIsEnabled: state });
    }
}
