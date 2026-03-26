import React from "react";
import { bindTrainingEvent } from "./hooks/useInteractiveTrainingContext";
import { Maybe } from "../../types/utils";

export const TrainingEventBinder: React.FC<{
    id: Maybe<string>;
    children: React.ReactNode;
}> = props => {
    const { children, id } = props;
    if (!id) return <>{children}</>;

    return <div {...bindTrainingEvent(id)}>{children}</div>;
};
