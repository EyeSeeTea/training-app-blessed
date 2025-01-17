import { Permission } from "../../domain/entities/Permission";
import { CustomText } from "../../domain/entities/CustomText";

export interface PersistedConfig {
    poeditorToken?: string;
    settingsPermissions?: Permission;
    showAllModules?: boolean;
    logo?: string;
    customText?: Partial<CustomText>;
}
