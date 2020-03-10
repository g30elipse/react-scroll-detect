import React, { useRef, useContext, useEffect } from "react";
import { ReactScrollDetectContext } from "./context";



export const DetectSection: React.FC = (props) => {
    const ref = useRef<HTMLDivElement>(null)

    const { addSection } = useContext(ReactScrollDetectContext);
    useEffect(() => {
        if (!ref.current) return;
        const height = ref.current.clientHeight || 0;
        addSection({ height, ref: ref.current })
    }, [ref])



    return (
        <div ref={ref}>
            {props.children}
        </div>
    )
}
