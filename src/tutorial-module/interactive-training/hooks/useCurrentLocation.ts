import { useEffect, useRef, useState } from "react";

type LocationOptions = {
    hashOnly?: boolean;
};

export function useCurrentLocation(options?: LocationOptions) {
    const [url, setUrl] = useState(getLocation(options));
    const observerRef = useRef<ReturnType<typeof createLocationObserver>>();

    useEffect(() => {
        if (!observerRef.current) {
            observerRef.current = createLocationObserver();
        }

        const handleChange = () => {
            setUrl(getLocation(options));
        };

        return observerRef.current.subscribe(handleChange);
    }, [options]);

    return url;
}

function getLocation(options?: LocationOptions) {
    if (options?.hashOnly) {
        const hash = window.location.hash.split("?")[0];
        return hash || "#/";
    }
    return window.location.pathname + window.location.hash.split("?")[0];
}

function createLocationObserver() {
    const listeners = new Set<() => void>();

    const notify = () => listeners.forEach(fn => fn());

    const patch = () => {
        const { pushState, replaceState } = window.history;
        window.history.pushState = function (...args) {
            pushState.apply(this, args);
            notify();
        };
        window.history.replaceState = function (...args) {
            replaceState.apply(this, args);
            notify();
        };
        window.addEventListener("hashchange", notify);
        window.addEventListener("popstate", notify);
    };

    const unpatch = () => {
        window.removeEventListener("hashchange", notify);
        window.removeEventListener("popstate", notify);
    };

    const subscribe = (callback: () => void) => {
        if (listeners.size === 0) patch();
        listeners.add(callback);
        return () => {
            listeners.delete(callback);
            if (listeners.size === 0) unpatch();
        };
    };

    return { subscribe };
}
