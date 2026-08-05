import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { ScrollDetectContext, ScrollDetectContextValue, TriggerPoint } from './context';

export interface ReactScrollDetectProps {
    /** Called with the index of the section currently under the trigger point. */
    onChange?: (index: number) => void;
    /** Scrolls the section at this index into view whenever the value changes. */
    index?: number;
    /** Pixels of space left above the section when scrolling to it via `index`. */
    offset?: number;
    /** Where the detection line sits in the viewport. Defaults to `'center'`. */
    triggerPoint?: TriggerPoint;
    children?: React.ReactNode;
}

/** Distance from the top of the viewport to the detection line, in pixels. */
const triggerLine = (triggerPoint: TriggerPoint) =>
    triggerPoint === 'top' ? 0 : triggerPoint === 'bottom' ? window.innerHeight : window.innerHeight / 2;

const inDocumentOrder = (a: HTMLElement, b: HTMLElement) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

const ReactScrollDetect: FC<ReactScrollDetectProps> = (props) => {
    const { onChange, index, offset = 0, triggerPoint = 'center', children } = props;

    const sections = useRef<HTMLElement[]>([]);
    const activeIndex = useRef(0);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    });

    const register = useCallback((element: HTMLElement) => {
        sections.current = [...sections.current, element].sort(inDocumentOrder);
        return () => {
            sections.current = sections.current.filter((section) => section !== element);
        };
    }, []);

    useEffect(() => {
        let frame: number | null = null;

        // The active section is the last one whose top edge has crossed the trigger line.
        // Rects are read live so layout changes need no invalidation.
        const detect = () => {
            frame = null;
            const line = triggerLine(triggerPoint);
            let next = 0;
            sections.current.forEach((element, i) => {
                if (element.getBoundingClientRect().top <= line) next = i;
            });
            if (next !== activeIndex.current) {
                activeIndex.current = next;
                if (onChangeRef.current) onChangeRef.current(next);
            }
        };

        const schedule = () => {
            if (frame === null) frame = requestAnimationFrame(detect);
        };

        // Children register during their own effects, which run before this one.
        detect();

        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });
        return () => {
            if (frame !== null) cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
        };
        // ponytail: layout shifts with no scroll or resize (late-loading images) are
        // missed until the next scroll. Add a ResizeObserver if that shows up in practice.
    }, [triggerPoint]);

    useEffect(() => {
        if (index === undefined) return;
        const element = sections.current[index];
        if (!element) return;
        window.scrollTo({
            top: element.getBoundingClientRect().top + window.scrollY - offset,
            behavior: 'smooth'
        });
        // `offset` is deliberately not a dependency: only an index change should scroll.
    }, [index]);

    const value = useMemo<ScrollDetectContextValue>(() => ({ register }), [register]);

    return <ScrollDetectContext.Provider value={value}>{children}</ScrollDetectContext.Provider>;
};

export default ReactScrollDetect;
