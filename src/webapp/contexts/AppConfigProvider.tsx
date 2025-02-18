import React, { createContext, useContext } from "react";
import { useAppConfig } from "../hooks/useAppConfig";
import { LogoInfo } from "../hooks/useAppConfig";
import { Config } from "../../domain/entities/Config";

interface ConfigContextState {
    appConfig: Config;
    save: (settings: Partial<Config>) => Promise<void>;
    hasSettingsAccess: boolean;
    logoInfo: LogoInfo;
    hasLoaded: boolean;
}

const ConfigContext = createContext<ConfigContextState | null>(null);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const appConfig = useAppConfig();

    return <ConfigContext.Provider value={appConfig}>{children}</ConfigContext.Provider>;
};

export const useAppConfigContext = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error("useConfigContext must be used within an ConfigProvider");
    }
    return context;
};
