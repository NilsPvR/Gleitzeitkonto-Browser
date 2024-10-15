/** Used to update the display */
export interface DisplayFormat {
    text: string;
    loading: boolean;
}

export function isDisplayFormat(displayFormat: unknown): displayFormat is DisplayFormat {
    return (
        typeof displayFormat === 'object' &&
        displayFormat !== null &&
        'text' in displayFormat &&
        typeof displayFormat.text === 'string' &&
        displayFormat.text.trim().length !== 0 &&
        'loading' in displayFormat &&
        typeof displayFormat.loading === 'boolean'
    );
}
