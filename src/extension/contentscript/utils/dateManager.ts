import { config } from './constants';

export default class DateManger {
    /**
     * Calculates the start date to use for the time statement. Will be the
     * first day of the month from the given amount of months ago.
     */
    public static calculateTimeStatementStartDate(monthsAgo: number): Date {
        const currentDate = new Date();
        return new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsAgo, 1);
    }

    /**
     * Calculates the end date to use for the time statement. Will be the
     * last day of the month from the given amount of months ago.
     */
    public static calcualteTimeStatementEndDate(monthsAgo: number): Date {
        const currentDate = new Date();
        return new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsAgo + 1, 0);
    }

    /**
     * Calculates the start date to use for the time statement. Will be
     * the first day of the following month from the given amount of months ago.
     */
    public static calculateTimeSheetStartDate(monthsAgo: number): Date {
        const endDate = this.calculateTimeStatementStartDate(monthsAgo);
        return new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);
    }

    /**
     * Calculates the end date to use for the time statement.
     */
    public static calculateTimeSheetEndDate(): Date {
        return config.timesheetEndDate;
    }
}
