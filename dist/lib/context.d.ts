/// <reference types="react" />
export declare type TSectionEntry = {
    height: number;
    index: number;
};
export declare type ReactScrollDetectContextProviderValue = {
    onChange: (index: number) => void;
    addSection: (section: TSectionEntry) => void;
    sections: TSectionEntry[];
    index: number;
};
export declare const ReactScrollDetectContext: import("react").Context<ReactScrollDetectContextProviderValue>;
