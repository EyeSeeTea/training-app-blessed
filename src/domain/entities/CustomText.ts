import i18n from "../../locales";
import { getKeys } from "../../types/utils";
import {TranslatableText} from "./TranslatableText";

export interface CustomText {
    root_title: TranslatableText;
    root_subtitle: TranslatableText;
}

export type CustomTextInfo = { [K in keyof CustomText]: string };

export const defaultCustomText: CustomText = {
    root_title: {
        key: 'root_title',
        referenceValue: i18n.t("Welcome to training on DHIS2"),
        translations: {}
    },
    root_subtitle: {
        key: 'root_subtitle',
        referenceValue: i18n.t("What do you want to learn in DHIS2?"),
        translations: {}
    }
};

export const getCustomizableAppText = (customText: Partial<CustomText>): CustomText => {
    return getKeys(defaultCustomText).reduce((acc: CustomText, key) => {
        acc[key] = customText[key] || defaultCustomText[key];
        return acc;
    }, {} as CustomText);
};
