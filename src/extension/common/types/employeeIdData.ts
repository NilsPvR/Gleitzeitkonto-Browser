export interface EmployeeIdData {
    employeeId: string;
}

export function isEmployeeIdData(employeeIdData: unknown): employeeIdData is EmployeeIdData {
    return (
        typeof employeeIdData === 'object' &&
        employeeIdData !== null &&
        'employeeId' in employeeIdData &&
        typeof employeeIdData.employeeId === 'string' &&
        employeeIdData.employeeId.trim().length !== 0
    );
}
