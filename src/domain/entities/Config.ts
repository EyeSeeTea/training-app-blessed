import { Permission } from "./Permission";
import { CustomText } from "./CustomText";

export interface Config {
    settingsPermissions?: Permission;
    showAllModules?: boolean;
    logo?: string;
    customText?: Partial<CustomText>;
}
