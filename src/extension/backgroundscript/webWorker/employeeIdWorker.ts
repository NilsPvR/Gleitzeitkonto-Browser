import EmployeeData from '../model/employeeData';
import { constStrings } from '../utils/constants';
import Formater from '../utils/format';

async function sendBackEmployeeId(message: MessageEvent) {
    let employeeId: string;

    try {
        if (!('content' in message.data) || typeof message.data.content !== 'string') {
            throw new Error('No message or no content received from the content script');
        }
        const jsonObject = Formater.getJSONFromAPIData(message.data.content);
        const employeeData = EmployeeData.fromObject(jsonObject);
        employeeId = employeeData.d.results[0].employeeId;
        if (!employeeId || employeeId.trim() === '') {
            throw new Error('No employee ID in API data');
        }
    } catch (e) {
        postMessage({
            error: { message: constStrings.errorMsgs.unableToParseData },
            originalError: e,
        });
        return;
    }

    postMessage({
        employeeId: employeeId,
    });
}

onmessage = sendBackEmployeeId;
