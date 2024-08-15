import TimeElement from '../model/timeElement';
import TimeData from '../model/timeData';
import Result from '../model/result';

export default class WorkingTimes {
    private timeElements: TimeElement[];

    public constructor(timeElements: TimeElement[]) {
        this.timeElements = timeElements;
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
                    endTime = dataElement.fieldValue
                    break;
                default:
            }
    
            // each TimeElement corresponds to 13 entries in the results object
            if (index == 12) {
                index = 0;
                const currentElement = this.createNewTimeElement(date, startTime, endTime, attendanceType);
                this.timeElements.push(currentElement);
            } else {
                index++;
            }
        });
    
        return this.timeElements;
    }

    private createNewTimeElement(date: string, startTime: string, endTime: string, attendanceType: string): TimeElement {
        // TODO
        return new TimeElement(new Date(), new Date(), 1);
    }
}