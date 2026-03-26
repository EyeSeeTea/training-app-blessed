import { swapById } from "../../utils/array";
import { defaultPagePermissions, PartialTrainingModule } from "../entities/TrainingModule";
import { TranslatableText } from "../entities/TranslatableText";
import { PageBinding } from "../entities/PageBinding";
import { SharedProperties } from "../entities/Ref";

export const updateTranslation = (
    module: PartialTrainingModule,
    key: string,
    value: string,
    language?: string
): PartialTrainingModule => {
    const translate = (text: TranslatableText): TranslatableText => {
        if (key !== text.key) return text;

        return !language
            ? { ...text, referenceValue: value }
            : { ...text, translations: { ...text.translations, [language]: value } };
    };

    return {
        ...module,
        name: translate(module.name),
        contents: {
            ...module.contents,
            welcome: translate(module.contents.welcome),
            steps: module.contents.steps.map(step => ({
                ...step,
                title: translate(step.title),
                pages: step.pages.map(page => ({ ...page, ...translate(page) })),
            })),
        },
    };
};

export function updatePagePermissions(
    module: PartialTrainingModule,
    page: { id: string; permissions: SharedProperties }
): PartialTrainingModule {
    const { id: pageId, permissions } = page;
    return {
        ...module,
        contents: {
            ...module.contents,
            steps: module.contents.steps.map(step => ({
                ...step,
                pages: step.pages.map(page => (page.id === pageId ? { ...page, permissions } : page)),
            })),
        },
    };
}

export function updatePageBindings(
    module: PartialTrainingModule,
    page: { id: string; bindings: PageBinding[] }
): PartialTrainingModule {
    const { id: pageId, bindings } = page;
    return {
        ...module,
        contents: {
            ...module.contents,
            steps: module.contents.steps.map(step => ({
                ...step,
                pages: step.pages.map(page => (page.id === pageId ? { ...page, bindings } : page)),
            })),
        },
    };
}

export const enforceKeyName = (model: PartialTrainingModule): PartialTrainingModule => {
    return {
        ...model,
        contents: {
            ...model.contents,
            steps: model.contents.steps.map((step, stepIdx) => ({
                ...step,
                id: generateStepId(model.id, stepIdx + 1),
                title: { ...step.title, key: `${model.id}-step-${stepIdx + 1}-title` },
                pages: step.pages.map((page, pageIdx) => ({
                    ...page,
                    id: generatePageId(model.id, stepIdx + 1, pageIdx + 1),
                    key: generatePageKey(model.id, stepIdx + 1, pageIdx + 1),
                })),
            })),
        },
    };
};

export function generateStepId(moduleId: string, stepIndex: number): string {
    return `${moduleId}-step-${stepIndex}`;
}

export function generatePageId(moduleId: string, stepIndex: number, pageIndex: number): string {
    return `${moduleId}-page-${stepIndex}-${pageIndex}`;
}

export function generatePageKey(moduleId: string, stepIndex: number, pageIndex: number): string {
    return `${moduleId}-step-${stepIndex}-${pageIndex}`;
}

export const updateOrder = (model: PartialTrainingModule, id1: string, id2: string): PartialTrainingModule => {
    return enforceKeyName({
        ...model,
        contents: {
            ...model.contents,
            steps: swapById(
                model.contents.steps.map(step => ({
                    ...step,
                    pages: swapById(step.pages, id1, id2),
                })),
                id1,
                id2
            ),
        },
    });
};

export const addStep = (model: PartialTrainingModule, title: string): PartialTrainingModule => {
    return enforceKeyName({
        ...model,
        contents: {
            ...model.contents,
            steps: [
                ...model.contents.steps,
                {
                    id: generateStepId(model.id, model.contents.steps.length + 1),
                    title: {
                        key: `${model.id}-step-${model.contents.steps.length + 1}-title`,
                        referenceValue: title,
                        translations: {},
                    },
                    subtitle: undefined,
                    pages: [],
                },
            ],
        },
    });
};

export const addPage = (
    model: PartialTrainingModule,
    stepKey: string,
    page: { value: string; bindings?: PageBinding[] }
): PartialTrainingModule => {
    const { value, bindings } = page;
    return enforceKeyName({
        ...model,
        contents: {
            ...model.contents,
            steps: model.contents.steps.map((step, stepIdx) => {
                if (step.id !== stepKey) return step;

                return {
                    ...step,
                    pages: [
                        ...step.pages,
                        {
                            id: generatePageId(model.id, stepIdx, step.pages.length + 1),
                            key: generatePageKey(model.id, stepIdx + 1, step.pages.length + 1),
                            referenceValue: value,
                            translations: {},
                            bindings: bindings || [],
                            permissions: defaultPagePermissions,
                            editable: true,
                        },
                    ],
                };
            }),
        },
    });
};

export const removeStep = (module: PartialTrainingModule, stepKey: string): PartialTrainingModule => {
    return {
        ...module,
        contents: {
            ...module.contents,
            steps: module.contents.steps.filter(step => step.id !== stepKey),
        },
    };
};

export const removePage = (module: PartialTrainingModule, stepKey: string, pageKey: string): PartialTrainingModule => {
    return {
        ...module,
        contents: {
            ...module.contents,
            steps: module.contents.steps.map(step => {
                if (step.id !== stepKey) return step;

                return {
                    ...step,
                    pages: step.pages.filter(page => page.id !== pageKey),
                };
            }),
        },
    };
};
