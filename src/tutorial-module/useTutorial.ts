import React from "react";
import { TrainingModule } from "../domain/entities/TrainingModule";
import { Maybe } from "../types/utils";

export type ModuleStepType = "welcome" | "contents" | "steps" | "final" | "summary";

export function useUpdateModuleStep(props: { module: Maybe<TrainingModule> }) {
    const { module } = props;
    const [moduleStep, setModuleStep] = React.useState<ModuleStepType>("welcome");
    const [tutorialProgress, setTutorialProgress] = React.useState({ step: 1, content: 1 });

    const updateModuleStep = React.useCallback(
        (step: number, content: number) => {
            if (!module) {
                return;
            } else if (step === 0) {
                setModuleStep("contents");
            } else if (step > module.contents.steps.length) {
                setModuleStep("final");
            } else {
                setTutorialProgress({ step, content });
            }
        },
        [module]
    );

    return { moduleStep, setModuleStep, setTutorialProgress, tutorialProgress, updateModuleStep };
}
