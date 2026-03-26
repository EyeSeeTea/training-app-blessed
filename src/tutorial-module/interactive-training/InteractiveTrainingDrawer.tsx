import styled, { css } from "styled-components";
import React, { PropsWithChildren } from "react";
import { Box, Drawer } from "@material-ui/core";
import BackIcon from "@material-ui/icons/ArrowBack";
import SettingsIcon from "@material-ui/icons/Settings";
import HomeIcon from "@material-ui/icons/Home";

import { SideBarConfig } from "../../domain/entities/Config";
import { Tooltip, TooltipText } from "../../webapp/components/tooltip/Tooltip";
import i18n from "../../utils/i18n";
import { ScrollableContainer } from "./ScrollableContainer";
import { ActionButton } from "../../webapp/components/action-button/ActionButton";
import { useDrawerCollapseMode } from "./hooks/useDrawerCollapseMode";
import { NotificationBadgeState } from "./hooks/useContentChangeIndicator";
import { NotificationBadge } from "./components/NotificationBadge";

const DRAWER_COLLAPSED_WIDTH = 40;

type SideDrawerProps = {
    isMinimized: boolean;
    onMinimize: () => void;
    showTraining: () => void;
    onBack?: () => void;
    onHome?: () => void;
    onSettings?: () => void;
    triggerKey: string;
    containerConfig: SideBarConfig;
    drawerContent: React.ReactNode;
    badgeProps?: NotificationBadgeState;
};

export const InteractiveTrainingDrawer: React.FC<SideDrawerProps> = props => {
    const {
        isMinimized,
        onMinimize,
        showTraining,
        onBack,
        onHome,
        onSettings,
        children,
        triggerKey,
        containerConfig,
        drawerContent,
        badgeProps,
    } = props;

    const isRight = containerConfig.position === "right";

    const {
        isHideMode,
        toggleIcon,
        onToggleClick,
        toggleTooltip,
        toggleTooltipPlacement,
        headerOptionsTooltipPlacement,
        drawerIsRight,
        drawerVariant,
        showMini,
    } = useDrawerCollapseMode(containerConfig.collapseMode, isRight, isMinimized, onMinimize, showTraining);

    const buttonPosition =
        containerConfig.buttonPosition === "top-right"
            ? { top: "48px", right: "0px" }
            : { bottom: "10px", right: "0px" };

    const drawer = (
        <StyledDrawer
            variant={drawerVariant}
            anchor={containerConfig.position}
            open={!isMinimized}
            width={containerConfig.width}
            unit={containerConfig.unit}
            showMini={showMini}
        >
            <DrawerHeader isRight={drawerIsRight}>
                {!isMinimized && (
                    <HeaderOptions>
                        {onBack && (
                            <HeaderButton text={i18n.t("Back")} placement={headerOptionsTooltipPlacement}>
                                <BackIcon onClick={onBack} />
                            </HeaderButton>
                        )}
                        {onSettings && (
                            <HeaderButton text={i18n.t("Settings page")} placement={headerOptionsTooltipPlacement}>
                                <SettingsIcon onClick={onSettings} />
                            </HeaderButton>
                        )}
                        {onHome && (
                            <HeaderButton text={i18n.t("Home")} placement={headerOptionsTooltipPlacement}>
                                <HomeIcon onClick={onHome} />
                            </HeaderButton>
                        )}
                    </HeaderOptions>
                )}

                <DrawerToggleButton
                    Icon={toggleIcon}
                    onClick={onToggleClick}
                    tooltip={toggleTooltip}
                    tooltipPlacement={toggleTooltipPlacement}
                    isMinimized={isMinimized}
                    badgeProps={showMini && isMinimized ? badgeProps : undefined}
                >
                    {isMinimized && <HelpText>{i18n.t("help")}</HelpText>}
                </DrawerToggleButton>
            </DrawerHeader>

            {!isMinimized && <Content triggerKey={triggerKey}>{drawerContent}</Content>}
        </StyledDrawer>
    );

    return (
        <Box display="flex">
            {!isRight && drawer}
            <Box flexGrow={1}>{children}</Box>
            {isRight && drawer}
            {/* Hide mode only: floating action button when collapsed */}
            {isHideMode && isMinimized && (
                <ActionButtonContainer>
                    <ActionButton onClick={showTraining} {...buttonPosition}>
                        <HelpButton>?</HelpButton>
                        <NotificationBadge {...badgeProps} />
                    </ActionButton>
                </ActionButtonContainer>
            )}
        </Box>
    );
};

type DrawerToggleButtonProps = PropsWithChildren<{
    Icon: React.ElementType;
    onClick: () => void;
    tooltip: string;
    tooltipPlacement: "left" | "right";
    isMinimized: boolean;
    badgeProps?: NotificationBadgeState;
}>;

const DrawerToggleButton: React.FC<DrawerToggleButtonProps> = ({
    Icon,
    onClick,
    tooltip,
    tooltipPlacement,
    isMinimized,
    badgeProps,
    children,
}) => (
    <DrawerToggleContainer onClick={onClick}>
        <HeaderButton text={tooltip} placement={tooltipPlacement} isMinimized={isMinimized}>
            <Icon />
            {children}
        </HeaderButton>
        <NotificationBadge {...badgeProps} />
    </DrawerToggleContainer>
);

const DrawerToggleContainer = styled.div`
    position: relative;
`;

const Content = styled(ScrollableContainer)`
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #fff #6894b5;
    margin-top: 8px;
`;

const HeaderOptions = styled.div`
    display: flex;
    gap: 8px;
`;

export const HeaderButton = styled(Tooltip)<{ isMinimized?: boolean }>`
    cursor: pointer;

    ${({ isMinimized }) => {
        return isMinimized
            ? css`
                  display: flex;
                  flex-direction: column;
                  align-items: center;
              `
            : "";
    }}

    svg {
        font-size: 18px !important;
        font-weight: bold;
    }

    ${TooltipText} {
        z-index: 9999;
        left: ${({ placement }) => (placement === "right" ? "150%" : "unset")};
    }
`;

const DrawerHeader = styled.div<{ isRight?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block-start: 12px;
    padding-inline: 12px;
    color: white;
    flex-direction: ${({ isRight }) => (isRight ? "row-reverse" : "row")};
`;

const StyledDrawer = styled(Drawer)<{ open: boolean; width: number; unit: SideBarConfig["unit"]; showMini: boolean }>`
    flex-shrink: 0;
    color: white;

    ${({ open, width, unit, showMini }) => {
        if (open) return openedStyles({ width, unit });
        if (showMini) return closedStyles;
        return "";
    }}
`;

const drawerPaperStyles = css`
    background-color: #276696;
    border-left: 2px solid #2b5b77;
`;

const openedStyles = ({ width, unit }: { width: number; unit: SideBarConfig["unit"] }) => css`
    width: ${width}${unit};
    min-width: 450px;
    transition: width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms;
    overflow-x: hidden;

    & .MuiDrawer-paper {
        width: ${width}${unit};
        min-width: 450px;
        transition: width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms;
        overflow-x: hidden;
        ${drawerPaperStyles}
    }
`;

const closedStyles = css`
    transition: width 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms;
    width: ${DRAWER_COLLAPSED_WIDTH}px;
    overflow: visible;
    display: flex;

    & .MuiDrawer-paper {
        flex: 1;
        justify-content: center;
        transition: width 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms;
        width: ${DRAWER_COLLAPSED_WIDTH}px;
        overflow: visible;
        ${drawerPaperStyles}
    }
`;

const ActionButtonContainer = styled.div`
    position: relative;

    .MuiFab-root {
        padding: 0;
    }
`;

const HelpButton = styled.div`
    font-size: 20px;
`;

const HelpText = styled.span`
    writing-mode: vertical-rl;
    text-orientation: mixed;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
`;
