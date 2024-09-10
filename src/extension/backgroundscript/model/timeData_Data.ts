import { constStrings } from '../utils/constants';
import Result from './timeData_Result';

export default class TimeData_Data {
    public constructor(public results: Result[]) {}

    public static fromObject(obj: object): TimeData_Data {
        if (!('results' in obj) || !Array.isArray(obj.results)) {
            throw new Error(constStrings.internalErrorMsgs.unableToParseObj);
        }
        return new TimeData_Data(obj.results.map((result: object) => Result.fromObject(result)));
    }

    public toObject() {
        return {
            results: this.results.map((result) => result.toObject()),
        };
    }
}
