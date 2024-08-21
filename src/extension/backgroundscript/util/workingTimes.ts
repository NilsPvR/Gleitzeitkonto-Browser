import TimeElement from '../model/timeElement';
import TimeData from '../model/timeData';
import Result from '../model/result';
import Formater from './format';
import { givenStrings } from './constants';

export default class WorkingTimes {
    /** The inner arrays represent days. The TimeElements in the inner arrays have the
     * same starting day.*/
    timeElements: TimeElement[][];

    public constructor() {
        this.timeElements = [];
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
     * to Friday. Additionally working on holidays will result in incorrect overtimes
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
        const day = timeElements[0].startDate.getDay();
        if (day === 0 || day === 6) {
            // on Sundays or Saturdays don't subtract the minutesPerDay
            return overtimeMinutes;
        }

        return overtimeMinutes - minutesPerDay;
    }
}
