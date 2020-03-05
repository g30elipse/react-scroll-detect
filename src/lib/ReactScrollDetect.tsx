import React, { FC, useEffect, useState, useContext } from 'react';
import { TSectionEntry, ReactScrollDetectContextProviderValue, ReactScrollDetectContext, TriggerPoint } from './context';
export interface ReactScrollDetectProps {
    onChange?: (index: number) => void
    index?: number
    triggerPoint?: TriggerPoint
}


const ReactScrollDetect: FC<ReactScrollDetectProps> = (props) => {
    const { onChange = () => { }, index = 0, triggerPoint = 'center' } = props;
    const [sections, setSections] = useState<TSectionEntry[]>([])

    const addSection = (section: TSectionEntry) => setSections(sections => [...sections, section])

    const providerValue: ReactScrollDetectContextProviderValue = {
        onChange,
        addSection,
        sections,
        index,
        triggerPoint
    }
    return (
        <ReactScrollDetectContext.Provider value={providerValue}>
            <_ScrollContainer>
                {props.children}
            </_ScrollContainer>
        </ReactScrollDetectContext.Provider>
    )
}

const WINDOW_HEIGHT = window.innerHeight;


const _ScrollContainer: FC = (props) => {
    const { sections, onChange, index, triggerPoint } = useContext(ReactScrollDetectContext);
    const [sectionEntryPoints, setSectionEntryPoints] = useState<number[]>([])
    const [currentIndex, setCurrentIndex] = useState(0);
    const TRIGGER_CONST = triggerPoint === 'center' ? WINDOW_HEIGHT / 2 : triggerPoint === 'top' ? 0 : WINDOW_HEIGHT

    useEffect(() => {
        initializeEntryPoints()
    }, [sections])


    useEffect(() => {
        if (index !== currentIndex) {
            setCurrentIndex(index)
            onChange(index)
        }
        window.scrollTo({ top: sectionEntryPoints[index] || 0, behavior: 'smooth' })
    }, [index])



    const initializeEntryPoints = () => {
        const _sectionEntryPoints: number[] = [];
        let prev = 0;
        sections.forEach(section => {
            _sectionEntryPoints.push(prev);
            prev = prev + section.height;
        })
        setSectionEntryPoints(_sectionEntryPoints)
    }

    const findIndex = (posTop: number) => {
        let _index = 0;
        sectionEntryPoints.forEach((p, i) => {
            if (posTop > p && posTop < (sectionEntryPoints[i + 1] || 99999))
                _index = i;
        })
        return _index;
    }


    const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const top = (e.pageY - e.clientY) + (TRIGGER_CONST)
        const newIndex = findIndex(top);
        if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
            onChange(newIndex)
        }
    }


    return (
        <div onWheel={onWheel}>
            {props.children}
        </div>
    )
}

export default ReactScrollDetect;