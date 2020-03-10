import { FC } from 'react';
import { TriggerPoint } from './context';
export interface ReactScrollDetectProps {
    onChange?: (index: number) => void;
    index?: number;
    offset?: number;
    triggerPoint?: TriggerPoint;
}
declare const ReactScrollDetect: FC<ReactScrollDetectProps>;
export default ReactScrollDetect;
