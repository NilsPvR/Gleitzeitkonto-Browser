import { constStrings } from '../util/constants';
import Metadata from './metadata';

export default class Result {
    metadata: Metadata;
    deactivated: boolean;
    pernr: string;
    recordNumber: string;
    fieldName: string;
    fieldText: string;
    fieldValue: string;
    fieldValueText: string;
    level: number;
    startDate: string;
    endDate: string;

    public constructor(
        metadata: Metadata,
        deactivated: boolean,
        pernr: string,
        recordNumber: string,
        fieldName: string,
        fieldText: string,
        fieldValue: string,
        fieldValueText: string,
        level: number,
        startDate: string,
        endDate: string,
    ) {
        this.metadata = metadata;
        this.deactivated = deactivated;
        this.pernr = pernr;
        this.recordNumber = recordNumber;
        this.fieldName = fieldName;
        this.fieldText = fieldText;
        this.fieldValue = fieldValue;
        this.fieldValueText = fieldValueText;
        this.level = level;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public static fromObject(obj: object): Result {
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
        return new Result(
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
