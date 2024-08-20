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

        let date: string;
        let startTime: string;
        let endTime: string;
        let attendanceType: string;

        const saveElement = () => {
            const currentElement = this.createNewTimeElement(
                date,
                startTime,
                endTime,
                attendanceType,
            );
            this.timeElements.push(currentElement);
        };

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
                    saveElement();
                    break;
                default:
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
