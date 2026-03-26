import { Permission } from "./Permission";
import { CustomText, getDefaultCustomText } from "./CustomText";

export type Config = {
    settingsPermissions: Permission;
    showAllModules: boolean;
    logo: string;
    customText: CustomText;
    containerConfig: ContainerConfig;
};

export function getDefaultConfig(): Config {
    return {
        showAllModules: true,
        settingsPermissions: { users: [], userGroups: [] },
        customText: getDefaultCustomText(),
        logo: "",
        containerConfig: defaultContainerConfig,
    };
}

type BaseConfig = { buttonPosition: "top-right" | "bottom-right" };
export type SideBarConfig = BaseConfig & {
    type: "sidebar";
    position: "left" | "right";
    width: number;
    unit: "px" | "%";
    collapseMode: "mini" | "hide";
};
export type DialogConfig = BaseConfig & { type: "dialog" };
export type ContainerConfig = SideBarConfig | DialogConfig;

export const defaultContainerConfig: SideBarConfig = {
    type: "sidebar",
    position: "right",
    width: 30,
    unit: "%",
    buttonPosition: "top-right",
    collapseMode: "mini",
};
