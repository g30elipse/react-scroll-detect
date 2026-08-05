import { createContext } from 'react';

export type TriggerPoint = 'center' | 'top' | 'bottom';

export type ScrollDetectContextValue = {
    /** Registers a section element. Returns a function that unregisters it. */
    register: (element: HTMLElement) => () => void;
};

export const ScrollDetectContext = createContext<ScrollDetectContextValue | null>(null);
