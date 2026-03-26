import { useSnackbar } from "@eyeseetea/d2-ui-components";

import { useAppContext } from "../../contexts/app-context";
import {
    addPage,
    addStep,
    removePage,
    removeStep,
    updateOrder,
    updatePageBindings,
    updatePagePermissions,
    updateTranslation,
} from "../../../domain/helpers/TrainingModuleHelpers";
import i18n from "../../../utils/i18n";
import { ModuleListTableAction } from "./ModuleListTable";
import { PartialTrainingModule } from "../../../domain/entities/TrainingModule";

export function useModuleTableAction(): ModuleListTableAction {
    const { usecases, setAppState } = useAppContext();
    const snackbar = useSnackbar();

    const withModule = async (
        id: string,
        action: (module: PartialTrainingModule) => PartialTrainingModule,
        message: string
    ) => {
        const module = await usecases.modules.get(id, { autoInstallDefaultModules: true });
        if (module) return usecases.modules.update(action(module));
        else snackbar.error(message);
    };

    return {
        openEditModulePage: ({ id }) => {
            setAppState({ type: "EDIT_MODULE", module: id });
        },
        openCloneModulePage: ({ id }) => {
            setAppState({ type: "CLONE_MODULE", module: id });
        },
        editContents: async ({ id, text, value }) => {
            await withModule(
                id,
                module => updateTranslation(module, text.key, value),
                i18n.t("Unable to update module contents")
            );
        },
        editPage: async ({ id, text, page: { id: pageId, value, bindings } }) => {
            await withModule(
                id,
                module => {
                    const updatedModule = bindings ? updatePageBindings(module, { id: pageId, bindings }) : module;
                    return updateTranslation(updatedModule, text.key, value);
                },
                i18n.t("Unable to update page")
            );
        },
        editPagePermissions: async ({ id, page: { id: pageId, permissions } }) => {
            await withModule(
                id,
                module => updatePagePermissions(module, { id: pageId, permissions }),
                i18n.t("Unable to update page permissions")
            );
        },
        deleteModules: ({ ids }) => usecases.modules.delete(ids),
        resetModules: ({ ids }) => usecases.modules.resetDefaultValue(ids),
        swap: async ({ type, id, from, to }) => {
            if (type === "module") {
                await usecases.modules.swapOrder(from, to);
                return;
            }

            await withModule(id, module => updateOrder(module, from, to), i18n.t("Unable to move item"));
        },
        uploadFile: ({ data, name }) => usecases.document.uploadFile(data, name),
        installApp: ({ id }) => usecases.instance.installApp(id),
        addStep: async ({ id, title }) => {
            await withModule(id, module => addStep(module, title), i18n.t("Unable to add step"));
        },
        addPage: async ({ id, step, page }) => {
            await withModule(id, module => addPage(module, step, page), i18n.t("Unable to add page"));
        },
        deleteStep: async ({ id, step }) => {
            await withModule(id, module => removeStep(module, step), i18n.t("Unable to remove step"));
        },
        deletePage: async ({ id, step, page }) => {
            await withModule(id, module => removePage(module, step, page), i18n.t("Unable to remove page"));
        },
    };
}
