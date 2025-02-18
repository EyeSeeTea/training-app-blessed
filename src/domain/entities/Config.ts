import { Permission } from "./Permission";
import { CustomText, getDefaultCustomText } from "./CustomText";
import { Maybe, RecursivePartial } from "../../types/utils";

export type Config = {
    settingsPermissions: Permission;
    showAllModules: boolean;
    logo: string;
    customText: CustomText;
};

export type PartialConfig = RecursivePartial<Config>;

export function getDefaultConfig({ isDefault }: { isDefault?: Maybe<boolean> } = {}): Config {
    return {
        showAllModules: true,
        settingsPermissions: { users: [], userGroups: [] },
        customText: getDefaultCustomText({ isDefault }),
        logo: "",
    };
}
