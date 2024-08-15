import { constStrings } from '../util/constants';
import Result from './result';

export default class Data {
    results: Result[];

    public constructor(results: Result[]) {
        this.results = results;
    }

    public static fromObject(obj: object): Data {
        if (!('results' in obj) || !Array.isArray(obj.results)) {
            throw new Error(constStrings.internalErrorMsgs.unableToParseObj);
        }
        return new Data(obj.results.map((result: object) => Result.fromObject(result)));
    }

    public toObject() {
        return {
            results: this.results.map((result) => result.toObject()),
        };
    }
}
