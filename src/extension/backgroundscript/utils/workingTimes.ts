import TimeElement from '../model/timeElement';
import TimeData from '../model/timeData';
import Result from '../model/result';
import Formater from './format';
import { givenStrings } from './constants';
import { SimplePublicHoliday } from '../types/publicHoliday';

export default class WorkingTimes {
    /** The inner arrays represent days. The TimeElements in the inner arrays have the
     * same starting day.*/
    timeElements: TimeElement[][];
    /** The days which are considered holidays */
    publicHolidays: SimplePublicHoliday[];

    /**
     * @param publicHolidays the days which are considered holidays
     */
    public constructor(publicHolidays: SimplePublicHoliday[]) {
        this.timeElements = [];
        this.publicHolidays = publicHolidays;
    }

    public parseTimeDataToTimeElements(timeData: TimeData): TimeElement[][] {
        const results: Result[] = timeData.d.results;

        let date: string;
        let startTime: string;
        let endTime: string;
        let attendanceType: string;

        results.forEach((dataElement) => {
            // temporarily save the necessary information
            switch (dataElement.fieldName) {
                case 'WORKDATE':
                    date = dataElement.fieldValue;
                    break;
                case 'AWART':
                    attendanceType = dataElement.fieldValue;
                    break;
                case 'STARTTIME':
                    startTime = dataElement.fieldValue;
                    break;
                case 'ENDTIME':
                    endTime = dataElement.fieldValue;
                    break;
                case 'STATUS':
                    this.saveElement(date, startTime, endTime, attendanceType);
                    break;
                default:
            }
        });

        return this.timeElements;
    }

    /**
     * Saves the provided data as a TimeElement in the attribute `timeElements`. The created element
     * is sorted into the array structure.
     */
    private saveElement(date: string, startTime: string, endTime: string, attendanceType: string) {
        const currentElement = this.createNewTimeElement(date, startTime, endTime, attendanceType);

        if (
            this.timeElements.length === 0 ||
            this.timeElements[this.timeElements.length - 1].length === 0
        ) {
            // there are no other elements currently saved
            this.timeElements.push([currentElement]);
            return;
        }

        // a previous element exists
        const previousDay: TimeElement[] = this.timeElements[this.timeElements.length - 1];
        const previousElement = previousDay[0];
        if (Formater.isSameDay(previousElement.startDate, currentElement.startDate)) {
            previousDay.push(currentElement);
            return;
        }

        this.timeElements.push([currentElement]);
    }

    /**
     * Creates an instance of a TimeElement by parsing the strings into expected types.
     * @param date              the date or more precise the day in the format YYYYMMDD
     * @param startTime         expected format is HHMMSS
     * @param endTime           expected format is HHMMSS
     * @param attendanceType    expected to be a number
     */
    private createNewTimeElement(
        date: string,
        startTime: string,
        endTime: string,
        attendanceType: string,
    ): TimeElement {
        return new TimeElement(
            Formater.getDateFromDateAndTime(Formater.getDateFromYYYYMMDD(date), startTime),
            new Date(Formater.getDateFromDateAndTime(Formater.getDateFromYYYYMMDD(date), endTime)),
            Number(attendanceType),
        );
    }

    // ===== Overtime calculation =====
    /**
     * Calculates the overtime in minutes. The calculation does expect normal working days to be from Monday
     * to Friday. Working on holidays will only be calculated correctly if the holidays are set in the constructor.
     * @param timeElements               all elements to calculate the overtime from, expected to be sorted by date
     * @param minutesPerWeek             the expected amount of minutes to work in a week (default: `40 * 60`)
     * @param previousOvertimeMinutes    will be added to the calculated overtime (default: `0`)
     * @returns the overtime in minutes
     */
    public calculateOvertime(
        timeElements: TimeElement[][],
        minutesPerWeek = 40 * 60,
        previousOvertimeMinutes = 0,
    ): number {
        let overtimeMinutes = 0;
        const expectedMinutesPerDay = minutesPerWeek / 5;

        timeElements.forEach((dayTimeElements: TimeElement[]) => {
            overtimeMinutes += this.calculateOvertimePerDay(dayTimeElements, expectedMinutesPerDay);
        });

        return overtimeMinutes + previousOvertimeMinutes;
    }

    /**
     * Calculates the overtime for the given TimeElements on a day. This can be a negative
     * or positiv number in minutes depending on the `attendanceType`s of the TimeElements.
     * Expects normal working days to be from Monday to Friday.
     * @param timeElements     the TimeElements for the day to calcualte
     * @param minutesPerDay    the expected minutes to work per day
     * @returns the overtime for the day in minutes
     */
    private calculateOvertimePerDay(timeElements: TimeElement[], minutesPerDay: number): number {
        let overtimeMinutes = 0;

        timeElements.forEach((timeElement) => {
            const minutes = Formater.getMinutesBetween(timeElement.startDate, timeElement.endDate);
            if (timeElement.attendanceType === givenStrings.flexDayAttendanceType) {
                // flexday entries should be ignored since these are not actual working times
                return;
            }

            overtimeMinutes += minutes;
        });

        // subtract the expected minutes per day
        const weekDay = timeElements[0].startDate.getDay();
        if (weekDay === 0 || weekDay === 6) {
            // on Sundays or Saturdays don't subtract the minutes per day
            return overtimeMinutes;
        }
        overtimeMinutes -= minutesPerDay;

        return this.adjustOvertimeForPublicHoliday(
            timeElements[0].startDate,
            overtimeMinutes,
            minutesPerDay,
        );
    }

    /**
     * Adjusts the overtime for the day to respect holidays. Which days are holidays
     * is set in the constructor.
     * @param day                the day to check for a holiday
     * @param overtimeMinutes    the overtime for the day in minutes
     * @param minutesPerDay      the expected minutes to work per day
     * @returns the adjusted overtime for the day in minutes
     */
    private adjustOvertimeForPublicHoliday(
        day: Date,
        overtimeMinutes: number,
        minutesPerDay: number,
    ): number {
        this.publicHolidays.forEach((publicHoliday: SimplePublicHoliday) => {
            if (day.getDate() === publicHoliday.day && day.getMonth() === publicHoliday.month) {
                // the given day is a holiday
                overtimeMinutes += publicHoliday.freeTimeFactor * minutesPerDay;
            }
        });
        return overtimeMinutes;
    }
}
