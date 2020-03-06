![Version](https://img.shields.io/npm/v/react-scroll-detect)
[![Build](https://img.shields.io/appveyor/build/g30elipse/react-scroll-detect)](https://ci.appveyor.com/project/g30elipse/react-scroll-detect)
[![Dependencies](https://img.shields.io/david/g30elipse/react-scroll-detect)](https://david-dm.org/g30elipse/react-scroll-detect)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/react-scroll-detect)](https://bundlephobia.com/result?p=react-scroll-detect@1.1.2)
![License](https://img.shields.io/npm/l/react-scroll-detect)


# react-scroll-detect
A set of utility components to watch scroll changes.

[Codesandbox demo](https://codesandbox.io/s/inspiring-goldwasser-5k13y?fontsize=14&hidenavigation=1&theme=dark)

### Components


#### DetectSection
Wrap your component with `DetectSection` to attach it to the listener. `ReactScrollDetect` will call `onChange` 
event whenever the component wrapped with `DetectSection` enters the viewport.

##### props
| props    | signature               | required       | description |
|------    | --------------         | ----           | ----------- |
| - | - | - | - |


#### ReactScrollDetect
This is a wrapper component for your scrollable component. Wrap your component with `ReactScrollDetect` and attach the `onChange` listener.

##### props
| props    | signature               | required       | description |
|------    | --------------         | ----           | ----------- |
| onChange | (index: number) => void | false           | Function which is exectuted when a new section enters the viewport |
| triggerPoint | 'center', 'top', 'bottom | false           | Trigger point for DetectSection (default: center) |
| index    | number                  | false           | This spectifies which section(index) the needs to be scrolled to the viewport. Default value: 0 (note: this is an experimental feature)  |



#### Example
```typescript
import ReactScrollDetect, { DetectSection } from 'react-scroll-detect';
```

```jsx
<ReactScrollDetect triggerPoint='center' onChange={handleSectionChange}>
  <DetectSection>
    <div style={{height: 500}}/>
  </DetectSection>
  <DetectSection>
    <div style={{height: 700}}/>
  </DetectSection>
  <DetectSection>
    <div style={{height: 400}}/>
  </DetectSection>
</ReactScrollDetect>
```
