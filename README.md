[![Version](https://img.shields.io/npm/v/react-scroll-detect)](https://www.npmjs.com/package/react-scroll-detect)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/react-scroll-detect)](https://bundlephobia.com/result?p=react-scroll-detect)
![Types](https://img.shields.io/npm/types/react-scroll-detect)
![License](https://img.shields.io/npm/l/react-scroll-detect)

# react-scroll-detect

Tells you which section of the page the reader is currently looking at.

Wrap a stack of sections, and `onChange` fires with the index of whichever one is crossing an imaginary line in the viewport. Useful for highlighting the active item in a sticky nav, firing analytics as a long article is read, or driving a scroll-linked animation.

No dependencies, no configuration, about 1&nbsp;kB gzipped.

[Codesandbox demo](https://codesandbox.io/s/inspiring-goldwasser-5k13y?fontsize=14&hidenavigation=1&theme=dark)

## Install

```bash
npm install react-scroll-detect
```

React 16.8 or newer is required (the components are built on hooks). React is a peer dependency, so it uses whichever copy your app already has.

## Usage

```jsx
import { useState } from 'react';
import ReactScrollDetect, { DetectSection } from 'react-scroll-detect';

function Article() {
  const [active, setActive] = useState(0);

  return (
    <>
      <nav>
        {['Intro', 'Details', 'Summary'].map((label, i) => (
          <a key={label} className={i === active ? 'active' : ''}>{label}</a>
        ))}
      </nav>

      <ReactScrollDetect onChange={setActive}>
        <DetectSection><Intro /></DetectSection>
        <DetectSection><Details /></DetectSection>
        <DetectSection><Summary /></DetectSection>
      </ReactScrollDetect>
    </>
  );
}
```

`onChange` receives the zero-based index of the active section, counted in document order. It fires only when the active section actually changes, so it is safe to pass straight to a `useState` setter.

## How detection works

`triggerPoint` puts a horizontal line across the viewport. The active section is the one that line is currently sitting inside — formally, the last section whose **top edge** has passed the line.

The three settings can report three different sections from the very same scroll position:

```
        ┌─────────────────────────┐ ◀── triggerPoint='top'      onChange(0)
        │        section 0        │
        ├─────────────────────────┤
        │                         │
        │                         │
        │        section 1        │ ◀── triggerPoint='center'   onChange(1)
        │                         │
        ├─────────────────────────┤
        │        section 2        │
        └─────────────────────────┘ ◀── triggerPoint='bottom'   onChange(2)
```

Pick `'top'` if a section should become active as soon as it reaches the top of the screen, `'bottom'` if it should activate the moment it first appears, and `'center'` (the default) for the usual reading-position behaviour.

Before the first section has reached the line — at the very top of a page that starts with a tall header — index `0` is reported.

Positions are measured live on every scroll, so sections that grow, shrink, reflow on a resize, or arrive late (images, lazily loaded content) are all handled without any invalidation step on your side.

## Scrolling to a section

Pass `index` to drive the scroll position yourself. Whenever the value changes, that section is smooth-scrolled into view:

```jsx
<ReactScrollDetect index={target} offset={80} onChange={setActive}>
```

Use `offset` to leave room for a fixed header — an offset of `80` stops 80px short of the section's top edge.

`index` is uncontrolled: setting it scrolls once, and the reader is then free to scroll away. Leave the prop off entirely if you only want detection, and nothing will touch the scroll position.

## API

### `<ReactScrollDetect>`

| prop | type | default | description |
| ---- | ---- | ------- | ----------- |
| `onChange` | `(index: number) => void` | — | Called with the index of the section under the trigger point, whenever that changes. |
| `triggerPoint` | `'top' \| 'center' \| 'bottom'` | `'center'` | Where the detection line sits in the viewport. |
| `index` | `number` | — | Smooth-scrolls to this section whenever the value changes. Omit it to leave scrolling alone. |
| `offset` | `number` | `0` | Pixels of space to leave above the section when scrolling to it via `index`. |

### `<DetectSection>`

Marks one section. It renders a plain `<div>` and passes through every standard div prop, so `className`, `style`, `id`, `data-*` and event handlers all work as usual:

```jsx
<DetectSection className="panel" id="pricing">
  <Pricing />
</DetectSection>
```

Sections may be added or removed at runtime; indices always follow document order, not mount order. A `DetectSection` rendered outside a `ReactScrollDetect` logs an error and does nothing.

## Server-side rendering

Safe to import and render on the server. All measurement happens in effects, so Next.js, Remix and Gatsby builds work without a `dynamic`/`ssr: false` wrapper.

## Notes and limitations

- Detection is throttled to one measurement per animation frame, and the scroll listener is registered as `passive`, so it never blocks scrolling.
- Only window scrolling is supported. Sections inside a scrollable `<div>` with `overflow: auto` will not be detected.
- Layout changes that happen without a scroll or resize (an image loading while the page sits still) are picked up on the next scroll rather than immediately.

## Upgrading from 1.x

The API is unchanged; the fixes are behavioural.

- **Detection is no longer wheel-only.** v1 listened for `onWheel`, so touch scrolling, keyboard scrolling (space, arrows, Page Down), scrollbar dragging and programmatic scrolls never fired `onChange`. All of them work now.
- **Mounting no longer scrolls the page.** `index` previously defaulted to `0`, so mounting yanked the page to the top and defeated the browser's scroll restoration. It now defaults to unset. If you relied on the old behaviour, pass `index={0}` explicitly.
- **Setting `index` no longer fires `onChange` up front.** `onChange` now reports the section actually reached, so it stays truthful if the user interrupts the scroll.
- **Server rendering works.** v1 read `window.innerHeight` at module scope, which threw during SSR builds.
- Section positions are re-measured on every scroll instead of once at mount, so gaps, margins, responsive reflow and late-loading content no longer throw the indices off.
- React 16.8+ is supported (was pinned to `^16.12`), and `react-dom` is no longer a peer dependency.

## Development

```bash
npm install
npm test          # vitest, jsdom
npm run build     # tsup -> dist (cjs + esm + types)
npm run typecheck
```

## License

ISC © Mukut Brahma
