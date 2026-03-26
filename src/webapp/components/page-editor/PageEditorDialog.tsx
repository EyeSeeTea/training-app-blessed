import React from "react";

import { TrainingModulePage } from "../../../domain/entities/TrainingModule";
import { MarkdownEditorDialog, MarkdownEditorDialogProps } from "../markdown-editor/MarkdownEditorDialog";
import { BINDING_TYPE, getDefaultBinding, PageBinding } from "../../../domain/entities/PageBinding";
import i18n from "../../../utils/i18n";
import { StepPreview } from "../markdown-editor/StepPreview";
import { PageBindingEditor } from "./PageBindingEditor";
import { useShowInteractiveTrainingConfig } from "../../hooks/useShowInteractiveTrainingConfig";

type Page = Pick<TrainingModulePage, "id" | "referenceValue" | "bindings"> & { name: string };

export type PageEditorProps = {
    page?: Page;
    onSave: (page: Page) => void;
    onCancel: () => void;
    onUpload?: MarkdownEditorDialogProps["onUpload"];
};

export const PageEditorDialog: React.FC<PageEditorProps> = props => {
    const { page: initialPage, onSave, onCancel, onUpload } = props;

    const showInteractiveTrainingConfig = useShowInteractiveTrainingConfig();

    const { bindings, ...bindingActions } = usePageBindings(initialPage?.bindings);

    const title = initialPage ? i18n.t("Edit contents of {{name}}", initialPage) : i18n.t("Add new page");

    const handleSave = React.useCallback(
        markdown => {
            onSave({
                id: initialPage?.id ?? "",
                name: initialPage?.name ?? "",
                referenceValue: markdown,
                bindings: bindings,
            });
        },
        [bindings, initialPage, onSave]
    );

    return (
        <MarkdownEditorDialog
            title={title}
            initialValue={initialPage?.referenceValue}
            onCancel={onCancel}
            onUpload={onUpload}
            onSave={handleSave}
            markdownPreview={markdown => <StepPreview value={markdown} />}
        >
            {showInteractiveTrainingConfig && (
                <>
                    <h3>{i18n.t("Interactive training bindings")}</h3>
                    <PageBindingEditor bindings={bindings} {...bindingActions} />
                </>
            )}
        </MarkdownEditorDialog>
    );
};

export function usePageBindings(initialBindings: PageBinding[] = []) {
    const [bindings, setBindings] = React.useState<PageBinding[]>(initialBindings);
    const addBinding = React.useCallback(() => {
        setBindings(prev => [...prev, getDefaultBinding(BINDING_TYPE.event)]);
    }, []);

    const handleChange = React.useCallback(
        <T extends PageBinding, K extends keyof T>(id: string) =>
            (key: K, value: T[K]) => {
                setBindings(prev =>
                    prev.map(binding => (binding.id === id ? ({ ...binding, [key]: value } as PageBinding) : binding))
                );
            },
        []
    );

    const removeBinding = React.useCallback((id: string) => {
        setBindings(prev => prev.filter(binding => binding.id !== id));
    }, []);

    return {
        bindings,
        addBinding,
        handleChange,
        removeBinding,
    };
}
