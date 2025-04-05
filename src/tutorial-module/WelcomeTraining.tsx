import React from "react";
import styled from "styled-components";

import { MainButton } from "../webapp/components/main-button/MainButton";
import { Modal, ModalContent, ModalFooter } from "../webapp/components/modal";
import { MarkdownViewer } from "../webapp/components/markdown-viewer/MarkdownViewer";
import i18n from "../utils/i18n";
import { TrainingModule } from "../domain/entities/TrainingModule";
import { TranslateMethod } from "../domain/entities/TranslatableText";
import { HeaderButtonsProps } from "./TutorialRoot";

type WelcomeTrainingProps = {
    module: TrainingModule;
    translate: TranslateMethod;
    onExit: () => void;
    onStart: () => void;
} & HeaderButtonsProps;

export function WelcomeTraining(props: WelcomeTrainingProps) {
    const { module, onExit, onStart, translate, onHome, onMinimize } = props;
    return (
        <StyledModal onMinimize={onMinimize} onClose={onExit} onGoHome={onHome} centerChildren={true}>
            <WelcomePageContent welcome={translate(module.contents.welcome)} />
            <ModalFooter>
                <MainButton color="secondary" onClick={onExit}>
                    {i18n.t("Exit Tutorial")}
                </MainButton>
                <MainButton color="primary" onClick={onStart}>
                    {i18n.t("Start Tutorial")}
                </MainButton>
            </ModalFooter>
        </StyledModal>
    );
}

export const WelcomePageContent: React.FC<{ welcome: string }> = ({ welcome }) => {
    return (
        <ModalContent>
            <MarkdownViewer source={welcome} center={true} />
        </ModalContent>
    );
};

const StyledModal = styled(Modal)`
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    ${ModalContent} {
        padding-top: 25px;
        height: 100%;
        max-height: unset;
    }
`;
