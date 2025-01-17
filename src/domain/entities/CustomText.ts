import i18n from "../../locales";
import { getKeys } from "../../types/utils";

export interface CustomText {
    root_title: string;
    root_subtitle: string;
}

export interface CustomTextPropInfo {
    label: string;
    description: string;
}

export type CustomTextInfo = { [K in keyof CustomText]: CustomTextPropInfo };

export const defaultCustomText: CustomText = {
    root_title: i18n.t("Welcome to training on DHIS2"),
    root_subtitle: i18n.t("What do you want to learn in DHIS2?"),
};

export const getCustomizableAppText = (customText: Partial<CustomText>): CustomText => {
    return getKeys(defaultCustomText).reduce((acc: CustomText, key) => {
        acc[key] = customText[key] || defaultCustomText[key];
        return acc;
    }, {} as CustomText);
};
