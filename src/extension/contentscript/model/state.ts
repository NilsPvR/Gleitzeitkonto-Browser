export default class State {
    /** true if the calculation of overtimes has finished */
    public calculateFinished: boolean;
    /** true if the download of working times has finished */
    public downloadFinished: boolean;
    /** true if the check for a new version has finished */
    public versionCheckFinished: boolean;

    /**
     * Create a new instance of this class. By default all states are set to false
     */
    constructor(calculateFinished = false, downloadFinished = false, versionCheckFinished = false) {
        this.calculateFinished = calculateFinished;
        this.downloadFinished = downloadFinished;
        this.versionCheckFinished = versionCheckFinished;
    }
}
