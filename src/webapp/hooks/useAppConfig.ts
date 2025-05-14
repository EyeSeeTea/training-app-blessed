import React, { useMemo, useState } from "react";
import _ from "lodash";

import { useAppContext } from "../contexts/app-context";
import { Config, getDefaultConfig } from "../../domain/entities/Config";
import { Maybe } from "../../types/utils";

export function useAppConfig() {
    const { usecases } = useAppContext();
    const [appConfig, setAppConfig] = React.useState<Config>(getDefaultConfig());
    const [hasSettingsAccess, setHasSettingsAccess] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const logoInfo = useMemo(() => getLogoInfo(appConfig?.logo), [appConfig]);

    const save = React.useCallback(
        (config: Partial<Config>) => {
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
        hasLoaded,
    };
}

export interface LogoInfo {
    logoPath: string;
    logoText: string;
}

function getLogoInfo(logo?: Maybe<string>): LogoInfo {
    const logoPath = logo || process.env["REACT_APP_LOGO_PATH"] || "img/logo-eyeseetea.png";
    const filename = logoPath.split("/").reverse()[0] || "";
    const name = filename.substring(0, filename.lastIndexOf("."));
    const logoText = _.startCase(name);
    return { logoPath, logoText };
}
