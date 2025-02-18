import i18n from "../../locales";
import { TranslatableText } from "./TranslatableText";
import { Maybe } from "../../types/utils";

export type CustomText = {
    rootTitle: TranslatableText;
    rootSubtitle: TranslatableText;
};

export const CustomTextFields: (keyof CustomText)[] = ["rootTitle", "rootSubtitle"];
export type CustomTextInfo = { [K in keyof CustomText]: string };

export type DefaultCustomText = CustomText & { isDefault?: Maybe<boolean> };

export function getDefaultCustomText(isDefault: { isDefault?: Maybe<boolean> } = {}): DefaultCustomText {
    return {
        rootTitle: {
            key: "root-title",
            referenceValue: i18n.t("Welcome to training on DHIS2"),
            translations: {},
        },
        rootSubtitle: {
            key: "root-subtitle",
            referenceValue: i18n.t("What do you want to learn in DHIS2?"),
            translations: {},
        },
        ...isDefault,
    };
}
