import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type IndicatorState = "hidden" | "visible" | "pulsing";

export type UseContentChangeIndicatorProps = {
    targetIds: string[];
    textContent: string;
    isMinimized: boolean;
    enabled: boolean;
};

export type NotificationBadgeState = {
    isVisible: boolean;
    isPulsing: boolean;
};

export type UseContentChangeIndicatorResult = {
    indicatorState: IndicatorState;
    badgeProps: NotificationBadgeState;
    clearIndicator: () => void;
};

export function useContentChangeIndicator(props: UseContentChangeIndicatorProps): UseContentChangeIndicatorResult {
    const { targetIds, textContent, isMinimized, enabled } = props;

    const [indicatorState, setIndicatorState] = useState<IndicatorState>("hidden");

    const previousTargetIdsKey = useRef<string>("");
    const lastSeenTargetKey = useRef<string>("");

    const currentTargetKey = useMemo(() => targetIds.join(","), [targetIds]);
    const hasContent = useMemo(() => textContent.trim().length > 0, [textContent]);

    useEffect(() => {
        if (!enabled) {
            setIndicatorState("hidden");
            return;
        }

        // reset on default content
        if (!hasContent) {
            setIndicatorState("hidden");
            lastSeenTargetKey.current = "";
            previousTargetIdsKey.current = "";
            return;
        }

        if (!isMinimized) {
            setIndicatorState("hidden");
            lastSeenTargetKey.current = currentTargetKey;
            previousTargetIdsKey.current = currentTargetKey;
            return;
        }

        const contentChanged = currentTargetKey !== previousTargetIdsKey.current && currentTargetKey !== "";

        if (contentChanged) {
            const seenByUser = currentTargetKey === lastSeenTargetKey.current;
            previousTargetIdsKey.current = currentTargetKey;

            if (!seenByUser) {
                setIndicatorState("pulsing");
            }
        }
    }, [currentTargetKey, isMinimized, enabled, hasContent]);

    // transition pulsing
    useEffect(() => {
        if (indicatorState === "pulsing") {
            //1050 -> pulsing animation 350 x 3
            const timeoutId = setTimeout(() => {
                setIndicatorState("visible");
            }, 1050);

            return () => clearTimeout(timeoutId);
        }
        return undefined;
    }, [indicatorState]);

    const clearIndicator = useCallback(() => {
        setIndicatorState("hidden");
        lastSeenTargetKey.current = currentTargetKey;
    }, [currentTargetKey]);

    return {
        indicatorState,
        badgeProps: {
            isVisible: indicatorState !== "hidden",
            isPulsing: indicatorState === "pulsing",
        },
        clearIndicator,
    };
}
