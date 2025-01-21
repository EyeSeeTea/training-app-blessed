import _ from "lodash";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { LandingNode } from "../../domain/entities/LandingPage";
import { TrainingModule } from "../../domain/entities/TrainingModule";
import { buildTranslate, TranslateMethod } from "../../domain/entities/TranslatableText";
import { CompositionRoot } from "../CompositionRoot";
import { AppState } from "../entities/AppState";
import { AppRoute } from "../router/AppRoute";
import { cacheImages } from "../utils/image-cache";
import i18n from "../../locales";

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
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const translate = buildTranslate(locale);
    const reload = useCallback(async () => {
        setIsLoading(true);

        const [modules, landings] = await Promise.all([
            compositionRoot.usecases.modules.list(),
            compositionRoot.usecases.landings.list(),
        ]);

        cacheImages(JSON.stringify(modules));
        cacheImages(JSON.stringify(landings));

        setModules(modules);
        setLandings(landings);
        setIsLoading(false);
    }, [compositionRoot]);

    const updateAppState = useCallback((update: AppState | ((prevState: AppState) => AppState)) => {
        setAppState(prevState => {
            const nextState = _.isFunction(update) ? update(prevState) : update;
            return nextState;
        });
    }, []);

    useEffect(() => {
        compositionRoot.usecases.user.checkAdminAuthority().then(setIsAdmin);
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
                isAdmin,
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

    const { compositionRoot, routes, appState, setAppState, modules, landings, translate, reload, isLoading, isAdmin } =
        context;
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
        isAdmin,
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
    isAdmin: boolean;
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
    isAdmin: boolean;
}
