/**
 * Promise wrapper which adds a simple status.
 */
export default class StatusedPromise<T extends Promise<unknown>> {
    /** true once the promise resoles or throws an error */
    public isResolved = false;

    public constructor(public promise: T) {
        promise.then(() => {
            this.isResolved = true;
        }).catch(() => {
            this.isResolved = true;
        });
    }
}
