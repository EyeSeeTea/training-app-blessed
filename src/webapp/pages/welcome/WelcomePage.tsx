import { useCallback } from "react";
import { WelcomeTraining } from "../../../tutorial-module/WelcomeTraining";
import { useAppContext } from "../../contexts/app-context";

export const WelcomePage = () => {
    const { setAppState, module, translate } = useAppContext();

    const startTutorial = useCallback(() => {
        if (!module) return;
        setAppState({ type: "TRAINING_DIALOG", dialog: "contents", module: module.id });
    }, [module, setAppState]);

    const exitTutorial = useCallback(() => {
        setAppState(appState => ({ ...appState, exit: true }));
    }, [setAppState]);

    const minimize = useCallback(() => {
        setAppState(appState => ({ ...appState, minimized: true }));
    }, [setAppState]);

    const goHome = useCallback(() => {
        setAppState({ type: "HOME" });
    }, [setAppState]);

    if (!module) return null;

    return (
        <WelcomeTraining
            module={module}
            onExit={exitTutorial}
            onHome={goHome}
            onMinimize={minimize}
            onStart={startTutorial}
            translate={translate}
        />
    );
};
