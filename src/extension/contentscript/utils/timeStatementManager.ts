import { BackgroundCommand } from '../../common/enums/command';
import Communication from './communication';
import { config, constStrings } from './constants';
import DateManger from './dateManager';
import Formater from './format';

/**
 * Takes care of fetching and handling a time statement (pdf file).
 */
export default class TimeStatementManager {
    public constructor(public communication: Communication) {}

    /**
     * Fetches a new time statement and necessary related data and sends the
     * time statement to the background script.
     * @throws with a displayable error message, if a communcation error occurs
     * or the data has an unexpected format
     */
    public async sendTimeStatementData() {
        const employeeId = await this.fetchAndParseEmployeeId();
        await this.fetchAndSendTimeStatement(employeeId);
    }

    /**
     * Fetches and parses data for the employee id.
     * @returns the employee id
     * @throws with a displayable error message, if a communcation error occurs
     * or the data has an unexpected format
     */
    private async fetchAndParseEmployeeId(): Promise<string> {
        let employeeData;
        try {
            employeeData = await this.communication.fetchEmployeeId();
        } catch (e) {
            console.error(e);
            throw new Error(constStrings.errorMsgs.unableToContactAPI);
        }

        const employeeIdResponse = await this.communication.sendMsgToBackground(
            BackgroundCommand.ParseEmployeeId,
            employeeData,
        );

        Formater.throwIfErrorMessage(employeeIdResponse);
        if (
            !('employeeId' in employeeIdResponse) ||
            typeof employeeIdResponse.employeeId !== 'string'
        ) {
            console.error('Received response from background without employee ID');
            throw new Error(constStrings.errorMsgs.unexpectedBackgroundResponse);
        }

        return employeeIdResponse.employeeId;
    }

    /**
     * Fetches the time statement (pdf file) and sends it to the background script.
     * @param employeeId the employee id to fetch the time statement for
     * @throws  with a displayable error message, if a communcation error occurs
     * or the data has an unexpected format
     */
    private async fetchAndSendTimeStatement(employeeId: string) {
        let rawTimeStatementData;
        try {
            rawTimeStatementData = await this.communication.fetchTimeStatement(
                employeeId,
                DateManger.calculateTimeStatementStartDate(config.monthsToCalculateManually),
                DateManger.calcualteTimeStatementEndDate(config.monthsToCalculateManually),
            );
        } catch (e) {
            console.error(e);
            throw new Error(constStrings.errorMsgs.unableToContactAPI);
        }

        const timeStatementResponse = await this.communication.sendMsgToBackground(
            BackgroundCommand.CompileTimeSatement,
            Formater.convertArrayBufferToBase64(rawTimeStatementData),
        );

        Formater.throwIfErrorMessage(timeStatementResponse);
        // background only sends content if there is an error
    }
}
