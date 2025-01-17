import _ from "lodash";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LandingNode } from "../../domain/entities/LandingPage";
import { TrainingModule } from "../../domain/entities/TrainingModule";
import { buildTranslate, TranslateMethod } from "../../domain/entities/TranslatableText";
import { CompositionRoot } from "../CompositionRoot";
import { AppState } from "../entities/AppState";
import { AppRoute } from "../router/AppRoute";
import { cacheImages } from "../utils/image-cache";
import i18n from "../../locales";
import { CustomText, getCustomizableAppText } from "../../domain/entities/CustomText";

const AppContext = React.createContext<AppContextState | null>(null);

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
    children,
    routes,
    compositionRoot,
    locale,
}) => {
    const [appState, setAppState] = useState<AppState>({ type: "UNKNOWN" });
    const [modules, setModules] = useState<TrainingModule[]>([]);
    const [landings, setLandings] = useState<LandingNode[]>([]);
    const [hasSettingsAccess, setHasSettingsAccess] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAllModules, setShowAllModules] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const translate = buildTranslate(locale);
    const [customText, setCustomText] = useState<Partial<CustomText>>({});
    const [logoInfo, setLogo] = useState<LogoInfo>(getLogoInfo());
    const appCustomText = useMemo(() => getCustomizableAppText(customText), [customText]);

    const reload = useCallback(async () => {
        setIsLoading(true);

        const [modules, landings, showAllModules, fetchedCustomText] = await Promise.all([
            compositionRoot.usecases.modules.list(),
            compositionRoot.usecases.landings.list(),
            compositionRoot.usecases.config.getShowAllModules(),
            compositionRoot.usecases.config.getCustomText(),
        ]);

        cacheImages(JSON.stringify(modules));
        cacheImages(JSON.stringify(landings));

        setModules(modules);
        setLandings(landings);
        setShowAllModules(showAllModules);
        setIsLoading(false);
        setCustomText(fetchedCustomText);
    }, [compositionRoot]);

    const updateAppState = useCallback((update: AppState | ((prevState: AppState) => AppState)) => {
        setAppState(prevState => {
            const nextState = _.isFunction(update) ? update(prevState) : update;
            return nextState;
        });
    }, []);

    useEffect(() => {
        compositionRoot.usecases.user.checkSettingsPermissions().then(setHasSettingsAccess);
        compositionRoot.usecases.user.checkAdminAuthority().then(setIsAdmin);
        compositionRoot.usecases.config.getShowAllModules().then(setShowAllModules);
        compositionRoot.usecases.config.getCustomText().then(setCustomText);
        compositionRoot.usecases.config.getLogo().then(logoPath => setLogo(getLogoInfo(logoPath)));
    }, [compositionRoot]);

    return (
        <AppContext.Provider
            value={{
                routes,
                compositionRoot,
                appState,
                setAppState: updateAppState,
                modules,
                landings,
                translate,
                reload,
                isLoading,
                hasSettingsAccess,
                isAdmin,
                showAllModules,
                customText,
                appCustomText,
                logoInfo,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export function useAppContext(): UseAppContextResult {
    const context = useContext(AppContext);
    i18n.setDefaultNamespace("training-app");
    if (!context) throw new Error("Context not initialized");

    const {
        compositionRoot,
        routes,
        appState,
        setAppState,
        modules,
        landings,
        translate,
        reload,
        isLoading,
        hasSettingsAccess,
        isAdmin,
        showAllModules,
        customText,
        appCustomText,
        logoInfo,
    } = context;
    const { usecases } = compositionRoot;
    const [module, setCurrentModule] = useState<TrainingModule>();

    useEffect(() => {
        setCurrentModule(
            appState.type === "TRAINING" ||
                appState.type === "TRAINING_DIALOG" ||
                appState.type === "EDIT_MODULE" ||
                appState.type === "CLONE_MODULE"
                ? modules.find(({ id }) => id === appState.module)
                : undefined
        );
    }, [appState, modules]);

    return {
        appState,
        setAppState,
        routes,
        usecases,
        modules,
        landings,
        module,
        translate,
        reload,
        isLoading,
        hasSettingsAccess,
        isAdmin,
        showAllModules,
        customText,
        appCustomText,
        logoInfo,
    };
}

type AppStateUpdateMethod = (oldState: AppState) => AppState;
type ReloadMethod = () => Promise<void>;

export interface AppContextProviderProps {
    routes: AppRoute[];
    compositionRoot: CompositionRoot;
    locale: string;
}

export interface AppContextState {
    appState: AppState;
    setAppState: (appState: AppState | AppStateUpdateMethod) => void;
    modules: TrainingModule[];
    landings: LandingNode[];
    routes: AppRoute[];
    compositionRoot: CompositionRoot;
    translate: TranslateMethod;
    reload: ReloadMethod;
    isLoading: boolean;
    hasSettingsAccess: boolean;
    isAdmin: boolean;
    showAllModules: boolean;
    customText: Partial<CustomText>;
    appCustomText: CustomText;
    logoInfo: LogoInfo;
}

interface UseAppContextResult {
    appState: AppState;
    setAppState: (appState: AppState | AppStateUpdateMethod) => void;
    routes: AppRoute[];
    usecases: CompositionRoot["usecases"];
    modules: TrainingModule[];
    landings: LandingNode[];
    module?: TrainingModule;
    translate: TranslateMethod;
    reload: ReloadMethod;
    isLoading: boolean;
    hasSettingsAccess: boolean;
    isAdmin: boolean;
    showAllModules: boolean;
    customText: Partial<CustomText>;
    appCustomText: CustomText;
    logoInfo: LogoInfo;
}

interface LogoInfo {
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
