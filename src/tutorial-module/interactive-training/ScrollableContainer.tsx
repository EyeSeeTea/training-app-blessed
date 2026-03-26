import React from "react";

type ScrollableContainerProps = {
    triggerKey: React.Key;
    className?: string;
    children: React.ReactNode;
    targetContainerSelector?: string;
};

export const ScrollableContainer: React.FC<ScrollableContainerProps> = props => {
    const { triggerKey, className, children, targetContainerSelector } = props;
    const ref = React.useRef<HTMLDivElement | null>(null);

    React.useLayoutEffect(() => {
        const root = ref.current;
        if (!root) return;

        if (!targetContainerSelector) {
            root.scrollTop = 0;
            return;
        }

        const scroller = root.querySelector<HTMLElement>(targetContainerSelector);
        if (!scroller) return;
        scroller.scrollTop = 0;
    }, [triggerKey, targetContainerSelector]);

    return (
        <div ref={ref} className={className} style={{ overflow: "auto" }}>
            {children}
        </div>
    );
};
