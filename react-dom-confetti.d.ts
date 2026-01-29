
declare module 'react-dom-confetti' {
    import * as React from 'react';

    interface ConfettiConfig {
        angle?: number;
        spread?: number;
        startVelocity?: number;
        elementCount?: number;
        dragFriction?: number;
        duration?: number;
        stagger?: number;
        width?: string;
        height?: string;
        perspective?: string;
        colors?: string[];
    }

    interface ConfettiProps {
        active: boolean;
        config?: ConfettiConfig;
        className?: string;
    }

    export default class Confetti extends React.Component<ConfettiProps> { }
}
