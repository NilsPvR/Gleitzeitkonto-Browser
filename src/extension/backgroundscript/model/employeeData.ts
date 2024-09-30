import { constStrings } from '../utils/constants';
import Data from './employeeData_Data';

export default class EmployeeData {
    public constructor(public d: Data) {}

    public static fromObject(obj: object): EmployeeData {
        if (!('d' in obj) || !obj.d) {
            throw new Error(constStrings.internalErrorMsgs.unableToParseObj);
        }
        return new EmployeeData(Data.fromObject(obj.d));
    }

    public toObject() {
        return {
            d: this.d.toObject(),
        };
    }
}
