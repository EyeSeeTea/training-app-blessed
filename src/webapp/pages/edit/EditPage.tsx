import { ConfirmationDialog, ConfirmationDialogProps } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { defaultTrainingModule, PartialTrainingModule } from "../../../domain/entities/TrainingModule";
import i18n from "../../../utils/i18n";
import { ModuleCreationWizard } from "../../components/module-creation-wizard/ModuleCreationWizard";
import { PageHeader } from "../../components/page-header/PageHeader";
import { useAppContext } from "../../contexts/app-context";
import { DhisPage } from "../dhis/DhisPage";

export interface EditPageProps {
    action: "create" | "edit" | "clone";
}

const getClonedModule = (module: PartialTrainingModule): PartialTrainingModule => {
    const id = `${module.id}-copy`;
    const referenceValue = `Copy of ${module.name.referenceValue}`;

    return {
        ...module,
        id,
        name: { key: id, referenceValue, translations: {} },
    };
};

export const EditPage: React.FC<EditPageProps> = ({ action = "create" }) => {
    const { module, setAppState, usecases, reload } = useAppContext();

    const [stateModule, updateStateModule] = useState<PartialTrainingModule>(module ?? defaultTrainingModule);
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);
    const [dirty, setDirty] = useState<boolean>(false);

    const openSettings = useCallback(() => {
        setAppState({ type: "SETTINGS" });
    }, [setAppState]);

    const saveModule = useCallback(async () => {
        await usecases.modules.update({ ...stateModule, id: _.kebabCase(stateModule.id) });
        await reload();
    }, [stateModule, usecases, reload]);

    const onChange = useCallback((update: Parameters<typeof updateStateModule>[0]) => {
        updateStateModule(update);
        setDirty(true);
    }, []);

    const onCancel = useCallback(() => {
        if (!dirty) {
            openSettings();
            return;
        }

        const dialogTitles = {
            edit: i18n.t("Cancel module editing?"),
            clone: i18n.t("Cancel module cloning?"),
            create: i18n.t("Cancel module creation?"),
        };

        updateDialog({
            title: dialogTitles[action],
            description: i18n.t("All your changes will be lost. Are you sure you want to proceed?"),
            saveText: i18n.t("Yes"),
            cancelText: i18n.t("No"),
            onSave: openSettings,
            onCancel: () => updateDialog(null),
        });
    }, [dirty, openSettings, action]);

    useEffect(() => {
        if (module) updateStateModule(action === "clone" ? getClonedModule(module) : module);
    }, [module, action]);

    const titles = {
        edit: i18n.t("Edit module"),
        clone: i18n.t("Clone module"),
        create: i18n.t("New module"),
    };

    return (
        <DhisPage>
            <Header title={titles[action]} onBackClick={onCancel} />

            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}

            {stateModule ? (
                <Wizard
                    isEdit={action === "edit"}
                    onChange={onChange}
                    onCancel={onCancel}
                    onClose={openSettings}
                    onSave={saveModule}
                    module={stateModule}
                />
            ) : null}
        </DhisPage>
    );
};

const Header = styled(PageHeader)`
    margin-top: 1rem;
`;

const Wizard = styled(ModuleCreationWizard)`
    margin: 1rem;
`;
