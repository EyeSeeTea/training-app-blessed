import _ from "lodash";
import styled from "styled-components";

import { TrainingModule } from "../domain/entities/TrainingModule";
import i18n from "../utils/i18n";
import { MainButton } from "../webapp/components/main-button/MainButton";
import { Modal, ModalContent, ModalFooter, ModalParagraph, ModalTitle } from "../webapp/components/modal";
import { Stepper } from "../webapp/components/training-wizard/stepper/Stepper";
import { TranslateMethod } from "../domain/entities/TranslatableText";
import { HeaderButtonsProps } from "./TutorialRoot";

type FinalTrainingProps = {
    module: TrainingModule;
    onPrev: () => void;
    onFinish: () => void;
    onMove?: (step: number, content: number) => void;
    translate: TranslateMethod;
} & HeaderButtonsProps;

export const FinalTraining: React.FC<FinalTrainingProps> = props => {
    const { module, onExit, onFinish, onHome, onMinimize, onMove, onPrev, translate } = props;

    const steps = module.contents.steps.map(({ title }, idx) => ({
        key: `step-${idx}`,
        label: translate(title),
        component: () => null,
    }));

    return (
        <StyledModal onClose={onExit} onMinimize={onMinimize} onGoHome={onHome} centerChildren={true}>
            <ModalContent bigger={true}>
                <Container>
                    <ModalTitle big={true}>{i18n.t("Well done!")}</ModalTitle>
                    <ModalParagraph>
                        {i18n.t("You've completed the {{name}} tutorial!", {
                            name: translate(module.name),
                        })}
                    </ModalParagraph>
                    <Stepper
                        steps={steps}
                        lastClickableStepIndex={-1}
                        markAllCompleted={true}
                        onMove={onMove ?? _.noop}
                    />
                    <ModalFooter>
                        <MainButton onClick={onPrev}>{i18n.t("Back to tutorial")}</MainButton>
                        <MainButton onClick={onFinish}>{i18n.t("Finish")}</MainButton>
                    </ModalFooter>
                </Container>
            </ModalContent>
        </StyledModal>
    );
};

const StyledModal = styled(Modal)`
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    background-image: url(./img/decoration.png);
    background-position: center; /* Center the image */
    background-repeat: no-repeat; /* Do not repeat the image */
    height: 600px;

    ${ModalContent} {
        max-height: unset;
    }

    ${ModalTitle} {
        font-size: 60px;
    }

    ${ModalParagraph} {
        font-size: 34px;
        line-height: 42px;
        font-weight: 300;
        margin: 25px 0px 15px 0px;
    }

    ${ModalFooter} {
        margin-top: 20px;
    }
`;

const Container = styled.div`
    margin: 12% 18% 0 18%;
`;
