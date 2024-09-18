import { BackgroundCommand } from '../../common/enums/command';
import TimeData from '../model/timeData';
import { config, constStrings } from '../utils/constants';
import Formater from '../utils/format';
import WorkingTimes from '../utils/workingTimes';

function saveOvertimeFromTimeSheet(message: MessageEvent) {
    // TODO load publicHolidays from settings
    const controller = new WorkingTimes(config.publicHolidays);

    try {
        if (!('content' in message.data) || typeof message.data.content !== 'string') {
            throw new Error('No message or no content received from the content script');
        }
        const jsonObject = Formater.getJSONFromAPIData(message.data.content);
        const timeData = TimeData.fromObject(jsonObject);

        controller.timeElements = controller.parseTimeDataToTimeElements(timeData);
    } catch (e) {
        postMessage({
            command: BackgroundCommand.ParseTimeSheet,
            error: { message: constStrings.errorMsgs.unableToParseData },
            originalError: e,
        });
        return;
    }

    const overtimeInMinutes = controller.calculateOvertime(controller.timeElements);

    postMessage({
        // send overtime to backgroundscript since worker has no access to storage api
        overtime: overtimeInMinutes,
    });
}

onmessage = saveOvertimeFromTimeSheet;
