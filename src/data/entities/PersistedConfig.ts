import { Config } from "../../domain/entities/Config";

export interface PersistedConfig extends Config {
    poeditorToken?: string;
}

export const defaultConfig = {
    showAllModules: true,
    settingsPermissions: {},
    customText: {},
};
