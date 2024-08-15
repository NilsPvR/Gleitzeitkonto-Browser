import { constStrings } from '../util/constants';

export default class Metadata {
    id: string;
    uri: string;
    type: string;

    public constructor(id: string, uri: string, type: string) {
        this.id = id;
        this.uri = uri;
        this.type = type;
    }

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
