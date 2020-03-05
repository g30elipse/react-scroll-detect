# react-scroll-detect
A set of utility components to watch scroll changes.

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
| index    | number                  | false           | This spectifies which section(index) the needs to be scrolled to the viewport. Default value: 0 (note: this is an experimental feature)  |


#### Example
```typescript
import ReactScrollDetect, { DetectSection } from 'react-scroll-detect';
```

```jsx
<ReactScrollDetect onChange={handleSectionChange}>
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
