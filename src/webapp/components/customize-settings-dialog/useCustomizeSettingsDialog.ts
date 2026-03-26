import _ from "lodash";
import { useState, useCallback, useRef, ChangeEvent, useMemo } from "react";

import { CustomText, CustomTextFields, getDefaultCustomText } from "../../../domain/entities/CustomText";
import { ImportTranslationRef } from "../import-translation-dialog/ImportTranslationDialog";
import { CustomSettingsDialogProps } from "./CustomizeSettingsDialog";
import { useAppContext } from "../../contexts/app-context";
import { useAppConfigContext } from "../../contexts/AppConfigProvider";
import { useImportExportTranslation } from "../../hooks/useImportExportTranslation";
import { useLoading } from "@eyeseetea/d2-ui-components";
import i18n from "../../../utils/i18n";
import { TranslatableText } from "../../../domain/entities/TranslatableText";

export const useCustomizeSettingsDialog = (props: CustomSettingsDialogProps) => {
    const { onClose } = props;
    const { appConfig, logoInfo, reloadConfig, save: saveConfig } = useAppConfigContext();
    const logo = logoInfo.logoPath;

    const { exportTranslation, importTranslation } = useImportExportTranslation();
    const { usecases } = useAppContext();
    const loading = useLoading();

    const [logoVal, setLogo] = useState<string>(logo);
    const [customTextVal, setCustomText] = useState(appConfig.customText);
    const translationImportRef = useRef<ImportTranslationRef>(null);

    const logoHasChanges = logoVal !== logo;
    const customTextHasChanges = !_.isEqual(customTextVal, appConfig.customText);
    const disableSave = !logoHasChanges && !customTextHasChanges;

    const defaultCustomText = useMemo(() => getDefaultCustomText(), []);

    const save = useCallback(async () => {
        await saveConfig({
            ...(customTextHasChanges ? { customText: { ...appConfig.customText, ...customTextVal } } : {}),
            ...(logoHasChanges ? { logo: logoVal } : {}),
        });
        onClose();
    }, [saveConfig, appConfig.customText, customTextVal, customTextHasChanges, logoVal, logoHasChanges, onClose]);

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
            await reloadConfig().then(config => {
                setCustomText(prev => updateStateTranslations(prev, config.customText));
            });
        },
        [usecases, importTranslation, reloadConfig]
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
        customTextKeys: CustomTextFields,
        disableSave,
        save,
        onChangeField,
        handleFileUpload,
        translationImportRef,
        exportTranslations,
        importTranslations,
        handleTranslationUpload,
        defaultCustomText,
    };
};

function updateItemTranslation(prevItem: TranslatableText, currentItem: TranslatableText): TranslatableText {
    return currentItem.translations
        ? {
              ...prevItem,
              translations: currentItem.translations,
          }
        : prevItem;
}

function updateStateTranslations(prev: CustomText, current: CustomText): CustomText {
    return {
        ...prev,
        rootTitle: updateItemTranslation(prev.rootTitle, current.rootTitle),
        rootSubtitle: updateItemTranslation(prev.rootSubtitle, current.rootSubtitle),
    };
}
