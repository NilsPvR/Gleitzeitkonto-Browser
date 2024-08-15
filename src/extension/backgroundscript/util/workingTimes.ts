import TimeElement from '../model/timeElement';
import TimeData from '../model/timeData';
import Result from '../model/result';
import Formater from './format';

export default class WorkingTimes {
    timeElements: TimeElement[];

    public constructor() {
        this.timeElements = [];
    }

    public parseTimeDataToTimeElements(timeData: TimeData): TimeElement[] {
        const results: Result[] = timeData.d.results;

        let index = 0;

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
                default:
            }

            // each TimeElement corresponds to 13 entries in the results object
            // TODO API doesn't always send 13 entries, figure out in which cases this happens
            // TODO probably filter by the workdate entry
            if (index == 12) {
                index = 0;
                const currentElement = this.createNewTimeElement(
                    date,
                    startTime,
                    endTime,
                    attendanceType,
                );
                this.timeElements.push(currentElement);
            } else {
                index++;
            }
        });

        return this.timeElements;
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
}
