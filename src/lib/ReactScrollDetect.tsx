import React, { FC, useEffect, useState, useContext } from 'react';
import { TSectionEntry, ReactScrollDetectContextProviderValue, ReactScrollDetectContext } from './context';
export interface ReactScrollDetectProps {
    onChange?: (index: number) => void
    index?: number
}


const ReactScrollDetect: FC<ReactScrollDetectProps> = (props) => {
    const { onChange = () => { }, index = 0 } = props;
    const [sections, setSections] = useState<TSectionEntry[]>([])

    const addSection = (section: TSectionEntry) => setSections(sections => [...sections, section])

    const providerValue: ReactScrollDetectContextProviderValue = {
        onChange,
        addSection,
        sections,
        index
    }
    return (
        <ReactScrollDetectContext.Provider value={providerValue}>
            <_ScrollContainer>
                {props.children}
            </_ScrollContainer>
        </ReactScrollDetectContext.Provider>
    )
}

const _ScrollContainer: FC = (props) => {
    const { sections, onChange, index } = useContext(ReactScrollDetectContext);
    const [sectionEntryPoints, setSectionEntryPoints] = useState<number[]>([])
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        initializeEntryPoints()
    }, [sections])


    useEffect(() => {
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
        const newIndex = findIndex(e.pageY);
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