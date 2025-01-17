import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { TextField } from "@material-ui/core";
import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { getKeys } from "../../../types/utils";
import { CustomText, CustomTextInfo, defaultCustomText } from "../../../domain/entities/CustomText";
import _ from "lodash";

export interface CustomizeSettingsSaveForm {
    customText: Partial<CustomText>;
    logo: string;
}

export interface CustomSettingsDialogProps extends CustomizeSettingsSaveForm {
    onSave: (data: CustomizeSettingsSaveForm) => void;
    onClose: () => void;
}

export const CustomizeSettingsDialog: React.FC<CustomSettingsDialogProps> = props => {
    const { onSave, customText, logo, onClose } = props;

    const { usecases, appCustomText } = useAppContext();
    const [logoVal, setLogo] = useState<string>(logo);
    const [customTextVal, setCustomText] = useState<Partial<CustomText>>(customText);
    const customTextKeys = useMemo(() => getKeys(appCustomText), [appCustomText]);

    const disableSave = useMemo(() => {
        const customTextNoChange = _.every(customTextVal, _.isUndefined) || _.isEqual(customTextVal, appCustomText);
        return logoVal === logo && customTextNoChange;
    }, [logoVal, customTextVal, appCustomText, logo]);

    const save = useCallback(() => {
        onSave({
            customText: { ...customText, ...customTextVal },
            logo: logoVal,
        });
    }, [onSave, customText, customTextVal, logoVal]);

    const onChangeField = useCallback((field: keyof CustomText) => {
        return (event: React.ChangeEvent<{ value: unknown }>) => {
            const txtVal = event.target.value as string;
            setCustomText(prev => ({ ...prev, [field]: txtVal }));
        };
    }, []);

    const handleFileUpload = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files ? event.target.files[0] : undefined;
            file?.arrayBuffer().then(async data => {
                const img = await usecases.instance.uploadFile(data, file.name);
                setLogo(img);
            });
        },
        [usecases]
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
            <Row>
                <h3>{i18n.t("Home page logo")}</h3>
                <IconUpload>
                    <IconContainer>
                        <img src={logoVal} alt={`Home page logo`} />
                    </IconContainer>
                    <FileInput type="file" onChange={handleFileUpload} />
                </IconUpload>
            </Row>
            {customTextKeys.map(key => (
                <Row key={key}>
                    <TextField
                        fullWidth={true}
                        label={customTextInfo[key].label}
                        placeholder={defaultCustomText[key]}
                        value={customTextVal[key] || ""}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        onChange={onChangeField(key)}
                    />
                </Row>
            ))}
        </ConfirmationDialog>
    );
};

const Row = styled.div`
    margin-bottom: 25px;
`;

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

export const customTextInfo: CustomTextInfo = {
    root_title: {
        label: i18n.t("Welcome message"),
        description: i18n.t("Welcome message in the home page."),
    },
    root_subtitle: {
        label: i18n.t("Module selection"),
        description: i18n.t("Subtitle in the home page."),
    },
};
