/**
 * A simple public holiday is a holiday which is each year on the same day.
 * Therefore only the day of the month and month have to be stored.
 * For holiday the american english (AE) variant is meant (compare to
 * "public holiday", "legal holiday", "bank holiday"), do not confuse with
 * the AE word vacation.
 */
export interface SimplePublicHoliday {
    /** The day of the month (`1` to `31`) */
    day: number;
    /** The month 0-index (`0` to `11`) */
    month: number;
    /** The percantage of minutes which are given without
     * working. An 8 hour work day 50% (a half holiday) would be
     * written as `0.5` and result in 4 hours of holiday time. */
    freeTimeFactor: number;
}
