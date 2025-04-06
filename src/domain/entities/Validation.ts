import _ from "lodash";
import i18n from "../../utils/i18n";
import { Ref } from "./Ref";
import { TrainingModuleStep } from "./TrainingModule";

export interface ValidationError {
    property: string;
    description: string;
    error: string;
}

export interface ModelValidation {
    property: string;
    alias?: string;
    validation: keyof typeof availableValidations;
}

const availableValidations = {
    hasText: {
        error: "cannot_be_blank",
        getDescription: (field: string) => i18n.t("Field {{field}} cannot be blank", { field }),
        check: (value?: string) => !value?.trim(),
    },
    hasValue: {
        error: "cannot_be_blank",
        getDescription: (field: string) => i18n.t("Field {{field}} cannot be blank", { field }),
        check: (value?: string) => !value,
    },
    hasItems: {
        error: "cannot_be_empty",
        getDescription: (field: string) => i18n.t("You need to add at least one {{field}}", { field }),
        check: (array?: unknown[]) => !array || array.length === 0,
    },
    hasPages: {
        error: "has_pages",
        getDescription: (_: string) => i18n.t("All steps need to have at least one page"),
        check: (array?: TrainingModuleStep[]) => _.some(array, ({ pages }) => !pages || pages.length === 0),
    },
    validRef: {
        error: "invalid_url",
        getDescription: (field: string) => i18n.t("Field {{field}} is not valid", { field }),
        check: (value?: Ref) => !value?.id,
    },
};

export function validateModel<T>(item: T, validations: ModelValidation[], filter?: string[]): ValidationError[] {
    return validations
        .reduce((acc: ValidationError[], { property, validation, alias }: ModelValidation) => {
            const { check, error, getDescription } = availableValidations[validation];
            const value = _.get(item, property);
            const description = getDescription(alias ?? property);

            if (check(value)) acc.push({ property, description, error });

            return acc;
        }, [] as ValidationError[])
        .filter(({ property }) => filter?.includes(property) ?? true);
}
