import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EVENT_TYPE, EventType } from "../../../domain/entities/PageBinding";
import { Maybe } from "../../../types/utils";
import { InteractiveTrainingContextState } from "../InteractiveTrainingProvider";
import { EventPageIdsByTrainingId, getEventPageIdsByTrainingIdMap, getSectionPageIds } from "../utils";
import { useCurrentLocation } from "./useCurrentLocation";
import { dataTrainingAttribute } from "./useInteractiveTrainingContext";

type EventElement = { element: Element; trigger?: EventType };
type TriggerPayload = {
    targetIds: string[];
    eventElement: Maybe<EventElement>;
};

export function useBindEvents(props: InteractiveTrainingContextState) {
    const { trigger: doTrigger, pages, events } = props;
    const noPages = pages.length === 0;
    const shouldHandleSectionEvent = events.includes("section");

    const trainingScopeRef = useRef<HTMLDivElement>(null);
    const [lastTriggeredPath, setLastTriggeredPath] = useState("");
    const location = useCurrentLocation({ hashOnly: true });
    const sectionPageIds = useMemo(() => getSectionPageIds(location, pages), [location, pages]);

    // use ref to avoid reregistering event listeners
    const currentEventRef = useRef<EventElement>();

    const handleTrigger = useCallback(
        (payload: TriggerPayload) => {
            const { targetIds, eventElement: nextEvent } = payload;
            if (shouldTriggerNextEvent(currentEventRef.current, nextEvent)) {
                doTrigger({ targetIds });
                currentEventRef.current = nextEvent;
            }
        },
        [doTrigger]
    );

    useEffect(() => {
        const root = trainingScopeRef.current;
        if (!root || noPages) return;

        const domEventSet = new Set(events.filter(e => e !== "section") as EventType[]);
        const eventPageIdsByTrainingId = getEventPageIdsByTrainingIdMap(pages, domEventSet);

        return setupEventListeners({
            root,
            eventSet: domEventSet,
            eventPageIdsByTrainingId,
            sectionPageIds,
            handleTrigger,
        });
    }, [sectionPageIds, handleTrigger, events, pages, noPages]);

    // Handle section-based navigation events
    useEffect(() => {
        if (!shouldHandleSectionEvent || noPages) return;
        if (lastTriggeredPath === location) return;

        setLastTriggeredPath(location);
        doTrigger({ targetIds: sectionPageIds });
    }, [location, sectionPageIds, doTrigger, lastTriggeredPath, noPages, shouldHandleSectionEvent]);

    return { trainingScopeRef };
}

type SetupEventListenersProps = {
    root: HTMLDivElement;
    eventSet: Set<EventType>;
    eventPageIdsByTrainingId: EventPageIdsByTrainingId;
    sectionPageIds: string[];
    handleTrigger: (payload: TriggerPayload) => void;
};
function setupEventListeners(props: SetupEventListenersProps) {
    const { root, eventSet, eventPageIdsByTrainingId, sectionPageIds, handleTrigger } = props;

    const eventOptions: AddEventListenerOptions = {
        capture: true, // Intercept events before component handlers
        passive: true, // Don't block scrolling (we only observe, never preventDefault)
    };

    const getPageIdsForElement = (
        element: Element,
        eventType: EventType
    ): { targetIds: string[]; trigger?: EventType } => {
        const trainingId = element.getAttribute(dataTrainingAttribute) || "";

        const targetIds = eventPageIdsByTrainingId[eventType]?.[trainingId];
        if (targetIds) return { targetIds: targetIds, trigger: eventType };

        const allPageIds = eventPageIdsByTrainingId["all"]?.[trainingId];
        if (allPageIds) return { targetIds: allPageIds, trigger: "all" };

        return { targetIds: [] };
    };

    const findTrainingElement = (target: Element, eventType: EventType): TriggerPayload => {
        const defaultResult = { targetIds: sectionPageIds, eventElement: { element: target } };

        const searchUpwards = (element: Element): TriggerPayload => {
            const match = element.closest(`[${dataTrainingAttribute}]`);

            if (!match || !root.contains(match)) {
                return defaultResult;
            }

            const { targetIds, trigger } = getPageIdsForElement(match, eventType);
            if (targetIds?.length) {
                return {
                    targetIds: targetIds,
                    eventElement: {
                        trigger: trigger,
                        element: target,
                    },
                };
            }

            const parent = match.parentElement;
            return parent ? searchUpwards(parent) : defaultResult;
        };

        return searchUpwards(target);
    };

    const handleEvent = (eventType: EventType) => (e: Event) => {
        if (e.target instanceof Element) {
            const payload = findTrainingElement(e.target, eventType);
            handleTrigger(payload);
        }
    };

    const clickHandler = handleEvent(EVENT_TYPE.click);
    const focusHandler = handleEvent(EVENT_TYPE.focus);

    if (eventSet.has(EVENT_TYPE.click)) {
        root.addEventListener("click", clickHandler, eventOptions);
    }
    if (eventSet.has(EVENT_TYPE.focus)) {
        root.addEventListener("focusin", focusHandler, eventOptions);
    }
    return () => {
        if (eventSet.has("click")) root.removeEventListener("click", clickHandler, eventOptions);
        if (eventSet.has("focus")) root.removeEventListener("focusin", focusHandler, eventOptions);
    };
}

//Priority order: focus > click > all
function shouldTriggerNextEvent(prevEvent: Maybe<EventElement>, nextEvent: Maybe<EventElement>): boolean {
    if (!prevEvent || !nextEvent) return true;

    const isDifferentElement = prevEvent.element !== nextEvent.element;
    const isFirstTrigger = !prevEvent.trigger;
    const isFocusEvent = nextEvent.trigger === "focus";
    const isClickOverridingAll = nextEvent.trigger === "click" && prevEvent.trigger === "all";

    return isDifferentElement || isFirstTrigger || isFocusEvent || isClickOverridingAll;
}
