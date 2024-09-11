export default class State {
    /**
     * Create a new instance of this class. By default all states are set to false
     */
    constructor(
        /** true if the calculation of overtimes has finished */
        public calculateFinished = false,
        /** true if the check for a new version has finished */
        public versionCheckFinished = false,
    ) {}
}
