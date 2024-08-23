import { constStrings } from '../util/constants';
import Data from './data';

export default class TimeData {
    public constructor(public d: Data) {}

    public static fromObject(obj: object): TimeData {
        if (!('d' in obj) || !obj.d) {
            throw new Error(constStrings.internalErrorMsgs.unableToParseObj);
        }
        return new TimeData(Data.fromObject(obj.d));
    }

    public toObject() {
        return {
            d: this.d.toObject(),
        };
    }
}
