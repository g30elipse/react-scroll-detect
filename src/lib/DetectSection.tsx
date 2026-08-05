import React, { useContext, useEffect, useRef } from 'react';
import { ScrollDetectContext } from './context';

export type DetectSectionProps = React.HTMLAttributes<HTMLDivElement>;

export const DetectSection: React.FC<DetectSectionProps> = (props) => {
    const { children, ...rest } = props;
    const ref = useRef<HTMLDivElement>(null);
    const context = useContext(ScrollDetectContext);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        if (!context) {
            console.error(
                '[react-scroll-detect] <DetectSection> must be rendered inside <ReactScrollDetect>. onChange will never fire.'
            );
            return;
        }
        return context.register(element);
    }, [context]);

    return (
        <div ref={ref} {...rest}>
            {children}
        </div>
    );
};
