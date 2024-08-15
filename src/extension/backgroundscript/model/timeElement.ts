/**
 * This model allows a much easier calculation of overtimes by only providing the necessary attributes
 * in a nice format.
 */
export default class TimeElement {
    /** The start of this entry */
    startDate: Date;
    
    /** The end of this entry */
    endDate: Date;

    /** The type of attendance which indicates if this is a holiday, overtime, normal work, etc. entry */
    attendanceType: number;

    /**
     * Creates a new instance of a TimeElement. The `endDate` has to be after the
     * `startDate`
     * @throws if the `startDate` is after the `endDate` or the same
     */
    public constructor(startDate: Date, endDate: Date, attendanceType: number) {
        if (startDate >= endDate) {
            throw new Error('Invalid startDate and endDate parameter. endDate has to be after startDate')
        }
        this.startDate = startDate;
        this.endDate = endDate
        this.attendanceType = Number(attendanceType);
    }
}
