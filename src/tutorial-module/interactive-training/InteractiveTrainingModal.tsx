import styled from "styled-components";
import React from "react";

import { Modal, ModalContent } from "../../webapp/components/modal";
import { ScrollableContainer } from "./ScrollableContainer";
import { ActionButton } from "../../webapp/components/action-button/ActionButton";
import { DialogConfig } from "../../domain/entities/Config";
import { NotificationBadgeState } from "./hooks/useContentChangeIndicator";
import { NotificationBadge } from "./components/NotificationBadge";

type InteractiveTrainingModalProps = React.ComponentProps<typeof Modal> & {
    triggerKey: string;
    showTraining: () => void;
    containerConfig: DialogConfig;
    badgeProps?: NotificationBadgeState;
};

export const InteractiveTrainingModal: React.FC<InteractiveTrainingModalProps> = props => {
    const { children, triggerKey, showTraining, containerConfig, badgeProps, ...modalProps } = props;

    const position =
        containerConfig.buttonPosition === "top-right"
            ? {
                  top: "48px",
                  right: "0px",
              }
            : {
                  bottom: "10px",
                  right: "0px",
              };

    return (
        <>
            <ScrollableContainer triggerKey={triggerKey} targetContainerSelector={"[data-component='modal-content']"}>
                <StyledModal {...modalProps} centerChildren={true} allowDrag={true} resetPositionOnMinimize={false}>
                    <ModalContent>{children}</ModalContent>
                </StyledModal>
            </ScrollableContainer>
            <ActionButtonContainer hidden={!modalProps.minimized}>
                <ActionButton onClick={showTraining} {...position}>
                    <HelpButton>?</HelpButton>
                    <NotificationBadge {...badgeProps} />
                </ActionButton>
            </ActionButtonContainer>
        </>
    );
};

const StyledModal = styled(Modal)`
    position: fixed;
    margin: 6px;
    bottom: 20px;
    right: 40px;
    min-width: 600px;

    visibility: ${({ minimized }) => (minimized ? "hidden" : "visible")};

    .MuiPaper-root {
        padding: ${({ minimized }) => (minimized ? "35px 0px 20px" : "inherit")};
    }
`;

const ActionButtonContainer = styled.div<{ hidden: boolean }>`
    position: relative;
    visibility: ${({ hidden }) => (hidden ? "hidden" : "visible")};

    .MuiFab-root {
        padding: 0;
    }
`;

const HelpButton = styled.div`
    font-size: 20px;
`;
