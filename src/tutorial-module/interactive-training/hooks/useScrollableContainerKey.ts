import { useCallback, useEffect, useState } from "react";

import { LandingNode } from "../../../domain/entities/LandingPage";
import { TrainingModule } from "../../../domain/entities/TrainingModule";

type UseScrollableContainerKeyProps = {
    targetIds: string[];
    currentPage?: LandingNode;
    loadedModule?: TrainingModule;
};

export function useScrollableContainerKey(props: UseScrollableContainerKeyProps) {
    const { targetIds, currentPage, loadedModule } = props;

    const [triggerKey, setTriggerKey] = useState("");
    const [appendedKey, setAppendedKey] = useState("");

    useEffect(() => {
        setTriggerKey(`${targetIds.join("-")}-${currentPage?.id}-${loadedModule?.id}`);
    }, [targetIds, currentPage, loadedModule]);

    const appendToTriggerKey = useCallback((key: string) => {
        setAppendedKey(key);
    }, []);

    const triggerKeyWithAppend = `${triggerKey}-${appendedKey}`;

    return {
        triggerKey: triggerKeyWithAppend,
        appendToTriggerKey,
    };
}
