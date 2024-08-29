/**
 * Commands which are understood and accepted by the background script. Any other commands
 * are not accepted.
 */
export enum BackgroundCommand {
    /** From the given data calculate the overtime and return it */
    CalculateOvertime,
    CompilePDF,
}
