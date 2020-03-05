import React, { useRef, useContext, useEffect } from "react";
import { ReactScrollDetectContext } from "./context";


let INDEX = 0;

export const DetectSection: React.FC = (props) => {
    const ref = useRef<HTMLDivElement>(null)

    const { addSection } = useContext(ReactScrollDetectContext);
    const index = INDEX++;
    useEffect(() => {
        const height = ref.current?.clientHeight || 0;
        addSection({ index, height })
    }, [])



    return (
        <div ref={ref}>
            {props.children}
        </div>
    )
}
