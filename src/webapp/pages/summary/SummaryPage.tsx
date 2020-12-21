import React, { useCallback } from "react";
import styled from "styled-components";
import i18n from "../../../locales";
import { MainButton } from "../../components/main-button/MainButton";
import { Modal, ModalContent, ModalFooter, ModalTitle } from "../../components/modal";
import { Bullet } from "../../components/training-wizard/stepper/Bullet";
import { useAppContext } from "../../contexts/app-context";
import { Label, Line, Step } from "./SummaryStep";

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

    const title = completed
        ? i18n.t("What did you learn in this tutorial?")
        : i18n.t("What will this tutorial cover?");

    const prev = completed ? startTutorial : goToWelcomePage;
    const next = completed ? endTutorial : startTutorial;

    const prevText = completed ? i18n.t("Back to tutorial") : i18n.t("Previous");
    const nextText = completed ? i18n.t("Take another tutorial") : i18n.t("Start");

    return (
        <StyledModal
            completed={completed}
            onClose={exitTutorial}
            onMinimize={minimize}
            onGoHome={goHome}
            centerChildren={true}
        >
            <ContentWrapper>
                <ModalTitle>{title}</ModalTitle>
                <ModalContent bigger={true}>
                    {module?.contents.steps.map(({ title }, idx) => {
                        const half = module.contents.steps.length / 2;
                        const column = idx < half ? "left" : "right";
                        const row = idx % half;
                        const last =
                            idx + 1 === Math.round(half) ||
                            idx === module.contents.steps.length - 1;

                        return (
                            <Step key={`step-${idx}`} column={column} row={row} last={last}>
                                <Line />
                                <Bullet stepKey={idx + 1} onClick={() => jumpToStep(idx + 1)} />
                                <Label onClick={() => jumpToStep(idx + 1)}>
                                    {translate(title)}
                                </Label>
                            </Step>
                        );
                    })}
                </ModalContent>
                <ModalFooter>
                    <MainButton onClick={prev}>{prevText}</MainButton>
                    <MainButton onClick={next}>{nextText}</MainButton>
                </ModalFooter>
            </ContentWrapper>
        </StyledModal>
    );
};

const StyledModal = styled(Modal)<{ completed?: boolean }>`
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    ${ModalContent} {
        margin: 25px;
        max-height: 400px;

        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }

    ${({ completed }) =>
        !completed &&
        `
        ${Line} {
            border-left: 2px solid white;
        }

        ${Bullet} {
            color: white;
            background-color: #276696;
            border: 2px solid white;
        }
    `}
`;

const ContentWrapper = styled.div`
    padding: 15px;
`;
