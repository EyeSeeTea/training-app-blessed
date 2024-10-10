import React, { useCallback, useEffect } from "react";
import { FinalTraining } from "../../../tutorial-module/FinalTraining";
import { useAppContext } from "../../contexts/app-context";

export const FinalPage: React.FC = () => {
    const { usecases, setAppState, module, translate } = useAppContext();

    const openSummary = useCallback(() => {
        setAppState(appState => {
            if (appState.type !== "TRAINING_DIALOG") return appState;
            return { type: "TRAINING_DIALOG", module: appState.module, dialog: "summary" };
        });
    }, [setAppState]);

    const goToLastTutorialStep = useCallback(() => {
        if (!module) return;
        const step = module.contents.steps.length;
        const content = module.contents.steps[step - 1]?.pages.length ?? 0;

        setAppState({
            type: "TRAINING",
            state: "OPEN",
            module: module.id,
            step,
            content,
        });
    }, [setAppState, module]);

    const goHome = useCallback(() => {
        setAppState({ type: "HOME" });
    }, [setAppState]);

    const minimize = useCallback(() => {
        setAppState(appState => ({ ...appState, minimized: true }));
    }, [setAppState]);

    const exit = useCallback(() => {
        setAppState(appState => ({ ...appState, exit: true }));
    }, [setAppState]);

    const movePage = useCallback(
        (step: number, content: number) => {
            setAppState(appState => {
                if (appState.type !== "TRAINING") return appState;
                return { ...appState, step, content };
            });
        },
        [setAppState]
    );

    useEffect(() => {
        if (module) usecases.progress.complete(module.id);
    }, [module, usecases]);

    if (!module) return null;

    return (
        <FinalTraining
            module={module}
            onPrev={goToLastTutorialStep}
            onFinish={openSummary}
            translate={translate}
            onExit={exit}
            onHome={goHome}
            onMinimize={minimize}
            onMove={movePage}
        />
    );
};
