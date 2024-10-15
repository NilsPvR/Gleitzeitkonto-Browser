import { BackgroundCommand } from '../../common/enums/command';
import Communication from './communication';
import { config, constStrings } from './constants';
import DateManger from './dateManager';
import Formater from './format';

/**
 * Takes care of fetching and handling a time sheet (table of working times).
 */
export default class TimeSheetManager {
    public constructor(public communication: Communication) {}

    /**
     * Fetches a new time sheet and sends the time sheet to the
     * background script.
     * @throws with a displayable error message, if a communcation error occurs
     * or the data has an unexpected format
     */
    public async sendTimeSheetData() {
        let timeSheetData;
        try {
            timeSheetData = await this.communication.fetchWorkingTimes(
                DateManger.calculateTimeSheetStartDate(config.monthsToCalculateManually),
                DateManger.calculateTimeSheetEndDate(),
            );
        } catch (e) {
            console.error(e);
            throw new Error(constStrings.errorMsgs.unableToContactAPI);
        }

        const timeSheetResponse = await this.communication.sendMsgToBackground(
            BackgroundCommand.ParseTimeSheet,
            timeSheetData,
        );

        Formater.throwIfErrorMessage(timeSheetResponse);
        // background only sends content if there is an error
    }
}
