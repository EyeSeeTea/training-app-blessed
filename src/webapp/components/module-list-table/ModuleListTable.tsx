import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    ObjectsTable,
    TableAction,
    TableColumn,
    TableGlobalAction,
    TableSelection,
    TableState,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import { Icon } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import _ from "lodash";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FileRejection } from "react-dropzone";
import styled from "styled-components";
import { PartialTrainingModule, TrainingModule, TrainingModuleStep } from "../../../domain/entities/TrainingModule";
import { TranslatableText } from "../../../domain/entities/TranslatableText";
import i18n from "../../../locales";
import { zipMimeType } from "../../../utils/files";
import { FlattenUnion } from "../../../utils/flatten-union";
import { useAppContext } from "../../contexts/app-context";
import { AlertIcon } from "../alert-icon/AlertIcon";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import { ImportTranslationDialog, ImportTranslationRef } from "../import-translation-dialog/ImportTranslationDialog";
import { InputDialog, InputDialogProps } from "../input-dialog/InputDialog";
import { MarkdownEditorDialog, MarkdownEditorDialogProps } from "../markdown-editor/MarkdownEditorDialog";
import { MarkdownViewer } from "../markdown-viewer/MarkdownViewer";
import { ModalBody } from "../modal";

export interface ModuleListTableProps {
    rows: ListItem[];
    refreshRows?: () => Promise<void>;
    tableActions: ModuleListTableAction;
    onActionButtonClick?: (event: React.MouseEvent<unknown>) => void;
    isLoading?: boolean;
}

export const ModuleListTable: React.FC<ModuleListTableProps> = props => {
    const { rows, tableActions, onActionButtonClick, refreshRows = async () => {}, isLoading } = props;
    const { usecases } = useAppContext();

    const loading = useLoading();
    const snackbar = useSnackbar();

    const moduleImportRef = useRef<DropzoneRef>(null);
    const translationImportRef = useRef<ImportTranslationRef>(null);

    const [selection, setSelection] = useState<TableSelection[]>([]);

    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);
    const [markdownDialogProps, updateMarkdownDialog] = useState<MarkdownEditorDialogProps | null>(null);
    const [inputDialogProps, updateInputDialog] = useState<InputDialogProps | null>(null);

    const handleFileUpload = useCallback(
        async (files: File[], rejections: FileRejection[]) => {
            if (files.length === 0 && rejections.length > 0) {
                snackbar.error(i18n.t("Couldn't read the file because it's not valid"));
            } else {
                loading.show(true, i18n.t("Importing module(s)"));
                try {
                    const modules = await usecases.modules.import(files);
                    snackbar.success(i18n.t("Imported {{n}} modules", { n: modules.length }));
                    await refreshRows();
                } catch (err: any) {
                    snackbar.error((err && err.message) || err.toString());
                } finally {
                    loading.reset();
                }
            }
        },
        [snackbar, refreshRows, usecases, loading]
    );

    const handleTranslationUpload = useCallback(
        async (key: string | undefined, lang: string, terms: Record<string, string>) => {
            if (!key) return;
            const total = await usecases.modules.importTranslations(key, lang, terms);
            if (total > 0) {
                snackbar.success(i18n.t("Imported {{total}} translation terms", { total }));
            } else {
                snackbar.warning(i18n.t("Unable to import translation terms"));
            }
        },
        [usecases, snackbar]
    );

    const deleteModules = useCallback(
        async (ids: string[]) => {
            updateDialog({
                title: i18n.t("Are you sure you want to delete the selected modules?"),
                description: i18n.t("This action cannot be reversed"),
                onCancel: () => {
                    updateDialog(null);
                },
                onSave: async () => {
                    updateDialog(null);
                    if (!tableActions.deleteModules) return;

                    loading.show(true, i18n.t("Deleting modules"));
                    await tableActions.deleteModules({ ids });
                    loading.reset();

                    snackbar.success("Successfully deleted modules");
                    setSelection([]);
                    await refreshRows();
                },
                cancelText: i18n.t("Cancel"),
                saveText: i18n.t("Delete modules"),
            });
        },
        [tableActions, loading, refreshRows, snackbar]
    );

    const deleteStep = useCallback(
        async (ids: string[]) => {
            const row = buildChildrenRows(rows).find(({ id }) => id === ids[0]);
            if (!row || !row.moduleId) return;

            updateDialog({
                title: i18n.t("Are you sure you want to delete the selected step and its pages?"),
                description: i18n.t("This action cannot be reversed"),
                onCancel: () => {
                    updateDialog(null);
                },
                onSave: async () => {
                    updateDialog(null);
                    if (!tableActions.deleteStep || !row.moduleId) return;
                    await tableActions.deleteStep({ id: row.moduleId, step: row.id });
                    await refreshRows();
                },
                cancelText: i18n.t("Cancel"),
                saveText: i18n.t("Delete step"),
            });
        },
        [tableActions, refreshRows, rows]
    );

    const deletePage = useCallback(
        async (ids: string[]) => {
            const row = buildChildrenRows(rows).find(({ id }) => id === ids[0]);
            if (!row || !row.moduleId) return;

            updateDialog({
                title: i18n.t("Are you sure you want to delete the selected page?"),
                description: i18n.t("This action cannot be reversed"),
                onCancel: () => {
                    updateDialog(null);
                },
                onSave: async () => {
                    updateDialog(null);
                    if (!tableActions.deletePage || !row.moduleId || !row.stepId) return;
                    await tableActions.deletePage({ id: row.moduleId, step: row.stepId, page: row.id });
                    await refreshRows();
                },
                cancelText: i18n.t("Cancel"),
                saveText: i18n.t("Delete page"),
            });
        },
        [tableActions, refreshRows, rows]
    );

    const addModule = useCallback(() => {
        if (!tableActions.openCreateModulePage) return;
        tableActions.openCreateModulePage();
    }, [tableActions]);

    const addStep = useCallback(
        async (ids: string[]) => {
            const row = buildChildrenRows(rows).find(({ id }) => id === ids[0]);
            if (!row || !tableActions.addStep) return;

            updateInputDialog({
                title: i18n.t("Add new step"),
                inputLabel: i18n.t("Title *"),
                onCancel: () => updateInputDialog(null),
                onSave: async title => {
                    updateInputDialog(null);
                    if (!tableActions.addStep) return;

                    await tableActions.addStep({ id: row.id, title });
                    await refreshRows();
                },
            });
        },
        [tableActions, rows, refreshRows]
    );

    const addPage = useCallback(
        async (ids: string[]) => {
            const row = buildChildrenRows(rows).find(({ id }) => id === ids[0]);
            if (!row) return;

            const { uploadFile } = tableActions;

            updateMarkdownDialog({
                title: i18n.t("Add new page"),
                markdownPreview: markdown => <StepPreview value={markdown} />,
                onUpload: uploadFile
                    ? (data: ArrayBuffer, file: File) => uploadFile({ data, name: file.name })
                    : undefined,
                onCancel: () => updateMarkdownDialog(null),
                onSave: async value => {
                    updateMarkdownDialog(null);
                    if (!row.moduleId || !tableActions.addPage) return;

                    await tableActions.addPage({ id: row.moduleId, step: row.id, value });
                    await refreshRows();
                },
            });
        },
        [tableActions, rows, refreshRows]
    );

    const editModule = useCallback(
        (ids: string[]) => {
            if (!tableActions.openEditModulePage || !ids[0]) return;
            tableActions.openEditModulePage({ id: ids[0] });
        },
        [tableActions]
    );

    const cloneModule = useCallback(
        (ids: string[]) => {
            if (!tableActions.openCloneModulePage || !ids[0]) return;
            tableActions.openCloneModulePage({ id: ids[0] });
        },
        [tableActions]
    );

    const moveUp = useCallback(
        async (ids: string[]) => {
            const allRows = buildChildrenRows(rows);
            const rowIndex = _.findIndex(allRows, ({ id }) => id === ids[0]);
            const row = allRows[rowIndex];
            if (!tableActions.swap || rowIndex === -1 || rowIndex === 0 || !row) return;

            const { id: prevRowId } = allRows[rowIndex - 1] ?? {};
            const moduleId = row.rowType === "module" ? row.id : row.moduleId;
            if (prevRowId && ids[0] && moduleId) {
                await tableActions.swap({ id: moduleId, type: row.rowType, from: ids[0], to: prevRowId });
            }

            await refreshRows();
        },
        [tableActions, rows, refreshRows]
    );

    const moveDown = useCallback(
        async (ids: string[]) => {
            const allRows = buildChildrenRows(rows);
            const rowIndex = _.findIndex(allRows, ({ id }) => id === ids[0]);
            const row = allRows[rowIndex];
            if (!tableActions.swap || rowIndex === -1 || rowIndex === allRows.length - 1 || !row) return;

            const { id: nextRowId } = allRows[rowIndex + 1] ?? {};
            const moduleId = row.rowType === "module" ? row.id : row.moduleId;
            if (nextRowId && ids[0] && moduleId) {
                await tableActions.swap({ id: moduleId, type: row.rowType, from: ids[0], to: nextRowId });
            }

            await refreshRows();
        },
        [tableActions, rows, refreshRows]
    );

    const editStep = useCallback(
        (ids: string[]) => {
            const row = buildChildrenRows(rows).find(({ id }) => id === ids[0]);
            if (!row || !row.title) return;

            updateInputDialog({
                title: i18n.t("Edit step"),
                inputLabel: i18n.t("Title *"),
                initialValue: row.title.referenceValue,
                onCancel: () => updateInputDialog(null),
                onSave: async value => {
                    updateInputDialog(null);
                    if (!tableActions.editContents || !row.title || !row.moduleId) return;

                    await tableActions.editContents({ id: row.moduleId, text: row.title, value });
                    await refreshRows();
                },
            });
        },
        [tableActions, rows, refreshRows]
    );

    const editPage = useCallback(
        (ids: string[]) => {
            const row = buildChildrenRows(rows).find(({ id }) => id === ids[0]);
            if (!row || !row.value) return;

            const { uploadFile } = tableActions;

            updateMarkdownDialog({
                title: i18n.t("Edit contents of {{name}}", row),
                initialValue: row.value.referenceValue,
                markdownPreview: markdown => <StepPreview value={markdown} />,
                onUpload: uploadFile
                    ? (data: ArrayBuffer, file: File) => uploadFile({ data, name: file.name })
                    : undefined,
                onCancel: () => updateMarkdownDialog(null),
                onSave: async value => {
                    updateMarkdownDialog(null);
                    if (!tableActions.editContents || !row.value || !row.moduleId) return;

                    await tableActions.editContents({ id: row.moduleId, text: row.value, value });
                    await refreshRows();
                },
            });
        },
        [tableActions, rows, refreshRows]
    );

    const installApp = useCallback(
        async (ids: string[]) => {
            if (!tableActions.installApp || !ids[0]) return;

            loading.show(true, i18n.t("Installing application"));
            const installed = await tableActions.installApp({ id: ids[0] });
            loading.reset();

            if (!installed) {
                snackbar.error("Error installing app");
                return;
            }

            snackbar.success("Successfully installed app");
            await refreshRows();
        },
        [tableActions, snackbar, loading, refreshRows]
    );

    const resetModules = useCallback(
        (ids: string[]) => {
            updateDialog({
                title: i18n.t("Are you sure you want to reset selected modules to its default value?"),
                description: i18n.t("This action cannot be reversed."),
                onCancel: () => updateDialog(null),
                onSave: async () => {
                    updateDialog(null);
                    if (!tableActions.resetModules) return;

                    loading.show(true, i18n.t("Resetting modules to default value"));
                    await tableActions.resetModules({ ids });
                    loading.reset();

                    snackbar.success(i18n.t("Successfully resetted modules to default value"));
                    await refreshRows();
                },
                cancelText: i18n.t("Cancel"),
                saveText: i18n.t("Reset app to factory settings"),
            });
        },
        [tableActions, loading, refreshRows, snackbar]
    );

    const exportModule = useCallback(
        async (ids: string[]) => {
            if (!ids[0]) return;
            loading.show(true, i18n.t("Exporting module(s)"));
            await usecases.modules.export(ids);
            loading.reset();
        },
        [loading, usecases]
    );

    const exportTranslations = useCallback(
        async (ids: string[]) => {
            if (!ids[0]) return;
            loading.show(true, i18n.t("Exporting translations"));
            await usecases.modules.exportTranslations(ids[0]);
            loading.reset();
        },
        [loading, usecases]
    );

    const onTableChange = useCallback(({ selection }: TableState<ListItem>) => {
        setSelection(selection);
    }, []);

    const openImportDialog = useCallback(async () => {
        moduleImportRef.current?.openDialog();
    }, [moduleImportRef]);

    const columns: TableColumn<ListItem>[] = useMemo(
        () => [
            {
                name: "name",
                text: "Name",
                sortable: false,
                getValue: item => (
                    <div>
                        {item.name}
                        {!item.installed && item.rowType === "module" ? (
                            <AlertIcon tooltip={i18n.t("App is not installed in this instance")} />
                        ) : null}
                        {!item.compatible && item.rowType === "module" ? (
                            <AlertIcon tooltip={i18n.t("Module does not support this DHIS2 version")} />
                        ) : null}
                        {item.outdated && item.rowType === "module" ? (
                            <AlertIcon
                                tooltip={i18n.t(
                                    "There's a new version of this module, please reset to default values to update"
                                )}
                            />
                        ) : null}
                    </div>
                ),
            },
            {
                name: "id",
                text: "Code",
                hidden: true,
                sortable: false,
            },
            {
                name: "value",
                text: "Preview",
                sortable: false,
                getValue: item => {
                    return item.value && <StepPreview value={item.value.referenceValue} />;
                },
            },
        ],
        []
    );

    const actions: TableAction<ListItem>[] = useMemo(
        () => [
            {
                name: "new-module",
                text: i18n.t("Add module"),
                icon: <Icon>add</Icon>,
                onClick: addModule,
                isActive: rows => {
                    return !!tableActions.openCreateModulePage && _.every(rows, item => item.rowType === "module");
                },
            },
            {
                name: "new-step",
                text: i18n.t("Add step"),
                icon: <Icon>add</Icon>,
                onClick: addStep,
                isActive: rows => {
                    return !!tableActions.addStep && _.every(rows, item => item.rowType === "module" && item.editable);
                },
            },
            {
                name: "new-page",
                text: i18n.t("Add page"),
                icon: <Icon>add</Icon>,
                onClick: addPage,
                isActive: rows => {
                    return !!tableActions.addPage && _.every(rows, item => item.rowType === "step" && item.editable);
                },
            },
            {
                name: "edit-module",
                text: i18n.t("Edit module"),
                icon: <Icon>edit</Icon>,
                onClick: editModule,
                isActive: rows => {
                    return (
                        !!tableActions.openEditModulePage &&
                        _.every(rows, item => item.rowType === "module" && item.editable)
                    );
                },
            },
            {
                name: "clone-module",
                text: i18n.t("Clone module"),
                icon: <Icon>content_copy</Icon>,
                onClick: cloneModule,
                isActive: rows => {
                    return (
                        !!tableActions.openCloneModulePage &&
                        _.every(rows, item => item.rowType === "module" && item.editable)
                    );
                },
            },
            {
                name: "edit-page",
                text: i18n.t("Edit page"),
                icon: <Icon>edit</Icon>,
                onClick: editPage,
                isActive: rows => {
                    return (
                        !!tableActions.editContents && _.every(rows, item => item.rowType === "page" && item.editable)
                    );
                },
            },
            {
                name: "edit-step",
                text: i18n.t("Edit step"),
                icon: <Icon>edit</Icon>,
                onClick: editStep,
                isActive: rows => {
                    return (
                        !!tableActions.editContents && _.every(rows, item => item.rowType === "step" && item.editable)
                    );
                },
            },
            {
                name: "delete-module",
                text: i18n.t("Delete module"),
                icon: <Icon>delete</Icon>,
                multiple: true,
                onClick: deleteModules,
                isActive: rows => {
                    return (
                        !!tableActions.deleteModules &&
                        _.every(rows, item => item.rowType === "module" && item.type !== "core" && item.editable)
                    );
                },
            },

            {
                name: "delete-step",
                text: i18n.t("Delete step"),
                icon: <Icon>delete</Icon>,
                multiple: true,
                onClick: deleteStep,
                isActive: rows => {
                    return !!tableActions.deleteStep && _.every(rows, item => item.rowType === "step" && item.editable);
                },
            },
            {
                name: "delete-page",
                text: i18n.t("Delete page"),
                icon: <Icon>delete</Icon>,
                multiple: true,
                onClick: deletePage,
                isActive: rows => {
                    return !!tableActions.deletePage && _.every(rows, item => item.rowType === "page" && item.editable);
                },
            },
            {
                name: "move-up",
                text: i18n.t("Move up"),
                icon: <Icon>arrow_upwards</Icon>,
                onClick: moveUp,
                isActive: rows => {
                    return !!tableActions.swap && _.every(rows, ({ position, editable }) => position !== 0 && editable);
                },
            },
            {
                name: "move-down",
                text: i18n.t("Move down"),
                icon: <Icon>arrow_downwards</Icon>,
                onClick: moveDown,
                isActive: rows => {
                    return (
                        !!tableActions.swap &&
                        _.every(rows, ({ position, lastPosition, editable }) => position !== lastPosition && editable)
                    );
                },
            },
            {
                name: "install-app",
                text: i18n.t("Install app"),
                icon: <GetAppIcon />,
                onClick: installApp,
                isActive: rows => {
                    return (
                        !!tableActions.installApp && _.every(rows, item => item.rowType === "module" && !item.installed)
                    );
                },
            },
            {
                name: "reset-factory-settings",
                text: i18n.t("Restore to factory settings"),
                icon: <Icon>rotate_left</Icon>,
                onClick: resetModules,
                multiple: true,
                isActive: rows => {
                    return (
                        !!tableActions.resetModules &&
                        _.every(rows, item => item.rowType === "module" && item.type === "core" && item.editable)
                    );
                },
            },
            {
                name: "export-module",
                text: i18n.t("Export module"),
                icon: <Icon>cloud_download</Icon>,
                onClick: exportModule,
                isActive: rows => {
                    return _.every(rows, item => item.rowType === "module");
                },
                multiple: true,
            },
            {
                name: "export-translations",
                text: i18n.t("Export JSON translations"),
                icon: <Icon>translate</Icon>,
                onClick: exportTranslations,
                isActive: rows => {
                    return _.every(rows, item => item.rowType === "module");
                },
                multiple: false,
            },
        ],
        [
            tableActions,
            editModule,
            cloneModule,
            deleteModules,
            deletePage,
            deleteStep,
            moveUp,
            moveDown,
            editPage,
            editStep,
            installApp,
            addModule,
            addPage,
            addStep,
            resetModules,
            exportModule,
            exportTranslations,
        ]
    );

    const globalActions: TableGlobalAction[] = useMemo(
        () => [
            {
                name: "import-modules",
                text: i18n.t("Import modules"),
                icon: <Icon>arrow_upward</Icon>,
                onClick: openImportDialog,
            },
            {
                name: "import-translations",
                text: i18n.t("Import JSON translations"),
                icon: <Icon>translate</Icon>,
                onClick: () => {
                    translationImportRef.current?.startImport();
                },
            },
        ],
        [openImportDialog, translationImportRef]
    );

    return (
        <PageWrapper>
            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}
            {inputDialogProps && <InputDialog isOpen={true} fullWidth={true} maxWidth={"md"} {...inputDialogProps} />}
            {markdownDialogProps && <MarkdownEditorDialog {...markdownDialogProps} />}

            <ImportTranslationDialog type="module" ref={translationImportRef} onSave={handleTranslationUpload} />

            <Dropzone ref={moduleImportRef} accept={zipMimeType} onDrop={handleFileUpload}>
                <ObjectsTable<ListItem>
                    rows={rows}
                    columns={columns}
                    actions={actions}
                    globalActions={globalActions}
                    selection={selection}
                    onChange={onTableChange}
                    childrenKeys={["steps", "welcome", "pages"]}
                    sorting={{ field: "position", order: "asc" }}
                    onActionButtonClick={onActionButtonClick}
                    loading={isLoading}
                />
            </Dropzone>
        </PageWrapper>
    );
};

export type ListItem = FlattenUnion<ListItemModule | ListItemStep | ListItemPage>;

export interface ListItemModule extends Omit<TrainingModule, "name"> {
    name: string;
    rowType: "module";
    steps: ListItemStep[];
    position: number;
    lastPosition: number;
}

export interface ListItemStep {
    id: string;
    moduleId: string;
    title: TranslatableText;
    name: string;
    rowType: "step";
    pages: ListItemPage[];
    position: number;
    lastPosition: number;
    editable: boolean;
}

export interface ListItemPage {
    id: string;
    moduleId: string;
    stepId: string;
    name: string;
    rowType: "page";
    value: TranslatableText;
    position: number;
    lastPosition: number;
    editable: boolean;
}

export const buildListModules = (modules: TrainingModule[]): ListItemModule[] => {
    return modules.map((model, moduleIdx) => ({
        ...model,
        name: model.name.referenceValue,
        rowType: "module",
        position: moduleIdx,
        lastPosition: modules.length - 1,
        steps: buildListSteps(model, model.contents.steps),
    }));
};

export const buildListSteps = (model: PartialTrainingModule, steps: TrainingModuleStep[]): ListItemStep[] => {
    return steps.map(({ id: stepId, title, pages }, stepIdx) => ({
        id: stepId,
        moduleId: model.id,
        title,
        name: `Step ${stepIdx + 1}: ${title.referenceValue}`,
        rowType: "step",
        position: stepIdx,
        lastPosition: steps.length - 1,
        editable: model.editable ?? true,
        pages: pages.map(({ id: pageId, ...value }, pageIdx) => ({
            id: pageId,
            stepId,
            moduleId: model.id,
            name: `Page ${pageIdx + 1}`,
            rowType: "page",
            position: pageIdx,
            lastPosition: pages.length - 1,
            editable: model.editable ?? true,
            value,
        })),
    }));
};

const buildChildrenRows = (items: ListItem[]): ListItem[] => {
    const steps = _.flatMap(items, item => item.steps);
    const pages = _.flatMap([...items, ...steps], step => step?.pages);
    return _.compact([...items, ...steps, ...pages]);
};

const StepPreview: React.FC<{
    className?: string;
    value?: string;
}> = ({ className, value }) => {
    if (!value) return null;

    return (
        <StyledModalBody className={className}>
            <MarkdownViewer source={value} />
        </StyledModalBody>
    );
};

const StyledModalBody = styled(ModalBody)`
    max-width: 600px;
`;

const PageWrapper = styled.div`
    .MuiTableRow-root {
        background: white;
    }
`;

export type ModuleListTableAction = {
    openEditModulePage?: (params: { id: string }) => void;
    openCloneModulePage?: (params: { id: string }) => void;
    openCreateModulePage?: () => void;
    editContents?: (params: { id: string; text: TranslatableText; value: string }) => Promise<void>;
    addStep?: (params: { id: string; title: string }) => Promise<void>;
    addPage?: (params: { id: string; step: string; value: string }) => Promise<void>;
    deleteStep?: (params: { id: string; step: string }) => Promise<void>;
    deletePage?: (params: { id: string; step: string; page: string }) => Promise<void>;
    deleteModules?: (params: { ids: string[] }) => Promise<void>;
    resetModules?: (params: { ids: string[] }) => Promise<void>;
    swap?: (params: { type: "module" | "step" | "page"; id: string; from: string; to: string }) => Promise<void>;
    uploadFile?: (params: { data: ArrayBuffer; name: string }) => Promise<string>;
    installApp?: (params: { id: string }) => Promise<boolean>;
};
