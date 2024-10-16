import { OffscreenCommand } from '../../backgroundscript/enums/offscreenCommand';
import { BackgroundCommand } from '../enums/command';

/**
 * This type is used to exchange messages in a unified way between
 * content scripts, background scripts, offscreen documents/workers.
 */
export interface MessageObject {
    command: BackgroundCommand | OffscreenCommand;
    content?: unknown;
}

export function isMessageObject(messageObject: unknown): messageObject is MessageObject {
    return (
        typeof messageObject === 'object' &&
        messageObject !== null &&
        'command' in messageObject &&
        (typeof messageObject.command === 'number' || typeof messageObject.command === 'string') &&
        (Object.values(BackgroundCommand).includes(messageObject.command) ||
            Object.values(OffscreenCommand).includes(messageObject.command))
    );
}
