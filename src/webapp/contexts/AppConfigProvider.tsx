import React, { createContext, useContext } from "react";
import { useAppConfig } from "../hooks/useAppConfig";
import { PersistedConfig } from "../../data/entities/PersistedConfig";
import { LogoInfo } from "../hooks/useAppConfig";
import { CustomText } from "../../domain/entities/CustomText";

interface ConfigContextState {
    appConfig: PersistedConfig;
    save: (settings: PersistedConfig) => void;
    hasSettingsAccess: boolean;
    logoInfo: LogoInfo;
    appCustomText: CustomText;
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
