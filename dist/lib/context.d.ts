/// <reference types="react" />
export declare type TriggerPoint = 'center' | 'top' | 'bottom';
export declare type TSectionEntry = {
    height: number;
    index: number;
    ref: HTMLDivElement;
};
export declare type ReactScrollDetectContextProviderValue = {
    onChange: (index: number) => void;
    addSection: (section: Omit<TSectionEntry, 'index'>) => void;
    sections: TSectionEntry[];
    triggerPoint: TriggerPoint;
    index: number;
};
export declare const ReactScrollDetectContext: import("react").Context<ReactScrollDetectContextProviderValue>;
