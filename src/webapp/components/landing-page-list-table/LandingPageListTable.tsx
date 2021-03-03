import { ObjectsTable, TableAction, TableColumn } from "@eyeseetea/d2-ui-components";
import { Icon } from "@material-ui/core";
import _ from "lodash";
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { LandingNode, LandingNodeType } from "../../../domain/entities/LandingPage";
import i18n from "../../../locales";
import { MarkdownViewer } from "../../components/markdown-viewer/MarkdownViewer";
import { useAppContext } from "../../contexts/app-context";
import { LandingPageEditDialog, LandingPageEditDialogProps } from "../landing-page-edit-dialog/LandingPageEditDialog";
import { ModalBody } from "../modal";

export const LandingPageListTable: React.FC<{ nodes: LandingNode[] }> = ({ nodes }) => {
    const { usecases, reload } = useAppContext();

    const [editDialogProps, updateEditDialog] = useState<LandingPageEditDialogProps | null>(null);

    const columns: TableColumn<LandingNode>[] = useMemo(
        () => [
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
                getValue: item =>
                    item.icon ? <ItemIcon src={item.icon} alt={`Icon for ${item.name.referenceValue}`} /> : "-",
            },
        ],
        []
    );

    const actions: TableAction<LandingNode>[] = useMemo(
        () => [
            {
                name: "add-section",
                text: i18n.t("Add section"),
                icon: <Icon>add</Icon>,
                onClick: ids => {
                    const parent = flattenRows(nodes).find(({ id }) => id === ids[0]);
                    if (!parent) return;

                    updateEditDialog({
                        title: i18n.t("Add section"),
                        type: "section",
                        parent: parent.id,
                        order: parent.children.length,
                        onCancel: () => updateEditDialog(null),
                        onSave: async node => {
                            updateEditDialog(null);
                            await usecases.landings.update(node);
                            await reload();
                        },
                    });
                },
                isActive: nodes => _.every(nodes, item => item.type === "root"),
            },
            {
                name: "add-sub-section",
                text: i18n.t("Add sub-section"),
                icon: <Icon>add</Icon>,
                onClick: ids => {
                    const parent = flattenRows(nodes).find(({ id }) => id === ids[0]);
                    if (!parent) return;

                    updateEditDialog({
                        title: i18n.t("Add sub-section"),
                        type: "sub-section",
                        parent: parent.id,
                        order: parent.children.length,
                        onCancel: () => updateEditDialog(null),
                        onSave: async node => {
                            updateEditDialog(null);
                            await usecases.landings.update(node);
                            await reload();
                        },
                    });
                },
                isActive: nodes => _.every(nodes, item => item.type === "section"),
            },
            {
                name: "add-category",
                text: i18n.t("Add category"),
                icon: <Icon>add</Icon>,
                onClick: ids => {
                    const parent = flattenRows(nodes).find(({ id }) => id === ids[0]);
                    if (!parent) return;

                    updateEditDialog({
                        title: i18n.t("Add category"),
                        type: "category",
                        parent: parent.id,
                        order: parent.children.length,
                        onCancel: () => updateEditDialog(null),
                        onSave: async node => {
                            updateEditDialog(null);
                            await usecases.landings.update(node);
                            await reload();
                        },
                    });
                },
                isActive: nodes => _.every(nodes, item => item.type === "sub-section" || item.type === "category"),
            },
            {
                name: "edit",
                text: i18n.t("Edit"),
                icon: <Icon>edit</Icon>,
                onClick: ids => {
                    const node = flattenRows(nodes).find(({ id }) => id === ids[0]);
                    if (!node) return;

                    updateEditDialog({
                        title: i18n.t("Edit"),
                        type: node.type,
                        parent: node.parent,
                        initialNode: node,
                        order: node.order ?? 0,
                        onCancel: () => updateEditDialog(null),
                        onSave: async node => {
                            updateEditDialog(null);
                            await usecases.landings.update(node);
                            await reload();
                        },
                    });
                },
                isActive: nodes => _.every(nodes, item => item.type !== "root"),
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
                isActive: nodes => _.every(nodes, item => item.id !== "root"),
            },
        ],
        [usecases, reload, nodes]
    );

    return (
        <React.Fragment>
            {editDialogProps && <LandingPageEditDialog isOpen={true} {...editDialogProps} />}

            <ObjectsTable<LandingNode> rows={nodes} columns={columns} actions={actions} childrenKeys={["children"]} />
        </React.Fragment>
    );
};

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
