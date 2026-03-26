import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    ObjectsTable,
    TableAction,
    TableColumn,
    TableGlobalAction,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import { Icon } from "@material-ui/core";
import _ from "lodash";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FileRejection } from "react-dropzone";
import styled from "styled-components";
import {
    LandingNode,
    LandingNodeType,
    OrderedLandingNode,
    buildOrderedLandingNodes,
} from "../../../domain/entities/LandingPage";
import i18n from "../../../utils/i18n";
import { useAppContext } from "../../contexts/app-context";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import { ImportTranslationDialog, ImportTranslationRef } from "../import-translation-dialog/ImportTranslationDialog";
import { useImportExportTranslation } from "../../hooks/useImportExportTranslation";
import { StepPreview } from "../step-preview/StepPreview";
import { Maybe } from "../../../types/utils";
import { CompositionRoot } from "../../CompositionRoot";
import { LoadingState } from "@eyeseetea/d2-ui-components/loading/types";
import { Translations } from "../../../domain/entities/TranslatableText";
import { PermissionHandlerProps, PermissionsDialog } from "../permissions-dialog/PermissionsDialog";

type LandingNodeAction = (ids: string[]) => void;

type LandingPageListTableProps = {
    nodes: LandingNode[];
    isLoading?: boolean;
    onAddSection: LandingNodeAction;
    onAddSubSection: LandingNodeAction;
    onAddCategory: LandingNodeAction;
    onEditLandingNode: LandingNodeAction;
};

export const LandingPageListTable: React.FC<LandingPageListTableProps> = props => {
    const { nodes, isLoading, onAddSection, onAddSubSection, onAddCategory, onEditLandingNode } = props;

    const { usecases, reload } = useAppContext();
    const { exportTranslation, importTranslation } = useImportExportTranslation();
    const loading = useLoading();
    const snackbar = useSnackbar();

    const landingImportRef = useRef<DropzoneRef>(null);
    const translationImportRef = useRef<ImportTranslationRef>(null);
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);
    const [permissionLandingNodeId, setPermissionLandingNodeId] = useState<string>();

    const closePermissionsDialog = useCallback(() => setPermissionLandingNodeId(undefined), []);

    const openImportDialog = useCallback(async () => {
        landingImportRef.current?.openDialog();
    }, [landingImportRef]);

    const handleFileUpload = useCallback(
        async (files: File[], rejections: FileRejection[]) => {
            if (files.length === 0 && rejections.length > 0) {
                snackbar.error(i18n.t("Couldn't read the file because it's not valid"));
            } else {
                loading.show(true, i18n.t("Importing landing pages(s)"));
                try {
                    updateDialog({
                        title: i18n.t("Importing a new landing page"),
                        description: i18n.t("This action will overwrite the existing landing page. Are you sure?"),
                        onSave: async () => {
                            const landings = await usecases.landings.import(files);
                            snackbar.success(i18n.t("Imported {{n}} landing pages", { n: landings.length }));
                            await reload();
                            updateDialog(null);
                        },
                        onCancel: () => {
                            updateDialog(null);
                        },
                        saveText: i18n.t("Yes"),
                        cancelText: i18n.t("No"),
                    });
                } catch (err: any) {
                    snackbar.error((err && err.message) || err.toString());
                } finally {
                    loading.reset();
                }
            }
        },
        [snackbar, reload, usecases, loading]
    );

    const handleTranslationUpload = useCallback(
        async (_key: string | undefined, lang: string, terms: Record<string, string>) => {
            await importTranslation(() => usecases.landings.importTranslations(lang, terms));
            await reload();
        },
        [usecases.landings, importTranslation, reload]
    );

    const actions: TableAction<LandingNode>[] = useMemo(
        () =>
            buildTableActions({
                usecases,
                reload,
                loading,
                nodes,
                exportTranslation,
                onAddCategory,
                onEditLandingNode,
                onAddSection,
                onAddSubSection,
                setPermissionLandingNodeId,
            }),
        [
            usecases,
            reload,
            loading,
            nodes,
            exportTranslation,
            onAddCategory,
            onEditLandingNode,
            onAddSection,
            onAddSubSection,
            setPermissionLandingNodeId,
        ]
    );

    const globalActions: Maybe<TableGlobalAction[]> = useMemo(
        () => buildGlobalActions({ translationImportRef, openImportDialog }),
        [openImportDialog]
    );

    const permissionDialogProps: Maybe<PermissionHandlerProps> = useMemo(() => {
        if (!permissionLandingNodeId) return;
        const landingNode = flattenRows(nodes).find(({ id }) => id === permissionLandingNodeId);
        if (!landingNode) return;

        return {
            object: {
                ...landingNode.permissions,
                name: i18n.t("Access to landing page"),
            },
            onChange: async ({ userAccesses, userGroupAccesses, publicAccess }) => {
                const updatedLandingNode = {
                    ...landingNode,
                    permissions: {
                        userAccesses: userAccesses || landingNode.permissions.userAccesses,
                        userGroupAccesses: userGroupAccesses || landingNode.permissions.userGroupAccesses,
                        publicAccess: publicAccess || landingNode.permissions.publicAccess,
                    },
                };
                await usecases.landings.update(updatedLandingNode);
                await reload();
            },
        };
    }, [permissionLandingNodeId, nodes, reload, usecases.landings]);

    return (
        <React.Fragment>
            {permissionDialogProps && (
                <PermissionsDialog
                    allowPublicAccess
                    onClose={closePermissionsDialog}
                    {...permissionDialogProps}
                    showOptions={defaultShowOptions}
                />
            )}
            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}

            <ImportTranslationDialog type="landing-page" ref={translationImportRef} onSave={handleTranslationUpload} />

            <Dropzone
                ref={landingImportRef}
                accept={"application/zip,application/zip-compressed,application/x-zip-compressed"}
                onDrop={handleFileUpload}
            >
                <ObjectsTable<LandingNode>
                    rows={buildOrderedLandingNodes(nodes)}
                    columns={columns}
                    actions={actions}
                    globalActions={globalActions}
                    childrenKeys={["children"]}
                    loading={isLoading}
                />
            </Dropzone>
        </React.Fragment>
    );
};

const defaultShowOptions = {
    publicSharing: true,
    permissionPicker: true,
};

type BuildTableActionsProps = Pick<
    LandingPageListTableProps,
    "onAddSection" | "onAddSubSection" | "onAddCategory" | "onEditLandingNode" | "nodes"
> & {
    usecases: CompositionRoot["usecases"];
    reload: () => Promise<void>;
    exportTranslation: (exporter: () => Promise<Translations>, type: string) => Promise<void>;
    loading: LoadingState;
    setPermissionLandingNodeId: (value: Maybe<string>) => void;
};
function buildTableActions(props: BuildTableActionsProps): TableAction<LandingNode>[] {
    const {
        usecases,
        reload,
        exportTranslation,
        nodes,
        onAddSection,
        onAddSubSection,
        onAddCategory,
        onEditLandingNode,
        loading,
        setPermissionLandingNodeId,
    } = props;

    const move = async (ids: string[], nodes: LandingNode[], change: "up" | "down") => {
        const orderChange = change === "up" ? -1 : 1;
        const allNodes = flattenRows(nodes);

        const firstNode = allNodes.find(({ id }) => id === ids[0]);
        if (firstNode?.order === undefined) return;

        const parent = allNodes.find(({ id }) => id === firstNode?.parent);
        const secondNode = parent?.children[firstNode?.order + orderChange];
        if (secondNode?.order === undefined) return;

        await usecases.landings.swapOrder(firstNode, secondNode);
        await reload();
    };

    return [
        {
            name: "add-section",
            text: i18n.t("Add section"),
            icon: <Icon>add</Icon>,
            onClick: onAddSection,
            isActive: nodes => _.every(nodes, item => item.type === "root"),
        },
        {
            name: "add-sub-section",
            text: i18n.t("Add sub-section"),
            icon: <Icon>add</Icon>,
            onClick: onAddSubSection,
            isActive: nodes => _.every(nodes, item => item.type === "section"),
        },
        {
            name: "add-category",
            text: i18n.t("Add category"),
            icon: <Icon>add</Icon>,
            onClick: onAddCategory,
            isActive: nodes => _.every(nodes, item => item.type === "sub-section" || item.type === "category"),
        },
        {
            name: "edit",
            text: i18n.t("Edit"),
            icon: <Icon>edit</Icon>,
            onClick: onEditLandingNode,
        },
        {
            name: "sharing",
            text: i18n.t("Sharing settings"),
            icon: <Icon>share</Icon>,
            onClick: ids => {
                const landingNode = flattenRows(nodes).find(({ id }) => id === ids[0]);
                if (!landingNode) return;
                setPermissionLandingNodeId(landingNode.id);
            },
            isActive: nodes => _.every(nodes, item => item.type === "root"),
        },
        {
            name: "remove",
            text: i18n.t("Delete"),
            icon: <Icon>delete</Icon>,
            multiple: true,
            onClick: async ids => {
                await usecases.landings.delete(ids);
                await reload();
            },
        },
        {
            name: "export-landing-page",
            text: i18n.t("Export landing page"),
            icon: <Icon>cloud_download</Icon>,
            onClick: async (ids: string[]) => {
                if (!ids[0]) return;
                loading.show(true, i18n.t("Exporting landing page(s)"));
                await usecases.landings.export(ids);
                loading.reset();
            },
            isActive: nodes => _.every(nodes, item => item.type === "root"),
            multiple: true,
        },
        {
            name: "export-translations",
            text: i18n.t("Export JSON translations"),
            icon: <Icon>translate</Icon>,
            onClick: async (ids: string[]) => {
                if (!ids[0]) return;
                loading.show(true, i18n.t("Exporting translations"));
                await exportTranslation(() => usecases.landings.extractTranslations(ids[0]), "landing-page");
                loading.reset();
            },
            isActive: nodes => _.every(nodes, item => item.type === "root"),
            multiple: false,
        },
        {
            name: "move-up",
            text: i18n.t("Move up"),
            icon: <Icon>arrow_upwards</Icon>,
            onClick: ids => move(ids, nodes, "up"),
            isActive: nodes => _.every(nodes, ({ type, order }) => type !== "root" && order !== 0),
            multiple: false,
        },
        {
            name: "move-down",
            text: i18n.t("Move down"),
            icon: <Icon>arrow_downwards</Icon>,
            onClick: ids => move(ids, nodes, "down"),
            isActive: (nodes: OrderedLandingNode[]) =>
                _.every(nodes, ({ type, order, lastOrder }) => type !== "root" && order !== lastOrder),
            multiple: false,
        },
    ];
}

function buildGlobalActions(props: {
    translationImportRef: React.RefObject<ImportTranslationRef>;
    openImportDialog: () => Promise<void>;
}) {
    const { translationImportRef, openImportDialog } = props;
    return [
        {
            name: "import",
            text: i18n.t("Import landing pages"),
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
    ];
}

const columns: TableColumn<LandingNode>[] = [
    {
        name: "type",
        text: "Type",
        sortable: false,
        getValue: item => getTypeName(item.type),
    },
    {
        name: "name",
        text: "Name",
        getValue: item => item.name?.referenceValue ?? "-",
    },
    {
        name: "title",
        text: "Title",
        getValue: item => item.title?.referenceValue ?? "-",
    },
    {
        name: "content",
        text: "Content",
        getValue: item => (item.content ? <StepPreview value={item.content.referenceValue} /> : "-"),
    },
    {
        name: "icon",
        text: "Icon",
        getValue: item => (item.icon ? <ItemIcon src={item.icon} alt={`Icon for ${item.name.referenceValue}`} /> : "-"),
    },
];

const getTypeName = (type: LandingNodeType) => {
    switch (type) {
        case "root":
            return i18n.t("Landing page");
        case "section":
            return i18n.t("Section");
        case "sub-section":
            return i18n.t("Sub-section");
        case "category":
            return i18n.t("Category");
        default:
            return "-";
    }
};

const flattenRows = (rows: LandingNode[]): LandingNode[] => {
    return _.flatMap(rows, row => [row, ...flattenRows(row.children)]);
};

const ItemIcon = styled.img`
    width: 100px;
`;
