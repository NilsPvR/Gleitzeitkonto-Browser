export interface ErrorData {
    error: { message: string };
}

export function isErrorData(errorData: unknown): errorData is ErrorData {
    return (
        typeof errorData === 'object' &&
        errorData !== null &&
        'error' in errorData &&
        typeof errorData.error === 'object' &&
        errorData.error !== null &&
        'message' in errorData.error &&
        typeof errorData.error.message === 'string' &&
        errorData.error.message.trim().length !== 0
    );
}
