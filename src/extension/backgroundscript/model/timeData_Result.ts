import { constStrings } from '../utils/constants';
import Metadata from './metadata';

export default class TimeData_Result {
    public constructor(
        public metadata: Metadata,
        public deactivated: boolean,
        public pernr: string,
        public recordNumber: string,
        public fieldName: string,
        public fieldText: string,
        public fieldValue: string,
        public fieldValueText: string,
        public level: number,
        public startDate: string,
        public endDate: string,
    ) {}

    public static fromObject(obj: object): TimeData_Result {
        if (
            !('__metadata' in obj) ||
            !obj.__metadata ||
            !('Deactivated' in obj) ||
            typeof obj.Deactivated !== 'boolean' ||
            !('Pernr' in obj) ||
            typeof obj.Pernr !== 'string' ||
            !('RecordNumber' in obj) ||
            typeof obj.RecordNumber !== 'string' ||
            !('FieldName' in obj) ||
            typeof obj.FieldName !== 'string' ||
            !('FieldText' in obj) ||
            typeof obj.FieldText !== 'string' ||
            !('FieldValue' in obj) ||
            typeof obj.FieldValue !== 'string' ||
            !('FieldValueText' in obj) ||
            typeof obj.FieldValueText !== 'string' ||
            !('Level' in obj) ||
            typeof obj.Level !== 'number' ||
            !('StartDate' in obj) ||
            typeof obj.StartDate !== 'string' ||
            !('EndDate' in obj) ||
            typeof obj.EndDate !== 'string'
        ) {
            throw new Error(constStrings.internalErrorMsgs.unableToParseObj);
        }
        return new TimeData_Result(
            Metadata.fromObject(obj.__metadata),
            obj.Deactivated,
            obj.Pernr,
            obj.RecordNumber,
            obj.FieldName,
            obj.FieldText,
            obj.FieldValue,
            obj.FieldValueText,
            obj.Level,
            obj.StartDate,
            obj.EndDate,
        );
    }

    public toObject() {
        return {
            __metadata: this.metadata.toObject(),
            Deactivated: this.deactivated,
            Pernr: this.pernr,
            RecordNumber: this.recordNumber,
            FieldName: this.fieldName,
            FieldText: this.fieldText,
            FieldValue: this.fieldValue,
            FieldValueText: this.fieldValueText,
            Level: this.level,
            StartDate: this.startDate,
            EndDate: this.endDate,
        };
    }
}
