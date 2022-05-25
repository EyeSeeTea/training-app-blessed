import AddIcon from "@material-ui/icons/Add";
import BackIcon from "@material-ui/icons/ArrowBack";
import CloseIcon from "@material-ui/icons/Close";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import HomeIcon from "@material-ui/icons/Home";
import MinimizeIcon from "@material-ui/icons/Minimize";
import SettingsIcon from "@material-ui/icons/Settings";
import AboutIcon from "@material-ui/icons/Info";
import React from "react";
import styled from "styled-components";
import i18n from "../../../locales";
import { Tooltip, TooltipText, TooltipWrapper } from "../tooltip/Tooltip";
import { Grid } from "@material-ui/core";

export const ModalHeader: React.FC<ModalHeaderProps> = ({
    allowDrag,
    minimized,
    onClose,
    onGoHome,
    onGoBack,
    onMinimize,
    onSettings,
    onAbout,
}) => {
    return (
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <div>
                {onGoHome ? (
                    <HomeButton text={i18n.t("Home")} placement={"right"}>
                        <HomeIcon onClick={onGoHome} />
                    </HomeButton>
                ) : null}
                {onSettings ? (
                    <SettingsButton text={i18n.t("Settings")} placement={"right"}>
                        <SettingsIcon onClick={onSettings} />
                    </SettingsButton>
                ) : null}
                {onAbout ? (
                    <SettingsButton text={i18n.t("About")} placement={"right"}>
                        <AboutIcon onClick={onAbout} />
                    </SettingsButton>
                ) : null}
                {onGoBack ? (
                    <HomeButton text={i18n.t("Back")} placement={"right"}>
                        <BackIcon onClick={onGoBack} />
                    </HomeButton>
                ) : null}
            </div>
            <div>
                {allowDrag ? (
                    <DragButton text={i18n.t("Move window")}>
                        <DragIndicatorIcon />
                    </DragButton>
                ) : null}
            </div>
            <div>
                {onClose ? (
                    <CloseButton text={i18n.t("Exit tutorial")}>
                        <CloseIcon onClick={onClose} />
                    </CloseButton>
                ) : null}
                {onMinimize && minimized ? (
                    <ExpandButton text={i18n.t("Expand window")}>
                        <AddIcon onClick={onMinimize} />
                    </ExpandButton>
                ) : onMinimize ? (
                    <MinimizeButton text={i18n.t("Minimize window")}>
                        <MinimizeIcon onClick={onMinimize} />
                    </MinimizeButton>
                ) : null}
            </div>
        </Grid>
    );
};

export interface ModalHeaderProps {
    allowDrag?: boolean;
    minimized?: boolean;
    onClose?: () => void;
    onGoHome?: () => void;
    onMinimize?: () => void;
    onSettings?: () => void;
    onAbout?: () => void;
    onGoBack?: () => void;
}

const DragButton = styled(Tooltip)`
    cursor: pointer;

    svg {
        font-size: 24px !important;
        font-weight: bold;

        -webkit-transform: rotate(90deg);
        -moz-transform: rotate(90deg);
        -ms-transform: rotate(90deg);
        -o-transform: rotate(90deg);
        transform: rotate(90deg);
    }

    ${TooltipText} {
        top: -2px;
    }
`;

const CloseButton = styled(Tooltip)`
    cursor: pointer;

    svg {
        font-size: 20px !important;
        font-weight: bold;
        margin-right: 8px;
    }
`;

const HomeButton = styled(Tooltip)`
    cursor: pointer;

    svg {
        font-size: 20px !important;
        font-weight: bold;
        margin-right: 8px;
    }

    ${TooltipWrapper}: {
        float: right;
    }
`;

const MinimizeButton = styled(Tooltip)`
    cursor: pointer;

    svg {
        font-size: 18px !important;
        font-weight: bold;
    }

    ${TooltipText} {
        top: -10px;
    }
`;

const ExpandButton = styled(Tooltip)`
    cursor: pointer;

    svg {
        font-size: 18px !important;
        font-weight: bold;
    }
`;

const SettingsButton = styled(Tooltip)`
    cursor: pointer;

    svg {
        font-size: 20px !important;
        font-weight: bold;
        margin-right: 8px;
    }

    ${TooltipWrapper}: {
        float: right;
    }
`;
