import { Box, TextField } from "@material-ui/core";
import React from "react";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";

import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import i18n from "../../../utils/i18n";
import { CustomTextInfo } from "../../../domain/entities/CustomText";
import { ImportTranslationDialog } from "../import-translation-dialog/ImportTranslationDialog";
import { useCustomizeSettingsDialog } from "./useCustomizeSettingsDialog";
import { TitleMenu } from "./TitleMenu";

export type CustomSettingsDialogProps = {
    onClose: () => void;
};

export const CustomizeSettingsDialog: React.FC<CustomSettingsDialogProps> = props => {
    const { onClose } = props;
    const {
        logoVal,
        customTextVal,
        customTextKeys,
        disableSave,
        save,
        onChangeField,
        handleFileUpload,
        translationImportRef,
        handleTranslationUpload,
        exportTranslations,
        importTranslations,
        defaultCustomText,
    } = useCustomizeSettingsDialog(props);

    return (
        <ConfirmationDialog
            title={<TitleMenu exportTranslations={exportTranslations} importTranslations={importTranslations} />}
            isOpen={true}
            fullWidth={true}
            onSave={save}
            cancelText={i18n.t("Close")}
            onCancel={onClose}
            disableSave={disableSave}
        >
            <ImportTranslationDialog type="custom-text" ref={translationImportRef} onSave={handleTranslationUpload} />
            <Typography variant="h6">{i18n.t("Logo")}</Typography>
            <Box marginBottom={3}>
                <IconUpload>
                    <IconContainer>
                        <img src={logoVal} alt={i18n.t("Logo")} />
                    </IconContainer>
                    <FileInput type="file" onChange={handleFileUpload} />
                </IconUpload>
            </Box>

            {customTextKeys.map(key => (
                <Box marginBottom={3} key={key}>
                    <TextField
                        fullWidth={true}
                        label={customTextLabel[key]}
                        placeholder={defaultCustomText[key]?.referenceValue}
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
    border-radius: 0.5rem;
    text-align: center;

    img {
        padding: 0.75rem;
        max-height: 100px;
    }
`;

const IconUpload = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1em;
`;

const FileInput = styled.input`
    outline: none;
`;

const customTextLabel: CustomTextInfo = {
    rootTitle: i18n.t("Welcome message"),
    rootSubtitle: i18n.t("Module selection"),
};
