import MoreVertIcon from "@material-ui/icons/MoreVert";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import { Box, Icon, IconButton, TextField } from "@material-ui/core";
import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";

import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import i18n from "../../../locales";
import { CustomText, CustomTextInfo } from "../../../domain/entities/CustomText";
import { ImportTranslationDialog } from "../import-translation-dialog/ImportTranslationDialog";
import { useCustomizeSettingsDialog } from "./useCustomizeSettingsDialog";

export type CustomizeSettingsSaveForm = {
    customText: Partial<CustomText>;
    logo: string;
};

export type CustomSettingsDialogProps = CustomizeSettingsSaveForm & {
    onSave: (data: Partial<CustomizeSettingsSaveForm>) => void;
    onClose: () => void;
};

export const CustomizeSettingsDialog: React.FC<CustomSettingsDialogProps> = props => {
    const { onSave, customText, logo, onClose } = props;
    const {
        logoVal,
        customTextVal,
        defaultCustomText,
        customTextKeys,
        isCustomTextDefault,
        disableSave,
        save,
        onChangeField,
        handleFileUpload,
        translationImportRef,
        handleTranslationUpload,
        exportTranslations,
        importTranslations,
    } = useCustomizeSettingsDialog({ logo, customText, onSave });

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchor);

    const handleClickMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchor(event.currentTarget);
    }, []);

    const handleCloseMenu = useCallback(() => {
        setMenuAnchor(null);
    }, []);

    const menuAction = useMemo(
        () => [
            {
                key: "export",
                icon: <Icon>cloud_download</Icon>,
                text: i18n.t("Export JSON translations"),
                onClick: async () => {
                    await exportTranslations();
                    handleCloseMenu();
                },
            },
            {
                key: "import",
                icon: <Icon>translate</Icon>,
                text: i18n.t("Import JSON translations"),
                onClick: () => {
                    importTranslations();
                    handleCloseMenu();
                },
            },
        ],
        [exportTranslations, importTranslations, handleCloseMenu]
    );

    return (
        <ConfirmationDialog
            isOpen={true}
            fullWidth={true}
            onSave={save}
            cancelText={i18n.t("Close")}
            onCancel={onClose}
            disableSave={disableSave}
        >
            <ImportTranslationDialog type="custom-text" ref={translationImportRef} onSave={handleTranslationUpload} />
            <Typography variant="h6">{i18n.t("Home page logo")}</Typography>
            <Box marginBottom={3}>
                <IconUpload>
                    <IconContainer>
                        <img src={logoVal} alt={`Home page logo`} />
                    </IconContainer>
                    <FileInput type="file" onChange={handleFileUpload} />
                </IconUpload>
            </Box>
            <Box display="flex" alignItems="center">
                <Typography variant="h6">{i18n.t("Customize landing page text")}</Typography>
                {!isCustomTextDefault && (
                    <>
                        <IconButton onClick={handleClickMenu}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleCloseMenu}>
                            {menuAction.map(action => (
                                <StyledMenuItem key={action.key} onClick={action.onClick}>
                                    {action.icon}
                                    {action.text}
                                </StyledMenuItem>
                            ))}
                        </Menu>
                    </>
                )}
            </Box>

            {customTextKeys.map(key => (
                <Box marginBottom={3} key={key}>
                    <TextField
                        fullWidth={true}
                        label={customTextLabel[key]}
                        placeholder={i18n.t(defaultCustomText[key]?.referenceValue)}
                        value={customTextVal[key] ? customTextVal[key]?.referenceValue : ""}
                        InputLabelProps={inputProps}
                        onChange={onChangeField(key)}
                    />
                </Box>
            ))}
        </ConfirmationDialog>
    );
};

const inputProps = {
    shrink: true,
};

const IconContainer = styled.div`
    flex-shrink: 0;
    background-color: #276696;
    width: 100%;
    border-radius: 8px;
    text-align: center;

    img {
        padding: 10px;
        max-height: 100px;
    }
`;

const IconUpload = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const FileInput = styled.input`
    outline: none;
`;

const StyledMenuItem = styled(MenuItem)`
    gap: 20px;
`;

const customTextLabel: CustomTextInfo = {
    rootTitle: i18n.t("Welcome message"),
    rootSubtitle: i18n.t("Module selection"),
};
