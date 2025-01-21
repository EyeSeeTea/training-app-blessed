import { ConfirmationDialog, useLoading } from "@eyeseetea/d2-ui-components";
import { Icon, IconButton, TextField } from "@material-ui/core";
import React, { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { getKeys } from "../../../types/utils";
import { CustomText, CustomTextInfo, defaultCustomText } from "../../../domain/entities/CustomText";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import _ from "lodash";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import { useAppConfigContext } from "../../contexts/AppConfigProvider";
import { ImportTranslationDialog, ImportTranslationRef } from "../import-translation-dialog/ImportTranslationDialog";
import { useImportExportTranslation } from "../../hooks/useImportExportTranslation";

export interface CustomizeSettingsSaveForm {
    customText: Partial<CustomText>;
    logo: string;
}

export interface CustomSettingsDialogProps extends CustomizeSettingsSaveForm {
    onSave: (data: Partial<CustomizeSettingsSaveForm>) => void;
    onClose: () => void;
}

export const CustomizeSettingsDialog: React.FC<CustomSettingsDialogProps> = props => {
    const { onSave, customText, logo, onClose } = props;

    const { usecases } = useAppContext();
    const { exportTranslation, importTranslation } = useImportExportTranslation();
    const loading = useLoading();

    const { appCustomText } = useAppConfigContext();
    const [logoVal, setLogo] = useState<string>(logo);
    const [customTextVal, setCustomText] = useState<Partial<CustomText>>(customText);
    const translationImportRef = useRef<ImportTranslationRef>(null);
    const customTextKeys = useMemo(() => getKeys(appCustomText), [appCustomText]);

    const logoHasChanges = useMemo(() => logoVal !== logo, [logoVal, logo]);

    const isCustomTextDefault = useMemo(() => _.every(customText, _.isUndefined), [customText]);
    const customTextHasChanges = useMemo(
        () => !_.every(customTextVal, _.isUndefined) || _.isEqual(customTextVal, appCustomText),
        [customTextVal, appCustomText]
    );

    const disableSave = useMemo(() => {
        return !logoHasChanges && !customTextHasChanges;
    }, [logoHasChanges, customTextHasChanges]);

    const save = useCallback(() => {
        onSave({
            customText: customTextHasChanges ? { ...customText, ...customTextVal } : undefined,
            logo: logoHasChanges ? logoVal : undefined,
        });
    }, [onSave, customText, customTextVal, customTextHasChanges, logoVal, logoHasChanges]);

    const onChangeField = useCallback((field: keyof CustomText) => {
        return (event: React.ChangeEvent<{ value: unknown }>) => {
            const referenceValue = event.target.value as string;
            setCustomText(prev => {
                return { ...prev, [field]: { key: field, referenceValue, translations: {} } };
            });
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

    const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchor);
    const handleClickMenu = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchor(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const menuAction = useMemo(
        () => [
            {
                key: "export",
                icon: <Icon>cloud_download</Icon>,
                text: i18n.t("Export JSON translations"),
                onClick: async () => {
                    loading.show(true, i18n.t("Exporting translations"));
                    await exportTranslation(() => usecases.config.extractTranslations(), "custom-text");
                    loading.reset();
                    handleCloseMenu()
                },
            },
            {
                key: "import",
                icon: <Icon>translate</Icon>,
                text: i18n.t("Import JSON translations"),
                onClick: () => {
                    translationImportRef.current?.startImport();
                    handleCloseMenu()
                },
            },
        ],
        [exportTranslation, loading, usecases]
    );

    const handleTranslationUpload = useCallback(
        async (_key: string | undefined, lang: string, terms: Record<string, string>) => {
            await importTranslation(() => usecases.config.importTranslations(lang, terms));
        },
        [usecases, importTranslation]
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
            <h3>{i18n.t("Home page logo")}</h3>
            <Row>
                <IconUpload>
                    <IconContainer>
                        <img src={logoVal} alt={`Home page logo`} />
                    </IconContainer>
                    <FileInput type="file" onChange={handleFileUpload} />
                </IconUpload>
            </Row>
            <HeaderMenu>
                <h3>{i18n.t("Customize application text")}</h3>{" "}
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
            </HeaderMenu>

            {customTextKeys.map(key => (
                <Row key={key}>
                    <TextField
                        fullWidth={true}
                        label={customTextLabel[key]}
                        placeholder={i18n.t(defaultCustomText[key].referenceValue)}
                        value={customTextVal[key] ? customTextVal[key]?.referenceValue : ""}
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

const HeaderMenu = styled(Row)`
    display: flex;
`;

const StyledMenuItem = styled(MenuItem)`
    gap: 20px;
`;

const customTextLabel: CustomTextInfo = {
    root_title: i18n.t("Welcome message"),
    root_subtitle: i18n.t("Module selection"),
};
