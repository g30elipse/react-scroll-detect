import React, { StrictMode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import ReactScrollDetect, { DetectSection, TriggerPoint } from '../index';

/**
 * jsdom has no layout engine, so sections declare their own document geometry with
 * `data-top` / `data-height` and the stub below turns that into a viewport-relative
 * rect. A section at document top 800 sits at rect top 800 - scrollY.
 */
const VIEWPORT_HEIGHT = 1000;
const SECTION_HEIGHT = 800;

let frames: FrameRequestCallback[] = [];
let scrollTo: ReturnType<typeof vi.fn>;

const flushFrames = () => {
    const pending = frames;
    frames = [];
    pending.forEach((frame) => frame(0));
};

/** Moves the window and lets the component's scheduled frame run. */
const scrollWindowTo = (y: number) => {
    act(() => {
        Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
        window.dispatchEvent(new Event('scroll'));
        flushFrames();
    });
};

const resizeWindowTo = (height: number) => {
    act(() => {
        Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
        window.dispatchEvent(new Event('resize'));
        flushFrames();
    });
};

beforeEach(() => {
    frames = [];
    Object.defineProperty(window, 'innerHeight', { value: VIEWPORT_HEIGHT, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
    vi.stubGlobal('cancelAnimationFrame', () => undefined);

    scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);

    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
        configurable: true,
        value(this: HTMLElement) {
            const top = Number(this.dataset.top || 0) - window.scrollY;
            const height = Number(this.dataset.height || 0);
            return { top, bottom: top + height, height, width: 0, left: 0, right: 0, x: 0, y: top };
        }
    });
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

/** Three stacked 800px sections at document tops 0, 800 and 1600. */
const Stack = (props: { onChange?: (index: number) => void; triggerPoint?: TriggerPoint; index?: number; offset?: number }) => (
    <ReactScrollDetect {...props}>
        {[0, 1, 2].map((i) => (
            <DetectSection key={i} data-testid={`section-${i}`} data-top={i * SECTION_HEIGHT} data-height={SECTION_HEIGHT} />
        ))}
    </ReactScrollDetect>
);

describe('scroll detection', () => {
    it('reports the section sitting under the trigger point as the page scrolls', () => {
        const onChange = vi.fn();
        render(<Stack onChange={onChange} />);

        // At the top of the page section 0 spans the centre line, which is where we started.
        expect(onChange).not.toHaveBeenCalled();

        scrollWindowTo(400); // centre line (500) now falls inside section 1
        expect(onChange).toHaveBeenLastCalledWith(1);

        scrollWindowTo(1200); // and inside section 2
        expect(onChange).toHaveBeenLastCalledWith(2);

        scrollWindowTo(0);
        expect(onChange).toHaveBeenLastCalledWith(0);
        expect(onChange).toHaveBeenCalledTimes(3);
    });

    it('reports a section only once while it stays under the trigger point', () => {
        const onChange = vi.fn();
        render(<Stack onChange={onChange} />);

        scrollWindowTo(400);
        scrollWindowTo(500);
        scrollWindowTo(600);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(1);
    });

    it.each([
        ['top' as const, 0],
        ['center' as const, 1],
        ['bottom' as const, 2]
    ])('places the %s trigger line at the expected section', (triggerPoint, expected) => {
        // Sections sit at rect tops -700, 100 and 900, so each trigger line picks a different one.
        Object.defineProperty(window, 'scrollY', { value: 700, configurable: true });
        const onChange = vi.fn();

        render(<Stack onChange={onChange} triggerPoint={triggerPoint} />);

        if (expected === 0) expect(onChange).not.toHaveBeenCalled();
        else expect(onChange).toHaveBeenCalledWith(expected);
    });

    it('reports the visible section on mount when the page is already scrolled', () => {
        Object.defineProperty(window, 'scrollY', { value: 1200, configurable: true });
        const onChange = vi.fn();

        render(<Stack onChange={onChange} />);

        expect(onChange).toHaveBeenCalledWith(2);
    });

    it('re-detects when the viewport is resized', () => {
        const onChange = vi.fn();
        render(<Stack onChange={onChange} />);
        scrollWindowTo(200); // rect tops -200, 600, 1400; centre line 500 keeps section 0 active
        expect(onChange).not.toHaveBeenCalled();

        resizeWindowTo(1400); // centre line moves to 700, which section 1 now spans

        expect(onChange).toHaveBeenCalledWith(1);
    });

    it('coalesces a burst of scroll events into a single frame', () => {
        const onChange = vi.fn();
        render(<Stack onChange={onChange} />);

        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 400, configurable: true });
            window.dispatchEvent(new Event('scroll'));
            window.dispatchEvent(new Event('scroll'));
            window.dispatchEvent(new Event('scroll'));
        });
        expect(frames).toHaveLength(1);

        act(() => flushFrames());
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('stops listening once unmounted', () => {
        const onChange = vi.fn();
        const { unmount } = render(<Stack onChange={onChange} />);

        unmount();
        scrollWindowTo(1200);

        expect(onChange).not.toHaveBeenCalled();
    });
});

describe('section registration', () => {
    const Toggleable = (props: { onChange: (index: number) => void; showFirst: boolean }) => (
        <ReactScrollDetect onChange={props.onChange}>
            {props.showFirst && <DetectSection data-top={0} data-height={SECTION_HEIGHT} />}
            <DetectSection data-top={SECTION_HEIGHT} data-height={SECTION_HEIGHT} />
            <DetectSection data-top={SECTION_HEIGHT * 2} data-height={SECTION_HEIGHT} />
        </ReactScrollDetect>
    );

    it('indexes sections in document order, not mount order', () => {
        const calls: number[] = [];
        const onChange = (index: number) => calls.push(index);
        const { rerender } = render(<Toggleable onChange={onChange} showFirst={false} />);

        // Only the two lower sections exist, so the one at document top 1600 is index 1.
        scrollWindowTo(1200);
        expect(calls).toEqual([1]);

        // A section mounting *above* the others registers last but must still become
        // index 0 and push the other two down. Ordering by mount would report 2 here.
        rerender(<Toggleable onChange={onChange} showFirst />);
        scrollWindowTo(0);
        scrollWindowTo(400);

        expect(calls).toEqual([1, 0, 1]);
    });

    it('forgets sections that unmount', () => {
        const onChange = vi.fn();
        const { rerender } = render(<Toggleable onChange={onChange} showFirst />);

        scrollWindowTo(1200);
        expect(onChange).toHaveBeenLastCalledWith(2);

        rerender(<Toggleable onChange={onChange} showFirst={false} />);
        scrollWindowTo(0);
        scrollWindowTo(1200);

        expect(onChange).toHaveBeenLastCalledWith(1);
    });

    it('does not register a section twice under StrictMode', () => {
        const onChange = vi.fn();
        render(
            <StrictMode>
                <Stack onChange={onChange} />
            </StrictMode>
        );

        // A duplicated registry would report 5 for the last section instead of 2.
        scrollWindowTo(1200);

        expect(onChange).toHaveBeenLastCalledWith(2);
    });

    it('warns when a section is used outside the provider', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        render(<DetectSection data-top={0} data-height={SECTION_HEIGHT} />);

        expect(error).toHaveBeenCalledWith(expect.stringContaining('must be rendered inside'));
        error.mockRestore();
    });

    it('passes extra props through to the rendered element', () => {
        const { getByTestId } = render(<Stack />);

        expect(getByTestId('section-1').tagName).toBe('DIV');
    });
});

describe('scrolling to a section with the index prop', () => {
    it('does not touch the scroll position on mount when no index is given', () => {
        render(<Stack />);

        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('scrolls to the requested section when index changes', () => {
        const { rerender } = render(<Stack index={0} />);
        scrollTo.mockClear();

        rerender(<Stack index={2} />);

        expect(scrollTo).toHaveBeenCalledWith({ top: SECTION_HEIGHT * 2, behavior: 'smooth' });
    });

    it('subtracts the offset so the section clears a fixed header', () => {
        const { rerender } = render(<Stack index={0} offset={60} />);

        rerender(<Stack index={1} offset={60} />);

        expect(scrollTo).toHaveBeenCalledWith({ top: SECTION_HEIGHT - 60, behavior: 'smooth' });
    });

    it('accounts for the current scroll position when computing the target', () => {
        const { rerender } = render(<Stack index={0} />);
        scrollWindowTo(500); // rects shift up by 500, absolute target must stay 1600
        scrollTo.mockClear();

        rerender(<Stack index={2} />);

        expect(scrollTo).toHaveBeenCalledWith({ top: SECTION_HEIGHT * 2, behavior: 'smooth' });
    });

    it('ignores an index that has no matching section', () => {
        const { rerender } = render(<Stack index={0} />);
        scrollTo.mockClear();

        rerender(<Stack index={99} />);

        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('reports the section reached after a programmatic scroll', () => {
        // The scroll listener is the single source of truth, so onChange follows the
        // real position rather than being fired optimistically from the index prop.
        const onChange = vi.fn();
        const { rerender } = render(<Stack onChange={onChange} index={0} />);

        rerender(<Stack onChange={onChange} index={2} />);
        expect(onChange).not.toHaveBeenCalled();

        scrollWindowTo(SECTION_HEIGHT * 2);
        expect(onChange).toHaveBeenLastCalledWith(2);
    });
});

describe('consumer re-renders', () => {
    it('keeps working when the parent re-renders with a new onChange identity', () => {
        const calls: number[] = [];
        const Parent = () => {
            const [, setTick] = useState(0);
            return (
                <>
                    <button onClick={() => setTick((t) => t + 1)}>tick</button>
                    <Stack onChange={(index) => calls.push(index)} />
                </>
            );
        };
        const { getByText } = render(<Parent />);

        act(() => getByText('tick').click());
        scrollWindowTo(1200);

        expect(calls).toEqual([2]);
    });
});
