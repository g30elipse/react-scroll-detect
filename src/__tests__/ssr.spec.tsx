// @vitest-environment node
import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import ReactScrollDetect, { DetectSection } from '../index';

/**
 * Runs with no `window` at all. v1 read `window.innerHeight` at module scope, so
 * merely importing the package threw during a Next.js/Gatsby build.
 */
describe('server rendering', () => {
    it('has no window access at import time', () => {
        expect(typeof globalThis.window).toBe('undefined');
    });

    it('renders sections to markup without touching the DOM', () => {
        const html = renderToString(
            <ReactScrollDetect onChange={() => undefined} triggerPoint="top">
                <DetectSection className="first">one</DetectSection>
                <DetectSection className="second">two</DetectSection>
            </ReactScrollDetect>
        );

        expect(html).toContain('class="first"');
        expect(html).toContain('one');
        expect(html).toContain('two');
    });
});
