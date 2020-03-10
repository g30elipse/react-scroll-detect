import { createContext } from "react";


export type TriggerPoint = 'center' | 'top' | 'bottom'


export type TSectionEntry = {
    height: number, index: number, ref: HTMLDivElement
}
export type ReactScrollDetectContextProviderValue = {
    onChange: (index: number) => void
    addSection: (section: Omit<TSectionEntry, 'index'>) => void
    sections: TSectionEntry[]
    triggerPoint: TriggerPoint
    index: number
    offset: number
}

export const ReactScrollDetectContext = createContext<ReactScrollDetectContextProviderValue>({
    onChange: (_) => { },
    addSection: (_) => { },
    sections: [],
    index: 0,
    triggerPoint: 'center',
    offset: 0
});
