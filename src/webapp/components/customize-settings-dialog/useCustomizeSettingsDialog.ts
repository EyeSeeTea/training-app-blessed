import _ from "lodash";
import { useState, useCallback, useRef, ChangeEvent } from "react";

import { CustomText, CustomTextFields, getDefaultCustomText } from "../../../domain/entities/CustomText";
import { ImportTranslationRef } from "../import-translation-dialog/ImportTranslationDialog";
import { CustomSettingsDialogProps } from "./CustomizeSettingsDialog";
import { useAppContext } from "../../contexts/app-context";
import { useAppConfigContext } from "../../contexts/AppConfigProvider";
import { useImportExportTranslation } from "../../hooks/useImportExportTranslation";
import { useLoading } from "@eyeseetea/d2-ui-components";
import i18n from "../../../locales";

export const useCustomizeSettingsDialog = ({
    logo,
    customText,
    onSave,
}: Omit<CustomSettingsDialogProps, "onClose">) => {
    const { appConfig } = useAppConfigContext();
    const appCustomText = appConfig.customText;
    const defaultCustomText = getDefaultCustomText({ isDefault: true });
    const { exportTranslation, importTranslation } = useImportExportTranslation();
    const { usecases } = useAppContext();
    const loading = useLoading();

    const [logoVal, setLogo] = useState<string>(logo);
    const [customTextVal, setCustomText] = useState<Partial<CustomText>>(customText);
    const translationImportRef = useRef<ImportTranslationRef>(null);

    const logoHasChanges = logoVal !== logo;
    const isCustomTextDefault = _.isEqual(customText, defaultCustomText);
    const customTextHasChanges = !_.isEqual(customTextVal, appCustomText);
    const disableSave = !logoHasChanges && !customTextHasChanges;

    const save = useCallback(() => {
        onSave({
            customText: customTextHasChanges ? { ...customText, ...customTextVal } : undefined,
            logo: logoHasChanges ? logoVal : undefined,
        });
    }, [onSave, customText, customTextVal, customTextHasChanges, logoVal, logoHasChanges]);

    const onChangeField = (field: keyof CustomText) => {
        return (event: React.ChangeEvent<{ value: string }>) => {
            const referenceValue = event.target.value;
            setCustomText(prev => ({ ...prev, [field]: { key: prev[field]?.key, referenceValue, translations: {} } }));
        };
    };

    const handleFileUpload = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files ? event.target.files[0] : undefined;
            file?.arrayBuffer().then(async data => {
                const img = await usecases.document.uploadFile(data, file.name);
                setLogo(img);
            });
        },
        [usecases]
    );

    const handleTranslationUpload = useCallback(
        async (_key: string | undefined, lang: string, terms: Record<string, string>) => {
            await importTranslation(() => usecases.config.importTranslations(lang, terms));
        },
        [usecases, importTranslation]
    );

    const exportTranslations = useCallback(async () => {
        loading.show(true, i18n.t("Exporting translations"));
        await exportTranslation(() => usecases.config.extractTranslations(), "custom-text");
        loading.reset();
    }, [exportTranslation, usecases, loading]);

    const importTranslations = useCallback(() => {
        translationImportRef.current?.startImport();
    }, [translationImportRef]);

    return {
        logoVal,
        customTextVal,
        defaultCustomText,
        customTextKeys: CustomTextFields,
        isCustomTextDefault,
        disableSave,
        save,
        onChangeField,
        handleFileUpload,
        translationImportRef,
        exportTranslations,
        importTranslations,
        handleTranslationUpload,
    };
};
