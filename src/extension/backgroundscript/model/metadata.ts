import { constStrings } from '../utils/constants';

export default class Metadata {
    public constructor(
        private id: string,
        private uri: string,
        private type: string,
    ) {}

    public static fromObject(obj: object): Metadata {
        if (
            !('id' in obj) ||
            typeof obj.id !== 'string' ||
            !('uri' in obj) ||
            typeof obj.uri !== 'string' ||
            !('type' in obj) ||
            typeof obj.type !== 'string'
        ) {
            throw new Error(constStrings.internalErrorMsgs.unableToParseObj);
        }
        return new Metadata(obj.id, obj.uri, obj.type);
    }

    public toObject() {
        return {
            id: this.id,
            uri: this.uri,
            type: this.type,
        };
    }
}
