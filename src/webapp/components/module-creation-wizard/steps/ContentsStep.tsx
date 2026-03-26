import React, { useCallback, useMemo, useState } from "react";
import {
    addPage,
    addStep,
    removePage,
    removeStep,
    updateOrder,
    updatePagePermissions,
    updatePageBindings,
    updateTranslation,
} from "../../../../domain/helpers/TrainingModuleHelpers";
import i18n from "../../../../utils/i18n";
import { InputDialog, InputDialogProps } from "../../input-dialog/InputDialog";
import { buildListSteps, ModuleListTable, ModuleListTableAction } from "../../module-list-table/ModuleListTable";
import { ModuleCreationWizardStepProps } from "./index";

export const ContentsStep: React.FC<ModuleCreationWizardStepProps> = ({ module, onChange }) => {
    const [dialogProps, updateDialog] = useState<InputDialogProps | null>(null);

    const openAddStep = useCallback(() => {
        updateDialog({
            title: i18n.t("Add new step"),
            inputLabel: i18n.t("Title *"),
            onCancel: () => {
                updateDialog(null);
            },
            onSave: title => {
                updateDialog(null);
                onChange(module => addStep(module, title));
            },
        });
    }, [onChange]);

    const tableActions: ModuleListTableAction = useMemo(
        () => ({
            editContents: async ({ text, value }) => onChange(module => updateTranslation(module, text.key, value)),
            editPagePermissions: async ({ page }) =>
                onChange(module => {
                    const { id, permissions } = page;
                    return updatePagePermissions(module, { id, permissions });
                }),
            editPage: async ({ text, page }) =>
                onChange(module => {
                    const { id, value, bindings } = page;
                    const updatedModule = bindings ? updatePageBindings(module, { id, bindings }) : module;
                    return updateTranslation(updatedModule, text.key, value);
                }),
            swap: async ({ type, from, to }) => {
                if (type === "module") return;
                onChange(module => updateOrder(module, from, to));
            },
            addPage: async ({ step, page }) => onChange(module => addPage(module, step, page)),
            addStep: async ({ title }) => onChange(module => addStep(module, title)),
            deleteStep: async ({ step }) => onChange(module => removeStep(module, step)),
            deletePage: async ({ step, page }) => onChange(module => removePage(module, step, page)),
        }),
        [onChange]
    );

    return (
        <React.Fragment>
            {dialogProps && <InputDialog isOpen={true} fullWidth={true} maxWidth={"md"} {...dialogProps} />}

            <ModuleListTable
                rows={buildListSteps(module, module.contents.steps)}
                tableActions={tableActions}
                onActionButtonClick={openAddStep}
            />
        </React.Fragment>
    );
};
