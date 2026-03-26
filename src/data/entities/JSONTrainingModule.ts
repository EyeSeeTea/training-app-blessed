import { TrainingModuleContents, TrainingModulePage, TrainingModuleStep } from "../../domain/entities/TrainingModule";
import { TranslatableText } from "../../domain/entities/TranslatableText";
import { PartialBy } from "../../types/utils";

export type TrainingModulePageOptionalPermissions = PartialBy<
    Omit<TrainingModulePage, "editable">,
    "permissions" | "bindings"
>;
type TrainingModuleStepOptionalPermissions = Omit<TrainingModuleStep, "pages"> & {
    pages: TrainingModulePageOptionalPermissions[];
};
type TrainingModuleContentsOptionalPermissions = Omit<TrainingModuleContents, "steps"> & {
    steps: TrainingModuleStepOptionalPermissions[];
};

export interface JSONTrainingModule {
    _version: number;
    id: string;
    name: TranslatableText;
    icon: string;
    type: string;
    disabled: boolean;
    contents: TrainingModuleContentsOptionalPermissions;
    revision: number;
    dhisVersionRange: string;
    dhisAppKey: string;
    dhisLaunchUrl: string;
    dhisAuthorities: string[];
}
