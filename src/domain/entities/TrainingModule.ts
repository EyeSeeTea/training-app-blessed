import { Maybe, PartialBy } from "../../types/utils";
import { BaseMetadata, SharedProperties } from "./Ref";
import { TranslatableText } from "./TranslatableText";
import { PageBinding } from "./PageBinding";
import { ModelValidation } from "./Validation";

export type TrainingModuleType = "app" | "core" | "widget";

export type TrainingModulePage = TranslatableText & {
    id: string;
    editable: boolean;
    permissions: SharedProperties;
    bindings: PageBinding[];
};

export type TrainingModuleStep = {
    id: string;
    title: TranslatableText;
    subtitle: Maybe<TranslatableText>;
    pages: TrainingModulePage[];
};

export type TrainingModuleContents = {
    welcome: TranslatableText;
    steps: TrainingModuleStep[];
};

export type TrainingModule = BaseMetadata & {
    id: string;
    name: TranslatableText;
    icon: string;
    type: TrainingModuleType;
    disabled: boolean;
    progress: {
        id: string;
        lastStep: number;
        completed: boolean;
    };
    contents: TrainingModuleContents;
    revision: number;
    dhisVersionRange: string;
    dhisAppKey: string;
    dhisLaunchUrl: string;
    dhisAuthorities: string[];
    installed: boolean;
    compatible: boolean;
    editable: boolean;
    outdated: boolean;
    builtin: boolean;
};

export type PartialTrainingModule = PartialBy<
    TrainingModule,
    | "user"
    | "created"
    | "lastUpdated"
    | "lastUpdatedBy"
    | "publicAccess"
    | "userAccesses"
    | "userGroupAccesses"
    | "progress"
    | "installed"
    | "editable"
    | "compatible"
    | "outdated"
    | "builtin"
>;

export const extractStepFromKey = (key: string): { step: number; content: number } | null => {
    const match = /^.*-(\d*)-(\d*)$/.exec(key);
    if (!match) return null;

    const [stepKey, step, content] = match;
    if (!stepKey || !step || !content) return null;

    return { step: parseInt(step), content: parseInt(content) };
};

export const isValidTrainingType = (type: string): type is TrainingModuleType => {
    return ["app", "core", "widget"].includes(type);
};

export const trainingModuleValidations: ModelValidation[] = [
    {
        property: "id",
        validation: "hasValue",
        alias: "code",
    },
    {
        property: "name.referenceValue",
        validation: "hasValue",
        alias: "name",
    },
    {
        property: "contents.steps",
        validation: "hasItems",
        alias: "step",
    },
    {
        property: "contents.steps",
        validation: "hasPages",
    },
];

export const defaultTrainingModule: PartialTrainingModule = {
    id: "",
    name: { key: "module-name", referenceValue: "", translations: {} },
    icon: "",
    type: "app",
    revision: 1,
    dhisVersionRange: "",
    dhisAppKey: "",
    dhisLaunchUrl: "",
    dhisAuthorities: [],
    disabled: false,
    contents: {
        welcome: { key: "module-welcome", referenceValue: "", translations: {} },
        steps: [],
    },
};

export const defaultPagePermissions: SharedProperties = {
    publicAccess: "r-------",
    userAccesses: [],
    userGroupAccesses: [],
};

export function removeEmptyPages(module: TrainingModule): TrainingModule {
    return {
        ...module,
        contents: {
            ...module.contents,
            steps: module.contents.steps.filter(({ pages }) => pages.length > 0),
        },
    };
}

export function removeEmptyStepsFromModules(modules: TrainingModule[]): TrainingModule[] {
    return modules.map(module => removeEmptyPages(module)).filter(({ contents }) => contents.steps.length > 0);
}
