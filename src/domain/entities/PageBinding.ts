import { generateUid } from "../../data/utils/uid";
import { Maybe } from "../../types/utils";

export const EVENT_TYPE = {
    click: "click",
    focus: "focus",
    all: "all",
} as const;

export const BINDING_TYPE = {
    event: "event",
    section: "section",
} as const;

const EVENT_TYPES = [EVENT_TYPE.click, EVENT_TYPE.focus, EVENT_TYPE.all] as const;
const BINDING_TYPES = [BINDING_TYPE.event, BINDING_TYPE.section] as const;

export type EventType = typeof EVENT_TYPES[number];
export type BindingType = typeof BINDING_TYPES[number];

type BaseBinding = {
    id: string;
    description: Maybe<string>;
};

export type EventBinding = BaseBinding & {
    type: "event";
    trainingIdentifiers: string;
    eventType: EventType;
};

export type SectionBinding = BaseBinding & {
    type: "section";
    urlPattern: string;
};

export type PageBinding = EventBinding | SectionBinding;

const defaultEventBinding = (): EventBinding => ({
    id: generateUid(),
    description: undefined,
    type: "event",
    trainingIdentifiers: "",
    eventType: "click",
});

const defaultSectionBinding = (): SectionBinding => ({
    id: generateUid(),
    description: undefined,
    type: "section",
    urlPattern: "*/*",
});

export function getDefaultBinding(type: BindingType): PageBinding {
    switch (type) {
        case BINDING_TYPE.section:
            return defaultSectionBinding();
        case BINDING_TYPE.event:
            return defaultEventBinding();
    }
}

function urlPatternToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    const regexPattern = escaped
        .replace(/\*\*/g, "<!GLOBSTAR!>")
        .replace(/\*/g, "[^/]*")
        .replace(/<!GLOBSTAR!>/g, ".*");

    return new RegExp("^(?:/(?:index\\.html)?#)?" + regexPattern + "$");
}

export function matchesUrlPattern(currentPath: string, pattern: string): boolean {
    const normalizedPath = currentPath.replace(/^\/#/, "").split("?")[0];
    if (!normalizedPath) return false;

    const regex = urlPatternToRegex(pattern);
    return regex.test(normalizedPath);
}

export function isEventBinding(binding: PageBinding): binding is EventBinding {
    return binding.type === BINDING_TYPE.event;
}
export function isSectionBinding(binding: PageBinding): binding is SectionBinding {
    return binding.type === BINDING_TYPE.section;
}

export function getEventBindingIdentifiers(binding: EventBinding): string[] {
    if (!binding.trainingIdentifiers) return [];
    return binding.trainingIdentifiers
        .split(",")
        .map(id => id.trim())
        .filter(id => id.length > 0 && id !== "undefined" && id !== "null");
}
