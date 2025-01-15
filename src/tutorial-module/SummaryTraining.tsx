import React from "react";
import styled from "styled-components";
import { TrainingModule } from "../domain/entities/TrainingModule";
import { TranslateMethod } from "../domain/entities/TranslatableText";
import i18n from "../locales";
import { MainButton } from "../webapp/components/main-button/MainButton";
import { Modal, ModalContent, ModalFooter, ModalTitle } from "../webapp/components/modal";
import { Bullet } from "../webapp/components/training-wizard/stepper/Bullet";
import { Label, Line, Step } from "../webapp/pages/summary/SummaryStep";
import { HeaderButtonsProps } from "./TutorialRoot";

export type SummaryProps = {
    module: TrainingModule;
    completed?: boolean;
    onPrev: () => void;
    onStep: (step: number) => void;
    onStart: () => void;
    translate: TranslateMethod;
} & HeaderButtonsProps;

export function SummaryTraining(props: SummaryProps) {
    const { completed, module, onExit, onPrev, onStart, onStep, translate, onMinimize, onHome } = props;

    const title = completed ? i18n.t("What did you learn in this tutorial?") : i18n.t("What will this tutorial cover?");

    const prevText = completed ? i18n.t("Back to tutorial") : i18n.t("Previous");
    const nextText = completed ? i18n.t("Take another tutorial") : i18n.t("Start");

    return (
        <StyledModal
            completed={completed}
            onClose={onExit}
            onMinimize={onMinimize}
            onGoHome={onHome}
            centerChildren={true}
        >
            <ContentWrapper>
                <ModalTitle>{title}</ModalTitle>
                <ModalContent bigger={true}>
                    {module?.contents.steps.map(({ title }, idx) => {
                        return (
                            <SummaryStep
                                key={`step-${idx}`}
                                module={module}
                                onStep={onStep}
                                position={idx}
                                title={translate(title)}
                            />
                        );
                    })}
                </ModalContent>
                <ModalFooter>
                    <MainButton onClick={onPrev}>{prevText}</MainButton>
                    <MainButton onClick={onStart}>{nextText}</MainButton>
                </ModalFooter>
            </ContentWrapper>
        </StyledModal>
    );
}

const SummaryStep = React.memo(
    (props: { module: TrainingModule; position: number; onStep: (position: number) => void; title: string }) => {
        const { module, onStep, position, title } = props;
        const half = module.contents.steps.length / 2;
        const column = position < half ? "left" : "right";
        const row = position % half;
        const last = position + 1 === Math.round(half) || position === module.contents.steps.length - 1;

        return (
            <Step column={column} row={row} last={last}>
                <Line />
                <Bullet stepKey={position + 1} onClick={() => onStep(position + 1)} />
                <Label onClick={() => onStep(position + 1)}>{title}</Label>
            </Step>
        );
    }
);

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
