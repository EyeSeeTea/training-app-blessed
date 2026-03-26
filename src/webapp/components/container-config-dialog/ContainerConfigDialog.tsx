import { useCallback, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { Box, TextField } from "@material-ui/core";
import { Dropdown, ConfirmationDialog, DropdownItem } from "@eyeseetea/d2-ui-components";
import styled from "styled-components";

import { ContainerConfig, defaultContainerConfig, SideBarConfig } from "../../../domain/entities/Config";
import i18n from "../../../utils/i18n";

export type ContainerConfigDialogProps = {
    containerConfig?: ContainerConfig;
    onSave: (data: ContainerConfig) => void;
    onClose: () => void;
};
type SideBarProps = Omit<SideBarConfig, "type">;

export const ContainerConfigDialog: React.FC<ContainerConfigDialogProps> = props => {
    const { onSave, onClose, containerConfig } = props;
    const { type, ...sideBarProps } = containerConfig || defaultContainerConfig;
    const defaultSidebarProps = getDefaultSidebarProps();

    const [containerType, setContainerType] = useState<ContainerConfig["type"]>(type);
    const [sideBarConfig, setSideBarConfig] = useState<SideBarProps>({ ...defaultSidebarProps, ...sideBarProps });

    const handleSave = useCallback(() => {
        onSave({
            type: containerType,
            ...sideBarConfig,
        });
    }, [onSave, containerType, sideBarConfig]);

    const handleSidebarChange = useCallback(<K extends keyof SideBarConfig>(key: K, value: SideBarConfig[K]) => {
        setSideBarConfig(prev => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    return (
        <ConfirmationDialog isOpen={true} fullWidth={true} onSave={handleSave} onClose={onClose}>
            <Typography variant="h6">{i18n.t("Container Configuration")}</Typography>
            <Container>
                <StyledDropdown
                    label={i18n.t("Type")}
                    onChange={value => {
                        if (value) setContainerType(value);
                    }}
                    value={containerType}
                    items={getTypeOptions()}
                    hideEmpty
                />
                {containerType === "sidebar" && (
                    <>
                        <StyledDropdown
                            label={i18n.t("Position")}
                            onChange={value => {
                                if (value) handleSidebarChange("position", value);
                            }}
                            value={sideBarConfig.position || defaultSidebarProps.position}
                            items={getPositionOptions()}
                            hideEmpty
                        />
                        <Box display="flex">
                            <StyledTextField
                                label={i18n.t("Width")}
                                value={sideBarConfig.width || defaultSidebarProps.width}
                                onChange={event => handleSidebarChange("width", Number(event.target.value))}
                                type="number"
                            />
                            <StyledDropdown
                                label={i18n.t("Unit")}
                                onChange={value => {
                                    if (value) handleSidebarChange("unit", value);
                                }}
                                value={sideBarConfig.unit || defaultSidebarProps.unit}
                                items={getUnitOptions()}
                                hideEmpty
                            />
                        </Box>
                        <StyledDropdown
                            label={i18n.t("Collapse Mode")}
                            onChange={value => {
                                if (value) handleSidebarChange("collapseMode", value);
                            }}
                            value={sideBarConfig.collapseMode || defaultSidebarProps.collapseMode}
                            items={getCollapseModeOptions()}
                            hideEmpty
                        />
                    </>
                )}
            </Container>
        </ConfirmationDialog>
    );
};

function getDefaultSidebarProps(): SideBarProps {
    const { type: _, ...sideBarProps } = defaultContainerConfig;
    return sideBarProps;
}

function getTypeOptions(): DropdownItem<ContainerConfig["type"]>[] {
    return [
        { value: "dialog", text: i18n.t("Dialog") },
        { value: "sidebar", text: i18n.t("Side bar") },
    ];
}
function getPositionOptions(): DropdownItem<SideBarConfig["position"]>[] {
    return [
        { value: "left", text: i18n.t("Left") },
        { value: "right", text: i18n.t("Right") },
    ];
}

function getUnitOptions(): DropdownItem<SideBarConfig["unit"]>[] {
    return [
        { value: "px", text: "px" },
        { value: "%", text: "%" },
    ];
}

function getCollapseModeOptions(): DropdownItem<SideBarConfig["collapseMode"]>[] {
    return [
        { value: "mini", text: "Mini" },
        { value: "hide", text: "Hide" },
    ];
}

const Container = styled(Box)`
    margin-block-start: 16px;
`;

const StyledDropdown = styled(Dropdown)`
    margin-block-end: 24px;
    margin-block-start: 8px;

    label {
        color: #494949 !important;
    }
    div {
        color: black;
    }
` as typeof Dropdown;

const StyledTextField = styled(TextField)`
    width: 150px;
    margin-inline: 12px;
`;
