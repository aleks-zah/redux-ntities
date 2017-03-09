// @flow
import { INVALID_ENTITY } from '../index';
import type { MapType } from '../index';

export const validate = (prop: *, expectedType: string): void => {
    const actualType = typeof prop;

    if (typeof prop !== expectedType) { // eslint-disable-line
        throw new Error(`Redux-ntities hoc: ${prop} is ${actualType}, expected ${expectedType}`);
    }
};

export const getDisplayName = (Component: ReactClass<*>): string => {
    if (typeof Component === 'string') {
        return Component;
    }

    return Component.displayName || Component.name || 'Component';
};

const requestIdleCallbackFallback = (handler: () => void) => {
    const startTime = Date.now();

    return setTimeout(() => {
        handler({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50.0 - (Date.now() - startTime)), // eslint-disable-line
        });
    }, 1); // eslint-disable-line
};

export const requestIdleCallback = window.requestIdleCallback || requestIdleCallbackFallback;

const invalidEntityAccessor = (props: *) => {
    console.error(props);

    throw new Error('invalid entity name passed with props above', props);
};

export const wrapEntityMap = (map: MapType<() => string>) => ({
    ...map,
    [INVALID_ENTITY]: invalidEntityAccessor,
});
