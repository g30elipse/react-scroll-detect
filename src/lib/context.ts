import { createContext } from "react";



export type TSectionEntry = {
    height: number, index: number
}
export type ReactScrollDetectContextProviderValue = {
    onChange: (index: number) => void
    addSection: (section: TSectionEntry) => void
    sections: TSectionEntry[]
    index: number
}

export const ReactScrollDetectContext = createContext<ReactScrollDetectContextProviderValue>({
    onChange: (_) => { },
    addSection: (_) => { },
    sections: [],
    index: 0
});
