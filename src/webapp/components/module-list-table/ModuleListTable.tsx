import { ConfirmationDialog, ObjectsTable, useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useRef } from "react";
import { FileRejection } from "react-dropzone";
import styled from "styled-components";
import { PartialTrainingModule, TrainingModule, TrainingModuleStep } from "../../../domain/entities/TrainingModule";
import { TranslatableText } from "../../../domain/entities/TranslatableText";
import i18n from "../../../utils/i18n";
import { zipMimeType } from "../../../utils/files";
import { FlattenUnion } from "../../../utils/flatten-union";
import { useAppContext } from "../../contexts/app-context";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import { ImportTranslationDialog, ImportTranslationRef } from "../import-translation-dialog/ImportTranslationDialog";
import { InputDialog } from "../input-dialog/InputDialog";
import { useImportExportTranslation } from "../../hooks/useImportExportTranslation";
import { PageBinding } from "../../../domain/entities/PageBinding";
import { SharedProperties } from "../../../domain/entities/Ref";
import { PermissionsDialog } from "../permissions-dialog/PermissionsDialog";
import { useModuleList } from "./useModuleList";
import { PageEditorDialog } from "../page-editor/PageEditorDialog";

export interface ModuleListTableProps {
    rows: ListItem[];
    refreshRows?: () => Promise<void>;
    onActionButtonClick?: (event: React.MouseEvent<unknown>) => void;
    isLoading?: boolean;
    tableActions?: ModuleListTableAction;
}

export const ModuleListTable: React.FC<ModuleListTableProps> = props => {
    const { rows, onActionButtonClick, refreshRows = async () => {}, isLoading, tableActions } = props;
    const { usecases } = useAppContext();
    const { importTranslation } = useImportExportTranslation();

    const loading = useLoading();
    const snackbar = useSnackbar();

    const moduleImportRef = useRef<DropzoneRef>(null);
    const translationImportRef = useRef<ImportTranslationRef>(null);

    const openImportDialog = useCallback(async () => {
        moduleImportRef.current?.openDialog();
    }, [moduleImportRef]);

    const {
        globalActions,
        actions,
        columns,
        onTableChange,
        selection,
        inputDialogProps,
        confirmDialogProps: dialogProps,
        pageEditorDialog,
        pagePermissionsDialog,
    } = useModuleList({
        refreshRows,
        rows,
        openImportDialog,
        translationImportRef,
        tableActions,
    });

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
            await importTranslation(() => usecases.modules.importTranslations(lang, terms, key));
            await refreshRows();
        },
        [usecases, importTranslation, refreshRows]
    );

    return (
        <PageWrapper>
            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}
            {inputDialogProps && <InputDialog isOpen={true} fullWidth={true} maxWidth={"md"} {...inputDialogProps} />}
            {pageEditorDialog && <PageEditorDialog {...pageEditorDialog} />}
            {pagePermissionsDialog && <PermissionsDialog {...pagePermissionsDialog} />}

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
    bindings: PageBinding[];
    permissions: SharedProperties;
}

export function isListItemPage(row: ListItem): row is ListItemPage {
    return row.rowType === "page";
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
        pages: pages.map(({ id: pageId, bindings, permissions, editable, ...value }, pageIdx) => ({
            id: pageId,
            stepId,
            moduleId: model.id,
            name: `Page ${pageIdx + 1}`,
            rowType: "page",
            position: pageIdx,
            lastPosition: pages.length - 1,
            editable: editable,
            bindings,
            permissions,
            value,
        })),
    }));
};

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
    editPage?: (params: {
        id: string;
        text: TranslatableText;
        page: { id: string; value: string; bindings?: PageBinding[] };
    }) => Promise<void>;
    editPagePermissions: (params: { id: string; page: { id: string; permissions: SharedProperties } }) => Promise<void>;
    addStep?: (params: { id: string; title: string }) => Promise<void>;
    addPage?: (params: { id: string; step: string; page: { value: string; bindings: PageBinding[] } }) => Promise<void>;
    deleteStep?: (params: { id: string; step: string }) => Promise<void>;
    deletePage?: (params: { id: string; step: string; page: string }) => Promise<void>;
    deleteModules?: (params: { ids: string[] }) => Promise<void>;
    resetModules?: (params: { ids: string[] }) => Promise<void>;
    swap?: (params: { type: "module" | "step" | "page"; id: string; from: string; to: string }) => Promise<void>;
    uploadFile?: (params: { data: ArrayBuffer; name: string }) => Promise<string>;
    installApp?: (params: { id: string }) => Promise<boolean>;
};
