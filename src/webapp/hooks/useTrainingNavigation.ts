import { getUserRootLandings, LandingNode } from "../../domain/entities/LandingPage";
import { useCallback, useMemo, useState } from "react";
import { Maybe } from "../../types/utils";
import { User } from "../../data/entities/User";

type UseTrainingNavigationProps = {
    landings: LandingNode[];
    currentUser: User;
};

export function useTrainingNavigation(props: UseTrainingNavigationProps) {
    const { landings, currentUser } = props;

    const [history, updateHistory] = useState<LandingNode[]>([]);
    const isRoot = history.length === 0;

    const userLandings = useMemo(() => {
        return getUserRootLandings(landings, currentUser);
    }, [currentUser, landings]);

    const currentPage = useMemo<Maybe<LandingNode>>(() => {
        if (history[0]) return history[0];
        return userLandings.length > 1 ? undefined : userLandings[0];
    }, [history, userLandings]);

    const openPage = useCallback((page: LandingNode) => {
        updateHistory(history => [page, ...history]);
    }, []);

    const goBack = useCallback(() => {
        updateHistory(history => history.slice(1));
    }, []);

    const goHome = useCallback(() => {
        updateHistory([]);
    }, []);

    // show empty main landing if no user landings
    // similar to how it looks like upon initial install
    const isMainLandingVisible = userLandings.length > 1 || userLandings.length === 0;

    return {
        isRoot,
        currentPage,
        userLandings,
        isMainLandingVisible,
        openPage,
        goBack,
        goHome,
    };
}
