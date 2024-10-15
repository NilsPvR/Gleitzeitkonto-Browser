export interface OvertimeData {
    overtimeText: string;
}

export function isOvertimeObject(overtimeObject: unknown): overtimeObject is OvertimeData {
    return (
        typeof overtimeObject === 'object' &&
        overtimeObject !== null &&
        'overtimeText' in overtimeObject &&
        typeof overtimeObject.overtimeText === 'string' &&
        overtimeObject.overtimeText.trim().length !== 0
    );
}
