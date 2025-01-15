import React, { useCallback } from "react";
import { SummaryTraining } from "../../../tutorial-module/SummaryTraining";
import { useAppContext } from "../../contexts/app-context";

export const SummaryPage: React.FC<{ completed?: boolean }> = ({ completed }) => {
    const { module, setAppState, translate } = useAppContext();

    const startTutorial = useCallback(() => {
        if (!module) return;
        setAppState({
            type: "TRAINING",
            state: "OPEN",
            module: module.id,
            step: 1,
            content: 1,
        });
    }, [setAppState, module]);

    const goToWelcomePage = useCallback(() => {
        if (!module) return;
        setAppState({
            type: "TRAINING_DIALOG",
            dialog: "welcome",
            module: module.id,
        });
    }, [setAppState, module]);

    const endTutorial = useCallback(() => {
        if (!module) return;
        setAppState({ type: "HOME" });
    }, [setAppState, module]);

    const minimize = useCallback(() => {
        setAppState(appState => ({ ...appState, minimized: true }));
    }, [setAppState]);

    const goHome = useCallback(() => {
        setAppState({ type: "HOME" });
    }, [setAppState]);

    const exitTutorial = useCallback(() => {
        setAppState(appState => ({ ...appState, exit: true }));
    }, [setAppState]);

    const jumpToStep = useCallback(
        (step: number) => {
            if (!module) return;
            setAppState({ type: "TRAINING", module: module.id, step, content: 1, state: "OPEN" });
        },
        [module, setAppState]
    );

    const prev = completed ? startTutorial : goToWelcomePage;
    const next = completed ? endTutorial : startTutorial;

    if (!module) return null;

    return (
        <SummaryTraining
            completed={completed}
            module={module}
            onExit={exitTutorial}
            onHome={goHome}
            onMinimize={minimize}
            onPrev={prev}
            onStart={next}
            onStep={jumpToStep}
            translate={translate}
        />
    );
};
