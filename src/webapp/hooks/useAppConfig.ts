import { useAppContext } from "../contexts/app-context";
import { defaultConfig, PersistedConfig } from "../../data/entities/PersistedConfig";
import React, { useMemo, useState } from "react";
import { getCustomizableAppText } from "../../domain/entities/CustomText";
import _ from "lodash";

export function useAppConfig() {
    const { usecases } = useAppContext();
    const [appConfig, setAppConfig] = React.useState<PersistedConfig>(defaultConfig);
    const [hasSettingsAccess, setHasSettingsAccess] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const appCustomText = useMemo(() => getCustomizableAppText(appConfig?.customText || {}), [appConfig]);
    const logoInfo = useMemo(() => getLogoInfo(appConfig?.logo), [appConfig]);

    const save = React.useCallback(
        async (config: PersistedConfig) => {
            return usecases.config.save(config).then(setAppConfig);
        },
        [usecases.config]
    );

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const config = await usecases.config.get();
                setAppConfig(config);
                const hasAccess = await usecases.user.checkSettingsPermissions(config);
                setHasSettingsAccess(hasAccess);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setHasLoaded(true);
            }
        };

        fetchData();
    }, [usecases.config, usecases.user]);

    return {
        appConfig,
        save,
        hasSettingsAccess,
        logoInfo,
        appCustomText,
        hasLoaded,
    };
}

export interface LogoInfo {
    logoPath: string;
    logoText: string;
}

function getLogoInfo(logo?: string | null): LogoInfo {
    const logoPath = logo || process.env["REACT_APP_LOGO_PATH"] || "img/logo-eyeseetea.png";
    const filename = logoPath.split("/").reverse()[0] || "";
    const name = filename.substring(0, filename.lastIndexOf("."));
    const logoText = _.startCase(name);
    return { logoPath, logoText };
}
