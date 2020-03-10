import React, { FC, useEffect, useState, useContext } from 'react';
import { TSectionEntry, ReactScrollDetectContextProviderValue, ReactScrollDetectContext, TriggerPoint } from './context';
export interface ReactScrollDetectProps {
    onChange?: (index: number) => void
    index?: number
    offset?: number
    triggerPoint?: TriggerPoint
}


const ReactScrollDetect: FC<ReactScrollDetectProps> = (props) => {
    const { onChange = () => { }, index = 0, triggerPoint = 'center', offset = 0 } = props;
    const [sections, setSections] = useState<TSectionEntry[]>([])
    let numSections = 0;

    const addSection = (section: Omit<TSectionEntry, 'index'>) => {
        setSections(sections => [...sections, { ...section, index: numSections++ }])
    }



    const providerValue: ReactScrollDetectContextProviderValue = {
        onChange,
        addSection,
        sections,
        index,
        triggerPoint,
        offset
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
    const { sections, onChange, index, triggerPoint, offset = 0 } = useContext(ReactScrollDetectContext);
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
        window.scrollTo({ top: (sectionEntryPoints[index] || 0) - offset, behavior: 'smooth' })
    }, [index])



    const initializeEntryPoints = () => {
        const _sectionEntryPoints: number[] = [];
        if (sections.length === 0) return;
        // console.log("first section height", sections[0].ref.offsetTop, sections[0].ref)
        let prev = sections[0].ref.offsetTop;
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