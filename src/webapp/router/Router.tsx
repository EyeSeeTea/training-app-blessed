import { useConfig } from "@dhis2/app-runtime";
import React, { useEffect, useMemo, useState } from "react";
import { matchRoutes, useLocation, useNavigate, useRoutes } from "react-router-dom";
import styled from "styled-components";
import { buildPathFromState, buildStateFromPath } from "../../domain/entities/AppState";
import { IFrame } from "../components/iframe/IFrame";
import { useAppContext } from "../contexts/app-context";
import { buildRoutes } from "./AppRoute";

export const Router: React.FC = () => {
    const { appState, routes, setAppState } = useAppContext();
    const { baseUrl } = useConfig();
    const navigate = useNavigate();
    const location = useLocation();

    const routerRoutes = useMemo(() => buildRoutes(routes), [routes]);
    const element = useRoutes(routerRoutes);

    const [startPage] = useState(location.pathname);
    const defaultRoute = routes.find(({ defaultRoute }) => defaultRoute) ?? routes[0];

    const showBackdrop = useMemo(() => {
        const match = matchRoutes(routerRoutes, location.pathname);
        const path = match ? match[0].route.path : "";
        return routes.find(({ paths }) => paths.includes(path))?.backdrop;
    }, [routes, routerRoutes, location.pathname]);

    // Update path on state change
    useEffect(() => {
        if (appState.type === "UNKNOWN") {
            return;
        } else if (appState.type === "EXIT") {
            window.location.href = appState.url ?? baseUrl;
        } else {
            const path = buildPathFromState(appState);
            if (path !== location.pathname) navigate(path);
        }
    }, [appState, navigate, location, baseUrl]);

    // Load state with initial path
    useEffect(() => {
        const match = matchRoutes(routerRoutes, startPage);
        if (match) setAppState(buildStateFromPath(match));
    }, [routerRoutes, startPage, setAppState]);

    return (
        <React.Fragment>
            <IFrame src={`${baseUrl}/dhis-web-dataentry/index.action`} />
            {showBackdrop ? <Backdrop /> : null}
            {element ?? defaultRoute.element}
        </React.Fragment>
    );
};

const Backdrop = styled.div`
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    text-align: center;
    background-color: rgba(39, 102, 150, 0.3);
`;
