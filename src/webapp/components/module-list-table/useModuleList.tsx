import React, { useCallback, useMemo, useState } from "react";
import _ from "lodash";
import { Icon } from "@material-ui/core";
import {
    ConfirmationDialogProps,
    TableAction,
    TableColumn,
    TableGlobalAction,
    TableSelection,
    TableState,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import GetAppIcon from "@material-ui/icons/GetApp";
import styled from "styled-components";

import i18n from "../../../utils/i18n";
import { AlertIcon } from "../alert-icon/AlertIcon";
import { isListItemPage, ListItem, ModuleListTableAction } from "./ModuleListTable";
import { useModuleTableAction } from "./useModuleTableAction";
import { InputDialogProps } from "../input-dialog/InputDialog";
import { MarkdownViewer } from "../markdown-viewer/MarkdownViewer";
import { ModalBody } from "../modal";
import { useImportExportTranslation } from "../../hooks/useImportExportTranslation";
import { useAppContext } from "../../contexts/app-context";
import { ImportTranslationRef } from "../import-translation-dialog/ImportTranslationDialog";
import { usePagePermissions } from "./usePagePermissions";
import { PageEditorProps } from "../page-editor/PageEditorDialog";
import { Maybe } from "../../../types/utils";
import { PageBindingPreview } from "./PageBindingPreview";
import { useShowInteractiveTrainingConfig } from "../../hooks/useShowInteractiveTrainingConfig";

type UseModuleListProps = {
    rows: ListItem[];
    refreshRows: () => Promise<void>;
    openImportDialog: () => Promise<void>;
    translationImportRef: React.RefObject<ImportTranslationRef>;
    tableActions?: ModuleListTableAction;
};

export function useModuleList(props: UseModuleListProps) {
    const { refreshRows, rows, openImportDialog, translationImportRef, tableActions: tableActionsProp } = props;

    const { usecases } = useAppContext();
    const { exportTranslation } = useImportExportTranslation();

    const loading = useLoading();
    const snackbar = useSnackbar();

    const showInteractiveTrainingConfig = useShowInteractiveTrainingConfig();

    const [selection, setSelection] = useState<TableSelection[]>([]);
    const [inputDialogProps, updateInputDialog] = useState<Maybe<InputDialogProps>>();
    const [dialogProps, updateDialog] = useState<Maybe<ConfirmationDialogProps>>();
    const [pageEditorDialog, setPageEditorDialog] = useState<Maybe<PageEditorProps>>();

    const moduleTableActions = useModuleTableAction();

    const tableActions = useMemo(
        () => ({
            ...moduleTableActions,
            ...tableActionsProp,
        }),
        [moduleTableActions, tableActionsProp]
    );

    const { pagePermissionsDialog, openPagePermissions } = usePagePermissions({
        rows: buildChildrenRows(rows),
        onChange: tableActions.editPagePermissions,
        refreshRows,
    });

    const deleteModules = useCallback(
        async (ids: string[]) => {
            updateDialog({
                title: i18n.t("Are you sure you want to delete the selected modules?"),
                description: i18n.t("This action cannot be reversed"),
                onCancel: () => {
                    updateDialog(undefined);
                },
                onSave: async () => {
                    updateDialog(undefined);
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
                    updateDialog(undefined);
                },
                onSave: async () => {
                    updateDialog(undefined);
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
                    updateDialog(undefined);
                },
                onSave: async () => {
                    updateDialog(undefined);
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
                onCancel: () => updateInputDialog(undefined),
                onSave: async title => {
                    updateInputDialog(undefined);
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

            setPageEditorDialog({
                onUpload: uploadFile
                    ? (data: ArrayBuffer, file: File) => uploadFile({ data, name: file.name })
                    : undefined,
                onCancel: () => setPageEditorDialog(undefined),
                onSave: async ({ referenceValue, bindings }) => {
                    setPageEditorDialog(undefined);
                    if (!row.moduleId || !tableActions.addPage) return;

                    await tableActions.addPage({
                        id: row.moduleId,
                        step: row.id,
                        page: { value: referenceValue, bindings },
                    });
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
                onCancel: () => updateInputDialog(undefined),
                onSave: async value => {
                    updateInputDialog(undefined);
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

            setPageEditorDialog({
                page: {
                    id: row.id,
                    name: row.name,
                    referenceValue: row.value.referenceValue,
                    bindings: row.bindings || [],
                },
                onUpload: uploadFile
                    ? (data: ArrayBuffer, file: File) => uploadFile({ data, name: file.name })
                    : undefined,
                onCancel: () => setPageEditorDialog(undefined),
                onSave: async ({ referenceValue, bindings }) => {
                    setPageEditorDialog(undefined);
                    if (!tableActions.editPage || !row.value || !row.moduleId) return;

                    await tableActions.editPage({
                        id: row.moduleId,
                        text: row.value,
                        page: { id: row.id, value: referenceValue, bindings },
                    });
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
                onCancel: () => updateDialog(undefined),
                onSave: async () => {
                    updateDialog(undefined);
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
            await exportTranslation(() => usecases.modules.extractTranslations(ids[0]), ids[0]);
            loading.reset();
        },
        [loading, usecases, exportTranslation]
    );

    const onTableChange = useCallback(({ selection }: TableState<ListItem>) => {
        setSelection(selection);
    }, []);

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
                    return !!tableActions.editPage && _.every(rows, item => item.rowType === "page" && item.editable);
                },
            },
            {
                name: "edit-page-sharing-settings",
                text: i18n.t("Sharing settings"),
                icon: <Icon>share</Icon>,
                onClick: openPagePermissions,
                isActive: rows => {
                    return _.every(rows, item => isListItemPage(item) && item.editable);
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
            openPagePermissions,
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

    const columns = useMemo(() => buildTableColumns(showInteractiveTrainingConfig), [showInteractiveTrainingConfig]);

    return {
        globalActions,
        actions,
        columns,
        onTableChange,
        selection,
        inputDialogProps,
        confirmDialogProps: dialogProps,
        pageEditorDialog,
        pagePermissionsDialog,
    };
}

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

function buildTableColumns(showInteractiveTrainingConfig: boolean): TableColumn<ListItem>[] {
    return [
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
                    {showInteractiveTrainingConfig && item.rowType === "page" && item.bindings?.length ? (
                        <PageBindingPreview bindings={item.bindings} />
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
    ];
}

const StyledModalBody = styled(ModalBody)`
    max-width: 600px;
`;
