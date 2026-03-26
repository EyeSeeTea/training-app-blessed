import React, { createContext, PropsWithChildren, useCallback, useMemo } from "react";

import { TrainingModulePage } from "../../domain/entities/TrainingModule";
import { Maybe } from "../../types/utils";
import { useBindEvents } from "./hooks/useBindEvents";
import "./InteractiveTrainingProvider.css";
import { TrainingContainer } from "./TrainingContainer";
import {
    useModuleState,
    useTrainingContent,
    useTrainingResources,
    useTutorialModuleState,
} from "./hooks/useInteractiveTraining";
import { TrainingLanding } from "./TrainingLanding";
import { useScrollableContainerKey } from "./hooks/useScrollableContainerKey";
import { useContentChangeIndicator } from "./hooks/useContentChangeIndicator";

const trainingEventKinds = ["click", "focus", "section"] as const;
type TrainingEventKind = typeof trainingEventKinds[number];

export type InteractiveTrainingContextState = {
    pages: TrainingModulePage[];
    trigger: (props: { targetIds: string[] }) => void;
    events: TrainingEventKind[];
};
export const InteractiveTrainingContext = createContext<Maybe<InteractiveTrainingContextState>>(undefined);

type TutorialModuleProps = PropsWithChildren<{
    baseUrl?: string;
    locale?: string;
    events?: TrainingEventKind[];
    highlightElementsWithBindings?: boolean;
    trainingAppKey?: string;
    showContentChangeIndicator?: boolean;
}>;

const defaultAppKey = "Training-App";

export const InteractiveTrainingProvider: React.FC<TutorialModuleProps> = props => {
    const {
        baseUrl,
        locale = "en",
        events = [...trainingEventKinds],
        highlightElementsWithBindings,
        trainingAppKey = defaultAppKey,
        showContentChangeIndicator = true,
        children,
    } = props;

    const {
        pages,
        containerConfig,
        d2Api,
        settingsAccess,
        landings,
        modules,
        isLoading,
        currentUser,
        ...trainingData
    } = useTrainingResources({
        baseUrl: baseUrl || "",
        trainingAppKey,
    });

    const { minimizeTraining, showTraining, isMinimized } = useModuleState();
    const { textContent, trigger, translate, targetIds } = useTrainingContent({ pages, locale, d2Api, trainingAppKey });
    const { onGoBack, onGoHome, currentPage, ...moduleHandling } = useTutorialModuleState({
        modules,
        landings,
        textContent,
        currentUser,
    });
    const { triggerKey, appendToTriggerKey } = useScrollableContainerKey({
        targetIds,
        currentPage,
        loadedModule: moduleHandling.loadedModule,
    });

    const { badgeProps, clearIndicator } = useContentChangeIndicator({
        targetIds,
        textContent,
        isMinimized,
        enabled: showContentChangeIndicator,
    });

    const handleShowTraining = useCallback(() => {
        clearIndicator();
        showTraining();
    }, [clearIndicator, showTraining]);

    const containerClass = `training-scope ${highlightElementsWithBindings ? "highlight-training-elements" : ""}`;

    const contextValue = useMemo(() => ({ pages, trigger, events }), [pages, trigger, events]);
    const { trainingScopeRef } = useBindEvents(contextValue);

    return (
        <InteractiveTrainingContext.Provider value={contextValue}>
            <TrainingContainer
                isLoading={isLoading}
                containerConfig={containerConfig}
                content={textContent}
                triggerKey={triggerKey}
                isMinimized={isMinimized}
                onMinimize={minimizeTraining}
                showTraining={handleShowTraining}
                badgeProps={badgeProps}
                settingsAccess={settingsAccess}
                goBack={onGoBack}
                goHome={onGoHome}
                defaultContent={
                    <TrainingLanding
                        {...trainingData}
                        {...moduleHandling}
                        currentPage={currentPage}
                        landings={landings}
                        modules={modules}
                        translate={translate}
                        onHome={onGoHome}
                        appendToTriggerKey={appendToTriggerKey}
                    />
                }
            >
                <div ref={trainingScopeRef} className={containerClass}>
                    {children}
                </div>
            </TrainingContainer>
        </InteractiveTrainingContext.Provider>
    );
};
