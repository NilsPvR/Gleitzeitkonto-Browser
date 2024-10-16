import { isEmployeeIdData, EmployeeIdData } from './employeeIdData';
import { isErrorData, ErrorData } from './errorData';
import { isMessageObject, MessageObject } from './messageObject';
import { isOvertimeObject, OvertimeData } from './overtimeData';

export interface BackgroundResponse extends MessageObject {
    content?: OvertimeData | EmployeeIdData | ErrorData;
}

export function isBackgroundResponse(
    backgroundResponse: unknown,
): backgroundResponse is BackgroundResponse {
    if (!isMessageObject(backgroundResponse)) return false;

    if (backgroundResponse.content !== undefined) {
        // if set, check if valid
        return (
            isOvertimeObject(backgroundResponse.content) ||
            isEmployeeIdData(backgroundResponse.content) ||
            isErrorData(backgroundResponse.content)
        );
    }
    return true;
}
