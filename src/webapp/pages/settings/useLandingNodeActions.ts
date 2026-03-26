import { useCallback } from "react";
import i18n from "../../../utils/i18n";
import { flattenNodes, LandingNode } from "../../../domain/entities/LandingPage";
import { useAppContext } from "../../contexts/app-context";
import { LandingPageEditDialogProps } from "../../components/landing-page-edit-dialog/LandingPageEditDialog";

export function useLandingNodeActions(
    nodes: LandingNode[],
    setDialogProps: (props: LandingPageEditDialogProps | undefined) => void
) {
    const { usecases, reload } = useAppContext();

    const doSaveLandingNode = useCallback(
        async (node: LandingNode) => {
            setDialogProps(undefined);
            await usecases.landings.update(node);
            await reload();
        },
        [reload, usecases, setDialogProps]
    );

    const onAddLandingPage = useCallback(() => {
        setDialogProps({
            title: i18n.t("Add Landing Page"),
            type: "root",
            parent: "none",
            order: nodes.length,
            onCancel: () => setDialogProps(undefined),
            onSave: doSaveLandingNode,
        });
    }, [doSaveLandingNode, setDialogProps, nodes]);

    const onAddSection = useCallback(
        (ids: string[]) => {
            const parent = flattenNodes(nodes).find(({ id }) => id === ids[0]);
            if (!parent) return;

            setDialogProps({
                title: i18n.t("Add section"),
                type: "section",
                parent: parent.id,
                order: parent.children.length,
                onCancel: () => setDialogProps(undefined),
                onSave: doSaveLandingNode,
            });
        },
        [doSaveLandingNode, nodes, setDialogProps]
    );

    const onAddSubSection = useCallback(
        (ids: string[]) => {
            const parent = flattenNodes(nodes).find(({ id }) => id === ids[0]);
            if (!parent) return;

            setDialogProps({
                title: i18n.t("Add sub-section"),
                type: "sub-section",
                parent: parent.id,
                order: parent.children.length,
                onCancel: () => setDialogProps(undefined),
                onSave: doSaveLandingNode,
            });
        },
        [doSaveLandingNode, nodes, setDialogProps]
    );

    const onAddCategory = useCallback(
        (ids: string[]) => {
            const parent = flattenNodes(nodes).find(({ id }) => id === ids[0]);
            if (!parent) return;

            setDialogProps({
                title: i18n.t("Add category"),
                type: "category",
                parent: parent.id,
                order: parent.children.length,
                onCancel: () => setDialogProps(undefined),
                onSave: doSaveLandingNode,
            });
        },
        [doSaveLandingNode, nodes, setDialogProps]
    );

    const onEditLandingNode = useCallback(
        (ids: string[]) => {
            const parent = flattenNodes(nodes).find(({ id }) => id === ids[0]);
            if (!parent) return;

            setDialogProps({
                title: i18n.t("Edit"),
                type: parent.type,
                parent: parent.parent,
                initialNode: parent,
                order: parent.order ?? 0,
                onCancel: () => setDialogProps(undefined),
                onSave: doSaveLandingNode,
            });
        },
        [doSaveLandingNode, nodes, setDialogProps]
    );

    return {
        onAddSection,
        onAddSubSection,
        onAddCategory,
        onEditLandingNode,
        onAddLandingPage,
    };
}
