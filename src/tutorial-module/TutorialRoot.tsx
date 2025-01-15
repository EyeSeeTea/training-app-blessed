import React from "react";
import styled from "styled-components";

import { TrainingModule } from "../domain/entities/TrainingModule";
import { IFrame } from "../webapp/components/iframe/IFrame";
import { WelcomeTraining } from "./WelcomeTraining";
import { SummaryTraining } from "./SummaryTraining";
import { TrainingWizardModal } from "../webapp/components/training-wizard/TrainingWizardModal";
import { FinalTraining } from "./FinalTraining";
import { getCompositionRoot } from "../webapp/CompositionRoot";
import { buildTranslate } from "../domain/entities/TranslatableText";
import { ActionButton } from "../webapp/components/action-button/ActionButton";

import { LoadingProvider, SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { useUpdateModuleStep } from "./useTutorial";

export type HeaderButtonsProps = { onExit: () => void; onMinimize?: () => void; onHome: () => void };
export type TutorialModuleProps = { baseUrl?: string; locale?: string; moduleId: string } & HeaderButtonsProps;
export type UseTutorialModuleProps = { baseUrl: string; moduleId: string };

function useTrainingModule(props: UseTutorialModuleProps) {
    const { baseUrl, moduleId } = props;
    const compositionRoot = React.useMemo(() => getCompositionRoot(baseUrl), [baseUrl]);
    const [module, setModule] = React.useState<TrainingModule>();

    React.useEffect(() => {
        compositionRoot.usecases.modules
            .get(moduleId, { autoInstallDefaultModules: false })
            .then(setModule)
            .catch(() => {
                throw new Error(`Module not found: ${moduleId}`);
            });
    }, [moduleId, compositionRoot]);

    return module;
}

export const TutorialModule = (props: TutorialModuleProps) => {
    const { baseUrl, locale = "en", onExit, onHome, onMinimize } = props;
    const [moduleState, setModuleState] = React.useState<"default" | "minimized">("default");
    const module = useTrainingModule({ baseUrl: props.baseUrl || "", moduleId: props.moduleId });
    const { moduleStep, setModuleStep, setTutorialProgress, tutorialProgress, updateModuleStep } = useUpdateModuleStep({
        module,
    });

    const updateModuleState = React.useCallback(() => {
        setModuleState("minimized");
        if (onMinimize) onMinimize();
    }, [onMinimize]);

    const translateMethod = React.useMemo(() => buildTranslate(locale), [locale]);

    if (!module) return null;
    if (moduleState === "minimized") return <ActionButton onClick={() => setModuleState("default")} />;

    const showBackDrop = moduleStep === "welcome" || moduleStep === "contents";
    const commonEvents = { module, onHome, onMinimize: updateModuleState, onExit };

    return (
        <LoadingProvider>
            <SnackbarProvider>
                <IFrame src={`${baseUrl}${module.dhisLaunchUrl}`} />
                {showBackDrop && <Backdrop />}

                {moduleStep === "welcome" && (
                    <WelcomeTraining
                        {...commonEvents}
                        onStart={() => setModuleStep("contents")}
                        translate={translateMethod}
                    />
                )}

                {(moduleStep === "contents" || moduleStep === "summary") && (
                    <SummaryTraining
                        {...commonEvents}
                        completed={moduleStep === "summary"}
                        onPrev={() => setModuleStep("welcome")}
                        onStart={() => setModuleStep("steps")}
                        onStep={step => {
                            setModuleStep("steps");
                            setTutorialProgress({ step, content: 1 });
                        }}
                        translate={translateMethod}
                    />
                )}

                {moduleStep === "steps" && (
                    <TrainingWizardModal
                        {...commonEvents}
                        translate={translateMethod}
                        onClose={onExit}
                        onGoHome={onHome}
                        currentStep={`${module.id}-${tutorialProgress.step}-${tutorialProgress.content}`}
                        onChangeStep={updateModuleStep}
                        minimized={false}
                        updateProgress={() => Promise.resolve()}
                    />
                )}

                {moduleStep === "final" && (
                    <FinalTraining
                        {...commonEvents}
                        onFinish={onExit}
                        onPrev={() => setModuleStep("steps")}
                        translate={translateMethod}
                    />
                )}
            </SnackbarProvider>
        </LoadingProvider>
    );
};

const Backdrop = styled.div`
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    text-align: center;
    background-color: rgba(39, 102, 150, 0.3);
`;
