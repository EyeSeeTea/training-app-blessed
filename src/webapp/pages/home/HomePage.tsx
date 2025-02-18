import React, { useCallback, useEffect, useMemo, useState } from "react";
import CircularProgress from "material-ui/CircularProgress";
import styled from "styled-components";

import { LandingNode } from "../../../domain/entities/LandingPage";
import i18n from "../../../locales";
import { Modal, ModalContent, ModalTitle } from "../../components/modal";
import { useAppContext } from "../../contexts/app-context";
import { useAppConfigContext } from "../../contexts/AppConfigProvider";
import { HomePageContent } from "../../components/home/HomePageContent";

export const HomePage: React.FC = React.memo(() => {
    const { setAppState, landings, reload, isLoading } = useAppContext();
    const { hasSettingsAccess } = useAppConfigContext();

    const [history, updateHistory] = useState<LandingNode[]>([]);
    const [isLoadingLong, setLoadingLong] = useState<boolean>(false);

    const openSettings = useCallback(() => {
        setAppState({ type: "SETTINGS" });
    }, [setAppState]);

    const openAbout = useCallback(() => {
        setAppState({ type: "ABOUT" });
    }, [setAppState]);

    const minimize = useCallback(() => {
        setAppState(appState => ({ ...appState, minimized: true }));
    }, [setAppState]);

    const exitTutorial = useCallback(() => {
        setAppState(appState => ({ ...appState, exit: true }));
    }, [setAppState]);

    const openPage = useCallback((page: LandingNode) => {
        updateHistory(history => [page, ...history]);
    }, []);

    const goBack = useCallback(() => {
        updateHistory(history => history.slice(1));
    }, []);

    const goHome = useCallback(() => {
        updateHistory([]);
    }, []);

    const loadModule = useCallback(
        (module: string, step: number) => {
            if (step > 1) {
                setAppState({ type: "TRAINING", state: "OPEN", module, step, content: 1 });
            } else {
                setAppState({ type: "TRAINING_DIALOG", dialog: "welcome", module });
            }
        },
        [setAppState]
    );

    const currentPage = useMemo<LandingNode | undefined>(() => {
        return history[0] ?? landings[0];
    }, [history, landings]);

    const isRoot = history.length === 0;

    useEffect(() => {
        reload();
    }, [reload]);

    useEffect(() => {
        setTimeout(function () {
            setLoadingLong(true);
        }, 8000);
    }, []);

    return (
        <StyledModal
            onSettings={hasSettingsAccess ? openSettings : undefined}
            onAbout={openAbout}
            onMinimize={minimize}
            onClose={exitTutorial}
            onGoBack={!isRoot ? goBack : undefined}
            onGoHome={!isRoot ? goHome : undefined}
            centerChildren={true}
            allowDrag={true}
        >
            <ContentWrapper>
                {isLoading ? (
                    <React.Fragment>
                        <Progress color={"white"} size={65} />
                        {isLoadingLong ? (
                            <p>{i18n.t("First load can take a couple of minutes, please wait...")}</p>
                        ) : null}
                    </React.Fragment>
                ) : currentPage ? (
                    <HomePageContent
                        isRoot={isRoot}
                        loadModule={loadModule}
                        currentPage={currentPage}
                        openPage={openPage}
                    />
                ) : null}
            </ContentWrapper>
        </StyledModal>
    );
});

const Progress = styled(CircularProgress)`
    margin: 100px 50px;
`;

const StyledModal = styled(Modal)`
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 65vw;
    max-height: 80vh;

    ${ModalContent} {
        max-width: 65vw;
        padding: 0px;
        margin: 0px 10px 20px 10px;
    }

    ${ModalTitle} {
        margin: 20px;
    }
`;

const ContentWrapper = styled.div`
    padding: 15px;
`;
