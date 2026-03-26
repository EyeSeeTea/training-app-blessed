import { useContext } from "react";
import { InteractiveTrainingContext } from "../InteractiveTrainingProvider";
import { Maybe } from "../../../types/utils";

export const dataTrainingAttribute = "data-training-id";

export function useInteractiveTrainingContext() {
    const context = useContext(InteractiveTrainingContext);
    if (!context) {
        throw new Error("useInteractiveTrainingContext must be used within InteractiveTrainingProvider");
    }
    return context;
}

export function bindTrainingEvent(id: Maybe<string>) {
    return id ? { [dataTrainingAttribute]: id } : {};
}
