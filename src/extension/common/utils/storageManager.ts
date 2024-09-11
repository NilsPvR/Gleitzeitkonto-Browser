import browser from 'webextension-polyfill';

export default class StorageManager {
    public static async getTimeSheetOvertime(): Promise<string | unknown> {
        try {
            const result = await browser.storage.local.get('timeSheetOvertime');
            return result.timeSheetOvertime;
        } catch {
            return null;
        }
    }

    public static async saveTimeSheetOvertime(overtime: number) {
        await browser.storage.local.set({ timeSheetOvertime: overtime});
    }

    public static async getTimeStatementOvertime(): Promise<string | unknown> {
        try {
            const result = await browser.storage.local.get('timeStatementOvertime');
            return result.timeStatementOvertime;
        } catch {
            return null;
        }
    }

    public static async saveTimeStatementOvertime(overtime: number) {
        await browser.storage.local.set({ timeStatementOvertime: overtime});
    }
    
}