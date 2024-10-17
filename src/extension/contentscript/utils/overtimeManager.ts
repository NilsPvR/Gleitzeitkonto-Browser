import { BackgroundCommand } from '../../common/enums/command';
import { ErrorData, isErrorData } from '../../common/types/errorData';
import { isOvertimeObject, OvertimeData } from '../../common/types/overtimeData';
import { updateDisplayState } from '../contentscript';
import StatusedPromise from '../model/statusedPromise';
import { DisplayFormat } from '../types/display';
import View from '../view/view';
import Communication from './communication';
import { constStrings } from './constants';
import TimeSheetManager from './timeSheetManager';
import TimeStatementManager from './timeStatementManager';
import Formater from './format';

export default class OvertimeManager {
    public view: View | undefined;

    constructor(public communication: Communication) {}

    // fetches data and sends requests to background script, returns a displayable text in any case
    public async calculateNewOvertimeData(): Promise<OvertimeData | ErrorData> {
        try {
            const timeStatement = new TimeStatementManager(
                this.communication,
            ).sendTimeStatementData();
            const timeSheet = new TimeSheetManager(this.communication).sendTimeSheetData();

            // wait until both requests finished before calculating total overtime
            await timeStatement;
            await timeSheet;
        } catch (e) {
            if (typeof e !== 'object' || !e || !('message' in e) || typeof e.message !== 'string') {
                // should never happen but in case we didn't catch an Error object but something else
                console.error(e);
                return {
                    error: {
                        message: constStrings.errorMsgs.unknown,
                    },
                };
            }
            return {
                error: {
                    message: e.message,
                },
            };
        }
        return this.getOvertimeData();
    }

    public async getOvertimeData(): Promise<OvertimeData | ErrorData> {
        const overtimeResponse = await this.communication.sendMsgToBackground(
            BackgroundCommand.GetOvertime,
        );

        if (!isOvertimeObject(overtimeResponse) && !isErrorData(overtimeResponse)) {
            return { error: { message: constStrings.errorMsgs.unexpectedBackgroundResponse } };
        }
        return overtimeResponse;
    }

    // called from the reload btn, recalculates the overtime
    public reloadOvertimeData(displayState: DisplayFormat) {
        displayState.loading = true;
        View.startLoading(); // start loading immediately

        // == Start new request ==
        const calculatedData = new StatusedPromise(this.calculateNewOvertimeData());

        // == Register action for promise resolving ==
        calculatedData.promise.then(async () => {
            updateDisplayState(displayState, await Formater.getLatestDisplayFormat(calculatedData));
            if (this.view === undefined) {
                console.error(`No view set in ${new OvertimeManager(this.communication).constructor.name}. ` +
                'Unable to rerender display.')
                View.removeDisplay();
                return;
            }
            this.view.renderDisplay(displayState);
        });
    }
}
