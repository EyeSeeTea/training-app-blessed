import { useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";

import { D2Api } from "../../../types/d2-api";
import { TrainingModule, TrainingModulePage } from "../../../domain/entities/TrainingModule";
import { buildTranslate, TranslatableText } from "../../../domain/entities/TranslatableText";
import { Config, ContainerConfig, defaultContainerConfig } from "../../../domain/entities/Config";
import { getCompositionRoot } from "../../../webapp/CompositionRoot";
import { LandingNode } from "../../../domain/entities/LandingPage";
import { generateSettingsUrl, transformD2Urls, updateIconDocumentUrls } from "../utils";
import { getLogoInfo, LogoInfo } from "../../../webapp/hooks/useAppConfig";
import { useTrainingNavigation } from "../../../webapp/hooks/useTrainingNavigation";
import { User } from "../../../data/entities/User";

type UseTutorialModuleStateProps = {
    landings: LandingNode[];
    modules: TrainingModule[];
    textContent: string;
    currentUser: User;
};

export function useTutorialModuleState(props: UseTutorialModuleStateProps) {
    const { landings, modules, textContent, currentUser } = props;
    const { goBack, goHome, isRoot, currentPage, ...navigations } = useTrainingNavigation({ landings, currentUser });
    const [module, setModule] = useState<TrainingModule>();

    const handleBack = useCallback(() => {
        if (module) {
            setModule(undefined);
        } else {
            goBack();
        }
    }, [goBack, module]);

    const handleHome = useCallback(() => {
        setModule(undefined);
        goHome();
    }, [goHome]);

    const showNavButtons = !textContent && !isRoot;

    const onGoBack = useMemo(
        () => (showNavButtons && !module ? handleBack : undefined),
        [handleBack, showNavButtons, module]
    );
    const onGoHome = useMemo(
        () => (showNavButtons || module ? handleHome : undefined),
        [handleHome, showNavButtons, module]
    );

    const loadModule = useCallback(
        (moduleId: string) => {
            const moduleSelected = modules.find(m => m.id === moduleId);
            if (moduleSelected) setModule(moduleSelected);
        },
        [modules]
    );

    return {
        ...navigations,
        currentPage,
        loadedModule: module,
        loadModule,
        onGoBack,
        onGoHome,
        isRoot,
        onBack: handleBack,
    };
}

export function useModuleState() {
    const [isMinimized, setIsMinimized] = useState(true);

    const minimizeTraining = useCallback(() => {
        setIsMinimized(true);
    }, []);

    const showTraining = useCallback(() => {
        setIsMinimized(false);
    }, []);

    return { isMinimized, minimizeTraining, showTraining };
}

type UseTrainingContentProps = {
    pages: TrainingModulePage[];
    locale: string;
    d2Api: D2Api;
    trainingAppKey: string;
};

export function useTrainingContent(props: UseTrainingContentProps) {
    const { pages, locale, d2Api, trainingAppKey } = props;
    const [contents, setContents] = useState<TranslatableText[]>([]);
    const [targetIds, setTargetIds] = useState<string[]>([]);

    const pageMap = useMemo(() => _.keyBy(pages, p => p.id), [pages]);
    const translateMethod = useMemo(() => buildTranslate(locale), [locale]);

    const translate = useCallback(
        (text: TranslatableText) => {
            const translatedText = translateMethod(text);
            return transformD2Urls(translatedText, d2Api, trainingAppKey);
        },
        [translateMethod, trainingAppKey, d2Api]
    );

    const textContent = useMemo(() => {
        return contents.reduce((acc, content) => `${acc}\n\n${translate(content)}`, "");
    }, [contents, translate]);

    const setContentsImmediate = useCallback(
        (targetIds: string[]) => {
            const targetPages = _(targetIds)
                .map(targetId => pageMap[targetId])
                .compact()
                .value();
            setContents(targetPages);
            setTargetIds(targetIds);
        },
        [pageMap]
    );

    // debounce because click triggers both focus and then click
    // We want to avoid setting contents twice in quick succession
    const debouncedSetContents = useMemo(() => _.debounce(setContentsImmediate, 120), [setContentsImmediate]);

    useEffect(() => {
        return () => {
            debouncedSetContents.cancel();
        };
    }, [debouncedSetContents]);

    const trigger = useCallback(
        (props: { targetIds: string[] }) => {
            debouncedSetContents(props.targetIds);
        },
        [debouncedSetContents]
    );

    return { textContent, trigger, translate, targetIds };
}

export type SettingsAccess = {
    hasAccess: boolean;
    settingsUrl: string;
};

type UseTrainingDataProps = { baseUrl: string; trainingAppKey: string };

export function useTrainingResources(props: UseTrainingDataProps) {
    const { baseUrl, trainingAppKey } = props;
    const d2Api = useMemo(() => new D2Api({ baseUrl }), [baseUrl]);
    const compositionRoot = useMemo(() => getCompositionRoot(d2Api), [d2Api]);

    const [isLoading, setIsLoading] = useState(true);
    const [modules, setModules] = useState<TrainingModule[]>([]);
    const [landings, setLandings] = useState<LandingNode[]>([]);
    const [currentUser, setCurrentUser] = useState<User>({
        id: "",
        name: "",
        username: "",
        userGroups: [],
        userRoles: [],
    });

    const [containerConfig, setContainerConfig] = useState<ContainerConfig>(defaultContainerConfig);
    const [appConfig, setAppConfig] = useState<Config>();
    const [logoInfo, setLogoInfo] = useState<LogoInfo>();
    const [settingsAccess, setSettingsAccess] = useState<SettingsAccess>({
        hasAccess: false,
        settingsUrl: "",
    });

    const pages = useMemo(() => {
        if (modules.length === 0) return [];
        return _(modules)
            .flatMap(module => module.contents.steps)
            .flatMap(step => step.pages.filter(({ bindings }) => bindings.length > 0))
            .value();
    }, [modules]);

    useEffect(() => {
        setIsLoading(true);

        const modulesPromise = compositionRoot.usecases.modules
            .list()
            .then(modules => setModules(updateIconDocumentUrls(modules, d2Api, trainingAppKey)))
            .catch(error => {
                console.error(`Error fetching modules:`, error);
                setModules([]);
            });

        const landingsPromise = compositionRoot.usecases.landings
            .list()
            .then(landings => setLandings(updateIconDocumentUrls(landings, d2Api, trainingAppKey)))
            .catch(error => {
                console.error(`Error fetching landings:`, error);
                setLandings([]);
            });

        const configPromise = compositionRoot.usecases.config
            .get()
            .then(config => {
                setAppConfig(config);
                setContainerConfig(config.containerConfig);

                const logo = getLogoInfo(config.logo);
                setLogoInfo({
                    ...logo,
                    logoPath: transformD2Urls(logo.logoPath, d2Api, trainingAppKey),
                });

                return compositionRoot.usecases.user.checkSettingsPermissions(config);
            })
            .then(hasAccess => {
                if (hasAccess) {
                    setSettingsAccess({
                        hasAccess,
                        settingsUrl: generateSettingsUrl(baseUrl, trainingAppKey),
                    });
                }
            })
            .catch(error => {
                console.error(`Error fetching container config:`, error);
                setContainerConfig(defaultContainerConfig);
            });

        const currentUserPromise = compositionRoot.usecases.user
            .getCurrent()
            .then(setCurrentUser)
            .catch(error => {
                console.error(`Error fetching current user:`, error);
            });

        Promise.all([modulesPromise, landingsPromise, configPromise, currentUserPromise]).finally(() =>
            setIsLoading(false)
        );
    }, [compositionRoot, baseUrl, d2Api, trainingAppKey]);

    return {
        pages,
        containerConfig,
        d2Api,
        settingsAccess,
        modules,
        landings,
        appConfig,
        logoInfo,
        isLoading,
        currentUser,
    };
}
